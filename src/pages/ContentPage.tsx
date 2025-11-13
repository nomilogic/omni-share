import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ContentInput } from "../components/ContentInput";
import { AIGenerator } from "../components/AIGenerator";
import { PostPreview } from "../components/PostPreview";
import { PublishPosts } from "../components/PublishPosts";
import { ProgressBar } from "../components/ProgressBar";
import { useAppContext } from "../context/AppContext";
import { savePost } from "../lib/database";
import { generateSinglePlatformPost } from "../lib/gemini";
import { Platform, GeneratedPost, CampaignInfo } from "../types";

export const ContentPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Cleanup background scrolling on component unmount
  useEffect(() => {
    return () => {
      // Restore background scrolling when component unmounts
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    };
  }, []);

  const handleContentNext = (contentData: any) => {
    dispatch({ type: "SET_CONTENT_DATA", payload: contentData });
    // Show generate modal instead of navigating
    setShowGenerateModal(true);
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
  };

  const handleGenerationComplete = async (posts: any[]) => {
    console.log(
      "Processing generated posts for publishing compatibility:",
      posts
    );

    // Ensure posts have proper URLs for publishing (no blob URLs)
    const processedPosts = posts.map((post) => {
      const processedPost = { ...post };

      // If we have content data with a server URL, use that instead of blob URLs
      if (
        state.contentData?.serverUrl &&
        (!processedPost.imageUrl || processedPost.imageUrl.startsWith("blob:"))
      ) {
        console.log("Replacing blob URL with server URL for publishing:", {
          original: processedPost.imageUrl,
          serverUrl: state.contentData.serverUrl,
        });
        processedPost.imageUrl = state.contentData.serverUrl;
        processedPost.mediaUrl = state.contentData.serverUrl;
      } else if (
        state.contentData?.mediaUrl &&
        !state.contentData?.mediaUrl.startsWith("blob:") &&
        (!processedPost.imageUrl || processedPost.imageUrl.startsWith("blob:"))
      ) {
        console.log(
          "Using media URL from content data:",
          state.contentData.mediaUrl
        );
        processedPost.imageUrl = state.contentData.mediaUrl;
        processedPost.mediaUrl = state.contentData.mediaUrl;
      }

      return processedPost;
    });

    console.log("Processed posts with proper URLs:", processedPosts);

    // Save posts to database if we have campaign and user data
    if (state.user && state.selectedProfile && state.contentData) {
      try {
        await savePost(
          state.selectedProfile.id,
          state.contentData,
          processedPosts,
          state.user.id
        );
      } catch (error) {
        console.error("Error saving post:", error);
        // Continue anyway - we can still preview the posts
      }
    }

    dispatch({ type: "SET_GENERATED_POSTS", payload: processedPosts });
    navigate("/content/preview");
  };

  const handleGoToPublish = () => {
    setShowPublishModal(true);
    // Prevent background scrolling when modal is open
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
    document.documentElement.scrollTop = 0; // Scroll to top when modal opens
    document.body.scrollTop = 0;
    document.body.scrollTop = 0;
    const elemnt: HTMLElement = document.querySelector(".preview");

    // Adjust timeout as needed
    if (elemnt) {
      // elemnt.scrollIntoView({ behavior: 'smooth', block: 'start' });

      elemnt.style.display = "none";
      setTimeout(() => {
        elemnt.style.display = "block";
      }, 100);
    }
  };

  // Handle individual platform regeneration
  const handleRegeneratePlatform = async (
    platform: Platform,
    customPrompt?: string
  ) => {
    console.log(
      `🔄 Regenerating content for ${platform} with ${
        customPrompt ? "custom prompt" : "original prompt"
      }...`
    );

    // if (!state.selectedProfile) {
    //   console.error('Missing profile for regeneration');
    //   return;
    // }

    // Create or modify contentData with custom prompt
    let contentDataForRegeneration;
    if (!state.contentData) {
      console.log(
        "⚠️ No contentData found, creating fallback with custom prompt"
      );

      // Get existing post data to preserve media and other info
      const existingPost = state.generatedPosts?.find(
        (p) => p.platform === platform
      );
      const promptToUse =
        customPrompt ||
        existingPost?.generationPrompt ||
        "Create engaging social media content";

      contentDataForRegeneration = {
        prompt: promptToUse,
        contentType: "general",
        tone:
          state.selectedProfile?.tone ||
          state.selectedProfile?.brandVoice ||
          "professional",
        targetAudience:
          state.selectedProfile?.target_audience || "General audience",
        tags: existingPost?.hashtags?.map((tag) => tag.replace("#", "")) || [
          "social",
          "content",
        ],
        mediaUrl: existingPost?.mediaUrl || existingPost?.imageUrl || null,
        serverUrl: existingPost?.mediaUrl || existingPost?.imageUrl || null,
      };
    } else {
      // Use existing contentData but update prompt if custom prompt provided
      contentDataForRegeneration = customPrompt
        ? {
            ...state.contentData,
            prompt: customPrompt,
          }
        : state.contentData;
    }

    try {
      // Create campaign info from the selected profile
      const campaignInfo = {
        name:
          state.selectedProfile?.campaignName ||
          state.selectedProfile?.name ||
          "",
        industry: state.selectedProfile?.industry || "",
        description: state.selectedProfile?.description || "",
        targetAudience:
          state.selectedProfile?.target_audience || "General audience",
        brandTone:
          state.selectedProfile?.tone ||
          state.selectedProfile?.brandVoice ||
          "professional",
        goals: state.selectedProfile?.socialGoals || ["engagement"],
        platforms: [platform], // Only regenerate for this platform
      };

      // Generate new post for the specific platform
      const regeneratedPost = await generateSinglePlatformPost(
        platform,
        campaignInfo as CampaignInfo,
        contentDataForRegeneration
      );

      console.log(
        `✅ Successfully regenerated ${platform} post:`,
        regeneratedPost
      );

      // Update only the specific platform's post in the context
      dispatch({
        type: "UPDATE_SINGLE_PLATFORM_POST",
        payload: { platform, post: regeneratedPost },
      });
    } catch (error) {
      console.error(`❌ Error regenerating ${platform} post:`, error);
      // You could show a toast notification here
    }
  };

  // Handle reset after successful publishing
  const handlePublishReset = () => {
    console.log(
      "🔄 Resetting application state after successful publishing..."
    );

    // Clear all generated posts and content data
    dispatch({ type: "SET_GENERATED_POSTS", payload: [] });
    dispatch({ type: "SET_CONTENT_DATA", payload: null });

    // Close the publish modal
    setShowPublishModal(false);

    // Restore background scrolling
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");

    // Navigate back to content creation
    navigate("/content");
  };

  const stepLabels = ["Content Input", "AI Generation", "Preview", "Publish"];
  const getCurrentStep = () => {
    const path = location.pathname;
    if (path.includes("/generate")) return 1;
    if (path.includes("/preview")) return 2;
    if (path.includes("/publish")) return 3;
    return 0;
  };

  return (
    <div className="  ">
      <div className="">
        <div className="w-full mx-auto">
          {/* <ProgressBar
            currentStep={getCurrentStep()}
            totalSteps={4}
            stepLabels={stepLabels}
          />
 */}
          <Routes>
            <Route
              index
              element={
                <ContentInput
                  onNext={handleContentNext}
                  onBack={() => navigate("/dashboard")}
                  initialData={state.contentData}
                  editMode={!!state.contentData}
                />
              }
            />
            {/* Generate route removed - now showing as modal overlay instead */}
            <Route
              path="preview"
              element={(() => {
                // Debug logging for preview route
                console.log("🔍 Preview route accessed:", {
                  hasGeneratedPosts: !!state.generatedPosts,
                  generatedPostsLength: state.generatedPosts?.length || 0,
                  generatedPosts: state.generatedPosts,
                  location: location.pathname,
                });

                return state.generatedPosts &&
                  state.generatedPosts.length > 0 ? (
                  <PostPreview
                    posts={state.generatedPosts}
                    onEdit={() => {
                      console.log(
                        "Edit Content clicked - navigating to /content"
                      );
                      navigate("/content");
                    }}
                    onBack={() => {
                      console.log(
                        "Regenerate clicked - clearing posts and navigating to generate"
                      );
                      // Clear the generated posts to trigger fresh generation
                      dispatch({ type: "SET_GENERATED_POSTS", payload: [] });
                      // Navigate to generate route which will start fresh AI generation
                      navigate("/content/generate");
                    }}
                    onPublish={handleGoToPublish}
                    onPostsUpdate={(updatedPosts) => {
                      dispatch({
                        type: "SET_GENERATED_POSTS",
                        payload: updatedPosts,
                      });
                    }}
                    onRegeneratePlatform={handleRegeneratePlatform}
                  />
                ) : (
                  <Navigate to="/content" replace />
                );
              })()}
            />
          </Routes>

          {/* Publish Modal */}
          {showPublishModal && state.generatedPosts && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50">
              <div className="bg-white w-full overflow-y-auto modal-content">
                <PublishPosts
                  posts={state.generatedPosts}
                  onBack={() => {
                    setShowPublishModal(false);
                    // Restore background scrolling when modal is closed
                    document.body.classList.remove("modal-open");
                    document.documentElement.classList.remove("modal-open");
                  }}
                  onReset={handlePublishReset}
                  userId={state.user?.id || ""}
                />
              </div>
            </div>
          )}

          {/* Generate Modal - Show AI Generator as modal instead of route */}
          {showGenerateModal && state.contentData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50">
              <div className="bg-white w-full overflow-y-auto modal-content">
                <AIGenerator
                  contentData={state.contentData}
                  onComplete={(posts) => {
                    handleGenerationComplete(posts);
                    setShowGenerateModal(false);
                    // Restore background scrolling when modal is closed
                    document.body.classList.remove("modal-open");
                    document.documentElement.classList.remove("modal-open");
                  }}
                  onBack={() => {
                    setShowGenerateModal(false);
                    // Restore background scrolling when modal is closed
                    document.body.classList.remove("modal-open");
                    document.documentElement.classList.remove("modal-open");
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

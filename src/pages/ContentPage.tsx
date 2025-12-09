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
import { useAppContext } from "../context/AppContext";
import { savePost } from "../lib/database";
import { generateSinglePlatformPost } from "../lib/gemini";
import { Platform, CampaignInfo } from "../types";

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
      // document.body.classList.remove("modal-open");
      // document.documentElement.classList.remove("modal-open");
    };
  }, []);

  const handleContentNext = (contentData: any) => {
    dispatch({ type: "SET_CONTENT_DATA", payload: contentData });
    // Show generate modal instead of navigating
    setShowGenerateModal(true);
    // document.body.classList.add("modal-open");
    // document.documentElement.classList.add("modal-open");
  };

  const handleGenerationComplete = async (posts: any[]) => {
    console.log(
      "Processing generated posts for publishing compatibility:",
      posts
    );

    const processedPosts = posts.map((post) => {
      const processedPost = { ...post };

      if (
        state.contentData?.serverUrl &&
        (!processedPost.imageUrl || processedPost.imageUrl.startsWith("blob:"))
      ) {
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
      }
    }

    dispatch({ type: "SET_GENERATED_POSTS", payload: processedPosts });
    navigate("/content/preview");
  };

  const handleGoToPublish = () => {
    setShowPublishModal(true);
  };

  const handleRegeneratePlatform = async (
    platform: Platform,
    customPrompt?: string
  ) => {
    let contentDataForRegeneration;
    if (!state.contentData) {
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
      contentDataForRegeneration = customPrompt
        ? {
            ...state.contentData,
            prompt: customPrompt,
          }
        : state.contentData;
    }

    try {
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
        platforms: [platform],
      };

      const regeneratedPost = await generateSinglePlatformPost(
        platform,
        campaignInfo as CampaignInfo,
        contentDataForRegeneration
      );

      dispatch({
        type: "UPDATE_SINGLE_PLATFORM_POST",
        payload: { platform, post: regeneratedPost },
      });
    } catch (error) {
      console.error(`❌ Error regenerating ${platform} post:`, error);
    }
  };

  const handlePublishReset = () => {
    dispatch({ type: "SET_GENERATED_POSTS", payload: [] });
    dispatch({ type: "SET_CONTENT_DATA", payload: null });

    setShowPublishModal(false);

    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");

    navigate("/content");
  };

  return (
    <div className="w-full mx-auto">
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

            return state.generatedPosts && state.generatedPosts.length > 0 ? (
              <>
                {!showPublishModal && (
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
                      dispatch({
                        type: "SET_GENERATED_POSTS",
                        payload: [],
                      });
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
                )}
                {/* Publish Modal */}
                {showPublishModal && state.generatedPosts && (
                  <div className=" inset-0  flex justify-center z-50 ` ">
                    <div className="bg-white w-full mt-6">
                      <PublishPosts
                        posts={state.generatedPosts}
                        onBack={() => {
                          setShowPublishModal(false);
                          document.body.classList.remove("modal-open");
                          document.documentElement.classList.remove(
                            "modal-open"
                          );
                        }}
                        onReset={handlePublishReset}
                        userId={state.user?.id || ""}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Navigate to="/content" replace />
            );
          })()}
        />
      </Routes>

      {/* Generate Modal - Show AI Generator as modal instead of route */}
      {showGenerateModal && state.contentData && (
        <div className="fixed inset-0 bg-[#fafafa] z-50 h-full">
          <div className="  w-full h-full overflow-y-auto modal-content">
            <div className="max-w-5xl m-auto  ">
              <AIGenerator
                contentData={state.contentData}
                onComplete={(posts) => {
                  handleGenerationComplete(posts);
                  setShowGenerateModal(false);
                  document.body.classList.remove("modal-open");
                  document.documentElement.classList.remove("modal-open");
                }}
                onBack={() => {
                  setShowGenerateModal(false);
                  document.body.classList.remove("modal-open");
                  document.documentElement.classList.remove("modal-open");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const handleContentNext = (contentData: any) => {
    dispatch({ type: "SET_CONTENT_DATA", payload: contentData });
    setShowGenerateModal(true);
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
          state.user?.id
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
          state.selectedProfile?.target_audience || t("general_audience"),
        tags: existingPost?.hashtags?.map((tag: any) =>
          tag.replace("#", "")
        ) || ["social", "content"],
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
          state.selectedProfile?.target_audience || t("general_audience"),
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
        <Route
          path="preview"
          element={(() => {
            return state.generatedPosts && state.generatedPosts.length > 0 ? (
              <>
                {!showPublishModal && (
                  <PostPreview
                    posts={state.generatedPosts}
                    onEdit={() => {
                      navigate("/content");
                    }}
                    onBack={() => {
                      dispatch({
                        type: "SET_GENERATED_POSTS",
                        payload: [],
                      });
                      navigate("/content/generate");
                    }}
                    onPublish={handleGoToPublish}
                    onPostsUpdate={(updatedPosts: any) => {
                      dispatch({
                        type: "SET_GENERATED_POSTS",
                        payload: updatedPosts,
                      });
                    }}
                    onRegeneratePlatform={handleRegeneratePlatform}
                  />
                )}
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

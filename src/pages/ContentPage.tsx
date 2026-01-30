import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ContentInput } from "../components/ContentInput";
import { AIGenerator } from "../components/AIGenerator";
import { PostPreview } from "../components/PostPreview";
import { PublishPosts } from "../components/PublishPosts";
import { useAppContext } from "../context/AppContext";
import { savePost } from "../lib/database";
import { generateSinglePlatformPost } from "../lib/gemini";
import { Platform, CampaignInfo } from "../types";
import { useUser } from "@/store/useUser";

export const ContentPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { user } = useUser();
const discardRef = useRef<null | (() => void)>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);


  const handleContentNext = (contentData: any) => {
    dispatch({ type: "SET_CONTENT_DATA", payload: contentData });
    setShowGenerateModal(true);
  };

  const handleGenerationComplete = async (posts: any[]) => {
  const processedPosts = posts?.map((post) => {
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
        processedPost.imageUrl = state.contentData.mediaUrl;
        processedPost.mediaUrl = state.contentData.mediaUrl;
      }

      if (
        state.contentData?.isVideoContent &&
        state.contentData?.thumbnailUrl
      ) {
        processedPost.thumbnailUrl = state.contentData.thumbnailUrl;
      }

      return processedPost;
    });

    dispatch({ type: "SET_GENERATED_POSTS", payload: processedPosts }); // ✅ first
  navigate("/content/preview");  
    setTimeout(() => {
    setShowGenerateModal(false);
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
  }, 500);
    // if (user?.id && state.selectedProfile && state.contentData) {
    //   try {
    //     await savePost(
    //       state.selectedProfile.id,
    //       state.contentData,
    //       processedPosts,
    //       user?.id
    //     );
    //   } catch (error) {
    //     console.error("Error saving post:", error);
    //   }
    // }
  };

  const handleGoToPublish = () => {
  setShowPublishModal(true);

  // ✅ ensures next browser-back triggers popstate while staying on same URL
  window.history.pushState({ __publish_modal__: true }, "", window.location.href);
};

  useEffect(() => {
  if (!showPublishModal) return;

  // push one history entry so browser back closes publish first
  window.history.pushState({ __publish_open__: true }, "", window.location.href);

  const onPop = (e: PopStateEvent) => {
    // close publish instead of leaving route
    setShowPublishModal(false);
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
  };

  window.addEventListener("popstate", onPop);
  return () => window.removeEventListener("popstate", onPop);
}, [showPublishModal]);


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
        user,
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
              setShowPublishModal={setShowPublishModal}
              setShowGenerateModal={setShowGenerateModal}
              onNext={handleContentNext}
              onBack={() => navigate("/dashboard")}
              initialData={state.contentData}
              editMode={!!state.contentData}
              setDiscardFn={(fn) => {
              discardRef.current = fn; // ✅ store reset
            }}
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
                        userId={user?.id || ""}
                        onDiscardAll={() => discardRef.current?.()}
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
          <div className="md:flex flex-col  w-full min-h-[75vh] overflow-y-auto  justify-center modal-content">
            <div className="max-w-5xl m-auto">
              <AIGenerator
                contentData={state.contentData}
                onComplete={(posts) => {
                  handleGenerationComplete(posts);
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

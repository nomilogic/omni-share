import React from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { ContentInput } from "../components/ContentInput";
import { AIGenerator } from "../components/AIGenerator";
import { PostPreview } from "../components/PostPreview";
import { PublishPosts } from "../components/PublishPosts";
import { useAppContext } from "../context/AppContext";
import { useUser } from "@/store/useUser";
import { generateSinglePlatformPost } from "../lib/gemini";
import { Platform, CampaignInfo } from "../types";

export const ContentPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { user } = useUser();
  const navigate = useNavigate();

  const handleContentNext = (contentData: any) => {
    dispatch({ type: "SET_CONTENT_DATA", payload: contentData });
    dispatch({ type: "SET_GENERATED_POSTS", payload: [] });
    navigate("/content/generate");
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

    dispatch({ type: "SET_GENERATED_POSTS", payload: processedPosts });
    navigate("/content/preview");
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
          state.selectedProfile?.target_audience || "general_audience",
        tags: existingPost?.hashtags?.map((tag: any) =>
          tag.replace("#", "")
        ) || ["social", "content"],
        mediaUrl: existingPost?.mediaUrl || existingPost?.imageUrl || null,
        serverUrl: existingPost?.mediaUrl || existingPost?.imageUrl || null,
      };
    } else {
      contentDataForRegeneration = customPrompt
        ? { ...state.contentData, prompt: customPrompt }
        : state.contentData;
    }

    try {
      const campaignInfo: CampaignInfo = {
        name:
          state.selectedProfile?.campaignName ||
          state.selectedProfile?.name ||
          "",
        industry: state.selectedProfile?.industry || "",
        description: state.selectedProfile?.description || "",
        targetAudience:
          state.selectedProfile?.target_audience || "general_audience",
        brandTone: "professional",
        goals: state.selectedProfile?.socialGoals || ["engagement"],
        platforms: [platform],
      };
      const regeneratedPost = await generateSinglePlatformPost(
        platform,
        user,
        campaignInfo,
        contentDataForRegeneration
      );
      dispatch({
        type: "UPDATE_SINGLE_PLATFORM_POST",
        payload: { platform, post: regeneratedPost },
      });
    } catch (error) {}
  };

  const handlePublishReset = () => {
    dispatch({ type: "SET_GENERATED_POSTS", payload: [] });
    dispatch({ type: "SET_CONTENT_DATA", payload: null });
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
          path="generate"
          element={
            state.contentData ? (
              <AIGenerator
                contentData={state.contentData}
                onComplete={handleGenerationComplete}
                onBack={() => {
                  dispatch({ type: "SET_GENERATED_POSTS", payload: [] });
                  dispatch({ type: "SET_CONTENT_DATA", payload: null });
                  navigate("/content");
                }}
                existingPosts={state.generatedPosts}
              />
            ) : (
              <Navigate to="/content" replace />
            )
          }
        />
        <Route
          path="preview"
          element={
            state.generatedPosts?.length > 0 ? (
              <PostPreview
                posts={state.generatedPosts}
                onEdit={() => navigate("/content")}
                onBack={() => navigate("/content/generate")}
                onPublish={() => navigate("/content/publish")}
                onPostsUpdate={(updatedPosts: any) => {
                  dispatch({
                    type: "SET_GENERATED_POSTS",
                    payload: updatedPosts,
                  });
                }}
                onRegeneratePlatform={handleRegeneratePlatform}
              />
            ) : (
              <Navigate to="/content" replace />
            )
          }
        />
        <Route
          path="publish"
          element={
            state.generatedPosts?.length > 0 ? (
              <PublishPosts
                posts={state.generatedPosts}
                onBack={() => navigate("/content/preview")}
                onReset={handlePublishReset}
                userId={user?.id || ""}
              />
            ) : (
              <Navigate to="/content" replace />
            )
          }
        />
      </Routes>
    </div>
  );
};

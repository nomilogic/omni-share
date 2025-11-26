import React, { useState, useEffect } from "react";
import { Sparkles, Brain, Zap } from "lucide-react";
import { CampaignInfo, PostContent, GeneratedPost, Platform } from "../types";
import { generateAllPosts } from "../lib/gemini";
import {
  getPlatformIcon,
  getPlatformDisplayName,
  getPlatformColors,
} from "../utils/platformIcons";
import { t } from "i18next";

interface AIGeneratorProps {
  contentData: any;
  onComplete: (posts: any[]) => void;
  onBack?: () => void;
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({
  contentData,
  onComplete,
  onBack,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<Platform | null>(null);
  const [progress, setProgress] = useState(0);

  const useRefFlag = React.useRef(false);
  useEffect(() => {
    if (useRefFlag.current) return;
    useRefFlag.current = true;
    if (contentData) {
      generatePosts();
    }
  }, [contentData]); // Restore original dependency

  const generatePosts = async () => {
    if (isGenerating) return; // Prevent duplicate calls

    setIsGenerating(true);
    setProgress(0);
    setCurrentPlatform(null);

    try {
      // Use selected platforms from content data or default to LinkedIn
      const targetPlatforms = contentData?.selectedPlatforms ||
        contentData?.platforms || ["linkedin"];

      // Create campaign info for generation - use real data when available
      console.log("Preparing campaign info for AI generation", contentData);
      const campaignInfo: CampaignInfo = {
        name:
          contentData?.campaignName ||
          contentData?.campaignInfo?.name ||
          "Default Campaign",
        website:
          contentData?.website ||
          contentData?.campaignInfo?.website ||
          "https://example.com",
        industry:
          contentData?.industry ||
          contentData?.campaignInfo?.industry ||
          "General",
        description:
          contentData?.description ||
          contentData?.campaignInfo?.description ||
          "General content generation",
        targetAudience:
          contentData?.targetAudience ||
          contentData?.campaignInfo?.target_audience ||
          contentData?.campaignInfo?.targetAudience ||
          "General Audience",
        brandTone:
          contentData?.tone ||
          contentData?.campaignInfo?.brand_tone ||
          (contentData?.campaignInfo?.brandTone as any) ||
          "professional",
        goals: contentData?.goals ||
          contentData?.campaignInfo?.goals || ["brand_building"],
        platforms: targetPlatforms,
        // Additional campaign fields if available
        objective:
          contentData?.objective || contentData?.campaignInfo?.objective,
        keywords:
          contentData?.keywords || contentData?.campaignInfo?.keywords || [],
        hashtags:
          contentData?.hashtags || contentData?.campaignInfo?.hashtags || [],
      };

      console.log("Starting AI generation with campaign info:", campaignInfo);
      console.log("Content data:", contentData);

      const posts = await generateAllPosts(
        campaignInfo,
        contentData,
        (platform, progress) => {
          console.log(`Progress: ${platform} - ${progress}%`);
          setCurrentPlatform(platform);
          setProgress(progress);
        }
      );

      // Set media URL for posts that need them
      // if (posts && posts.length > 0) {
      //   for (let i = 0; i < posts.length; i++) {
      //     const post = posts[i];
      //     // First priority: use existing media URL from content data
      //     if (contentData?.mediaUrl && !post.imageUrl) {
      //       posts[i].imageUrl = contentData.mediaUrl;
      //     }
      //     // Second priority: try to generate image if no media provided
      //     else if (post.caption && !post.imageUrl && !contentData?.mediaUrl) {
      //       try {
      //         // Generate an image based on the post content
      //         const imagePrompt = `Professional ${post.platform} image for: ${post.caption.substring(0, 100)}`;
      //         const imageResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/generate-image`, {
      //           method: 'POST',
      //           headers: { 'Content-Type': 'application/json' },
      //           body: JSON.stringify({
      //             prompt: imagePrompt,
      //             style: 'professional',
      //             size: post.platform === 'instagram' ? '1024x1024' : '1792x1024'
      //           })
      //         });

      //         if (imageResponse.ok) {
      //           const imageData = await imageResponse.json();
      //           posts[i].imageUrl = imageData.imageUrl;
      //         }
      //       } catch (imageError) {
      //         console.warn('Failed to generate image for post:', imageError);
      //       }
      //     }
      //   }
      // }

      setIsGenerating(false);
      setCurrentPlatform(null);

      if (posts && posts.length > 0) {
        onComplete(posts);
      } else {
        console.error("No posts generated");
        // Create fallback posts if generation fails
        const fallbackPosts = targetPlatforms.map((platform: Platform) => ({
          platform,
          caption: contentData?.prompt || "Check out our latest updates!",
          hashtags: ["#business", "#updates"],
          imageUrl: null,
        }));
        onComplete(fallbackPosts);
      }
    } catch (error: any) {
      console.error("Error generating posts:", error);
      setIsGenerating(false);
      setCurrentPlatform(null);

      // Check if it's a quota error
      if (error.message && error.message.includes("quota")) {
        console.warn("API quota exceeded, creating fallback posts");
        const targetPlatforms = contentData?.selectedPlatforms ||
          contentData?.platforms || ["linkedin"];
        const fallbackPosts = targetPlatforms.map((platform: Platform) => ({
          platform,
          caption: contentData?.prompt || "Check out our latest updates!",
          hashtags: ["#business", "#updates"],
          imageUrl: null,
        }));
        onComplete(fallbackPosts);
      } else {
        onComplete([]);
      }
    }
  };

  return (
    <div className="max-w-full mx-auto bg-white md:border md:border-gray-100  rounded-md shadow-md md:m-6 h-fit md:px-6 px-4 md:py-8 py-4">
      <div className="text-center mb-8">
        <div className="w-12 h-12 aspect-square bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Brain className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          {t("ai_crafting_posts")}
        </h2>
        <p className="text-gray-500 font-medium">
          {t("creating_optimized_content")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#1666fb] to-purple-500 h-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Current Platform */}
        {currentPlatform && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-md border border-blue-200">
            <div className="flex items-center justify-center space-x-4">
              <div
                className={`w-12 h-12 aspect-square rounded-full shadow-md flex items-center justify-center animate-bounce text-white ${getPlatformColors(
                  currentPlatform
                )}`}
              >
                {(() => {
                  const IconComponent = getPlatformIcon(currentPlatform);
                  return IconComponent ? (
                    <IconComponent className="w-8 h-8" />
                  ) : (
                    <Brain className="w-8 h-8" />
                  );
                })()}
              </div>
              <div>
                <p className="text-lg font-medium text-slate-800">
                  {t("optimizing_for")} {getPlatformDisplayName(currentPlatform)}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  {t("analyzing_audience")}
                </p>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#1666fb] rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-[#1666fb] rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-[#1666fb] rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* AI Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 p-4 rounded-md">
            <Sparkles className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-slate-900">{t("smart_optimization")}</h3>
            <p className="text-sm text-gray-500 font-medium">
              {t("tailoring_content")}
            </p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-md">
            <Zap className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-slate-900">{t("hashtag_research")}</h3>
            <p className="text-sm text-gray-500 font-medium">
              {t("finding_hashtags")}
            </p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-md">
            <Brain className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-slate-900">{t("tone_analysis")}</h3>
            <p className="text-sm text-gray-500 font-medium">
              {t("matching_brand_voice")}
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 font-medium">
          <p>
            {t("processing")}{" "}
            {contentData?.selectedPlatforms?.length ||
              contentData?.platforms?.length ||
              1}{" "}
            {t("platforms")}
            {(contentData?.selectedPlatforms?.length ||
              contentData?.platforms?.length ||
              1) > 1
              ? "s"
              : ""}
            ...
          </p>
        </div>
      </div>
    </div>
  );
};

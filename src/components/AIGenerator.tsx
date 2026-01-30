import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Brain, Zap, Loader2 } from "lucide-react";
import { CampaignInfo, Platform } from "../types";
import { generateAllPosts } from "../lib/gemini";
import {
  getPlatformIcon,
  getPlatformDisplayName,
  getPlatformColors,
} from "../utils/platformIcons";
import { useTranslation } from "react-i18next";
import { useNavigationGuard } from "../hooks/useNavigationGuard";
import { useUser } from "@/store/useUser";

interface AIGeneratorProps {
  contentData: any;
  onComplete: (posts: any[]) => void;
  existingPosts?: any[];
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({
  contentData,
  onComplete,
  existingPosts,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<Platform | null>(null);
  const [progress, setProgress] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  const { t } = useTranslation();
  const { user } = useUser();
  const hasGeneratedRef = useRef(false);

  const shouldGenerate = !existingPosts || existingPosts.length === 0;

  useNavigationGuard({
    isActive: isGenerating && shouldGenerate,
    title: t("confirm_navigation"),
    message: t("generation_in_progress_warning"),
  });

  useEffect(() => {
    if (hasGeneratedRef.current) return;

    if (existingPosts?.length! > 0) {
      setHasCompleted(true);
      setProgress(100);
      hasGeneratedRef.current = true;
      return;
    }

    if (contentData && shouldGenerate && !hasCompleted) {
      generatePosts();
      hasGeneratedRef.current = true;
    }
  }, [contentData, existingPosts, shouldGenerate, hasCompleted]);

  const generatePosts = async () => {
    if (isGenerating || hasCompleted) return;

    setIsGenerating(true);
    setProgress(0);
    setCurrentPlatform(null);

    try {
      const targetPlatforms: Platform[] = contentData?.selectedPlatforms ||
        contentData?.platforms || ["linkedin"];

      const campaignInfo: CampaignInfo = {
        name:
          contentData?.campaignName || contentData?.campaignInfo?.name || "",
        website:
          contentData?.website || contentData?.campaignInfo?.website || "",
        industry:
          contentData?.industry ||
          contentData?.campaignInfo?.industry ||
          "General",
        description:
          contentData?.description ||
          contentData?.campaignInfo?.description ||
          "",
        targetAudience:
          contentData?.targetAudience ||
          contentData?.campaignInfo?.targetAudience ||
          "",
        brandTone:
          contentData?.tone ||
          contentData?.campaignInfo?.brandTone ||
          "professional",
        goals: contentData?.goals || contentData?.campaignInfo?.goals || [],
        platforms: targetPlatforms,
        objective:
          contentData?.objective || contentData?.campaignInfo?.objective,
        keywords: contentData?.keywords || [],
        hashtags: contentData?.hashtags || [],
      };

      const posts = await generateAllPosts(
        user,
        campaignInfo,
        { ...contentData, prompt: contentData?.prompt || "" },
        (platform, progressValue) => {
          setCurrentPlatform(platform);
          setProgress(progressValue);
        }
      );

      setIsGenerating(false);
      setHasCompleted(true);
      setCurrentPlatform(null);
      onComplete(posts?.length ? posts : []);
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      setIsGenerating(false);
      setHasCompleted(true);
      setCurrentPlatform(null);

      // Fallback
      const targetPlatforms = contentData?.selectedPlatforms ||
        contentData?.platforms || ["linkedin"];

      const fallbackPosts = targetPlatforms.map((platform: Platform) => ({
        platform,
        caption: contentData?.prompt || "Excited to share our latest updates!",
        hashtags: ["#business", "#growth"],
        imageUrl: null,
      }));

      onComplete(fallbackPosts);
    }
  };

  // ====================== Already Generated Screen ======================
  if (existingPosts && existingPosts.length > 0 && !isGenerating) {
    return (
      <div className="max-w-3xl mx-auto bg-white md:border border-gray-100 md:rounded-3xl shadow-2xl md:m-10 overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-10 py-12 text-white text-center">
          <div className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-3xl rounded-3xl flex items-center justify-center mb-6">
            <Sparkles className="w-14 h-14" />
          </div>
          <h1 className="text-4xl font-bold mb-2">All Done!</h1>
          <p className="text-emerald-100 text-xl">
            Your AI-powered posts are ready
          </p>
        </div>

        <div className="p-10">
          <div className="flex items-center gap-5 bg-emerald-50 border border-emerald-100 rounded-2xl px-7 py-6 mb-9">
            <div className="w-16 h-16 bg-white rounded-2xl shadow flex items-center justify-center">
              <Sparkles className="w-9 h-9 text-emerald-600" />
            </div>
            <div>
              <p className="text-5xl font-bold text-emerald-700">
                {existingPosts.length}
              </p>
              <p className="text-emerald-700 font-semibold">Posts Generated</p>
            </div>
          </div>

          <p className="uppercase text-xs font-semibold tracking-wider text-gray-500 mb-4">
            Quick Preview
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {existingPosts.slice(0, 3).map((post, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${getPlatformColors(
                      post.platform
                    )}`}
                  >
                    {(() => {
                      const Icon = getPlatformIcon(post.platform);
                      return Icon ? (
                        <Icon className="w-6 h-6 text-white" />
                      ) : null;
                    })()}
                  </div>
                  <p className="font-semibold text-slate-800">
                    {getPlatformDisplayName(post.platform)}
                  </p>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {post.caption}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => onComplete(existingPosts)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-2xl text-lg transition-all shadow-lg shadow-blue-200"
          >
            Continue to Preview &amp; Customize
          </button>
        </div>
      </div>
    );
  }

  // ====================== Generating Screen ======================
  return (
    <div className="max-w-3xl mx-auto bg-white md:border border-gray-100 md:rounded-3xl shadow-2xl md:m-10 overflow-hidden">
      {/* Header */}
      <div className="px-10 pt-12 pb-8 text-center">
        <div className="relative inline-flex mx-auto mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center">
            <Brain className="w-14 h-14 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-9 h-9 bg-yellow-400 rounded-2xl flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-yellow-900" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          AI is Crafting Your Posts
        </h1>
        <p className="text-slate-600 text-lg max-w-md mx-auto">
          Creating high-quality, platform-optimized content
        </p>
      </div>

      {/* Progress */}
      <div className="px-10 mb-8">
        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2.5">
          <span className="text-sm font-medium text-slate-500">Progress</span>
          <span className="font-semibold text-slate-700">{progress}%</span>
        </div>
      </div>

      {/* Current Platform */}
      {currentPlatform && (
        <div className="mx-10 mb-9 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-8">
          <div className="flex items-start gap-6">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl flex-shrink-0 ${getPlatformColors(
                currentPlatform
              )}`}
            >
              {(() => {
                const Icon = getPlatformIcon(currentPlatform);
                return Icon ? <Icon className="w-11 h-11 text-white" /> : null;
              })()}
            </div>

            <div className="pt-1">
              <p className="uppercase text-blue-700 text-xs font-semibold tracking-widest">
                Currently Working On
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {getPlatformDisplayName(currentPlatform)}
              </p>
              <p className="text-slate-600 mt-1">
                Optimizing caption, tone &amp; hashtags...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-10 pb-12">
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-blue-600" />
          </div>
          <h4 className="font-semibold text-slate-900">Smart Optimization</h4>
          <p className="text-slate-500 text-sm mt-1">
            Tailored for each platform
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="w-7 h-7 text-amber-600" />
          </div>
          <h4 className="font-semibold text-slate-900">Hashtag Intelligence</h4>
          <p className="text-slate-500 text-sm mt-1">Trending &amp; relevant</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
            <Brain className="w-7 h-7 text-purple-600" />
          </div>
          <h4 className="font-semibold text-slate-900">Brand Voice Match</h4>
          <p className="text-slate-500 text-sm mt-1">Consistent tone</p>
        </div>
      </div>
    </div>
  );
};

"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
} from "../../utils/platformIcons";
import { Platform } from "../../types";
import { useAppContext } from "@/context/AppContext";
import ReferralSection from "./ReferralSection";
import Referal from "../../assets/referal.png";
import { Share2 } from "lucide-react";
import { useModal } from "../../context2/ModalContext";
import Icon from "../Icon";

// Types (adjusted to match your real data structure)
interface AnalyticsItem {
  platform: Platform;
  page: {
    id: string;
    name: string;
    username?: string;
    category?: string;
    followers?: number;
    subscribers?: number;
    totalViews?: number;
    videoCount?: number;
    following?: number;
    [key: string]: any;
  };
  summary: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    engagement?: number;
    [key: string]: any;
  };
  performance?: {
    engagementRate?: number;
    avgViewsPerVideo?: number;
    subscriberToViewRatio?: number;
    avgViewsPerPost?: number;
    [key: string]: any;
  };
  top_posts: {
    posts: Array<{
      id: string;
      title: string;
      likes?: number;
      comments?: number;
      shares?: number;
      views?: number;
      engagement?: number;
      created_time?: string;
      publishedAt?: string;
      [key: string]: any;
    }>;
  };
  insights?: any[];
}

type Props = {
  onHasAnalyticsChange?: (has: boolean) => void;
};

export default function Analytics({ onHasAnalyticsChange }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useAppContext();

  const analyticsList: AnalyticsItem[] = state.analyticsList || [];
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null
  );

  const platforms: Platform[] = [
    "facebook",
    "instagram",
    "linkedin",
    "tiktok",
    "youtube",
  ];

  // Platforms that actually have data
  const platformsWithData = useMemo(() => {
    const set = new Set<Platform>();
    for (const p of analyticsList) {
      if (p?.platform) set.add(p.platform);
    }
    return set;
  }, [analyticsList]);

  const platformsWithDataSet = useMemo(() => {
    return new Set<Platform>(platformsWithData);
  }, [platformsWithData]);

  // Selected analytics data
  const current = useMemo(
    () => analyticsList.find((a) => a.platform === selectedPlatform) ?? null,
    [analyticsList, selectedPlatform]
  );

  const topPosts = current?.top_posts?.posts || [];

  // Get correct audience count
  const getAudienceCount = () => {
    if (!current?.page) return 0;
    if (current.platform === "youtube") return current.page.subscribers ?? 0;
    if (current.platform === "tiktok") return current.page.followers ?? 0;
    return current.page.followers ?? 0;
  };

  const getAudienceLabel = () => {
    switch (selectedPlatform) {
      case "youtube":
        return "Subscribers";
      case "tiktok":
        return "Followers";
      default:
        return "Followers";
    }
  };

  const hasAnalytics = analyticsList.length > 0;

  // Auto select first available platform
  useEffect(() => {
    if (!analyticsList.length) return;

    setSelectedPlatform((prev) => {
      if (prev && platformsWithDataSet.has(prev)) return prev;
      if (platformsWithDataSet.has("facebook")) return "facebook";
      return analyticsList[0]?.platform ?? null;
    });
  }, [analyticsList, platformsWithData]);

  useEffect(() => {
    onHasAnalyticsChange?.(hasAnalytics);
  }, [hasAnalytics, onHasAnalyticsChange]);

  if (!hasAnalytics) {
    return <ReferralPromoCard />;
  }

  return (
    <div className="bg-gray-100 rounded-md p-5 h-[450px] flex flex-col">
      {/* Platform selector */}
      <div className="flex flex-wrap gap-3 mb-3">
        {platforms.map((p) => {
          const IconComponent = getPlatformIcon(p);
          const active = selectedPlatform === p;
          const hasData = platformsWithDataSet.has(p);
          return (
            <button
              key={p}
              disabled={!hasData}
              onClick={() => hasData && setSelectedPlatform(p)}
              className={`relative p-1 rounded-full transition-all duration-200 transform h-fit
                  ${hasData ? "hover:scale-105" : ""}
                  ${
                    active && hasData
                      ? "ring-4 ring-blue-200 shadow-md"
                      : hasData
                        ? "hover:shadow-md"
                        : ""
                  }
                  ${hasData ? "" : "opacity-30 cursor-not-allowed"}
                `}
              title={
                hasData
                  ? p.charAt(0).toUpperCase() + p.slice(1)
                  : `${p} (no data)`
              }
            >
              <div
                className={`w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center text-white shadow-md
                    ${getPlatformIconBackgroundColors(p)}
                    ${hasData ? "" : "grayscale"}
                  `}
              >
                {IconComponent ? (
                  <IconComponent className="w-4 md:w-5 h-4 md:h-5" />
                ) : (
                  p.slice(0, 2).toUpperCase()
                )}
              </div>
            </button>
          );
        })}
      </div>

      {current && (
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {current.page.name}
          </h3>
          <p className="text-sm text-gray-600">
            {getAudienceCount().toLocaleString()} {getAudienceLabel()}
          </p>
        </div>
      )}

      {/* Metrics + Posts */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <h3 className="text-lg font-semibold mb-3">
          {t("summary") || "Summary"}
        </h3>

        <div className="flex flex-col gap-2 mb-3 text-sm">
          {current?.platform === "youtube" && (
            <>
              <div className="flex justify-between">
                <span>Total Views</span>
                <span className="font-bold text-blue-700">
                  {current.page?.totalViews?.toLocaleString() ?? "0"}
                </span>
              </div>
              {current.performance?.avgViewsPerVideo && (
                <div className="flex justify-between">
                  <span>{t("average_views_per_video")}</span>
                  <span className="font-bold text-blue-700">
                    {current.performance.avgViewsPerVideo.toFixed(1)}
                  </span>
                </div>
              )}
            </>
          )}

          {current?.platform === "linkedin" &&
            current?.summary?.views !== undefined && (
              <div className="flex justify-between">
                <span>{t("impressions")}</span>
                <span className="font-bold text-blue-700">
                  {current.summary.views.toLocaleString()}
                </span>
              </div>
            )}

          {/* Common metrics - show only if they exist */}
          {current?.summary?.likes !== undefined && (
            <div className="flex justify-between">
              <span>{t("likes")}</span>
              <span className="font-bold text-rose-600">
                {current.summary.likes.toLocaleString()}
              </span>
            </div>
          )}

          {current?.summary?.comments !== undefined && (
            <div className="flex justify-between">
              <span>{t("comments")}</span>
              <span className="font-bold text-orange-600">
                {current.summary.comments.toLocaleString()}
              </span>
            </div>
          )}

          {current?.summary?.shares !== undefined && (
            <div className="flex justify-between">
              <span>{t("shares")}</span>
              <span className="font-bold text-purple-600">
                {current.summary.shares.toLocaleString()}
              </span>
            </div>
          )}

          {current?.summary?.views !== undefined &&
            current.platform !== "youtube" &&
            current.platform !== "linkedin" && (
              <div className="flex justify-between">
                <span>{t("views")}</span>
                <span className="font-bold text-blue-600">
                  {current.summary.views.toLocaleString()}
                </span>
              </div>
            )}

          {current?.performance?.engagementRate !== undefined && (
            <div className="flex justify-between">
              <span>{t("engagement_rate")}</span>
              <span className="font-bold text-emerald-600">
                {(current.performance.engagementRate * 100).toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <hr className="my-2 border-gray-300" />

        <h3 className="font-semibold text-lg mb-2">{t("recent_posts")}</h3>

        {topPosts.length > 0 ? (
          <div className="space-y-2">
            {topPosts.slice(0, 3).map((post) => (
              <div key={post.id} className=" text-sm">
                <p className="text-purple-600">
                  {post.title
                    ? post.title.length > 40
                      ? post.title.slice(0, 40) + "..."
                      : post.title
                    : "(no caption)"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            No recent posts available
          </p>
        )}
      </div>

      <button
        onClick={() => navigate(`/analytics?platform=${selectedPlatform}`)}
        className="mt-4 w-full py-2 px-4 border border-purple-600 hover:text-purple-600 bg-purple-600 hover:bg-[#d7d7fc] text-white font-medium rounded-md transition-colors"
        disabled={!selectedPlatform}
      >
        {t("view_details") || "View Full Analytics"}
      </button>
    </div>
  );
}

function ReferralPromoCard() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [copied, setCopied] = useState(false);
  const { openModal } = useModal();

  const referralLink = `http://omnishare.ai/auth?referralId=${user?.id}`;
  const shareText = `Join me on OmniShare! Use my referral link:`;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "OmniShare",
          text: shareText,
          url: referralLink,
        });
        return;
      }
      await copyToClipboard(referralLink);
    } catch {
      await copyToClipboard(referralLink);
    }
  };

  const handleShareClick = () => openModal(ReferralSection as any, {});

  return (
    <div className="hidden md:flex bg-gray-100 rounded-md p-5 h-[450px] w-full flex-col">
      <div className="p-2 flex-1 flex flex-col">
        <div className="flex justify-center items-center h-[220px]">
          <img
            src={Referal}
            alt="Referral"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="mt-2 text-left">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("refer_earn") || "Refer & Earn!"}
          </h3>
          <p className="text-black text-xs font-medium leading-relaxed flex gap-2 items-start">
            <Share2 className="w-[18px] h-[18px] text-[#7650e3]" />
            Share your invite link with friends.
          </p>
          <p className="text-black text-xs font-medium leading-relaxed flex gap-2 items-start">
            <Icon name="manage-subs" size={18} /> They sign up and receive 10
            Omni Coins.
          </p>
          <p className="text-black text-xs font-medium leading-relaxed flex gap-2 items-start">
            <Icon name="crown" size={18} /> When they purchase a package using
            your referral link, you both earn 100 Omni Coins.
          </p>
        </div>
      </div>
      <button
        onClick={handleShareClick}
        className=" w-full rounded-md hover:opacity-95 text-white font-semibold py-2 flex items-center justify-center gap-2 text-md transition-all border border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3]"
      >
        <Share2 className="w-4 h-4" /> {t("share") || "Share"}
      </button>
      {copied && (
        <p className="text-xs text-green-600 mt-2 text-center">
          {t("copied_to_clipboard") || "Copied!"}
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
} from "../../utils/platformIcons";
import { Platform } from "../../types";
import API from "../../services/api";
import { useModal } from "../../context2/ModalContext";


// ✅ import referral modal + image + icon
import ReferralSection from "./ReferralSection";
import Referal from "../../assets/referal.png";
import { Share2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import Icon from "../Icon";

interface TopPost {
  id: string;
  title: string;
  fullMessage?: string;
  permalink?: string;
  engagement: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  created_time: string;
}

interface AnalyticsData {
  platform: Platform;
  page: {
    id: string;
    name: string;
    category: string;
    followers: number;
  };
  summary: {
    likes: number;
    comments: number;
    shares: number;
  };
  insights: Array<{
    period: "day" | "week" | "days_28";
    values: Array<{ value: number }>;
  }>;
  top_posts: {
    posts: TopPost[];
  };
}

type Props = {
  onHasAnalyticsChange?: (has: boolean) => void;
};

function Analytics({ onHasAnalyticsChange }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [analyticsList, setAnalyticsList] = useState<AnalyticsData[]>([]);
  const [selectedPlatform, setSelectedPlatform] =
  useState<Platform>("facebook");
  
  const platforms: Platform[] = [
    "facebook",
    "linkedin",
    "instagram",
    "youtube",
    "tiktok",
  ];
  
  
  const hasPlatformData = (a?: AnalyticsData) => {
    const followers = a?.page?.followers ?? 0;
    const likes = a?.summary?.likes ?? 0;
    const comments = a?.summary?.comments ?? 0;
    const shares = a?.summary?.shares ?? 0;
    const postsLen = a?.top_posts?.posts?.length ?? 0;
    return followers > 0 || likes > 0 || comments > 0 || shares > 0 || postsLen > 0;
  };

  const computeHasAnalytics = (list: AnalyticsData[]) => {
    return list.some((a) => hasPlatformData(a));
  };

  const hasAnalytics = useMemo(
    () => computeHasAnalytics(analyticsList),
    [analyticsList]
  );

  useEffect(() => {
    onHasAnalyticsChange?.(computeHasAnalytics(analyticsList));
  }, [analyticsList, onHasAnalyticsChange]);

  // ✅ platforms which have usable data
  const platformsWithData = useMemo(() => {
    const set = new Set<Platform>();
    for (const a of analyticsList) {
      if (a?.platform && hasPlatformData(a)) set.add(a.platform);
    }
    return platforms.filter((p) => set.has(p));
  }, [analyticsList]);

  const platformsWithDataSet = useMemo(() => {
    return new Set<Platform>(platformsWithData);
  }, [platformsWithData]);

  // ✅ keep selected platform valid (prefer facebook)
  useEffect(() => {
    if (!platformsWithData.length) return;

    setSelectedPlatform((prev) => {
      if (platformsWithDataSet.has(prev)) return prev;
      if (platformsWithDataSet.has("facebook")) return "facebook";
      return platformsWithData[0];
    });
  }, [platformsWithData, platformsWithDataSet]);

  // Fetch analytics for all platforms
  const fetchAnalytics = async () => {
    try {
      const res = await API.facebookAnalytics();
      const list = res?.data?.data || [];
      setAnalyticsList(list);

      onHasAnalyticsChange?.(computeHasAnalytics(list));
    } catch (err) {
      console.error("Analytics Error:", err);
      setAnalyticsList([]);
      onHasAnalyticsChange?.(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // ✅ If analytics is NOT available -> show referral promo card in analytics place
  if (!hasAnalytics) {
    return <ReferralPromoCard />;
  }

  // Get analytics for selected platform
  const analytics = analyticsList.find((a) => a.platform === selectedPlatform);
  const topPosts = analytics?.top_posts?.posts || [];

  const getReachByPeriod = (period: "day" | "week" | "days_28") => {
    const insight = analytics?.insights?.find((i) => i.period === period);
    return insight?.values?.[0]?.value ?? 0;
  };

  const dailyReach = getReachByPeriod("day");
  const weeklyReach = getReachByPeriod("week");
  const monthlyReach = getReachByPeriod("days_28");

  return (
    <div className="bg-gray-100 rounded-md p-5 h-[450px] flex flex-col">
      {/* ✅ Show ALL icons, disable those without data */}
      <div className="flex flex-wrap gap-3 mb-3">
        {platforms.map((p) => {
          const IconComponent = getPlatformIcon(p);
          const isActive = selectedPlatform === p;
          const hasData = platformsWithDataSet.has(p);

          return (
            <button
              key={p}
              type="button"
              disabled={!hasData}
              onClick={() => {
                if (!hasData) return;
                setSelectedPlatform(p);
              }}
              className={`relative p-1 rounded-full transition-all duration-200 transform h-fit
                ${hasData ? "hover:scale-105" : ""}
                ${isActive && hasData ? "ring-4 ring-blue-200 shadow-md" : hasData ? "hover:shadow-md" : ""}
                ${hasData ? "" : "opacity-30 cursor-not-allowed"}
              `}
              title={hasData ? p : `${p} (no data)`}
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
                  <span className="text-white font-bold text-sm">
                    {p === "facebook"
                      ? "FB"
                      : p === "instagram"
                      ? "IG"
                      : p === "linkedin"
                      ? "IN"
                      : p === "youtube"
                      ? "YT"
                      : p === "tiktok"
                      ? "TT"
                      : "P"}
                  </span>
                )}
              </div>

              {isActive && hasData && (
                <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {analytics && (
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {analytics.page.name}
          </h3>
          {analytics.page.followers !== 0 && (
            <p className="text-sm text-gray-600">
              {analytics.page.followers.toLocaleString()} {t("followers")}
            </p>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <div className="mb-2">
          <div className="flex justify-between mb-2">
            <h3 className=" text-lg font-semibold">{t("summary")}</h3>
          </div>

          <div className="space-y-1">
            <Metric label={t("reach")} value={monthlyReach} />
            <Metric label={t("likes")} value={analytics?.summary.likes} />
            <Metric label={t("comments")} value={analytics?.summary.comments} />
          </div>
        </div>

        <hr className="my-2" />

        <div>
          <h3 className="font-semibold  mb-2 text-lg">Recent Posts</h3>
          {topPosts.length ? (
            <div className="space-y-2">
              {topPosts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className="w-full text-left text-sm text-blue-600 rounded truncate"
                >
                  {post.title}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">
              {t("no_posts_available")}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate(`/analytics?platform=${selectedPlatform}`)}
        className="w-full text-white py-2 px-4 rounded-md font-semibold text-md transition-all border-2 border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] mt-4"
      >
        {t("view_details")}
      </button>
    </div>
  );
}

export default Analytics;

// Metric Component
const Metric = ({ label, value }: any) => (
  <div className="flex justify-between text-sm">
    <span>{label}</span>
    <span className="font-bold text-blue-600">
      {value?.toLocaleString?.() ?? 0}
    </span>
  </div>
);

// ✅ Referral promo card (Analytics replacement)
function ReferralPromoCard() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [copied, setCopied] = useState(false);

  const referralLink = `http://omnishare.ai/auth?referralId=${user.id}`;
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
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      await copyToClipboard(referralLink);
    }
  };
const { openModal } = useModal();
  const handleShareClick = () => {
  openModal(ReferralSection as any, {});
};
  return (
    <div className="hidden md:flex bg-gray-100 rounded-md p-5 h-[450px] w-full flex-col">
      <div className="p-2 flex-1 flex flex-col ">
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

          <p className="text-black text-xs font-medium leading-relaxed flex gap-2 items-start ">
              <Share2 className="w-[18px] h-[18px] text-[#7650e3]" />
              Share your invite link with friends.
            </p>
            <p className="text-black text-xs font-medium leading-relaxed flex gap-2 items-start ">
              <Icon name="manage-subs" size={18}  />
              They sign up and receive 10 Omni Coins.
            </p>
            <p className="text-black text-xs font-medium leading-relaxed flex gap-2 items-start ">
              <Icon
                name="crown" size={18}
              />
              When they purchase a package using your referral link, you both
              earn 100 Omni Coins.
            </p>
        </div>
      </div>

      <button
  onClick={handleShareClick}
  className=" w-full rounded-md hover:opacity-95 text-white font-semibold py-2 flex items-center justify-center gap-2 text-md transition-all border-2 border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3]"
>
  <Share2 className="w-4 h-4" />
  {t("share") || "Share"}
</button>

      {copied && (
        <p className="text-xs text-green-600 mt-2 text-center">
          {t("copied_to_clipboard") || "Copied!"}
        </p>
      )}
    </div>
  );
}

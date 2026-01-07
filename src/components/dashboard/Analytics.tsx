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
import AnalyticsModal from "./AnalyticsModal";

// ✅ import referral modal + image + icon
import ReferralSection from "./ReferralSection";
import Referal from "../../assets/referal.png";
import { Share2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";

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
  const { openModal } = useModal();

  const [analyticsList, setAnalyticsList] = useState<AnalyticsData[]>([]);
  const [selectedPlatform, setSelectedPlatform] =
    useState<Platform>("facebook");
  

  const computeHasAnalytics = (list: AnalyticsData[]) => {
    return list.some((a) => {
      const followers = a?.page?.followers ?? 0;
      const likes = a?.summary?.likes ?? 0;
      const comments = a?.summary?.comments ?? 0;
      const shares = a?.summary?.shares ?? 0;
      const postsLen = a?.top_posts?.posts?.length ?? 0;
      return followers > 0 || likes > 0 || comments > 0 || shares > 0 || postsLen > 0;
    });
  };

  const hasAnalytics = useMemo(
    () => computeHasAnalytics(analyticsList),
    [analyticsList]
  );

  useEffect(() => {
  const ok = computeHasAnalytics(analyticsList);
  onHasAnalyticsChange?.(ok);
}, [analyticsList, onHasAnalyticsChange]);

const navigate = useNavigate();
const platformsWithData = useMemo(() => {
  const hasPlatformData = (a: AnalyticsData) => {
    const followers = a?.page?.followers ?? 0;
    const likes = a?.summary?.likes ?? 0;
    const comments = a?.summary?.comments ?? 0;
    const shares = a?.summary?.shares ?? 0;
    const postsLen = a?.top_posts?.posts?.length ?? 0;

    return followers > 0 || likes > 0 || comments > 0 || shares > 0 || postsLen > 0;
  };

  const order: Platform[] = ["facebook", "linkedin", "instagram", "youtube", "tiktok"];

  const available = analyticsList
    .filter(hasPlatformData)
    .map((a) => a.platform);

    const set = new Set<Platform>(available as Platform[]);
  return order.filter((p) => set.has(p));
}, [analyticsList]);

useEffect(() => {
  if (!platformsWithData.length) return;

  setSelectedPlatform((prev) => {
    // prev platform data available hai -> keep it
    if (platformsWithData.includes(prev)) return prev;
    // else -> first available
    return platformsWithData[0];
  });
}, [platformsWithData]);

  // Fetch analytics for all platforms
  const fetchAnalytics = async () => {
    try {
      
      const res = await API.facebookAnalytics();
      const list = res?.data?.data || [];
      setAnalyticsList(list);

      const ok = computeHasAnalytics(list);
      onHasAnalyticsChange?.(ok);
    } catch (err) {
      console.error("Analytics Error:", err);
      setAnalyticsList([]);
      onHasAnalyticsChange?.(false);
    } finally {
    
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // ✅ If analytics is NOT available -> show referral promo card in analytics place
  if (  !hasAnalytics) {
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

 const handleViewDetails = () => {
  navigate("/analytics/details", {
    state: {
      analytics,
      topPosts,
      dailyReach,
      weeklyReach,
      monthlyReach,
    },
  });
};
  const platforms: Platform[] = [
    "facebook",
    "linkedin",
    "instagram",
    "youtube",
    "tiktok",
  ];

  return (
    <div className="bg-gray-100 rounded-md p-5 h-[450px] flex flex-col">
      <div className="flex gap-3 mb-2">
        {platformsWithData.map((p) => {
          const isActive = selectedPlatform === p;
          return (
            <div
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-white
                ${getPlatformIconBackgroundColors(p)}
                ${isActive ? "opacity-100 ring-4 ring-blue-100" : "opacity-30"}
                cursor-pointer
              `}
            >
              {getPlatformIcon(p)({
                className: isActive ? "w-5 h-5" : "w-4 h-4",
              })}
            </div>
          );
        })}
      </div>

      {analytics && (
        <div className="mb-2">
          <h3 className="text-lg font-bold text-gray-900 truncate">
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
            <h4 className="font-semibold">{t("summary")}</h4>
          </div>

          <div className="space-y-1">
            <Metric label={t("reach")} value={monthlyReach}  />
            <Metric
              label={t("likes")}
              value={analytics?.summary.likes}
              
            />
            <Metric
              label={t("comments")}
              value={analytics?.summary.comments}
           
            />
          </div>
        </div>

        <hr className="my-2" />

        <div>
          <h4 className="font-semibold text-sm mb-2">{t("top_posts")}</h4>
          { topPosts.length ? (
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
        onClick={handleViewDetails}
        className="w-full text-white py-2 px-4 rounded-md font-semibold text-md transition-all border-2 border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] mt-4"
      >
        {t("view_details")}
      </button>
    </div>
  );
}

export default Analytics;

// Metric Component
const Metric = ({ label, value,  }: any) => (
  <div className="flex justify-between text-sm">
    <span>{label}</span>
    <span className="font-bold text-blue-600">
      { value?.toLocaleString?.() ?? 0}
    </span>
  </div>
);

// ✅ Referral promo card (Analytics replacement) - like your screenshot
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

  return (
    <div className="bg-gray-100 rounded-md p-5 h-[450px] w-full flex flex-col">
  <div className="p-2 flex-1 flex flex-col justify-between">
    <div className="flex justify-center items-center h-[240px]">
      <img
        src={Referal}
        alt="Referral"
        className="h-full w-full object-contain "
      />
    </div>

    <div className="mt-2 text-left">
      <h3 className="text-lg font-semibold text-gray-900">
        {t("refer_earn") || "Refer & Earn!"}
      </h3>

      <p className="text-sm text-black mt-2 leading-relaxed">
        {t("referral_bonus_message") ||
          "When someone buys a package using your referral link, you both earn coins!"}
      </p>
    </div>
  </div>

  <button
    onClick={handleNativeShare}
    className="mt-5 w-full rounded-md hover:opacity-95 text-white font-semibold py-2 flex items-center justify-center gap-2 text-md transition-all border-2 border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3]"
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

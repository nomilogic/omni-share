"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
} from "../../utils/platformIcons";
import { Platform } from "../../types";
import API from "../../services/api";
import { useModal } from "../../context2/ModalContext";
import AnalyticsModal from "./AnalyticsModal";

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

function Analytics() {
  const { t } = useTranslation();
  const { openModal } = useModal();

  const [analyticsList, setAnalyticsList] = useState<AnalyticsData[]>([]);
  const [selectedPlatform, setSelectedPlatform] =
    useState<Platform>("facebook");
  const [loading, setLoading] = useState(false);

  // Fetch analytics for all platforms
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.facebookAnalytics(); // API should return array of analytics per platform
      setAnalyticsList(res?.data?.data || []);
    } catch (err) {
      console.error("Analytics Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

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
    openModal(AnalyticsModal, {
      analytics,
      topPosts,
      dailyReach,
      weeklyReach,
      monthlyReach,
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
        {platforms.map((p) => {
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

      {analytics ? (
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
      ) : (
        <p className="text-sm text-gray-500 mb-3"></p>
      )}

      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <div className="mb-2">
          <div className="flex justify-between mb-2">
            <h4 className="font-semibold">{t("summary")}</h4>
          </div>

          <div className="space-y-1">
            <Metric label={t("reach")} value={monthlyReach} loading={loading} />
            <Metric
              label={t("likes")}
              value={analytics?.summary.likes}
              loading={loading}
            />
            <Metric
              label={t("comments")}
              value={analytics?.summary.comments}
              loading={loading}
            />
          </div>
        </div>

        <hr className="my-2" />

        <div>
          <h4 className="font-semibold text-sm mb-2">{t("top_posts")}</h4>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-200 animate-pulse rounded"
                />
              ))}
            </div>
          ) : topPosts.length ? (
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
const Metric = ({ label, value, loading }: any) => (
  <div className="flex justify-between text-sm">
    <span>{label}</span>
    <span className="font-bold text-blue-600">
      {loading ? "—" : value?.toLocaleString?.() ?? 0}
    </span>
  </div>
);

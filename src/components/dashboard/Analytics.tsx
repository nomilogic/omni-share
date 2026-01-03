// Analytics.tsx

"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
} from "../../utils/platformIcons";
import { Platform } from "../../types";
import API from "../../services/api";
import { useModal } from "../../context2/ModalContext"; // 👈 ADD THIS
import AnalyticsModal from "./AnalyticsModal"; // 👈 ADD THIS

interface TopPost {
  id: string;
  title: string;
  fullMessage?: string;
  permalink?: string;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
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
    name: string;
    period: "day" | "week" | "days_28";
    values: Array<{ value: number; end_time: string }>;
    title: string;
  }>;
  top_posts: {
    posts: TopPost[];
  };
}

function Analytics() {
  const { t } = useTranslation();
  const { openModal } = useModal(); // 👈 ADD THIS

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  // ❌ REMOVE THESE - no longer needed
  // const [selectedPost, setSelectedPost] = useState<TopPost | null>(null);
  // const [showAnalytics, setShowAnalytics] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.facebookAnalytics();
      setAnalytics(res?.data || null);
    } catch (err) {
      console.error("Analytics Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const topPosts = analytics?.top_posts.posts || [];

  const getReachByPeriod = (period: "day" | "week" | "days_28") => {
    const insight = analytics?.insights?.find((i) => i?.period === period);
    return insight?.values?.[0]?.value || 0;
  };

  const dailyReach = getReachByPeriod("day");
  const weeklyReach = getReachByPeriod("week");
  const monthlyReach = getReachByPeriod("days_28");

  // ❌ REMOVE THIS - no longer needed
  // const closeModal = () => {
  //   setSelectedPost(null);
  //   setShowAnalytics(false);
  // };

  // 👈 ADD THIS - new handler using ModalContext
  const handleViewDetails = () => {
    openModal(AnalyticsModal, {
      analytics,
      topPosts,
      dailyReach,
      weeklyReach,
      monthlyReach,
    });
  };

  return (
    // ❌ REMOVE the fragment <> </> wrapper - no longer needed
    <div className="bg-gray-100 rounded-md p-5 h-[450px] flex flex-col overflow-hidden">
      <div className="flex gap-3 mb-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-blue-600 ring-4 ring-blue-100">
          {getPlatformIcon("facebook")({ className: "w-5 h-5" })}
        </div>
        {["linkedin", "instagram", "youtube", "tiktok"].map((p: any) => (
          <div
            key={p}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getPlatformIconBackgroundColors(
              p
            )} opacity-30`}
          >
            {getPlatformIcon(p)({ className: "w-4 h-4" })}
          </div>
        ))}
      </div>

      {analytics && (
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {analytics?.page?.name}
          </h3>
          <p className="text-sm text-gray-600">
            {analytics?.page?.followers.toLocaleString()} {t("followers")}
          </p>
        </div>
      )}

      <div className="flex-1">
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <h4 className="font-semibold">{t("summary")}</h4>
          </div>

          <div className="space-y-2">
            <Metric label={t("reach")} value={monthlyReach} loading={loading} />
            <Metric label={t("likes")} value={analytics?.summary.likes} loading={loading} />
            <Metric label={t("comments")} value={analytics?.summary.comments} loading={loading} />
          </div>
        </div>

        <hr className="my-2" />

        <div>
          <h4 className="font-semibold text-sm mb-3">{t("top_posts")}</h4>

          {loading ? (
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-200 animate-pulse rounded" />
              ))}
            </div>
          ) : topPosts.length ? (
            <div className="space-y-1">
              {topPosts.slice(0, 2).map((post) => (
                <div
                  key={post?.id}
                  className="w-full text-left text-sm text-blue-600 rounded truncate"
                >
                  {post?.title}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">{t("no_posts_available")}</p>
          )}
        </div>
      </div>

      {/* View Details Button - 👈 CHANGED onClick */}
      <button
        onClick={handleViewDetails}
        className="w-full text-white py-2.5 px-4 rounded-md font-semibold text-md transition-all border-2 border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3]"
      >
        {t("view_details")}
      </button>
    </div>
    // ❌ REMOVE the entire modal JSX that was here
  );
}

export default Analytics;

const Metric = ({ label, value, loading }: any) => (
  <div className="flex justify-between text-sm">
    <span>{label}</span>
    <span className="font-bold text-blue-600">
      {loading ? "—" : value?.toLocaleString?.() ?? 0}
    </span>
  </div>
);

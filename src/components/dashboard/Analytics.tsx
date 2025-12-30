"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
} from "../../utils/platformIcons";
import { Platform } from "../../types";
import API from "../../services/api";

interface AnalyticsData {
  platform: Platform;
  page: {
    id: string;
    name: string;
    category: string;
    followers: number;
  };
  summary: {
    period: string;
    views: number;
    impressions_ctr: string;
    average_view_duration: number;
  };
  top_posts: {
    period: string;
    posts: string[];
  };
}

function Analytics() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [activePlatform, setActivePlatform] = useState<Platform>("facebook");
  const [analyticsMap, setAnalyticsMap] = useState<
    Record<Platform, AnalyticsData | null>
  >({} as any);
  const [loading, setLoading] = useState(false);

  const socialPlatforms: Platform[] = [
    "facebook",
    "linkedin",
    "instagram",
    "youtube",
    "tiktok",
  ];

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const res = await API.facebookAnalytics();
      // assuming API returns single platform
      setAnalyticsMap((prev) => ({
        ...prev,
        facebook: res.data || res,
      }));
    } catch (err) {
      console.error("Analytics Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const analytics = analyticsMap[activePlatform];
  const summary = analytics?.summary;
  const topPosts = analytics?.top_posts?.posts?.slice(0, 3) || [];

  return (
    <div className="bg-gray-100 rounded-md h-[450px] p-5 flex flex-col justify-between w-full">
      <div>
        {/* Platform Selector */}
        <div className="flex gap-3 mb-4">
          {socialPlatforms.map((platform) => {
            const Icon = getPlatformIcon(platform);
            const bg = getPlatformIconBackgroundColors(platform);

            const isActive = platform === activePlatform;

            return (
              <button
                key={platform}
                onClick={() => setActivePlatform(platform)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition
                  ${bg}
                  ${
                    isActive ? "ring-2 ring-purple-600 scale-105" : "opacity-60"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <h4 className="font-medium text-black">{t("summary")}</h4>
        <p className="text-xs mb-3">{summary?.period || t("last_28_days")}</p>

        <div className="space-y-1">
          <Metric label={t("views")} value={summary?.views} loading={loading} />
          <Metric
            label={t("impressions_ctr")}
            value={summary?.impressions_ctr}
            loading={loading}
          />
          <Metric
            label={t("avg_view_duration")}
            value={summary?.average_view_duration}
            loading={loading}
          />
        </div>

        <hr className="h-[2px] bg-purple-600 my-3" />

        {/* Top Posts */}
        <h4 className="font-medium text-black text-sm">{t("top_post")}</h4>
        <p className="text-xs mb-2">
          {analytics?.top_posts?.period || t("last_48_hours")}
        </p>

        {topPosts.length > 0 ? (
          topPosts.map((post, i) => (
            <p
              key={i}
              className="text-xs text-[#7650e3] underline cursor-pointer hover:text-[#8a68d9] line-clamp-1"
            >
              {post}
            </p>
          ))
        ) : (
          <p className="text-xs text-gray-500">
            No data available for this platform
          </p>
        )}
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        className="w-full py-2.5 rounded-md font-semibold border-2 border-[#7650e3] bg-[#7650e3] text-white hover:bg-[#d7d7fc] hover:text-[#7650e3]"
      >
        {t("view_analytics")}
      </button>
    </div>
  );
}

export default Analytics;

/* Small helper */
const Metric = ({
  label,
  value,
  loading,
}: {
  label: string;
  value?: string | number;
  loading: boolean;
}) => (
  <div className="flex justify-between text-xs">
    <span className="font-medium">{label}</span>
    <span className="font-semibold text-purple-600">
      {loading ? "—" : value ?? 0}
    </span>
  </div>
);

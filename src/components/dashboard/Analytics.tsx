"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
} from "../../utils/platformIcons";
import { Platform } from "../../types";
import API from "../../services/api";

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

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<TopPost | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.facebookAnalytics();
      setAnalytics(res.data || res);
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
    const insight = analytics?.insights.find((i) => i.period === period);
    return insight?.values?.[0]?.value || 0;
  };

  const dailyReach = getReachByPeriod("day");
  const weeklyReach = getReachByPeriod("week");
  const monthlyReach = getReachByPeriod("days_28");

  const closeModal = () => {
    setSelectedPost(null);
    setShowAnalytics(false);
  };

  return (
    <>
      <div className="bg-gray-100 rounded-md p-5 h-[450px] flex flex-col  ">
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
              {analytics.page.name}
            </h3>
            <p className="text-sm text-gray-600">
              {analytics.page.followers.toLocaleString()} {t("followers")}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <h4 className="font-semibold">{t("summary")}</h4>
            </div>

            <div className="space-y-2">
              <Metric
                label={t("reach")}
                value={monthlyReach}
                loading={loading}
              />
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
              <Metric
                label={t("shares")}
                value={analytics?.summary.shares}
                loading={loading}
              />
            </div>
          </div>

          <hr className="my-2" />

          <div>
            <h4 className="font-semibold text-sm mb-3">{t("top_posts")}</h4>

            {loading ? (
              <div className="space-y-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-200 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : topPosts.length ? (
              <div className="space-y-1">
                {topPosts.slice(0, 3).map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="w-full text-left  text-sm text-blue-600  rounded truncate"
                  >
                    {post.title}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">
                {t("no_posts_available")}
              </p>
            )}
          </div>
        </div>

        {/* View Details */}
        <button
          onClick={() => setShowAnalytics(true)}
          className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          {t("view_details")}
        </button>
      </div>

      {(selectedPost || showAnalytics) && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between">
              <h3 className="font-bold">
                {selectedPost ? t("post_details") : t("analytics_details")}
              </h3>
              <button onClick={closeModal}>×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {selectedPost ? (
                /* POST DETAILS (UNCHANGED) */
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedPost.fullMessage || selectedPost.title}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <StatCard
                      title={t("likes")}
                      value={String(selectedPost.likes)}
                      color="bg-red-50 text-red-600"
                    />
                    <StatCard
                      title={t("comments")}
                      value={String(selectedPost.comments)}
                      color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                      title={t("shares")}
                      value={String(selectedPost.shares)}
                      color="bg-green-50 text-green-600"
                    />
                  </div>
                </div>
              ) : (
                analytics && (
                  <>
                    <div className="text-center mb-6">
                      <h4 className="font-bold">{analytics.page.name}</h4>
                      <p className="text-sm text-gray-600">
                        {analytics.page.category} •{" "}
                        {analytics.page.followers.toLocaleString()}{" "}
                        {t("followers")}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <StatCard
                        title={t("likes")}
                        value={analytics.summary.likes.toLocaleString()}
                        color="bg-red-50 text-red-600"
                      />
                      <StatCard
                        title={t("comments")}
                        value={analytics.summary.comments.toLocaleString()}
                        color="bg-blue-50 text-blue-600"
                      />
                      <StatCard
                        title={t("shares")}
                        value={analytics.summary.shares.toLocaleString()}
                        color="bg-green-50 text-green-600"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-6">
                      <ReachCard
                        period={t("today")}
                        value={dailyReach.toLocaleString()}
                      />
                      <ReachCard
                        period={t("week")}
                        value={weeklyReach.toLocaleString()}
                      />
                      <ReachCard
                        period={t("month")}
                        value={monthlyReach.toLocaleString()}
                      />
                    </div>
                  </>
                )
              )}
            </div>
            <div>
              <div className="flex-1 overflow-y-auto p-4">
                <h5 className="font-semibold text-gray-800 text-sm mb-3">
                  {t("top_posts")}
                </h5>
                <div className="space-y-3">
                  {topPosts.length > 0 ? (
                    topPosts.map((post, index) => (
                      <button
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="w-full text-left py-3 px-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {post.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(post.created_time).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right ml-3">
                            <p className="text-lg font-bold text-blue-600">
                              {post.engagement}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t("engagement")}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 text-sm py-4">
                      {t("no_posts_available")}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={closeModal}
                className="w-full py-3 bg-gray-100 rounded-lg"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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

const StatCard = ({ title, value, color }: any) => (
  <div className={`rounded-lg p-3 text-center ${color}`}>
    <p className="text-lg font-bold">{value}</p>
    <p className="text-xs text-gray-600">{title}</p>
  </div>
);

const ReachCard = ({ period, value }: any) => (
  <div className="bg-blue-50 rounded-lg p-3 text-center">
    <p className="text-sm font-semibold">{period}</p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

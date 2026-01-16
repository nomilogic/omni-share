"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "@/services/api";

import { ExternalLink, RefreshCcw } from "lucide-react";

import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
} from "../utils/platformIcons";
import { Platform } from "../types/";

// ---------------- Types ----------------
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

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [analyticsList, setAnalyticsList] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<TopPost | null>(null);

  const platforms: Platform[] = [
    "facebook",
    "linkedin",
    "instagram",
    "youtube",
    "tiktok",
  ];

  const platformParam = (searchParams.get("platform") || "") as Platform;

  const hasAnyUsefulData = (a: AnalyticsData) => {
    const followers = a?.page?.followers ?? 0;
    const likes = a?.summary?.likes ?? 0;
    const comments = a?.summary?.comments ?? 0;
    const shares = a?.summary?.shares ?? 0;
    const postsLen = a?.top_posts?.posts?.length ?? 0;
    const reach =
      a?.insights?.reduce(
        (acc, cur) => acc + (cur?.values?.[0]?.value ?? 0),
        0
      ) ?? 0;

    return (
      followers > 0 ||
      likes > 0 ||
      comments > 0 ||
      shares > 0 ||
      postsLen > 0 ||
      reach > 0
    );
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.facebookAnalytics();
      setAnalyticsList(res?.data?.data || []);
    } catch (e) {
      console.error("Analytics fetch error:", e);
      setAnalyticsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // platforms that have usable data
  const platformsWithData = useMemo(() => {
    const map = new Map<Platform, AnalyticsData>();
    for (const a of analyticsList) {
      if (a?.platform) map.set(a.platform, a);
    }
    return Array.from(map.values())
      .filter(hasAnyUsefulData)
      .map((a) => a.platform);
  }, [analyticsList]);

  const platformsWithDataSet = useMemo(
    () => new Set<Platform>(platformsWithData),
    [platformsWithData]
  );

  // ✅ selected platform: URL valid -> else facebook(if has data) -> else first available
  const selectedPlatform = useMemo<Platform | null>(() => {
    if (platformParam && platformsWithDataSet.has(platformParam))
      return platformParam;

    if (platformsWithDataSet.has("facebook")) return "facebook";

    return platformsWithData[0] ?? null;
  }, [platformParam, platformsWithData, platformsWithDataSet]);

  // keep URL in sync (refresh-safe)
  useEffect(() => {
    if (!loading && selectedPlatform) {
      const current = searchParams.get("platform");
      if (current !== selectedPlatform) {
        setSearchParams({ platform: selectedPlatform }, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, selectedPlatform]);

  const analytics = useMemo(() => {
    if (!selectedPlatform) return null;
    return analyticsList.find((a) => a.platform === selectedPlatform) ?? null;
  }, [analyticsList, selectedPlatform]);

  const topPosts = analytics?.top_posts?.posts || [];

  const getReachByPeriod = (period: "day" | "week" | "days_28") => {
    const insight = analytics?.insights?.find((i) => i.period === period);
    return insight?.values?.[0]?.value ?? 0;
  };

  const dailyReach = getReachByPeriod("day");
  const weeklyReach = getReachByPeriod("week");
  const monthlyReach = getReachByPeriod("days_28");

  const platformLabel = selectedPlatform
    ? selectedPlatform[0].toUpperCase() + selectedPlatform.slice(1)
    : "";

  return (
    <div className="mt-5">
      <main className="w-full flex flex-col gap-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 px-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedPost ? t("post_details") || "Post Details" : "Analytics"}
              {/* <p className="text-sm font-normal">Updates after 24 hours</p> */}
            </h1>

            {platformLabel ? (
              <span className="hidden sm:inline-flex px-3 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700">
                {platformLabel}
              </span>
            ) : null}
          </div>

          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
            disabled={loading}
            title="Refresh"
          >
            <RefreshCcw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            {t("refresh") || "Refresh"}
          </button>
        </div>

        {/* ✅ ALL platform icons (data => active, no-data => disabled) */}
        <div className="flex flex-wrap gap-2 md:gap-3 px-3">
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
                  setSelectedPost(null);
                  setSearchParams({ platform: p }, { replace: true });
                }}
                className={`relative p-1 rounded-full transition-all duration-200 transform h-fit
                  ${hasData ? "hover:scale-105" : ""}
                  ${
                    isActive && hasData
                      ? "ring-4 ring-blue-200 shadow-md"
                      : hasData
                      ? "hover:shadow-md"
                      : "opacity-30 grayscale cursor-not-allowed"
                  }
                `}
                title={hasData ? p : `${p} (no data)`}
              >
                <div
                  className={`w-10 md:w-12 h-10 md:h-12 rounded-full flex items-center justify-center text-white ${getPlatformIconBackgroundColors(
                    p
                  )} shadow-md`}
                >
                  {IconComponent ? (
                    <IconComponent className="w-4 md:w-6 h-4 md:h-6" />
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

        {/* ✅ Center heading under icons */}

        <div className="bg-gray-100 lg:px-4 px-3 py-4 rounded-md">
          {/* Empty state */}
          {!loading && (!analytics || platformsWithData.length === 0) && (
            <div className="bg-white rounded-md p-6 border">
              <p className="text-sm text-gray-700 font-medium">
                No analytics data available yet.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Connect your accounts and publish content to start seeing
                analytics.
              </p>
            </div>
          )}

          {/* Main content */}
          {!!analytics && platformsWithData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left/Main */}
              <div className="lg:col-span-2 space-y-4">
                {selectedPost ? (
                  <PostDetailsCard
                    post={selectedPost}
                    onBack={() => setSelectedPost(null)}
                  />
                ) : (
                  <div className="bg-white rounded-md border p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-xl font-bold text-gray-900 truncate">
                          {analytics.page.name}
                        </h2>

                        {analytics.platform === "facebook" && (
                          <p className="text-sm text-gray-600 mt-1">
                            {analytics.page.category} •{" "}
                            {analytics.page.followers?.toLocaleString?.() ?? 0}{" "}
                            {t("followers") || "followers"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <StatCard
                        title={t("likes") || "Likes"}
                        value={analytics.summary.likes}
                        tone="blue"
                      />
                      <StatCard
                        title={t("comments") || "Comments"}
                        value={analytics.summary.comments}
                        tone="blue"
                      />
                      <StatCard
                        title={t("shares") || "Shares"}
                        value={analytics.summary.shares}
                        tone="blue"
                      />
                    </div>

                    {analytics.platform === "facebook" && (
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <ReachCard
                          period={t("today") || "Today"}
                          value={dailyReach}
                        />
                        <ReachCard
                          period={t("week") || "Week"}
                          value={weeklyReach}
                        />
                        <ReachCard
                          period={t("month") || "Month"}
                          value={monthlyReach}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right/Sidebar posts */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-md border p-4 h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {t("top_posts") || "Top Posts"}
                    </h4>
                    {topPosts?.length ? (
                      <span className="text-xs text-gray-500">
                        {topPosts.length} {t("posts") || "posts"}
                      </span>
                    ) : null}
                  </div>

                  <PostsList
                    topPosts={topPosts}
                    onSelect={(p) => {
                      setSelectedPost(p);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ---------------- UI Components ----------------

function PostsList({
  topPosts,
  onSelect,
}: {
  topPosts: TopPost[];
  onSelect: (post: TopPost) => void;
}) {
  const { t } = useTranslation();

  if (!topPosts?.length) {
    return (
      <p className="text-xs text-gray-500 italic">
        {t("no_posts_available") || "No posts available."}
      </p>
    );
  }

  return (
    <div className="space-y-2 max-h-[520px] overflow-y-auto">
      {topPosts.map((post) => (
        <button
          key={post.id}
          onClick={() => onSelect(post)}
          className="w-full text-left p-3 rounded-md border bg-purple-50 hover:bg-purple-100 transition-colors"
        >
          <div className="flex justify-between items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {post.title}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {new Date(post.created_time).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-blue-600 leading-none">
                {post.engagement ?? 0}
              </p>
              <p className="text-[11px] text-gray-500">
                {t("engagement") || "engagement"}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function PostDetailsCard({
  post,
  onBack,
}: {
  post: TopPost;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const message = post.fullMessage || post.title;

  return (
    <div className="bg-white rounded-md border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-gray-900">
            {t("post_details") || "Post Details"}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {new Date(post.created_time).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {post.permalink ? (
            <a
              href={post.permalink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              {t("open") || "Open"}
            </a>
          ) : null}

          <button
            onClick={onBack}
            className="text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            {t("back") || "Back"}
          </button>
        </div>
      </div>

      <div className="mt-4 bg-gray-50 p-4 rounded-md text-sm text-gray-800 leading-relaxed">
        {message}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatCard
          title={t("likes") || "Likes"}
          value={post.likesCount}
          tone="blue"
        />
        <StatCard
          title={t("comments") || "Comments"}
          value={post.commentsCount}
          tone="blue"
        />
        <StatCard
          title={t("shares") || "Shares"}
          value={post.sharesCount}
          tone="blue"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className={`rounded-md p-3 text-center bg-[#7650e3]`}>
      <p className="text-lg font-bold text-theme-text-light">{value || 0}</p>
      <p className="text-xs text-theme-text-light">{title}</p>
    </div>
  );
}

function ReachCard({ period, value }: { period: string; value: any }) {
  return (
    <div className="bg-[#7650e3] rounded-md p-3 text-center">
      <p className="text-sm font-semibold text-theme-text-light">{period}</p>
      <p className="text-lg font-bold text-theme-text-light">{value || 0}</p>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink, RefreshCcw } from "lucide-react";
import { useLoading } from "@/context/LoadingContext";

import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
} from "../utils/platformIcons";
import { Platform } from "../types/";
import { useAppContext } from "@/context/AppContext";

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
    following?: number;
    [key: string]: any;
  };
  summary: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    engagement?: number;
    clicks?: number;
    video_count?: number;
    [key: string]: any;
  };
  performance?: {
    engagementRate?: number;
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
      media_type?: string;
      [key: string]: any;
    }>;
  };
  insights?: any[];
}

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { showLoading, hideLoading } = useLoading();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, fetchAnalytics } = useAppContext();

  const analyticsList: AnalyticsItem[] = state.analyticsList || [];
  const loading = state.analyticsLoading;

  const [selectedPost, setSelectedPost] = useState<any>(null);

  useEffect(() => {
    if (loading) {
      showLoading(t("loading_analytics") || "Loading analytics...");
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading, t]);

  const platforms: Platform[] = [
    "facebook",
    "instagram",
    "tiktok",
    "linkedin",
    "youtube",
  ];

  const platformParam = (searchParams.get("platform") || "") as Platform;

  const platformsWithDataSet = useMemo(
    () => new Set(analyticsList.map((a) => a.platform).filter(Boolean)),
    [analyticsList]
  );

  const selectedPlatform = useMemo<Platform | null>(() => {
    if (platformParam && platformsWithDataSet.has(platformParam)) {
      return platformParam;
    }
    if (platformsWithDataSet.has("facebook")) return "facebook";
    return (Array.from(platformsWithDataSet)[0] as Platform) ?? null;
  }, [platformParam, platformsWithDataSet]);

  const analytics = useMemo(() => {
    return analyticsList.find((a) => a.platform === selectedPlatform) ?? null;
  }, [analyticsList, selectedPlatform]);

  const topPosts = analytics?.top_posts?.posts || [];

  useEffect(() => {
    if (
      !loading &&
      selectedPlatform &&
      searchParams.get("platform") !== selectedPlatform
    ) {
      setSearchParams({ platform: selectedPlatform }, { replace: true });
    }
  }, [loading, selectedPlatform, searchParams, setSearchParams]);

  const getAudienceInfo = () => {
    if (!analytics?.page) return { count: 0, label: "Followers" };

    switch (selectedPlatform) {
      case "youtube":
        return { count: analytics.page.subscribers ?? 0, label: "Subscribers" };
      case "tiktok":
      case "instagram":
      case "facebook":
        return { count: analytics.page.followers ?? 0, label: "Followers" };
      default:
        return { count: 0, label: "Audience" };
    }
  };

  const { count: audienceCount, label: audienceLabel } = getAudienceInfo();

  return (
    <div className="mt-5">
      <main className="w-full flex flex-col gap-y-4">
        <div className="flex items-center justify-between gap-3 px-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedPost ? "Post Details" : "Analytics"}
            </h1>
            {selectedPlatform && (
              <span className="hidden sm:inline-flex px-3 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700">
                {selectedPlatform.charAt(0).toUpperCase() +
                  selectedPlatform.slice(1)}
              </span>
            )}
          </div>

          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
            disabled={loading}
          >
            <RefreshCcw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-3 px-3">
          {platforms.map((p) => {
            const IconComponent = getPlatformIcon(p);
            const active = selectedPlatform === p;
            const hasData = platformsWithDataSet.has(p);

            return (
              <button
                key={p}
                disabled={!hasData}
                onClick={() => {
                  if (!hasData) return;
                  setSelectedPost(null);
                  setSearchParams({ platform: p }, { replace: true });
                }}
                className={`relative p-1 rounded-full transition-all
                  ${hasData ? "hover:scale-105" : "opacity-40 cursor-not-allowed grayscale"}
                  ${active && hasData ? "ring-4 ring-blue-300 shadow-md" : ""}
                `}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${getPlatformIconBackgroundColors(p)}`}
                >
                  {IconComponent ? (
                    <IconComponent className="w-6 h-6 text-white" />
                  ) : (
                    p.slice(0, 2)
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="md:px-4 px-3 py-5 rounded-md">
          {!analytics && !loading && (
            <div className="bg-white p-8 rounded text-center text-gray-600">
              No analytics data available for this platform yet.
            </div>
          )}

          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Left - Main Info & Stats */}
              <div className="md:col-span-2 space-y-5">
                {selectedPost ? (
                  <PostDetailsCard
                    post={selectedPost}
                    onBack={() => setSelectedPost(null)}
                  />
                ) : (
                  <div className="bg-white rounded-md border p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {analytics.page.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          {analytics.page.category ||
                            analytics.page.username ||
                            "—"}
                          {" • "}
                          {audienceCount.toLocaleString() || "0"}{" "}
                          {audienceLabel}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                      {/* Platform-specific primary metrics */}
                      {selectedPlatform === "youtube" &&
                        analytics.page.totalViews !== undefined && (
                          <StatCard
                            title="Total Views"
                            value={analytics.page.totalViews}
                          />
                        )}

                      {selectedPlatform === "linkedin" &&
                        analytics.summary.views !== undefined && (
                          <StatCard
                            title="Impressions"
                            value={analytics.summary.views}
                          />
                        )}

                      {selectedPlatform === "tiktok" &&
                        analytics.summary.video_count !== undefined && (
                          <StatCard
                            title="Videos"
                            value={analytics.summary.video_count}
                          />
                        )}

                      {analytics.summary.views !== undefined &&
                        !["youtube", "linkedin"].includes(
                          selectedPlatform || ""
                        ) && (
                          <StatCard
                            title="Views"
                            value={analytics.summary.views}
                          />
                        )}

                      {analytics.summary.likes !== undefined && (
                        <StatCard
                          title="Likes"
                          value={analytics.summary.likes}
                        />
                      )}

                      {analytics.summary.comments !== undefined && (
                        <StatCard
                          title="Comments"
                          value={analytics.summary.comments}
                        />
                      )}

                      {analytics.summary.shares !== undefined && (
                        <StatCard
                          title="Shares"
                          value={analytics.summary.shares}
                        />
                      )}

                      {analytics.summary.clicks !== undefined && (
                        <StatCard
                          title="Clicks"
                          value={analytics.summary.clicks}
                        />
                      )}

                      {analytics.performance?.engagementRate !== undefined && (
                        <StatCard
                          title="Engagement Rate"
                          value={`${(analytics.performance.engagementRate * 100).toFixed(2)}%`}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right - Posts list */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-md border p-5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">
                      Recent Posts
                    </h4>
                    {topPosts.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {topPosts.length} posts
                      </span>
                    )}
                  </div>

                  {topPosts.length === 0 ? (
                    <p className="text-sm text-gray-500 italic flex-1 flex items-center justify-center">
                      No posts available yet
                    </p>
                  ) : (
                    <div className="space-y-3 overflow-y-auto flex-1">
                      {topPosts.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => setSelectedPost(post)}
                          className="w-full text-left p-3.5 rounded border hover:bg-gray-50 transition-colors"
                        >
                          <p className="text-sm font-medium line-clamp-2">
                            {post.title || "(no caption)"}
                          </p>
                          <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-3">
                            {post.views !== undefined && (
                              <span>Views: {post.views}</span>
                            )}
                            {post.likes !== undefined && (
                              <span>Likes: {post.likes}</span>
                            )}
                            {post.comments !== undefined && (
                              <span>Comments: {post.comments}</span>
                            )}
                            {post.engagement !== undefined && (
                              <span>Eng: {post.engagement}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ---------------- Sub Components ----------------

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-gradient-to-br   rounded-md p-4 text-center border border-purple-100">
      <p className="text-2xl md:text-3xl font-bold text-purple-700">
        {typeof value === "number" ? value.toLocaleString() : value || "0"}
      </p>
      <p className="text-xs md:text-sm text-gray-600 mt-1 font-medium">
        {title}
      </p>
    </div>
  );
}

function PostDetailsCard({ post, onBack }: { post: any; onBack: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-md border p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Post Details</h3>
          <p className="text-sm text-gray-500 mt-1">
            {post.created_time
              ? new Date(post.created_time).toLocaleString()
              : "—"}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
        >
          ← Back
        </button>
      </div>

      <div className="bg-gray-50 p-5 rounded-md text-gray-800 leading-relaxed whitespace-pre-wrap">
        {post.title || "(No caption provided)"}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {post.views !== undefined && (
          <StatCard title="Views" value={post.views} />
        )}
        {post.likes !== undefined && (
          <StatCard title="Likes" value={post.likes} />
        )}
        {post.comments !== undefined && (
          <StatCard title="Comments" value={post.comments} />
        )}
        {post.shares !== undefined && (
          <StatCard title="Shares" value={post.shares} />
        )}
        {post.engagement !== undefined && (
          <StatCard title="Engagement" value={post.engagement} />
        )}
      </div>
    </div>
  );
}

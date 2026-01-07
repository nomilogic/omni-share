"use client";

import React, { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BarChart3, List, X } from "lucide-react";

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
  platform: string;
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
  // keep same props style you already use
  analytics: AnalyticsData | null | undefined;
  topPosts: TopPost[];
  dailyReach: number;
  weeklyReach: number;
  monthlyReach: number;

  // in page, close usually means "go back"
  onClose?: () => void;
};

const AnalyticsDetailsPage: FC<Props> = ({
  analytics,
  topPosts,
  dailyReach,
  weeklyReach,
  monthlyReach,
  onClose,
}) => {
  const { t } = useTranslation();
  const [selectedPost, setSelectedPost] = useState<TopPost | null>(null);
  const [tab, setTab] = useState<"overview" | "posts">("overview");

  const platformLabel = useMemo(() => {
    const p = analytics?.platform || "";
    return p ? p[0].toUpperCase() + p.slice(1) : "";
  }, [analytics?.platform]);

  // Nice “page guard”
  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageShell
          title={t("analytics_details") || "Analytics Details"}
          subtitle={t("no_data") || "No analytics data available."}
          onClose={onClose}
        >
          <div className="bg-gray-100 rounded-md p-6 border">
            <p className="text-sm text-gray-600">
              {t("no_data") || "No analytics data available."}
            </p>
          </div>
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageShell
        title={selectedPost ? t("post_details") : t("analytics_details")}
        subtitle={
          selectedPost
            ? t("post_details_subtitle") || "See performance for this post."
            : t("analytics_details_subtitle") ||
              "Track reach and engagement across your page."
        }
        badge={platformLabel}
        onClose={onClose}
        leftAction={
          selectedPost ? (
            <button
              onClick={() => setSelectedPost(null)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("back") || "Back"}
            </button>
          ) : null
        }
      >
        {/* Tabs */}
        <div className="bg-gray-100 rounded-md border p-2 flex items-center gap-2 mb-4">
          <TabButton
            active={tab === "overview"}
            onClick={() => setTab("overview")}
            icon={<BarChart3 className="w-4 h-4" />}
            label={t("overview") || "Overview"}
          />
          <TabButton
            active={tab === "posts"}
            onClick={() => setTab("posts")}
            icon={<List className="w-4 h-4" />}
            label={t("top_posts") || "Top Posts"}
            rightPill={topPosts?.length ? String(topPosts.length) : undefined}
          />
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left/Main */}
          <div className="lg:col-span-2 space-y-4">
            {selectedPost ? (
              <PostDetailsCard post={selectedPost} />
            ) : (
              <>
                {/* Page summary card */}
                <div className="bg-gray-100 rounded-md border p-5">
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

                    <div className="hidden sm:flex items-center gap-2">
                      <span className="px-3 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700">
                        {platformLabel}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <StatCard
                      title={t("likes") || "Likes"}
                      value={analytics.summary.likes}
                      tone="red"
                    />
                    <StatCard
                      title={t("comments") || "Comments"}
                      value={analytics.summary.comments}
                      tone="blue"
                    />
                    <StatCard
                      title={t("shares") || "Shares"}
                      value={analytics.summary.shares}
                      tone="green"
                    />
                  </div>

                  {analytics.platform === "facebook" && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <ReachCard period={t("today") || "Today"} value={dailyReach} />
                      <ReachCard period={t("week") || "Week"} value={weeklyReach} />
                      <ReachCard period={t("month") || "Month"} value={monthlyReach} />
                    </div>
                  )}
                </div>

                {/* Quick insight */}
                {/* <div className="bg-gray-100 rounded-md border p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t("highlights") || "Highlights"}
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                    <li>
                      {t("highlight_1") ||
                        "Your engagement summary updates automatically with platform selection."}
                    </li>
                    <li>
                      {t("highlight_2") ||
                        "Tap any top post to see a clean breakdown of likes, comments, and shares."}
                    </li>
                    <li>
                      {t("highlight_3") ||
                        "Use Reach cards (Facebook) to compare daily, weekly, and monthly performance."}
                    </li>
                  </ul>
                </div> */}
              </>
            )}
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-100 rounded-md border p-4 h-full">
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

              {!topPosts?.length ? (
                <p className="text-xs text-gray-500 italic">
                  {t("no_posts_available") || "No posts available."}
                </p>
              ) : (
                <div className="space-y-2 max-h-[520px] overflow-y-auto ">
                  {topPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => {
                        setSelectedPost(post);
                        setTab("overview");
                      }}
                      className="w-full text-left p-3 rounded-md border bg-white hover:bg-purple-100 transition-colors"
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
              )}

              {/* Mobile: show posts list when Posts tab selected */}
              {tab === "posts" && topPosts?.length ? (
                <div className="lg:hidden mt-3 border-t pt-3">
                  <p className="text-xs text-gray-500">
                    {t("tap_post") || "Tap a post to open details."}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Mobile top posts view */}
        {tab === "posts" && (
          <div className="lg:hidden mt-4 bg-gray-100 rounded-md border p-4">
            {!topPosts?.length ? (
              <p className="text-xs text-gray-500 italic">
                {t("no_posts_available") || "No posts available."}
              </p>
            ) : (
              <div className="space-y-2">
                {topPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
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
            )}
          </div>
        )}
      </PageShell>
    </div>
  );
};

export default AnalyticsDetailsPage;

// ---------------- UI building blocks ----------------

function PageShell({
  title,
  subtitle,
  badge,
  leftAction,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  leftAction?: React.ReactNode;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-transparent pb-4 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              {leftAction}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Analytics
              </h1>
              {badge ? (
                <span className="hidden sm:inline-flex px-3 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700">
                  {badge}
                </span>
              ) : null}
            </div>
            {subtitle ? (
              <p className="text-sm text-gray-600 mt-1"></p>
            ) : null}
          </div>

          {onClose ? (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          ) : null}
        </div>
      </div>

      {children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  rightPill,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  rightPill?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition
        ${active ? "text-white   transition-all border-2 border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3]" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}
      `}
    >
      {icon}
      <span>{label}</span>
      {rightPill ? (
        <span
          className={`ml-1 px-2 py-0.5 rounded-md text-xs font-bold
            ${active ? "bg-gray-100/20 text-white" : "bg-gray-100 text-gray-800"}
          `}
        >
          {rightPill}
        </span>
      ) : null}
    </button>
  );
}

function PostDetailsCard({ post }: { post: TopPost }) {
  const { t } = useTranslation();
  const message = post.fullMessage || post.title;

  return (
    <div className="bg-gray-100 rounded-md border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-gray-900">
            {t("post_details") || "Post Details"}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {new Date(post.created_time).toLocaleString()}
          </p>
        </div>

        {post.permalink ? (
          <a
            href={post.permalink}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-purple-700 hover:underline"
          >
            {t("open") || "Open"}
          </a>
        ) : null}
      </div>

      <div className="mt-4 bg-gray-50 p-4 rounded-md text-sm text-gray-800 leading-relaxed">
        {message}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatCard title={t("likes") || "Likes"} value={post.likesCount} tone="red" />
        <StatCard
          title={t("comments") || "Comments"}
          value={post.commentsCount}
          tone="blue"
        />
        <StatCard
          title={t("shares") || "Shares"}
          value={post.sharesCount}
          tone="green"
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: any;
  tone: "red" | "blue" | "green";
}) {
  const styles =
    tone === "red"
      ? "bg-white text-red-700"
      : tone === "blue"
      ? "bg-white text-blue-700"
      : "bg-white text-green-700";

  return (
    <div className={`rounded-md p-3 text-center ${styles}`}>
      <p className="text-lg font-bold">{value || 0}</p>
      <p className="text-xs text-gray-600">{title}</p>
    </div>
  );
}

function ReachCard({ period, value }: { period: string; value: any }) {
  return (
    <div className="bg-white rounded-md p-3 text-center">
      <p className="text-sm font-semibold text-gray-800">{period}</p>
      <p className="text-lg font-bold text-gray-900">{value || 0}</p>
    </div>
  );
}

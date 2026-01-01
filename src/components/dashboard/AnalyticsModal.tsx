// AnalyticsModal.tsx

import { FC, useState } from "react";
import { useTranslation } from "react-i18next";

// Types - copy these from your Analytics.tsx or import from a shared types file
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
    name: string;
    period: "day" | "week" | "days_28";
    values: Array<{ value: number; end_time: string }>;
    title: string;
  }>;
  top_posts: {
    posts: TopPost[];
  };
}

// Props interface - close is required by your ModalContext
interface AnalyticsModalProps {
  close: () => void;
  analytics: AnalyticsData | null;
  topPosts: TopPost[];
  dailyReach: number;
  weeklyReach: number;
  monthlyReach: number;
}

const AnalyticsModal: FC<AnalyticsModalProps> = ({
  close,
  analytics,
  topPosts,
  dailyReach,
  weeklyReach,
  monthlyReach,
}) => {
  const { t } = useTranslation();
  const [selectedPost, setSelectedPost] = useState<TopPost | null>(null);

  // Positioning styles - same pattern as ReferralSection
  const modalPositioningStyles: React.CSSProperties = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1001,
    maxWidth: "450px",
    width: "100%",
    padding: "0 16px",
  };

  return (
    <div
      style={modalPositioningStyles}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
  <h3 className="font-bold">
    {selectedPost ? t("post_details") : t("analytics_details")}
  </h3>
</div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedPost ? (
            // POST DETAILS VIEW
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                {selectedPost?.fullMessage || selectedPost?.title}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  title={t("likes")}
                  value={String(selectedPost?.likes)}
                  color="bg-red-50 text-red-600"
                />
                <StatCard
                  title={t("comments")}
                  value={String(selectedPost?.comments)}
                  color="bg-blue-50 text-blue-600"
                />
                <StatCard
                  title={t("shares")}
                  value={String(selectedPost?.shares)}
                  color="bg-green-50 text-green-600"
                />
              </div>

              {/* Back button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="text-blue-600 text-sm hover:underline"
              >
                ← {t("back") || "Back"}
              </button>
            </div>
          ) : (
            // ANALYTICS OVERVIEW
            analytics && (
              <>
                <div className="text-center mb-6">
                  <h4 className="font-bold">{analytics?.page?.name}</h4>
                  <p className="text-sm text-gray-600">
                    {analytics?.page?.category} •{" "}
                    {analytics?.page?.followers.toLocaleString()}{" "}
                    {t("followers")}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    title={t("likes")}
                    value={analytics?.summary?.likes.toLocaleString()}
                    color="bg-red-50 text-red-600"
                  />
                  <StatCard
                    title={t("comments")}
                    value={analytics?.summary?.comments.toLocaleString()}
                    color="bg-blue-50 text-blue-600"
                  />
                  <StatCard
                    title={t("shares")}
                    value={analytics?.summary?.shares.toLocaleString()}
                    color="bg-green-50 text-green-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3">
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

        {/* Top Posts Section */}
        {!selectedPost && (
          <div className="flex-1 overflow-y-auto pl-4 pr-4 pb-4 ">
            <h5 className="font-semibold text-gray-800 text-sm mb-2">
              {t("top_posts")}
            </h5>
            <div className="space-y-3">
              {topPosts.length > 0 ? (
                topPosts.map((post) => (
                  <button
                    key={post?.id}
                    onClick={() => setSelectedPost(post)}
                    className="w-full text-left py-3 px-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {post?.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(post?.created_time).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-lg font-bold text-blue-600">
                          {post?.engagement}
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
        )}

        {/* Footer */}
        <div className="pb-4 pr-4 pl-4  ">
          <button
            onClick={close}
            className="w-full py-3 bg-purple-600 text-white hover:text-[#7650e3] rounded-lg hover:bg-[#d7d7fc] border border-[#7650e3] font-semibold py-2.5 text-base rounded-md transition"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;

// Helper Components
const StatCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
  <div className={`rounded-lg p-3 text-center ${color}`}>
    <p className="text-lg font-bold">{value}</p>
    <p className="text-xs text-gray-600">{title}</p>
  </div>
);

const ReachCard = ({ period, value }: { period: string; value: string }) => (
  <div className="bg-blue-50 rounded-lg p-3 text-center">
    <p className="text-sm font-semibold">{period}</p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

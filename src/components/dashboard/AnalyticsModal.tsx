import { FC, useState } from "react";
import { useTranslation } from "react-i18next";

// Types
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

interface AnalyticsModalProps {
  close: () => void;
  analytics: AnalyticsData | null | undefined; // ✅ allow undefined too
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

  const modalStyles: React.CSSProperties = {
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
    <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-3 border-b">
          <h3 className="font-bold">
            {selectedPost ? t("post_details") : t("analytics_details")}
          </h3>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {selectedPost ? (
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                {selectedPost.fullMessage || selectedPost.title}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  title={t("likes")}
                  value={selectedPost.likesCount}
                  color="bg-red-50 text-red-600"
                />
                <StatCard
                  title={t("comments")}
                  value={selectedPost.commentsCount}
                  color="bg-blue-50 text-blue-600"
                />
                <StatCard
                  title={t("shares")}
                  value={selectedPost.sharesCount}
                  color="bg-green-50 text-green-600"
                />
              </div>

              <button
                onClick={() => setSelectedPost(null)}
                className="text-blue-600 text-sm hover:underline"
              >
                ← {t("back") || "Back"}
              </button>
            </div>
          ) : (
            analytics && (
              <>
                <div className="text-center mb-3">
                  <h4 className="font-bold">{analytics.page.name}</h4>
                  {analytics.platform === "facebook" && (
                    <p className="text-sm text-gray-600">
                      {analytics.page.category} • {analytics.page.followers}{" "}
                      {t("followers")}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    title={t("likes")}
                    value={analytics.summary.likes}
                    color="bg-red-50 text-red-600"
                  />
                  <StatCard
                    title={t("comments")}
                    value={analytics.summary.comments}
                    color="bg-blue-50 text-blue-600"
                  />
                  <StatCard
                    title={t("shares")}
                    value={analytics.summary.shares}
                    color="bg-green-50 text-green-600"
                  />
                </div>

                {analytics.platform === "facebook" && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <ReachCard period={t("today")} value={dailyReach} />
                    <ReachCard period={t("week")} value={weeklyReach} />
                    <ReachCard period={t("month")} value={monthlyReach} />
                  </div>
                )}
              </>
            )
          )}
        </div>

        {/* Top Posts */}
        {!selectedPost && topPosts.length > 0 && (
          <div className="flex-1 overflow-y-auto pl-4 pr-4 pb-4">
            <h5 className="font-semibold text-gray-800 text-sm mb-2">
              {t("top_posts")}
            </h5>
            <div className="space-y-3">
              {topPosts.map((post) => (
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
                      <p className="text-xs text-gray-500">{t("engagement")}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pb-4 pr-4 pl-4">
          <button
            onClick={close}
            className="w-full py-3 bg-purple-600 text-white hover:text-[#7650e3] rounded-lg hover:bg-[#d7d7fc] border border-[#7650e3] font-semibold transition"
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
const StatCard = ({
  title,
  value,
  color,
}: {
  title: string;
  value: any;
  color: string;
}) => (
  <div className={`rounded-lg p-3 text-center ${color}`}>
    <p className="text-lg font-bold">{value || 0}</p>
    <p className="text-xs text-gray-600">{title}</p>
  </div>
);

const ReachCard = ({ period, value }: { period: string; value: any }) => (
  <div className="bg-blue-50 rounded-lg p-3 text-center">
    <p className="text-sm font-semibold">{period}</p>
    <p className="text-lg font-bold">{value || 0}</p>
  </div>
);

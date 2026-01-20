import React, { useState, useEffect } from "react";
import {
  Building2,
  BarChart3,
  Calendar,
  Target,
  Settings,
  Plus,
  Edit2,
  Share2,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { CampaignInfo } from "../types";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

interface CampaignDashboardProps {
  campaign: any;
  onEditCampaign: () => void;
  onCreatePost: () => void;
  onViewPosts: () => void;
  onSchedulePosts: () => void;
  onBack: () => void;
}

interface CampaignStats {
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
  totalCampaigns: number;
  activeCampaigns: number;
  followers: { [platform: string]: number };
  engagement: { [platform: string]: number };
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type:
    | "post_published"
    | "campaign_created"
    | "post_scheduled"
    | "engagement_spike";
  message: string;
  timestamp: string;
  platform?: string;
}

type DashboardView =
  | "overview"
  | "analytics"
  | "posts"
  | "campaigns"
  | "settings";

export const CampaignDashboard: React.FC<CampaignDashboardProps> = ({
  campaign,
  onEditCampaign,
  onCreatePost,
  onViewPosts,
  onSchedulePosts,
  onBack,
}) => {
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);

  useEffect(() => {
    if (campaign && campaign.id) {
      loadCampaignStats();
    }
  }, [campaign?.id]);

  const loadCampaignStats = async () => {
    if (!campaign || !campaign.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const token = Cookies.get("auth_token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Load actual stats from API using correct parameter names
      const [postsResponse, campaignsResponse] = await Promise.all([
        fetch(`/api/posts?campaignId=${campaign.id}`, { headers }),
        fetch(`/api/campaigns?userId=${campaign.userId || campaign.user_id}`, {
          headers,
        }),
      ]);

      let totalPosts = 0;
      let publishedPosts = 0;
      let scheduledPosts = 0;
      let totalCampaigns = 0;
      let activeCampaigns = 0;

      if (postsResponse.ok) {
        const postsResult = await postsResponse.json();
        if (postsResult.success && postsResult.data) {
          totalPosts = postsResult.data.length;
          // Calculate published and scheduled posts if status field exists
          publishedPosts = postsResult.data.filter(
            (post: any) => post.status === "published"
          ).length;
          scheduledPosts = postsResult.data.filter(
            (post: any) => post.status === "scheduled"
          ).length;
        }
      }

      if (campaignsResponse.ok) {
        const campaignsResult = await campaignsResponse.json();
        if (campaignsResult.success && campaignsResult.data) {
          totalCampaigns = campaignsResult.data.length;
          activeCampaigns = campaignsResult.data.filter(
            (campaign: any) => campaign.status === "active"
          ).length;
        }
      }

      // Generate some sample activity data
      const sampleActivity: ActivityItem[] = [
        {
          id: "1",
          type: "post_published",
          message: "New post published successfully",
          timestamp: "2 hours ago",
          platform: "instagram",
        },
        {
          id: "2",
          type: "campaign_created",
          message: "Marketing campaign created",
          timestamp: "1 day ago",
        },
        {
          id: "3",
          type: "post_scheduled",
          message: "Post scheduled for tomorrow",
          timestamp: "2 days ago",
          platform: "facebook",
        },
      ];

      const actualStats: CampaignStats = {
        totalPosts,
        publishedPosts,
        scheduledPosts,
        totalCampaigns,
        activeCampaigns,
        followers: {
          instagram: 1250,
          facebook: 980,
          twitter: 750,
          linkedin: 420,
        },
        engagement: {
          instagram: 4.2,
          facebook: 3.8,
          twitter: 2.1,
          linkedin: 6.5,
        },
        recentActivity: sampleActivity,
      };

      setStats(actualStats);
    } catch (error) {
      setStats({
        totalPosts: 0,
        publishedPosts: 0,
        scheduledPosts: 0,
        totalCampaigns: 0,
        activeCampaigns: 0,
        followers: {},
        engagement: {},
        recentActivity: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const NavigationTabs = () => (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
      <button
        onClick={() => setActiveView("overview")}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-colors ${
          activeView === "overview"
            ? "bg-white text-blue-600 shadow-md"
            : "text-gray-500 font-medium hover:text-slate-900"
        }`}
      >
        <Building2 className="w-4 h-4" />
        Overview
      </button>

      <button
        onClick={() => setActiveView("analytics")}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-colors ${
          activeView === "analytics"
            ? "bg-white text-purple-600 shadow-md"
            : "text-gray-500 font-medium hover:text-slate-900"
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        Analytics
      </button>

      <button
        onClick={() => setActiveView("posts")}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-colors ${
          activeView === "posts"
            ? "bg-white text-green-600 shadow-md"
            : "text-gray-500 font-medium hover:text-slate-900"
        }`}
      >
        <Share2 className="w-4 h-4" />
        Posts
      </button>

      <button
        onClick={() => setActiveView("campaigns")}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-colors ${
          activeView === "campaigns"
            ? "bg-white text-red-600 shadow-md"
            : "text-gray-500 font-medium hover:text-slate-900"
        }`}
      >
        <Target className="w-4 h-4" />
        Campaigns
      </button>

      <button
        onClick={() => setActiveView("settings")}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-colors ${
          activeView === "settings"
            ? "bg-white text-orange-600 shadow-md"
            : "text-gray-500 font-medium hover:text-slate-900"
        }`}
      >
        <Settings className="w-4 h-4" />
        Settings
      </button>
    </div>
  );

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "post_published":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "campaign_created":
        return <Target className="w-4 h-4 text-purple-500" />;
      case "post_scheduled":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "engagement_spike":
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500 font-medium" />;
    }
  };

  const OverviewView = () => {
    if (!stats) return <div>Loading overview...</div>;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-md shadow-md border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500 font-medium  tracking-wide">
              Total Posts
            </h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {stats.totalPosts}
            </p>
            <p className="text-sm text-green-600 mt-1">+12 this month</p>
          </div>

          <div className="bg-white p-6 rounded-md shadow-md border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500 font-medium  tracking-wide">
              Published
            </h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {stats.publishedPosts}
            </p>
            <p className="text-sm text-green-600 mt-1">+8 this month</p>
          </div>

          <div className="bg-white p-6 rounded-md shadow-md border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-500 font-medium  tracking-wide">
              Scheduled
            </h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {stats.scheduledPosts}
            </p>
            <p className="text-sm text-blue-600 mt-1">Next in 4 hours</p>
          </div>

          <div className="bg-white p-6 rounded-md shadow-md border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-gray-500 font-medium  tracking-wide">
              Campaigns
            </h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {stats.activeCampaigns}
            </p>
            <p className="text-sm text-gray-500 font-medium mt-1">
              of {stats.totalCampaigns} total
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-md shadow-md p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={onCreatePost}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <Plus className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-slate-900">
                  {t("create_post")}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Generate new content
                </div>
              </div>
            </button>

            <button
              onClick={onSchedulePosts}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-md hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
            >
              <Calendar className="w-6 h-6 text-purple-600" />
              <div className="text-left">
                <div className="font-medium text-slate-900">Schedule Posts</div>
                <div className="text-sm text-gray-500 font-medium">
                  Plan your content
                </div>
              </div>
            </button>

            <button
              onClick={onBack}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-md hover:border-green-500 hover:bg-green-50 transition-all duration-200"
            >
              <Target className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <div className="font-medium text-slate-900">All Campaigns</div>
                <div className="text-sm text-gray-500 font-medium">
                  View all campaigns
                </div>
              </div>
            </button>

            <button
              onClick={onEditCampaign}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-md hover:border-orange-500 hover:bg-orange-50 transition-all duration-200"
            >
              <Edit2 className="w-6 h-6 text-orange-600" />
              <div className="text-left">
                <div className="font-medium text-slate-900">Edit Campaign</div>
                <div className="text-sm text-gray-500 font-medium">
                  Update details
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-md shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-md"
                >
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {activity.timestamp}
                    </p>
                  </div>
                  {activity.platform && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full ">
                      {activity.platform}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Platform Summary */}
          <div className="bg-white rounded-md shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Platform Overview
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.followers).map(([platform, followers]) => (
                <div
                  key={platform}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600 ">
                        {platform[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 ">
                        {platform}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {followers.toLocaleString()} followers
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {stats.engagement[platform]}%
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      engagement
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AnalyticsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-md shadow-md p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Performance Analytics
        </h3>
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-900 mb-2">
            Advanced Analytics Coming Soon
          </h4>
          <p className="text-gray-500 font-medium">
            Detailed performance metrics and insights will be available here.
          </p>
        </div>
      </div>
    </div>
  );

  const PostsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-md shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Posts Management
          </h3>
          <button
            onClick={onCreatePost}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Post
          </button>
        </div>
        <div className="text-center py-12">
          <Share2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-900 mb-2">
            Posts Management
          </h4>
          <p className="text-gray-500 font-medium mb-4">
            View and manage all your posts from here.
          </p>
          <button
            onClick={onViewPosts}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            View All Posts
          </button>
        </div>
      </div>
    </div>
  );

  const CampaignsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-md shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Campaign Management
          </h3>
          <button
            onClick={onBack}
            className="bg-purple-600 text-white px-4 py-2.5 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            View All Campaigns
          </button>
        </div>
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-900 mb-2">
            Campaign Management
          </h4>
          <p className="text-gray-500 font-medium mb-4">
            Create and manage marketing campaigns for organized content
            strategy.
          </p>
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-md hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            View All Campaigns
          </button>
        </div>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-md shadow-md p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">
          Campaign Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Campaign Name
              </label>
              <div className="p-3 bg-gray-50 rounded-md">{campaign.name}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Industry
              </label>
              <div className="p-3 bg-gray-50 rounded-md">
                {campaign.industry}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Website
              </label>
              <div className="p-3 bg-gray-50 rounded-md">
                {campaign.website}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Brand Tone
              </label>
              <div className="p-3 bg-gray-50 rounded-md ">
                {campaign.brand_tone || campaign.brandTone || "Not set"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Target Audience
              </label>
              <div className="p-3 bg-gray-50 rounded-md">
                {campaign.target_audience ||
                  campaign.targetAudience ||
                  "Not set"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Platforms
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md">
                {campaign.platforms?.map((platform) => (
                  <span
                    key={platform}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full "
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onEditCampaign}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Campaign Details
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Building2 className="w-8 h-8 animate-pulse text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              Loading campaign dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {campaign.name}
              </h1>
              <p className="text-gray-500 font-medium">{campaign.industry}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-500 font-medium hover:text-slate-800 transition-colors"
          >
            ← Back to Campaigns
          </button>
        </div>
      </div>

      {/* Navigation */}
      <NavigationTabs />

      {/* Main Content */}
      <div className="min-h-[600px]">
        {activeView === "overview" && <OverviewView />}
        {activeView === "analytics" && <AnalyticsView />}
        {activeView === "posts" && <PostsView />}
        {activeView === "campaigns" && <CampaignsView />}
        {activeView === "settings" && <SettingsView />}
      </div>
    </div>
  );
};

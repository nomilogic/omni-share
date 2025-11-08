import React, { useState, useEffect } from "react";
import { PostCalendar } from "./PostCalendar";
import { AIScheduleGenerator } from "./AIScheduleGenerator";
import { ContentInput } from "./ContentInput";
import {
  scheduleService,
  scheduleUtils,
  type ScheduleRequest,
  type GeneratedSchedule,
  type ScheduledPost,
} from "../lib/scheduleService";
import {
  Calendar,
  Plus,
  BarChart3,
  Settings,
  Sparkles,
  Clock,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

interface PostScheduleDashboardProps {
  campaignId: string;
  campaignData?: any;
}

type ActiveView = "calendar" | "generator" | "analytics" | "create";

export const PostScheduleDashboard: React.FC<PostScheduleDashboardProps> = ({
  campaignId,
  campaignData,
}) => {
  const [activeView, setActiveView] = useState<ActiveView>("calendar");
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // State for filtering posts
  const [isLoading, setIsLoading] = useState(true); // State for post list loading

  // Load scheduled posts on component mount
  useEffect(() => {
    loadScheduledPosts();
    loadAnalytics();
  }, [campaignId]);

  const loadScheduledPosts = async () => {
    try {
      setLoading(true);
      setIsLoading(true); // Set loading for post list
      const posts = await scheduleService.getScheduledPosts(campaignId);
      setScheduledPosts(
        posts.map((post) => ({ ...post, scheduledDate: new Date(post.date) }))
      ); // Ensure scheduledDate is a Date object
    } catch (error) {
      console.error("Failed to load scheduled posts:", error);
    } finally {
      setLoading(false);
      setIsLoading(false); // Unset loading for post list
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await scheduleService.getSchedulingAnalytics(campaignId);
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
  };

  const handleGenerateSchedule = async (
    request: ScheduleRequest
  ): Promise<GeneratedSchedule[]> => {
    try {
      setIsGeneratingSchedule(true);
      const schedule = await scheduleService.generateSchedule({
        ...request,
        campaignId,
      });
      return schedule;
    } catch (error) {
      console.error("Failed to generate schedule:", error);
      throw error;
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const handleApproveSchedule = async (schedule: GeneratedSchedule[]) => {
    try {
      await scheduleService.saveSchedule(schedule);
      await loadScheduledPosts();
      await loadAnalytics();
      setActiveView("calendar");
    } catch (error) {
      console.error("Failed to save schedule:", error);
    }
  };

  const handleCreatePost = (date: Date) => {
    setSelectedDate(date);
    setActiveView("create");
  };

  const handleEditPost = async (post: ScheduledPost) => {
    // For now, we'll implement this as switching to create view with pre-filled data
    setSelectedDate(new Date(post.date));
    setActiveView("create");
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await scheduleService.deleteScheduledPost(postId);
      await loadScheduledPosts();
      await loadAnalytics();
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleViewPost = (post: ScheduledPost) => {
    // The PostPreview modal in PostCalendar handles this
  };

  const handleCreateScheduledPost = async (postData: any) => {
    try {
      if (!selectedDate) return;

      const newPost: Omit<ScheduledPost, "id" | "createdAt" | "updatedAt"> = {
        date: scheduleUtils.formatDate(selectedDate),
        time: postData.scheduledTime || "09:00",
        content: postData.content,
        imageUrl: postData.imageUrl,
        platform: postData.platforms || ["linkedin"],
        status: "scheduled",
        category: postData.category,
        campaignId,
        isLive: false,
      };

      await scheduleService.createScheduledPost(newPost);
      await loadScheduledPosts();
      await loadAnalytics();
      setActiveView("calendar");
      setSelectedDate(null);
    } catch (error) {
      console.error("Failed to create scheduled post:", error);
    }
  };

  // Filter posts based on the selected filter
  const filteredPosts = scheduledPosts.filter((post) => {
    if (filter === "all") return true;
    return post.status === filter;
  });

  const NavigationTabs = () => (
    <div className="flex space-x-1 theme-bg-secondary p-1 rounded-md">
      <button
        onClick={() => setActiveView("calendar")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          activeView === "calendar"
            ? "theme-bg-primary theme-text-secondary shadow-sm"
            : "theme-text-light hover:theme-text-primary"
        }`}
      >
        <Calendar className="w-4 h-4" />
        Calendar
      </button>

      <button
        onClick={() => setActiveView("generator")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          activeView === "generator"
            ? "theme-bg-accent theme-text-secondary shadow-sm"
            : "theme-text-light hover:theme-text-primary"
        }`}
      >
        <Sparkles className="w-4 h-4" />
        AI Generator
      </button>

      <button
        onClick={() => setActiveView("analytics")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          activeView === "analytics"
            ? "theme-bg-accent theme-text-secondary shadow-sm"
            : "theme-text-light hover:theme-text-primary"
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        Analytics
      </button>

      <button
        onClick={() => setActiveView("create")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          activeView === "create"
            ? "theme-bg-accent theme-text-secondary shadow-sm"
            : "theme-text-light hover:theme-text-primary"
        }`}
      >
        <Plus className="w-4 h-4" />
        Create Post
      </button>
    </div>
  );

  const AnalyticsView = () => {
    if (!analytics)
      return <div className="theme-text-light">Loading analytics...</div>;

    // Mock stats for the example, replace with actual analytics data
    const stats = {
      total: analytics.totalScheduled || 0,
      thisWeek: analytics.thisWeek || 0, // Assuming analytics provides this data
      published: analytics.totalPublished || 0,
    };

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="theme-bg-card p-6 rounded-md backdrop-blur-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium theme-text-light">
                  Total Scheduled
                </p>
                <p className="text-2xl font-bold theme-text-primary">
                  {stats.total}
                </p>
              </div>
              <Calendar
                className="w-8 h-8"
                style={{ color: "var(--theme-primary)" }}
              />
            </div>
          </div>

          <div className="theme-bg-card p-6 rounded-md backdrop-blur-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium theme-text-light">
                  This Week
                </p>
                <p className="text-2xl font-bold theme-text-primary">
                  {stats.thisWeek}
                </p>
              </div>
              <Clock
                className="w-8 h-8"
                style={{ color: "var(--theme-secondary)" }}
              />
            </div>
          </div>

          <div className="theme-bg-card p-6 rounded-md backdrop-blur-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium theme-text-light">
                  Published
                </p>
                <p className="text-2xl font-bold theme-text-primary">
                  {stats.published}
                </p>
              </div>
              <CheckCircle
                className="w-8 h-8"
                style={{ color: "var(--theme-accent)" }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="theme-bg-card rounded-md p-6">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">
              Posts by Platform
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.postsByPlatform || {}).map(
                ([platform, count]) => (
                  <div
                    key={platform}
                    className="flex justify-between items-center"
                  >
                    <span className=" theme-text-light">{platform}</span>
                    <span className="font-semibold theme-text-primary">
                      {count as number}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="theme-bg-card rounded-md p-6">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">
              Posts by Category
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.postsByCategory || {}).map(
                ([category, count]) => (
                  <div
                    key={category}
                    className="flex justify-between items-center"
                  >
                    <span className=" theme-text-light">
                      {category || "General"}
                    </span>
                    <span className="font-semibold theme-text-primary">
                      {count as number}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="theme-bg-card rounded-md p-6">
          <h3 className="text-lg font-semibold theme-text-primary mb-4">
            Upcoming Posts
          </h3>
          <div className="space-y-3">
            {analytics.upcomingPosts?.slice(0, 5).map((post: ScheduledPost) => (
              <div
                key={post.id}
                className="flex justify-between items-start p-3 theme-bg-secondary rounded-md"
              >
                <div className="flex-1">
                  <p className="font-medium theme-text-primary truncate">
                    {post.content.slice(0, 60)}...
                  </p>
                  <p className="text-sm theme-text-light">
                    {new Date(post.date).toLocaleDateString()} at{" "}
                    {scheduleUtils.formatTime(post.time)}
                  </p>
                </div>
                <div className="flex gap-1">
                  {post.platform.map((platform) => (
                    <span
                      key={platform}
                      className="px-2 py-1 theme-bg-accent theme-text-secondary text-xs rounded-full"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin theme-text-primary mx-auto mb-4" />
          <p className="theme-text-light">Loading your post schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold theme-text-primary">
            Post Schedule Manager
          </h1>
          <p className="theme-text-light mt-1">
            Plan, schedule, and manage your social media content with AI
            assistance
          </p>
        </div>

        <div className="flex items-center gap-4">
          {analytics && (
            <div className="text-center">
              <p className="text-2xl font-bold theme-text-primary">
                {analytics.totalScheduled}
              </p>
              <p className="text-sm theme-text-light">Posts Scheduled</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <NavigationTabs />

      {/* Main Content */}
      <div className="min-h-[600px]">
        {activeView === "calendar" && (
          <PostCalendar
            scheduledPosts={scheduledPosts}
            onCreatePost={handleCreatePost}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onViewPost={handleViewPost}
            campaignId={campaignId}
          />
        )}

        {activeView === "generator" && (
          <AIScheduleGenerator
            onGenerateSchedule={handleGenerateSchedule}
            onApproveSchedule={handleApproveSchedule}
            campaignData={campaignData}
            isGenerating={isGeneratingSchedule}
          />
        )}

        {activeView === "analytics" && <AnalyticsView />}

        {activeView === "create" && (
          <div className="theme-bg-card rounded-md p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold theme-text-primary mb-2">
                Create Scheduled Post
              </h2>
              {selectedDate && (
                <p className="theme-text-light">
                  Scheduled for: {selectedDate.toLocaleDateString()}
                </p>
              )}
            </div>

            <ContentInput
              onGenerate={handleCreateScheduledPost}
              campaignData={campaignData}
              initialPlatforms={["linkedin"]}
              showScheduling={true}
              scheduledDate={selectedDate}
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setActiveView("calendar");
                  setSelectedDate(null);
                }}
                className="px-4 py-2 theme-border text-theme-text-light rounded-md hover:theme-bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Scheduled Posts List */}
        <div className="theme-bg-card rounded-md backdrop-blur-lg">
          <div
            className="p-6"
            style={{ borderBottom: "1px solid var(--theme-border)" }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold theme-text-primary">
                Scheduled Posts
              </h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="theme-input rounded-md px-3 py-1 text-sm focus:outline-none"
              >
                <option value="all">All Posts</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          <div style={{ borderColor: "var(--theme-border)" }}>
            {isLoading ? (
              <div className="p-6 text-center">
                <p className="theme-text-light">Loading scheduled posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-6 text-center">
                <p className="theme-text-light">No scheduled posts found.</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-6"
                  style={{ borderBottom: "1px solid var(--theme-border)" }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium theme-text-primary mb-2 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center space-x-4 text-sm theme-text-light">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(post.scheduledDate, "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{format(post.scheduledDate, "h:mm a")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{post.platforms.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full theme-bg-primary theme-text-secondary`}
                      >
                        {post.status}
                      </span>
                      <div className="flex space-x-1">
                        <button className="p-1 theme-text-light hover:theme-text-primary">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 theme-text-light hover:theme-text-primary">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 theme-text-light hover:opacity-80"
                          style={{ color: "var(--theme-accent)" }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Platform } from "../types";
import {
  ExternalLink,
  Clock,
  Eye,
  EyeOff,
  Image,
  Video,
  FileText,
  Filter,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { historyRefreshService } from "../services/historyRefreshService";
import { getPlatformIcon, getPlatformColors } from "../utils/platformIcons";
import API from "../services/api";

// Export interface for external access
export interface HistoryPageRef {
  refreshHistory: () => Promise<void>;
}

// Interface for post history items
interface PostHistoryItem {
  id: string;
  platform: Platform;
  postId: string;
  postUrl: string;
  content: string;
  publishedAt: string;
  isRead: boolean;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  thumbnailUrl?: string;
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
    thumbnail?: string;
    platform_image?: string;
    likes?: number;
    shares?: number;
    comments?: number;
  };
}

// Filter and sort types
type ReadFilter = "all" | "read" | "unread";
type PlatformFilter = "all" | Platform;
type TimePeriod = "all" | "today" | "week" | "month";
type SortBy = "date_desc" | "date_asc" | "platform_asc" | "platform_desc";

export const HistoryPage = forwardRef<HistoryPageRef>((props, ref) => {
  const [posts, setPosts] = useState<PostHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date_desc");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPostHistory();
  }, []);

  // Register with global history refresh service
  useEffect(() => {
    const refreshCallback = async () => {
      console.log("📋 Post history refresh triggered from global service");
      setLoading(true);
      await fetchPostHistory();
    };

    const unregister =
      historyRefreshService.registerRefreshCallback(refreshCallback);

    // Cleanup on unmount
    return unregister;
  }, []);

  const fetchPostHistory = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      const response = await API.getHistory();

      const data = await response.data.data;
      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching post history:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch post history"
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (postId: string) => {
    try {
      await API.readHistoryById(postId);

      // Update local state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, isRead: true } : post
        )
      );

      // Trigger global refresh to update unread counter in navigation
      console.log("📖 Post marked as read, triggering unread count refresh...");
      historyRefreshService.refreshHistory();
    } catch (error) {
      console.error("Error marking post as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.readAllHistory();

      setPosts((prevPosts) =>
        prevPosts.map((post) => ({ ...post, isRead: true }))
      );

      historyRefreshService.refreshHistory();
    } catch (error) {
      console.error("Error marking all posts as read:", error);
    }
  };

  // Reset all filters to default
  const resetFilters = () => {
    setReadFilter("all");
    setPlatformFilter("all");
    setTimePeriod("all");
    setSortBy("date_desc");
  };

  // Check if any filters are active (non-default)
  const hasActiveFilters =
    readFilter !== "all" ||
    platformFilter !== "all" ||
    timePeriod !== "all" ||
    sortBy !== "date_desc";

  // Don't refetch data when filters change - handle all filtering client-side
  // This improves performance and provides instant filtering

  const renderPlatformIcon = (platform: Platform) => {
    const IconComponent = getPlatformIcon(platform);
    const colorClasses = getPlatformColors(platform);

    if (!IconComponent) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {platform.slice(0, 2).toUpperCase()}
          </span>
        </div>
      );
    }

    // Extract background color from the color classes
    const bgColorMatch = colorClasses.match(/bg-[\w-]+/);
    const bgColor = bgColorMatch ? bgColorMatch[0] : "bg-gray-600";

    return (
      <div
        className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center`}
      >
        <IconComponent className="w-5 h-5 text-white" />
      </div>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Get thumbnail URL from multiple possible sources
  const getThumbnailUrl = (post: PostHistoryItem) => {
    return (
      post.thumbnailUrl ||
      post.metadata?.thumbnail ||
      post.metadata?.image ||
      post.mediaUrl ||
      null
    );
  };

  // Detect media type from URL or provided type
  const getMediaType = (post: PostHistoryItem): "image" | "video" | "text" => {
    if (post.mediaType) return post.mediaType;

    const thumbnailUrl = getThumbnailUrl(post);
    if (!thumbnailUrl) return "text";

    // Check file extension
    const url = thumbnailUrl.toLowerCase();
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return "image";
    if (url.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv)$/)) return "video";

    // YouTube video detection
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "video";

    return "image"; // Default to image for unknown types
  };

  // Render media thumbnail with proper fallbacks
  const renderThumbnail = (post: PostHistoryItem) => {
    const thumbnailUrl = getThumbnailUrl(post);
    const mediaType = getMediaType(post);

    if (!thumbnailUrl) {
      // Don't show anything for text posts
      if (mediaType === "text") {
        return null;
      }

      // Show media type icon only for image/video posts without thumbnails
      const IconComponent = mediaType === "video" ? Video : Image;

      return (
        <div className="flex-shrink-0 w-32 h-24 bg-gray-100 border-r border-gray-200 flex items-center justify-center">
          <IconComponent className="w-8 h-8 text-gray-400" />
        </div>
      );
    }

    return (
      <div className="flex-shrink-0 w-32 h-24 bg-gray-200 border-r border-gray-200 relative">
        <img
          src={thumbnailUrl}
          alt="Post thumbnail"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Replace with fallback icon on error
            const target = e.currentTarget;
            const parent = target.parentElement;
            if (parent) {
              const IconComponent = mediaType === "video" ? Video : Image;
              parent.innerHTML = `
                <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${
                      mediaType === "video"
                        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>'
                        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>'
                    }
                  </svg>
                </div>
              `;
            }
          }}
        />
        {/* Video play indicator */}
        {mediaType === "video" && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-l-4 border-r-0 border-t-2 border-b-2 border-transparent border-l-gray-700 ml-1"></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Expose refresh function through ref
  useImperativeHandle(
    ref,
    () => ({
      refreshHistory: async () => {
        console.log("📋 Refreshing post history...");
        setLoading(true);
        await fetchPostHistory();
      },
    }),
    []
  );

  // Apply client-side filtering as fallback (in case server-side filtering isn't working perfectly)
  let filteredPosts = posts;

  // Apply read filter
  if (readFilter === "read") {
    filteredPosts = filteredPosts.filter((post) => post.isRead);
  } else if (readFilter === "unread") {
    filteredPosts = filteredPosts.filter((post) => !post.isRead);
  }

  // Apply platform filter
  if (platformFilter !== "all") {
    filteredPosts = filteredPosts.filter(
      (post) => post.platform === platformFilter
    );
  }

  // Apply time period filter
  if (timePeriod !== "all") {
    const now = new Date();
    const filterDate = new Date();

    switch (timePeriod) {
      case "today":
        filterDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
    }

    filteredPosts = filteredPosts.filter((post) => {
      const postDate = new Date(post.publishedAt);
      return postDate >= filterDate;
    });
  }

  // Apply sorting
  filteredPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "date_asc":
        return (
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        );
      case "date_desc":
        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      case "platform_asc":
        return a.platform.localeCompare(b.platform);
      case "platform_desc":
        return b.platform.localeCompare(a.platform);
      default:
        return 0;
    }
  });

  const unreadCount = posts.filter((post) => !post.isRead).length;
  const availablePlatforms = Array.from(
    new Set(posts.map((post) => post.platform))
  );

  if (loading) {
    return (
      <div className="theme-bg-light h-fit  x-2">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="">
            <h2 className="text-3xl font-semibold theme-text-primary mb-1">
              Post History
            </h2>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading post history...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-fit px-0 lg:px-2 ">
      {/* Header */}
      <div className="">
        <div className="flex items-center justify-between max-w-4xl mx-auto mb-6">
          <div>
            <h2 className="text-3xl font-semibold theme-text-primary mb-1">
              Post History
            </h2>

            <p className="text-sm theme-text-primary">
              View all your published posts across platforms
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            {unreadCount == 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs px-2 py-1 rounded-full theme-bg-quaternary theme-text-secondary hover:bg-blue-200 transition-colors"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Read Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Read Status
                </label>
                <select
                  value={readFilter}
                  onChange={(e) => setReadFilter(e.target.value as ReadFilter)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Posts</option>
                  <option value="unread">Unread ({unreadCount})</option>
                  <option value="read">
                    Read ({posts.length - unreadCount})
                  </option>
                </select>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  value={platformFilter}
                  onChange={(e) =>
                    setPlatformFilter(e.target.value as PlatformFilter)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Platforms</option>
                  {availablePlatforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period
                </label>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="platform_asc">Platform A-Z</option>
                  <option value="platform_desc">Platform Z-A</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 text-sm px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {hasActiveFilters && (
          <div className="max-w-4xl mx-auto mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Showing:</span>
              {readFilter !== "all" && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {readFilter === "read" ? "Read posts" : "Unread posts"}
                </span>
              )}
              {platformFilter !== "all" && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                  {platformFilter.charAt(0).toUpperCase() +
                    platformFilter.slice(1)}
                </span>
              )}
              {timePeriod !== "all" && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                  {timePeriod === "today"
                    ? "Today"
                    : timePeriod === "week"
                    ? "Last 7 days"
                    : "Last 30 days"}
                </span>
              )}
              <span className="text-gray-500">
                • {filteredPosts.length} posts
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="w-full lg:max-w-4xl mx-auto ">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Clock className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {hasActiveFilters
                ? "No posts match your filters"
                : "No posts yet"}
            </h3>
            <p className="text-gray-600">
              {hasActiveFilters
                ? "Try adjusting your filters to see more posts"
                : "Your published posts will appear here"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className={`bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 ${
                  !post.isRead
                    ? "border-blue-200 bg-blue-50/30"
                    : "border-gray-200"
                }`}
              >
                {/* Post Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {renderPlatformIcon(post.platform)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 capitalize">
                          {post.platform}
                        </span>
                        {!post.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(post.publishedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => !post.isRead && markAsRead(post.id)}
                      className={`p-1 rounded-full transition-colors ${
                        post.isRead
                          ? "text-gray-400"
                          : "text-blue-600 hover:bg-blue-100"
                      }`}
                      title={post.isRead ? "Read" : "Mark as read"}
                    ></button>
                    <a
                      href={post.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Open original post"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <a
                  href={post.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-50 transition-colors"
                  onClick={() => !post.isRead && markAsRead(post.id)}
                >
                  <div className="flex">
                    {renderThumbnail(post)}

                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                            {post.metadata?.title || post.content}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {post.metadata?.description || post.content}
                          </p>
                          <p className="text-xs text-gray-500 mb-2 capitalize">
                            {post.platform} •{" "}
                            {post.postUrl && new URL(post.postUrl).hostname}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// Add display name for better debugging
HistoryPage.displayName = "HistoryPage";

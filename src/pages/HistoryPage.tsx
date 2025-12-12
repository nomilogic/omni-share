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
import { useTranslation } from "react-i18next";
import { Icon } from "@/components";
import { useAppContext } from "@/context/AppContext";

// Export inter  for external access
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
  const { t, i18n } = useTranslation();
  const { setUnreadCount } = useAppContext();

  // Filter states
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date_desc");
  const [showFilters, setShowFilters] = useState(false);
  const [loader, setLoader] = useState(true);
  useEffect(() => {
    markAllAsRead();
  }, []);

  const fetchPostHistory = async () => {
    try {
      const response = await API.getHistory();
      const data = await response.data.data;
      setPosts(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch post history"
      );
    } finally {
      setTimeout(() => setLoader(false), 500);
    }
  };

  const markAsRead = async (postId: string) => {
    try {
      await API.readHistoryById(postId);

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, isRead: true } : post
        )
      );

      historyRefreshService.refreshHistory();
    } catch (error) {
      console.error("Error marking post as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      fetchPostHistory();
      setPosts((prevPosts) =>
        prevPosts.map((post) => ({ ...post, isRead: true }))
      );
      await API.readAllHistory();
      await historyRefreshService.refreshHistory();
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all posts as read:", error);
    }
  };
  const resetFilters = () => {
    setReadFilter("all");
    setPlatformFilter("all");
    setTimePeriod("all");
    setSortBy("date_desc");
  };

  const hasActiveFilters =
    readFilter !== "all" ||
    platformFilter !== "all" ||
    timePeriod !== "all" ||
    sortBy !== "date_desc";

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

    const bgColorMatch = colorClasses.match(/bg-[\w-]+/);
    const bgColor = bgColorMatch ? bgColorMatch[0] : "bg-blue-600";

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
      <div className=" flex-shrink-0 w-32 p-1 bg-gray-300 border-r border-gray-200 relative">
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

  let filteredPosts = posts;

  if (readFilter === "read") {
    filteredPosts = filteredPosts.filter((post) => post.isRead);
  } else if (readFilter === "unread") {
    filteredPosts = filteredPosts.filter((post) => !post.isRead);
  }

  if (platformFilter !== "all") {
    filteredPosts = filteredPosts.filter(
      (post) => post.platform === platformFilter
    );
  }

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

  return (
    <div className="h-fit p-4 py-2 ">
      <div>
        <div className=" max-w-5xl mx-auto mb-6">
          <div className="flex justify-between items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t("post_history")}
            </h2>
            {/* <h2 className="text-3xl font-bold text-gray-900 ">Post History</h2> */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md border transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-purple-600  text-purple-600 "
              }`}
            >
              <Filter className="w-3 h-3" />
              {t("filters")}
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

        {showFilters && (
          <div className="w-full mb-6 p-4 bg-white border border-gray-200 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Read Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("read_status")}
                </label>
                <select
                  value={readFilter}
                  onChange={(e) => setReadFilter(e.target.value as ReadFilter)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-500"
                >
                  <option value="all">{t("all_posts")}</option>
                  <option value="unread">
                    {t("unread")} ({unreadCount})
                  </option>
                  <option value="read">
                    {t("read")} ({posts.length - unreadCount})
                  </option>
                </select>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("platform")}
                </label>
                <select
                  value={platformFilter}
                  onChange={(e) =>
                    setPlatformFilter(e.target.value as PlatformFilter)
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-500"
                >
                  <option value="all">{t("all_platforms")}</option>
                  {availablePlatforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("time_period")}
                </label>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-500"
                >
                  <option value="all">{t("all_time")}</option>
                  <option value="today">{t("today")}</option>
                  <option value="week">{t("last_7_days")}</option>
                  <option value="month">{t("last_30_days")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("sort_by")}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-500"
                >
                  <option value="date_desc">{t("newest_first")}</option>
                  <option value="date_asc">{t("oldest_first")}</option>
                  <option value="platform_asc">{t("platform_a_z")}</option>
                  <option value="platform_desc">{t("platform_z_a")}</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 text-sm px-3 py-1 text-gray-500 font-medium hover:text-slate-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t("reset_filters")}
                </button>
              </div>
            )}
          </div>
        )}

        {hasActiveFilters && (
          <div className=" mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <span>{t("showing")}:</span>
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
              <span className="text-gray-500 font-medium">
                • {filteredPosts.length} posts
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="w-full  mx-auto ">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {loader ? (
          <div className=" flex flex-col justify-center items-center min-h-[50vh]">
            <Icon name="spiral-logo" size={45} className="animate-spin" />
            <p className="mt-1 text-base font-medium text-gray-500">
              {t("loading_history")}
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-purple-600 mb-4">
              <Clock className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {hasActiveFilters ? t("no_posts_match") : t("no_posts_yet")}
            </h3>
            <p className="text-gray-500 font-medium">
              {hasActiveFilters
                ? t("adjust_filters")
                : t("published_posts_here")}
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
                className={`bg-white border rounded-md overflow-hidden hover:shadow-md transition-all duration-200 ${
                  !post.isRead ? " bg-blue-50/30" : "border-gray-100"
                }`}
              >
                {/* Post Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {renderPlatformIcon(post.platform)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 ">
                          {post.platform}
                        </span>
                        {!post.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
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
                      className="p-1 rounded-full text-gray-500 font-medium hover:text-blue-600 hover:bg-blue-100 transition-colors"
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
                          <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-1">
                            {post.metadata?.title || post.content}
                          </h3>
                          <p className="text-gray-500 font-medium text-sm line-clamp-2 mb-2">
                            {post.metadata?.description || post.content}
                          </p>
                          <p className="text-xs text-gray-500 font-medium mb-2 ">
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

HistoryPage.displayName = "HistoryPage";

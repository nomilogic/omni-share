import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Edit,
  Plus,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface ScheduledPost {
  id: string;
  date: string;
  time: string;
  content: string;
  imageUrl?: string;
  platform: string[];
  status: "scheduled" | "draft" | "published" | "failed";
  isLive?: boolean; // Posts generated dynamically on that day
  category?: string;
  campaignId: string;
}

interface CalendarDay {
  date: Date;
  posts: ScheduledPost[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

interface PostCalendarProps {
  scheduledPosts: ScheduledPost[];
  onCreatePost: (date: Date) => void;
  onEditPost: (post: ScheduledPost) => void;
  onDeletePost: (postId: string) => void;
  onViewPost: (post: ScheduledPost) => void;
  campaignId: string;
}

export const PostCalendar: React.FC<PostCalendarProps> = ({
  scheduledPosts,
  onCreatePost,
  onEditPost,
  onDeletePost,
  onViewPost,
  campaignId,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const today = new Date();

  // Get calendar days for current month
  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days: CalendarDay[] = [];

    for (let i = 0; i < 42; i++) {
      // 6 weeks * 7 days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayPosts = scheduledPosts.filter((post) => {
        const postDate = new Date(post.date);
        return postDate.toDateString() === date.toDateString();
      });

      days.push({
        date,
        posts: dayPosts,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today,
      });
    }

    return days;
  };

  const calendarDays = getCalendarDays();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const getStatusColor = (status: ScheduledPost["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "draft":
        return "bg-gray-100 text-slate-800 border-gray-200";
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-slate-800 border-gray-200";
    }
  };

  const PostPreviewModal = ({ post }: { post: ScheduledPost }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="theme-primary-bg rounded-md max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-slate-900">
              Scheduled Post - {new Date(post.date).toLocaleDateString()}
            </h3>
            <button
              onClick={() => setSelectedPost(null)}
              className="text-gray-500 font-medium hover:text-slate-700 p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Status
              </label>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                  post.status
                )}`}
              >
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                {post.isLive && <span className="ml-1">🔴 Live</span>}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Scheduled Time
              </label>
              <p className="text-slate-900">{post.time}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Platforms
              </label>
              <div className="flex gap-2">
                {post.platform.map((platform) => (
                  <span
                    key={platform}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Content
              </label>
              <div className="border rounded-md p-3 bg-gray-50">
                <p className="whitespace-pre-wrap">{post.content}</p>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post image"
                    className="mt-2 max-w-full h-48 object-cover rounded-md"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => {
                  onEditPost(post);
                  setSelectedPost(null);
                }}
                className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Post
              </button>
              <button
                onClick={() => {
                  onDeletePost(post.id);
                  setSelectedPost(null);
                }}
                className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="theme-bg-primary rounded-md shadow-md p-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-6 h-6 theme-text-secondary" />
          <h2 className="text-2xl font-bold text-white">Post Calendar</h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 theme-text-primary hover:text-slate-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h3 className="text-xl font-semibold theme-text-primary min-w-[200px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>

          <button
            onClick={() => navigateMonth("next")}
            className="p-2 theme-text-primary hover:text-white hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-3 text-center font-medium text-white border-b"
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`min-h-[120px] p-2 border border-gray-200 ${
              !day.isCurrentMonth
                ? "theme-bg-card theme-text-primary opacity-30"
                : "theme-bg-card"
            } ${
              day.isToday
                ? "theme-bg-secondary border-blue-300 theme-text-secondry"
                : "theme-text-primary"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className={`text-sm font-medium ${
                  day.isToday ? "theme-text-secondary" : "theme-text-primary"
                }`}
              >
                {day.date.getDate()}
              </span>

              {day.isCurrentMonth && !day.isPast && (
                <button
                  onClick={() => onCreatePost(day.date)}
                  className="p-1 text-white hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Add post"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Posts for this day */}
            <div className="space-y-1">
              {day.posts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity border ${getStatusColor(
                    post.status
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate flex-1">
                      {post.time} {post.isLive ? "🔴" : ""}
                    </span>
                    <Eye className="w-3 h-3 ml-1" />
                  </div>
                  <div className="truncate">{post.content.slice(0, 30)}...</div>
                </div>
              ))}

              {day.posts.length > 3 && (
                <div className="text-xs text-gray-500 font-medium text-center py-1">
                  +{day.posts.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Post Preview Modal */}
      {selectedPost && <PostPreviewModal post={selectedPost} />}
    </div>
  );
};

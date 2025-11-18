import { useAppContext } from "../../context/AppContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
} from "../../utils/platformIcons";
import { Platform } from "../../types";

function RecentPosts({ post }: any) {
  const { state } = useAppContext();
  const navigate = useNavigate();

  const allPosts = post || state?.generatedPosts || [];
  const socialPlatforms: Platform[] = [
    "linkedin",
    "facebook",
    "instagram",
    "youtube",
    "tiktok",
  ];

  const [selectedPlatform, setSelectedPlatform] = useState<Platform | "all">(
    allPosts[0]?.platform || "all"
  );

  // Get only the top (latest) post for the selected platform
  const topPost =
    selectedPlatform === "all"
      ? allPosts[0]
      : allPosts.find((p: any) => p.platform == selectedPlatform);

  if (!topPost) {
    return (
      <div className="bg-gray-100 rounded-md p-5 flex items-center justify-center h-full w-full text-gray-500">
        No posts available
      </div>
    );
  }

  const {
    content,
    postUrl,
    publishedAt,
    metadata: {
      title,
      description,
      likes,
      views,
      shares,
      comments,
      platform_image,
    } = {},
  } = topPost;

  const getFormattedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gray-100 rounded-md p-5 flex flex-col h-full w-full">
      {/* Platform Filters */}
      <div className="flex gap-3 mb-5">
        {socialPlatforms.map((platform, i) => {
          const IconComponent = getPlatformIcon(platform);
          const bgColor = getPlatformIconBackgroundColors(platform);
          const isActive = selectedPlatform === platform;

          return (
            <button
              key={i}
              onClick={() => setSelectedPlatform(platform)}
              className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white transition-transform hover:scale-110 ${
                isActive ? "ring-2 ring-[#7650e3] bg-purple-500" : bgColor
              }`}
            >
              <IconComponent className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {/* Top Post */}
      <div className="flex-1 mb-5 h-full bg-white shadow-md rounded-md p-4 flex flex-col">
        {/* Platform Image */}
        {platform_image && (
          <div className="flex items-center mb-3 gap-2">
            <img
              src={platform_image}
              alt={selectedPlatform}
              className="w-6 h-6 rounded-full"
            />
            <span className="font-semibold capitalize">{selectedPlatform}</span>
            <span className="text-gray-400 text-sm ml-auto">
              {getFormattedDate(publishedAt)}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-gray-800 font-bold text-lg mb-2">
          {title || "No Title"}
        </h3>

        {/* Description / Content */}
        <p className="text-gray-700 text-sm mb-3">
          {description || content || "No content available"}
        </p>

        {/* Post Link */}
        {postUrl && (
          <a
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm mb-3"
          >
            View Post
          </a>
        )}
      </div>

      <button
        onClick={() => navigate("/content")}
        className="w-full text-white py-2.5 px-4 rounded-md font-semibold text-md transition-all border-2 border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] mt-4"
      >
        Create Post
      </button>
    </div>
  );
}

export default RecentPosts;

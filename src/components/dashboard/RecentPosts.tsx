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

  const topPost =
    selectedPlatform === "all"
      ? allPosts[0]
      : allPosts.find((p: any) => p.platform === selectedPlatform);

  // Safely destructure values from topPost
  const {
    content = "",
    postUrl = "",
    metadata: { title = "", description = "" } = {},
  } = topPost || {};

  return (
    <div className="bg-gray-100 rounded-md p-5 flex flex-col  w-full">
      <div className="flex gap-3 mb-3">
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

      {!topPost ? (
        <div className="bg-gray-100 rounded-md p-5 flex items-center justify-center h-full w-full text-gray-500">
          No posts available
        </div>
      ) : (
        <div className="flex-1  h-full bg-white shadow-md rounded-md px-3 py-2 flex flex-col">
          <h3 className="text-gray-800 font-bold text-lg mb-2">
            {title || "No Title"}
          </h3>

          <p className="text-gray-700 text-sm mb-3">
            {description || content || "No content available"}
          </p>

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
      )}

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

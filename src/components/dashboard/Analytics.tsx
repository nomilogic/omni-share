import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
} from "../../utils/platformIcons";
import { Platform } from "../../types";

function Analytics() {
  const { state } = useAppContext();
  const navigate = useNavigate();

  const topPosts = state?.generatedPosts?.slice(0, 3) || [];
  const socialPlatforms: Platform[] = [
    "linkedin",
    "facebook",
    "instagram",
    "youtube",
    "tiktok",
  ];

  return (
    <div className="bg-gray-100 rounded-2xl   p-5 flex flex-col w-full h-full">
      <div className="flex gap-3 mb-3">
        {socialPlatforms.map((platform, i) => {
          const IconComponent = getPlatformIcon(platform);
          const bgColor = getPlatformIconBackgroundColors(platform);
          return (
            <div
              key={i}
              className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white ${bgColor}`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
          );
        })}
      </div>

      <div>
        <h4 className="font-medium text-black text-base">Summary</h4>
        <p className="text-xs text-black mb-3 font-medium ">Last 28 days</p>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-black font-medium">Views</span>
            <span className="text-xs font-semibold text-purple-600">100</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-black font-medium">
              Impressions click-through rate
            </span>
            <span className="text-xs font-semibold text-purple-600 ml-1">
              2.1%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-black font-medium">
              Average view duration
            </span>
            <span className="text-xs font-semibold text-purple-600">100</span>
          </div>
        </div>
      </div>
      <hr className="h-[2px] bg-purple-600 mb-2 mt-3" />
      <div>
        <h4 className="font-medium text-black mb-1 text-sm">Top Post</h4>
        <p className="text-xs text-black mb-2 font-medium">Last 48 hours</p>
        <div className="space-y-1">
          {topPosts.length > 0 ? (
            topPosts.map((post, index) => (
              <p
                key={index}
                className="text-xs text-[#7650e3] hover:text-[#8a68d9] cursor-pointer underline line-clamp-1"
              >
                {post.content?.substring(0, 70) || "Generated Post"}
              </p>
            ))
          ) : (
            <>
              <p className="text-xs text-[#7650e3] underline cursor-pointer hover:text-[#8a68d9]">
                Best Tech Gadgets of 2025 You Can't Miss!
              </p>
              <p className="text-xs text-[#7650e3] underline cursor-pointer hover:text-[#8a68d9]">
                The Most Powerful Smartphones of 2025 – Ranked!
              </p>
              <p className="text-xs text-[#7650e3] underline cursor-pointer hover:text-[#8a68d9]">
                Future Tech: Devices That Feel Like Sci-Fi
              </p>
            </>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        className="w-full py-2.5 px-4 rounded-md font-semibold text-sm transition-all border-2 mt-4 text-white border-[#7650e3]  bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3]"
      >
        View Analytics
      </button>
    </div>
  );
}

export default Analytics;

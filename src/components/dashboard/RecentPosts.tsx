import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
} from "../../utils/platformIcons";
import { Platform } from "../../types";
import Referal from "../../assets/referal.png";

function RecentPosts() {
  const { state } = useAppContext();
  const navigate = useNavigate();

  // Get recent generated posts
  const recentPosts = state?.generatedPosts?.slice(0, 3) || [];
  const lastPost = recentPosts[0];
  const socialPlatforms: Platform[] = [
    "linkedin",
    "facebook",
    "instagram",
    "youtube",
    "tiktok",
  ];

  return (
    <div className="bg-slate-100 rounded-xl  p-5 flex flex-col h-full w-full">
      <div className="flex gap-3 mb-5">
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

      <div className="flex-1 mb-5 h-full">
        {lastPost?.image ? (
          <div className="relative rounded-lg overflow-hidden h-full">
            <img
              src={lastPost.image}
              alt="Recent Post"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1">
              <h4 className="text-white font-bold text-xs truncate">
                {lastPost.content?.substring(0, 50) || "Post Title"}...
              </h4>
            </div>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden h-full shadow-md bg-white">
            {/* Placeholder preview */}
            <div>
              <img
                src={Referal} // <--- replace with your placeholder image
                alt="Placeholder"
                className="w-full h-full object-cover"
              />

              {/* Bottom overlay exactly like your image */}
              <div className="absolute bottom-0 left-0 w-full bg-black/40 px-3 py-4">
                <span className="text-white text-sm font-semibold">
                  Post Title
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate("/content")}
        className="w-full text-white py-2.5 px-4 rounded-md font-semibold text-sm transition-all border-2 border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3]"
      >
        Create Post
      </button>
    </div>
  );
}

export default RecentPosts;

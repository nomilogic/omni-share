import { useAppContext } from "../../context/AppContext";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Published from "../../assets/Published-Post.png";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
} from "../../utils/platformIcons";
import { Platform } from "../../types";
import { useTranslation } from "react-i18next";

function RecentPosts({ post }: any) {
  const { state } = useAppContext();
  const navigate = useNavigate();

  const allPosts = post || state?.generatedPosts || [];

  const socialPlatforms: Platform[] = [
    "facebook",
    "linkedin",
    "instagram",
    "youtube",
    "tiktok",
  ];

  // ✅ Only show platforms that actually have posts
  const platformsWithData = useMemo(() => {
    const set = new Set<Platform>();
    for (const p of allPosts) {
      if (p?.platform) set.add(p.platform as Platform);
    }
    return socialPlatforms.filter((pl) => set.has(pl));
  }, [allPosts]);

  const [selectedPlatform, setSelectedPlatform] = useState<Platform | "">("");

  // ✅ keep selected platform valid (fallback to first available)
  useEffect(() => {
    const first = platformsWithData[0] || "";
    setSelectedPlatform((prev) => {
      if (prev && platformsWithData.includes(prev as Platform)) return prev;
      return first;
    });
  }, [platformsWithData]);

  const topPost = allPosts
    .filter(
      (p: any) => selectedPlatform === "" || p.platform === selectedPlatform
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  const {
    content = "",
    metadata: { title = "", description = "", image } = {},
  } = topPost || {};

  const { t } = useTranslation();

  return (
    <div className="bg-gray-100 rounded-md p-5 flex flex-col h-[450px] w-full">
      {/* ✅ Icons ONLY when a post exists, and ONLY for platforms with data */}
      {!!topPost && platformsWithData.length > 0 && (
        <div className="flex gap-3 mb-3">
          {platformsWithData.map((platform) => {
            const isActive = selectedPlatform === platform;

            return (
              <div
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white
                  ${getPlatformIconBackgroundColors(platform)}
                  ${isActive ? "opacity-100 ring-4 ring-blue-100" : "opacity-30"}
                  cursor-pointer
                `}
              >
                {getPlatformIcon(platform)({
                  className: isActive ? "w-5 h-5" : "w-4 h-4",
                })}
              </div>
            );
          })}
        </div>
      )}

      {!topPost ? (
        <div className="p-2 flex-1 flex flex-col justify-between">
    <div className="flex justify-center items-center h-[240px]">
      <img
        src={Published}
        alt="No posts"
        className="h-full w-auto object-contain"
      />
    </div>

    <div className="mt-2 text-left">
      <h3 className="text-lg font-semibold text-black">
        You haven’t published any posts.
      </h3>

      <p className="text-sm text-black mt-2 leading-relaxed">
        Click the button below to create your first post and start sharing
        content.
      </p>
    </div>
  </div>
      ) : (
        <div
          className={`flex-1 h-full shadow-md rounded-md px-3 py-2 flex flex-col ${
            image ? "bg-cover bg-center text-white" : "bg-white"
          }`}
          style={image ? { backgroundImage: `url(${image})` } : {}}
        >
          <h3 className="font-bold text-lg mb-2">{title || "No Title"}</h3>

          <p
            title={description}
            className={`text-sm mb-3 line-clamp-5 ${
              image ? "bg-black/40 p-2 rounded" : "text-gray-700"
            }`}
          >
            {description || content || "No content available"}
          </p>
        </div>
      )}

      <button
        onClick={() => navigate("/content")}
        className="w-full text-white py-2 px-4 rounded-md font-semibold text-md transition-all border-2 border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] mt-4"
      >
        {t("create_post")}
      </button>
    </div>
  );
}

export default RecentPosts;

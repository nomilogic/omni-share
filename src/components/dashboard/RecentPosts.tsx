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
  const { t } = useTranslation();

  const allPosts = post || state?.generatedPosts || [];

  const socialPlatforms: Platform[] = [
    "facebook",
    "linkedin",
    "instagram",
    "youtube",
    "tiktok",
  ];

  // ✅ platforms which actually have posts
  const platformsWithData = useMemo(() => {
    const set = new Set<Platform>();
    for (const p of allPosts) {
      if (p?.platform) set.add(p.platform as Platform);
    }
    return socialPlatforms.filter((pl) => set.has(pl));
  }, [allPosts]);

  const platformsWithDataSet = useMemo(() => {
    return new Set<Platform>(platformsWithData);
  }, [platformsWithData]);

  const [selectedPlatform, setSelectedPlatform] =
    useState<Platform>("facebook");

  // ✅ keep selected platform valid
  useEffect(() => {
    // if selected has data => keep
    if (platformsWithDataSet.has(selectedPlatform)) return;

    // else: if facebook has data => facebook
    if (platformsWithDataSet.has("facebook")) {
      setSelectedPlatform("facebook");
      return;
    }

    // else: first available
    const first = platformsWithData[0];
    if (first) setSelectedPlatform(first);
  }, [platformsWithData, platformsWithDataSet, selectedPlatform]);

  const topPost = allPosts
    .filter((p: any) => p?.platform === selectedPlatform)
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  const {
    content = "",
    metadata: { title = "", description = "", image } = {},
  } = topPost || {};

  const ext = image?.split(".")?.pop()?.toLowerCase();

  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  const isVideo = ["mp4", "mov", "avi", "webm", "mkv"].includes(ext);
  return (
    <div className="bg-gray-100 rounded-md p-5 flex flex-col h-[450px] w-full">
      {/* ✅ Show ALL icons when user has any post; disable those without data */}
      {!!allPosts?.length && (
        <div className="flex flex-wrap gap-3 mb-3">
          {socialPlatforms.map((platform) => {
            const IconComponent = getPlatformIcon(platform);
            const isActive = selectedPlatform === platform;
            const hasData = platformsWithDataSet.has(platform);

            return (
              <button
                key={platform}
                type="button"
                disabled={!hasData}
                onClick={() => {
                  if (!hasData) return;
                  setSelectedPlatform(platform);
                }}
                className={`relative p-1 rounded-full transition-all duration-200 transform h-fit
                  ${hasData ? "hover:scale-105" : ""}
                  ${
                    isActive && hasData
                      ? "ring-4 ring-blue-200 shadow-md"
                      : hasData
                      ? "hover:shadow-md"
                      : ""
                  }
                  ${hasData ? "" : "opacity-30 cursor-not-allowed"}
                `}
                title={hasData ? platform : `${platform} (no data)`}
              >
                <div
                  className={`w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center text-white shadow-md
                    ${getPlatformIconBackgroundColors(platform)}
                    ${hasData ? "" : "grayscale"}
                  `}
                >
                  {IconComponent ? (
                    <IconComponent className="w-4 md:w-5 h-4 md:h-5" />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {platform === "facebook"
                        ? "FB"
                        : platform === "instagram"
                        ? "IG"
                        : platform === "linkedin"
                        ? "IN"
                        : platform === "youtube"
                        ? "YT"
                        : platform === "tiktok"
                        ? "TT"
                        : "P"}
                    </span>
                  )}
                </div>

                {isActive && hasData && (
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {!topPost ? (
        <div className="p-2 flex-1 flex flex-col ">
          <div className="flex justify-center items-center h-[220px]">
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
  className={`
    relative flex-1 h-full shadow-md rounded-md 
    overflow-hidden flex flex-col
    ${isImage 
      ? "bg-gray-900 text-white" 
      : "bg-white text-black"
    }
  `}
>

  {isImage && (
    <>
      <div 
        className="absolute inset-0 bg-cover bg-top"
        style={{
          backgroundImage: `url(${image})`,
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t " />
    </>
  )}

    <div className="relative z-10 flex flex-col h-full p-3">
    <h3 className={` font-semibold text-lg mb-2 ${isImage && "drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)]"} line-clamp-2 `}>
      {title || "No Title"}
    </h3>

    <p
      title={description || content}
      className={`
        text-sm mt-3 mb-1 leading-relaxed ${isImage && "drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)]"}
        ${isImage ? "" : "text-gray-700"}
        line-clamp-5
      `}
    >
      {description || content || "No content available"}
    </p>
  </div>
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

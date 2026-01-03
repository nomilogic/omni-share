import { useAppContext } from "../../context/AppContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
} from "../../utils/platformIcons";
import { Platform } from "../../types";
import { useTranslation } from "react-i18next";

function RecentPosts({ post }: any) {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

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

  useEffect(() => {
    setSelectedPlatform(allPosts[0]?.platform || "all");
  }, [allPosts]);

  const topPost = allPosts
    .filter(
      (p: any) => selectedPlatform === "all" || p.platform === selectedPlatform
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  const isDummy = !topPost;

  // ✅ Dummy content (ONLY used when no post)
  // ✅ Titles are intentionally longer so the content box feels more centered
  const dummyByPlatform: Record<
    string,
    { title: string; description: string }
  > = {
    linkedin: {
      title:
        "3 quick wins to improve your workflow (that you can apply today) ✅",
      description:
        "This week’s tiny improvements made a big difference:\n" +
        "1) Keep meetings to 15 minutes\n" +
        "2) Write decisions down (one source of truth)\n" +
        "3) Automate the repeat stuff\n\n" +
        "Question: what’s ONE process you’d fix today?\n\n" +
        "#productivity #workflows #teams",
    },
    facebook: {
      title: "A quick update from us — and we’d love your input 👋",
      description:
        "We’re building something new and can’t wait to share it.\n\n" +
        "In the meantime, we’d love your input:\n" +
        "• What content helps you the most?\n" +
        "• Tips, behind-the-scenes, or quick",
    },
    instagram: {
      title:
        "Behind the scenes: today’s process, progress, and the little details ✨",
      description:
        "Today’s vibe: small steps, steady progress.\n\n" +
        "What you’re seeing:\n" +
        "• planning the idea\n" +
        "• drafting the copy\n",
    },
    youtube: {
      title:
        "New video idea: a 5-minute practical guide (no fluff, just steps) 🎥",
      description:
        "No fluff — just the exact steps to get started.\n\n" +
        "In this video we’ll cover:\n" +
        "1) the setup (fast)\n" +
        "2) the workflow (simple)\n",
    },
    tiktok: {
      title:
        "POV: you discover a better workflow and everything feels easier 😮‍💨",
      description:
        "Here’s the 20-second tip:\n" +
        "Do the hardest task FIRST → then batch the rest.\n\n" +
        "Try it today and tell me if it worked ✅\n\n ..." ,
    },
    all: {
      title:
        "Your next post preview (pick a platform above to see different styles) 🚀",
      description:
        "This is a preview template so the card never looks empty.\n\n" +
        "Once you create a post, your latest one will show here automatically.\n\n.....",
    },
  };

  // ✅ Dummy “image” look (gradient background) so it feels like real posts
  const dummyBackgroundByPlatform: Record<string, string> = {
    linkedin:
      "linear-gradient(135deg, rgba(118,80,227,1) 0%, rgba(215,215,252,1) 100%)",
    facebook:
      "linear-gradient(135deg, rgba(24,119,242,1) 0%, rgba(118,80,227,1) 100%)",
    instagram:
      "linear-gradient(135deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%)",
    youtube:
      "linear-gradient(135deg, rgba(255,0,0,1) 0%, rgba(118,80,227,1) 100%)",
    tiktok:
      "linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(118,80,227,1) 100%)",
    all: "linear-gradient(135deg, rgba(118,80,227,1) 0%, rgba(30,41,59,1) 100%)",
  };

  const dummy = dummyByPlatform[selectedPlatform] || dummyByPlatform.all;

  // pick real image if exists, otherwise dummy gradient background
  const bg = isDummy
    ? dummyBackgroundByPlatform[selectedPlatform] ||
      dummyBackgroundByPlatform.all
    : topPost?.metadata?.image;

  const {
    content = "",
    postUrl = "",
    metadata: { title = "", description = "" } = {},
  } = topPost || {
    content: dummy.description,
    postUrl: "",
    metadata: {
      title: dummy.title,
      description: dummy.description,
      image: undefined,
    },
  };

  return (
    <div className="bg-gray-100 rounded-md p-5 flex flex-col h-[450px] w-full">
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

      {/* ✅ Same “post card” UI */}
      <div
        className="flex-1 h-full shadow-md rounded-md px-3 py-2 flex flex-col bg-cover bg-center text-white"
        style={{
          backgroundImage: isDummy
            ? bg
            : bg
            ? `url(${bg})`
            : dummyBackgroundByPlatform.all,
        }}
      >
        <h3
          className={`font-bold text-lg mb-2 ${isDummy ? "line-clamp-3" : ""}`}
        >
          {isDummy ? dummy.title : title || "No Title"}
        </h3>

        <p
          title={isDummy ? dummy.description : description}
          className={`text-sm mb-3 bg-black/40 p-2 rounded whitespace-pre-line ${
            isDummy ? "line-clamp-6" : "line-clamp-5"
          }`}
        >
          {isDummy
            ? dummy.description
            : description || content || "No content available"}
        </p>
      </div>

      <button
        onClick={() => navigate("/content")}
        className="w-full text-white py-2.5 px-4 rounded-md font-semibold text-md transition-all border-2 border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] mt-4"
      >
        {t("create_post")}
      </button>
    </div>
  );
}

export default RecentPosts;

import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  Copy,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Repeat2,
  Eye,
  ThumbsUp,
  Send,
  Edit,
  Save,
  X,
  Wand2,
  Loader,
} from "lucide-react";
import Icon from "./Icon";
import { GeneratedPost, Platform } from "../types";
import {
  getPlatformIcon,
  getPlatformColors,
  getPlatformDisplayName,
} from "../utils/platformIcons";
import { getPlatformVideoLimits } from "../utils/videoUtils";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useModal } from "../context2/ModalContext";
import { useConfirmDialog } from "../context/ConfirmDialogContext";
import { useNavigationGuard } from "../hooks/useNavigationGuard";
import DiscardPostModal from "../components/modals/DiscardPostModal";

interface PostPreviewProps {
  posts: any[];
  onBack: () => void;
  onEdit: () => void;
  onPublish?: () => void;
  onPostsUpdate?: (updatedPosts: GeneratedPost[]) => void;
  onRegeneratePlatform?: (platform: Platform, customPrompt?: string) => void;
  onConnectAccounts?: () => void;
}

export const PostPreview = ({
  posts: generatedPosts,

  onPublish,
  onPostsUpdate,
  onRegeneratePlatform,
}: any) => {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(
    generatedPosts[0]?.platform || "facebook"
  );
  const { openModal } = useModal();
  const { generationAmounts } = useAppContext();
  const { showConfirm, closeConfirm } = useConfirmDialog();
  const [copiedPost, setCopiedPost] = useState<string | null>(null);
  const [editingMode, setEditingMode] = useState<boolean>(false);
  const [posts, setPosts] = useState<GeneratedPost[]>(generatedPosts);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isRegeneratingMode, setIsRegeneratingMode] = useState<boolean>(false);
  const [regenerationPrompt, setRegenerationPrompt] = useState<string>("");
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const scrollAnchorRef = useRef(null);
  const wasRegenerating = useRef(false);

  
  const isMobile = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1024px)").matches;

  useEffect(() => {
    // detect transition: regenerating -> completed
    if (wasRegenerating.current && !isRegenerating) {
      // Optional: only scroll on success
      // if (!regenerationSucceeded) return;

      if (isMobile()) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    wasRegenerating.current = isRegenerating;
  }, [isRegenerating /*, regenerationSucceeded */]);

  const [pendingDiscardAction, setPendingDiscardAction] = useState<
    (() => void) | null
  >(null);
  const navigate = useNavigate();

  

  // Check if there's unsaved content or active operations (including unpublished posts)
  const hasActiveOperation = useMemo(() => {
  const hasGeneratedPosts = (generatedPosts?.length ?? 0) > 0; // ✅ source of truth

  return (
    hasUnsavedChanges ||
    isRegenerating ||
    editingMode ||
    hasGeneratedPosts
  );
}, [hasUnsavedChanges, isRegenerating, editingMode, generatedPosts?.length]);



  // Guard navigation when there are unsaved changes or active operations
  



  // Create a navigation wrapper that checks for unsaved content
  const navigateWithConfirm = (path: string) => {
    if (hasActiveOperation) {
      showConfirm(
        t("confirm_navigation") || "Confirm",
        t("unsaved_changes_warning") ||
          "You have unsaved changes. Are you sure you want to leave?",
        () => {
          closeConfirm();
          navigate(path);
        }
      );
    } else {
      navigate(path);
    }
  };

  // Note: Browser's beforeunload dialog cannot be customized due to security restrictions

  // Intercept all navigation attempts (including link clicks and React Router links)
  // useEffect(() => {
  //   const handleClickCapture = (e: MouseEvent) => {
  //     const target = e.target as HTMLElement;
  //     // Check for both regular links and React Router Link components
  //     const link = target.closest("a") as HTMLAnchorElement;

  //     if (link && hasActiveOperation) {
  //       // Only intercept internal links (not external URLs and not downloads)
  //       const href = link.getAttribute("href");
  //       if (href && !href.includes("://") && !link.download) {
  //         e.preventDefault();
  //         e.stopPropagation();
  //         showConfirm(
  //           t("confirm_navigation") || "Confirm",
  //           t("unsaved_changes_warning") ||
  //             "You have unsaved changes. Are you sure you want to leave?",
  //           () => {
  //             closeConfirm();
  //             navigate(href);
  //           }
  //         );
  //       }
  //     }
  //   };

  //   // Use capture phase to intercept before default behavior
  //   document.addEventListener("click", handleClickCapture, true);
  //   return () => {
  //     document.removeEventListener("click", handleClickCapture, true);
  //   };
  // }, [hasActiveOperation, showConfirm, closeConfirm, t, navigate]);

  // Calculate initial character counts for all posts
  useEffect(() => {
    const postsWithCharacterCount = generatedPosts.map((post) => ({
      ...post,
      characterCount:
        post.characterCount ||
        (post.caption?.length || 0) + (post.hashtags?.join(" ")?.length || 0),
    }));
    setPosts(postsWithCharacterCount);
  }, [generatedPosts]);
  const { dispatch, cost }: any = useAppContext();
  const discardStateOnly = useCallback(() => {
  dispatch({ type: "SET_GENERATED_POSTS", payload: [] });
  dispatch({ type: "SET_CONTENT_DATA", payload: null });
  document.body.classList.remove("modal-open");
  document.documentElement.classList.remove("modal-open");
}, [dispatch]);

const discardAndGoContent = useCallback(() => {
  discardStateOnly();
  navigate("/content");
}, [discardStateOnly, navigate]);

  const handleDiscardClick = useCallback(() => {
  openModal(DiscardPostModal, {
    onConfirm: discardAndGoContent,
    t,
  });
}, [openModal, discardAndGoContent, t]);

console.log("[PREVIEW] hasActiveOperation =", hasActiveOperation, {
  generatedPosts: generatedPosts?.length,
  hasUnsavedChanges,
  isRegenerating,
  editingMode,
});

useNavigationGuard({
  isActive: true, // ✅ "lazmi modal" rule ke liye
  title: t("confirm_navigation") || "Confirm Navigation",
  message: t("unsaved_changes_warning") || "You have unsaved changes...",
  onConfirm: discardStateOnly,                     // ✅ template-style reset
  navigateTo: { to: "/content", replace: true },   // ✅ ALWAYS go content
});

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPost(selectedPlatform);
      setTimeout(() => setCopiedPost(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleCaptionEdit = useCallback(
    (newCaption: string) => {
      const currentPostIndex = posts.findIndex(
        (p) => p.platform === selectedPlatform
      );
      if (currentPostIndex !== -1) {
        const updatedPosts = [...posts];
        updatedPosts[currentPostIndex] = {
          ...updatedPosts[currentPostIndex],
          caption: newCaption,
          characterCount:
            newCaption.length +
            updatedPosts[currentPostIndex].hashtags.join(" ").length,
        };
        setPosts(updatedPosts);
        setHasUnsavedChanges(true);
      }
    },
    [posts, selectedPlatform]
  );

  const handleHashtagsEdit = useCallback(
    (hashtagText: string) => {
      const currentPostIndex = posts.findIndex(
        (p) => p.platform === selectedPlatform
      );
      if (currentPostIndex !== -1) {
        const hashtags = hashtagText
          .split(/\s+/)
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
          .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

        const updatedPosts = [...posts];
        updatedPosts[currentPostIndex] = {
          ...updatedPosts[currentPostIndex],
          hashtags: hashtags,
          characterCount:
            updatedPosts[currentPostIndex].caption.length +
            hashtags.join(" ").length,
        };
        setPosts(updatedPosts);
        setHasUnsavedChanges(true);
      }
    },
    [posts, selectedPlatform]
  );

  const saveChanges = useCallback(() => {
    if (onPostsUpdate) {
      onPostsUpdate(posts);
      setHasUnsavedChanges(false);
    }
  }, [posts, onPostsUpdate]);

  const discardChanges = useCallback(() => {
    setPosts(generatedPosts);
    setHasUnsavedChanges(false);
    setEditingMode(false);
  }, [generatedPosts]);

  const handleRegenerateClick = useCallback(() => {
    setIsRegeneratingMode(true);

    const currentPost = posts.find(
      (post) => post.platform === selectedPlatform
    );
    const platformPrompt = currentPost?.generationPrompt || "";
    setRegenerationPrompt(platformPrompt);

    // ✅ Mobile only: auto scroll down
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }, 200);
    }
  }, [posts, selectedPlatform]);

  // Handle regeneration submission
  const handleRegenerateSubmit = useCallback(async () => {
    const currentPost = posts.find(
      (post) => post.platform === selectedPlatform
    );
    console.log("🚀 HandleRegenerateSubmit called:", {
      selectedPlatform,
      currentPost: currentPost
        ? {
            platform: currentPost.platform,
            hasGenerationPrompt: !!currentPost.generationPrompt,
          }
        : null,
      regenerationPrompt: regenerationPrompt.substring(0, 50) + "...",
      onRegeneratePlatform: !!onRegeneratePlatform,
    });

    if (onRegeneratePlatform && currentPost) {
      // Set loading state
      setIsRegenerating(true);

      try {
        // Update the post object with the new prompt before regenerating
        const currentPostIndex = posts.findIndex(
          (p) => p.platform === selectedPlatform
        );
        if (currentPostIndex !== -1) {
          const updatedPosts = [...posts];
          updatedPosts[currentPostIndex] = {
            ...updatedPosts[currentPostIndex],
            generationPrompt: regenerationPrompt,
          };
          setPosts(updatedPosts);

          // Trigger save to parent if available
          if (onPostsUpdate) {
            onPostsUpdate(updatedPosts);
          }
        }

        console.log("🔥 Calling onRegeneratePlatform with:", {
          platform: currentPost.platform,
          prompt: regenerationPrompt.substring(0, 50) + "...",
        });
        await onRegeneratePlatform(currentPost.platform, regenerationPrompt);

        // Reset regeneration mode after successful submission
        setIsRegeneratingMode(false);
        setRegenerationPrompt("");
      } catch (error) {
        console.error("❌ Error during regeneration:", error);
        // Keep regeneration mode open on error so user can retry
      } finally {
        setIsRegenerating(false);
      }
    } else {
      console.error("❌ Cannot regenerate:", {
        hasOnRegeneratePlatform: !!onRegeneratePlatform,
        hasCurrentPost: !!currentPost,
      });
    }
  }, [
    onRegeneratePlatform,
    onPostsUpdate,
    posts,
    selectedPlatform,
    regenerationPrompt,
  ]);

  const handleRegenerateCancel = useCallback(() => {
    setIsRegeneratingMode(false);
    setRegenerationPrompt("");
  }, []);

  useEffect(() => {
    if (isRegeneratingMode) {
      const currentPost = posts.find(
        (post) => post.platform === selectedPlatform
      );
      const platformPrompt = currentPost?.generationPrompt || "";
      console.log(
        `🔄 Platform changed to ${selectedPlatform}, updating regeneration prompt:`,
        platformPrompt
      );
      setRegenerationPrompt(platformPrompt);
    }
  }, [selectedPlatform, posts, isRegeneratingMode]);

  const isVideoUrl = useCallback((url: string) => {
    if (!url) return false;

    return (
      !url.startsWith("data:") &&
      !url.includes("pollinations.ai") &&
      /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|3gp)(\?.*)?$/i.test(url)
    );
  }, []);

  const isVideoMedia = useCallback(
    (p: any, url?: string) => {
      const mUrl = url ?? p?.mediaUrl;
      const typeFlag = !!(
        p?.isVideoContent ||
        (p?.media?.type && p.media.type.startsWith("video/")) ||
        p?.mediaType === "video"
      );
      return (mUrl ? isVideoUrl(mUrl) : false) || typeFlag;
    },
    [isVideoUrl]
  );

  // Render media for platforms that need general media placement (Facebook, Twitter, LinkedIn)
  const renderMedia = useCallback(
    (
      post: GeneratedPost,
      className = "rounded-md max-h-80 object-contain",
      containerClass = "w-full flex justify-center my-3"
    ) => {
      console.log(
        "renderMedia called with mediaUrl:",
        post.mediaUrl,
        "isVideoContent:",
        (post as any).isVideoContent,
        "videoAspectRatio:",
        (post as any).videoAspectRatio
      );
      if (!post.mediaUrl) return null;

      if (isVideoMedia(post, post.mediaUrl)) {
        // For videos, use custom thumbnail if available
        const videoThumbnail = (post as any).thumbnailUrl;
        const videoAspectRatio = (post as any).videoAspectRatio;

        // Determine aspect ratio class for video container
        let aspectRatioClass = "";
        let isPortraitVideo = false;
        if (videoAspectRatio) {
          const ratio = videoAspectRatio;
          if (ratio >= 1.6 && ratio <= 1.9) {
            // 16:9 or similar horizontal
            aspectRatioClass = "aspect-video";
          } else if (ratio >= 0.5 && ratio <= 0.65) {
            // 9:16 or similar vertical
            aspectRatioClass = "aspect-[9/16]";
            isPortraitVideo = true;
          }
        }

        return (
          <div className={`${containerClass} ${aspectRatioClass} relative`}>
            <video
              src={post.mediaUrl}
              poster={videoThumbnail || undefined} // Use custom thumbnail as poster or let video show first frame
              controls
              preload="metadata" // Load video metadata to show first frame
              className={`${className} ${
                aspectRatioClass ? "object-cover w-full h-full" : ""
              }`}
              onError={(e) => {
                console.error("Media (video) failed to load:", post.mediaUrl);
                // Don't hide the video element, let the fallback overlay show
              }}
              onLoadStart={() =>
                console.log("Media (video) loading started:", post.mediaUrl)
              }
              onLoadedData={() =>
                console.log("Media (video) data loaded:", post.mediaUrl)
              }
            >
              {t("browser_no_video_support")}
            </video>
            {/* Enhanced fallback overlay for videos without thumbnails */}
            {/* {!videoThumbnail && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-60 pointer-events-none rounded-md">
              <div className="text-white text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 mx-auto backdrop-blur-sm">
                  <span className="text-3xl">▶</span>
                </div>
                <p className="text-base font-medium opacity-90">
                  {isPortraitVideo ? 'Vertical Video' : 'Video Content'}
                </p>
                <p className="text-xs opacity-70 mt-1">Click to play</p>
              </div>
            </div>
          )} */}
          </div>
        );
      } else {
        return (
          <div className={containerClass}>
            <img
              src={post.mediaUrl}
              alt="Post media"
              className={className}
              onError={(e) => {
                console.error("Media (image) failed to load:", post.mediaUrl);
                e.currentTarget.style.display = "none";
              }}
              onLoad={() =>
                console.log("Media (image) loaded successfully:", post.mediaUrl)
              }
            />
          </div>
        );
      }
    },
    [isVideoUrl, isVideoMedia]
  );

  const renderPlatformPreview = (post: GeneratedPost) => {
    const mediaUrl = post.mediaUrl || post.imageUrl;

    switch (post.platform) {
      case "facebook":
        return (
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-md max-w-xl w-full">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${getPlatformColors(
                    "facebook"
                  )}`}
                >
                  {(() => {
                    const IconComponent = getPlatformIcon("facebook");
                    return IconComponent ? (
                      <IconComponent className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-bold text-sm">FB</span>
                    );
                  })()}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">
                    {getPlatformDisplayName("facebook")}
                  </h3>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p
                className={`text-slate-800 whitespace-pre-wrap ${
                  editingMode
                    ? "border border-blue-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    : ""
                }`}
                contentEditable={editingMode}
                suppressContentEditableWarning={true}
                onBlur={(e) =>
                  editingMode &&
                  handleCaptionEdit(e.currentTarget.textContent || "")
                }
                style={{ outline: editingMode ? "none" : undefined }}
              >
                {post.caption}
              </p>

              <div className="w-full mt-3">
                {mediaUrl && (
                  <div className="w-full overflow-hidden rounded-md">
                    {/* image or video */}
                    {isVideoUrl(mediaUrl) ? (
                      <video
                        src={mediaUrl}
                        controls
                        className="w-full h-auto object-cover block"
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="post media"
                        className="w-full h-auto object-cover block"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3">
                <div
                  className={`text-blue-600 text-sm ${
                    editingMode
                      ? "border border-blue-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : ""
                  }`}
                  contentEditable={editingMode}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    editingMode &&
                    handleHashtagsEdit(e.currentTarget.textContent || "")
                  }
                  style={{ outline: editingMode ? "none" : undefined }}
                >
                  {post.hashtags.join(" ")}
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-gray-500 font-medium hover:text-blue-600">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{t("like")}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 font-medium hover:text-blue-600">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{t("comment")}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 font-medium hover:text-blue-600">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">{t("share")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "instagram":
        return (
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden w-full max-w-xl w-full shadow-md">
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${getPlatformColors(
                    "instagram"
                  )}`}
                >
                  {(() => {
                    const IconComponent = getPlatformIcon("instagram");
                    return IconComponent ? (
                      <IconComponent className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-white font-bold text-xs">IG</span>
                    );
                  })()}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 text-sm">
                    {getPlatformDisplayName("instagram")}
                  </h3>
                </div>
              </div>
            </div>
            <div
              className={`bg-gray-100 flex items-center justify-center relative ${
                mediaUrl && isVideoMedia(post, mediaUrl)
                  ? (() => {
                      const videoAspectRatio = (post as any).videoAspectRatio;
                      if (videoAspectRatio) {
                        const ratio = videoAspectRatio;
                        if (ratio >= 1.6 && ratio <= 1.9) {
                          return "aspect-video"; // 16:9 horizontal
                        } else if (ratio >= 0.5 && ratio <= 0.65) {
                          return "aspect-[9/16]"; // 9:16 vertical
                        }
                      }
                      return "aspect-[9/16]"; // default for videos
                    })()
                  : "aspect-square"
              }`}
            >
              {mediaUrl ? (
                isVideoMedia(post, mediaUrl) ? (
                  <>
                    <video
                      src={mediaUrl}
                      poster={(post as any).thumbnailUrl} // Use custom thumbnail for Instagram videos
                      controls
                      preload="metadata" // Load video metadata to show first frame
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        console.error(
                          "Instagram media (video) failed to load:",
                          mediaUrl
                        );
                        e.currentTarget.style.display = "none";
                      }}
                    >
                      {t("browser_no_video_support")}
                    </video>
                  </>
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Instagram media"
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      console.error(
                        "Instagram media (image) failed to load:",
                        mediaUrl
                      );
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-md mx-auto mb-2"></div>
                  <p className="text-sm">Your media here</p>
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <Heart className="w-6 h-6 text-slate-700" />
                  <MessageCircle className="w-6 h-6 text-slate-700" />
                  <Send className="w-6 h-6 text-slate-700" />
                </div>
              </div>
              <div className="text-sm">
                <span
                  className={`${
                    editingMode
                      ? "border border-blue-300 rounded p-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : ""
                  }`}
                  contentEditable={editingMode}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    editingMode &&
                    handleCaptionEdit(e.currentTarget.textContent || "")
                  }
                  style={{ outline: editingMode ? "none" : undefined }}
                >
                  {post.caption}
                </span>
              </div>
              <div className="mt-2">
                <div
                  className={`text-blue-600 text-sm ${
                    editingMode
                      ? "border border-blue-300 rounded p-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : ""
                  }`}
                  contentEditable={editingMode}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    editingMode &&
                    handleHashtagsEdit(e.currentTarget.textContent || "")
                  }
                  style={{ outline: editingMode ? "none" : undefined }}
                >
                  {post.hashtags.join(" ")}
                </div>
              </div>
            </div>
          </div>
        );

      case "twitter":
        return (
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden max-w-xl w-full shadow-md">
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${getPlatformColors(
                    "twitter"
                  )}`}
                >
                  {(() => {
                    const IconComponent = getPlatformIcon("twitter");
                    return IconComponent ? (
                      <IconComponent className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-bold">X</span>
                    );
                  })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-bold text-slate-900">
                      {getPlatformDisplayName("twitter")}
                    </h3>
                    <span className="text-gray-500 font-medium"></span>
                    <span className="text-gray-500 font-medium">·</span>
                    <span className="text-gray-500 font-medium">now</span>
                  </div>
                  <p
                    className={`text-slate-800 whitespace-pre-wrap ${
                      editingMode
                        ? "border border-blue-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : ""
                    }`}
                    contentEditable={editingMode}
                    suppressContentEditableWarning={true}
                    onBlur={(e) =>
                      editingMode &&
                      handleCaptionEdit(e.currentTarget.textContent || "")
                    }
                    style={{ outline: editingMode ? "none" : undefined }}
                  >
                    {post.caption}
                  </p>
                  <div className="mt-2">
                    <div
                      className={`text-blue-500 text-sm ${
                        editingMode
                          ? "border border-blue-300 rounded p-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          : ""
                      }`}
                      contentEditable={editingMode}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        editingMode &&
                        handleHashtagsEdit(e.currentTarget.textContent || "")
                      }
                      style={{ outline: editingMode ? "none" : undefined }}
                    >
                      {post.hashtags.join(" ")}
                    </div>
                  </div>
                  {renderMedia({ ...post, mediaUrl })}
                  <div className="flex items-center justify-between mt-3 max-w-md">
                    <button className="flex items-center space-x-2 text-gray-500 font-medium hover:text-blue-500">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{t("reply")}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 font-medium hover:text-green-500">
                      <Repeat2 className="w-4 h-4" />
                      <span className="text-sm">{t("repost")}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 font-medium hover:text-red-500">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{t("like")}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 font-medium hover:text-blue-500">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">{t("share")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "linkedin":
        return (
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-md max-w-xl w-full">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${getPlatformColors(
                    "linkedin"
                  )}`}
                >
                  {(() => {
                    const IconComponent = getPlatformIcon("linkedin");
                    return IconComponent ? (
                      <IconComponent className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-white font-bold">LI</span>
                    );
                  })()}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">
                    {getPlatformDisplayName("linkedin")}
                  </h3>
                </div>
              </div>
              <p
                className={`text-slate-800 whitespace-pre-wrap mb-3 ${
                  editingMode
                    ? "border border-blue-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    : ""
                }`}
                contentEditable={editingMode}
                suppressContentEditableWarning={true}
                onBlur={(e) =>
                  editingMode &&
                  handleCaptionEdit(e.currentTarget.textContent || "")
                }
                style={{ outline: editingMode ? "none" : undefined }}
              >
                {post.caption}
              </p>
              <div className="mb-3">
                <div
                  className={`text-blue-600 text-sm ${
                    editingMode
                      ? "border border-blue-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : ""
                  }`}
                  contentEditable={editingMode}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    editingMode &&
                    handleHashtagsEdit(e.currentTarget.textContent || "")
                  }
                  style={{ outline: editingMode ? "none" : undefined }}
                >
                  {post.hashtags.join(" ")}
                </div>
              </div>
              <div className="w-full mt-3">
                {mediaUrl && (
                  <div className="w-full overflow-hidden rounded-md">
                    {/* image or video */}
                    {isVideoUrl(mediaUrl) ? (
                      <video
                        src={mediaUrl}
                        controls
                        className="w-full h-auto object-cover block"
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="post media"
                        className="w-full h-auto object-cover block"
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button className="flex items-center space-x-2 text-gray-500 font-medium hover:text-blue-600">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">{t("like")}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 font-medium hover:text-blue-600">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{t("comment")}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 font-medium hover:text-blue-600">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">{t("share")}</span>
                </button>
              </div>
            </div>
          </div>
        );

      case "tiktok":
        return (
          <div className="bg-black rounded-md overflow-hidden max-w-sm shadow-md">
            <div className="p-3 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${getPlatformColors(
                    "tiktok"
                  )}`}
                >
                  {(() => {
                    const IconComponent = getPlatformIcon("tiktok");
                    return IconComponent ? (
                      <IconComponent className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-white font-bold text-xs">TT</span>
                    );
                  })()}
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm">
                    {getPlatformDisplayName("tiktok")}
                  </h3>
                </div>
              </div>
            </div>
            <div className="aspect-[9/16] bg-gray-900 relative">
              <div
                className={`bg-gray-100 flex items-center justify-center relative ${
                  mediaUrl && isVideoMedia(post, mediaUrl)
                    ? (() => {
                        const videoAspectRatio = (post as any).videoAspectRatio;
                        if (videoAspectRatio) {
                          const ratio = videoAspectRatio;
                          if (ratio >= 1.6 && ratio <= 1.9) {
                            return "aspect-video";
                          } else if (ratio >= 0.5 && ratio <= 0.65) {
                            return "aspect-[9/16]";
                          }
                        }
                        return "aspect-[9/16]";
                      })()
                    : "aspect-square"
                }`}
              >
                {mediaUrl ? (
                  isVideoMedia(post, mediaUrl) ? (
                    <>
                      <video
                        src={mediaUrl}
                        poster={(post as any).thumbnailUrl}
                        controls
                        preload="metadata"
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          console.error(
                            "TikTok media (video) failed to load:",
                            mediaUrl
                          );
                          e.currentTarget.style.display = "none";
                        }}
                      >
                        {t("browser_no_video_support")}
                      </video>
                    </>
                  ) : (
                    <img
                      src={mediaUrl}
                      alt="TikTok media"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        console.error(
                          "TikTok media (image) failed to load:",
                          mediaUrl
                        );
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-md mx-auto mb-2"></div>
                    <p className="text-sm">Your media here</p>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="text-white">
                  <p className="text-sm mb-2">{post.caption}</p>
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.map((tag, index) => (
                      <span key={index} className="text-blue-400 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "youtube":
        return (
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-md max-w-xl w-full">
            {renderMedia(
              { ...post, mediaUrl },
              "rounded-md max-h-96 object-contain w-full",
              "w-full flex justify-center bg-black"
            )}
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${getPlatformColors(
                    "youtube"
                  )}`}
                >
                  {(() => {
                    const IconComponent = getPlatformIcon("youtube");
                    return IconComponent ? (
                      <IconComponent className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-bold text-sm">YT</span>
                    );
                  })()}
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">
                    {getPlatformDisplayName("youtube")}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">
                    Just uploaded
                  </p>
                </div>
              </div>
              <h3
                className={`font-medium text-slate-900 mb-2 line-clamp-2 block ${
                  editingMode
                    ? "border border-blue-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    : ""
                }`}
                contentEditable={editingMode}
                suppressContentEditableWarning={true}
                onBlur={(e) =>
                  editingMode &&
                  handleCaptionEdit(e.currentTarget.textContent || "")
                }
                style={{ outline: editingMode ? "none" : undefined }}
              >
                {post.caption}
              </h3>
              <div className="mb-3">
                <div
                  className={`text-blue-600 text-sm ${
                    editingMode
                      ? "border border-blue-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : ""
                  }`}
                  contentEditable={editingMode}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    editingMode &&
                    handleHashtagsEdit(e.currentTarget.textContent || "")
                  }
                  style={{ outline: editingMode ? "none" : undefined }}
                >
                  {post.hashtags.join(" ")}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white border border-gray-200 rounded-md p-6 shadow-md">
            <h3 className="font-medium text-slate-900 mb-3 ">
              {post.platform}
            </h3>
            <p className="text-slate-800 whitespace-pre-wrap mb-3">
              {post.caption}
            </p>
            <div className="flex flex-wrap gap-1">
              {post.hashtags.map((tag, index) => (
                <span key={index} className="text-blue-600 text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
    }
  };

  const selectedPost = posts.find((post) => post.platform === selectedPlatform);
  return (
    <div className="flex flex-col min-h-[90vh] items-center justify-center">
      <div className="preview   w-full mx-auto bg-transparent  md:rounded-md p-4 md:shadow-md md:px-8  md:py-6 md:my-5 bg-white ">
        <h2 className="text-3xl font-semibold theme-text-primary mb-1">
          {t("ai_generated_posts")}
        </h2>

        <p className="text-sm theme-text-primary">{t("review_copy_share")}</p>
        <div className="grid lg:grid-cols-1  gap-y-2">
          <div className="lg:col-span-1 space-y-2">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-0 text-left lg:text-center mt-2">
                {t("select_platform")}
              </h3>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {generatedPosts.map((post, index) => {
                const IconComponent = getPlatformIcon(post.platform);
                return (
                  <button
                    key={post.platform}
                    onClick={() => setSelectedPlatform(post.platform)}
                    className={`relative p-1 rounded-full transition-all duration-200 transform hover:scale-105 h-fit  ${
                      selectedPlatform === post.platform
                        ? "ring-4 ring-blue-200 shadow-md"
                        : "hover:shadow-md"
                    }`}
                  >
                    {IconComponent && (
                      <div
                        className={`w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center text-white ${getPlatformColors(
                          post.platform
                        )} shadow-md`}
                      >
                        <IconComponent className="w-4 md:w-5 h-4 md:h-5" />
                      </div>
                    )}

                    {selectedPlatform === post.platform && (
                      <div className="absolute inset-0 rounded-full border border-blue-500 animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 mb-1 px-1 text-left lg:text-center">
              {t("preview")}
            </h3>

            <div className="flex justify-center mb-4">
              {selectedPost && renderPlatformPreview(selectedPost)}
            </div>

            {selectedPost && (
              <div className="flex justify-center mb-2">
                <div className="max-w-xl w-full w-full text-center space-y-3">
                  {editingMode ? (
                    // Editing Mode - Show save/cancel buttons
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => {
                          discardChanges();
                        }}
                        className="flex items-center justify-center w-full gap-2 px-4 py-2.5 border border-purple-600 text-purple-600 rounded-md hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] transition-colors font-medium"
                      >
                        <X className="w-4 h-4" />
                        {t("cancel")}
                      </button>
                      <button
                        onClick={() => {
                          saveChanges();
                          setEditingMode(false);
                        }}
                        className="flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-md border border-transparent hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] transition-colors font-medium"
                      >
                        <Save className="w-4 h-4" />
                        {t("save_changes")}
                      </button>
                    </div>
                  ) : (
                    // View Mode - Show edit button
                    <button
                      onClick={() => setEditingMode(true)}
                      className="w-full py-2.5  text-base font-semibold rounded-md border flex items-center justify-center gap-2 transition  hover:bg-[#d7d7fc] text-[#7650e3] border-[#7650e3]"
                    >
                      <Edit className="w-5 h-5" />
                      {t("edit_post_text")}
                    </button>
                  )}

                  {editingMode && (
                    <p className="text-sm text-blue-600">
                      💡 {t("tooltip_edit_hint")}
                    </p>
                  )}

                  {hasUnsavedChanges && (
                    <p className="text-sm text-orange-600">
                      ⚠️ {t("unsaved_changes_warning")}
                    </p>
                  )}
                  <button
                    onClick={handleRegenerateClick}
                    className="w-full bg-purple-600 text-white hover:text-[#7650e3] flex items-center gap-2 justify-center hover:bg-[#d7d7fc] border border-[#7650e3] font-semibold py-2.5 text-base rounded-md transition disabled:opacity-50"
                  >
                    <Edit className="w-5 h-5" />
                    {t("regenerate")}
                  </button>
                  <div ref={scrollAnchorRef} />
                </div>
              </div>
            )}

            {/* {selectedPost && (
            <div className="flex justify-center w-full lg:block">
              <div className="max-w-xl w-full  mx-auto w-full space-y-4">
                <div className="bg-gray-50 rounded-md p-4">
                  <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                    {(() => {
                      const IconComponent = getPlatformIcon(
                        selectedPost.platform
                      );
                      return IconComponent ? (
                        <>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${getPlatformColors(
                              selectedPost.platform
                            )}`}
                          >
                            <IconComponent className="w-3 h-3" />
                          </div>
                          <span className="">
                            {selectedPost.platform} Details
                          </span>
                        </>
                      ) : (
                        <span className="">
                          {selectedPost.platform} Details
                        </span>
                      );
                    })()}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex justify-between md:flex-col md:items-start">
                      <span className="text-gray-500 font-medium">
                        {t("character_count")}
                      </span>
                      <span className="font-medium">
                        {selectedPost.characterCount}
                      </span>
                    </div>
                    <div className="flex justify-between md:flex-col md:items-start">
                      <span className="text-gray-500 font-medium">
                        {t("hashtags")}
                      </span>
                      <span className="font-medium">
                        {selectedPost.hashtags.length}
                      </span>
                    </div>
                    {(() => {
                      // Show video limits only for video posts
                      const mediaUrl =
                        selectedPost.mediaUrl || selectedPost.imageUrl;
                      const hasVideo = mediaUrl
                        ? isVideoMedia(selectedPost as any, mediaUrl)
                        : false;
                      if (!hasVideo) return null;

                      const videoAspectRatio = (selectedPost as any)
                        .videoAspectRatio;
                      const isShorts =
                        videoAspectRatio &&
                        videoAspectRatio >= 0.5 &&
                        videoAspectRatio <= 0.65;

                      const videoLimits = getPlatformVideoLimits(
                        selectedPost.platform,
                        isShorts
                      );
                      if (!videoLimits) return null;

                      return (
                        <div className="flex justify-between md:flex-col md:items-start">
                          <span className="text-gray-500 font-medium">
                            {isShorts ? "Shorts" : "Video"} Limits
                          </span>
                          <span className="text-xs text-gray-600 font-medium">
                            {videoLimits.aspectRatio} •{" "}
                            {videoLimits.maxDuration}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {(() => {
                    // Show detailed video limits when this post has video media
                    const mediaUrl =
                      selectedPost.mediaUrl || selectedPost.imageUrl;
                    const hasVideo = mediaUrl
                      ? isVideoMedia(selectedPost as any, mediaUrl)
                      : false;
                    if (!hasVideo) return null;

                    const videoAspectRatio = (selectedPost as any)
                      .videoAspectRatio;
                    const isShorts =
                      videoAspectRatio &&
                      videoAspectRatio >= 0.5 &&
                      videoAspectRatio <= 0.65;

                    const videoLimits = getPlatformVideoLimits(
                      selectedPost.platform,
                      isShorts
                    );
                    if (!videoLimits) return null;

                    return (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <span className="text-gray-500 font-medium block mb-2">
                          {isShorts ? t("shorts") : t("video")}{" "}
                          {t("requirements_for")}{" "}
                          {getPlatformDisplayName(selectedPost.platform)}
                        </span>
                        <div className="space-y-2 text-xs text-gray-700">
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {t("aspect_ratio")}:
                            </span>
                            <span>{videoLimits.aspectRatio}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {t("resolution")}:
                            </span>
                            <span>{videoLimits.resolution}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {t("max_duration")}:
                            </span>
                            <span>{videoLimits.maxDuration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {t("max_file_size")}:
                            </span>
                            <span>{videoLimits.maxFileSize}</span>
                          </div>
                          {videoLimits.notes && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                              ⚠️ {videoLimits.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )} */}
          </div>
        </div>

        <div className="pt-1 mt-2 flex flex-row-reverse gap-2">
          {!isRegeneratingMode ? (
            <>
              <button
                onClick={onPublish}
                className="w-full bg-purple-600 text-white hover:text-[#7650e3] flex items-center gap-2 justify-center hover:bg-[#d7d7fc] border border-[#7650e3] font-semibold py-2.5 text-base rounded-md transition disabled:opacity-50"
              >
                {t("continue")}
              </button>

              <button
                onClick={handleDiscardClick}
                className="w-full bg-transparent border-purple-600 border text-purple-600 flex items-center gap-2 justify-center hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] font-semibold py-2.5 text-base rounded-md transition disabled:opacity-50"
              >
                {/* <Edit className="w-5 h-5" /> */}
                {t("discard_post")}
              </button>
            </>
          ) : (
            // Regeneration mode - show textarea and generate button
            <div className="theme-bg-quaternary rounded-md lg:p-5 p-3 border border-purple-200 w-full">
              <h4 className="text-lg font-semibold theme-text-secondary mb-3 text-left ">
                {t("generate_post_text")}
              </h4>

              {/* Text Area */}
              <div className="mb-4">
                <textarea
                  value={regenerationPrompt}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRegenerationPrompt(value);
                    // Keep the selected post's generationPrompt in sync while typing
                    setPosts((prev) => {
                      const idx = prev.findIndex(
                        (p) => p.platform === selectedPlatform
                      );
                      if (idx === -1) return prev;
                      const updated = [...prev];
                      updated[idx] = {
                        ...updated[idx],
                        generationPrompt: value,
                      } as any;
                      return updated;
                    });
                  }}
                  placeholder="Enter your prompt to regenerate the post text for the selected platform..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                />
              </div>

              {/* Generate Button with Coin Counter - Match ContentInput styling */}
              <button
                onClick={handleRegenerateSubmit}
                disabled={isRegenerating}
                className={`group rounded-md w-full flex-1 flex items-center justify-between theme-bg-trinary theme-text-light border border-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] transition-colors duration-200 py-2.5 px-3 font-semibold text-base ${
                  isRegenerating
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:opacity-90"
                }`}
              >
                <div className="flex items-center">
                  {isRegenerating ? (
                    <Loader className="w-6 h-6 mr-1 animate-spin" />
                  ) : (
                    <Wand2 className="w-[23px] h-[23px] mr-1" />
                  )}
                  {isRegenerating ? t("regenerating") : t("generate_post_text")}
                </div>
                <div className="sm:inline-block px-2 py-1 flex items-center">
                  <Icon
                    name="spiral-logo"
                    size={20}
                    className="inline mr-1 mt-[-1px] brightness-[1000%] transition group-hover:brightness-100"
                  />
                  {generationAmounts?.text}
                </div>
              </button>

              {/* Cancel Button */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleRegenerateCancel}
                  className="w-full py-2.5  text-base font-semibold rounded-md border flex items-center justify-center gap-2 transition  hover:bg-[#d7d7fc] text-[#7650e3] border-[#7650e3]"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

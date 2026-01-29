import React, { useState, useEffect, useCallback } from "react";
import { GeneratedPost, Platform } from "../types";
import { postToAllPlatforms } from "../lib/socialPoster";
import { SocialMediaManager } from "./SocialMediaManager";

import { RefreshCw, Trash2 } from "lucide-react";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
  getPlatformDisplayName,
} from "../utils/platformIcons";
import { getPlatformVideoLimits } from "../utils/videoUtils";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useModal } from "../context2/ModalContext";
import DiscardWarningModal from "../components/modals/DiscardWarningModal";
import { useAppContext } from "@/context/AppContext";
import { useConfirmDialog } from "@/context/ConfirmDialogContext";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

type TikTokPrivacyLevel = string;

interface TikTokCreatorInfo {
  nickname?: string;
  max_video_post_duration_sec?: number;
  privacy_level_options?: TikTokPrivacyLevel[];
  can_post?: boolean;
  blocked_reason?: string;
}

interface TikTokSettingsState {
  title: string;
  privacyLevel: TikTokPrivacyLevel | "";
  allowComment: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  isCommercial: boolean;
  isYourBrand: boolean;
  isBrandedContent: boolean;
}

interface PublishProps {
  posts: GeneratedPost[];
  userId?: string;
  onBack: () => void;
  onReset?: () => void;
}

export const PublishPosts: React.FC<PublishProps> = ({
  posts,
  userId,
  onBack,
  onReset,
}) => {
  const { t } = useTranslation();
  const { showConfirm, closeConfirm } = useConfirmDialog();
  const navigate = useNavigate();
  const { openModal } = useModal();

  const {
    connectedPlatforms,
    connectingPlatforms,
    checkConnectedPlatforms,
    handleConnectPlatform,
    handleDisconnectPlatform,
    fetchPostHistory,
    linkedinPages,
    facebookPages,
    youtubeChannels,
    selectedLinkedinPage,
    selectedFacebookPage,
    selectedYoutubeChannel,
    setSelectedLinkedinPage,
    setSelectedFacebookPage,
    setSelectedYoutubeChannel,
    fetchUnreadCount,
  }: any = useAppContext();

  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    posts.map((p) => p.platform)
  );
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState<Record<string, any> | null>(null);
  const [publishProgress, setPublishProgress] = useState<
    Record<string, "pending" | "success" | "error">
  >({});
  const [publishedPlatforms, setPublishedPlatforms] = useState<Platform[]>([]);

  const [tiktokCreatorInfo, setTiktokCreatorInfo] =
    useState<TikTokCreatorInfo | null>(null);
  const [tiktokSettings, setTiktokSettings] = useState<TikTokSettingsState>({
    title: "",
    privacyLevel: "",
    allowComment: false,
    allowDuet: false,
    allowStitch: false,
    isCommercial: false,
    isYourBrand: false,
    isBrandedContent: false,
  });
  const [tiktokPostingBlockedReason, setTiktokPostingBlockedReason] = useState<
    string | null
  >(null);

  const hasActiveOperation = publishing || selectedPlatforms.length > 0;

  const navigateWithConfirm = useCallback(
    (path: string) => {
      if (!hasActiveOperation) {
        navigate(path);
        return;
      }

      const message = publishing
        ? t("publishing_in_progress") ||
          "Publishing is in progress. Are you sure you want to leave?"
        : t("unsaved_changes_warning") ||
          "You have unsaved changes. Are you sure you want to leave?";

      showConfirm(
        t("confirm_navigation") || "Confirm Navigation",
        message,
        () => {
          closeConfirm();
          navigate(path);
        }
      );
    },
    [hasActiveOperation, publishing, t, navigate, showConfirm, closeConfirm]
  );

  useNavigationGuard({
    isActive: hasActiveOperation,
    title: t("confirm_navigation") || "Confirm Navigation",
    message: publishing
      ? t("publishing_in_progress") ||
        "Publishing is in progress. Are you sure you want to leave?"
      : t("unsaved_changes_warning") ||
        "You have unsaved changes. Are you sure you want to leave?",
  });

  useEffect(() => {
    const handleClickCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement;

      if (!link) return;
      const href = link.getAttribute("href");

      if (
        href &&
        !href.includes("://") &&
        !link.download &&
        hasActiveOperation
      ) {
        e.preventDefault();
        e.stopPropagation();
        navigateWithConfirm(href);
      }
    };

    document.addEventListener("click", handleClickCapture, true);
    return () =>
      document.removeEventListener("click", handleClickCapture, true);
  }, [hasActiveOperation, navigateWithConfirm]);

  useEffect(() => {
    const hasTikTokPost = posts.some((p) => p.platform === "tiktok");
    if (!hasTikTokPost) {
      setTiktokCreatorInfo(null);
      setTiktokPostingBlockedReason(null);
      return;
    }

    const fetchCreatorInfo = async () => {
      try {
        const res = await API.tiktokGetMe();
        const data = res?.data || {};

        const creatorInfo: TikTokCreatorInfo = {
          nickname: data.nickname || data.display_name,
          max_video_post_duration_sec:
            data.creator_info?.max_video_post_duration_sec ||
            data.max_video_post_duration_sec,
          privacy_level_options:
            data.creator_info?.privacy_level_options ||
            data.privacy_level_options,
          can_post:
            data.creator_info?.can_post ??
            data.can_post ??
            data.creator_info?.can_post_video,
          blocked_reason:
            data.creator_info?.blocked_reason || data.blocked_reason,
        };

        setTiktokCreatorInfo(creatorInfo);

        setTiktokPostingBlockedReason(
          creatorInfo.can_post === false
            ? creatorInfo.blocked_reason ||
                "TikTok posting is temporarily unavailable for this account. Please try again later."
            : null
        );
      } catch (e) {
        console.error("Failed to fetch TikTok creator info:", e);
      }
    };

    fetchCreatorInfo();
  }, [posts]);

  const handleDiscardClick = useCallback(() => {
    openModal(DiscardWarningModal, {
      t,
      onConfirmAction: () => navigate("/content"),
    });
  }, [openModal, t, navigate]);

  const isTikTokSelectedAndConnected = useCallback(
    () =>
      selectedPlatforms.includes("tiktok") &&
      connectedPlatforms.includes("tiktok") &&
      posts.some((p) => p.platform === "tiktok"),
    [selectedPlatforms, connectedPlatforms, posts]
  );

  const validateTikTokSettings = useCallback(() => {
    if (!isTikTokSelectedAndConnected()) return true;

    const tikTokPost = posts.find((p) => p.platform === "tiktok");
    if (!tikTokPost) return true;

    if (tiktokPostingBlockedReason) return false;
    if (!tiktokSettings.title.trim()) return false;
    if (!tiktokSettings.privacyLevel) return false;

    if (tiktokSettings.isCommercial) {
      if (!tiktokSettings.isYourBrand && !tiktokSettings.isBrandedContent) {
        return false;
      }
    }

    const privacyIsPrivate =
      tiktokSettings.privacyLevel.toUpperCase() === "SELF_ONLY" ||
      tiktokSettings.privacyLevel.toUpperCase() === "PRIVATE";

    if (tiktokSettings.isBrandedContent && privacyIsPrivate) return false;

    if (
      tikTokPost.tiktokVideoDurationSec &&
      tiktokCreatorInfo?.max_video_post_duration_sec &&
      tikTokPost.tiktokVideoDurationSec >
        tiktokCreatorInfo.max_video_post_duration_sec + 30
    ) {
      return false;
    }

    return true;
  }, [
    isTikTokSelectedAndConnected,
    posts,
    tiktokPostingBlockedReason,
    tiktokSettings,
    tiktokCreatorInfo,
  ]);

  const handlePublish = async () => {
    // if (!validateTikTokSettings()) return;

    const availablePlatforms = selectedPlatforms.filter(
      (p) => connectedPlatforms.includes(p) && !publishedPlatforms.includes(p)
    );

    if (availablePlatforms.length === 0) return;

    setPublishing(true);
    setPublishProgress({});

    try {
      const selectedPosts = posts
        .filter((post) => availablePlatforms.includes(post.platform))
        .map((post) => {
          if (post.platform !== "tiktok") return post;

          return {
            ...post,
            tiktokTitle: tiktokSettings.title.trim(),
            tiktokPrivacyLevel: tiktokSettings.privacyLevel,
            tiktokAllowComment: tiktokSettings.allowComment,
            tiktokAllowDuet: tiktokSettings.allowDuet,
            tiktokAllowStitch: tiktokSettings.allowStitch,
            tiktokIsCommercial: tiktokSettings.isCommercial,
            tiktokIsYourBrand: tiktokSettings.isYourBrand,
            tiktokIsBrandedContent: tiktokSettings.isBrandedContent,
          };
        });

      const youtubePost = selectedPosts.find((p) => p.platform === "youtube");
      const thumbnailUrl = youtubePost?.thumbnailUrl;

      const publishResults = await postToAllPlatforms(
        selectedPosts,
        (platform, status) => {
          setPublishProgress((prev) => ({ ...prev, [platform]: status }));

          if (status === "success") {
            setPublishedPlatforms((prev) => [...prev, platform as Platform]);
            setSelectedPlatforms((prev) => prev.filter((p) => p !== platform));
          }
        },
        {
          linkedinPageId: selectedLinkedinPage || undefined,
          facebookPageId: selectedFacebookPage || undefined,
          youtubeChannelId: selectedYoutubeChannel || undefined,
          thumbnailUrl: thumbnailUrl || undefined,
        }
      );

      setResults(publishResults);

      const newlyPublished = Object.entries(publishResults)
        .filter(([key, r]) => key !== "_summary" && r.success)
        .map(([p]) => p as Platform);

      const allPublished = [...publishedPlatforms, ...newlyPublished];

      if (newlyPublished.length > 0) {
        setTimeout(fetchPostHistory, 500);
      }

      const originalConnected = posts
        .map((p) => p.platform)
        .filter((p) => connectedPlatforms.includes(p));

      if (originalConnected.every((p) => allPublished.includes(p)) && onReset) {
        setTimeout(onReset, 2000);
      }
    } catch (err) {
      console.error("Publish error:", err);
    } finally {
      setPublishing(false);
      fetchUnreadCount();
    }
  };

  return (
    <div className="theme-bg-light max-w-5xl mx-auto ">
      <div className=" px-3 lg:p-6 ">
        <h2 className="text-2xl font-bold theme-text-primary mb-2">
          {t("publish_posts")}
        </h2>

        <div className="p-3 bg-white border border-blue-600  rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">{connectedPlatforms.length}</span> of{" "}
            <span className="font-medium">{posts.length}</span>{" "}
            {t("platforms_connected")}
          </p>
        </div>

        <div className="mb-4 mt-4 space-y-4">
          {posts.map((post) => {
            const isConnected = connectedPlatforms.includes(post.platform);
            const isConnecting = connectingPlatforms.includes(post.platform);
            const progress = publishProgress[post.platform];

            const durationSec = (post as any).tiktokVideoDurationSec as
              | number
              | undefined;
            const tiktokDurationLimit =
              post.platform === "tiktok"
                ? tiktokCreatorInfo?.max_video_post_duration_sec
                : undefined;

            const disableByDuration =
              post.platform === "tiktok" &&
              !!durationSec &&
              !!tiktokDurationLimit &&
              durationSec > tiktokDurationLimit + 30;

            const mediaUrl = post.mediaUrl || post.imageUrl;
            const isVideo =
              mediaUrl &&
              (/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|3gp)(\?.*)?$/i.test(
                mediaUrl
              ) ||
                (post as any).isVideoContent ||
                (post as any).mediaType === "video");

            const videoAspectRatio = (post as any).videoAspectRatio;
            const isShorts =
              videoAspectRatio &&
              videoAspectRatio >= 0.5 &&
              videoAspectRatio <= 0.65;

            const videoLimits = isVideo
              ? getPlatformVideoLimits(post.platform, isShorts)
              : null;

            return (
              <React.Fragment key={post.platform}>
                <div className="flex flex-row gap-1 justify-between py-4 px-2 md:px-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div
                      className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white ${getPlatformIconBackgroundColors(
                        post.platform
                      )}`}
                    >
                      {(() => {
                        const Icon = getPlatformIcon(post.platform);
                        return Icon ? (
                          <Icon className="w-8 h-4 md:w-6 md:h-6" />
                        ) : (
                          <span className="text-lg font-bold">
                            {post.platform.substring(0, 2).toUpperCase()}
                          </span>
                        );
                      })()}
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900">
                        {getPlatformDisplayName(post.platform)}
                      </h4>

                      <p
                        className={`text-sm ${
                          isConnected ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isConnected ? t("connected") : t("not_connected")}
                      </p>

                      {videoLimits && (
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <p className="font-medium text-gray-700">
                            {isShorts ? "Shorts" : "Video"} Limits:
                          </p>
                          <p>
                            Aspect Ratio:{" "}
                            <span className="font-semibold">
                              {videoLimits.aspectRatio}
                            </span>
                          </p>
                          <p>
                            Max Duration:{" "}
                            <span className="font-semibold">
                              {videoLimits.maxDuration}
                            </span>
                          </p>
                          <p>
                            Max File Size:{" "}
                            <span className="font-semibold">
                              {videoLimits.maxFileSize}
                            </span>
                          </p>
                          {videoLimits.notes && (
                            <p className="text-yellow-700 italic mt-1">
                              ⚠️ {videoLimits.notes}
                            </p>
                          )}
                        </div>
                      )}

                      {disableByDuration && (
                        <p className="text-xs text-red-600 mt-1">
                          This video exceeds your TikTok account's allowed
                          duration. TikTok is disabled for this post.
                        </p>
                      )}

                      {progress && (
                        <p
                          className={`text-xs mt-1 ${
                            progress === "pending"
                              ? "text-yellow-600"
                              : progress === "success"
                                ? "text-green-600"
                                : "text-red-600"
                          }`}
                        >
                          {progress === "pending"
                            ? "Publishing..."
                            : progress === "success"
                              ? "Published"
                              : "Failed"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isConnected && (
                      <>
                        <button
                          onClick={() => handleConnectPlatform(post.platform)}
                          disabled={isConnecting}
                          className="md:p-3 text-gray-500 hover:text-blue-600 disabled:opacity-50 rounded-md hover:bg-gray-100"
                          title="Refresh connection"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDisconnectPlatform(post.platform)
                          }
                          disabled={isConnecting}
                          className="md:p-3 text-gray-500 hover:text-red-600 disabled:opacity-50 rounded-md hover:bg-gray-100"
                          title="Disconnect"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <div className="flex items-center gap-2">
                      {isConnected &&
                        !publishedPlatforms.includes(post.platform) &&
                        !disableByDuration && (
                          <label
                            className="flex items-center cursor-pointer"
                            htmlFor={`platform-${post.platform}`}
                          >
                            <input
                              id={`platform-${post.platform}`}
                              type="checkbox"
                              className="sr-only hidden"
                              checked={selectedPlatforms.includes(
                                post.platform
                              )}
                              onChange={(e) =>
                                setSelectedPlatforms((prev) =>
                                  e.target.checked
                                    ? [...prev, post.platform]
                                    : prev.filter((p) => p !== post.platform)
                                )
                              }
                            />
                            <div
                              className={`w-5 md:w-6 h-5 md:h-6 mx-2 rounded border transition-all duration-200 flex items-center justify-center ${
                                selectedPlatforms.includes(post.platform)
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "bg-white border-gray-300 hover:border-blue-500"
                              }`}
                            >
                              {selectedPlatforms.includes(post.platform) && (
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </label>
                        )}

                      {isConnected &&
                        publishedPlatforms.includes(post.platform) && (
                          <div className="flex items-center gap-1 text-xs md:text-sm px-2 py-1 rounded-md bg-purple-200 text-purple-600 font-medium">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>{t("published")}</span>
                          </div>
                        )}

                      {!isConnected && (
                        <button
                          onClick={() => handleConnectPlatform(post.platform)}
                          disabled={isConnecting}
                          className="flex items-center gap-2 px-3 py-1 capitalize rounded-md bg-purple-600 text-sm font-medium text-white disabled:opacity-50"
                        >
                          {isConnecting ? (
                            <>
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                              <span>{t("connecting")}...</span>
                            </>
                          ) : (
                            t("connect")
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* {post.platform === "tiktok" && (
                  <div className="mt-2 p-4 bg-purple-50 border border-purple-200 rounded-md space-y-3">
                    <h3 className="font-semibold text-purple-900 text-sm">
                      TikTok Settings (required for Direct Post compliance)
                    </h3>

                    {tiktokCreatorInfo?.nickname && (
                      <p className="text-xs text-purple-800">
                        Posting to TikTok account:{" "}
                        <strong>{tiktokCreatorInfo.nickname}</strong>
                      </p>
                    )}

                    {tiktokPostingBlockedReason && (
                      <p className="text-xs text-red-600">
                        {tiktokPostingBlockedReason}
                      </p>
                    )}

                    <div className="p-3 bg-white border border-blue-600  rounded-md text-xs text-blue-800">
                      <span className="font-semibold">
                        ℹ️ TikTok Direct Post:
                      </span>{" "}
                      Required settings must be configured before publishing.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                      <div className="flex flex-col gap-1">
                        <label className="font-medium text-purple-900">
                          TikTok Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={tiktokSettings.title}
                          onChange={(e) =>
                            setTiktokSettings((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="border border-purple-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Enter a title for your TikTok post"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-medium text-purple-900">
                          TikTok Privacy Status{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={tiktokSettings.privacyLevel}
                          onChange={(e) =>
                            setTiktokSettings((prev) => ({
                              ...prev,
                              privacyLevel: e.target
                                .value as TikTokPrivacyLevel,
                            }))
                          }
                          className="border border-purple-200 rounded-md px-2 py-1 bg-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="" disabled>
                            Select privacy level
                          </option>
                          {(
                            tiktokCreatorInfo?.privacy_level_options ?? [
                              "SELF_ONLY",
                              "FRIENDS",
                              "EVERYONE",
                            ]
                          ).map((opt) => {
                            const isPrivate = ["SELF_ONLY", "PRIVATE"].includes(
                              opt.toUpperCase()
                            );
                            const disabled =
                              tiktokSettings.isBrandedContent && isPrivate;

                            return (
                              <option
                                key={opt}
                                value={opt}
                                disabled={disabled}
                                title={
                                  disabled
                                    ? "Branded content visibility cannot be private"
                                    : undefined
                                }
                              >
                                {opt}
                              </option>
                            );
                          })}
                        </select>
                        {tiktokSettings.isBrandedContent && (
                          <p className="text-[11px] text-purple-700">
                            Branded content cannot be posted with "only me"
                            visibility.
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-purple-900">
                          Interaction Options
                        </span>
                        <div className="flex flex-col gap-1">
                          {[
                            { key: "allowComment", label: "Allow comments" },
                            { key: "allowDuet", label: "Allow Duet" },
                            { key: "allowStitch", label: "Allow Stitch" },
                          ].map(({ key, label }) => (
                            <label
                              key={key}
                              className="inline-flex items-center gap-2 text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  tiktokSettings[
                                    key as keyof TikTokSettingsState
                                  ] as boolean
                                }
                                onChange={(e) =>
                                  setTiktokSettings((prev) => ({
                                    ...prev,
                                    [key]: e.target.checked,
                                  }))
                                }
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="flex items-center gap-1 text-xs font-medium text-purple-900">
                          <input
                            type="checkbox"
                            checked={tiktokSettings.isCommercial}
                            onChange={(e) =>
                              setTiktokSettings((prev) => ({
                                ...prev,
                                isCommercial: e.target.checked,
                                ...(e.target.checked
                                  ? {}
                                  : {
                                      isYourBrand: false,
                                      isBrandedContent: false,
                                    }),
                              }))
                            }
                          />
                          <span>
                            This TikTok post promotes yourself, a brand, product
                            or service
                          </span>
                        </label>

                        {tiktokSettings.isCommercial && (
                          <div className="ml-5 mt-1 space-y-1">
                            <label className="inline-flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={tiktokSettings.isYourBrand}
                                onChange={(e) =>
                                  setTiktokSettings((prev) => ({
                                    ...prev,
                                    isYourBrand: e.target.checked,
                                  }))
                                }
                              />
                              <span>Your brand</span>
                            </label>

                            <label className="inline-flex items-center gap-2 text-xs ml-4">
                              <input
                                type="checkbox"
                                checked={tiktokSettings.isBrandedContent}
                                onChange={(e) =>
                                  setTiktokSettings((prev) => ({
                                    ...prev,
                                    isBrandedContent: e.target.checked,
                                  }))
                                }
                              />
                              <span>Branded content (third party)</span>
                            </label>

                            {!tiktokSettings.isYourBrand &&
                              !tiktokSettings.isBrandedContent && (
                                <p className="text-[11px] text-purple-700">
                                  You need to indicate if your content promotes
                                  yourself, a third party, or both.
                                </p>
                              )}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-[11px] text-purple-900">
                      {(() => {
                        const { isCommercial, isYourBrand, isBrandedContent } =
                          tiktokSettings;
                        if (
                          !isCommercial ||
                          (isYourBrand && !isBrandedContent)
                        ) {
                          return "By posting, you agree to TikTok's Music Usage Confirmation.";
                        }
                        if (isBrandedContent) {
                          return "By posting, you agree to TikTok's Branded Content Policy and Music Usage Confirmation.";
                        }
                        return "By posting, you agree to TikTok's Music Usage Confirmation.";
                      })()}
                    </p>

                    <p className="mt-1 text-[11px] text-purple-700">
                      After publishing, TikTok may take a few minutes to process
                      your video.
                    </p>
                  </div>
                )} */}
              </React.Fragment>
            );
          })}
        </div>

        <div className="hidden">
          <SocialMediaManager
            userId={userId || ""}
            onCredentialsUpdate={checkConnectedPlatforms}
            handleConnectPlatform={handleConnectPlatform}
            handleDisconnectPlatform={handleDisconnectPlatform}
          />
        </div>

        {/* Platform-specific selectors */}
        {connectedPlatforms.includes("facebook") &&
          selectedPlatforms.includes("facebook") && (
            <div className="mb-4 p-3 bg-white border border-blue-600  rounded-md">
              <h4 className="font-medium text-black mb-2">
                {t("facebook_page_selection")}
              </h4>
              <p className="text-blue-700 text-sm mb-3">
                {t("choose_facebook_page_to_post_to")}
              </p>

              {facebookPages.length > 0 ? (
                <select
                  value={selectedFacebookPage}
                  onChange={(e) => setSelectedFacebookPage(e.target.value)}
                  className="w-full p-2.5 border border-blue-600 rounded-md focus:ring-1   focus:ring-blue-500"
                >
                  {facebookPages.map((page: any) => (
                    <option key={page.id} value={page.id}>
                      {page.name} ({page.category})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-yellow-700 text-sm">
                  Loading Facebook pages... If they don't appear, check your
                  connection.
                </p>
              )}
            </div>
          )}

        {connectedPlatforms.includes("linkedin") &&
          selectedPlatforms.includes("linkedin") &&
          linkedinPages.length > 0 && (
            <div className="mb-6 p-3 bg-white border border-blue-600  rounded-md">
              <h4 className="font-medium text-black mb-2">
                LinkedIn Page Selection
              </h4>
              <p className="text-blue-700 text-sm mb-3">
                Choose your default LinkedIn page for publishing:
              </p>
              <select
                value={selectedLinkedinPage}
                onChange={(e) => setSelectedLinkedinPage(e.target.value)}
                className="w-full p-2.5 border border-blue-600 rounded-md focus:ring-1   focus:ring-blue-500"
              >
                <option value="">Personal Account</option>
                {linkedinPages.map((page: any) => (
                  <option key={page.urn} value={page.urn}>
                    {page.name}
                  </option>
                ))}
              </select>
            </div>
          )}

        {connectedPlatforms.includes("youtube") &&
          selectedPlatforms.includes("youtube") &&
          youtubeChannels.length > 0 && (
            <div className="mb-4 p-4 bg-white border border-blue-600   rounded-md">
              <h4 className="font-medium text-black mb-2">
                {t("youtube_channel_selection")}
              </h4>
              <p className="text-blue-700 text-sm mb-3">
                {t("choose_youtube_channel_to_upload_to")}
              </p>
              <select
                value={selectedYoutubeChannel}
                onChange={(e) => setSelectedYoutubeChannel(e.target.value)}
                className="w-full p-2.5 border border-blue-600 rounded-md focus:ring-1   focus:ring-blue-500"
              >
                {youtubeChannels.map((channel: any) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.snippet.title}
                  </option>
                ))}
              </select>
            </div>
          )}

        <button
          onClick={handlePublish}
          disabled={
            publishing ||
            selectedPlatforms.filter(
              (p) =>
                connectedPlatforms.includes(p) &&
                !publishedPlatforms.includes(p)
            ).length === 0
          }
          className={`w-full rounded-md py-2.5 px-4 font-medium text-white font-semibold transition-colors mb-4 flex items-center justify-center gap-2 ${
            publishing
              ? "bg-purple-400 cursor-wait"
              : selectedPlatforms.filter(
                    (p) =>
                      connectedPlatforms.includes(p) &&
                      !publishedPlatforms.includes(p)
                  ).length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {publishing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t("publish")}</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {selectedPlatforms.filter(
                  (p) =>
                    connectedPlatforms.includes(p) &&
                    !publishedPlatforms.includes(p)
                ).length === 0
                  ? publishedPlatforms.length > 0
                    ? t("all_selected_platforms_published")
                    : t("select_platform_publish")
                  : t("publish_to_platforms")}
              </span>
            </>
          )}
        </button>

        <button
          onClick={handleDiscardClick}
          className="w-full rounded-md theme-bg-light px-4 py-2.5 text-center font-semibold text-base border border-[#7650e3] text-[#7650e3] hover:bg-[#d7d7fc] transition-colors"
        >
          {t("discard_post")}
        </button>

        <button
          onClick={onBack}
          className="mt-4 w-full rounded-md theme-bg-light px-4 py-2.5 text-center font-semibold text-base border border-[#7650e3] text-[#7650e3] hover:bg-[#d7d7fc] transition-colors"
        >
          {t("back")}
        </button>

        {selectedPlatforms.filter(
          (p) =>
            connectedPlatforms.includes(p) && !publishedPlatforms.includes(p)
        ).length === 0 &&
          publishedPlatforms.length === 0 && (
            <p className="mt-3 text-sm text-gray-500 font-medium text-center">
              {t("select_platform_warning")}
            </p>
          )}

        {publishedPlatforms.length > 0 &&
          selectedPlatforms.filter(
            (p) =>
              connectedPlatforms.includes(p) && !publishedPlatforms.includes(p)
          ).length === 0 && (
            <p className="mt-3 text-sm text-green-600 text-center font-medium">
              {t("all_selected_platforms_published_successfully")}{" "}
              {connectedPlatforms.filter(
                (p: any) => !publishedPlatforms.includes(p)
              ).length === 0
                ? "Returning to content creation..."
                : `You can select from ${
                    connectedPlatforms.filter(
                      (p: any) => !publishedPlatforms.includes(p)
                    ).length
                  } remaining platforms.`}
            </p>
          )}

        {results && (
          <div className="mt-8">
            <h3 className="font-semibold mb-4 text-slate-900">
              {t("publishing_results")}
            </h3>

            {results._summary && (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {results._summary.total}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      Total
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {results._summary.successful}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      Successful
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {results._summary.failed}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      Failed
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {Object.entries(results)
                .filter(([key]) => key !== "_summary")
                .map(([platform, result]: [string, any]) => (
                  <div
                    key={platform}
                    className={`border rounded-md p-4 ${
                      result.success
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <h4
                      className={`font-medium ${
                        result.success ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {result.success ? "✅" : "❌"} {platform}
                    </h4>
                    <p
                      className={`text-sm mt-1 ${
                        result.success ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {result.message || result.error}
                    </p>
                    {!result.success && result.retryable && (
                      <p className="text-xs text-amber-600 mt-1">
                        💡 Temporary error — try again later
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

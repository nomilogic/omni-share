import React, { useState, useEffect, useCallback } from "react";
import { GeneratedPost, Platform } from "../types";
import { postToAllPlatforms } from "../lib/socialPoster";
import { SocialMediaManager } from "./SocialMediaManager";
import { socialMediaAPI } from "../lib/socialMediaApi";
import { oauthManagerClient } from "../lib/oauthManagerClient";
import { historyRefreshService } from "../services/historyRefreshService";
import Icon from "./Icon";
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

type TikTokPrivacyLevel = string; // e.g. "SELF_ONLY", "FRIENDS", "PUBLIC" – comes from creator_info

interface TikTokCreatorInfo {
  nickname?: string;
  max_video_post_duration_sec?: number;
  privacy_level_options?: TikTokPrivacyLevel[];
  // Optional flags – we use them defensively if backend exposes them
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

const ALL_PLATFORMS: Platform[] = [
  "linkedin",
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
];

export const PublishPosts: React.FC<PublishProps> = ({
  posts,
  userId,
  onBack,
  onReset,
}) => {
  const { t, i18n } = useTranslation();
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    posts.map((p) => p.platform)
  );
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Platform[]>([]);
  const [publishProgress, setPublishProgress] = useState<
    Record<string, "pending" | "success" | "error">
  >({});
  const [connectingPlatforms, setConnectingPlatforms] = useState<Platform[]>(
    []
  );
  const [selectedlinkedinPage, setSelectedlinkedinPage] = useState<string>("");
  const [linkedinPages, setlinkedinPages] = useState<any[]>([]);

  const [facebookPages, setFacebookPages] = useState<any[]>([]);
  const [youtubeChannels, setYoutubeChannels] = useState<any[]>([]);
  const [selectedFacebookPage, setSelectedFacebookPage] = useState<string>("");
  const [selectedYoutubeChannel, setSelectedYoutubeChannel] =
    useState<string>("");
  const [publishedPlatforms, setPublishedPlatforms] = useState<Platform[]>([]);
  const [loadingFacebookPages, setLoadingFacebookPages] =
    useState<boolean>(false);
  const { openModal } = useModal();
  const { fetchUnreadCount } = useAppContext();

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
  const [tiktokPostingBlockedReason, setTiktokPostingBlockedReason] =
    useState<string | null>(null);

  const navigate = useNavigate();

  // On mount, mirror AccountsPage behaviour: immediately check which platforms
  // are already connected, regardless of current posts.
  useEffect(() => {
    console.log("[PublishPosts] Checking initially connected platforms for user:", userId);
    checkConnectedPlatforms();
  }, []);

  // Fetch latest TikTok creator info whenever TikTok is connected & present in posts
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

        if (creatorInfo.can_post === false) {
          setTiktokPostingBlockedReason(
            creatorInfo.blocked_reason ||
              "TikTok posting is temporarily unavailable for this account. Please try again later."
          );
        } else {
          setTiktokPostingBlockedReason(null);
        }
      } catch (e: any) {
        console.error("Failed to fetch TikTok creator info:", e);
        // Do not hard-block publish if creator_info fails; backend will enforce caps.
      }
    };

    fetchCreatorInfo();
  }, [posts]);

  const checkConnectedPlatforms = async () => {
    try {
      // Get the authentication token
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.warn("No authentication token found");
        setConnectedPlatforms([]);
        return;
      }

      const response = await API.connectionsStatus();

      const statusData = response.data;

      const connected: Platform[] = [];
      // Align behaviour with AccountsPage: check all known platforms,
      // not just those present in the current posts array.
      for (const platform of ALL_PLATFORMS) {
        if (statusData[platform]?.connected) {
          connected.push(platform);
        }
      }
      setConnectedPlatforms(connected);
      console.log(connected, "platforms connected");

      if (connected.includes("facebook")) {
        await fetchFacebookPages();
      }
      if (connected.includes("linkedin")) {
        await fetchLinkedPages();
      }

      // Fetch YouTube channels if YouTube is connected
      if (connected.includes("youtube")) {
        await fetchYouTubeChannels();
      }
    } catch (error) {
      console.error("Failed to check connected platforms:", error);
      setConnectedPlatforms([]);
    }
  };

  const confirmNavigationAction = useCallback(() => {
    navigate("/content");
  }, [navigate]);

  // ✅ BUTTON CLICK HANDLER
  const handleDiscardClick = useCallback(() => {
    // openModal ko call karein aur woh saare props pass karein jo zaroori hain.
    openModal(DiscardWarningModal, {
      t: t,
      onConfirmAction: confirmNavigationAction, // Action pass karein
    });
    // Ab na state badalni hai, na pending action save karna hai.
  }, [t, confirmNavigationAction]);

  const fetchLinkedPages = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const tokenResponse = await API.tokenForPlatform("linkedin");

      if (tokenResponse?.data) {
        const tokenData = await tokenResponse?.data;
        if (tokenData.connected && tokenData.token?.access_token) {
          const res = await API.linkedinPages(tokenData.token?.access_token);
          if (res?.data) {
            const pagesData = await res.data;
            setlinkedinPages(pagesData.data || []);
            setSelectedlinkedinPage(pagesData?.data[0]?.urn);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch Facebook pages:", error);
    }
  };
  const fetchFacebookPages = async () => {
    setLoadingFacebookPages(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.warn("No auth token found");
        return;
      }

      const tokenResponse = await API.tokenForPlatform("facebook");
      console.log("Token response:", tokenResponse);

      if (tokenResponse?.data) {
        const tokenData = await tokenResponse.data;
        console.log("Token data:", tokenData);

        if (tokenData.connected && tokenData.token?.access_token) {
          console.log(
            "Fetching Facebook pages with token:",
            tokenData.token.access_token.substring(0, 10) + "..."
          );

          const pagesResponse = await API.facebookPages(
            tokenData.token.access_token
          );
          console.log("Pages response:", pagesResponse);

          // Handle both possible response structures
          let pagesData = [];

          // Check if response has status 200 and data.data
          if (pagesResponse?.data?.data) {
            pagesData = Array.isArray(pagesResponse.data.data)
              ? pagesResponse.data.data
              : [];
          }
          // Check if response directly has pages array
          else if (pagesResponse?.pages) {
            pagesData = Array.isArray(pagesResponse.pages)
              ? pagesResponse.pages
              : [];
          }
          // Check if response.data has pages array
          else if (pagesResponse?.data?.pages) {
            pagesData = Array.isArray(pagesResponse.data.pages)
              ? pagesResponse.data.pages
              : [];
          }

          console.log("Extracted pages data:", pagesData);
          setFacebookPages(pagesData);

          if (pagesData && pagesData.length > 0 && !selectedFacebookPage) {
            setSelectedFacebookPage(pagesData[0].id);
            console.log("Set initial page:", pagesData[0].id);
          }
        } else {
          console.warn("Facebook not connected or no access token");
        }
      } else {
        console.warn("No token response data");
      }
    } catch (error) {
      console.error("Failed to fetch Facebook pages:", error);
    } finally {
      setLoadingFacebookPages(false);
    }
  };

  const fetchYouTubeChannels = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const tokenResponse = await API.tokenForPlatform("youtube");

      if (tokenResponse.data) {
        const tokenData = await tokenResponse.data;
        if (tokenData.connected && tokenData.token?.access_token) {
          const channelsResponse = await fetch(
            `/api/youtube/channels?access_token=${tokenData.token.access_token}`
          );
          if (channelsResponse.ok) {
            const channelsData = await channelsResponse.json();
            setYoutubeChannels(channelsData.channels || []);
            if (
              channelsData.channels &&
              channelsData.channels.length > 0 &&
              !selectedYoutubeChannel
            ) {
              setSelectedYoutubeChannel(channelsData.channels[0].id);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch YouTube channels:", error);
    }
  };

  const handleConnect = async (platform: Platform) => {
    console.log("Connecting to platform:", platform);

    try {
      setConnectingPlatforms((prev) => [...prev, platform]);

      // Start OAuth flow (JWT-authenticated)
      const result: any = await oauthManagerClient.startOAuthFlow(platform);
      const { authUrl } = result.data.data;
      console.log("Opening OAuth popup with URL:", authUrl);

      const authWindow = window.open(
        authUrl,
        `${platform}_oauth`,
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );
      if (!authWindow) {
        throw new Error("OAuth popup blocked");
      }

      // Listen for messages from the OAuth callback
      const messageListener = (event: MessageEvent) => {
        if (
          event.data.type === "oauth_success" &&
          event.data.platform === platform
        ) {
          console.log("OAuth success for", platform);
          // Close popup from parent window for better browser compatibility
          try {
            authWindow?.close();
          } catch (error) {
            console.warn("Could not close popup from parent:", error);
          }
          setTimeout(checkConnectedPlatforms, 1000);
          window.removeEventListener("message", messageListener);
        } else if (event.data.type === "oauth_error") {
          console.error("OAuth error:", event.data.error);
          // Close popup from parent window for better browser compatibility
          try {
            authWindow?.close();
          } catch (error) {
            console.warn("Could not close popup from parent:", error);
          }

          window.removeEventListener("message", messageListener);
          setError(
            `Failed to connect ${platform}: ${
              event.data.error || "OAuth failed"
            }`
          );
        }
      };

      window.addEventListener("message", messageListener);

      // Monitor window closure as fallback (same as AccountsPage)
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", messageListener);
          setTimeout(checkConnectedPlatforms, 1000);
        }
      }, 1000);
    } catch (error) {
      console.error("Error connecting to platform:", error);
      setError(
        `Failed to connect ${platform}: ${
          error instanceof Error ? error.message : "Connection failed"
        }`
      );
    } finally {
      setConnectingPlatforms((prev) => prev.filter((p) => p !== platform));
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    // if (
    //   !confirm(
    //     `Are you sure you want to disconnect ${getPlatformDisplayName(platform)}?`,
    //   )
    // ) {
    //   return;
    // }

    try {
      // Use the OAuth manager client for disconnecting (uses JWT authentication)
      await oauthManagerClient.disconnectPlatform(platform);

      checkConnectedPlatforms();
      // window.removeEventListener("message", messageListener);
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const isTikTokSelectedAndConnected = () => {
    return (
      selectedPlatforms.includes("tiktok") &&
      connectedPlatforms.includes("tiktok") &&
      posts.some((p) => p.platform === "tiktok")
    );
  };

  const handlePublish = async () => {
    // TikTok-specific validation before building availablePlatforms
    if (isTikTokSelectedAndConnected()) {
      const tikTokPost = posts.find((p) => p.platform === "tiktok");

      if (tiktokPostingBlockedReason) {
        setError(tiktokPostingBlockedReason);
        return;
      }

      if (!tiktokSettings.title.trim()) {
        setError("Please enter a TikTok title before publishing.");
        return;
      }

      if (!tiktokSettings.privacyLevel) {
        setError("Please select a TikTok privacy status before publishing.");
        return;
      }

      if (tiktokSettings.isCommercial) {
        if (!tiktokSettings.isYourBrand && !tiktokSettings.isBrandedContent) {
          setError(
            "For TikTok commercial content, please indicate if it promotes yourself, a third party, or both."
          );
          return;
        }
      }

      // If branded content is selected, disallow private / only-me visibility
      const privacyIsPrivate =
        tiktokSettings.privacyLevel.toUpperCase() === "SELF_ONLY" ||
        tiktokSettings.privacyLevel.toUpperCase() === "PRIVATE";

      if (tiktokSettings.isBrandedContent && privacyIsPrivate) {
        setError(
          "TikTok branded content cannot be set to private. Please choose a more public visibility option."
        );
        return;
      }

      // Enforce max video duration if both creatorInfo and post provide it
      // Allow 30 second buffer for encoding/processing differences
      if (
        tikTokPost?.tiktokVideoDurationSec &&
        tiktokCreatorInfo?.max_video_post_duration_sec &&
        tikTokPost.tiktokVideoDurationSec >
          (tiktokCreatorInfo.max_video_post_duration_sec + 30)
      ) {
        setError(
          `Your TikTok video duration (${Math.round(tikTokPost.tiktokVideoDurationSec)}s) exceeds your account limit (${tiktokCreatorInfo.max_video_post_duration_sec}s). Please use a shorter video.`
        );
        return;
      }
    }

    const availablePlatforms = selectedPlatforms.filter(
      (p) => connectedPlatforms.includes(p) && !publishedPlatforms.includes(p)
    );

    if (availablePlatforms.length === 0) {
      setError(
        `No available platforms to publish to. All connected platforms have been published or none are selected.`
      );
      return;
    }

    setPublishing(true);
    setError(null);
    setPublishProgress({});

    try {
      // Only process posts for available platforms (connected and not published)
      // Enrich TikTok post with settings before publishing
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

      const youtubePost = selectedPosts.find(
        (post) => post.platform === "youtube"
      );
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
          linkedinPageId: selectedlinkedinPage || undefined,
          facebookPageId: selectedFacebookPage || undefined,
          youtubeChannelId: selectedYoutubeChannel || undefined,
          thumbnailUrl: thumbnailUrl || undefined,
        }
      );

      setResults(publishResults);

      // Check if all originally selected connected platforms have been published
      const originalConnectedPlatforms = posts
        .map((p) => p.platform)
        .filter((p) => connectedPlatforms.includes(p));

      const newlyPublished = Object.entries(publishResults)
        .filter(([key, result]) => key !== "_summary" && result.success)
        .map(([platform]) => platform as Platform);

      const allPublishedPlatforms = [...publishedPlatforms, ...newlyPublished];

      // If any posts were published successfully, trigger history refresh
      if (newlyPublished.length > 0) {
        console.log(
          `🚀 Successfully published to ${newlyPublished.length} platforms, triggering history refresh...`
        );
        // Delay slightly to allow the API to fully save the posts
        setTimeout(() => {
          historyRefreshService.refreshHistory();
        }, 500);
      }

      // Check if all connected platforms have been published
      const allConnectedPlatformsPublished = originalConnectedPlatforms.every(
        (p) => allPublishedPlatforms.includes(p)
      );

      if (allConnectedPlatformsPublished && onReset) {
        console.log(
          "All connected platforms published successfully, triggering reset workflow in 3 seconds..."
        );
        setTimeout(() => {
          onReset();
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to publish posts.");
    } finally {
      setPublishing(false);
      fetchUnreadCount();
    }
  };

  return (
    <div className="theme-bg-light max-w-4xl mx-auto mt-4">
      <div className="lg:px-4 px-3 lg:py-8 py-4">
        <h2 className="text-2xl font-bold theme-text-primary mb-2">
          {t("publish_posts")}
        </h2>

        <div className=" p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">{connectedPlatforms.length}</span> of{" "}
            <span className="font-medium">{posts.length}</span>{" "}
            {t("platforms_connected")}
          </p>
        </div>

        {/* TikTok-specific settings (shown only when TikTok post exists) */}
        {posts.some((p) => p.platform === "tiktok") && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-md space-y-3">
            <h3 className="font-semibold text-purple-900 text-sm">
              TikTok Settings (required for Direct Post compliance)
            </h3>

            {tiktokCreatorInfo?.nickname && (
              <p className="text-xs text-purple-800">
                Posting to TikTok account: <strong>{tiktokCreatorInfo.nickname}</strong>
              </p>
            )}

            {tiktokPostingBlockedReason && (
              <p className="text-xs text-red-600">
                {tiktokPostingBlockedReason}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
              <div className="flex flex-col gap-1">
                <label className="font-medium text-purple-900">
                  TikTok Title
                  <span className="text-red-500">*</span>
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
                  className="border border-purple-200 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter a title for your TikTok post"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium text-purple-900">
                  TikTok Privacy Status
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={tiktokSettings.privacyLevel}
                  onChange={(e) =>
                    setTiktokSettings((prev) => ({
                      ...prev,
                      privacyLevel: e.target.value as TikTokPrivacyLevel,
                    }))
                  }
                  className="border border-purple-200 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white"
                >
                  <option value="" disabled>
                    Select privacy level
                  </option>
                  {(tiktokCreatorInfo?.privacy_level_options || [
                    "SELF_ONLY",
                    "FRIENDS",
                    "EVERYONE",
                  ]).map((opt) => {
                    const isPrivateOption =
                      opt.toUpperCase() === "SELF_ONLY" ||
                      opt.toUpperCase() === "PRIVATE";
                    const disabled =
                      tiktokSettings.isBrandedContent && isPrivateOption;
                    return (
                      <option
                        key={opt}
                        value={opt}
                        disabled={disabled}
                        title={
                          disabled
                            ? "Branded content visibility cannot be set to private."
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
                    Branded content cannot be posted with "only me" visibility.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-medium text-purple-900">
                  Interaction Options
                </span>
                <div className="flex flex-col gap-1">
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={tiktokSettings.allowComment}
                      onChange={(e) =>
                        setTiktokSettings((prev) => ({
                          ...prev,
                          allowComment: e.target.checked,
                        }))
                      }
                    />
                    <span>Allow comments</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={tiktokSettings.allowDuet}
                      onChange={(e) =>
                        setTiktokSettings((prev) => ({
                          ...prev,
                          allowDuet: e.target.checked,
                        }))
                      }
                    />
                    <span>Allow Duet</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={tiktokSettings.allowStitch}
                      onChange={(e) =>
                        setTiktokSettings((prev) => ({
                          ...prev,
                          allowStitch: e.target.checked,
                        }))
                      }
                    />
                    <span>Allow Stitch</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-purple-900">
                  <input
                    type="checkbox"
                    checked={tiktokSettings.isCommercial}
                    onChange={(e) =>
                      setTiktokSettings((prev) => ({
                        ...prev,
                        isCommercial: e.target.checked,
                        // Reset options if turning off
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
                    This TikTok post promotes yourself, a brand, product or
                    service
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
                    <label className="inline-flex items-center gap-2 text-xs ml-4 ">
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
                          You need to indicate if your content promotes yourself,
                          a third party, or both.
                        </p>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* TikTok legal declaration text */}
            <p className="mt-2 text-[11px] text-purple-900">
              {(() => {
                const { isCommercial, isYourBrand, isBrandedContent } =
                  tiktokSettings;
                if (!isCommercial || (isYourBrand && !isBrandedContent)) {
                  return "By posting, you agree to TikTok's Music Usage Confirmation.";
                }
                if (isBrandedContent) {
                  return "By posting, you agree to TikTok's Branded Content Policy and Music Usage Confirmation.";
                }
                return "By posting, you agree to TikTok's Music Usage Confirmation.";
              })()}
            </p>

            {/* Processing note per TikTok guidelines */}
            <p className="mt-1 text-[11px] text-purple-700">
              After you publish, TikTok may take a few minutes to process your
              video before it appears on your profile.
            </p>
          </div>
        )}

        <div className="mb-4 mt-4">
          <div className="space-y-4">
            {posts.map((post) => {
              const isConnected = connectedPlatforms.includes(post.platform);
              const isConnecting = connectingPlatforms.includes(post.platform);
              const progress = publishProgress[post.platform];

              // Duration-based disablement for TikTok (uses creator_info limit)
              const durationSec = (post as any).tiktokVideoDurationSec as number | undefined;
              const tiktokDurationLimit =
                post.platform === "tiktok"
                  ? tiktokCreatorInfo?.max_video_post_duration_sec
                  : undefined;
              
              // Only disable if we have a duration AND a limit AND duration is significantly over
              // Allow some buffer (30 seconds grace period) for encoding/processing differences
              const disableByDuration =
                post.platform === "tiktok" &&
                !!durationSec &&
                !!tiktokDurationLimit &&
                durationSec > (tiktokDurationLimit + 30);

              return (
                <div
                  key={post.platform}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Platform Icon */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${getPlatformIconBackgroundColors(
                        post.platform
                      )}`}
                    >
                      {(() => {
                        const IconComponent = getPlatformIcon(post.platform);
                        if (!IconComponent) {
                          return (
                            <span className="text-lg font-bold ">
                              {post.platform.substring(0, 2)}
                            </span>
                          );
                        }
                        return <IconComponent className="w-6 h-6" />;
                      })()}
                    </div>

                    {/* Platform Info */}
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
                      
                      {/* Video Limits Display - Only show when there's video content */}
                      {(() => {
                        const mediaUrl = post.mediaUrl || post.imageUrl;
                        const isVideo = mediaUrl && (
                          /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|3gp)(\?.*)?$/i.test(mediaUrl) ||
                          (post as any).isVideoContent ||
                          (post as any).mediaType === "video"
                        );
                        
                        if (!isVideo) return null;

                        const videoAspectRatio = (post as any).videoAspectRatio;
                        const isShorts = videoAspectRatio && videoAspectRatio >= 0.5 && videoAspectRatio <= 0.65;
                        
                        const videoLimits = getPlatformVideoLimits(post.platform, isShorts);
                        if (videoLimits) {
                          return (
                            <div className="mt-2 text-xs text-gray-600 space-y-1">
                              <p className="font-medium text-gray-700">
                                {isShorts ? "Shorts" : "Video"} Limits:
                              </p>
                              <p>Aspect Ratio: <span className="font-semibold">{videoLimits.aspectRatio}</span></p>
                              <p>Max Duration: <span className="font-semibold">{videoLimits.maxDuration}</span></p>
                              <p>Max File Size: <span className="font-semibold">{videoLimits.maxFileSize}</span></p>
                              {videoLimits.notes && (
                                <p className="text-yellow-700 italic mt-1">⚠️ {videoLimits.notes}</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {disableByDuration && (
                        <p className="text-xs text-red-600 mt-1">
                          This video is longer than your TikTok account's allowed
                          duration; TikTok is disabled for this post.
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
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => handleConnect(post.platform)}
                          disabled={isConnecting}
                          className="p-2 text-gray-500 font-medium hover:text-blue-600 disabled:opacity-50 rounded-md hover:bg-gray-100"
                          title="Refresh connection"
                        >
                          <RefreshCw className={`w-4 h-4`} />
                        </button>
                        <button
                          onClick={() => handleDisconnect(post.platform)}
                          disabled={isConnecting}
                          className="p-2 text-gray-500 font-medium hover:text-red-600 disabled:opacity-50 rounded-md hover:bg-gray-100"
                          title="Disconnect"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <> </>
                    )}

                    <div className="flex items-center gap-2">
                      {isConnected &&
                        !publishedPlatforms.includes(post.platform) &&
                        !disableByDuration && (
                          <label
                            className="flex items-center cursor-pointer"
                            htmlFor={`platform-${post.platform}`}
                          >
                            <div className="relative">
                              <input
                                className="text-green-500 focus:ring-green-400 hidden absolute opacity-0 w-0 h-0"
                                type="checkbox"
                                checked={selectedPlatforms.includes(
                                  post.platform
                                )}
                                onChange={(e) => {
                                  setSelectedPlatforms((prev) =>
                                    e.target.checked
                                      ? [...prev, post.platform]
                                      : prev.filter((p) => p !== post.platform)
                                  );
                                }}
                                id={`platform-${post.platform}`}
                              />
                              <div
                                className={`w-6 h-6 rounded border-2 transition-all duration-200 flex items-center justify-center ${
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
                            </div>
                          </label>
                        )}

                      {isConnected &&
                        publishedPlatforms.includes(post.platform) && (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-purple-200 bg-green-100 text-purple-600 text-sm font-medium">
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
                            <span>PUBLISHED</span>
                          </div>
                        )}

                      {!isConnected && (
                        <button
                          onClick={() => handleConnect(post.platform)}
                          disabled={isConnecting}
                          className="flex items-center gap-2 px-3 py-1 capitalize rounded-md bg-purple-600 text-sm font-medium text-white"
                        >
                          {isConnecting ? (
                            <>
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
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
              );
            })}
          </div>
        </div>

        <div className="hidden">
          <SocialMediaManager
            userId={userId || ""}
            onCredentialsUpdate={checkConnectedPlatforms}
          />
        </div>
        {connectedPlatforms.includes("facebook") &&
          selectedPlatforms.includes("facebook") && (
            <>
              {facebookPages.length > 0 ? (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {t("facebook_page_selection")}
                  </h4>
                  <p className="text-blue-700 text-sm mb-3">
                    {t("choose_facebook_page_to_post_to")}
                  </p>
                  <select
                    value={selectedFacebookPage}
                    onChange={(e) => setSelectedFacebookPage(e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {facebookPages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.name} ({page.category})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-700 text-sm">
                    📝 Loading Facebook pages... If they don't appear, check
                    your connection.
                  </p>
                </div>
              )}
            </>
          )}

        {connectedPlatforms.includes("youtube") &&
          selectedPlatforms.includes("youtube") &&
          youtubeChannels.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h4 className="font-medium text-red-900 mb-2">
                {t("youtube_channel_selection")}
              </h4>
              <p className="text-red-700 text-sm mb-3">
                {t("choose_youtube_channel_to_upload_to")}
              </p>
              <select
                value={selectedYoutubeChannel}
                onChange={(e) => setSelectedYoutubeChannel(e.target.value)}
                className="w-full p-3 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {youtubeChannels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.snippet.title}
                  </option>
                ))}
              </select>
            </div>
          )}

        {connectedPlatforms.includes("linkedin") &&
          connectedPlatforms.includes("linkedin") &&
          linkedinPages.length > 0 && (
            <div className="mb-6 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">
                Linkedin page Selection
              </h4>
              <p className="text-blue-700 text-sm mb-3">
                Choose your default Linkedin page for publishing:
              </p>
              <select
                value={selectedlinkedinPage}
                onChange={(e) => setSelectedlinkedinPage(e.target.value)}
                className="w-full p-3 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option
                  key={""}
                  value={""}
                  onClick={() => setSelectedlinkedinPage("")}
                >
                  {"Personal Account"}
                </option>
                {linkedinPages.map((page) => (
                  <option key={page.urn} value={page.urn}>
                    {page.name}
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
          className={`w-full rounded-md py-2.5 px-4 font-medium theme-text-light transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4 text-center text-white font-semibold transition-colors bg-purple-600 hover:bg-[#d7d7fc] hover:text-[#7650e3] border border-[#7650e3] ${
            selectedPlatforms.filter(
              (p) =>
                connectedPlatforms.includes(p) &&
                !publishedPlatforms.includes(p)
            ).length === 0
              ? "bg-gray-400"
              : publishing
              ? "theme-bg-trinary"
              : "bg-#7650e3"
          }`}
        >
          {publishing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>{t("publish")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
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
            </div>
          )}
        </button>

        <button
          onClick={handleDiscardClick}
          className="  rounded-md theme-bg-light px-4 py-2.5 w-full text-center font-semibold text-base border border-[#7650e3] text-[#7650e3] transition-colors hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] disabled:cursor-not-allowed"
        >
          {t("discard_post")}
        </button>

        <button
          onClick={onBack}
          className="rounded-md mt-5 theme-bg-light px-4 py-2.5 w-full text-center font-semibold text-base border border-[#7650e3] text-[#7650e3] transition-colors hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] disabled:cursor-not-allowed"
        >
          {t("back")}
        </button>

        {/* Helper text */}
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
              {t("all_selected_platforms_published_successfully")}
              {connectedPlatforms.filter((p) => !publishedPlatforms.includes(p))
                .length === 0
                ? "Returning to content creation..."
                : `You can select from ${
                    connectedPlatforms.filter(
                      (p) => !publishedPlatforms.includes(p)
                    ).length
                  } remaining platforms.`}
            </p>
          )}

        {/* Publishing Results */}
        {results && (
          <div className="mt-8">
            <h3 className="font-semibold mb-4 text-slate-900">
              {t("publishing_results")}
            </h3>

            {/* Summary */}
            {results._summary && (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {results._summary.total}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {t("total")}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {results._summary.successful}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {t("successful")}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {results._summary.failed}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {t("failed")}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Results */}
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
                    <div className="flex items-center justify-between">
                      <h4
                        className={`font-medium  ${
                          result.success ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {result.success ? "✅" : "❌"} {platform}
                      </h4>
                      {result.success && result.postId && (
                        <span className="text-xs text-gray-500 font-medium bg-gray-200 px-2 py-1 rounded-md">
                          ID: {result.postId}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        result.success ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {result.message || result.error}
                    </p>
                    {!result.success && result.retryable && (
                      <p className="text-xs text-amber-600 mt-1">
                        💡{t("error_temporary_try_again")}
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

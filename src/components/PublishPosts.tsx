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
import API from "../services/api";
import { useNavigate } from "react-router-dom";

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
  const [facebookPages, setFacebookPages] = useState<any[]>([]);
  const [youtubeChannels, setYoutubeChannels] = useState<any[]>([]);
  const [selectedFacebookPage, setSelectedFacebookPage] = useState<string>("");
  const [selectedYoutubeChannel, setSelectedYoutubeChannel] =
    useState<string>("");
  const [publishedPlatforms, setPublishedPlatforms] = useState<Platform[]>([]);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);
  const [pendingDiscardAction, setPendingDiscardAction] = useState<(() => void) | null>(null); 
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Publishing posts for user:", userId);
    //notify("error",'Publishing posts for user: ' + userId);
    checkConnectedPlatforms();
  }, [userId, posts]);

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
      for (const post of posts) {
        if (statusData[post.platform]?.connected) {
          connected.push(post.platform);
        }
      }
      setConnectedPlatforms(connected);
      console.log(connected, "platforms connected");

      if (connected.includes("facebook")) {
        await fetchFacebookPages();
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

  const handleDiscardClick = useCallback(() => {
    setPendingDiscardAction(onBack);
    setShowDiscardModal(true);
  }, [onBack]);

  const fetchFacebookPages = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const tokenResponse = await API.tokenForPlatform("facebook");

      if (tokenResponse.data) {
        const tokenData = await tokenResponse.data;
        console.log(tokenData);
        if (tokenData.connected && tokenData.token?.access_token) {
          const pagesResponse = await API.facebookPages(
            tokenData.token.access_token
          );
          console.log(pagesResponse, "pages");

          if (pagesResponse.status == "200") {
            const pagesData = await pagesResponse.data.data;
            setFacebookPages(pagesData || []);
            if (
              pagesData.pages &&
              pagesData.pages.length > 0 &&
              !selectedFacebookPage
            ) {
              setSelectedFacebookPage(pagesData.pages[0].id);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch Facebook pages:", error);
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

      const result: any = await oauthManagerClient.startOAuthFlow(platform);
      const { authUrl } = result.data.data;

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
          // Close popup immediately
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
          clearInterval(checkClosed);
          window.removeEventListener("message", messageListener);
          setTimeout(checkConnectedPlatforms, 500);
        } else if (event.data.type === "oauth_error") {
          console.error("OAuth error:", event.data.error);
          // Close popup immediately
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
          clearInterval(checkClosed);
          window.removeEventListener("message", messageListener);
          setError(
            `Failed to connect ${platform}: ${
              event.data.error || "OAuth failed"
            }`
          );
        }
      };

      window.addEventListener("message", messageListener);

      // Monitor window closure as fallback
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", messageListener);
          setTimeout(checkConnectedPlatforms, 500);
        }
      }, 500);
    } catch (error) {
      console.error("Error connecting to platform:", error);
      setError(
        `Failed to connect ${platform}: ${
          error instanceof Error ? error.message : "Connection failed"
        }`
      );
    } finally {
      setConnectingPlatforms((prev) => prev.filter((p) => p !== platform));
      // checkConnectedPlatforms();
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

  const handlePublish = async () => {
    // Filter to only connected platforms that are selected and not already published
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
      const selectedPosts = posts.filter((post) =>
        availablePlatforms.includes(post.platform)
      );

      console.log(
        `Publishing to ${
          availablePlatforms.length
        } platforms: ${availablePlatforms.join(", ")}`
      );

      // Get thumbnail URL from YouTube post for context
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
    }
  };

  return (
    <div className="theme-bg-light max-w-4xl mx-auto    ">
      <div className="lg:px-4 px-3 lg:py-8 py-4">
        <h2 className="text-2xl font-bold theme-text-primary mb-2">
          Publish Your Posts
        </h2>
        {/* <p className="text-sm text-gray-500 font-medium">
          Connect your social media accounts and publish your AI-generated posts
          directly.
        </p> */}

        {/* {posts.some((post) => !connectedPlatforms.includes(post.platform)) && (
          <div className=" p-4 theme-bg-quaternary rounded-md border border-purple-600 my-3">
            <div className="flex items-start gap-4">
              <div>
                <h3 className="font-semibold theme-text-secondary mb-1">
                  No Accounts Connected
                </h3>
                <p className="text-sm theme-text-secondary leading-relaxed">
                  Connect your social media accounts to start publishing content
                  across multiple platforms.
                </p>
              </div>
            </div>
          </div>
        )} */}

        <div className=" p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">{connectedPlatforms.length}</span> of{" "}
            <span className="font-medium">{ALL_PLATFORMS.length}</span>{" "}
            platforms connected
          </p>
        </div>

        <div className="md:mb-8 mb-4 mt-4">
          {/* <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900 mb-1">
                Select Platforms to Publish:
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                Connect your social media accounts to enable direct publishing
                across all platforms.
              </p>
            </div>
            {connectedPlatforms.filter((p) => !publishedPlatforms.includes(p))
              .length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setSelectedPlatforms(
                      connectedPlatforms.filter(
                        (p) => !publishedPlatforms.includes(p)
                      )
                    )
                  }
                  className="text-xs px-3 py-1 rounded-md bg-purple-600 theme-bg-quaternary theme-text-secondary transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedPlatforms([])}
                  className="text-xs px-3 py-1 rounded-md bg-purple-600 theme-bg-quaternary theme-text-secondary marker:transition-colors"
                >
                  Deselect All
                </button>
              </div>
            )}
          </div> */}

          {/* Selection Summary */}
          {/* {connectedPlatforms.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <span className="font-medium">
                  {
                    selectedPlatforms.filter(
                      (p) =>
                        connectedPlatforms.includes(p) &&
                        !publishedPlatforms.includes(p)
                    ).length
                  }
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {
                    connectedPlatforms.filter(
                      (p) => !publishedPlatforms.includes(p)
                    ).length
                  }
                </span>{" "}
                available platforms selected for publishing
              </p>
              {publishedPlatforms.length > 0 && (
                <p className="text-sm text-green-800 mt-1">
                  <span className="font-medium">
                    {publishedPlatforms.length}
                  </span>{" "}
                  platforms already published: {publishedPlatforms.join(", ")}
                </p>
              )}
            </div>
          )} */}

          <div className="space-y-3">
            {posts.map((post) => {
              const isConnected = connectedPlatforms.includes(post.platform);
              const isConnecting = connectingPlatforms.includes(post.platform);
              const progress = publishProgress[post.platform];

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
                        {isConnected ? "Connected" : "Not Connected"}
                      </p>
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

                  {/* Platform Selection Checkbox and Status */}
                  <div className="flex items-center gap-3">
                    {/* Connection Status Icon */}
                    {/* <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isConnected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isConnected ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8 9.414l-1.707 1.707a1 1 0 101.414 1.414L9 11.828l1.293 1.293a1 1 0 001.414-1.414L10.414 10.414l1.293-1.293a1 1 0 00-1.414-1.414L9 9.414 7.707 8.121a1 1 0 00-1.414 1.414L7.586 10.414 6.293 11.707a1 1 0 101.414 1.414L9 11.828l1.293 1.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div> */}
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

                    {/* Platform Selection and Connect Controls */}

                    <div className="flex items-center gap-2">
                      {/* Checkbox - Only show if connected and not published */}
                      {isConnected &&
                        !publishedPlatforms.includes(post.platform) && (
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

                      {/* Published indicator - Show when platform is published */}
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

                      {/* Connect Button - Only show when not connected */}
                      {!isConnected && (
                        <button
                          onClick={() => handleConnect(post.platform)}
                          disabled={isConnecting}
                          className="flex items-center gap-2 px-3 py-1 capitalize rounded-md bg-purple-600 text-sm font-medium text-white"
                        >
                          {isConnecting ? (
                            <>
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              <span>Connecting...</span>
                            </>
                          ) : (
                            "Connect"
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

        {/* Hidden Social Media Manager */}
        <div className="hidden">
          <SocialMediaManager
            userId={userId || ""}
            onCredentialsUpdate={checkConnectedPlatforms}
          />
        </div>
        {/* Platform-specific options (if needed) */}
        {connectedPlatforms.includes("facebook") &&
          selectedPlatforms.includes("facebook") &&
          facebookPages.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">
                Facebook Page Selection
              </h4>
              <p className="text-blue-700 text-sm mb-3">
                Choose which Facebook page to post to:
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
          )}

        {connectedPlatforms.includes("youtube") &&
          selectedPlatforms.includes("youtube") &&
          youtubeChannels.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <h4 className="font-medium text-red-900 mb-2">
                YouTube Channel Selection
              </h4>
              <p className="text-red-700 text-sm mb-3">
                Choose which YouTube channel to upload to:
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
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
          className={`w-full rounded-md py-2.5 px-4 font-medium theme-text-light transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-5 text-center text-white font-semibold transition-colors bg-purple-600 hover:bg-[#d7d7fc] hover:text-[#7650e3] border border-[#7650e3] ${
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
              <span>Publish...</span>
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
                    ? "All Selected Platforms Published"
                    : "Select Platform to Publish"
                  : "Publish to Platforms"}
              </span>
            </div>
          )}
        </button>

        <button
          onClick={onBack}
          class="rounded-md theme-bg-light px-4 py-2.5 w-full text-center font-semibold text-base border border-[#7650e3] text-[#7650e3] transition-colors hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] disabled:cursor-not-allowed"
        >
          Back
        </button>

        <button
          onClick={()=> {setShowDiscardModal(true);}}
          class=" mt-5 rounded-md theme-bg-light px-4 py-2.5 w-full text-center font-semibold text-base border border-[#7650e3] text-[#7650e3] transition-colors hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] disabled:cursor-not-allowed"
        >
          Discard Post
        </button>

        {/* Helper text */}
        {selectedPlatforms.filter(
          (p) =>
            connectedPlatforms.includes(p) && !publishedPlatforms.includes(p)
        ).length === 0 &&
          publishedPlatforms.length === 0 && (
            <p className="mt-3 text-sm text-gray-500 font-medium text-center">
              Please select at least one connected platform to publish.
            </p>
          )}

        {publishedPlatforms.length > 0 &&
          selectedPlatforms.filter(
            (p) =>
              connectedPlatforms.includes(p) && !publishedPlatforms.includes(p)
          ).length === 0 && (
            <p className="mt-3 text-sm text-green-600 text-center font-medium">
              All selected platforms have been published successfully!
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
              Publishing Results:
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
                        💡 This error might be temporary - you can try again
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 items-center flex justify-center">
              Discard Post ?
            </h2>

            <p className="text-gray-500 text-sm mb-8 text-center leading-relaxed">
              You will loose your post. <br />
              Are you sure you want to discard them and go back?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDiscardModal(false);
                  setPendingDiscardAction(null);
                }}
                className="flex-1  bg-transparent border-purple-600 border text-purple-600 flex items-center gap-2 justify-center hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] font-semibold py-2.5 text-base rounded-md transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                navigate("/content");
                  setShowDiscardModal(false);
                  setPendingDiscardAction(null);
                }}
                className="flex-1  bg-purple-600 text-white hover:text-[#7650e3] flex items-center gap-2 justify-center hover:bg-[#d7d7fc] border border-[#7650e3] font-semibold py-2.5 text-base rounded-md transition disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

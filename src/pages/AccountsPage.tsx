import React, { useState, useEffect } from "react";
import { Platform } from "../types";
import { oauthManagerClient } from "../lib/oauthManagerClient";
import Icon from "../components/Icon";
import { RefreshCw, Trash2 } from "lucide-react";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
  getPlatformDisplayName,
} from "../utils/platformIcons";
import API from "../services/api";
import { useTranslation } from "react-i18next";

// Define all available platforms
const ALL_PLATFORMS: Platform[] = [
  "linkedin",
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
];

export const AccountsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [connectedPlatforms, setConnectedPlatforms] = useState<Platform[]>([]);
  const [connectingPlatforms, setConnectingPlatforms] = useState<Platform[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [facebookPages, setFacebookPages] = useState<any[]>([]);
  const [youtubeChannels, setYoutubeChannels] = useState<any[]>([]);
  const [selectedFacebookPage, setSelectedFacebookPage] = useState<string>("");
  const [selectedYoutubeChannel, setSelectedYoutubeChannel] =
    useState<string>("");

  useEffect(() => {
    checkConnectedPlatforms();
  }, []);

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
      for (const platform of ALL_PLATFORMS) {
        if (statusData[platform]?.connected) {
          connected.push(platform);
        }
      }
      setConnectedPlatforms(connected);

      // Fetch Facebook pages if Facebook is connected
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

  const fetchFacebookPages = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const tokenResponse = await API.tokenForPlatform("facebook");

      if (tokenResponse?.data) {
        const tokenData = await tokenResponse?.data;
        if (tokenData.connected && tokenData.token?.access_token) {
          const pagesResponse = await fetch(
            `/api/facebook/pages?access_token=${tokenData.token.access_token}`
          );
          if (pagesResponse.ok) {
            const pagesData = await pagesResponse.json();
            setFacebookPages(pagesData.pages || []);
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
      setError(null);

      // Use the OAuth client to start OAuth flow (uses JWT authentication)
      const result: any = await oauthManagerClient.startOAuthFlow(platform);
      const { authUrl } = result.data.data;
      console.log("Opening OAuth popup with URL:", authUrl);

      const authWindow = window.open(
        authUrl,
        `${platform}_oauth`,
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );
      console.log(authWindow, "authWindow");
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
          setError(
            `Failed to connect ${platform}: ${
              event.data.error || "OAuth failed"
            }`
          );
          window.removeEventListener("message", messageListener);
        }
      };

      window.addEventListener("message", messageListener);

      // Monitor window closure
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
    try {
      // Use the OAuth manager client for disconnecting (uses JWT authentication)
      await oauthManagerClient.disconnectPlatform(platform);
      checkConnectedPlatforms();
    } catch (error) {
      console.error("Failed to disconnect:", error);
      setError(
        `Failed to disconnect ${platform}: ${
          error instanceof Error ? error.message : "Disconnection failed"
        }`
      );
    }
  };

  const renderPlatformIcon = (platform: Platform) => {
    const IconComponent = getPlatformIcon(platform);

    if (!IconComponent) {
      return (
        <span className="text-lg font-bold ">{platform.substring(0, 2)}</span>
      );
    }

    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <div className="max-w-full mx-auto md:px-4 px-3 py-2.5 flex flex-col gap-y-3">
      <div className="flex flex-col gap-y-3">
        <div className="">
          <h2 className="text-3xl font-bold theme-text-primary mb-1">
            {t("connect_accounts")}
          </h2>
          {/* <p className="text-sm text-gray-500 font-medium ">
            Connect your social media accounts to enable publishing across all
            platforms.
          </p> */}
        </div>

        <div className=" p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">{connectedPlatforms.length}</span> of{" "}
            <span className="font-medium">{ALL_PLATFORMS.length}</span>{" "}
            {t("platforms_connected")}
          </p>
        </div>

        {connectedPlatforms.length === 0 && (
          <div>
            {/* <div className="flex items-start gap-4">
              <div>
                <h3 className="font-semibold theme-text-secondary mb-1">
                  No Accounts Connected
                </h3>
                <p className="text-sm theme-text-secondary leading-relaxed">
                  Connect your social media accounts to start publishing content
                  across multiple platforms.
                </p>
              </div>
            </div> */}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-y-3 mb-2">
        {ALL_PLATFORMS.map((platform) => {
          const isConnected = connectedPlatforms.includes(platform);
          const isConnecting = connectingPlatforms.includes(platform);

          return (
            <div
              key={platform}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {/* Platform Icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${getPlatformIconBackgroundColors(
                    platform
                  )}`}
                >
                  {renderPlatformIcon(platform)}
                </div>

                {/* Platform Info */}
                <div>
                  <h4 className="font-medium text-slate-900">
                    {getPlatformDisplayName(platform)}
                  </h4>
                  <p
                    className={`text-sm ${
                      isConnected ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isConnected ? t("connected") : t("not_connected")}
                  </p>
                </div>
              </div>

              {/* Platform Controls */}
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <>
                    <button
                      onClick={() => handleConnect(platform)}
                      disabled={isConnecting}
                      className="p-2 text-gray-500 font-medium hover:text-blue-600 disabled:opacity-50 rounded-md hover:bg-gray-100"
                      title="Refresh connection"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDisconnect(platform)}
                      disabled={isConnecting}
                      className="p-2 text-gray-500 font-medium hover:text-red-600 disabled:opacity-50 rounded-md hover:bg-gray-100"
                      title="Disconnect"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-green-800 text-sm font-medium">
                      <svg
                        className="w-6 h-6"
                        fill="#4caf50"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {/* <span>CONNECTED</span> */}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(platform)}
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
          );
        })}
      </div>

      {/* Platform-specific options */}
      {connectedPlatforms.includes("facebook") && facebookPages.length > 0 && (
        <div className="mb-6 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">
            Facebook Page Selection
          </h4>
          <p className="text-blue-700 text-sm mb-3">
            Choose your default Facebook page for publishing:
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

      {connectedPlatforms.includes("youtube") && youtubeChannels.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h4 className="font-medium text-red-900 mb-2">
            YouTube Channel Selection
          </h4>
          <p className="text-red-700 text-sm mb-3">
            Choose your default YouTube channel for publishing:
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

      {/* Error Messages */}
      {/* {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )} */}
    </div>
  );
};

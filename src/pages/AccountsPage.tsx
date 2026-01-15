import React, { useEffect } from "react";
import { Platform } from "../types";
import { RefreshCw, Trash2 } from "lucide-react";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
  getPlatformDisplayName,
} from "../utils/platformIcons";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/context/AppContext";

const ALL_PLATFORMS: Platform[] = [
  "linkedin",
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
];

export const AccountsPage: React.FC = () => {
  const { t } = useTranslation();

  const {
    connectedPlatforms,
    connectingPlatforms,
    handleConnectPlatform,
    handleDisconnectPlatform,
    checkConnectedPlatforms,
  } = useAppContext();

  // Refresh connected platforms on mount
  useEffect(() => {
    checkConnectedPlatforms();
  }, [checkConnectedPlatforms]);

  const renderPlatformIcon = (platform: Platform) => {
    const IconComponent = getPlatformIcon(platform);
    if (!IconComponent) {
      return (
        <span className="text-lg font-bold">{platform.substring(0, 2)}</span>
      );
    }
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <div className="max-w-full mx-auto md:px-4 px-3 py-2.5 flex flex-col gap-y-3">
      <div className="flex flex-col gap-y-3">
        <div>
          <h2 className="text-3xl font-bold theme-text-primary mb-1">
            {t("connect_accounts")}
          </h2>
        </div>

        <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">{connectedPlatforms.length}</span> of{" "}
            <span className="font-medium">{ALL_PLATFORMS.length}</span>{" "}
            {t("platforms_connected")}
          </p>
        </div>
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
                      onClick={() => handleConnectPlatform(platform)}
                      disabled={isConnecting}
                      className="p-2 text-gray-500 font-medium hover:text-blue-600 disabled:opacity-50 rounded-md hover:bg-gray-100"
                      title="Refresh connection"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDisconnectPlatform(platform)}
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
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnectPlatform(platform)}
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
    </div>
  );
};

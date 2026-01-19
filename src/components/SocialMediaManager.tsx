import React, { useState, useEffect } from "react";
import {
  Check,
  ExternalLink,
  RefreshCw,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Platform } from "../types";
import { oauthManagerClient } from "../lib/oauthManagerClient";
import {
  getPlatformIcon,
  getPlatformDisplayName,
  getPlatformColors,
} from "../utils/platformIcons";
import { useTranslation } from "react-i18next";

interface SocialMediaManagerProps {
  userId: string;
  onCredentialsUpdate?: () => void;
  selectedPlatforms?: Platform[];
}

interface PlatformStatus {
  platform: Platform;
  connected: boolean;
  loading: boolean;
  error?: string;
  profile?: any;
}

interface PlatformInfo {
  color: string;
  description: string;
  features: string[];
}

const platformInfo: Record<Platform, PlatformInfo> = {
  linkedin: {
    color: "blue",
    description: "Professional networking and business content",
    features: ["Text posts", "Image posts", "Professional networking"],
  },
  facebook: {
    color: "blue",
    description: "Social networking and community engagement",
    features: [
      "Text posts",
      "Image posts",
      "Page management",
      "Community building",
    ],
  },
  instagram: {
    color: "pink",
    description: "Visual storytelling and lifestyle content",
    features: ["Image posts", "Carousel posts", "Stories", "Business accounts"],
  },
  twitter: {
    color: "sky",
    description: "Real-time news and microblogging",
    features: [
      "Text tweets",
      "Image tweets",
      "Thread creation",
      "Real-time updates",
    ],
  },
  tiktok: {
    color: "black",
    description: "Short-form video content creation",
    features: [
      "Video posts",
      "Trending content",
      "Creative tools",
      "Music integration",
    ],
  },
  youtube: {
    color: "red",
    description: "Long-form video content and education",
    features: [
      "Video uploads",
      "Channel management",
      "Monetization",
      "Analytics",
    ],
  },
};

export const SocialMediaManager = ({
  userId,
  onCredentialsUpdate,
  selectedPlatforms,
  handleConnectPlatform,
  handleDisconnectPlatform,
}: any) => {
  const { t } = useTranslation();
  const [platformStatuses, setPlatformStatuses] = useState<PlatformStatus[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const platforms: Platform[] = selectedPlatforms || [
    "linkedin",
    "facebook",
    "instagram",
    "twitter",
    "tiktok",
    "youtube",
  ];

  const handleRefresh = async (platform: Platform) => {
    try {
      setPlatformStatuses((prev) =>
        prev.map((status) =>
          status.platform === platform
            ? { ...status, loading: true, error: undefined }
            : status
        )
      );

      onCredentialsUpdate?.();
    } catch (error) {
      setPlatformStatuses((prev) =>
        prev.map((status) =>
          status.platform === platform
            ? {
                ...status,
                loading: false,
                error:
                  error instanceof Error ? error.message : "Refresh failed",
              }
            : status
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Social Media Connections
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-500 font-medium">
            Checking connections...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Social Media Connections
      </h3>
      <p className="text-sm text-gray-500 font-medium mb-6">
        Connect your social media accounts to enable direct publishing across
        all platforms.
      </p>

      <div className="space-y-4">
        {platformStatuses.map((status) => {
          const info = platformInfo[status.platform];
          const IconComponent = getPlatformIcon(status.platform);

          return (
            <div
              key={status.platform}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-md flex items-center justify-center text-white ${getPlatformColors(
                    status.platform
                  )}`}
                >
                  {IconComponent && <IconComponent className="w-6 h-6" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">
                      {getPlatformDisplayName(status.platform)}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {status.connected ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          <Check className="w-3 h-3 inline mr-1" />
                          Connected
                        </span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {t("not_connected")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* <p className="text-sm text-gray-500 font-medium mb-2">
                    {info.description}
                  </p> */}

                  {/* Error Display */}
                  {status.error && (
                    <div className="flex items-center text-red-600 text-sm mb-2">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span>{status.error}</span>
                    </div>
                  )}

                  {/* Profile Info */}
                  {status.profile && status.profile.name && (
                    <div className="text-xs text-gray-500 font-medium mb-2">
                      <span>✓ {status.profile.name}</span>
                    </div>
                  )}

                  {/* Features */}
                  <div className="flex flex-wrap gap-1">
                    {info.features.slice(0, 3).map((feature) => (
                      <span
                        key={feature}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-500 font-medium rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {info.features.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-500 font-medium rounded">
                        +{info.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                {status.connected ? (
                  <>
                    <button
                      onClick={() => handleRefresh(status.platform)}
                      disabled={status.loading}
                      className="p-2 text-gray-500 font-medium hover:text-blue-600 disabled:opacity-50 rounded-md hover:bg-gray-100"
                      title="Refresh connection"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          status.loading ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleDisconnectPlatform(status.platform)}
                      disabled={status.loading}
                      className="p-2 text-gray-500 font-medium hover:text-red-600 disabled:opacity-50 rounded-md hover:bg-gray-100"
                      title="Disconnect"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnectPlatform(status.platform)}
                    disabled={status.loading}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {status.loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t("connecting")}...</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Setup Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Getting Started</h4>
            <p className="text-sm text-blue-700 mt-1">
              To connect your social media accounts:
            </p>
            <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
              <li>Click "Connect" on any platform above</li>
              <li>Log in with your social media account</li>
              <li>Authorize the app to post on your behalf</li>
              <li>Start publishing AI-generated content instantly</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Connected Platforms Summary */}
      {platformStatuses.filter((s) => s.connected).length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            ✅ You have {platformStatuses.filter((s) => s.connected).length} of{" "}
            {platforms.length} platform(s) connected and ready for publishing!
          </p>
        </div>
      )}
    </div>
  );
};

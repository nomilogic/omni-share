import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { User, Shield, Bell, Palette, Save, Check } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useTheme } from "../hooks/useTheme";

export const SettingsPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTheme, changeTheme, availableThemes, currentThemeKey } =
    useTheme();

  const user = state.user;

  // Redirect to profile by default
  useEffect(() => {
    if (location.pathname === "/settings") {
      navigate("/settings/profile", { replace: true });
    }
  }, [location.pathname, navigate]);

  // Profile form state
  const [profileData, setProfileData] = useState({
    displayName: user?.name || "",
    email: user?.email || "",
    coins: user?.wallet?.coins || 0,
    addonCoins: user?.wallet?.addonCoins || 0,
    planName: user?.wallet?.package?.name || "No Plan",
    planTier: user?.wallet?.package?.tier || "free",
    planExpiresAt: user?.wallet?.expiresAt || new Date().toISOString(),
  });
  console.log("profileData", profileData);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    updates: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const settingsNavItems = [
    { path: "/settings/profile", icon: User, label: "Profile" },
    // { path: "/settings/security", icon: Shield, label: "Security" },
    { path: "/settings/notifications", icon: Bell, label: "Notifications" },
    { path: "/settings/appearance", icon: Palette, label: "Appearance" },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      // Add your API call to save profileData here
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="theme-card-bg">
      <div className="mx-auto px-4 py-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white/20 shadow-md rounded-md ">
            <nav className="space-y-2">
              {settingsNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors duration-200 ${
                      isActivePath(item.path)
                        ? "theme-bg-card theme-text-primary border border-white/20"
                        : "theme-text-secondary hover:theme-text-primary hover:theme-bg-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <div className="">
              {message.text && (
                <div
                  className={`mb-6 p-4 rounded-md ${
                    message.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <Routes>
                <Route
                  index
                  element={
                    <div className="text-center py-8">
                      <h3 className="text-lg font-semibold theme-text-primary mb-2">
                        Settings
                      </h3>
                      <p className="theme-text-secondary">
                        Select a category from the left to manage your settings.
                      </p>
                    </div>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <div>
                      <h3 className="text-xl font-semibold theme-text-primary mb-6">
                        Profile
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium theme-text-secondary mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={profileData.email}
                            disabled
                            className="w-full px-4 py-2.5 border border-white/20 rounded-md theme-bg-primary theme-text-primary font-normal"
                          />
                          <p className="text-xs theme-text-light mt-1">
                            Email cannot be changed
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium theme-text-secondary mb-2">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={profileData.displayName}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                displayName: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-2.5 border border-white/20 rounded-md theme-bg-primary theme-text-primary font-bold focus:ring-2 focus:ring-white/30 focus:border-transparent"
                            placeholder="Enter your display name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium theme-text-secondary mb-2">
                            Current Plan
                          </label>
                          <div className="px-4 py-2.5 theme-bg-primary rounded-md border border-white/20">
                            <span className="theme-text-primary font-normal ">
                              {profileData.planName || "No plan selected"}
                            </span>
                          </div>
                        </div>
                        {user?.id && (
                          <div>
                            <label className="block text-sm font-medium theme-text-secondary mb-2">
                              Referral Link
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                readOnly
                                value={`${window.location.origin}/auth?referralId=${user.id}`}
                                className="w-full px-4 py-2.5 border border-white/20 rounded-md theme-bg-primary theme-text-primary font-mono"
                              />
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `${window.location.origin}/auth?referralId=${user.id}`
                                  );
                                }}
                                className="theme-button-primary px-3 py-2.5 rounded-md text-white hover:theme-button-hover transition"
                              >
                                Copy
                              </button>
                              <button
                                onClick={() => {
                                  // lazy import to avoid bundling modal everywhere
                                  import("../components/InviteShare").then(
                                    (m) => {
                                      m.openInviteModal(
                                        `${window.location.origin}/auth?referralId=${user.id}`,
                                        {
                                          title: "Invite a friend",
                                          description:
                                            "Join me on OmniShare using this invite link",
                                        }
                                      );
                                    }
                                  );
                                }}
                                className="ml-2 px-3 py-2.5 bg-indigo-600 text-white rounded-md"
                              >
                                Share
                              </button>
                            </div>
                            <p className="text-xs theme-text-light mt-1">
                              Share this link to invite others and earn rewards.
                            </p>
                          </div>
                        )}
                        <button
                          onClick={handleProfileSave}
                          disabled={loading}
                          className="flex items-center gap-2 theme-button-primary text-white px-6 py-2.5 rounded-md hover:theme-button-hover transition-colors duration-200 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  }
                />
                <Route
                  path="security"
                  element={
                    <div>
                      <h3 className="text-xl font-semibold theme-text-primary mb-6">
                        Security Settings
                      </h3>
                      <div className="space-y-6">
                        <div className="theme-bg-primary p-6 rounded-md border border-white/20">
                          <h4 className="text-lg font-medium theme-text-primary mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Password
                          </h4>
                          <p className="theme-text-secondary text-sm mb-4">
                            Update your password to keep your account secure.
                          </p>
                          <button className="theme-button-secondary text-white px-6 py-2.5 rounded-md hover:theme-button-hover transition-colors duration-200">
                            Change Password
                          </button>
                        </div>
                        <div className="theme-bg-primary p-6 rounded-md border border-white/20">
                          <h4 className="text-lg font-medium theme-text-primary mb-4">
                            Two-Factor Authentication
                          </h4>
                          <p className="theme-text-secondary text-sm mb-4">
                            Add an extra layer of security to your account with
                            2FA.
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="theme-text-secondary text-sm">
                                Status:{" "}
                              </span>
                              <span className="text-red-400 text-sm">
                                Disabled
                              </span>
                            </div>
                            <button className="bg-green-600 text-white px-6 py-2.5 rounded-md hover:bg-green-700 transition-colors duration-200">
                              Enable 2FA
                            </button>
                          </div>
                        </div>
                        <div className="theme-bg-primary p-6 rounded-md border border-white/20">
                          <h4 className="text-lg font-medium theme-text-primary mb-4">
                            Account Deletion
                          </h4>
                          <p className="theme-text-secondary text-sm mb-4">
                            Permanently delete your account and all data.
                          </p>
                          <button className="bg-red-600 text-white px-6 py-2.5 rounded-md hover:bg-purple-700 transition-colors duration-200">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                />
                <Route
                  path="notifications"
                  element={
                    <div>
                      <h3 className="text-xl font-semibold theme-text-primary mb-6">
                        Notification Preferences
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            key: "email",
                            title: "Email Notifications",
                            desc: "Receive updates about your posts and content.",
                          },
                          {
                            key: "push",
                            title: "Push Notifications",
                            desc: "Get instant alerts in your browser.",
                          },
                          {
                            key: "marketing",
                            title: "Marketing Emails",
                            desc: "Receive news about features and updates.",
                          },
                          {
                            key: "updates",
                            title: "Product Updates",
                            desc: "Get notified about new features and improvements.",
                          },
                        ].map((item) => (
                          <div
                            key={item.key}
                            className="theme-bg-primary p-4 rounded-md border border-white/20"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-lg font-medium theme-text-primary">
                                  {item.title}
                                </h4>
                                <p className="text-gray-500 text-sm">
                                  {item.desc}
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                {/* Hidden checkbox */}
                                <input
                                  type="checkbox"
                                  checked={
                                    notifications[
                                      item.key as keyof typeof notifications
                                    ]
                                  }
                                  onChange={(e) =>
                                    handleNotificationChange(
                                      item.key,
                                      e.target.checked
                                    )
                                  }
                                  className="sr-only peer hidden"
                                />

                                {/* Toggle track */}
                                <div className="w-12 h-7 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors duration-300 relative">
                                  {/* Toggle circle */}
                                  <span
                                    className={`absolute left-[2px] top-[2px] w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                                      notifications[
                                        item.key as keyof typeof notifications
                                      ]
                                        ? "translate-x-5"
                                        : "translate-x-0"
                                    }`}
                                  ></span>
                                </div>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  }
                />
                <Route
                  path="appearance"
                  element={
                    <div>
                      <h3 className="text-xl font-semibold theme-text-primary mb-6">
                        Appearance
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-medium theme-text-primary mb-4 flex items-center gap-2">
                            <Palette className="w-5 h-5" />
                            App Themes
                          </h4>
                          <p className="theme-text-secondary text-sm mb-6">
                            Choose from our collection of beautiful themes based
                            on the app's features.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableThemes.map((theme) => (
                              <div
                                key={theme.key}
                                onClick={() => changeTheme(theme.key)}
                                className={`relative p-4 border rounded-md cursor-pointer transition-all duration-200 hover:scale-105 ${
                                  currentThemeKey === theme.key
                                    ? "border-white/40 ring-2 ring-white/30"
                                    : "border-white/20 hover:border-white/40"
                                }`}
                              >
                                <div
                                  className={`w-full h-20 bg-gradient-to-r ${theme.bgGradient} rounded-md mb-3 relative overflow-hidden`}
                                >
                                  <div className="absolute inset-2 bg-white/10 rounded border border-white/20"></div>
                                  <div className="absolute bottom-2 left-2 right-2 h-2 bg-white/20 rounded"></div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium theme-text-primary">
                                      {theme.name}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <div
                                        className={`w-2 h-2 rounded-full`}
                                        style={{
                                          backgroundColor: theme.primary,
                                        }}
                                      ></div>
                                      <div
                                        className={`w-2 h-2 rounded-full`}
                                        style={{
                                          backgroundColor: theme.secondary,
                                        }}
                                      ></div>
                                      <div
                                        className={`w-2 h-2 rounded-full`}
                                        style={{
                                          backgroundColor: theme.accent,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                  {currentThemeKey === theme.key && (
                                    <Check className="w-5 h-5 text-green-400" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="theme-bg-primary p-4 rounded-md border border-white/20 mt-6">
                            <p className="text-xs theme-text-secondary">
                              💡 <strong>Tip:</strong> Themes are based on the
                              app's feature categories from the onboarding
                              process. Changes apply instantly across the entire
                              application.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

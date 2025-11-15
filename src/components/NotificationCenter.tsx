import React, { useState, useEffect } from "react";
import {
  Bell,
  Settings,
  X,
  Check,
  Clock,
  Trash2,
  Eye,
  MoreVertical,
} from "lucide-react";
import {
  notificationService,
  NotificationData,
  NotificationSettings,
} from "../lib/notificationService";
import { formatDistanceToNow } from "date-fns";

interface NotificationCenterProps {
  onClose: () => void;
  isOpen: boolean;
  userId?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onClose,
  isOpen,
  userId,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(
    notificationService.getSettings()
  );
  const [activeTab, setActiveTab] = useState<"notifications" | "settings">(
    "notifications"
  );
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(50);
      const notifications = data.notifications || data;
      setNotifications(
        notifications.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      try {
        await notificationService.clearAllNotifications();
        setNotifications([]);
      } catch (error) {
        console.error("Error clearing notifications:", error);
      }
    }
  };

  const handleSettingsChange = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    notificationService.saveSettings(newSettings);
  };

  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const getNotificationIcon = (type: NotificationData["type"]) => {
    switch (type) {
      case "reminder":
        return <Clock className="w-5 h-5 text-orange-500" />;
      case "success":
        return <Check className="w-5 h-5 text-green-500" />;
      case "campaign":
        return <Bell className="w-5 h-5 text-blue-500" />;
      case "error":
        return <Bell className="w-5 h-5 text-red-500" />;
      case "warning":
        return <Bell className="w-5 h-5 text-orange-500" />;
      case "info":
        return <Eye className="w-5 h-5 text-blue-500" />;
      case "post":
        return <Bell className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500 font-medium" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-16 pr-4">
      <div className="bg-white rounded-md shadow-md w-96 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 theme-text-secondary">
              <Bell className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-3 space-x-1">
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                activeTab === "notifications"
                  ? "bg-white bg-opacity-20 text-white"
                  : "text-blue-100 hover:text-white"
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                activeTab === "settings"
                  ? "bg-white bg-opacity-20 text-white"
                  : "text-blue-100 hover:text-white"
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "notifications" ? (
            <NotificationsTab
              notifications={notifications}
              loading={loading}
              selectedNotifications={selectedNotifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClearAll={handleClearAll}
              onToggleSelection={toggleNotificationSelection}
              getNotificationIcon={getNotificationIcon}
            />
          ) : (
            <SettingsTab
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationsTab: React.FC<{
  notifications: NotificationData[];
  loading: boolean;
  selectedNotifications: string[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onToggleSelection: (id: string) => void;
  getNotificationIcon: (type: NotificationData["type"]) => JSX.Element;
}> = ({
  notifications,
  loading,
  selectedNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onToggleSelection,
  getNotificationIcon,
}) => {
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-500 font-medium mt-2 text-sm">
          Loading notifications...
        </p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium font-medium">
          No notifications yet
        </p>
        <p className="text-gray-400 text-sm mt-1">
          You'll see your notifications here when you have some
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Actions */}
      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <div className="flex justify-between text-sm">
          <button
            onClick={onMarkAllAsRead}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all as read
          </button>
          <button
            onClick={onClearAll}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              !notification.read ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        !notification.read ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        !notification.read
                          ? "text-slate-700"
                          : "text-gray-500 font-medium"
                      }`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 ml-2">
                    {!notification.read && (
                      <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onToggleSelection(notification.id)}
                      className="p-1 text-gray-400 hover:text-gray-500 font-medium transition-colors"
                      title="More options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {notification.metadata && (
                  <div className="mt-2 text-xs text-gray-500 font-medium bg-gray-100 rounded p-2">
                    {notification.type === "reminder" &&
                      notification.metadata.scheduledPostTime && (
                        <p>
                          Scheduled for:{" "}
                          {new Date(
                            notification.metadata.scheduledPostTime
                          ).toLocaleString()}
                        </p>
                      )}
                    {(notification.type === "success" ||
                      notification.type === "error") &&
                      notification.metadata.platforms && (
                        <p>
                          Platforms:{" "}
                          {notification.metadata.platforms.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const SettingsTab: React.FC<{
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
}> = ({ settings, onSettingsChange }) => {
  const handleToggle = (key: keyof NotificationSettings, value?: any) => {
    if (key === "notificationTypes" && typeof value === "object") {
      onSettingsChange({
        ...settings,
        notificationTypes: {
          ...settings.notificationTypes,
          ...value,
        },
      });
    } else {
      onSettingsChange({
        ...settings,
        [key]: value !== undefined ? value : !settings[key],
      });
    }
  };

  return (
    <div className="p-4 max-h-96 overflow-y-auto space-y-4">
      {/* General Settings */}
      <div>
        <h3 className="text-sm font-medium text-slate-900 mb-3">
          General Settings
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-700">Push Notifications</label>
            <button
              onClick={() => handleToggle("enablePushNotifications")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enablePushNotifications ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enablePushNotifications
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-700">
              Email Notifications
            </label>
            <button
              onClick={() => handleToggle("enableEmailNotifications")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableEmailNotifications
                  ? "bg-blue-600"
                  : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableEmailNotifications
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-sm text-slate-700">
              Post Reminder (minutes before)
            </label>
            <select
              value={settings.reminderMinutesBeforePost}
              onChange={(e) =>
                handleToggle(
                  "reminderMinutesBeforePost",
                  parseInt(e.target.value)
                )
              }
              className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-3 py-2.5"
            >
              <option value={5}>5 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-700">Daily Summary Time</label>
            <input
              type="time"
              value={settings.dailySummaryTime}
              onChange={(e) => handleToggle("dailySummaryTime", e.target.value)}
              className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-3 py-2.5"
            />
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div>
        <h3 className="text-sm font-medium text-slate-900 mb-3">
          Notification Types
        </h3>
        <div className="space-y-3">
          {Object.entries(settings.notificationTypes).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm text-slate-700 ">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </label>
              <button
                onClick={() =>
                  handleToggle("notificationTypes", { [key]: !enabled })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

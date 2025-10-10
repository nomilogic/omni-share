import { toast } from "react-hot-toast";

export interface NotificationData {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "reminder"
    | "campaign"
    | "post";
  read: boolean;
  read_at?: string;
  action_url?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// Legacy interface for backward compatibility
export interface LegacyNotificationData {
  id: string;
  type:
    | "post_reminder"
    | "post_published"
    | "campaign_update"
    | "system_alert"
    | "daily_summary";
  title: string;
  message: string;
  scheduledTime: Date;
  userId: string;
  campaignId?: string;
  campaignId?: string;
  postId?: string;
  isRead: boolean;
  isScheduled: boolean;
  isSent: boolean;
  createdAt: Date;
  data?: any; // Additional data for the notification
}

export interface NotificationSettings {
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  reminderMinutesBeforePost: number; // Default: 30 minutes
  dailySummaryTime: string; // Format: "09:00"
  weeklyReportDay: "monday" | "sunday";
  notificationTypes: {
    postReminders: boolean;
    campaignUpdates: boolean;
    systemAlerts: boolean;
    dailySummary: boolean;
    weeklyReport: boolean;
  };
}

class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private settings: NotificationSettings;

  private constructor() {
    this.settings = this.loadSettings();
    this.initializePushNotifications();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private loadSettings(): NotificationSettings {
    const saved = localStorage.getItem("notificationSettings");
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      enablePushNotifications: true,
      enableEmailNotifications: false,
      reminderMinutesBeforePost: 30,
      dailySummaryTime: "09:00",
      weeklyReportDay: "monday",
      notificationTypes: {
        postReminders: true,
        campaignUpdates: true,
        systemAlerts: true,
        dailySummary: true,
        weeklyReport: false,
      },
    };
  }

  saveSettings(settings: NotificationSettings) {
    this.settings = settings;
    localStorage.setItem("notificationSettings", JSON.stringify(settings));
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  async initializePushNotifications(): Promise<boolean> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push messaging is not supported");
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered successfully");

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission denied");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error initializing push notifications:", error);
      return false;
    }
  }

  async schedulePostReminder(
    postId: string,
    scheduledTime: Date,
    postContent: string
  ): Promise<void> {
    if (!this.settings.notificationTypes.postReminders) return;

    const reminderTime = new Date(scheduledTime);
    reminderTime.setMinutes(
      reminderTime.getMinutes() - this.settings.reminderMinutesBeforePost
    );

    await this.createNotification({
      title: "Post Reminder",
      message: `Your post "${postContent.substring(
        0,
        50
      )}..." is scheduled to publish in ${
        this.settings.reminderMinutesBeforePost
      } minutes`,
      type: "reminder",
      action_url: `/posts/${postId}`,
      metadata: {
        postId,
        postContent: postContent.substring(0, 100),
        scheduledPostTime: scheduledTime.toISOString(),
        reminderMinutes: this.settings.reminderMinutesBeforePost,
      },
    });
  }

  async notifyPostPublished(
    postId: string,
    platforms: string[],
    success: boolean
  ): Promise<void> {
    const title = success
      ? "Post Published Successfully!"
      : "Post Publishing Failed";
    const message = success
      ? `Your post has been published to ${platforms.join(", ")}`
      : `Failed to publish your post to ${platforms.join(
          ", "
        )}. Please check your connections.`;

    await this.createNotification({
      title,
      message,
      type: success ? "success" : "error",
      action_url: `/posts/${postId}`,
      metadata: { postId, platforms, success },
    });

    // Also show immediate toast
    if (success) {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }

  async notifyCampaignUpdate(
    campaignId: string,
    campaignName: string,
    updateType: "created" | "updated" | "completed" | "paused"
  ): Promise<void> {
    if (!this.settings.notificationTypes.campaignUpdates) return;

    const messages = {
      created: `Campaign "${campaignName}" has been created successfully`,
      updated: `Campaign "${campaignName}" has been updated`,
      completed: `Campaign "${campaignName}" has been completed`,
      paused: `Campaign "${campaignName}" has been paused`,
    };

    const notification: NotificationData = {
      id: `campaign_${updateType}_${campaignId}_${Date.now()}`,
      type: "campaign_update",
      title: "Campaign Update",
      message: messages[updateType],
      scheduledTime: new Date(),
      userId: await this.getCurrentUserId(),
      campaignId,
      isRead: false,
      isScheduled: false,
      isSent: false,
      createdAt: new Date(),
      data: { campaignName, updateType },
    };

    await this.saveNotification(notification);
    await this.showNotification(notification);
  }

  async scheduleDailySummary(): Promise<void> {
    if (!this.settings.notificationTypes.dailySummary) return;

    const now = new Date();
    const [hours, minutes] = this.settings.dailySummaryTime
      .split(":")
      .map(Number);
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const notification: NotificationData = {
      id: `daily_summary_${scheduledTime.toISOString()}`,
      type: "daily_summary",
      title: "Daily Social Media Summary",
      message: "Check your daily social media performance and upcoming posts",
      scheduledTime,
      userId: await this.getCurrentUserId(),
      isRead: false,
      isScheduled: true,
      isSent: false,
      createdAt: new Date(),
    };

    await this.saveNotification(notification);
    await this.scheduleNotification(notification);
  }

  private async scheduleNotification(
    notification: NotificationData
  ): Promise<void> {
    const delay = notification.scheduledTime.getTime() - Date.now();

    if (delay <= 0) {
      // If the scheduled time has already passed, send immediately
      await this.showNotification(notification);
      return;
    }

    // For browser environment, use setTimeout for short delays (up to 24 hours)
    if (delay <= 24 * 60 * 60 * 1000) {
      setTimeout(async () => {
        await this.showNotification(notification);
      }, delay);
    } else {
      // For longer delays, we would need a server-side scheduler
      // For now, we'll store it and check periodically
      console.log("Long delay notification stored for server-side scheduling");
    }
  }

  private async showNotification(
    notification: NotificationData
  ): Promise<void> {
    try {
      // Update notification as sent
      notification.isSent = true;
      await this.updateNotification(notification);

      // Show browser notification if permissions are granted
      if (
        this.settings.enablePushNotifications &&
        Notification.permission === "granted"
      ) {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/icon-192x192.png",
          badge: "/badge-72x72.png",
          tag: notification.id,
          requireInteraction: notification.type === "post_reminder",
          data: notification.data,
        });
      }

      // Show toast notification
      if (notification.type === "post_published") {
        const success = notification.data?.success;
        if (success) {
          toast.success(notification.message);
        } else {
          toast.error(notification.message);
        }
      } else {
        toast(notification.message, {
          icon: this.getNotificationIcon(notification.type),
          duration: 6000,
        });
      }
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }

  private getNotificationIcon(type: NotificationData["type"]): string {
    switch (type) {
      case "reminder":
        return "⏰";
      case "success":
        return "✅";
      case "campaign":
        return "📊";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "info":
        return "💡";
      case "post":
        return "📝";
      default:
        return "🔔";
    }
  }

  private async getCurrentUserId(): Promise<string> {
    // Get user from Supabase or wherever auth is stored
    // For now, fallback to localStorage
    return localStorage.getItem("userId") || "anonymous";
  }

  // New API methods
  async createNotification(data: {
    title: string;
    message: string;
    type: NotificationData["type"];
    action_url?: string;
    metadata?: any;
  }): Promise<NotificationData | null> {
    try {
      const userId = await this.getCurrentUserId();
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create notification");
      }

      const result = await response.json();
      return result.notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  }

  async getUnreadCount(): Promise<number> {
    // try {
    //   const userId = await this.getCurrentUserId();
    //   const response = await fetch(`/api/notifications/unread-count?userId=${userId}`);
    //   if (response.ok) {
    //     const result = await response.json();
    //     return result.count || 0;
    //   }
    // } catch (error) {
    //   console.error('Error fetching unread count:', error);
    // }
    return 0;
  }

  async markAllAsRead(): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  private async saveNotification(
    notification: NotificationData
  ): Promise<void> {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error("Failed to save notification");
      }
    } catch (error) {
      // Fallback to localStorage if API fails
      const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
      stored.push(notification);
      localStorage.setItem("notifications", JSON.stringify(stored));
    }
  }

  private async updateNotification(
    notification: NotificationData
  ): Promise<void> {
    try {
      const response = await fetch(`/api/notifications/${notification.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error("Failed to update notification");
      }
    } catch (error) {
      // Fallback to localStorage
      const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
      const index = stored.findIndex(
        (n: NotificationData) => n.id === notification.id
      );
      if (index !== -1) {
        stored[index] = notification;
        localStorage.setItem("notifications", JSON.stringify(stored));
      }
    }
  }

  async getNotifications(limit: number = 50): Promise<NotificationData[]> {
    try {
      const response = await fetch(`/api/notifications?limit=${limit}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }

    // Fallback to localStorage
    const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
    return stored.slice(0, limit);
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }
    } catch (error) {
      // Fallback to localStorage
      const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
      const notification = stored.find(
        (n: NotificationData) => n.id === notificationId
      );
      if (notification) {
        notification.isRead = true;
        localStorage.setItem("notifications", JSON.stringify(stored));
      }
    }
  }

  async clearAllNotifications(): Promise<void> {
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear notifications");
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }

    // Also clear localStorage
    localStorage.removeItem("notifications");
  }
}

export const notificationService = NotificationService.getInstance();

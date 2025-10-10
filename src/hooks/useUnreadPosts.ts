import { useState, useEffect } from "react";
import { historyRefreshService } from "../services/historyRefreshService";

export const useUnreadPosts = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = async () => {
    setLoading(false);
  };

  useEffect(() => {
    fetchUnreadCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    // Register with global refresh service
    const unregister = historyRefreshService.registerRefreshCallback(() => {
      console.log(
        "🔔 Unread posts count refresh triggered from global service"
      );
      fetchUnreadCount();
    });

    return () => {
      clearInterval(interval);
      unregister();
    };
  }, []);

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return {
    unreadCount,
    loading,
    refresh: fetchUnreadCount,
    markAllAsRead,
  };
};

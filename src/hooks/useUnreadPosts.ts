import { useState, useEffect } from "react";
import { historyRefreshService } from "../services/historyRefreshService";
import API from "@/services/api";

export const useUnreadPosts = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = async () => {
    setLoading(false);
    try {
      API.unreadHistory().then((res) => {
        setUnreadCount(res.data.data.unreadCount || 0);
        setLoading(false);
      });
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const markAllAsRead = async () => {
    return API.readAllHistory().then((e) => {
      setUnreadCount(0);
    });
  };

  return {
    unreadCount,
    loading,
    refresh: fetchUnreadCount,
    markAllAsRead,
  };
};

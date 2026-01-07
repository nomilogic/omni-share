"use client";

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AnalyticsDetailsPage from "./AnalyticsDetailsPage";

// --- Types (same as modal) ---
interface TopPost {
  id: string;
  title: string;
  fullMessage?: string;
  permalink?: string;
  engagement: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  created_time: string;
}

interface AnalyticsData {
  platform: string;
  page: {
    id: string;
    name: string;
    category: string;
    followers: number;
  };
  summary: {
    likes: number;
    comments: number;
    shares: number;
  };
  insights: Array<{
    period: "day" | "week" | "days_28";
    values: Array<{ value: number }>;
  }>;
  top_posts: {
    posts: TopPost[];
  };
}

type AnalyticsDetailsState = {
  analytics: AnalyticsData | null;
  topPosts: TopPost[];
  dailyReach: number;
  weeklyReach: number;
  monthlyReach: number;
};

export default function AnalyticsDetailsPageRoute() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as AnalyticsDetailsState | undefined;

  // If state missing (refresh/direct open), go back
  if (!state) {
    navigate("/dashboard"); // change if needed
    return null;
  }

  return (
    <AnalyticsDetailsPage
      analytics={state.analytics}
      topPosts={state.topPosts}
      dailyReach={state.dailyReach}
      weeklyReach={state.weeklyReach}
      monthlyReach={state.monthlyReach}
      onClose={() => navigate(-1)}
    />
  );
}

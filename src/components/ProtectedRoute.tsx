import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { Sparkles } from "lucide-react";
import Icon from "./Icon";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state } = useAppContext();
  const location = useLocation();

  if (state.loading) {
    return (
      <div className="min-h-screen px-2 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="spiral-logo" size={50} className="animate-spin mb-2" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading OmniShare
          </h2>
          <p className="text-gray-600">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  if (!state.user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is authenticated but on auth page, redirect based on setup status
  if (location.pathname === "/auth") {
    return <Navigate to="/content" replace />;
    if (state.hasCompletedOnboarding) {
      return <Navigate to="/content" replace />;
    } else {
      return <Navigate to="/pricing" replace />;
    }
  }

  // Check if user needs to complete onboarding
  if (
    !state.hasCompletedOnboarding &&
    !location.pathname.includes("/pricing")
  ) {
    // return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};

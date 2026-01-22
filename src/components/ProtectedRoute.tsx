import Cookies from "js-cookie";
import React, { ReactNode, useMemo } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useMemo(() => {
    return !!(Cookies.get("auth_token") || Cookies.get("refresh_token"));
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

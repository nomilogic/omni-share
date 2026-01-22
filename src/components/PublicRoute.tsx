import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = Cookies.get("auth_token") || Cookies.get("refresh_token");

  if (token) {
    return <Navigate to="/content" replace />;
  }

  return <>{children}</>;
};

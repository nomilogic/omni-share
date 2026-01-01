import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { useAppContext } from "../context/AppContext";
import API from "../services/api";
import { notify } from "@/utils/toast";
import { useTranslation } from "react-i18next";

export const AuthPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (localStorage.getItem("auth_token")) {
      navigate("/content", { replace: true });
    }
  }, [localStorage.getItem("auth_token")]);

  const handleAuthSuccess = (user: any) => {
    dispatch({ type: "SET_USER", payload: user });
    dispatch({
      type: "SET_BALANCE",
      payload: user?.wallet?.coins + user?.wallet?.referralCoin,
    });
    if (user.plan) {
      dispatch({ type: "SET_USER_PLAN", payload: user.plan });
    } else {
      // Auto-set new users to free plan and skip onboarding
      dispatch({ type: "SET_USER_PLAN", payload: "free" });
    }

    if (user.profile_type === "business") {
      dispatch({ type: "SET_BUSINESS_ACCOUNT", payload: true });
    }

    // Auto-complete onboarding for all users
    dispatch({ type: "SET_TIER_SELECTED", payload: true });
    dispatch({ type: "SET_PROFILE_SETUP", payload: true });
    dispatch({ type: "SET_ONBOARDING_COMPLETE", payload: true });

    const from = (location.state as any)?.from?.pathname || "/content";
    navigate(from, { replace: true });
  };

  // Send forget-password link

  // This handler is for in-page reset (optional) — Reset via ResetPasswordPage will call API directly
  const handleResetPassword = async (token: string, new_password: string) => {
    setLoading(true);
    setError(null);
    try {
      await API.setNewPassword({ new_password }, {
        headers: { authorization: token },
      } as any);
      notify("error", t("password_updated_successfully"));
      navigate("/login");
    } catch (err: any) {
      console.error("setNewPassword failed", err);
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (state.user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col relative theme-bg-trinary">
      <div className="flex-grow">
        <AuthForm
          onAuthSuccess={handleAuthSuccess}
          onResetPassword={(token: string, password: string) =>
            handleResetPassword(token, password)
          }
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

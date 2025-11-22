import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { useAppContext } from "../context/AppContext";
import API from "../services/api";
import { notify } from "@/utils/toast";

export const AuthPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    if (state.user) {
      const from = (location.state as any)?.from?.pathname || "/content";
      navigate(from, { replace: true });
    }
  }, [state.user, navigate, location]);

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
      notify("error", "Password updated successfully");
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

      <footer className="w-full px-4 py-4  text-center text-sm theme-text-light absolute bottom-0 z-10 md:block hidden">
        <div className="max-w-full mx-auto flex md:flex-row items-center gap-2 md:justify-between justify-center flex-col  text-blue-600">
          <span>© {new Date().getFullYear()} OMNISHARE</span>
          <div>
            <a href="/privacy" className="hover:underline">
              Privacy
            </a>
            &nbsp; | &nbsp;
            <a href="/terms" className="hover:underline">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

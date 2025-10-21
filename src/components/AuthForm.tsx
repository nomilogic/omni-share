import React, { useState, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  initiateGoogleOAuth,
  initiateFacebookOAuth,
  isOAuthConfigured,
} from "../utils/authOAuth";
import Icon from "./Icon";
import API from "../services/api";
import { OtpModal } from "./OtpModal";

interface AuthFormProps {
  onAuthSuccess: (user: any) => void;
  onForgetPassword?: (email: string) => Promise<void>;
  onResetPassword?: (token: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  onAuthSuccess,
  onForgetPassword,
  loading: externalLoading,
  error: externalError,
}) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState<boolean>(false);
  const params = new URLSearchParams(window.location.search);
  const referralId: any = params.get("referralId");
  const isVerification = params.get("isVerification");

  useLayoutEffect(() => {
    if (isVerification === "true" || isVerification === "1") {
      const emailToken = localStorage.getItem("email_token");
      if (emailToken) {
        setShowOtpPopup(true);
      }
    }

    if (referralId) {
      setIsLogin(false);
    }
  }, [referralId, isVerification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const response = await API.login({
          email: formData.email,
          password: formData.password,
        });

        const result = response.data.data;

        if (!result.token || !result.user) {
          throw new Error("Invalid response from server");
        }

        if (rememberMe) {
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 30);
          localStorage.setItem("auth_token", result.token);
          localStorage.setItem(
            "auth_token_expiry",
            expirationDate.toISOString()
          );
          localStorage.setItem("auth_remember", "true");
        } else {
          localStorage.setItem("auth_token", result.token);
          localStorage.removeItem("auth_token_expiry");
          localStorage.removeItem("auth_remember");
        }
        onAuthSuccess(result.user);
        try {
          const profile = result.user?.profile;
          console.log("AuthForm fallback check profile:", profile);
          if (profile && (profile as any).isOnboarding === false) {
            import("../lib/navigation")
              .then(({ navigateOnce }) => {
                navigateOnce(navigate, "/onboarding/profile", {
                  replace: true,
                });
              })
              .catch((err) => {
                console.error("failed to load navigation helper", err);
                navigate("/onboarding/profile", { replace: true });
              });
            return;
          }
        } catch (e) {
          console.error("AuthForm fallback redirect check failed", e);
        }
      } else {
        const response = await API.registerUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          ...(referralId !== "" && {
            referralId: referralId ? referralId : "",
          }),
        });

        const result = await response.data.data;
        localStorage.setItem("email_token", result?.token);
        setShowOtpPopup(true);
        const url = new URL(window.location.href);
        url.searchParams.set("isVerification", "true");
        window.history.pushState({}, "", url.toString());
      }
    } catch (error: any) {
      console.error("Authentication error:", error.response.data.message);
      setError(error.response.data.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await initiateGoogleOAuth();

      if (result?.token) {
        localStorage.setItem("auth_token", result.token);
        onAuthSuccess(result.user);

        setTimeout(() => {
          navigate("/content");
        }, 2000);
      }
    } catch (error: any) {
      setError(error.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookOAuth = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await initiateFacebookOAuth();
      localStorage.setItem("auth_token", result.token);
      console.log("Facebook OAuth successful, user:", result.user);
      onAuthSuccess(result.user);
      try {
        const profile = result.user?.profile;
        console.log("AuthForm Facebook fallback profile:", profile);
        if (profile && (profile as any).isOnboarding === false) {
          import("../lib/navigation")
            .then(({ navigateOnce }) => {
              navigateOnce(navigate, "/onboarding/profile", { replace: true });
            })
            .catch((err) => {
              console.error("failed to load navigation helper", err);
              navigate("/onboarding/profile", { replace: true });
            });
          return;
        }
      } catch (e) {
        console.error("AuthForm Facebook fallback redirect check failed", e);
      }
    } catch (error: any) {
      console.error("Facebook OAuth error:", error);
      setError(error.message || "Facebook authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex items-center justify-center w-full">
      <div
        className={`absolute inset-0 theme-bg-trinary transition-all duration-1000`}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 theme-bg-trinary from-black/30 via-transparent to-transparent bg-overlay "></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-white/15 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
      </div>

      {!showOtpPopup && (
        <div
          className="theme-bg-card rounded-xl shadow-lg p-6 border w-full"
          style={{ borderColor: "var(--theme-border)" }}
        >
          <div className="text-center mb-6">
            <div className="w-12 h-12  flex items-center justify-center mx-auto mb-3">
              <Icon name="logo" size={50} className="ml-0 lg:ml-0" />
            </div>
            <h1 className="text-xl font-bold theme-text-primary">
              {"Welcome to OMNISHARE"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium theme-text-secondary mb-1"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 theme-input rounded-lg focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium theme-text-secondary mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full px-3 py-2 theme-input rounded-lg focus:outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium theme-text-secondary mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full px-3 py-2 theme-input rounded-lg focus:outline-none"
                placeholder="Enter your password"
              />
            </div>

            {isLogin && !forgotMode && (
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-sm text-purple-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {forgotMode && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Enter your email to receive a password reset link.
                </p>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 theme-input rounded-lg focus:outline-none"
                  placeholder="Enter your email"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!onForgetPassword) return;
                      try {
                        setLoading(true);
                        await onForgetPassword(formData.email);
                        setForgotMode(false);
                        setError(
                          "If that email exists, a reset link was sent."
                        );
                      } catch (err: any) {
                        setError(err?.message || "Failed to send reset link");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="px-4 py-1.5 bg-purple-600 text-white rounded-md"
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotMode(false)}
                    className="px-4 py-1.5 border rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!isLogin && referralId && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium theme-text-secondary mb-1"
                >
                  Referral Id
                </label>
                <input
                  id="name"
                  type="text"
                  value={referralId}
                  disabled={true}
                  className="w-full px-3 py-2 theme-input disabled:cursor-not-allowed disabled:text-gray-500 rounded-lg focus:outline-none"
                  placeholder="Referral Id"
                />
              </div>
            )}

            {isLogin && (
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 theme-text-secondary focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm theme-text-secondary"
                >
                  Remember me for 30 days
                </label>
              </div>
            )}

            {(error || externalError) && (
              <div className="mt-[-10px] px-3 " style={{}}>
                <div className="text-sm text-red-500">
                  {error || externalError}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="block text-sm font-medium theme-text-light theme-bg-trinary mb-1 w-full px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading
                ? "Processing..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="theme-text-secondary hover:opacity-80 text-sm font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3">
            {
            // isOAuthConfigured("google") && 
            (
              <button
                type="button"
                onClick={handleGoogleOAuth}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>
            )}

            {isOAuthConfigured("facebook") && (
              <button
                type="button"
                onClick={handleFacebookOAuth}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            )}
          </div>
        </div>
      )}

      <OtpModal
        open={showOtpPopup}
        onClose={() => setShowOtpPopup(false)}
        emailHint="user@example.com"
        onSuccess={(data: any) => onAuthSuccess(data)}
        verifyOtp={async (otp) => {
          const res = await API.otpVerification({ otp });
          return res.data.data;
        }}
        resendOtp={API.resendOtp}
      />
  
    </div>
  );
};

import React, { useState, useEffect } from "react";
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
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showOtpPopup, setShowOtpPopup] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isVerification = params.get("isVerification");

    if (isVerification === "true" || isVerification === "1") {
      const emailToken = localStorage.getItem("email_token");
      if (emailToken) {
        setShowOtpPopup(true);
      }
    }
  }, []);

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
      } else {
        const response = await API.registerUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });

        const result = await response.data.data;
        localStorage.setItem("email_token", result?.token);
        setShowOtpPopup(true);
        const url = new URL(window.location.href);
        url.searchParams.set("isVerification", "true");
        window.history.pushState({}, "", url.toString());
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await initiateGoogleOAuth();
      localStorage.setItem("auth_token", result.token);
      console.log("Google OAuth successful, user:", result.user);
      onAuthSuccess(result.user);
    } catch (error: any) {
      console.error("Google OAuth error:", error);
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
    } catch (error: any) {
      console.error("Facebook OAuth error:", error);
      setError(error.message || "Facebook authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.otpVerification({
        otp,
      });
      const result = response.data.data;

      if (result?.token) {
        setShowOtpPopup(false);
        localStorage.setItem("auth_token", result.token);
        localStorage.removeItem("email_token");
        onAuthSuccess(result.user);
      } else {
        throw new Error("OTP verification failed");
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading1(true);
    setError("");
    try {
      const emailToken = localStorage.getItem("email_token");
      if (!emailToken) throw new Error("No email token found");

      await API.resendOtp();
      setError("OTP resent successfully");
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to resend OTP");
    } finally {
      setLoading1(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen flex items-center justify-center w-full">
      {/* Animated Background */}
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

            {error && (
              <div
                className="p-3 theme-bg-primary border rounded-lg"
                style={{ borderColor: "var(--theme-accent)" }}
              >
                <p className="text-sm theme-text-primary">{error}</p>
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
        </div>
      )}

      <OtpModal
        open={showOtpPopup}
        onClose={() => setShowOtpPopup(false)}
        emailHint="user@example.com"
        onSuccess={(data) => onAuthSuccess(data)}
        verifyOtp={async (otp) => {
          const res = await API.otpVerification({ otp });
          return res.data.data;
        }}
        resendOtp={API.resendOtp}
      />
    </div>
  );
};

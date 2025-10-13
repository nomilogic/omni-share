import React, { useState } from "react";
import {
  initiateGoogleOAuth,
  initiateFacebookOAuth,
  isOAuthConfigured,
} from "../utils/authOAuth";
import Icon from "./Icon";
import API from "../services/api";

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
        setShowOtpPopup(true); // show OTP popup
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

            {/* Remember Me Checkbox */}
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

          {/* OAuth Login Buttons */}
          <div className="mt-6 hidden">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full border-t"
                  style={{ borderColor: "var(--theme-border)" }}
                ></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 theme-bg-card theme-text-secondary">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {/* Google OAuth Button */}
              {isOAuthConfigured("google") && (
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

              {/* Facebook OAuth Button */}
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
      {showOtpPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Verify your email</h2>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4"
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              onClick={handleOtpVerification}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg theme-bg-trinary theme-text-light disabled:opacity-50 mb-2"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              onClick={handleResendOtp}
              disabled={loading1}
              className="w-full px-4 py-2 rounded-lg bg-white text-black disabled:opacity-50"
            >
              {loading1 ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

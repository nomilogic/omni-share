"use client";

import API from "@/services/api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoText from "../assets/logo-text.svg";
import Icon from "../components/Icon";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  const router = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedToken = localStorage.getItem("forgot_token");
    const tokenTime = localStorage.getItem("forgot_token_time");

    if (savedToken && tokenTime) {
      const tokenTimestamp = parseInt(tokenTime);
      const now = Date.now();
      const diff = now - tokenTimestamp;

      const expireTime = 5 * 60 * 1000; // 5 minutes in ms

      if (diff >= expireTime) {
        // token expired
        localStorage.removeItem("forgot_token");
        localStorage.removeItem("forgot_token_time");
        setExpired(true);
      } else {
        setToken(savedToken);
        setRemainingTime(expireTime - diff);

        const interval = setInterval(() => {
          const timeLeft = expireTime - (Date.now() - tokenTimestamp);
          if (timeLeft <= 0) {
            clearInterval(interval);
            localStorage.removeItem("forgot_token");
            localStorage.removeItem("forgot_token_time");
            setToken(null);
            setExpired(true);
            setRemainingTime(0);
          } else {
            setRemainingTime(timeLeft);
          }
        }, 1000);

        return () => clearInterval(interval);
      }
    } else {
      setExpired(true);
    }
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError(
        "This link has expired. Please request a new password reset link."
      );
      setExpired(true);
      return;
    }

    setLoading(true);
    try {
      await API.setNewPassword(
        { new_password: password },
        { headers: { authorization: token } }
      );
      setSuccess("Password has been reset successfully!");
      localStorage.removeItem("forgot_token");
      localStorage.removeItem("forgot_token_time");
      setTimeout(() => router("/auth"), 1000);
    } catch (err: any) {
      console.error("Reset password error", err);
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex md:items-center md:justify-center bg-gray-100 px-4 py-8 sm:px-6 sm:py-12 md:px-8">
      {!token || expired ? (
        <div className="w-full md:max-w-md md:bg-white md:rounded-2xl md:shadow-xl md:p-8 flex flex-col items-center text-center md:border md:border-gray-200">
          <div className="text-center flex justify-center mb-8 gap-2 items-center">
            <Icon name="logo" size={50} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Oops! Link Expired
          </h2>

          <p className="text-gray-500 text-sm sm:text-base mb-6 px-2 sm:px-4">
            Your password reset link has expired or is invalid. Don’t worry, you
            can request a new one.
          </p>

          <button
            onClick={() => router("/auth")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Request New Link
          </button>
        </div>
      ) : (
        <div className="w-full md:max-w-md md:bg-white md:rounded-2xl md:shadow-xl p-6 sm:p-8 md:p-10 md:border border-gray-200">
          <div className="text-center flex justify-center mb-8 gap-2 items-center">
            <Icon name="logo" size={50} />
            <span className="theme-text-primary text-lg sm:text-xl md:text-2xl lg:text-[1.6rem] tracking-tight">
              <img
                src={logoText || "/placeholder.svg"}
                alt="Logo"
                className="h-4 sm:h-5 md:h-5"
              />
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-2">
            Reset Your Password
          </h2>
          <p className="text-gray-500 text-sm sm:text-base text-center mb-6">
            Enter your new password below.
          </p>

          {/* Timer Display */}
          <div className="text-center mb-4 font-medium text-purple-700">
            Link expires in: {formatTime(remainingTime)}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
                className="w-full px-3 py-2 rounded-lg border-2 border-purple-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Re-enter password"
                className="w-full px-3 py-2 rounded-lg border-2 border-purple-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 px-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm text-center font-medium bg-green-50 py-2 px-3 rounded-lg">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-semibold text-white transition-all duration-300 ${
                loading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? "Updating..." : "Set New Password"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
};

export default ResetPasswordPage;

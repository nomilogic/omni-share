import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";
import { ArrowLeftIcon } from "lucide-react";
import Icon from "../components/Icon";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await API.setNewPassword(
        { new_password: password },
        { headers: { authorization: token } }
      );
      setSuccess("Password has been reset successfully!");
      setTimeout(() => navigate("/auth"), 1500);
    } catch (err: any) {
      console.error("Reset password error", err);
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex items-center justify-center w-full">
      <div className="relative z-10 w-full max-w-md bg-slate-50/50  shadow-xl rounded-2xl py-12 px-8 border border-slate-200/70 backdrop-blur-sm">
        <div className="flex items-center justify-center mb-8">
          <div className="text-center flex gap-2 items-center ">
            <div className="w-12 h-12   ">
              <Icon name="logo" size={50} />
            </div>
            <h1 className="text-2xl  theme-text-primary">{"OMNISHARE"}</h1>
          </div>
        </div>
        <h2 className="text-xl font-bold text-center text-gray-800  mb-1">
          Reset Your Password
        </h2>
        <p className="text-base text-gray-400 text-center mb-8">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-black dark:text-gray-300">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border-2 border-purple-300  dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black dark:text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border-2 border-purple-300  dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Re-enter password"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm text-center">{success}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg  font-semibold text-white transition-all duration-300 ${
              loading
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl"
            }`}
          >
            {loading ? "Updating..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

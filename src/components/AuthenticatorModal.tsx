"use client";

import React, { useState, useEffect } from "react";
import { notify } from "@/utils/toast";
import { useTranslation } from "react-i18next";

interface AuthenticatorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: { token: string; user: any }) => void;
  verifyOtp: (otp: string) => Promise<{ token: string; user: any }>;
}

export const AuthenticatorModal: React.FC<AuthenticatorModalProps> = ({
  open,
  onClose,
  onSuccess,
  verifyOtp,
}) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-focus behavior & reset on open/close
  useEffect(() => {
    if (open) {
      setOtp("");
      setError("");
    }
  }, [open]);

  const handleVerify = async () => {
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError(t("please_enter_valid_6_digit_code"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result: any = await verifyOtp(otp);
      onSuccess(result);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        t("2fa verification failed");
      setError(message);
      notify("error", message);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && otp.length === 6) {
      handleVerify();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-md shadow-lg max-w-sm w-full p-8  animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("two_factor_authentication")}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {t("enter_code_from_auth_app")}
          </p>
        </div>

        <div className="mb-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            onKeyDown={handleKeyDown}
            placeholder="------"
            autoFocus
            className="w-full px-4 py-2 text-center text-2xl tracking-widest placeholder:text-purple-600 font-mono letter-spacing-wide bg-gray-50 border-2 text-purple-600 border-purple-600 rounded-md focus:outline-none focus:border-purple-600 transition"
          />
          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 text-lg">
          <button
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
            className="w-full py-2.5 bg-purple-600 text-white font-semibold  rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? t("verifying") : t("verify_and_login")}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2.5 border border-purple-600 text-purple-600 font-medium hover:text-purple-800 transition rounded-md"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

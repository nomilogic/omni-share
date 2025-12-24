"use client";

import React, { useState, useEffect } from "react";
import API from "@/services/api";
import { notify } from "@/utils/toast";
import { useTranslation } from "react-i18next";

interface TwoFASetupModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TwoFASetupModal: React.FC<TwoFASetupModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Generate QR only once per session
  const startSetup = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await API.enable2FA();
      setQrCodeUrl(res.data.qrCode);
      setManualCode(res.data.manualCode);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || t("failed_to_initiate_2fa_setup");
      setError(msg);
      notify("error", msg);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verify OTP
  const verifySetup = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError(t("please_enter_valid_6_digit_code"));
      return;
    }

    setVerifying(true);
    setError("");

    try {
      await API.verify2FASetup({ token: otp });

      notify("success", t("2fa_enabled_successfully"));

      // reset after successful setup
      setQrCodeUrl(null);
      setManualCode(null);
      setOtp("");
      setError("");

      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || t("invalid_otp_code");
      setError(msg);
      notify("error", msg);
    } finally {
      setVerifying(false);
    }
  };

  // 🔹 Close modal WITHOUT regenerating QR
  const handleClose = () => {
    setOtp("");
    setError("");
    onClose();
  };

  // 🔹 Generate QR when modal opens (only once)
  useEffect(() => {
    if (open && !qrCodeUrl) {
      startSetup();
    }
  }, [open, qrCodeUrl]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start py-10 justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 text-center">
            {t("two_factor_authentication")}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {loading && !qrCodeUrl ? (
            <p className="text-center text-sm text-gray-500">
              {t("loading_qr_code")}
            </p>
          ) : qrCodeUrl ? (
            <>
              {/* QR Code */}
              <div className="text-center mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {t("scan_qr_with_auth_app")}
                </p>
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="mx-auto h-40 w-40 rounded-md border"
                />
              </div>

              {/* Manual Code */}
              <div className="mb-6 text-center">
                <p className="text-xs text-gray-500 mb-2">
                  {t("or_enter_manually")}
                </p>
                <div className="rounded-md bg-gray-50 px-3 py-2">
                  <code className="text-sm font-mono text-gray-800 break-all">
                    {manualCode}
                  </code>
                </div>
              </div>

              {/* OTP Input */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2 text-center">
                  {t("enter_code_from_app")}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full rounded-md border px-4 py-3 text-center text-lg font-mono tracking-widest focus:border-purple-500 focus:outline-none"
                  placeholder="••••••"
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-center text-xs text-red-500">
                    {error}
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-red-600">
              {t("failed_to_load_setup")}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t px-6 py-4">
          <button
            onClick={handleClose}
            disabled={verifying}
            className="flex-1 rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={verifySetup}
            disabled={verifying || otp.length < 6}
            className="flex-1 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {verifying ? t("verifying") : t("enable_2fa")}
          </button>
        </div>
      </div>
    </div>
  );
};

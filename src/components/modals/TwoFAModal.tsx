"use client";

import React, { useEffect, useState } from "react";
import API from "@/services/api";
import { notify } from "@/utils/toast";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/context/AppContext";

type Props = {
  close: () => void; // ✅ ModalContext will provide this
  onSuccess?: () => void;
};

export const TwoFAModal: React.FC<Props> = ({ close, onSuccess }) => {
  const { t } = useTranslation();
  const { refreshUser } = useAppContext();

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const startSetup = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.enable2FA();
      setQrCodeUrl(res.data.qrCode);
      setManualCode(res.data.manualCode);
    } catch (err: any) {
      setError(err?.response?.data?.message || t("failed_to_load_setup"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ API call only when modal opens
    startSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifySetup = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError(t("please_enter_valid_6_digit_code"));
      return;
    }

    setVerifying(true);
    setError("");

    try {
      await API.verify2FASetup({ token: otp });

      refreshUser();
      notify("success", t("2FA enabled successfully"));

      setOtp("");
      setQrCodeUrl(null);
      setManualCode(null);

      onSuccess?.();
      close();
    } catch (err: any) {
      const msg = err.response?.data?.message || t("invalid_otp_code");
      setError(msg);
      notify("error", msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    setOtp("");
    setError("");
    close();
  };

  return (
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
                className="w-full rounded-md border px-4 py-2 text-center text-lg font-mono tracking-widest focus:border-purple-600 focus:outline-none"
                placeholder="••••••"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-center text-xs text-red-500">{error}</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-sm text-red-600">
            {error || t("failed_to_load_setup")}
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
          disabled={verifying || otp.length < 6 || !qrCodeUrl}
          className="flex-1 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {verifying ? t("verifying") : t("enable_2fa")}
        </button>
      </div>
    </div>
  );
};

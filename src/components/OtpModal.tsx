"use client";

import React, { useEffect, useState } from "react";
import { OtpInput } from "./OtpInput";

type OtpModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: any;
  verifyOtp?: (
    otp: string
  ) => Promise<{ token?: string; user?: { id: string; email?: string } }>;
  resendOtp?: any;
  emailHint?: string;
};

export function OtpModal({
  open,
  onClose,
  onSuccess,
  verifyOtp,
  resendOtp,
  emailHint,
}: OtpModalProps) {
  const [otp, setOtp] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [info, setInfo] = React.useState<string>("");
  const [remaining, setRemaining] = React.useState<number>(40);
  const [expired, setExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format mm:ss
  const formatTime = (seconds: any) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };
  React.useEffect(() => {
    if (open) {
      setOtp("");
      setVerifying(false);
      setResending(false);
      setError("");
      setInfo("");
      setRemaining(40);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [open, remaining]);

  const handleVerify = async () => {
    setError("");
    setInfo("");
    if (otp.length < 4) {
      setError("Please enter the complete OTP.");
      return;
    }
    try {
      setVerifying(true);
      const fn = verifyOtp || (async () => ({ token: undefined }));
      const result = await fn(otp);

      if (result?.token) {
        localStorage.setItem("auth_token", result.token!);
        localStorage.removeItem("email_token");

        onSuccess(result?.user);
        onClose();
      } else {
        throw new Error("OTP verification failed");
      }
    } catch (e: unknown) {
      const message = "OTP verification failed";
      setError(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (remaining > 0) return;
    setError("");
    setInfo("");
    try {
      setResending(true);
      const fn = resendOtp || (async () => {});
      await fn();
      setInfo("OTP resent successfully.");
      setRemaining(40);
      setTimeLeft(300);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to resend OTP";
      setError(message);
    } finally {
      setResending(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-title"
      className="fixed inset-0 z-50 flex items-center justify-center "
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <h2
            id="otp-title"
            className="theme-text-secondary text-xl font-semibold text-card-foreground"
          >
            Verify your email
          </h2>
        </div>

        {emailHint ? (
          <p className="mt-1 text-sm theme-text-secondary">
            We sent a one-time code to your email .
          </p>
        ) : null}

        <div className="mt-4">
          <OtpInput
            value={otp}
            onChange={setOtp}
            disabled={verifying || expired}
            aria-describedby="otp-status"
          />
          <div id="otp-status" className="sr-only" aria-live="polite" />
        </div>

        {!expired ? (
          <p className="mt-2 text-sm theme-text-secondary">
            OTP expires in{" "}
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </p>
        ) : (
          <p className="mt-2 text-sm text-red-600">
            OTP expired. Please request a new one.
          </p>
        )}

        {error ? (
          <p
            className="mt-3 text-sm theme-text-secondary"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        ) : null}
        {info ? (
          <p className="mt-3 text-sm theme-text-secondary" aria-live="polite">
            {info}
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={handleVerify}
            disabled={verifying || otp.replace(/\D/g, "").length < 4}
            className="inline-flex items-center justify-center rounded-md px-4 py-2       bg-theme-text-secondary text-white
              hover:opacity-95
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? "Verifying…" : "Verify"}
          </button>

          <button
            onClick={handleResend}
            disabled={resending || remaining > 0}
            className="inline-flex items-center justify-center rounded-md px-4 py-2  bg-theme-text-secondary text-white              hover:opacity-95      disabled:opacity-50 disabled:cursor-not-allowed"
            aria-live="polite"
          >
            {resending
              ? "Resending…"
              : remaining > 0
              ? `Resend in ${remaining}s`
              : "Resend OTP"}
          </button>
        </div>

        <p className="mt-3 text-xs theme-text-secondary">
          Didn&apos;t receive the code? Check your spam or wait a moment before
          resending.
        </p>
      </div>
    </div>
  );
}

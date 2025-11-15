"use client";

import React, { useEffect, useState } from "react";
import { OtpInput } from "./OtpInput";
import Icon from "./Icon";
import logoText from "../assets/logo-text.svg";
import { ArrowLeftIcon } from "lucide-react";
import { notify } from "@/utils/toast";
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
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (!open) return;

    setExpired(false);
    setTimeLeft(300);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

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
        notify("success", 
        "Verification Sucessful"
      );
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
    setResending(true);
    try {
      await resendOtp();
      setTimeLeft(300);
      setExpired(false);
      setRemaining(40);
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
      className="fixed inset-0 z-50 flex md:items-center justify-center px-4 pt-8 "
    >
      <div className="w-full max-w-sm md:rounded-md md:bg-white sm:p-6 md:shadow-md">
        <div className={`flex  relative  justify-center gap-2 mb-5`}>
          <button
            onClick={() => {}}
            className="absolute left-0 top-3 sm:-left-1"
          >
            <ArrowLeftIcon className="w-8 sm:w-9 md:w-10 text-purple-600" />
          </button>
          <div className="text-center flex gap-2 items-center">
            <Icon name="logo" size={50} />
            <span className="theme-text-primary text-lg sm:text-xl md:text-2xl lg:text-[1.6rem] tracking-tight">
              <img
                src={logoText || "/placeholder.svg"}
                alt="Logo"
                className="h-4 sm:h-5 md:h-5"
              />
            </span>
          </div>
        </div>
        <h2 className="text-center text-sm sm:text-base font-medium text-black">
          Verify your email
        </h2>

        <div className="mt-5">
          <OtpInput
            value={otp}
            onChange={setOtp}
            disabled={verifying || expired}
            aria-describedby="otp-status"
          />
          <div id="otp-status" className="sr-only" aria-live="polite" />
        </div>
        {emailHint ? (
          <p className="mt-1 text-sm theme-text-secondary">
            We sent a one-time code to your email .
          </p>
        ) : null}
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
            className="mt-3 text-sm text-red-500"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        ) : null}
        {info ? (
          <p className="mt-3 text-sm text-green-600" aria-live="polite">
            {info}
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={handleVerify}
            disabled={verifying || otp.replace(/\D/g, "").length < 4}
            className="inline-flex items-center justify-center rounded-md px-4 py-2.5       bg-theme-text-secondary text-white
              hover:opacity-95
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? "Verifying…" : "Verify"}
          </button>

          <button
            onClick={handleResend}
            disabled={resending || remaining > 0}
            className="inline-flex items-center justify-center rounded-md px-4 py-2.5  bg-theme-text-secondary text-white              hover:opacity-95      disabled:opacity-50 disabled:cursor-not-allowed"
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

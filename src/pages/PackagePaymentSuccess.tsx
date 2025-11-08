import { useAppContext } from "@/context/AppContext";
import { getCurrentUser } from "@/lib/database";
import API from "@/services/api";
import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

export default function PackageSuccessPage() {
  const { dispatch } = useAppContext();

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get("session_id") ?? "";
  const hasSession = sessionId.length > 0;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!hasSession) {
      navigate("/dashboard", { replace: true });
    }
  }, [hasSession, navigate]);

  const fetchBalance = async () => {
    try {
      const response = await API.userBalance();
      const { data } = response;
      dispatch({ type: "SET_BALANCE", payload: data?.data ?? 0 });
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  useEffect(() => {
    if (!hasSession) return;

    const confirmPurchase = async () => {
      setLoading(true);
      setError(null);
      try {
        await API.confirmPurchase(sessionId);
        setConfirmed(true);
      } catch (err: any) {
        setError(
          err.message || "Failed to confirm the purchase. Please try again."
        );
      } finally {
        const authResult: any = await getCurrentUser();
        fetchBalance();
        dispatch({ type: "SET_USER", payload: authResult.user });
        setLoading(false);
      }
    };

    confirmPurchase();
  }, [hasSession]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#7650e3] to-[#7650e3]/80 ">
      <section className="w-full max-w-lg rounded-2xl border border-[#7650e3]/50 bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#7650e3]/40 text-[#7650e3] animate-bounce">
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 7L9 18l-5-5" />
            </svg>
          </span>
          <h1 className="text-2xl font-bold text-[#7650e3]">
            {loading
              ? "Confirming Purchase..."
              : confirmed
              ? "Purchase Successful!"
              : "Package Status"}
          </h1>
          <p className="text-gray-600">
            {loading
              ? "Please wait while we confirm your package..."
              : confirmed
              ? "Your package is now active. A receipt has been sent to your email."
              : error
              ? error
              : "Your package could not be confirmed."}
          </p>
        </div>

        {/* Session Info */}
        {hasSession && (
          <div className="my-6">
            <SessionId value={sessionId} />
          </div>
        )}
        {!hasSession && (
          <div className="my-6 rounded-md border border-dashed bg-green-50 p-4 text-center text-sm text-[#7650e3]">
            Session ID is missing from the URL query.
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="flex-1 rounded-md bg-[#7650e3] px-4 py-2 text-center text-sm font-medium text-white hover:bg-[#7650e3]/80 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

function SessionId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-600">
        Session ID
      </label>
      <div className="flex items-stretch gap-2">
        <div
          className="flex min-w-0 flex-1 items-center overflow-hidden rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800"
          title={value}
          aria-label={`Session ID: ${value}`}
        >
          <span className="truncate">{value}</span>
        </div>
        <button
          type="button"
          onClick={copy}
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            copied
              ? "bg-[#7650e3] text-white hover:bg-[#7650e3]/80"
              : "bg-[#7650e3]/40 text-[#7650e3] hover:bg-[#7650e3]/50"
          }`}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

import { useAppContext } from "@/context/AppContext";
import { getCurrentUser } from "@/lib/database";
import API from "@/services/api";
import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

export default function AddonSuccessPage() {
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

    const confirmAddon = async () => {
      setLoading(true);
      setError(null);
      try {
        await API.confirmAddons(sessionId);
        setConfirmed(true);
      } catch (err: any) {
        setError(
          err.message || "Failed to confirm the addon. Please try again."
        );
      } finally {
        const authResult: any = await getCurrentUser();
        dispatch({ type: "SET_USER", payload: authResult.user });
        fetchBalance();
        setLoading(false);
      }
    };

    confirmAddon();
  }, [hasSession]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-100 to-white px-4">
      <section className="w-full max-w-lg rounded-xl border border-green-300 bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 animate-bounce">
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
          <h1 className="text-2xl font-bold text-green-700">
            {loading
              ? "Confirming Add-on..."
              : confirmed
              ? "Payment Successful!"
              : "Payment Status"}
          </h1>
          <p className="text-gray-600">
            {loading
              ? "Please wait while we confirm your add-on."
              : confirmed
              ? "Your add-on is now active. A confirmation email has been sent to you."
              : error || "Your add-on could not be confirmed."}
          </p>
        </div>

        {hasSession && (
          <div className="my-6">
            <SessionId value={sessionId} />
          </div>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-lg bg-green-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-green-700 transition"
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
    } catch {}
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-600">
        Session ID
      </label>
      <div className="flex items-stretch gap-2">
        <div
          className="flex min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800"
          title={value}
          aria-label={`Session ID: ${value}`}
        >
          <span className="truncate">{value}</span>
        </div>
        <button
          type="button"
          onClick={copy}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            copied
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

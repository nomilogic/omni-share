// components/CookieBanner.tsx
"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const consent = localStorage.getItem("cookie-consent");

      if (!consent) {
        setShow(true);
      } else if (consent === "accepted") {
        loadAnalytics();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const loadAnalytics = () => {
    // Example:
    // window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
  };

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    loadAnalytics();
    setShow(false);
    setSettingsOpen(false);
  };

  const decline = () => {
    setShow(false);
    setSettingsOpen(false);
  };

  const acceptAllSettings = () => {
    setAnalyticsEnabled(true);
    accept();
  };

  const declineAllSettings = () => {
    setAnalyticsEnabled(false);
    decline();
  };

  if (!show) return null;

  return (
    <>
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/60 z-50" />

      {/* Main Banner */}
      {!settingsOpen && (
        <div className="fixed inset-x-4 bottom-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 w-full z-50">
          <div className="bg-white shadow-2xl flex justify-between items-center p-4 md:p-6 animate-in fade-in slide-in-from-bottom duration-300">
            <p className="text-sm text-purple-700 leading-relaxed">
              We use cookies to make{" "}
              <a href="https://OmniShare.ai" className="underline">
                OmniShare.ai
              </a>{" "}
              work smoothly and to help us understand how you use our platform.
            </p>

            <div className="flex flex-row gap-3">
              <button
                onClick={() => setSettingsOpen(true)}
                className="px-4 py-2 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition text-purple-700"
              >
                Cookie Settings
              </button>

              <button
                onClick={accept}
                className="px-4 py-2 bg-purple-700 text-white rounded-xl font-medium hover:bg-purple-800 transition"
              >
                Accept Cookies
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {settingsOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in relative">
            <h2 className="text-xl font-semibold text-purple-700 mb-3">
              Cookie Preferences
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Manage which cookies you want to allow. These settings apply to
              your OmniShare.ai experience.
            </p>

            {/* NECESSARY COOKIES */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Necessary Cookies</h3>
                <span className="text-xs bg-purple-700 text-white px-2 py-1 rounded">
                  Always Active
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                Required for login, security, and for OmniShare.ai to function
                properly.
              </p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Analytics Cookies</h3>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={() => setAnalyticsEnabled(!analyticsEnabled)}
                    className="sr-only hidden peer"
                  />

                  <div
                    className="w-12 h-6 bg-gray-300 rounded-full 
                  peer-checked:bg-purple-700
                  transition-all"
                  ></div>

                  <div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full 
                  transition-all
                  peer-checked:translate-x-6"
                  ></div>
                </label>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                Helps us understand how users interact with our platform (Google
                Analytics).
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={declineAllSettings}
                className="w-full px-5 py-3 text-purple-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Decline All
              </button>

              <button
                onClick={acceptAllSettings}
                className="w-full px-5 py-3 bg-purple-700 text-white rounded-xl font-medium hover:bg-purple-800 transition"
              >
                Accept All
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={() => setSettingsOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

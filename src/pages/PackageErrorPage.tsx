import React from "react";
import { Link } from "react-router-dom";

export default function PackageErrorPage({
  message = "Something went wrong. We couldn't process your package.",
}: {
  message?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f87171] to-[#f87171]/80">
      <section className="w-full max-w-lg rounded-md border border-red-400 bg-white p-8 shadow-md">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-200 text-red-600 animate-pulse">
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </span>
          <h1 className="text-2xl font-bold text-red-600">
            Oops! Error Occurred
          </h1>
          <p className="text-gray-500 font-medium">{message}</p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center w-full">
          <Link
            to="/dashboard"
            className="flex-1 rounded-md bg-red-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-red-500 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

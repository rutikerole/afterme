"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-sage/5 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center border border-amber-200/50">
          <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-light text-stone-800 mb-3">
          Something went wrong
        </h1>

        <p className="text-stone-600 mb-6">
          An unexpected error occurred. Your memories are safe.
        </p>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mb-6 p-3 bg-stone-100 rounded-lg border border-stone-200 text-left">
            <p className="text-xs text-stone-500 mb-1">Error Details</p>
            <p className="text-sm text-stone-700 font-mono break-all">{error.message}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-sage text-white rounded-lg hover:bg-sage-dark transition-colors"
          >
            Try Again
          </button>

          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-white text-sage border border-sage/20 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="px-5 py-2.5 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { legacyAccessApi, LegacyAccessRequest } from "@/lib/api";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending Review" },
  under_review: { bg: "bg-blue-100", text: "text-blue-800", label: "Under Review" },
  verified: { bg: "bg-green-100", text: "text-green-800", label: "Verified" },
  rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
  grace_period: { bg: "bg-purple-100", text: "text-purple-800", label: "Grace Period" },
  granted: { bg: "bg-sage-100", text: "text-sage-800", label: "Access Granted" },
  expired: { bg: "bg-gray-100", text: "text-gray-800", label: "Expired" },
};

export default function LegacyAccessStatusPage() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams?.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [requests, setRequests] = useState<LegacyAccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialEmail) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsLoading(true);
    setHasSearched(true);

    try {
      const result = await legacyAccessApi.checkStatus(email);
      setRequests(result.requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check status");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} remaining`;
    return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      {/* Header */}
      <header className="border-b border-sage-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sage-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 24" fill="currentColor">
                <path d="M10 2C10 2 3 8 3 14C3 18 6 22 10 22C14 22 17 18 17 14C17 8 10 2 10 2Z" />
              </svg>
            </div>
            <span className="font-serif text-xl font-semibold text-sage-800">AfterMe</span>
          </Link>
          <Link
            href="/legacy-access"
            className="text-sage-600 hover:text-sage-800 text-sm font-medium"
          >
            New Request
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8">
          <h1 className="text-2xl font-serif font-semibold text-sage-800 mb-2">
            Check Request Status
          </h1>
          <p className="text-sage-600 mb-8">
            Enter the email address you used to submit your legacy access request.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mb-8">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-3 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? "Checking..." : "Check"}
            </button>
          </div>

          {/* Results */}
          {hasSearched && !isLoading && (
            <div>
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-sage-800 mb-1">No Requests Found</h3>
                  <p className="text-sage-600">
                    We couldn&apos;t find any requests associated with this email address.
                  </p>
                  <Link
                    href="/legacy-access"
                    className="inline-block mt-4 text-sage-600 hover:text-sage-800 font-medium"
                  >
                    Submit a new request
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-sm font-medium text-sage-500 uppercase tracking-wider">
                    Your Requests ({requests.length})
                  </h2>
                  {requests.map((request) => {
                    const status = statusColors[request.status] || statusColors.pending;
                    return (
                      <div
                        key={request.id}
                        className="p-6 rounded-lg border border-sage-200 hover:border-sage-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-sage-800">
                              Access to {request.userName}&apos;s memories
                            </h3>
                            <p className="text-sm text-sage-500 mt-1">
                              Submitted {formatDate(request.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        {/* Status details */}
                        <div className="space-y-3">
                          {request.statusMessage && (
                            <div className="p-3 bg-sage-50 rounded-lg text-sm text-sage-700">
                              {request.statusMessage}
                            </div>
                          )}

                          {/* Trustee confirmations progress */}
                          {request.trusteeConfirmations && (
                            <div className="p-3 bg-sage-50 rounded-lg">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-sage-700">Trustee Confirmations</span>
                                <span className="text-sage-800 font-medium">
                                  {request.trusteeConfirmations.confirmed} of {request.trusteeConfirmations.total}
                                </span>
                              </div>
                              <div className="w-full bg-sage-200 rounded-full h-2">
                                <div
                                  className="bg-sage-500 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${(request.trusteeConfirmations.confirmed / request.trusteeConfirmations.total) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Grace period countdown */}
                          {request.status === "grace_period" && request.gracePeriodEnd && (
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <div className="flex items-center gap-2 text-purple-800">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">
                                  {getTimeRemaining(request.gracePeriodEnd)}
                                </span>
                              </div>
                              <p className="text-sm text-purple-600 mt-1">
                                Access will be granted after the grace period ends.
                              </p>
                            </div>
                          )}

                          {/* Access granted */}
                          {request.status === "granted" && (
                            <div className="p-3 bg-sage-50 rounded-lg">
                              <Link
                                href={`/legacy-access/view?requestId=${request.id}`}
                                className="flex items-center justify-between text-sage-700 hover:text-sage-800"
                              >
                                <span className="font-medium">View Legacy Content</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </Link>
                              {request.accessExpiresAt && (
                                <p className="text-sm text-sage-500 mt-1">
                                  Access expires: {formatDate(request.accessExpiresAt)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-sage-100 text-xs text-sage-400">
                          Request ID: {request.id}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help section */}
        <div className="mt-8 p-6 bg-sage-50 rounded-xl">
          <h3 className="font-medium text-sage-800 mb-2">Need Help?</h3>
          <p className="text-sm text-sage-600 mb-4">
            If you have questions about your request or need assistance, please contact our support team.
          </p>
          <a
            href="mailto:support@afterme.app"
            className="text-sm text-sage-700 hover:text-sage-800 font-medium"
          >
            support@afterme.app
          </a>
        </div>
      </main>
    </div>
  );
}

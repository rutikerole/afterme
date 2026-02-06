"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { legacyAccessApi } from "@/lib/api";

interface ConfirmationDetails {
  trusteeName: string;
  userName: string;
  requesterName: string;
  requesterEmail: string;
  relationship: string;
  verificationMethod: string;
  hasDeathCertificate: boolean;
  requestDate: string;
}

export default function TrusteeConfirmPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";

  const [details, setDetails] = useState<ConfirmationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (token) {
      loadDetails();
    } else {
      setError("No confirmation token provided");
      setIsLoading(false);
    }
  }, [token]);

  const loadDetails = async () => {
    try {
      const result = await legacyAccessApi.getConfirmationDetails(token);
      setDetails(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load confirmation details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (action: "confirm" | "deny") => {
    setIsSubmitting(true);
    setError("");

    try {
      const result = await legacyAccessApi.submitConfirmation({
        token,
        action,
        notes: notes || undefined,
      });
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process confirmation");
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sage-200 border-t-sage-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sage-600">Loading confirmation details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      {/* Header */}
      <header className="border-b border-sage-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sage-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 24" fill="currentColor">
                <path d="M10 2C10 2 3 8 3 14C3 18 6 22 10 22C14 22 17 18 17 14C17 8 10 2 10 2Z" />
              </svg>
            </div>
            <span className="font-serif text-xl font-semibold text-sage-800">AfterMe</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {error && !success ? (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-sage-800 mb-2">Error</h1>
            <p className="text-sage-600">{error}</p>
          </div>
        ) : success ? (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8 text-center">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-semibold text-sage-800 mb-2">
              Confirmation Submitted
            </h1>
            <p className="text-sage-600 mb-6">{success}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors font-medium"
            >
              Return to Home
            </Link>
          </div>
        ) : details ? (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-2xl font-serif font-semibold text-sage-800 mb-2">
                Legacy Access Confirmation
              </h1>
              <p className="text-sage-600">
                Hello {details.trusteeName}, you have been designated as a trusted person by{" "}
                <strong>{details.userName}</strong> to help verify legacy access requests.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="font-medium text-amber-800 mb-1">Important</h3>
                  <p className="text-sm text-amber-700">
                    Please carefully review this request before confirming. Only confirm if you know
                    for certain that {details.userName} has passed away.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h2 className="text-sm font-medium text-sage-500 uppercase tracking-wider">
                Request Details
              </h2>

              <div className="p-4 bg-sage-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-sage-500 mb-1">Requester</p>
                    <p className="text-sage-800 font-medium">{details.requesterName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage-500 mb-1">Email</p>
                    <p className="text-sage-800">{details.requesterEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage-500 mb-1">Relationship</p>
                    <p className="text-sage-800 capitalize">{details.relationship}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage-500 mb-1">Request Date</p>
                    <p className="text-sage-800">{formatDate(details.requestDate)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-sage-50 rounded-lg">
                <p className="text-xs text-sage-500 mb-1">Verification Method</p>
                <p className="text-sage-800 capitalize">
                  {details.verificationMethod.replace("_", " ")}
                </p>
                {details.hasDeathCertificate && (
                  <p className="text-sm text-sage-600 mt-1">
                    A death certificate has been uploaded for review.
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your decision..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleConfirm("deny")}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Deny Request"}
              </button>
              <button
                onClick={() => handleConfirm("confirm")}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Confirm Request"}
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

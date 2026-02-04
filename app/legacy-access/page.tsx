"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { legacyAccessApi, blobToBase64 } from "@/lib/api";

type Step = "info" | "verification" | "submit" | "complete";
type VerificationMethod = "death_certificate" | "trustee_confirmation" | "both";

export default function LegacyAccessPage() {
  const [step, setStep] = useState<Step>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");

  // Form state
  const [userEmail, setUserEmail] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [requesterPhone, setRequesterPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>("death_certificate");
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        setError("Please upload an image or PDF file");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setCertificateFile(file);
      setError("");

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const preview = await blobToBase64(file);
        setCertificatePreview(preview);
      } else {
        setCertificatePreview(null);
      }
    }
  };

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      // Convert certificate to base64 if provided
      let deathCertificateUrl: string | undefined;
      if (certificateFile && (verificationMethod === "death_certificate" || verificationMethod === "both")) {
        deathCertificateUrl = await blobToBase64(certificateFile);
      }

      const result = await legacyAccessApi.submitRequest({
        userEmail,
        requesterName,
        requesterEmail,
        requesterPhone: requesterPhone || undefined,
        relationship,
        verificationMethod,
        deathCertificateUrl,
      });

      setRequestId(result.requestId);
      setStep("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep1 = () => {
    if (!userEmail || !requesterName || !requesterEmail || !relationship) {
      setError("Please fill in all required fields");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      setError("Please enter a valid email for the account holder");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requesterEmail)) {
      setError("Please enter a valid email for yourself");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if ((verificationMethod === "death_certificate" || verificationMethod === "both") && !certificateFile) {
      setError("Please upload a death certificate");
      return false;
    }
    return true;
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
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {["info", "verification", "submit"].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s
                      ? "bg-sage-500 text-white"
                      : ["info", "verification", "submit"].indexOf(step) > i || step === "complete"
                      ? "bg-sage-200 text-sage-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`w-16 h-1 mx-1 ${
                      ["info", "verification", "submit"].indexOf(step) > i || step === "complete"
                        ? "bg-sage-200"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Information */}
        {step === "info" && (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8">
            <h1 className="text-2xl font-serif font-semibold text-sage-800 mb-2">
              Request Legacy Access
            </h1>
            <p className="text-sage-600 mb-8">
              We understand this is a difficult time. Please provide the following information to request
              access to your loved one&apos;s preserved memories and messages.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Account Holder&apos;s Email *
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter the email of your loved one's AfterMe account"
                  className="w-full px-4 py-3 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  placeholder="We'll use this to contact you about your request"
                  className="w-full px-4 py-3 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Your Phone (optional)
                </label>
                <input
                  type="tel"
                  value={requesterPhone}
                  onChange={(e) => setRequesterPhone(e.target.value)}
                  placeholder="For additional verification if needed"
                  className="w-full px-4 py-3 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Your Relationship *
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                >
                  <option value="">Select your relationship</option>
                  <option value="spouse">Spouse / Partner</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="grandchild">Grandchild</option>
                  <option value="grandparent">Grandparent</option>
                  <option value="friend">Close Friend</option>
                  <option value="executor">Legal Executor</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => {
                  if (validateStep1()) {
                    setError("");
                    setStep("verification");
                  }
                }}
                className="px-6 py-3 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Verification Method */}
        {step === "verification" && (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8">
            <h1 className="text-2xl font-serif font-semibold text-sage-800 mb-2">
              Verification Method
            </h1>
            <p className="text-sage-600 mb-8">
              To protect your loved one&apos;s privacy, we require verification before granting access.
              Please select a verification method.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-8">
              <label
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  verificationMethod === "death_certificate"
                    ? "border-sage-500 bg-sage-50"
                    : "border-sage-200 hover:border-sage-300"
                }`}
              >
                <input
                  type="radio"
                  name="verification"
                  value="death_certificate"
                  checked={verificationMethod === "death_certificate"}
                  onChange={(e) => setVerificationMethod(e.target.value as VerificationMethod)}
                  className="sr-only"
                />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-sage-800">Death Certificate Upload</h3>
                    <p className="text-sm text-sage-600 mt-1">
                      Upload a copy of the death certificate for verification. This is the fastest method.
                    </p>
                  </div>
                </div>
              </label>

              <label
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  verificationMethod === "trustee_confirmation"
                    ? "border-sage-500 bg-sage-50"
                    : "border-sage-200 hover:border-sage-300"
                }`}
              >
                <input
                  type="radio"
                  name="verification"
                  value="trustee_confirmation"
                  checked={verificationMethod === "trustee_confirmation"}
                  onChange={(e) => setVerificationMethod(e.target.value as VerificationMethod)}
                  className="sr-only"
                />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-sage-800">Trustee Confirmation</h3>
                    <p className="text-sm text-sage-600 mt-1">
                      Your loved one may have designated trusted people to confirm access requests.
                      We&apos;ll contact them for verification.
                    </p>
                  </div>
                </div>
              </label>

              <label
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  verificationMethod === "both"
                    ? "border-sage-500 bg-sage-50"
                    : "border-sage-200 hover:border-sage-300"
                }`}
              >
                <input
                  type="radio"
                  name="verification"
                  value="both"
                  checked={verificationMethod === "both"}
                  onChange={(e) => setVerificationMethod(e.target.value as VerificationMethod)}
                  className="sr-only"
                />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-sage-800">Both Methods (Recommended)</h3>
                    <p className="text-sm text-sage-600 mt-1">
                      Provide death certificate and get trustee confirmation for the highest security and fastest approval.
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* File upload for death certificate */}
            {(verificationMethod === "death_certificate" || verificationMethod === "both") && (
              <div className="mb-8 p-4 bg-sage-50 rounded-lg">
                <label className="block text-sm font-medium text-sage-700 mb-3">
                  Upload Death Certificate
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {certificateFile ? (
                  <div className="flex items-center gap-4">
                    {certificatePreview ? (
                      <img
                        src={certificatePreview}
                        alt="Certificate preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-sage-200 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sage-800">{certificateFile.name}</p>
                      <p className="text-sm text-sage-500">
                        {(certificateFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={() => {
                          setCertificateFile(null);
                          setCertificatePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="text-sm text-red-600 hover:text-red-700 mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-8 border-2 border-dashed border-sage-300 rounded-lg hover:border-sage-400 transition-colors"
                  >
                    <div className="text-center">
                      <svg className="w-10 h-10 text-sage-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <p className="text-sage-600">Click to upload or drag and drop</p>
                      <p className="text-sm text-sage-400 mt-1">PNG, JPG, or PDF (max 10MB)</p>
                    </div>
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep("info")}
                className="px-6 py-3 text-sage-600 hover:text-sage-800 transition-colors font-medium"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (validateStep2()) {
                    setError("");
                    setStep("submit");
                  }
                }}
                className="px-6 py-3 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === "submit" && (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8">
            <h1 className="text-2xl font-serif font-semibold text-sage-800 mb-2">
              Review & Submit
            </h1>
            <p className="text-sage-600 mb-8">
              Please review your request before submitting.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-sage-50 rounded-lg">
                <h3 className="text-sm font-medium text-sage-500 mb-2">Account Holder</h3>
                <p className="text-sage-800">{userEmail}</p>
              </div>

              <div className="p-4 bg-sage-50 rounded-lg">
                <h3 className="text-sm font-medium text-sage-500 mb-2">Your Information</h3>
                <p className="text-sage-800">{requesterName}</p>
                <p className="text-sage-600 text-sm">{requesterEmail}</p>
                {requesterPhone && <p className="text-sage-600 text-sm">{requesterPhone}</p>}
                <p className="text-sage-600 text-sm capitalize">{relationship}</p>
              </div>

              <div className="p-4 bg-sage-50 rounded-lg">
                <h3 className="text-sm font-medium text-sage-500 mb-2">Verification Method</h3>
                <p className="text-sage-800">
                  {verificationMethod === "death_certificate" && "Death Certificate Upload"}
                  {verificationMethod === "trustee_confirmation" && "Trustee Confirmation"}
                  {verificationMethod === "both" && "Death Certificate + Trustee Confirmation"}
                </p>
                {certificateFile && (
                  <p className="text-sage-600 text-sm mt-1">Certificate: {certificateFile.name}</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-8">
              <h3 className="font-medium text-amber-800 mb-1">Important Information</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>After verification, there is a 7-day grace period before access is granted.</li>
                <li>This allows time to prevent unauthorized access in case of an error.</li>
                <li>You will receive email updates about your request status.</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep("verification")}
                className="px-6 py-3 text-sage-600 hover:text-sage-800 transition-colors font-medium"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === "complete" && (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8 text-center">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-semibold text-sage-800 mb-2">
              Request Submitted
            </h1>
            <p className="text-sage-600 mb-6">
              Your request has been submitted successfully. We will review your verification
              and notify you at <strong>{requesterEmail}</strong>.
            </p>

            <div className="p-4 bg-sage-50 rounded-lg mb-6">
              <p className="text-sm text-sage-500 mb-1">Request ID</p>
              <p className="font-mono text-sage-800">{requestId}</p>
            </div>

            <div className="space-y-3">
              <Link
                href={`/legacy-access/status?email=${encodeURIComponent(requesterEmail)}`}
                className="block w-full px-6 py-3 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors font-medium"
              >
                Check Request Status
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 text-sage-600 hover:text-sage-800 transition-colors font-medium"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

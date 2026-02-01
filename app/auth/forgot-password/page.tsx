"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        {/* Success State */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sage/20 to-sage-light/30 mb-2">
            <CheckCircle2 className="w-8 h-8 text-sage" />
          </div>
          <h1 className="font-serif text-3xl font-medium text-foreground">
            Check your email
          </h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a password reset link to
          </p>
          <p className="font-medium text-foreground">{email}</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-sage/20 via-sage-light/10 to-sage/20 rounded-3xl blur-lg opacity-50" />
          <div className="relative bg-white/80 backdrop-blur-sm border border-sage/20 rounded-2xl p-8 shadow-xl shadow-sage/5">
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                className="text-sage font-medium hover:text-sage-dark transition-colors"
              >
                try another email address
              </button>
            </div>

            <hr className="my-6 border-sage/10" />

            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sage/20 to-sage-light/30 mb-2">
          <Mail className="w-8 h-8 text-sage" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-foreground">
          Forgot password?
        </h1>
        <p className="text-muted-foreground">
          No worries, we&apos;ll send you reset instructions
        </p>
      </div>

      {/* Form Card */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-sage/20 via-sage-light/10 to-sage/20 rounded-3xl blur-lg opacity-50" />

        <div className="relative bg-white/80 backdrop-blur-sm border border-sage/20 rounded-2xl p-8 shadow-xl shadow-sage/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-sage/20 text-foreground placeholder:text-muted-foreground/60 focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-sage to-sage-dark text-white font-medium rounded-xl shadow-lg shadow-sage/25 hover:shadow-xl hover:shadow-sage/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </button>

            {/* Back to Login */}
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </form>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-sage" />
          <span>Secure</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-sage" />
          <span>Private</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-sage" />
          <span>Encrypted</span>
        </div>
      </div>
    </div>
  );
}

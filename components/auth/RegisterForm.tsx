"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Mail, Lock, Eye, EyeOff, User, CheckCircle2 } from "lucide-react";

export function RegisterForm() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      setError("Password doesn't meet requirements");
      return;
    }

    setIsLoading(true);

    const result = await register(email, password, name);

    if (!result.success) {
      setError(result.error || "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-red-500 text-xs font-bold">!</span>
          </div>
          <span>{error}</span>
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <User className="w-5 h-5" />
          </div>
          <input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="name"
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-sage/20 text-foreground placeholder:text-muted-foreground/60 focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email
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

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Lock className="w-5 h-5" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="new-password"
            className="w-full pl-12 pr-12 py-3 rounded-xl bg-white border border-sage/20 text-foreground placeholder:text-muted-foreground/60 focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Password Requirements */}
        {password.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-sage" : "text-muted-foreground"}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? "opacity-100" : "opacity-40"}`} />
              <span>8+ characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-sage" : "text-muted-foreground"}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${hasUppercase ? "opacity-100" : "opacity-40"}`} />
              <span>Uppercase</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-sage" : "text-muted-foreground"}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${hasLowercase ? "opacity-100" : "opacity-40"}`} />
              <span>Lowercase</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasNumber ? "text-sage" : "text-muted-foreground"}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? "opacity-100" : "opacity-40"}`} />
              <span>Number</span>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Lock className="w-5 h-5" />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="new-password"
            className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white border text-foreground placeholder:text-muted-foreground/60 focus:ring-2 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              confirmPassword.length > 0
                ? passwordsMatch
                  ? "border-sage focus:border-sage focus:ring-sage/20"
                  : "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-sage/20 focus:border-sage focus:ring-sage/20"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-xs text-red-500">Passwords do not match</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-sage to-sage-dark text-white font-medium rounded-xl shadow-lg shadow-sage/25 hover:shadow-xl hover:shadow-sage/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-2 mt-6"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-sage/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/80 px-4 text-muted-foreground">Already a member?</span>
        </div>
      </div>

      {/* Login Link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-sage font-medium hover:text-sage-dark transition-colors"
        >
          Sign in
        </Link>
      </p>

      {/* Trust Message */}
      <p className="text-center text-xs text-muted-foreground pt-2">
        By creating an account, you&apos;re taking the first step to preserve
        your legacy. Your data is yours, always.
      </p>
    </form>
  );
}

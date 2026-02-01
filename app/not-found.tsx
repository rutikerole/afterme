"use client";

import { motion } from "framer-motion";
import { Search, Home, ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";

// Floating Leaf SVG Component
const FloatingLeaf = ({ className, style, size = 40 }: { className?: string; style?: React.CSSProperties; size?: number }) => (
  <svg
    viewBox="0 0 40 40"
    width={size}
    height={size}
    className={className}
    style={style}
  >
    <path
      d="M20 2C20 2 8 12 8 24C8 32 13 38 20 38C27 38 32 32 32 24C32 12 20 2 20 2Z"
      fill="currentColor"
      opacity="0.6"
    />
    <path
      d="M20 8C20 8 20 28 20 36M14 18C14 18 20 22 26 18"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.4"
    />
  </svg>
);

// Sparkle SVG Component
const Sparkle = ({ className, style, size = 20 }: { className?: string; style?: React.CSSProperties; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    style={style}
  >
    <path
      d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z"
      fill="currentColor"
    />
  </svg>
);

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-sage/5 relative overflow-hidden flex items-center justify-center">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft gradient orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-sage/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-sage-light/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sage/5 rounded-full blur-3xl" />

        {/* Floating leaves */}
        {[...Array(8)].map((_, i) => (
          <FloatingLeaf
            key={i}
            className="absolute text-sage/20 animate-sway"
            size={20 + Math.random() * 25}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <Sparkle
            key={`sparkle-${i}`}
            className="absolute text-sage/30 animate-twinkle"
            size={10 + Math.random() * 10}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Display */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative mb-8"
          >
            <span className="text-[150px] font-extralight text-sage/20 leading-none select-none">
              404
            </span>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sage/20 to-sage-light/30 flex items-center justify-center backdrop-blur-sm border border-sage/20">
                <Compass className="w-10 h-10 text-sage animate-spin" style={{ animationDuration: "8s" }} />
              </div>
            </motion.div>
          </motion.div>

          {/* Message */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-light text-stone-800 mb-4"
          >
            Page not found
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-stone-600 mb-8 leading-relaxed"
          >
            The page you&apos;re looking for seems to have wandered off.
            Perhaps it&apos;s exploring new memories elsewhere.
          </motion.p>

          {/* Search hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-10 p-4 bg-sage/5 rounded-2xl border border-sage/10"
          >
            <div className="flex items-center justify-center gap-2 text-sage-dark">
              <Search className="w-4 h-4" />
              <span className="text-sm">Looking for something specific?</span>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-sage to-sage-dark text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Go to Dashboard
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-sage border border-sage/20 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <p className="text-sm text-stone-400 mb-4">Popular destinations</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "Memories", href: "/dashboard/memories" },
                { label: "Stories", href: "/dashboard/stories" },
                { label: "Legacy", href: "/dashboard/legacy" },
                { label: "Family", href: "/dashboard/family" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm text-stone-600 bg-stone-100 rounded-full hover:bg-sage/10 hover:text-sage-dark transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

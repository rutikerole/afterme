"use client";

import { motion } from "framer-motion";
import { User, Users, Heart } from "lucide-react";

interface FamilyVaultToggleProps {
  mode: "personal" | "family";
  onModeChange: (mode: "personal" | "family") => void;
  familyCount?: number;
}

export function FamilyVaultToggle({
  mode,
  onModeChange,
  familyCount = 0,
}: FamilyVaultToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-sage-light/30 border border-sage/20 backdrop-blur-sm">
      {/* Personal Toggle */}
      <motion.button
        onClick={() => onModeChange("personal")}
        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          mode === "personal"
            ? "text-white"
            : "text-muted-foreground hover:text-foreground"
        }`}
        whileHover={{ scale: mode === "personal" ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {mode === "personal" && (
          <motion.div
            layoutId="vault-toggle-bg"
            className="absolute inset-0 bg-gradient-to-r from-sage to-sage-dark rounded-xl shadow-md"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <User className="w-4 h-4" />
          My Vault
        </span>
      </motion.button>

      {/* Family Toggle */}
      <motion.button
        onClick={() => onModeChange("family")}
        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          mode === "family"
            ? "text-white"
            : "text-muted-foreground hover:text-foreground"
        }`}
        whileHover={{ scale: mode === "family" ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {mode === "family" && (
          <motion.div
            layoutId="vault-toggle-bg"
            className="absolute inset-0 bg-gradient-to-r from-sage to-sage-dark rounded-xl shadow-md"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <Users className="w-4 h-4" />
          Family Vault
          {familyCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold ${
                mode === "family"
                  ? "bg-white/20 text-white"
                  : "bg-sage/20 text-sage-dark"
              }`}
            >
              {familyCount}
            </motion.span>
          )}
        </span>
      </motion.button>
    </div>
  );
}

// Decorative Family Icon Component
export function FamilyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Center person */}
      <circle cx="50" cy="35" r="12" fill="currentColor" opacity="0.8" />
      <path
        d="M35 70 C35 55 65 55 65 70"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Left person */}
      <circle cx="22" cy="42" r="8" fill="currentColor" opacity="0.5" />
      <path
        d="M12 70 C12 60 32 60 32 70"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Right person */}
      <circle cx="78" cy="42" r="8" fill="currentColor" opacity="0.5" />
      <path
        d="M68 70 C68 60 88 60 88 70"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Connection lines */}
      <path
        d="M30 48 L40 45 M60 45 L70 48"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Heart in center */}
      <path
        d="M50 85 C45 80 40 75 40 70 C40 65 45 62 50 67 C55 62 60 65 60 70 C60 75 55 80 50 85Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

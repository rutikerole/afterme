"use client";

import dynamic from "next/dynamic";
import { type ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

// Dynamic imports to prevent SSR issues
const AuthProvider = dynamic(
  () => import("@/lib/auth-context").then((mod) => mod.AuthProvider),
  { ssr: false }
);

const Toaster = dynamic(
  () => import("@/components/ui/toaster").then((mod) => mod.Toaster),
  { ssr: false }
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>{children}</AuthProvider>
      <Toaster />
    </ThemeProvider>
  );
}

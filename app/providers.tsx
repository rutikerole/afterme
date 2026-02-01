"use client";

import dynamic from "next/dynamic";
import { type ReactNode } from "react";

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
    <>
      <AuthProvider>{children}</AuthProvider>
      <Toaster />
    </>
  );
}

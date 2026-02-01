"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        // Custom styling to match the sage green theme
        style: {
          background: "hsl(var(--background))",
          border: "1px solid hsl(var(--sage) / 0.2)",
          color: "hsl(var(--foreground))",
          boxShadow: "0 4px 20px -4px hsl(var(--sage) / 0.15)",
        },
        classNames: {
          toast: "group font-sans rounded-xl",
          title: "font-medium text-foreground",
          description: "text-muted-foreground text-sm",
          actionButton: "bg-sage text-white hover:bg-sage-dark",
          cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
          success: "border-sage/30 [&>svg]:text-sage",
          error: "border-destructive/30 [&>svg]:text-destructive",
          warning: "border-amber-500/30 [&>svg]:text-amber-500",
          info: "border-sage/30 [&>svg]:text-sage",
        },
      }}
      icons={{
        success: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ),
        error: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        ),
        warning: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
        info: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        ),
      }}
      closeButton
      richColors
      expand
      duration={4000}
    />
  );
}

// Re-export toast for easy imports
export { toast } from "sonner";

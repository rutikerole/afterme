"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

// Floating Leaf SVG Component
const FloatingLeaf = ({ className, style, size = 40, variant = 1 }: { className?: string; style?: React.CSSProperties; size?: number; variant?: number }) => {
  const paths = [
    "M20 2C20 2 8 12 8 24C8 32 13 38 20 38C27 38 32 32 32 24C32 12 20 2 20 2Z",
    "M20 2C15 8 8 15 8 24C8 30 12 36 20 38C28 36 32 30 32 24C32 15 25 8 20 2Z",
    "M20 5C12 10 8 18 10 28C12 35 16 38 20 38C24 38 28 35 30 28C32 18 28 10 20 5Z",
  ];

  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={className}
      style={style}
    >
      <path
        d={paths[(variant - 1) % 3]}
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
};

// Sparkle Component
const Sparkle = ({ className, style, size = 16 }: { className?: string; style?: React.CSSProperties; size?: number }) => (
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

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-stone-50 via-white to-sage/5 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft gradient orbs */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-sage/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-sage-light/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sage/5 rounded-full blur-3xl" />

        {/* Floating leaves - left side */}
        {[...Array(5)].map((_, i) => (
          <FloatingLeaf
            key={`left-${i}`}
            className="absolute text-sage/20 animate-sway"
            size={20 + Math.random() * 20}
            variant={(i % 3) + 1}
            style={{
              top: `${10 + i * 18}%`,
              left: `${3 + i * 4}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Floating leaves - right side */}
        {[...Array(5)].map((_, i) => (
          <FloatingLeaf
            key={`right-${i}`}
            className="absolute text-sage/15 animate-drift"
            size={18 + Math.random() * 18}
            variant={((i + 1) % 3) + 1}
            style={{
              top: `${15 + i * 17}%`,
              right: `${3 + i * 5}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${5 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <Sparkle
            key={`sparkle-${i}`}
            className="absolute text-sage/25 animate-twinkle"
            size={10 + Math.random() * 8}
            style={{
              top: `${15 + Math.random() * 70}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}

        {/* Firefly particles */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`firefly-${i}`}
            className="absolute w-1.5 h-1.5 bg-sage/40 rounded-full blur-[1px] animate-firefly"
            style={{
              top: `${25 + Math.random() * 50}%`,
              left: `${15 + Math.random() * 70}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}

        {/* Decorative flowing line */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,60 Q30,40 60,60 T120,60"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-sage/10 animate-line-flow"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-sage/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-sage/20">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-semibold text-foreground group-hover:text-sage-dark transition-colors">
              AfterMe
            </span>
            <span className="text-[10px] text-sage font-medium tracking-widest uppercase">
              Legacy Vault
            </span>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Your memories are safe with us.
        </p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="w-1 h-1 rounded-full bg-sage/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-sage/60" />
          <span className="w-1 h-1 rounded-full bg-sage/40" />
        </div>
      </footer>
    </div>
  );
}

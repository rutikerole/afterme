"use client";

import { memo } from "react";

// =============================================================================
// FLOATING LEAF COMPONENT
// =============================================================================

interface FloatingLeafProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  variant?: 1 | 2 | 3;
}

export const FloatingLeaf = memo(function FloatingLeaf({
  className = "",
  style,
  size = 40,
  variant = 1,
}: FloatingLeafProps) {
  const paths = {
    1: (
      <>
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
      </>
    ),
    2: (
      <>
        <path
          d="M20 2C15 8 8 15 8 24C8 30 12 36 20 38C28 36 32 30 32 24C32 15 25 8 20 2Z"
          fill="currentColor"
          opacity="0.5"
        />
        <path
          d="M20 10C18 15 15 20 15 25M20 10C22 15 25 20 25 25"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          opacity="0.3"
        />
      </>
    ),
    3: (
      <>
        <path
          d="M20 5C12 10 8 18 10 28C12 35 16 38 20 38C24 38 28 35 30 28C32 18 28 10 20 5Z"
          fill="currentColor"
          opacity="0.55"
        />
        <path
          d="M20 12V34M13 20C17 22 23 22 27 20"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          opacity="0.35"
        />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={className}
      style={style}
    >
      {paths[variant]}
    </svg>
  );
});

// =============================================================================
// SPARKLE COMPONENT
// =============================================================================

interface SparkleProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

export const Sparkle = memo(function Sparkle({
  className = "",
  style,
  size = 20,
}: SparkleProps) {
  return (
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
});

// =============================================================================
// GENTLE RINGS COMPONENT
// =============================================================================

interface GentleRingsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const GentleRings = memo(function GentleRings({
  className = "",
  style,
}: GentleRingsProps) {
  return (
    <svg
      className={`w-32 h-32 ${className}`}
      style={style}
      viewBox="0 0 100 100"
    >
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.3"
        className="animate-rotate-gentle"
        style={{ transformOrigin: "center" }}
      />
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.3"
        opacity="0.2"
        className="animate-rotate-gentle"
        style={{ animationDirection: "reverse", animationDuration: "25s", transformOrigin: "center" }}
      />
      <circle
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.2"
        opacity="0.15"
        className="animate-rotate-gentle"
        style={{ animationDuration: "30s", transformOrigin: "center" }}
      />
    </svg>
  );
});

// =============================================================================
// FIREFLY PARTICLE COMPONENT
// =============================================================================

interface FireflyProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

export const Firefly = memo(function Firefly({
  className = "",
  style,
  size = 4,
}: FireflyProps) {
  return (
    <div
      className={`rounded-full bg-sage/40 blur-[1px] ${className}`}
      style={{
        width: size,
        height: size,
        ...style,
      }}
    />
  );
});

// =============================================================================
// MORPHING BLOB COMPONENT
// =============================================================================

interface MorphingBlobProps {
  className?: string;
  style?: React.CSSProperties;
  size?: string;
  color?: string;
  blur?: string;
  delay?: string;
}

export const MorphingBlob = memo(function MorphingBlob({
  className = "",
  style,
  size = "w-96 h-96",
  color = "bg-sage/10",
  blur = "blur-3xl",
  delay = "0s",
}: MorphingBlobProps) {
  return (
    <div
      className={`absolute rounded-full ${size} ${color} ${blur} animate-blob-morph ${className}`}
      style={{
        animationDelay: delay,
        ...style,
      }}
    />
  );
});

// =============================================================================
// DECORATIVE BACKGROUND COMPONENT
// =============================================================================

interface DecorativeBackgroundProps {
  variant?: "default" | "minimal" | "rich";
  className?: string;
}

export const DecorativeBackground = memo(function DecorativeBackground({
  variant = "default",
  className = "",
}: DecorativeBackgroundProps) {
  const leafCount = variant === "minimal" ? 4 : variant === "rich" ? 12 : 8;
  const sparkleCount = variant === "minimal" ? 3 : variant === "rich" ? 8 : 5;
  const fireflyCount = variant === "minimal" ? 3 : variant === "rich" ? 8 : 5;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Morphing Blobs */}
      <MorphingBlob
        className="top-20 right-20"
        delay="0s"
      />
      <MorphingBlob
        className="bottom-40 left-20"
        color="bg-sage-light/15"
        delay="2s"
      />
      {variant !== "minimal" && (
        <>
          <MorphingBlob
            className="top-1/2 right-1/3"
            size="w-80 h-80"
            color="bg-sage/5"
            delay="4s"
          />
          {variant === "rich" && (
            <MorphingBlob
              className="bottom-20 right-40"
              size="w-72 h-72"
              color="bg-sage-light/10"
              delay="6s"
            />
          )}
        </>
      )}

      {/* Floating Leaves */}
      {[...Array(leafCount)].map((_, i) => (
        <FloatingLeaf
          key={`leaf-${i}`}
          className="absolute text-sage/20 animate-sway"
          size={20 + Math.random() * 20}
          variant={((i % 3) + 1) as 1 | 2 | 3}
          style={{
            top: `${5 + (i * 90) / leafCount}%`,
            left: `${5 + Math.random() * 90}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${4 + Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Sparkles */}
      {[...Array(sparkleCount)].map((_, i) => (
        <Sparkle
          key={`sparkle-${i}`}
          className="absolute text-sage/25 animate-twinkle"
          size={8 + Math.random() * 8}
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${10 + Math.random() * 80}%`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}

      {/* Firefly Particles */}
      {[...Array(fireflyCount)].map((_, i) => (
        <Firefly
          key={`firefly-${i}`}
          className="absolute animate-firefly"
          size={3 + Math.random() * 3}
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${10 + Math.random() * 80}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Gentle Rings */}
      {variant !== "minimal" && (
        <>
          <GentleRings
            className="absolute top-40 right-20 text-sage/10"
          />
          {variant === "rich" && (
            <GentleRings
              className="absolute bottom-40 left-20 text-sage/10"
              style={{ animationDirection: "reverse" }}
            />
          )}
        </>
      )}

      {/* Flowing Lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          d="M0,50 Q25,30 50,50 T100,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-sage/10 animate-line-flow"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0,70 Q35,50 70,70 T140,70"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          className="text-sage/8 animate-line-flow"
          style={{ animationDelay: "2s" }}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Ripple Circles */}
      {variant === "rich" && (
        <>
          <div className="absolute top-1/4 left-1/4 w-40 h-40 border border-sage/10 rounded-full animate-ripple" />
          <div
            className="absolute bottom-1/3 right-1/4 w-32 h-32 border border-sage/5 rounded-full animate-ripple"
            style={{ animationDelay: "1.5s" }}
          />
        </>
      )}
    </div>
  );
});

// =============================================================================
// PEACE DOVE COMPONENT
// =============================================================================

interface PeaceDoveProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

export const PeaceDove = memo(function PeaceDove({
  className = "",
  style,
  size = 60,
}: PeaceDoveProps) {
  return (
    <svg
      viewBox="0 0 60 60"
      width={size}
      height={size}
      className={className}
      style={style}
    >
      <path
        d="M45 25C45 25 35 20 30 25C25 30 20 35 15 35C10 35 8 30 8 30C8 30 12 32 15 30C18 28 22 22 30 20C38 18 45 25 45 25Z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M30 25C30 25 25 28 22 32M35 23C38 20 42 18 48 18"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.4"
      />
      <circle cx="28" cy="24" r="1" fill="currentColor" opacity="0.8" />
    </svg>
  );
});

// =============================================================================
// CANDLE DECORATION COMPONENT
// =============================================================================

interface CandleDecorationProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

export const CandleDecoration = memo(function CandleDecoration({
  className = "",
  style,
  size = 40,
}: CandleDecorationProps) {
  return (
    <svg
      viewBox="0 0 40 50"
      width={size}
      height={size * 1.25}
      className={className}
      style={style}
    >
      <rect x="15" y="20" width="10" height="25" rx="2" fill="currentColor" opacity="0.3" />
      <ellipse cx="20" cy="20" rx="5" ry="2" fill="currentColor" opacity="0.4" />
      <path
        d="M20 5C20 5 15 12 17 16C18 18 20 18 20 18C20 18 22 18 23 16C25 12 20 5 20 5Z"
        fill="currentColor"
        opacity="0.6"
        className="animate-breathe"
      />
      <ellipse cx="20" cy="17" rx="2" ry="1" fill="currentColor" opacity="0.8" />
    </svg>
  );
});

// =============================================================================
// TROPHY DECORATION COMPONENT
// =============================================================================

interface TrophyDecorationProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

export const TrophyDecoration = memo(function TrophyDecoration({
  className = "",
  style,
  size = 50,
}: TrophyDecorationProps) {
  return (
    <svg
      viewBox="0 0 50 60"
      width={size}
      height={size * 1.2}
      className={className}
      style={style}
    >
      <path
        d="M15 10H35V25C35 35 30 40 25 42C20 40 15 35 15 25V10Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M10 12C10 12 5 15 5 20C5 25 10 27 15 25"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.3"
      />
      <path
        d="M40 12C40 12 45 15 45 20C45 25 40 27 35 25"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.3"
      />
      <rect x="20" y="42" width="10" height="8" fill="currentColor" opacity="0.25" />
      <rect x="15" y="50" width="20" height="5" rx="1" fill="currentColor" opacity="0.3" />
      <path
        d="M25 18L26.5 22H30.5L27.5 24.5L28.5 28.5L25 26L21.5 28.5L22.5 24.5L19.5 22H23.5L25 18Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
});

"use client";

import { useScrollAnimation, useParallax } from "@/lib/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale" | "blur";
  delay?: number;
}

export function AnimatedSection({
  children,
  className,
  animation = "fade-up",
  delay = 0,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation();

  const animations = {
    "fade-up": "translate-y-8 opacity-0",
    "fade-in": "opacity-0",
    "slide-left": "-translate-x-8 opacity-0",
    "slide-right": "translate-x-8 opacity-0",
    scale: "scale-95 opacity-0",
    blur: "blur-sm opacity-0",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "translate-y-0 translate-x-0 scale-100 blur-0 opacity-100" : animations[animation],
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function ParallaxSection({
  children,
  className,
  speed = 0.3,
}: ParallaxSectionProps) {
  const { ref, offset } = useParallax(speed);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform: `translateY(${offset}px)` }}
    >
      {children}
    </div>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 100,
}: StaggerContainerProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={cn("stagger-children", isVisible && "revealed", className)}
      style={{ "--stagger-delay": `${staggerDelay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}

export function FloatingElement({
  children,
  className,
  duration = 6,
  delay = 0,
}: FloatingElementProps) {
  return (
    <div
      className={cn("animate-float", className)}
      style={{
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

interface GlowingOrbProps {
  className?: string;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function GlowingOrb({ className, color = "sage", size = "md" }: GlowingOrbProps) {
  const sizes = {
    sm: "w-32 h-32",
    md: "w-64 h-64",
    lg: "w-96 h-96",
    xl: "w-[500px] h-[500px]",
  };

  return (
    <div
      className={cn(
        "absolute rounded-full blur-[100px] animate-pulse",
        sizes[size],
        `bg-${color}/10`,
        className
      )}
    />
  );
}

interface MorphingBlobProps {
  className?: string;
  color?: string;
}

export function MorphingBlob({ className, color = "sage" }: MorphingBlobProps) {
  return (
    <div
      className={cn(
        "absolute w-64 h-64 animate-morph",
        `bg-${color}/20`,
        className
      )}
    />
  );
}

// Loading components
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return <div className={cn("spinner", sizes[size])} />;
}

export function DotsLoading() {
  return (
    <div className="dots-loading">
      <span />
      <span />
      <span />
    </div>
  );
}

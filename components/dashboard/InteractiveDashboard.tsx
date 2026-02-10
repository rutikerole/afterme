"use client";

import { useRef, useState, useEffect, useSyncExternalStore } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  Mic,
  BookOpen,
  Heart,
  ArrowRight,
  Check,
  Sparkles,
  TrendingUp,
  Quote,
} from "lucide-react";

// Centralized constants and utilities
import {
  PILLARS,
  FLOATING_DOTS,
  MEMORY_PROMPTS,
  INSPIRATIONAL_QUOTES,
  type Pillar,
} from "@/lib/constants";
import {
  getGreetingByHour,
  calculateOverallProgress,
  getCompletedPillars,
  getNextIncompletePillar,
  getFirstName,
  getDailyItem,
} from "@/lib/utils";

interface DashboardProps {
  userName: string;
}

// ════════════════════════════════════════════════════════════════════════════
// ARTISTIC SVG DECORATIONS
// ════════════════════════════════════════════════════════════════════════════

// Floating Leaf decoration with variants
const FloatingLeaf = ({ className, style, size = 40, variant = 1 }: { className?: string; style?: React.CSSProperties; size?: number; variant?: number }) => {
  const paths = [
    "M20 2C20 2 8 12 8 24C8 32 13 38 20 38C27 38 32 32 32 24C32 12 20 2 20 2Z",
    "M20 2C15 8 8 15 8 24C8 30 12 36 20 38C28 36 32 30 32 24C32 15 25 8 20 2ZM20 10C18 15 15 20 15 25M20 10C22 15 25 20 25 25",
    "M20 5C12 10 8 18 10 28C12 35 16 38 20 38C24 38 28 35 30 28C32 18 28 10 20 5Z",
  ];

  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d={paths[(variant - 1) % 3]}
        fill="hsl(var(--sage))"
        fillOpacity="0.3"
        stroke="hsl(var(--sage))"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
      <path
        d="M20 8V32M20 14L14 20M20 20L26 26"
        stroke="hsl(var(--sage))"
        strokeWidth="1"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Sparkle decoration
const SparkleDecor = ({ className, style, size = 20 }: { className?: string; style?: React.CSSProperties; size?: number }) => (
  <svg className={className} style={style} width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path
      d="M10 0L11.5 8.5L20 10L11.5 11.5L10 20L8.5 11.5L0 10L8.5 8.5L10 0Z"
      fill="hsl(var(--sage))"
      fillOpacity="0.5"
    />
  </svg>
);

// Gentle rings decoration
const GentleRings = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} width="80" height="80" viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="35" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="5 5" className="animate-rotate-gentle" style={{ transformOrigin: 'center' }} />
    <circle cx="40" cy="40" r="25" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.3" className="animate-rotate-gentle" style={{ transformOrigin: 'center', animationDirection: 'reverse', animationDuration: '25s' }} />
    <circle cx="40" cy="40" r="15" fill="hsl(var(--sage))" fillOpacity="0.08" />
  </svg>
);

// ════════════════════════════════════════════════════════════════════════════
// DECORATIVE BACKGROUND
// ════════════════════════════════════════════════════════════════════════════
function DecorativeBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Morphing background blobs - smaller on mobile to prevent overflow */}
      <div className="absolute top-0 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-sage/12 rounded-full blur-[80px] md:blur-[120px] animate-blob-morph" />
      <div className="absolute bottom-0 right-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-sage-light/20 rounded-full blur-[60px] md:blur-[100px] animate-blob-morph" style={{ animationDelay: "-5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-sage/5 rounded-full blur-[80px] md:blur-[150px] animate-blob-morph" style={{ animationDelay: "-10s" }} />
      <div className="absolute top-1/3 right-1/3 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-sage/8 rounded-full blur-[40px] md:blur-[80px] animate-blob-morph" style={{ animationDelay: "-3s" }} />

      {/* Floating Leaves with varied animations - hidden on very small screens for performance */}
      <FloatingLeaf className="absolute top-24 left-[8%] animate-float-rotate opacity-50 hidden sm:block" style={{ animationDuration: "10s" }} size={45} variant={1} />
      <FloatingLeaf className="absolute top-[35%] right-[5%] animate-sway opacity-45 hidden md:block" style={{ animationDuration: "6s" }} size={40} variant={2} />
      <FloatingLeaf className="absolute bottom-[25%] left-[5%] animate-drift opacity-40 hidden sm:block" style={{ animationDuration: "12s" }} size={50} variant={3} />
      <FloatingLeaf className="absolute top-[15%] right-[20%] animate-swing opacity-35 hidden lg:block" style={{ animationDuration: "4s" }} size={35} variant={1} />
      <FloatingLeaf className="absolute bottom-[45%] right-[10%] animate-wave opacity-30 hidden md:block" style={{ animationDuration: "7s" }} size={38} variant={2} />
      <FloatingLeaf className="absolute top-[55%] left-[12%] animate-float opacity-35 hidden lg:block" style={{ animationDuration: "9s", animationDelay: "2s" }} size={42} variant={3} />
      <FloatingLeaf className="absolute bottom-[15%] right-[25%] animate-float-rotate opacity-25 hidden md:block" style={{ animationDuration: "11s", animationDelay: "1s" }} size={32} variant={1} />
      <FloatingLeaf className="absolute top-[70%] left-[30%] animate-sway opacity-30 hidden lg:block" style={{ animationDuration: "8s", animationDelay: "3s" }} size={36} variant={2} />

      {/* Sparkles - reduced on mobile */}
      <SparkleDecor className="absolute top-32 left-[25%] animate-twinkle opacity-55 hidden sm:block" style={{ animationDelay: "0s" }} size={16} />
      <SparkleDecor className="absolute top-[45%] right-[25%] animate-twinkle opacity-50" style={{ animationDelay: "0.5s" }} size={20} />
      <SparkleDecor className="absolute bottom-28 right-[40%] animate-twinkle opacity-45 hidden md:block" style={{ animationDelay: "1s" }} size={14} />
      <SparkleDecor className="absolute top-[20%] left-[40%] animate-twinkle opacity-40 hidden lg:block" style={{ animationDelay: "1.5s" }} size={18} />
      <SparkleDecor className="absolute bottom-[40%] left-[32%] animate-twinkle opacity-35 hidden md:block" style={{ animationDelay: "2s" }} size={12} />
      <SparkleDecor className="absolute top-[60%] right-[15%] animate-twinkle opacity-45 hidden sm:block" style={{ animationDelay: "0.8s" }} size={15} />

      {/* Firefly particles - reduced on mobile */}
      <div className="absolute top-32 left-[28%] w-3 h-3 rounded-full bg-sage/45 animate-firefly hidden sm:block" style={{ animationDuration: "8s" }} />
      <div className="absolute top-[48%] right-[28%] w-4 h-4 rounded-full bg-sage/35 animate-firefly" style={{ animationDuration: "10s", animationDelay: "2s" }} />
      <div className="absolute bottom-28 right-[42%] w-3 h-3 rounded-full bg-sage/40 animate-firefly hidden md:block" style={{ animationDuration: "9s", animationDelay: "4s" }} />
      <div className="absolute top-[65%] left-[18%] w-2 h-2 rounded-full bg-sage/30 animate-firefly hidden md:block" style={{ animationDuration: "7s", animationDelay: "1s" }} />
      <div className="absolute top-[30%] right-[38%] w-3 h-3 rounded-full bg-sage/25 animate-firefly hidden lg:block" style={{ animationDuration: "11s", animationDelay: "3s" }} />

      {/* Gentle rings - hidden on mobile */}
      <GentleRings className="absolute top-[12%] left-[15%] opacity-25 hidden md:block" />
      <GentleRings className="absolute bottom-[18%] right-[10%] opacity-20 hidden lg:block" style={{ transform: 'scale(0.7)' }} />
      <GentleRings className="absolute top-[50%] right-[5%] opacity-15 hidden lg:block" style={{ transform: 'scale(0.5)' }} />

      {/* Decorative animated wavy lines */}
      <svg className="absolute top-12 left-0 w-full h-32 opacity-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,60 Q200,20 400,60 T800,60 T1200,60" fill="none" stroke="hsl(var(--sage))" strokeWidth="2" className="animate-line-flow" />
        <path d="M0,80 Q300,40 600,80 T1200,80" fill="none" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.6" className="animate-line-flow" style={{ animationDelay: "-2s" }} />
      </svg>
      <svg className="absolute bottom-20 left-0 w-full h-24 opacity-15" viewBox="0 0 1200 100" preserveAspectRatio="none">
        <path d="M0,50 C200,20 400,80 600,50 C800,20 1000,80 1200,50" fill="none" stroke="hsl(var(--sage))" strokeWidth="2" className="animate-line-flow" style={{ animationDirection: "reverse" }} />
      </svg>

      {/* Spinning decorative circles */}
      <svg className="absolute top-20 right-20 w-32 h-32 text-sage/15 animate-rotate-gentle" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
      </svg>
      <svg className="absolute bottom-32 left-20 w-24 h-24 text-sage/12 animate-rotate-gentle" style={{ animationDirection: "reverse", animationDuration: "25s" }} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </svg>

      {/* Floating dots */}
      {FLOATING_DOTS.map((dot, i) => (
        <div
          key={i}
          className={`absolute ${dot.size} ${dot.opacity} rounded-full animate-float`}
          style={{
            top: dot.top,
            left: dot.left,
            right: dot.right,
            bottom: dot.bottom,
            animationDelay: `${dot.delay}s`
          }}
        />
      ))}

      {/* Ripple circles */}
      <div className="absolute top-[35%] left-[45%] w-32 h-32 rounded-full border border-sage/15 animate-ripple" style={{ animationDuration: "4s" }} />
      <div className="absolute top-[35%] left-[45%] w-32 h-32 rounded-full border border-sage/15 animate-ripple" style={{ animationDuration: "4s", animationDelay: "1.3s" }} />
      <div className="absolute top-[35%] left-[45%] w-32 h-32 rounded-full border border-sage/15 animate-ripple" style={{ animationDuration: "4s", animationDelay: "2.6s" }} />

      {/* Corner decorative lines */}
      <div className="absolute top-0 left-0 w-32 h-32">
        <div className="absolute top-8 left-0 w-16 h-px bg-gradient-to-r from-sage/40 to-transparent" />
        <div className="absolute top-0 left-8 w-px h-16 bg-gradient-to-b from-sage/40 to-transparent" />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32">
        <div className="absolute top-8 right-0 w-16 h-px bg-gradient-to-l from-sage/40 to-transparent" />
        <div className="absolute top-0 right-8 w-px h-16 bg-gradient-to-b from-sage/40 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32">
        <div className="absolute bottom-8 left-0 w-16 h-px bg-gradient-to-r from-sage/30 to-transparent" />
        <div className="absolute bottom-0 left-8 w-px h-16 bg-gradient-to-t from-sage/30 to-transparent" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32">
        <div className="absolute bottom-8 right-0 w-16 h-px bg-gradient-to-l from-sage/30 to-transparent" />
        <div className="absolute bottom-0 right-8 w-px h-16 bg-gradient-to-t from-sage/30 to-transparent" />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PROGRESS RING COMPONENT
// ════════════════════════════════════════════════════════════════════════════
function ProgressRing({ progress }: { progress: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current >= progress) {
        clearInterval(interval);
        setDisplayProgress(progress);
      } else {
        setDisplayProgress(current);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [isInView, progress]);

  const size = 200;
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <div
      ref={ref}
      className="relative"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={displayProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Overall legacy progress"
    >
      {/* Soft glow behind - CSS based for cleaner rendering */}
      <div className="absolute inset-4 bg-sage/10 rounded-full blur-[25px]" aria-hidden="true" />

      <svg
        className="relative transform -rotate-90"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--sage))" />
            <stop offset="100%" stopColor="hsl(var(--sage-dark))" />
          </linearGradient>
        </defs>

        {/* Background ring - clean and simple */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--sage) / 0.12)"
          strokeWidth={strokeWidth}
        />

        {/* Progress ring - no filter for clean edges */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: circumference - (circumference * progress) / 100 } : {}}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-serif font-medium text-sage-dark">{displayProgress}</span>
        <span className="text-sage/60 text-xs tracking-[0.2em] uppercase mt-1">percent</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PILLAR CARD COMPONENT
// ════════════════════════════════════════════════════════════════════════════
function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  const Icon = pillar.icon;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={pillar.href}
        className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 rounded-3xl"
        aria-label={`${pillar.name} - ${pillar.items} items, ${pillar.progress}% complete`}
      >
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-sage/20 hover:border-sage/40 transition-all duration-500 overflow-hidden"
        >
          {/* Hover gradient glow */}
          <div className="absolute -inset-2 bg-gradient-to-br from-sage/20 via-sage-light/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sage/10 to-transparent rounded-bl-[60px]" />

          {/* Icon with animation */}
          <motion.div
            whileHover={{ rotate: -8, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-sage/20 to-sage-light/30 backdrop-blur-sm border border-sage/30 flex items-center justify-center mb-6 group-hover:shadow-[0_8px_24px_-4px_hsl(var(--sage)/0.3)] transition-shadow duration-300"
            aria-hidden="true"
          >
            <Icon className="w-7 h-7 text-sage-dark group-hover:text-sage transition-colors" />
          </motion.div>

          {/* Content */}
          <div className="relative z-10">
            <h3 className="text-xl font-serif font-medium text-foreground mb-2 tracking-tight group-hover:text-sage-dark transition-colors">
              {pillar.name}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {pillar.description}
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-serif font-medium text-sage">{pillar.items}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">items</span>
              </div>

              {/* Mini progress bar */}
              <div className="flex items-center gap-2">
                <div
                  className="w-16 h-1.5 bg-sage/10 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={pillar.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${pillar.name} progress`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${pillar.progress}%` } : {}}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-sage to-sage-dark rounded-full"
                  />
                </div>
                <span className="text-xs text-sage font-medium" aria-hidden="true">{pillar.progress}%</span>
              </div>
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-sage/20">
            <ArrowRight className="w-5 h-5 text-sage-dark" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ORGANIC DIVIDER
// ════════════════════════════════════════════════════════════════════════════
function OrganicDivider() {
  return (
    <div className="relative py-12 overflow-hidden">
      <svg className="w-full h-12" viewBox="0 0 1200 40" preserveAspectRatio="none">
        <motion.path
          d="M0,20 Q150,5 300,20 T600,20 T900,20 T1200,20"
          fill="none"
          stroke="hsl(var(--sage) / 0.3)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        {/* Decorative dots along the path */}
        <circle cx="300" cy="20" r="3" fill="hsl(var(--sage) / 0.4)" />
        <circle cx="600" cy="20" r="4" fill="hsl(var(--sage) / 0.3)" />
        <circle cx="900" cy="20" r="3" fill="hsl(var(--sage) / 0.4)" />
      </svg>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function InteractiveDashboard({ userName }: DashboardProps) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const firstName = getFirstName(userName);
  const overallProgress = calculateOverallProgress(PILLARS);
  const completedPillars = getCompletedPillars(PILLARS);
  const nextPillar = getNextIncompletePillar(PILLARS);
  const greeting = getGreetingByHour();
  const GreetingIcon = greeting.icon;
  const dailyQuote = getDailyItem(INSPIRATIONAL_QUOTES);
  const dailyPrompt = getDailyItem(MEMORY_PROMPTS);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-sage/20 border-t-sage rounded-full animate-spin" />
          <span className="text-sage/60 text-sm">Loading your legacy...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-sage-light/5 to-background relative">
      {/* Decorative background */}
      <DecorativeBackground />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1: HERO - ARTISTIC WELCOME
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 pt-8 pb-16 overflow-hidden">
        {/* Hero-specific decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-10 right-[15%] w-64 h-64 bg-sage/10 rounded-full blur-[80px]"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-0 left-[10%] w-80 h-80 bg-sage-light/15 rounded-full blur-[100px]"
          />
        </div>

        <div className="max-w-6xl mx-auto relative">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">

            {/* LEFT: Greeting & Actions */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Time-based greeting badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-sage/25 rounded-full shadow-sm">
                  <GreetingIcon className="w-4 h-4 text-amber-500" aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground/80">
                    {greeting.text}
                  </span>
                </div>
              </motion.div>

              {/* Main heading with gradient */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1]"
                >
                  <span className="text-foreground">Hello,</span>
                  <br />
                  <span className="bg-gradient-to-r from-sage via-sage-dark to-sage bg-clip-text text-transparent">
                    {firstName}
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground max-w-md"
                >
                  What would you like to preserve today?
                </motion.p>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-3 pt-2"
              >
                <Link href="/dashboard/voice">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-sage hover:bg-sage-dark text-white rounded-full font-medium shadow-lg shadow-sage/25 transition-colors"
                  >
                    <Mic className="w-4 h-4" />
                    Record a Message
                  </motion.button>
                </Link>
                <Link href="/dashboard/memories">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/70 hover:bg-white border border-sage/30 text-sage-dark rounded-full font-medium transition-all"
                  >
                    <Heart className="w-4 h-4" />
                    Add Memory
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            {/* RIGHT: Inspirational Quote Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/80 via-white/60 to-sage-light/30 backdrop-blur-sm border border-white/60 shadow-xl">
                {/* Decorative quote mark */}
                <Quote className="absolute top-4 right-4 w-12 h-12 text-sage/15" />

                {/* Floating decorative elements */}
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center"
                >
                  <Sparkles className="w-4 h-4 text-sage" />
                </motion.div>

                <div className="relative">
                  <p className="text-xs uppercase tracking-[0.2em] text-sage mb-3">Daily Reflection</p>
                  <p className="font-serif text-xl sm:text-2xl text-foreground leading-relaxed italic">
                    &ldquo;{dailyQuote}&rdquo;
                  </p>
                  <div className="mt-6 pt-4 border-t border-sage/15">
                    <Link href="/dashboard/stories">
                      <motion.span
                        whileHover={{ x: 4 }}
                        className="inline-flex items-center gap-2 text-sm font-medium text-sage hover:text-sage-dark transition-colors cursor-pointer"
                      >
                        Start writing your story
                        <ArrowRight className="w-4 h-4" />
                      </motion.span>
                    </Link>
                  </div>
                </div>

                {/* Mini progress indicator */}
                <div className="absolute -bottom-3 -right-3 px-4 py-2 bg-white rounded-full shadow-lg border border-sage/20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sage/15 flex items-center justify-center">
                      <span className="text-sm font-bold text-sage">{overallProgress}%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Legacy<br/>Complete</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity & Insights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Recent Activity Card */}
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-white/60 backdrop-blur-sm border border-sage/20 relative overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-sage/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                  <span className="text-xs uppercase tracking-wider text-sage/70">Recent Activity</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-sage/5 border border-sage/10">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                      <Mic className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium">Voice message recorded</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-sage/5 border border-sage/10">
                    <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium">3 memories added</p>
                      <p className="text-xs text-muted-foreground">5 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* On This Day / Memory Prompt Card */}
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/80 to-orange-50/60 backdrop-blur-sm border border-amber-200/30 relative overflow-hidden"
            >
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs uppercase tracking-wider text-amber-600/70">Memory Prompt</span>
                </div>
                <p className="font-serif text-lg text-amber-900/80 leading-relaxed mb-4">
                  &ldquo;{dailyPrompt}&rdquo;
                </p>
                <Link href="/dashboard/stories">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 rounded-full text-sm font-medium transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    Write about it
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Legacy Streak / Encouragement Card */}
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-sage-light/30 to-sage/10 backdrop-blur-sm border border-sage/20 relative overflow-hidden"
            >
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-sage/15 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-sage" />
                  <span className="text-xs uppercase tracking-wider text-sage/70">Your Journey</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-serif font-medium text-sage-dark">12</span>
                  <span className="text-sm text-sage/70">days active</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  You&apos;re building something meaningful. Keep going!
                </p>
                <div className="flex gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${i < 5 ? 'bg-sage' : 'bg-sage/20'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-sage/60 mt-2">This week&apos;s activity</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <OrganicDivider />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2: PROGRESS & GUIDANCE
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Progress Ring */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center lg:items-start"
            >
              <span className="text-sage/60 text-xs tracking-[0.2em] uppercase mb-8">Your Legacy Progress</span>
              <ProgressRing progress={overallProgress} />
              <p className="text-muted-foreground text-center lg:text-left mt-8 max-w-xs">
                You&apos;re building something beautiful. Every step brings you closer to preserving what matters.
              </p>

              {/* View Full Report Button */}
              <Link href="/dashboard/progress" className="group mt-6 inline-flex">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-sage/10 hover:bg-sage/20 border border-sage/30 hover:border-sage/50 rounded-full transition-all duration-300"
                >
                  <TrendingUp className="w-4 h-4 text-sage" />
                  <span className="text-sm font-medium text-sage-dark">View Full Report</span>
                  <ArrowRight className="w-4 h-4 text-sage group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </Link>
            </motion.div>

            {/* Guidance */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* What you've completed */}
              <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-sage/20">
                <h3 className="text-foreground font-serif font-medium mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-sage" />
                  </div>
                  What you&apos;ve completed
                </h3>
                <div className="space-y-3">
                  {completedPillars.map(pillar => (
                    <div key={pillar.id} className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-sage" />
                      <span className="text-sm">{pillar.name} — <span className="text-sage font-medium">{pillar.progress}%</span></span>
                    </div>
                  ))}
                  {completedPillars.length === 0 && (
                    <p className="text-sage/60 text-sm italic">Start your journey by exploring any pillar below.</p>
                  )}
                </div>
              </div>

              {/* What matters next */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-sage/10 to-sage-light/20 backdrop-blur-sm border border-sage/30">
                <h3 className="text-foreground font-serif font-medium mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sage/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-sage-dark" />
                  </div>
                  What matters most next
                </h3>
                {nextPillar && (
                  <Link href={nextPillar.href} className="group block">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-sage/20 group-hover:border-sage/40 group-hover:bg-white/70 transition-all duration-300">
                      <div>
                        <p className="text-foreground font-medium">{nextPillar.name}</p>
                        <p className="text-sage/70 text-sm">Only {nextPillar.progress}% complete — needs your attention</p>
                      </div>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="w-10 h-10 rounded-full bg-sage/20 group-hover:bg-sage flex items-center justify-center transition-colors duration-300"
                      >
                        <ArrowRight className="w-5 h-5 text-sage-dark group-hover:text-white transition-colors" />
                      </motion.div>
                    </div>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <OrganicDivider />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3: PILLARS (ARTISTIC LAYOUT)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sage/60 text-xs tracking-[0.2em] uppercase mb-4 block">Your Journey</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground tracking-tight">
              Life <span className="text-sage">Pillars</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
              Each pillar holds a piece of your legacy. Build them together, one memory at a time.
            </p>
          </motion.div>

          {/* Artistic grid - responsive layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* First row - Featured pillar spans 2 on large screens */}
            <div className="sm:col-span-2 lg:col-span-2">
              <PillarCard pillar={PILLARS[0]} index={0} />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <PillarCard pillar={PILLARS[1]} index={1} />
            </div>

            {/* Second row - 1 + 1 + 1 */}
            <div>
              <PillarCard pillar={PILLARS[2]} index={2} />
            </div>
            <div>
              <PillarCard pillar={PILLARS[3]} index={3} />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <PillarCard pillar={PILLARS[4]} index={4} />
            </div>

            {/* Third row - 1 + 2 */}
            <div>
              <PillarCard pillar={PILLARS[5]} index={5} />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <PillarCard pillar={PILLARS[6]} index={6} />
            </div>

            {/* Fourth row - full width for Eldercare */}
            <div className="sm:col-span-2 lg:col-span-3">
              <PillarCard pillar={PILLARS[7]} index={7} />
            </div>
          </div>
        </div>
      </section>

      <OrganicDivider />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 4: EMOTIONAL FOOTER
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="px-6 py-20 relative">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] bg-sage/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Decorative element */}
            <div className="flex justify-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border border-sage/30 flex items-center justify-center"
              >
                <Heart className="w-6 h-6 text-sage" />
              </motion.div>
            </div>

            {/* Emotional message */}
            <p className="text-sage/60 text-xs tracking-[0.2em] uppercase mb-4 sm:mb-6">Remember</p>
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-foreground leading-relaxed mb-6 sm:mb-8 px-4 sm:px-0">
              The moments you preserve today
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="text-sage">become treasures for tomorrow.</span>
            </h3>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-10 text-muted-foreground text-xs sm:text-sm mb-8 sm:mb-12">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sage/50" />
                Secure & Private
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sage/50" />
                Made with Love
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sage/50" />
                Your Legacy
              </span>
            </div>

            {/* Final CTA */}
            <Link href="/dashboard/vault">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-sage hover:bg-sage-dark text-white rounded-full transition-colors shadow-[0_8px_30px_-4px_hsl(var(--sage)/0.4)] hover:shadow-[0_12px_40px_-4px_hsl(var(--sage)/0.5)]"
              >
                <span className="text-sm font-medium tracking-wide">Continue Building Your Legacy</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Soft divider */}
          <div className="mt-16 pt-8 border-t border-sage/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground/60">
              <span>© afterMe</span>
              <span>Your legacy, preserved forever.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

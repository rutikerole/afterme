"use client";

import { useRef, useState, useEffect, useSyncExternalStore } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  Mic,
  Heart,
  Sparkles,
  BookOpen,
  TrendingUp,
  Plus,
  Leaf,
  Calendar,
  Users,
  Gift,
  Clock,
  Quote,
  Shield,
  Lock,
  Eye,
  ArrowRight,
} from "lucide-react";

import {
  PILLARS,
  MEMORY_PROMPTS,
} from "@/lib/constants";
import {
  getGreetingByHour,
  calculateOverallProgress,
  getFirstName,
  getDailyItem,
} from "@/lib/utils";

interface DashboardProps {
  userName: string;
}

// ════════════════════════════════════════════════════════════════════════════
// CENTRAL LEGACY HUB - The heart of the dashboard
// ════════════════════════════════════════════════════════════════════════════
function LegacyHub({ progress }: { progress: number }) {
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
    }, 25);
    return () => clearInterval(interval);
  }, [isInView, progress]);

  const size = 220;
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {/* Outer glow rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute w-[280px] h-[280px] rounded-full border border-sage/20"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute w-[320px] h-[320px] rounded-full border border-sage/10"
        />
        <div className="absolute w-[360px] h-[360px] rounded-full bg-sage/5 blur-3xl" />
      </div>

      {/* Main hub container */}
      <div
        className="relative rounded-full bg-gradient-to-br from-white via-white to-sage-light/30 shadow-2xl shadow-sage/20 border border-sage/20 flex items-center justify-center"
        style={{ width: size + 40, height: size + 40 }}
      >
        {/* Progress ring */}
        <svg
          className="absolute transform -rotate-90"
          width={size}
          height={size}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="hubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--sage))" />
              <stop offset="100%" stopColor="hsl(var(--sage-dark))" />
            </linearGradient>
          </defs>

          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--sage) / 0.1)"
            strokeWidth={strokeWidth}
          />

          {/* Progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#hubGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: circumference - (circumference * progress) / 100 } : {}}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          />
        </svg>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center mb-3 shadow-lg shadow-sage/30"
          >
            <Leaf className="w-7 h-7 text-white" />
          </motion.div>

          <p className="text-[10px] uppercase tracking-[0.2em] text-sage/70 mb-1">Legacy Strength</p>

          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-serif font-semibold text-charcoal">{displayProgress}</span>
            <span className="text-xl text-sage">%</span>
          </div>
        </div>
      </div>

      {/* Nurture button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute -bottom-6 left-1/2 -translate-x-1/2"
      >
        <Link href="/dashboard/progress">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-sage hover:bg-sage-dark text-white rounded-full text-sm font-medium shadow-lg shadow-sage/30 transition-colors"
          >
            <Leaf className="w-4 h-4" />
            Nurture your Legacy
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// QUICK ACTION CARD
// ════════════════════════════════════════════════════════════════════════════
function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  color = "sage",
  delay = 0
}: {
  icon: typeof Mic;
  title: string;
  description: string;
  href: string;
  color?: "sage" | "amber" | "rose";
  delay?: number;
}) {
  const colorClasses = {
    sage: "from-sage/20 to-sage-light/30 text-sage-dark",
    amber: "from-amber-100 to-amber-50 text-amber-700",
    rose: "from-rose-100 to-rose-50 text-rose-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Link href={href}>
        <motion.div
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-sage/15 shadow-md hover:shadow-lg hover:border-sage/25 transition-all cursor-pointer group"
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4`}>
            <Icon className="w-6 h-6" />
          </div>
          <h4 className="font-medium text-charcoal mb-1 group-hover:text-sage-dark transition-colors">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ACTIVITY CARD
// ════════════════════════════════════════════════════════════════════════════
function ActivityCard({ delay = 0 }: { delay?: number }) {
  const activities = [
    { icon: Mic, text: "Voice message recorded", time: "2 days ago", color: "text-rose-500 bg-rose-50" },
    { icon: Heart, text: "3 memories added", time: "5 days ago", color: "text-pink-500 bg-pink-50" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-sage/15 shadow-md"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-sage animate-pulse" />
        <span className="text-xs uppercase tracking-wider text-sage font-medium">Recent Activity</span>
      </div>

      <div className="space-y-3">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-sage/5 rounded-xl">
            <div className={`w-9 h-9 rounded-lg ${activity.color} flex items-center justify-center`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal truncate">{activity.text}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MEMORY PROMPT CARD
// ════════════════════════════════════════════════════════════════════════════
function MemoryPromptCard({ prompt, delay = 0 }: { prompt: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="p-5 bg-gradient-to-br from-amber-50/80 to-orange-50/60 backdrop-blur-sm rounded-2xl border border-amber-200/50 shadow-md"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-xs uppercase tracking-wider text-amber-600 font-medium">Memory Prompt</span>
      </div>

      <p className="font-serif text-lg text-amber-900 leading-relaxed mb-4">
        &ldquo;{prompt}&rdquo;
      </p>

      <Link href="/dashboard/stories">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 rounded-lg text-sm font-medium transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Write about it
        </motion.button>
      </Link>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// JOURNEY STATS CARD
// ════════════════════════════════════════════════════════════════════════════
function JourneyStatsCard({ delay = 0 }: { delay?: number }) {
  const weekActivity = [true, true, true, true, true, false, false]; // Last 7 days

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="p-5 bg-gradient-to-br from-sage-light/40 to-sage/10 backdrop-blur-sm rounded-2xl border border-sage/20 shadow-md"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-sage" />
        <span className="text-xs uppercase tracking-wider text-sage font-medium">Your Journey</span>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-4xl font-serif font-semibold text-sage-dark">12</span>
        <span className="text-sm text-sage">days active</span>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        You&apos;re building something meaningful. Keep going!
      </p>

      {/* Week activity dots */}
      <div className="flex items-center gap-2">
        {weekActivity.map((active, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full ${active ? 'bg-sage' : 'bg-sage/20'}`}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">This week&apos;s activity</p>
    </motion.div>
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
  const greeting = getGreetingByHour();
  const GreetingIcon = greeting.icon;
  const dailyPrompt = getDailyItem(MEMORY_PROMPTS);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-sage/20 border-t-sage rounded-full animate-spin" />
          <span className="text-sage/60 text-sm">Loading your legacy...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-background to-sage-light/10 relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-sage/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sage-light/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sage/3 rounded-full blur-[150px]" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION - Greeting & Quick Actions
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 pt-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: Greeting */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-sage/20 rounded-full mb-4">
                <GreetingIcon className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-charcoal/80">{greeting.text}</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight">
                <span className="text-charcoal">Hello, </span>
                <span className="text-sage">{firstName}</span>
              </h1>
              <p className="text-muted-foreground mt-2">What would you like to preserve today?</p>
            </motion.div>

            {/* Right: Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/dashboard/voice">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-3 bg-sage hover:bg-sage-dark text-white rounded-full font-medium shadow-lg shadow-sage/25 transition-colors"
                >
                  <Mic className="w-4 h-4" />
                  Record a Message
                </motion.button>
              </Link>
              <Link href="/dashboard/memories">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-3 bg-white/80 hover:bg-white border border-sage/25 text-sage-dark rounded-full font-medium transition-all"
                >
                  <Heart className="w-4 h-4" />
                  Add Memory
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN SECTION - Central Hub with Pillars on Sides (Desktop)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="hidden lg:block px-6 py-16 relative">
        {/* Connection Lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <linearGradient id="lineGradientLeft" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--sage))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--sage))" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="lineGradientRight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--sage))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--sage))" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {/* Left side connection lines */}
          {[0, 1, 2, 3].map((i) => (
            <motion.line
              key={`left-${i}`}
              x1="50%"
              y1="50%"
              x2="22%"
              y2={`${18 + i * 22}%`}
              stroke="url(#lineGradientLeft)"
              strokeWidth="1.5"
              strokeDasharray="8 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: "easeOut" }}
            />
          ))}
          {/* Right side connection lines */}
          {[0, 1, 2, 3].map((i) => (
            <motion.line
              key={`right-${i}`}
              x1="50%"
              y1="50%"
              x2="78%"
              y2={`${18 + i * 22}%`}
              stroke="url(#lineGradientRight)"
              strokeWidth="1.5"
              strokeDasharray="8 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: "easeOut" }}
            />
          ))}
        </svg>

        <div className="max-w-7xl mx-auto relative" style={{ zIndex: 1 }}>
          <div className="flex items-stretch justify-center gap-12">
            {/* Left Pillars Column */}
            <div className="flex flex-col gap-4 w-[300px]">
              {PILLARS.slice(0, 4).map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.id}
                    initial={{ opacity: 0, x: -40, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      delay: 0.3 + index * 0.12,
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  >
                    <Link href={pillar.href}>
                      <motion.div
                        whileHover={{
                          scale: 1.02,
                          x: 8,
                          boxShadow: "0 20px 40px -15px rgba(var(--sage-rgb), 0.25), 0 0 0 1px rgba(var(--sage-rgb), 0.1)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="relative p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-sage/10 shadow-lg shadow-sage/5 cursor-pointer group overflow-hidden"
                      >
                        {/* Subtle gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-sage/0 via-sage/0 to-sage/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative flex items-center gap-4">
                          {/* Icon with glow effect */}
                          <motion.div
                            className="relative flex-shrink-0"
                            whileHover={{ rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="absolute inset-0 bg-sage/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-sage/10 via-sage/15 to-sage-light/25 flex items-center justify-center border border-sage/10 group-hover:border-sage/25 transition-all">
                              <Icon className="w-5 h-5 text-sage-dark group-hover:text-sage transition-colors" />
                            </div>
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif text-[15px] font-medium text-charcoal group-hover:text-sage-dark transition-colors">
                              {pillar.name}
                            </h3>
                            <p className="text-[11px] text-muted-foreground/80 line-clamp-1 mt-0.5">
                              {pillar.description}
                            </p>
                          </div>

                          {/* Stats on right */}
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-lg font-serif font-semibold text-sage">{pillar.items}</span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-10 h-1 bg-sage/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pillar.progress}%` }}
                                  transition={{ delay: 0.6 + index * 0.1, duration: 1, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-sage to-sage-dark rounded-full"
                                />
                              </div>
                              <span className="text-[10px] text-sage font-medium">{pillar.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Central Legacy Hub */}
            <div className="flex-shrink-0 flex items-center justify-center px-8">
              <LegacyHub progress={overallProgress} />
            </div>

            {/* Right Pillars Column */}
            <div className="flex flex-col gap-4 w-[300px]">
              {PILLARS.slice(4, 8).map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.id}
                    initial={{ opacity: 0, x: 40, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      delay: 0.3 + index * 0.12,
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  >
                    <Link href={pillar.href}>
                      <motion.div
                        whileHover={{
                          scale: 1.02,
                          x: -8,
                          boxShadow: "0 20px 40px -15px rgba(var(--sage-rgb), 0.25), 0 0 0 1px rgba(var(--sage-rgb), 0.1)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="relative p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-sage/10 shadow-lg shadow-sage/5 cursor-pointer group overflow-hidden"
                      >
                        {/* Subtle gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-l from-sage/0 via-sage/0 to-sage/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative flex items-center gap-4">
                          {/* Icon with glow effect */}
                          <motion.div
                            className="relative flex-shrink-0"
                            whileHover={{ rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="absolute inset-0 bg-sage/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-sage/10 via-sage/15 to-sage-light/25 flex items-center justify-center border border-sage/10 group-hover:border-sage/25 transition-all">
                              <Icon className="w-5 h-5 text-sage-dark group-hover:text-sage transition-colors" />
                            </div>
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif text-[15px] font-medium text-charcoal group-hover:text-sage-dark transition-colors">
                              {pillar.name}
                            </h3>
                            <p className="text-[11px] text-muted-foreground/80 line-clamp-1 mt-0.5">
                              {pillar.description}
                            </p>
                          </div>

                          {/* Stats on right */}
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-lg font-serif font-semibold text-sage">{pillar.items}</span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-10 h-1 bg-sage/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pillar.progress}%` }}
                                  transition={{ delay: 0.6 + index * 0.1, duration: 1, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-sage to-sage-dark rounded-full"
                                />
                              </div>
                              <span className="text-[10px] text-sage font-medium">{pillar.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE/TABLET - Card Grid Layout
      ══════════════════════════════════════════════════════════════════ */}
      <section className="lg:hidden px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Central Hub */}
          <div className="flex justify-center mb-12">
            <LegacyHub progress={overallProgress} />
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-2 gap-4">
            {PILLARS.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <Link href={pillar.href}>
                    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-sage/15 shadow-md hover:shadow-lg hover:border-sage/25 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage/15 to-sage-light/30 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-sage-dark" />
                      </div>
                      <h3 className="font-medium text-charcoal text-sm">{pillar.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{pillar.items} items</span>
                        <span className="text-xs text-sage font-medium">{pillar.progress}%</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          INSPIRATIONAL QUOTE SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="relative p-8 bg-gradient-to-br from-sage/5 via-white to-sage-light/10 rounded-3xl border border-sage/10 shadow-sm">
            <Quote className="absolute top-4 left-4 w-8 h-8 text-sage/20" />
            <Quote className="absolute bottom-4 right-4 w-8 h-8 text-sage/20 rotate-180" />
            <p className="font-serif text-xl md:text-2xl text-charcoal/90 leading-relaxed italic">
              &ldquo;The greatest legacy we can leave our children is happy memories.&rdquo;
            </p>
            <p className="mt-4 text-sm text-sage font-medium">— Og Mandino</p>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          QUICK STATS BAR - Connected Theme Design
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          {/* Section Header */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sage/20 to-sage/30" />
            <div className="flex items-center gap-2 px-4">
              <TrendingUp className="w-4 h-4 text-sage" />
              <span className="text-sm font-medium text-sage uppercase tracking-wider">Your Legacy Progress</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-sage/20 to-sage/30" />
          </div>

          {/* Stats Container with connected design */}
          <div className="relative p-6 bg-gradient-to-br from-white via-sage/5 to-cream rounded-3xl border border-sage/15 shadow-lg shadow-sage/5">
            {/* Decorative corner accents */}
            <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-sage/20 rounded-tl-xl" />
            <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-sage/20 rounded-tr-xl" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-sage/20 rounded-bl-xl" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-sage/20 rounded-br-xl" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { icon: Heart, label: "Memories", value: "156", subtext: "Preserved", gradient: "from-sage/15 to-sage/25" },
                { icon: Users, label: "Family Circle", value: "4", subtext: "Members", gradient: "from-sage/10 to-sage-light/20" },
                { icon: Gift, label: "Scheduled", value: "12", subtext: "Messages", gradient: "from-sage/15 to-sage/25" },
                { icon: Clock, label: "Days Active", value: "45", subtext: "Building", gradient: "from-sage/10 to-sage-light/20" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="relative group"
                >
                  {/* Connecting line between stats (hidden on mobile, shown between items) */}
                  {i < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-sage/30 to-sage/10" />
                  )}

                  <div className="text-center">
                    {/* Icon with sage gradient */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.3 }}
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-4 border border-sage/10 group-hover:border-sage/30 group-hover:shadow-lg group-hover:shadow-sage/15 transition-all duration-300`}
                    >
                      <stat.icon className="w-6 h-6 text-sage-dark group-hover:text-sage transition-colors" />
                    </motion.div>

                    {/* Value with animation */}
                    <motion.p
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                      className="text-3xl font-serif font-semibold text-charcoal group-hover:text-sage-dark transition-colors"
                    >
                      {stat.value}
                    </motion.p>

                    {/* Label */}
                    <p className="text-sm font-medium text-charcoal/80 mt-1">{stat.label}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.subtext}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom decorative element */}
            <div className="flex items-center justify-center mt-6 pt-4 border-t border-sage/10">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Leaf className="w-3 h-3 text-sage" />
                <span>Growing stronger every day</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ACTIVITY, PROMPTS, STATS SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActivityCard delay={0.1} />
            <MemoryPromptCard prompt={dailyPrompt} delay={0.2} />
            <JourneyStatsCard delay={0.3} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          UPCOMING EVENTS SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-charcoal">Upcoming Moments</h3>
                <p className="text-xs text-muted-foreground">Messages scheduled for loved ones</p>
              </div>
            </div>
            <Link href="/dashboard/messages">
              <motion.button
                whileHover={{ x: 3 }}
                className="flex items-center gap-1 text-sm text-sage hover:text-sage-dark transition-colors"
              >
                View all <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { name: "Mom's Birthday", date: "March 15, 2024", type: "Birthday Message", daysLeft: 24 },
              { name: "Wedding Anniversary", date: "April 2, 2024", type: "Anniversary Letter", daysLeft: 42 },
              { name: "Father's Day", date: "June 16, 2024", type: "Appreciation Note", daysLeft: 117 },
            ].map((event, i) => (
              <motion.div
                key={event.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-sage/10 hover:border-sage/20 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage/10 to-sage-light/20 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-sage" />
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal group-hover:text-sage-dark transition-colors">{event.name}</h4>
                    <p className="text-xs text-muted-foreground">{event.type} • {event.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-sage/10 text-sage text-xs font-medium rounded-full">
                    <Clock className="w-3 h-3" />
                    {event.daysLeft} days
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FAMILY ACTIVITY SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="p-6 bg-gradient-to-br from-sage/5 via-white to-cream rounded-2xl border border-sage/15">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage/20 to-sage-light/30 flex items-center justify-center">
                <Eye className="w-5 h-5 text-sage" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-charcoal">Family Activity</h3>
                <p className="text-xs text-muted-foreground">Recent views from your trusted circle</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { name: "Sarah", action: "viewed", item: "Wedding Day Memories", time: "2 hours ago", avatar: "S" },
                { name: "Michael", action: "downloaded", item: "Family Photo Album", time: "Yesterday", avatar: "M" },
                { name: "Emma", action: "listened to", item: "Birthday Voice Message", time: "3 days ago", avatar: "E" },
              ].map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white/60 rounded-xl"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center text-white text-sm font-medium">
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-charcoal">
                      <span className="font-medium">{activity.name}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium text-sage-dark">{activity.item}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          EMOTIONAL FOOTER
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="px-6 py-16 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-sage/30" />
            <Leaf className="w-5 h-5 text-sage/50" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-sage/30" />
          </div>

          <h3 className="font-serif text-2xl text-charcoal mb-3">
            Your story matters.
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Every memory you preserve, every message you record, every moment you capture —
            they all become part of a beautiful legacy that will touch hearts for generations to come.
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-sage" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4 text-sage" />
              <span>End-to-end Encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-sage" />
              <span>Made with Love</span>
            </div>
          </div>

          {/* Brand */}
          <div className="flex items-center justify-center gap-2 text-sage/70">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-serif text-lg">AfterMe</span>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-3">
            Preserving legacies, one memory at a time.
          </p>
        </motion.div>
      </footer>

      {/* Mobile Bottom Dock */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden"
      >
        <div className="flex gap-1 p-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-sage/20 shadow-lg">
          {PILLARS.slice(0, 4).map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Link key={pillar.id} href={pillar.href}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-sage/10 transition-colors"
                >
                  <Icon className="w-5 h-5 text-sage/70" />
                </motion.div>
              </Link>
            );
          })}
          <Link href="#pillars">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-sage/10 transition-colors">
              <Plus className="w-5 h-5 text-sage/70" />
            </div>
          </Link>
        </div>
      </motion.nav>
    </div>
  );
}

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
// FLOATING PILLAR CARD - Scattered around the hub
// ════════════════════════════════════════════════════════════════════════════
interface FloatingPillarProps {
  pillar: typeof PILLARS[0];
  position: { x: string; y: string };
  delay: number;
  size?: "sm" | "md" | "lg";
}

function FloatingPillar({ pillar, position, delay, size = "md" }: FloatingPillarProps) {
  const Icon = pillar.icon;

  const sizeClasses = {
    sm: "w-44 p-4",
    md: "w-56 p-5",
    lg: "w-64 p-6",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="absolute"
      style={{ left: position.x, top: position.y }}
    >
      <Link href={pillar.href}>
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className={`${sizeClasses[size]} bg-white/90 backdrop-blur-sm rounded-2xl border border-sage/15 shadow-lg shadow-sage/10 hover:shadow-xl hover:shadow-sage/15 hover:border-sage/30 transition-all duration-300 cursor-pointer group`}
        >
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage/15 to-sage-light/30 flex items-center justify-center mb-3 group-hover:from-sage/25 group-hover:to-sage-light/40 transition-all">
            <Icon className="w-5 h-5 text-sage-dark" />
          </div>

          {/* Content */}
          <h3 className="font-serif text-base font-medium text-charcoal mb-1 group-hover:text-sage-dark transition-colors">
            {pillar.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {pillar.description}
          </p>

          {/* Progress indicator */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-sage/10">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-serif font-medium text-sage">{pillar.items}</span>
              <span className="text-[10px] text-muted-foreground uppercase">items</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-12 h-1 bg-sage/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pillar.progress}%` }}
                  transition={{ delay: delay + 0.3, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-sage to-sage-dark rounded-full"
                />
              </div>
              <span className="text-[10px] text-sage font-medium">{pillar.progress}%</span>
            </div>
          </div>
        </motion.div>
      </Link>
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

  // Pillar positions for the constellation layout
  const pillarPositions = [
    { x: "5%", y: "15%" },      // Voice Messages - top left
    { x: "75%", y: "5%" },      // Memories - top right
    { x: "85%", y: "35%" },     // Stories - right
    { x: "80%", y: "65%" },     // Vault - bottom right
    { x: "5%", y: "50%" },      // Family - left
    { x: "10%", y: "80%" },     // Messages - bottom left
    { x: "45%", y: "85%" },     // Legacy - bottom center
    { x: "70%", y: "90%" },     // Eldercare - bottom right
  ];

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
          MAIN SECTION - Central Hub with Floating Pillars (Desktop)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="hidden lg:block relative px-6 py-12 min-h-[800px]">
        <div className="max-w-7xl mx-auto relative">
          {/* Connection lines (decorative) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: 800 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--sage))" stopOpacity="0.1" />
                <stop offset="50%" stopColor="hsl(var(--sage))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--sage))" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Lines connecting hub to pillars */}
            <motion.line
              x1="50%" y1="50%" x2="15%" y2="25%"
              stroke="url(#lineGradient)" strokeWidth="1"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            <motion.line
              x1="50%" y1="50%" x2="85%" y2="20%"
              stroke="url(#lineGradient)" strokeWidth="1"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            />
            <motion.line
              x1="50%" y1="50%" x2="90%" y2="50%"
              stroke="url(#lineGradient)" strokeWidth="1"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
            />
            <motion.line
              x1="50%" y1="50%" x2="15%" y2="60%"
              stroke="url(#lineGradient)" strokeWidth="1"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            />
          </svg>

          {/* Central Legacy Hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <LegacyHub progress={overallProgress} />
          </div>

          {/* Floating Pillar Cards */}
          {PILLARS.map((pillar, index) => (
            <FloatingPillar
              key={pillar.id}
              pillar={pillar}
              position={pillarPositions[index]}
              delay={0.3 + index * 0.1}
              size={index === 0 || index === 3 ? "lg" : index === 7 ? "sm" : "md"}
            />
          ))}
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
          BOTTOM SECTION - Activity, Prompts, Stats
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-12 mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActivityCard delay={0.1} />
            <MemoryPromptCard prompt={dailyPrompt} delay={0.2} />
            <JourneyStatsCard delay={0.3} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="px-6 py-8 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center justify-center gap-3 text-muted-foreground text-sm mb-4">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-sage/50" />
              Secure
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-sage/50" />
              Private
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-sage/50" />
              Encrypted
            </span>
          </div>
          <p className="text-xs text-muted-foreground/60">
            Your legacy, preserved forever.
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

"use client";

import { useRef, useState, useEffect, useSyncExternalStore, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  Mic,
  Heart,
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

import { PILLARS, INSPIRATIONAL_QUOTES, type Pillar } from "@/lib/constants";
import {
  getGreetingByHour,
  getFirstName,
} from "@/lib/utils";

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

interface DashboardProps {
  userName: string;
}

interface DashboardStats {
  memories: number;
  familyMembers: number;
  scheduledMessages: number;
  daysActive: number;
}

interface PillarStats {
  [key: string]: {
    items: number;
    progress: number;
  };
}

interface UpcomingEvent {
  id: string;
  name: string;
  date: string;
  type: string;
  title: string;
  daysLeft: number;
}

interface FamilyActivity {
  id: string;
  name: string;
  avatar: string;
  action: string;
  item: string;
  time: string;
}

interface DashboardData {
  stats: DashboardStats;
  pillarStats: PillarStats;
  overallProgress: number;
  upcomingEvents: UpcomingEvent[];
  familyActivity: FamilyActivity[];
}

// ════════════════════════════════════════════════════════════════════════════
// CENTRAL LEGACY HUB - The heart of the dashboard
// ════════════════════════════════════════════════════════════════════════════
function LegacyHub({ progress, isLoading }: { progress: number; isLoading?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (!isInView || isLoading) return;
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
  }, [isInView, progress, isLoading]);

  const size = 180;
  const strokeWidth = 6;
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
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute w-[230px] h-[230px] rounded-full border border-sage/20"
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute w-[260px] h-[260px] rounded-full border border-sage/10"
        />
        <div className="absolute w-[290px] h-[290px] rounded-full bg-sage/5 blur-3xl" />
      </div>

      {/* Main hub container */}
      <div
        className="relative rounded-full bg-gradient-to-br from-white via-white to-sage-light/30 shadow-xl shadow-sage/15 border border-sage/20 flex items-center justify-center"
        style={{ width: size + 30, height: size + 30 }}
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
            animate={isInView && !isLoading ? { strokeDashoffset: circumference - (circumference * progress) / 100 } : {}}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          />
        </svg>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center mb-2 shadow-md shadow-sage/30"
          >
            <Leaf className="w-5 h-5 text-white" />
          </motion.div>

          <p className="text-[9px] uppercase tracking-[0.15em] text-sage/60 mb-0.5">Legacy</p>

          <div className="flex items-baseline gap-0.5">
            {isLoading ? (
              <div className="w-12 h-10 bg-sage/10 rounded animate-pulse" />
            ) : (
              <>
                <span className="text-4xl font-serif font-semibold text-charcoal">{displayProgress}</span>
                <span className="text-lg text-sage">%</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Nurture button - Creative artistic design */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
        className="absolute -bottom-5 left-1/2 -translate-x-1/2"
      >
        <Link href="/dashboard/progress">
          <motion.button
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-sage via-sage to-sage-dark text-white rounded-full text-sm font-medium shadow-lg shadow-sage/30 transition-all overflow-hidden"
          >
            {/* Animated shine sweep */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            />

            {/* Leaf icon with gentle sway */}
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Leaf className="w-4 h-4" />
            </motion.div>

            <span>Nurture</span>

            {/* Sparkle dots */}
            <div className="flex gap-0.5 ml-0.5">
              <motion.span
                className="w-1 h-1 rounded-full bg-white/70"
                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.span
                className="w-1 h-1 rounded-full bg-white/70"
                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
            </div>
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LOADING SKELETON COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-sage/10 mx-auto mb-4 animate-pulse" />
          <div className="w-12 h-8 bg-sage/10 rounded mx-auto mb-2 animate-pulse" />
          <div className="w-20 h-4 bg-sage/10 rounded mx-auto animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function EventsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white/80 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-sage/10 animate-pulse" />
          <div className="flex-1">
            <div className="w-32 h-4 bg-sage/10 rounded mb-2 animate-pulse" />
            <div className="w-48 h-3 bg-sage/10 rounded animate-pulse" />
          </div>
          <div className="w-20 h-6 bg-sage/10 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, actionHref, actionLabel }: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-2xl bg-sage/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-sage/50" />
      </div>
      <h4 className="font-medium text-charcoal mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sage hover:bg-sage-dark text-white rounded-full text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {actionLabel}
          </motion.button>
        </Link>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DECORATIVE COMPONENTS - Floating leaves, wavy lines, particles
// ════════════════════════════════════════════════════════════════════════════

// Floating Leaf SVG Component
function FloatingLeaf({
  className = "",
  size = 24,
  delay = 0,
  duration = 8,
  variant = 1
}: {
  className?: string;
  size?: number;
  delay?: number;
  duration?: number;
  variant?: number;
}) {
  const paths = [
    "M12 2C12 2 6 7 6 12C6 15.5 8.5 18 12 18C15.5 18 18 15.5 18 12C18 7 12 2 12 2Z", // Classic leaf
    "M12 3C9 6 6 10 7 15C8 18 10 20 12 20C14 20 16 18 17 15C18 10 15 6 12 3Z", // Elongated leaf
    "M12 2C8 5 5 9 6 14C7 17 9 19 12 19C15 19 17 17 18 14C19 9 16 5 12 2Z", // Wide leaf
  ];

  return (
    <motion.svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      initial={{ opacity: 0, y: -20, rotate: -45 }}
      animate={{
        opacity: [0, 0.6, 0.6, 0],
        y: [0, 100, 200, 300],
        x: [0, 20, -10, 30],
        rotate: [-45, 0, 45, 90]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <path
        d={paths[(variant - 1) % 3]}
        fill="hsl(var(--sage))"
        fillOpacity="0.3"
        stroke="hsl(var(--sage))"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <path
        d="M12 6V16M12 10L9 13M12 12L15 15"
        stroke="hsl(var(--sage))"
        strokeWidth="0.75"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

// Animated Floating Dots
function FloatingDots() {
  const dots = [
    { size: 4, left: "5%", top: "15%", delay: 0, duration: 6 },
    { size: 6, left: "12%", top: "35%", delay: 1.5, duration: 8 },
    { size: 3, left: "8%", top: "55%", delay: 0.8, duration: 5 },
    { size: 5, left: "15%", top: "75%", delay: 2, duration: 7 },
    { size: 4, right: "8%", top: "20%", delay: 0.5, duration: 6 },
    { size: 6, right: "15%", top: "40%", delay: 1, duration: 9 },
    { size: 3, right: "10%", top: "60%", delay: 2.5, duration: 5 },
    { size: 5, right: "5%", top: "80%", delay: 1.8, duration: 7 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-sage/30"
          style={{
            width: dot.size,
            height: dot.size,
            left: dot.left,
            right: dot.right,
            top: dot.top,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Botanical Section Divider - Elegant leaf and vine design
function BotanicalDivider({ variant = 1, className = "" }: { variant?: 1 | 2 | 3; className?: string }) {
  return (
    <div className={`relative w-full py-8 ${className}`}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="relative flex items-center justify-center">
          {/* Left flowing line */}
          <motion.div
            className="flex-1 h-px relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-sage/30 to-sage/50"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Small dots along the line */}
            <motion.div
              className="absolute right-[20%] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sage/40"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            />
            <motion.div
              className="absolute right-[40%] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-sage/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            />
          </motion.div>

          {/* Center decorative element */}
          <motion.div
            className="relative mx-4 flex items-center justify-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          >
            {variant === 1 && (
              // Leaf cluster design
              <div className="relative w-16 h-16 flex items-center justify-center">
                {/* Center leaf */}
                <motion.svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  className="absolute"
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path
                    d="M12 2C12 2 6 8 6 14C6 18 8.5 21 12 21C15.5 21 18 18 18 14C18 8 12 2 12 2Z"
                    fill="hsl(var(--sage))"
                    fillOpacity="0.2"
                    stroke="hsl(var(--sage))"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                  />
                  <path
                    d="M12 6V18M12 10L9 13M12 14L15 17"
                    stroke="hsl(var(--sage))"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                  />
                </motion.svg>
                {/* Side leaves */}
                <motion.svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  className="absolute -left-2 top-1"
                  style={{ rotate: "-45deg" }}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <path
                    d="M12 4C12 4 7 9 7 13C7 16 9 18 12 18C15 18 17 16 17 13C17 9 12 4 12 4Z"
                    fill="hsl(var(--sage))"
                    fillOpacity="0.15"
                    stroke="hsl(var(--sage))"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                  />
                </motion.svg>
                <motion.svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  className="absolute -right-2 top-1"
                  style={{ rotate: "45deg" }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <path
                    d="M12 4C12 4 7 9 7 13C7 16 9 18 12 18C15 18 17 16 17 13C17 9 12 4 12 4Z"
                    fill="hsl(var(--sage))"
                    fillOpacity="0.15"
                    stroke="hsl(var(--sage))"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                  />
                </motion.svg>
              </div>
            )}

            {variant === 2 && (
              // Circular wreath design
              <div className="relative w-14 h-14">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-sage/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-1 rounded-full border border-dashed border-sage/30"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-sage/60" />
                </div>
                {/* Small decorative dots around */}
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-sage/40"
                    style={{
                      left: `${50 + 45 * Math.cos((angle * Math.PI) / 180)}%`,
                      top: `${50 + 45 * Math.sin((angle * Math.PI) / 180)}%`,
                      transform: "translate(-50%, -50%)"
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ delay: i * 0.1, duration: 2, repeat: Infinity }}
                  />
                ))}
              </div>
            )}

            {variant === 3 && (
              // Simple elegant diamond with leaves
              <div className="relative">
                <motion.div
                  className="w-8 h-8 rotate-45 border-2 border-sage/30 bg-sage/5"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="w-2 h-2 rounded-full bg-sage/50" />
                </motion.div>
                {/* Tiny leaves on corners */}
                <motion.svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <path
                    d="M12 4C12 4 8 8 8 11C8 13 10 15 12 15C14 15 16 13 16 11C16 8 12 4 12 4Z"
                    fill="hsl(var(--sage))"
                    fillOpacity="0.3"
                  />
                </motion.svg>
              </div>
            )}
          </motion.div>

          {/* Right flowing line */}
          <motion.div
            className="flex-1 h-px relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-l from-transparent via-sage/30 to-sage/50"
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Small dots along the line */}
            <motion.div
              className="absolute left-[20%] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sage/40"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            />
            <motion.div
              className="absolute left-[40%] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-sage/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Organic Branch/Vine Decoration - Artistic Sage Green
function VineDecoration({ side = "left", className = "" }: { side?: "left" | "right"; className?: string }) {
  const isLeft = side === "left";

  // Leaf positions with artistic placement
  const leaves = [
    { y: 60, x: 55, size: 1.2, rotate: 25, delay: 0.5 },
    { y: 120, x: 35, size: 1, rotate: -35, delay: 0.7 },
    { y: 180, x: 65, size: 1.3, rotate: 20, delay: 0.9 },
    { y: 240, x: 30, size: 0.9, rotate: -25, delay: 1.1 },
    { y: 300, x: 55, size: 1.1, rotate: 30, delay: 1.3 },
    { y: 360, x: 40, size: 1, rotate: -40, delay: 1.5 },
    { y: 420, x: 60, size: 1.2, rotate: 15, delay: 1.7 },
    { y: 480, x: 35, size: 0.85, rotate: -30, delay: 1.9 },
    { y: 540, x: 50, size: 1.15, rotate: 35, delay: 2.1 },
    { y: 600, x: 45, size: 1, rotate: -20, delay: 2.3 },
  ];

  // Small buds/berries positions
  const buds = [
    { y: 90, x: 45, size: 4 },
    { y: 150, x: 50, size: 3 },
    { y: 210, x: 42, size: 5 },
    { y: 270, x: 55, size: 3 },
    { y: 330, x: 38, size: 4 },
    { y: 390, x: 52, size: 3 },
    { y: 450, x: 45, size: 5 },
    { y: 510, x: 48, size: 4 },
    { y: 570, x: 40, size: 3 },
  ];

  return (
    <motion.svg
      className={`absolute ${isLeft ? "left-0" : "right-0"} pointer-events-none ${className}`}
      width="100"
      height="700"
      viewBox="0 0 100 700"
      style={{ transform: isLeft ? "none" : "scaleX(-1)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <defs>
        {/* Gradient for main vine */}
        <linearGradient id={`vineGradient-${side}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--sage))" stopOpacity="0.1" />
          <stop offset="30%" stopColor="hsl(var(--sage))" stopOpacity="0.5" />
          <stop offset="70%" stopColor="hsl(var(--sage))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(var(--sage))" stopOpacity="0.15" />
        </linearGradient>

        {/* Gradient for leaves */}
        <linearGradient id={`leafGradient-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--sage))" stopOpacity="0.5" />
          <stop offset="50%" stopColor="hsl(var(--sage))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--sage-dark))" stopOpacity="0.25" />
        </linearGradient>

        {/* Filter for soft glow */}
        <filter id={`vineGlow-${side}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background glow vine */}
      <motion.path
        d="M10,0
           Q70,40 50,80
           Q30,120 55,160
           Q80,200 45,240
           Q20,280 60,320
           Q85,360 40,400
           Q15,440 55,480
           Q80,520 35,560
           Q10,600 50,640
           Q70,680 40,700"
        fill="none"
        stroke="hsl(var(--sage))"
        strokeWidth="8"
        strokeOpacity="0.08"
        strokeLinecap="round"
        filter={`url(#vineGlow-${side})`}
      />

      {/* Main flowing vine */}
      <motion.path
        d="M10,0
           Q70,40 50,80
           Q30,120 55,160
           Q80,200 45,240
           Q20,280 60,320
           Q85,360 40,400
           Q15,440 55,480
           Q80,520 35,560
           Q10,600 50,640
           Q70,680 40,700"
        fill="none"
        stroke={`url(#vineGradient-${side})`}
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 4, ease: "easeOut" }}
      />

      {/* Secondary thin vine */}
      <motion.path
        d="M15,30
           Q50,60 40,100
           Q25,140 45,180
           Q60,220 35,260
           Q15,300 50,340
           Q70,380 30,420
           Q10,460 45,500
           Q65,540 25,580
           Q5,620 40,660"
        fill="none"
        stroke="hsl(var(--sage))"
        strokeWidth="1.5"
        strokeOpacity="0.25"
        strokeLinecap="round"
        strokeDasharray="4 6"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 5, ease: "easeOut", delay: 0.5 }}
      />

      {/* Artistic leaves */}
      {leaves.map((leaf, i) => (
        <motion.g
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: leaf.delay, duration: 0.6, type: "spring" }}
        >
          {/* Leaf shape */}
          <motion.path
            d={`M${leaf.x},${leaf.y}
                Q${leaf.x + 15},${leaf.y - 8} ${leaf.x + 12},${leaf.y - 20}
                Q${leaf.x + 8},${leaf.y - 28} ${leaf.x},${leaf.y - 25}
                Q${leaf.x - 8},${leaf.y - 28} ${leaf.x - 12},${leaf.y - 20}
                Q${leaf.x - 15},${leaf.y - 8} ${leaf.x},${leaf.y}Z`}
            fill={`url(#leafGradient-${side})`}
            stroke="hsl(var(--sage))"
            strokeWidth="0.5"
            strokeOpacity="0.4"
            style={{
              transform: `rotate(${leaf.rotate}deg) scale(${leaf.size})`,
              transformOrigin: `${leaf.x}px ${leaf.y}px`
            }}
          />
          {/* Leaf vein */}
          <motion.line
            x1={leaf.x}
            y1={leaf.y}
            x2={leaf.x}
            y2={leaf.y - 18}
            stroke="hsl(var(--sage))"
            strokeWidth="0.5"
            strokeOpacity="0.3"
            style={{
              transform: `rotate(${leaf.rotate}deg) scale(${leaf.size})`,
              transformOrigin: `${leaf.x}px ${leaf.y}px`
            }}
          />
        </motion.g>
      ))}

      {/* Small buds/berries */}
      {buds.map((bud, i) => (
        <motion.circle
          key={`bud-${i}`}
          cx={bud.x}
          cy={bud.y}
          r={bud.size}
          fill="hsl(var(--sage))"
          fillOpacity={0.2 + (i % 3) * 0.1}
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            scale: { duration: 3, repeat: Infinity, delay: i * 0.3 },
            default: { delay: 1 + i * 0.15, duration: 0.4 }
          }}
        />
      ))}

      {/* Tiny decorative dots along vine */}
      {[40, 130, 220, 310, 400, 490, 580, 670].map((y, i) => (
        <motion.circle
          key={`dot-${i}`}
          cx={i % 2 === 0 ? 52 : 38}
          cy={y}
          r={2}
          fill="hsl(var(--sage-dark))"
          fillOpacity="0.3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2 + i * 0.1, duration: 0.3 }}
        />
      ))}

      {/* Curly tendrils */}
      {[100, 250, 400, 550].map((y, i) => (
        <motion.path
          key={`tendril-${i}`}
          d={`M${i % 2 === 0 ? 58 : 32},${y} q${i % 2 === 0 ? 15 : -15},5 ${i % 2 === 0 ? 12 : -12},15 q${i % 2 === 0 ? -5 : 5},8 ${i % 2 === 0 ? 8 : -8},12`}
          fill="none"
          stroke="hsl(var(--sage))"
          strokeWidth="1"
          strokeOpacity="0.3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 2.5 + i * 0.3, duration: 0.8 }}
        />
      ))}
    </motion.svg>
  );
}

// Floating Leaves Container
function FloatingLeavesBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
      {/* Left side leaves */}
      <FloatingLeaf className="absolute left-[5%]" size={20} delay={0} duration={12} variant={1} />
      <FloatingLeaf className="absolute left-[15%]" size={28} delay={3} duration={15} variant={2} />
      <FloatingLeaf className="absolute left-[10%]" size={16} delay={6} duration={10} variant={3} />

      {/* Right side leaves */}
      <FloatingLeaf className="absolute right-[8%]" size={24} delay={2} duration={14} variant={2} />
      <FloatingLeaf className="absolute right-[18%]" size={18} delay={5} duration={11} variant={1} />
      <FloatingLeaf className="absolute right-[12%]" size={22} delay={8} duration={13} variant={3} />

      {/* Center scattered */}
      <FloatingLeaf className="absolute left-[40%]" size={14} delay={4} duration={16} variant={1} />
      <FloatingLeaf className="absolute right-[35%]" size={20} delay={7} duration={12} variant={2} />
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
  const greeting = getGreetingByHour();
  const GreetingIcon = greeting.icon;

  // State for fetched data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Random quote - memoized to prevent changes on re-render
  const randomQuote = useMemo(() => {
    const index = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
    return INSPIRATIONAL_QUOTES[index];
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        // Silently fail - dashboard will show default values
      } finally {
        setIsLoading(false);
      }
    }

    if (mounted) {
      fetchDashboardData();
    }
  }, [mounted]);

  // Merge real pillar stats with PILLARS constants
  const pillarsWithRealData: Pillar[] = useMemo(() => {
    if (!dashboardData?.pillarStats) return PILLARS;

    return PILLARS.map((pillar) => {
      const stats = dashboardData.pillarStats[pillar.id];
      if (stats) {
        return {
          ...pillar,
          items: stats.items,
          progress: stats.progress,
        };
      }
      return pillar;
    });
  }, [dashboardData]);

  // Calculate overall progress
  const overallProgress = dashboardData?.overallProgress ?? 0;

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

      {/* Floating leaves animation */}
      <FloatingLeavesBackground />

      {/* Floating dots particles */}
      <FloatingDots />

      {/* Vine decorations on sides */}
      <VineDecoration side="left" className="top-[100px] opacity-80 hidden lg:block" />
      <VineDecoration side="right" className="top-[300px] opacity-80 hidden lg:block" />

      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION - Greeting & Quick Actions
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 pt-8 pb-10 relative">
        <div className="max-w-7xl mx-auto">
          {/* Hero Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-sage-light/20 to-sage/10 border border-sage/15 shadow-xl shadow-sage/10"
          >
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Large gradient orb */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-sage/15 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-sage-light/20 rounded-full blur-2xl" />

              {/* Animated floating leaves in hero */}
              <motion.div
                className="absolute top-8 right-[15%]"
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Leaf className="w-6 h-6 text-sage/20" />
              </motion.div>
              <motion.div
                className="absolute bottom-12 right-[25%]"
                animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <Leaf className="w-5 h-5 text-sage/15" />
              </motion.div>
              <motion.div
                className="absolute top-1/2 right-[10%]"
                animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                <Leaf className="w-4 h-4 text-sage/25" />
              </motion.div>

              {/* Decorative circles */}
              <motion.div
                className="absolute top-6 left-[30%] w-2 h-2 rounded-full bg-sage/30"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-8 left-[20%] w-3 h-3 rounded-full bg-sage/20"
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              />

              {/* Subtle pattern lines */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.03]" style={{ zIndex: 0 }}>
                <defs>
                  <pattern id="heroPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1" fill="currentColor" className="text-sage" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#heroPattern)" />
              </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 px-6 py-6 md:px-10 md:py-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Left: Greeting */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {/* Time Badge with glow */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-sage/20 rounded-full mb-4 shadow-sm"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <GreetingIcon className="w-5 h-5 text-amber-500" />
                    </motion.div>
                    <span className="text-sm font-medium text-charcoal/80">{greeting.text}</span>
                    <div className="w-1 h-1 rounded-full bg-sage/40" />
                    <span className="text-xs text-sage/60">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                  </motion.div>

                  {/* Main Greeting */}
                  <div className="mb-2">
                    <motion.h1
                      className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      <span className="text-charcoal">Hello, </span>
                      <span className="relative">
                        <span className="text-sage">{firstName}</span>
                        {/* Underline decoration */}
                        <motion.svg
                          className="absolute -bottom-2 left-0 w-full"
                          viewBox="0 0 100 8"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                        >
                          <motion.path
                            d="M0 4 Q25 0, 50 4 T100 4"
                            fill="none"
                            stroke="hsl(var(--sage))"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeOpacity="0.4"
                          />
                        </motion.svg>
                      </span>
                    </motion.h1>
                  </div>

                  {/* Subtitle with animated typing effect feel */}
                  <motion.p
                    className="text-lg text-muted-foreground max-w-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    What would you like to{" "}
                    <span className="text-sage font-medium">preserve</span>{" "}
                    today?
                  </motion.p>

                  {/* Quick Stats Badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap items-center gap-2 mt-4"
                  >
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-sage/10 rounded-full">
                      <Heart className="w-3.5 h-3.5 text-sage" />
                      <span className="text-xs font-medium text-sage-dark">
                        {dashboardData?.stats.memories ?? 0} memories
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-sage/10 rounded-full">
                      <Users className="w-3.5 h-3.5 text-sage" />
                      <span className="text-xs font-medium text-sage-dark">
                        {dashboardData?.stats.familyMembers ?? 0} family members
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full">
                      <Gift className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-medium text-amber-700">
                        {dashboardData?.stats.scheduledMessages ?? 0} scheduled
                      </span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Right: Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col gap-4"
                >
                  {/* Primary Action - Record Voice */}
                  <Link href="/dashboard/voice">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative group cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-sage to-sage-dark rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                      <div className="relative flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-sage to-sage-dark text-white rounded-2xl shadow-lg">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Mic className="w-6 h-6" />
                          </motion.div>
                        </div>
                        <div>
                          <p className="font-semibold text-lg">Record a Message</p>
                          <p className="text-sm text-white/70">Let them hear your voice forever</p>
                        </div>
                        <ArrowRight className="w-5 h-5 ml-auto opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  </Link>

                  {/* Secondary Actions - Artistic Asymmetric Layout */}
                  <div className="relative flex items-start gap-3">
                    {/* Add Memory - Larger, offset up */}
                    <Link href="/dashboard/memories">
                      <motion.div
                        whileHover={{ scale: 1.03, y: -3, rotate: -1 }}
                        whileTap={{ scale: 0.97 }}
                        className="relative -mt-1 flex items-center gap-3 px-5 py-3 bg-white/95 backdrop-blur-sm border border-sage/20 rounded-2xl shadow-md hover:shadow-lg hover:border-rose-200 transition-all cursor-pointer group"
                        style={{ transform: "rotate(-1deg)" }}
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-100 via-rose-50 to-pink-100 flex items-center justify-center shadow-inner">
                          <Heart className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal group-hover:text-rose-600 transition-colors">Add Memory</p>
                          <p className="text-[11px] text-muted-foreground">Preserve moments</p>
                        </div>
                        {/* Decorative dot */}
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400/60" />
                      </motion.div>
                    </Link>

                    {/* Write Story - Smaller, offset down */}
                    <Link href="/dashboard/stories">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2, rotate: 1 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative mt-2 flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        style={{ transform: "rotate(2deg)" }}
                      >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-amber-700" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-amber-900 group-hover:text-amber-700 transition-colors">Write Story</p>
                          <p className="text-[10px] text-amber-600/70">Share journey</p>
                        </div>
                      </motion.div>
                    </Link>

                    {/* Connecting decorative element */}
                    <svg className="absolute -left-2 top-1/2 w-4 h-8 -translate-y-1/2 opacity-30" viewBox="0 0 16 32">
                      <path d="M8 0 Q0 16 8 32" fill="none" stroke="hsl(var(--sage))" strokeWidth="1" strokeDasharray="2 2" />
                    </svg>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bottom decorative border */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sage/30 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN SECTION - Central Hub with Pillars on Sides (Desktop)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="hidden lg:block px-6 py-16 relative" id="pillars">
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
              {pillarsWithRealData.slice(0, 4).map((pillar, index) => {
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
              <LegacyHub progress={overallProgress} isLoading={isLoading} />
            </div>

            {/* Right Pillars Column */}
            <div className="flex flex-col gap-4 w-[300px]">
              {pillarsWithRealData.slice(4, 8).map((pillar, index) => {
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
      <section className="lg:hidden px-6 py-8" id="pillars-mobile">
        <div className="max-w-2xl mx-auto">
          {/* Central Hub */}
          <div className="flex justify-center mb-12">
            <LegacyHub progress={overallProgress} isLoading={isLoading} />
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-2 gap-4">
            {pillarsWithRealData.map((pillar, index) => {
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

      {/* Botanical Divider */}
      <BotanicalDivider variant={1} className="-mt-4 -mb-8" />

      {/* ══════════════════════════════════════════════════════════════════
          INSPIRATIONAL QUOTE SECTION - Dynamic Quote
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-10 relative">
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
              &ldquo;{randomQuote}&rdquo;
            </p>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          QUICK STATS BAR - Connected Theme Design with Real Data
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

            {isLoading ? (
              <StatsSkeleton />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {[
                  { icon: Heart, label: "Memories", value: dashboardData?.stats.memories ?? 0, subtext: "Preserved", gradient: "from-sage/15 to-sage/25" },
                  { icon: Users, label: "Family Circle", value: dashboardData?.stats.familyMembers ?? 0, subtext: "Members", gradient: "from-sage/10 to-sage-light/20" },
                  { icon: Gift, label: "Scheduled", value: dashboardData?.stats.scheduledMessages ?? 0, subtext: "Messages", gradient: "from-sage/15 to-sage/25" },
                  { icon: Clock, label: "Days Active", value: dashboardData?.stats.daysActive ?? 1, subtext: "Building", gradient: "from-sage/10 to-sage-light/20" },
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
            )}

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

      {/* Botanical Divider */}
      <BotanicalDivider variant={2} className="-mt-6 -mb-6" />

      {/* ══════════════════════════════════════════════════════════════════
          QUICK ACTIONS - Elegant Sage Theme
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-12 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          {/* Section Header with decorative lines */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 60 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="h-px bg-gradient-to-r from-transparent to-sage/40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center"
            >
              <p className="text-[11px] font-medium text-sage/70 uppercase tracking-[0.2em] mb-1">Begin Your Journey</p>
              <h2 className="font-serif text-xl text-charcoal">What would you like to preserve?</h2>
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 60 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="h-px bg-gradient-to-l from-transparent to-sage/40"
            />
          </div>

          {/* Elegant Action Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Mic, label: "Voice Message", desc: "Record your voice for loved ones", href: "/dashboard/voice", number: "01" },
              { icon: Heart, label: "Add Memory", desc: "Preserve precious moments", href: "/dashboard/memories", number: "02" },
              { icon: BookOpen, label: "Write Story", desc: "Share your life journey", href: "/dashboard/stories", number: "03" },
              { icon: Gift, label: "Schedule Gift", desc: "Plan future surprises", href: "/dashboard/messages", number: "04" },
            ].map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={action.href}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative h-full p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-sage/15 cursor-pointer group overflow-hidden shadow-sm hover:shadow-xl hover:shadow-sage/10 transition-all duration-500"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sage/0 via-sage/5 to-sage/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Number indicator */}
                    <span className="absolute top-4 right-4 text-[10px] font-medium text-sage/30 group-hover:text-sage/50 transition-colors">
                      {action.number}
                    </span>

                    <div className="relative">
                      {/* Icon container with animated border */}
                      <div className="relative mb-5">
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-sage/20 opacity-0 group-hover:opacity-100 transition-opacity"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          style={{ borderRadius: "1rem" }}
                        />
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-sage/10 via-sage/15 to-sage-light/25 flex items-center justify-center border border-sage/10 group-hover:border-sage/30 group-hover:shadow-lg group-hover:shadow-sage/20 transition-all duration-300"
                        >
                          <action.icon className="w-6 h-6 text-sage-dark group-hover:text-sage transition-colors duration-300" />
                        </motion.div>
                      </div>

                      {/* Text content */}
                      <h3 className="font-serif text-base font-medium text-charcoal group-hover:text-sage-dark transition-colors duration-300 mb-1">
                        {action.label}
                      </h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {action.desc}
                      </p>

                      {/* Arrow with animated line */}
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-sage/10">
                        <motion.div
                          initial={{ width: 0 }}
                          whileHover={{ width: 20 }}
                          className="h-px bg-sage/50"
                        />
                        <motion.div
                          initial={{ x: -5, opacity: 0 }}
                          whileHover={{ x: 0, opacity: 1 }}
                          className="text-sage"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                        <span className="text-[10px] text-sage/60 group-hover:text-sage transition-colors">
                          Get Started
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Botanical Divider */}
      <BotanicalDivider variant={3} className="-mt-8 -mb-4" />

      {/* ══════════════════════════════════════════════════════════════════
          UPCOMING EVENTS SECTION - Real Data
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-8 relative">
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

          {isLoading ? (
            <EventsSkeleton />
          ) : dashboardData?.upcomingEvents && dashboardData.upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingEvents.map((event, i) => (
                <motion.div
                  key={event.id}
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
                      <h4 className="font-medium text-charcoal group-hover:text-sage-dark transition-colors">{event.title || event.name}</h4>
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
          ) : (
            <EmptyState
              icon={Calendar}
              title="No upcoming messages"
              description="Schedule messages for birthdays, anniversaries, and special moments"
              actionHref="/dashboard/messages"
              actionLabel="Schedule a Message"
            />
          )}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FAMILY ACTIVITY SECTION - Real Data
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

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-sage/10 animate-pulse" />
                    <div className="flex-1">
                      <div className="w-48 h-4 bg-sage/10 rounded mb-1 animate-pulse" />
                      <div className="w-24 h-3 bg-sage/10 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardData?.familyActivity && dashboardData.familyActivity.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.familyActivity.map((activity, i) => (
                  <motion.div
                    key={activity.id}
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
            ) : (
              <div className="text-center py-6">
                <Users className="w-10 h-10 text-sage/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No recent activity from your trusted circle
                </p>
                <Link href="/dashboard/family">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="mt-3 text-sm text-sage hover:text-sage-dark transition-colors"
                  >
                    Invite family members
                  </motion.button>
                </Link>
              </div>
            )}
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
          <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
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
          {pillarsWithRealData.slice(0, 4).map((pillar) => {
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
          <Link href="#pillars-mobile">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-sage/10 transition-colors">
              <Plus className="w-5 h-5 text-sage/70" />
            </div>
          </Link>
        </div>
      </motion.nav>
    </div>
  );
}

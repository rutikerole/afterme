"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  TrendingUp,
  Award,
  Target,
  CheckCircle2,
  Circle,
  Folder,
  Lock,
  Heart,
  Users,
  Mic,
  BookOpen,
  Sparkles,
  ArrowRight,
  Trophy,
  Star,
  Zap,
  Calendar,
  ChevronRight,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ═══════════════════════════════════════════════════════════════════════════
// ARTISTIC SVG DECORATIONS
// ═══════════════════════════════════════════════════════════════════════════

// Floating Leaf with variants
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
const Sparkle = ({ className, style, size = 20 }: { className?: string; style?: React.CSSProperties; size?: number }) => (
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

// Trophy decoration
const TrophyDecoration = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} width="60" height="70" viewBox="0 0 60 70" fill="none">
    <path d="M15 10H45V30C45 42 38 50 30 50C22 50 15 42 15 30V10Z" fill="hsl(var(--sage))" fillOpacity="0.15" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.4" />
    <path d="M15 15H8C8 15 5 15 5 20C5 28 10 30 15 30" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
    <path d="M45 15H52C52 15 55 15 55 20C55 28 50 30 45 30" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
    <path d="M25 50V58M35 50V58M20 58H40" stroke="hsl(var(--sage))" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
    <circle cx="30" cy="28" r="8" fill="hsl(var(--sage))" fillOpacity="0.2" className="animate-breathe" />
    <path d="M30 22L31.5 26H36L32.5 28.5L34 33L30 30L26 33L27.5 28.5L24 26H28.5L30 22Z" fill="hsl(var(--sage))" fillOpacity="0.5" className="animate-twinkle" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════

interface PillarData {
  id: string;
  name: string;
  icon: any;
  progress: number;
  tasks: { label: string; completed: boolean; points: number }[];
  href: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  unlockedAt?: Date;
}

const pillarsData: PillarData[] = [
  {
    id: "vault",
    name: "Life Vault",
    icon: Folder,
    progress: 65,
    href: "/dashboard/vault",
    tasks: [
      { label: "Add identity documents", completed: true, points: 20 },
      { label: "Upload financial records", completed: true, points: 20 },
      { label: "Add insurance policies", completed: true, points: 15 },
      { label: "Set up subscriptions list", completed: true, points: 10 },
      { label: "Add emergency contacts", completed: false, points: 15 },
      { label: "Assign nominees", completed: false, points: 20 },
    ],
  },
  {
    id: "legacy",
    name: "If I'm Gone",
    icon: Lock,
    progress: 40,
    href: "/dashboard/legacy",
    tasks: [
      { label: "Write first instructions", completed: true, points: 25 },
      { label: "Record final wishes", completed: true, points: 25 },
      { label: "Add asset guidance", completed: false, points: 25 },
      { label: "Set funeral preferences", completed: false, points: 25 },
    ],
  },
  {
    id: "memories",
    name: "Memory Vault",
    icon: Heart,
    progress: 35,
    href: "/dashboard/memories",
    tasks: [
      { label: "Upload first photo", completed: true, points: 15 },
      { label: "Create a memory album", completed: true, points: 20 },
      { label: "Add captions to memories", completed: false, points: 15 },
      { label: "Share with family", completed: false, points: 25 },
      { label: "Create time capsule", completed: false, points: 25 },
    ],
  },
  {
    id: "voice",
    name: "Voice Messages",
    icon: Mic,
    progress: 25,
    href: "/dashboard/voice",
    tasks: [
      { label: "Record first message", completed: true, points: 25 },
      { label: "Add recipient", completed: false, points: 20 },
      { label: "Schedule delivery", completed: false, points: 25 },
      { label: "Record for 3 people", completed: false, points: 30 },
    ],
  },
  {
    id: "stories",
    name: "Life Stories",
    icon: BookOpen,
    progress: 20,
    href: "/dashboard/stories",
    tasks: [
      { label: "Complete first prompt", completed: true, points: 20 },
      { label: "Write childhood memory", completed: false, points: 20 },
      { label: "Share life lesson", completed: false, points: 25 },
      { label: "Record voice story", completed: false, points: 35 },
    ],
  },
  {
    id: "family",
    name: "Trusted Circle",
    icon: Users,
    progress: 50,
    href: "/dashboard/family",
    tasks: [
      { label: "Invite first member", completed: true, points: 20 },
      { label: "Set permissions", completed: true, points: 20 },
      { label: "Add emergency contact", completed: true, points: 20 },
      { label: "Set up legacy unlockers", completed: false, points: 40 },
    ],
  },
];

const achievements: Achievement[] = [
  {
    id: "first_step",
    title: "First Steps",
    description: "Started your legacy journey",
    icon: Star,
    unlocked: true,
    unlockedAt: new Date("2024-01-15"),
  },
  {
    id: "vault_starter",
    title: "Vault Keeper",
    description: "Added 5 documents to Life Vault",
    icon: Folder,
    unlocked: true,
    unlockedAt: new Date("2024-02-01"),
  },
  {
    id: "voice_recorder",
    title: "Voice of Love",
    description: "Recorded your first message",
    icon: Mic,
    unlocked: true,
    unlockedAt: new Date("2024-02-10"),
  },
  {
    id: "family_first",
    title: "Circle Builder",
    description: "Invited your first family member",
    icon: Users,
    unlocked: true,
    unlockedAt: new Date("2024-02-15"),
  },
  {
    id: "story_teller",
    title: "Story Teller",
    description: "Wrote your first life story",
    icon: BookOpen,
    unlocked: true,
    unlockedAt: new Date("2024-03-01"),
  },
  {
    id: "legacy_planner",
    title: "Legacy Planner",
    description: "Completed legacy instructions",
    icon: Lock,
    unlocked: false,
  },
  {
    id: "memory_keeper",
    title: "Memory Keeper",
    description: "Created 5 memory albums",
    icon: Heart,
    unlocked: false,
  },
  {
    id: "fully_protected",
    title: "Fully Protected",
    description: "Reach 100% Life Score",
    icon: Shield,
    unlocked: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ProgressPage() {
  const [mounted, setMounted] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const total = pillarsData.reduce((sum, p) => sum + p.progress, 0);
    const avg = Math.round(total / pillarsData.length);
    setTimeout(() => setOverallScore(avg), 300);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-sage-dark";
    if (score >= 60) return "text-sage";
    if (score >= 40) return "text-sage";
    return "text-sage/70";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good Progress";
    if (score >= 40) return "Getting There";
    return "Just Started";
  };

  const totalTasks = pillarsData.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = pillarsData.reduce(
    (sum, p) => sum + p.tasks.filter((t) => t.completed).length,
    0
  );
  const totalPoints = pillarsData.reduce(
    (sum, p) => sum + p.tasks.reduce((s, t) => s + t.points, 0),
    0
  );
  const earnedPoints = pillarsData.reduce(
    (sum, p) => sum + p.tasks.filter((t) => t.completed).reduce((s, t) => s + t.points, 0),
    0
  );
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-sage/20 border-t-sage rounded-full animate-spin" />
          <span className="text-sage/60 text-sm">Loading your progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-sage-light/5 to-background relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════
          ARTISTIC BACKGROUND DECORATIONS
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Morphing background blobs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-sage/12 rounded-full blur-3xl animate-blob-morph" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-sage-light/25 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-5s" }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-sage/8 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-10s" }} />

        {/* Floating leaves */}
        <FloatingLeaf className="absolute top-28 left-[8%] animate-float-rotate opacity-55" style={{ animationDuration: "10s" }} size={50} variant={1} />
        <FloatingLeaf className="absolute top-[40%] right-[5%] animate-sway opacity-50" style={{ animationDuration: "6s" }} size={45} variant={2} />
        <FloatingLeaf className="absolute bottom-[30%] left-[5%] animate-drift opacity-45" style={{ animationDuration: "12s" }} size={55} variant={3} />
        <FloatingLeaf className="absolute top-[20%] right-[25%] animate-swing opacity-40" style={{ animationDuration: "4s" }} size={35} variant={1} />
        <FloatingLeaf className="absolute bottom-[50%] right-[12%] animate-wave opacity-35" style={{ animationDuration: "7s" }} size={40} variant={2} />
        <FloatingLeaf className="absolute top-[60%] left-[15%] animate-float opacity-30" style={{ animationDuration: "9s", animationDelay: "2s" }} size={38} variant={3} />

        {/* Trophy decorations */}
        <TrophyDecoration className="absolute top-32 right-[18%] opacity-35" />
        <TrophyDecoration className="absolute bottom-40 left-[22%] opacity-30 scale-75" />

        {/* Gentle rings */}
        <GentleRings className="absolute top-[15%] left-[12%] opacity-25" />
        <GentleRings className="absolute bottom-[20%] right-[8%] opacity-20" style={{ transform: 'scale(0.7)' }} />

        {/* Sparkles */}
        <Sparkle className="absolute top-36 left-[28%] animate-twinkle opacity-55" style={{ animationDelay: "0s" }} size={16} />
        <Sparkle className="absolute top-[50%] right-[28%] animate-twinkle opacity-50" style={{ animationDelay: "0.5s" }} size={20} />
        <Sparkle className="absolute bottom-32 right-[42%] animate-twinkle opacity-45" style={{ animationDelay: "1s" }} size={14} />
        <Sparkle className="absolute top-[25%] left-[45%] animate-twinkle opacity-40" style={{ animationDelay: "1.5s" }} size={18} />
        <Sparkle className="absolute bottom-[45%] left-[35%] animate-twinkle opacity-35" style={{ animationDelay: "2s" }} size={12} />

        {/* Firefly particles */}
        <div className="absolute top-36 left-[30%] w-3 h-3 rounded-full bg-sage/45 animate-firefly" style={{ animationDuration: "8s" }} />
        <div className="absolute top-[50%] right-[30%] w-4 h-4 rounded-full bg-sage/35 animate-firefly" style={{ animationDuration: "10s", animationDelay: "2s" }} />
        <div className="absolute bottom-32 right-[45%] w-3 h-3 rounded-full bg-sage/40 animate-firefly" style={{ animationDuration: "9s", animationDelay: "4s" }} />
        <div className="absolute top-[70%] left-[20%] w-2 h-2 rounded-full bg-sage/30 animate-firefly" style={{ animationDuration: "7s", animationDelay: "1s" }} />

        {/* Flowing lines */}
        <svg className="absolute top-16 left-0 w-full h-32 opacity-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 Q200,20 400,60 T800,60 T1200,60" fill="none" stroke="hsl(var(--sage))" strokeWidth="2" className="animate-line-flow" />
          <path d="M0,80 Q300,40 600,80 T1200,80" fill="none" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.6" className="animate-line-flow" style={{ animationDelay: "-2s" }} />
        </svg>
        <svg className="absolute bottom-20 left-0 w-full h-24 opacity-15" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path d="M0,50 C200,20 400,80 600,50 C800,20 1000,80 1200,50" fill="none" stroke="hsl(var(--sage))" strokeWidth="2" className="animate-line-flow" style={{ animationDirection: "reverse" }} />
        </svg>

        {/* Ripple circles */}
        <div className="absolute top-[40%] left-[50%] w-40 h-40 rounded-full border border-sage/15 animate-ripple" style={{ animationDuration: "4s" }} />
        <div className="absolute top-[40%] left-[50%] w-40 h-40 rounded-full border border-sage/15 animate-ripple" style={{ animationDuration: "4s", animationDelay: "1.3s" }} />
        <div className="absolute top-[40%] left-[50%] w-40 h-40 rounded-full border border-sage/15 animate-ripple" style={{ animationDuration: "4s", animationDelay: "2.6s" }} />
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl relative">
        {/* ═══════════════════════════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-sage/10 hover:text-sage-dark">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-serif font-medium text-foreground">Life Score & Progress</h1>
              <Sparkle className="animate-twinkle text-sage" size={20} />
            </div>
            <p className="text-muted-foreground">Track your legacy journey</p>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            MAIN SCORE CARD - SAGE THEMED
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-3xl bg-gradient-to-br from-sage/15 via-sage-light/25 to-sage/10 border border-sage/30 mb-8 relative overflow-hidden"
        >
          {/* Decorative elements inside card */}
          <div className="absolute top-4 right-4 opacity-30">
            <FloatingLeaf className="animate-sway" size={35} variant={1} />
          </div>
          <div className="absolute bottom-4 left-4 opacity-20">
            <Sparkle className="animate-twinkle" size={18} />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="p-3 rounded-2xl bg-sage/20 border border-sage/30"
                >
                  <Shield className="w-8 h-8 text-sage-dark" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-serif font-medium text-foreground">Your Life Score</h2>
                  <p className={`text-sm ${getScoreColor(overallScore)} font-medium`}>
                    {getScoreLabel(overallScore)}
                  </p>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-7xl font-serif font-medium text-sage-dark"
                >
                  {overallScore}
                </motion.span>
                <span className="text-3xl text-sage/60">/ 100</span>
              </div>

              {/* Progress Bar - Sage themed */}
              <div className="h-4 bg-sage/10 rounded-full overflow-hidden mb-4 border border-sage/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallScore}%` }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-sage to-sage-dark rounded-full relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
                </motion.div>
              </div>

              <p className="text-sm text-muted-foreground">
                Complete more tasks to improve your score and ensure your legacy is protected.
              </p>
            </div>

            {/* Stats Grid - Sage themed */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-sage/20 hover:border-sage/40 hover:shadow-lg hover:shadow-sage/10 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-sage/15 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-5 h-5 text-sage" />
                  </div>
                  <span className="text-sm text-muted-foreground">Tasks Done</span>
                </div>
                <p className="text-3xl font-serif font-medium text-sage-dark">
                  {completedTasks}
                  <span className="text-lg text-sage/50">/{totalTasks}</span>
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-sage/20 hover:border-sage/40 hover:shadow-lg hover:shadow-sage/10 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-sage/15 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    <Zap className="w-5 h-5 text-sage-dark" />
                  </div>
                  <span className="text-sm text-muted-foreground">Points</span>
                </div>
                <p className="text-3xl font-serif font-medium text-sage-dark">
                  {earnedPoints}
                  <span className="text-lg text-sage/50">/{totalPoints}</span>
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-sage/20 hover:border-sage/40 hover:shadow-lg hover:shadow-sage/10 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-sage/15 group-hover:scale-110 transition-transform animate-heartbeat" style={{ animationDuration: '3s' }}>
                    <Trophy className="w-5 h-5 text-sage" />
                  </div>
                  <span className="text-sm text-muted-foreground">Achievements</span>
                </div>
                <p className="text-3xl font-serif font-medium text-sage-dark">
                  {unlockedAchievements}
                  <span className="text-lg text-sage/50">/{achievements.length}</span>
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-sage/20 hover:border-sage/40 hover:shadow-lg hover:shadow-sage/10 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-sage/15 group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-sage-dark" />
                  </div>
                  <span className="text-sm text-muted-foreground">Pillars Active</span>
                </div>
                <p className="text-3xl font-serif font-medium text-sage-dark">
                  {pillarsData.filter((p) => p.progress > 0).length}
                  <span className="text-lg text-sage/50">/{pillarsData.length}</span>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            PILLARS PROGRESS - SAGE THEMED
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-serif font-medium text-foreground">Progress by Pillar</h2>
              <FloatingLeaf className="animate-sway opacity-60" size={24} variant={2} />
            </div>
            <p className="text-sm text-muted-foreground">Click to see tasks</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillarsData.map((pillar, index) => {
              const Icon = pillar.icon;
              const completedCount = pillar.tasks.filter((t) => t.completed).length;
              const isSelected = selectedPillar === pillar.id;

              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <motion.button
                    onClick={() => setSelectedPillar(isSelected ? null : pillar.id)}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className={`w-full p-5 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                      isSelected
                        ? "bg-gradient-to-br from-sage/15 to-sage-light/20 border-sage/40 shadow-lg shadow-sage/10"
                        : "bg-white/60 backdrop-blur-sm border-sage/20 hover:border-sage/40 hover:shadow-lg hover:shadow-sage/10"
                    }`}
                  >
                    {/* Hover gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-sage/5 via-transparent to-sage-light/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          className="p-2 rounded-xl bg-sage/15 border border-sage/20 group-hover:border-sage/40 transition-colors"
                        >
                          <Icon className="w-5 h-5 text-sage-dark" />
                        </motion.div>
                        <div>
                          <h3 className="font-medium text-foreground">{pillar.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {completedCount}/{pillar.tasks.length} tasks
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl font-serif font-medium text-sage-dark">
                        {pillar.progress}%
                      </span>
                    </div>

                    <div className="h-2 bg-sage/10 rounded-full overflow-hidden border border-sage/10 relative z-10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pillar.progress}%` }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-sage to-sage-dark"
                      />
                    </div>
                  </motion.button>

                  {/* Expanded Task List */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-4 rounded-xl bg-sage-light/30 border border-sage/20 space-y-2"
                      >
                        {pillar.tasks.map((task, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                              task.completed ? "bg-sage/15 border border-sage/20" : "bg-white/60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {task.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-sage-dark" />
                              ) : (
                                <Circle className="w-4 h-4 text-sage/40" />
                              )}
                              <span
                                className={
                                  task.completed ? "text-sage-dark font-medium" : "text-foreground"
                                }
                              >
                                {task.label}
                              </span>
                            </div>
                            <span
                              className={`text-sm font-medium ${
                                task.completed ? "text-sage-dark" : "text-sage/50"
                              }`}
                            >
                              +{task.points} pts
                            </span>
                          </motion.div>
                        ))}
                        <Link href={pillar.href}>
                          <Button className="w-full mt-2 bg-sage hover:bg-sage-dark text-white">
                            Go to {pillar.name}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            ACHIEVEMENTS - SAGE THEMED
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-medium flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sage/15">
                <Trophy className="w-5 h-5 text-sage-dark" />
              </div>
              Achievements
            </h2>
            <span className="text-sm text-muted-foreground">
              {unlockedAchievements} of {achievements.length} unlocked
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className={`p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-white/80 to-sage-light/30 border-sage/30 hover:border-sage/50 hover:shadow-lg hover:shadow-sage/10"
                      : "bg-muted/30 border-border opacity-60"
                  }`}
                >
                  {/* Shine effect on hover */}
                  {achievement.unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  )}

                  <motion.div
                    whileHover={achievement.unlocked ? { rotate: 5, scale: 1.1 } : {}}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                      achievement.unlocked
                        ? "bg-sage/20 border border-sage/30"
                        : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        achievement.unlocked ? "text-sage-dark" : "text-muted-foreground"
                      }`}
                    />
                  </motion.div>
                  <h3 className="font-medium mb-1 text-foreground">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-sage flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {achievement.unlockedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                  {!achievement.unlocked && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            SUGGESTED NEXT STEPS - SAGE THEMED
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-sage/15 via-sage-light/25 to-sage/10 border border-sage/30 relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 opacity-30">
            <Sparkle className="animate-twinkle" size={20} />
          </div>
          <div className="absolute bottom-4 left-4 opacity-25">
            <FloatingLeaf className="animate-float" size={30} variant={3} />
          </div>

          <div className="flex items-start gap-4 relative z-10">
            <motion.div
              whileHover={{ rotate: 5 }}
              className="p-3 rounded-xl bg-sage/20 border border-sage/30"
            >
              <Sparkles className="w-6 h-6 text-sage-dark" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-lg font-serif font-medium text-sage-dark mb-2">
                Suggested Next Steps
              </h3>
              <p className="text-sm text-sage/80 mb-4">
                Complete these tasks to quickly improve your Life Score
              </p>
              <div className="space-y-3">
                {pillarsData
                  .flatMap((p) =>
                    p.tasks
                      .filter((t) => !t.completed)
                      .slice(0, 1)
                      .map((t) => ({ ...t, pillar: p }))
                  )
                  .slice(0, 3)
                  .map((task, i) => {
                    const Icon = task.pillar.icon;
                    return (
                      <Link
                        key={i}
                        href={task.pillar.href}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/70 border border-sage/20 hover:border-sage/40 hover:bg-white/90 hover:shadow-lg hover:shadow-sage/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-sage/15 group-hover:scale-110 transition-transform">
                            <Icon className="w-4 h-4 text-sage-dark" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{task.label}</p>
                            <p className="text-xs text-sage">{task.pillar.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-sage-dark">
                            +{task.points} pts
                          </span>
                          <ChevronRight className="w-4 h-4 text-sage group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            BOTTOM CTA
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          {/* Decorative divider */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-sage/40 to-sage/30 rounded-full" />
              <FloatingLeaf className="animate-swing opacity-60" style={{ animationDuration: "4s" }} size={24} variant={1} />
              <Sparkle className="animate-twinkle opacity-70" size={14} />
              <div className="w-3 h-3 rounded-full bg-sage/40 animate-pulse" />
              <Sparkle className="animate-twinkle opacity-70" style={{ animationDelay: "0.5s" }} size={14} />
              <FloatingLeaf className="animate-swing opacity-60 rotate-45" style={{ animationDuration: "4s", animationDelay: "0.5s" }} size={24} variant={2} />
              <div className="w-16 h-0.5 bg-gradient-to-l from-transparent via-sage/40 to-sage/30 rounded-full" />
            </div>
          </div>

          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Every task you complete brings peace of mind to your loved ones
          </p>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-sage hover:bg-sage-dark text-white rounded-full transition-colors shadow-lg shadow-sage/30 hover:shadow-xl hover:shadow-sage/40"
            >
              <span className="font-medium">Back to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

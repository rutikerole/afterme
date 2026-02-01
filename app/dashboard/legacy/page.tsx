"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Lock,
  Unlock,
  FileText,
  Users,
  Home,
  MessageSquare,
  Shield,
  AlertTriangle,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  BookOpen,
  Flower2,
  HandHeart,
  Clock,
  Star,
  Feather,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Instruction {
  id: string;
  title: string;
  content: string;
  priority: "critical" | "important" | "normal";
  category: "first_steps" | "contacts" | "assets" | "documents" | "personal";
}

interface FuneralPreference {
  id: string;
  question: string;
  answer: string;
}

const initialInstructions: Instruction[] = [
  {
    id: "1",
    title: "First thing to do",
    content: "Call my brother Vikram immediately. He will help coordinate everything. His number is in emergency contacts.",
    priority: "critical",
    category: "first_steps",
  },
  {
    id: "2",
    title: "Bank accounts",
    content: "All bank account details are in the Life Vault. Priya is the nominee for all accounts. Contact HDFC branch manager Mr. Sharma for help.",
    priority: "important",
    category: "assets",
  },
  {
    id: "3",
    title: "Life insurance claim",
    content: "ICICI Term Insurance policy number is in the vault. Contact agent Rajesh (number in emergency contacts). Keep death certificate ready - you'll need multiple copies.",
    priority: "important",
    category: "assets",
  },
  {
    id: "4",
    title: "Office matters",
    content: "Contact HR at my company. They will process the final settlement. My manager's number is saved in my phone under 'Boss'.",
    priority: "normal",
    category: "contacts",
  },
];

const funeralQuestions = [
  "Cremation or burial preference?",
  "Religious ceremonies you want?",
  "Location preference for final rites?",
  "Any specific rituals to follow?",
  "Who should lead the ceremonies?",
  "Any specific songs/prayers?",
  "Dress code for the ceremony?",
  "Charity donations instead of flowers?",
];

const categoryLabels = {
  first_steps: { label: "First Steps", icon: Star, color: "text-sage-dark", bg: "bg-sage/20" },
  contacts: { label: "People to Contact", icon: Users, color: "text-sage", bg: "bg-sage-light/50" },
  assets: { label: "Assets & Finance", icon: Home, color: "text-sage-dark", bg: "bg-sage/15" },
  documents: { label: "Documents", icon: FileText, color: "text-sage", bg: "bg-sage-light/40" },
  personal: { label: "Personal Wishes", icon: Heart, color: "text-sage-dark", bg: "bg-sage/20" },
};

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

// Decorative dove/bird for peace symbolism with animation
const PeaceDove = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} width="60" height="60" viewBox="0 0 60 60" fill="none">
    <path
      d="M15 35C15 35 20 30 30 30C40 30 47.5 35 52.5 25C52.5 25 45 27.5 40 25C35 22.5 32.5 17.5 30 15C27.5 17.5 25 22.5 20 25C15 27.5 7.5 25 7.5 25C12.5 35 15 35 15 35Z"
      fill="hsl(var(--sage))"
      fillOpacity="0.25"
      stroke="hsl(var(--sage))"
      strokeWidth="1.5"
      strokeOpacity="0.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-breathe"
    />
    <path
      d="M30 30V45M25 40L30 45L35 40"
      stroke="hsl(var(--sage))"
      strokeWidth="1.5"
      strokeOpacity="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Wing detail */}
    <path
      d="M22 28C22 28 25 26 28 28M32 28C32 28 35 26 38 28"
      stroke="hsl(var(--sage))"
      strokeWidth="1"
      strokeOpacity="0.4"
      strokeLinecap="round"
    />
  </svg>
);

// Candle decoration for remembrance
const CandleDecoration = ({ className }: { className?: string }) => (
  <svg className={className} width="40" height="60" viewBox="0 0 40 60" fill="none">
    <rect x="12" y="25" width="16" height="30" rx="2" fill="hsl(var(--sage))" fillOpacity="0.15" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.4" />
    <ellipse cx="20" cy="20" rx="6" ry="8" fill="hsl(var(--sage))" fillOpacity="0.3" className="animate-breathe" />
    <path d="M20 12V25" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.4" />
    <circle cx="20" cy="15" r="3" fill="hsl(var(--sage))" fillOpacity="0.5" className="animate-twinkle" />
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

export default function LegacyPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [instructions, setInstructions] = useState<Instruction[]>(initialInstructions);
  const [funeralPrefs, setFuneralPrefs] = useState<FuneralPreference[]>([]);
  const [activeTab, setActiveTab] = useState<"instructions" | "funeral" | "messages">("instructions");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFuneralModal, setShowFuneralModal] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length >= 4) {
      setIsUnlocked(true);
    }
  };

  const groupedInstructions = instructions.reduce((acc, inst) => {
    if (!acc[inst.category]) acc[inst.category] = [];
    acc[inst.category].push(inst);
    return acc;
  }, {} as Record<string, Instruction[]>);

  // Beautiful Locked State with sage theme
  if (!isUnlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Morphing background blobs */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-sage/15 rounded-full blur-3xl animate-blob-morph" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-sage-light/30 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sage/5 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-10s" }} />

          {/* Floating leaves with varied animations */}
          <FloatingLeaf className="absolute top-24 left-[15%] animate-float-rotate opacity-60" style={{ animationDuration: "10s" }} size={50} variant={1} />
          <FloatingLeaf className="absolute top-32 right-[20%] animate-sway opacity-55" style={{ animationDuration: "6s" }} size={40} variant={2} />
          <FloatingLeaf className="absolute bottom-32 left-[25%] animate-drift opacity-50 -rotate-12" style={{ animationDuration: "12s" }} size={45} variant={3} />
          <FloatingLeaf className="absolute bottom-40 right-[15%] animate-wave opacity-45" style={{ animationDuration: "8s" }} size={55} variant={1} />
          <FloatingLeaf className="absolute top-[50%] left-[8%] animate-swing opacity-40" style={{ animationDuration: "4s" }} size={35} variant={2} />
          <FloatingLeaf className="absolute top-[30%] right-[8%] animate-float opacity-35" style={{ animationDuration: "11s", animationDelay: "2s" }} size={38} variant={3} />

          {/* Peace doves */}
          <PeaceDove className="absolute top-[20%] right-[25%] opacity-35 animate-float" style={{ animationDuration: "9s" }} />
          <PeaceDove className="absolute bottom-[25%] left-[20%] opacity-30 animate-float -scale-x-100" style={{ animationDuration: "11s", animationDelay: "3s" }} />

          {/* Candle decorations */}
          <CandleDecoration className="absolute bottom-[35%] right-[10%] opacity-40" />
          <CandleDecoration className="absolute top-[40%] left-[5%] opacity-35" />

          {/* Gentle rings */}
          <GentleRings className="absolute top-[15%] left-[10%] opacity-30" />
          <GentleRings className="absolute bottom-[20%] right-[12%] opacity-25" style={{ transform: 'scale(0.7)' }} />

          {/* Sparkles */}
          <Sparkle className="absolute top-36 left-[35%] animate-twinkle opacity-60" style={{ animationDelay: "0s" }} size={16} />
          <Sparkle className="absolute top-48 right-[30%] animate-twinkle opacity-55" style={{ animationDelay: "0.7s" }} size={20} />
          <Sparkle className="absolute bottom-36 left-[40%] animate-twinkle opacity-50" style={{ animationDelay: "1.4s" }} size={14} />
          <Sparkle className="absolute top-[60%] right-[35%] animate-twinkle opacity-45" style={{ animationDelay: "2.1s" }} size={18} />
          <Sparkle className="absolute bottom-[50%] left-[30%] animate-twinkle opacity-40" style={{ animationDelay: "0.5s" }} size={12} />

          {/* Firefly particles */}
          <div className="absolute top-36 left-[38%] w-3 h-3 rounded-full bg-sage/50 animate-firefly" style={{ animationDuration: "8s" }} />
          <div className="absolute top-48 right-[32%] w-4 h-4 rounded-full bg-sage/40 animate-firefly" style={{ animationDuration: "10s", animationDelay: "2s" }} />
          <div className="absolute bottom-36 left-[42%] w-3 h-3 rounded-full bg-sage/45 animate-firefly" style={{ animationDuration: "9s", animationDelay: "4s" }} />
          <div className="absolute top-[55%] left-[25%] w-2 h-2 rounded-full bg-sage/35 animate-firefly" style={{ animationDuration: "7s", animationDelay: "1s" }} />

          {/* Decorative flowing lines */}
          <svg className="absolute top-16 left-0 w-full h-32 opacity-25" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 Q200,20 400,60 T800,60 T1200,60" fill="none" stroke="hsl(var(--sage))" strokeWidth="2" className="animate-line-flow" />
            <path d="M0,80 Q300,40 600,80 T1200,80" fill="none" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.6" className="animate-line-flow" style={{ animationDelay: "-2s" }} />
          </svg>
          <svg className="absolute bottom-16 left-0 w-full h-24 opacity-20" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <path d="M0,30 C200,70 400,10 600,50 C800,90 1000,30 1200,50" fill="none" stroke="hsl(var(--sage))" strokeWidth="2" className="animate-line-flow" style={{ animationDirection: "reverse" }} />
          </svg>

          {/* Ripple effect in center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-48 h-48 rounded-full border border-sage/15 animate-ripple" style={{ animationDuration: "4s" }} />
            <div className="absolute inset-0 w-48 h-48 rounded-full border border-sage/15 animate-ripple" style={{ animationDuration: "4s", animationDelay: "1.3s" }} />
            <div className="absolute inset-0 w-48 h-48 rounded-full border border-sage/15 animate-ripple" style={{ animationDuration: "4s", animationDelay: "2.6s" }} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            {/* Beautiful icon with glow */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
              className="relative w-32 h-32 mx-auto mb-6"
            >
              {/* Multiple glow layers */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sage/40 to-sage-light/50 blur-2xl animate-breathe" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-sage/30 to-sage-light/40 blur-xl animate-pulse" />

              {/* Main icon container */}
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-sage/20 to-sage-light/30 border-2 border-sage/30 flex items-center justify-center shadow-lg shadow-sage/20">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Lock className="w-14 h-14 text-sage-dark" />
                </motion.div>
              </div>

              {/* Orbiting elements - multiple */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-sage/60 shadow-lg shadow-sage/30" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-sage/50" />
              </motion.div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-sage-light/70" />
              </motion.div>

              {/* Sparkle accents */}
              <Sparkle className="absolute -top-2 -right-2 animate-twinkle opacity-70" size={14} />
              <Sparkle className="absolute -bottom-1 -left-1 animate-twinkle opacity-60" style={{ animationDelay: "0.7s" }} size={12} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-3">
                If I'm <span className="text-sage">Gone</span>...
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                This sacred space holds your final words and wishes for those you love.
                Protected with care, shared with love.
              </p>
            </motion.div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleUnlock}
            className="space-y-4"
          >
            <div className="p-6 rounded-3xl border border-sage/20 bg-gradient-to-b from-card to-sage-light/10 shadow-lg">
              <Label htmlFor="password" className="text-sm text-muted-foreground flex items-center gap-2">
                <Feather className="w-4 h-4 text-sage" />
                Enter your vault password to continue
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-3 text-center text-lg tracking-widest border-sage/20 focus:border-sage focus:ring-sage/30 bg-background/80"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-sage to-sage-dark hover:from-sage-dark hover:to-sage text-white shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Unlock className="w-5 h-5 mr-2" />
              Open Legacy Vault
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground"
          >
            <Shield className="w-4 h-4 text-sage" />
            <span>Your words are encrypted and protected with love</span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 relative">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Morphing blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sage/10 rounded-full blur-3xl animate-blob-morph" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sage-light/25 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-7s" }} />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-sage/5 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-3s" }} />

        {/* Floating leaves */}
        <FloatingLeaf className="absolute top-32 left-[5%] animate-float-rotate opacity-45" style={{ animationDuration: "12s" }} size={50} variant={1} />
        <FloatingLeaf className="absolute top-[40%] right-[3%] animate-sway opacity-40 rotate-45" style={{ animationDuration: "6s" }} size={45} variant={2} />
        <FloatingLeaf className="absolute bottom-[20%] left-[8%] animate-drift opacity-35 -rotate-12" style={{ animationDuration: "14s" }} size={42} variant={3} />
        <FloatingLeaf className="absolute top-[60%] right-[8%] animate-wave opacity-30" style={{ animationDuration: "8s" }} size={38} variant={1} />
        <FloatingLeaf className="absolute bottom-[40%] left-[3%] animate-swing opacity-35" style={{ animationDuration: "4s" }} size={35} variant={2} />

        {/* Peace dove */}
        <PeaceDove className="absolute top-24 right-[15%] opacity-30 animate-float" style={{ animationDuration: "10s" }} />

        {/* Sparkles */}
        <Sparkle className="absolute top-40 left-[20%] animate-twinkle opacity-50" style={{ animationDelay: "0s" }} size={14} />
        <Sparkle className="absolute top-[50%] right-[20%] animate-twinkle opacity-45" style={{ animationDelay: "1s" }} size={18} />
        <Sparkle className="absolute bottom-32 left-[30%] animate-twinkle opacity-40" style={{ animationDelay: "0.5s" }} size={12} />

        {/* Firefly particles */}
        <div className="absolute top-[30%] left-[15%] w-2 h-2 rounded-full bg-sage/40 animate-firefly" style={{ animationDuration: "9s" }} />
        <div className="absolute top-[55%] right-[15%] w-3 h-3 rounded-full bg-sage/35 animate-firefly" style={{ animationDuration: "11s", animationDelay: "3s" }} />
        <div className="absolute bottom-[35%] left-[25%] w-2 h-2 rounded-full bg-sage/30 animate-firefly" style={{ animationDuration: "8s", animationDelay: "1s" }} />

        {/* Gentle rings */}
        <GentleRings className="absolute top-20 left-[10%] opacity-20" />
        <GentleRings className="absolute bottom-32 right-[5%] opacity-15" style={{ transform: 'scale(0.6)' }} />

        {/* Flowing lines */}
        <svg className="absolute top-10 left-0 w-full h-24 opacity-15" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path d="M0,50 Q300,20 600,50 T1200,50" fill="none" stroke="hsl(var(--sage))" strokeWidth="1.5" className="animate-line-flow" />
        </svg>
        <svg className="absolute bottom-10 left-0 w-full h-20 opacity-10" viewBox="0 0 1200 80" preserveAspectRatio="none">
          <path d="M0,40 Q400,10 800,40 T1200,40" fill="none" stroke="hsl(var(--sage))" strokeWidth="1.5" className="animate-line-flow" style={{ animationDirection: "reverse" }} />
        </svg>
      </div>

      {/* Header - Sage themed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage/20 via-sage-light/30 to-sage/10 border border-sage/20 p-8"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="p-4 rounded-2xl bg-white/60 backdrop-blur border border-sage/20 shadow-sm"
            >
              <Heart className="w-8 h-8 text-sage-dark" />
            </motion.div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
                If I'm <span className="text-sage-dark">Gone</span>...
              </h1>
              <p className="text-muted-foreground">Your loving guide for your family</p>
            </div>
          </div>
          <p className="text-foreground/80 max-w-xl leading-relaxed">
            These heartfelt instructions will help your loved ones navigate through difficult times.
            Write with love, clarity, and care.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sage/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-sage-light/30 rounded-full blur-2xl" />
        <PeaceDove className="absolute top-4 right-8 opacity-40 animate-float" style={{ animationDuration: "8s" }} />
        <FloatingLeaf className="absolute bottom-4 right-4 opacity-50 rotate-45" size={30} />
      </motion.div>

      {/* Important Notice - Warm amber with sage accents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/80 to-sage-light/30 border border-amber-200/50"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-amber-100/80">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-amber-800">How this works</p>
            <p className="text-sm text-amber-700/80 mt-1 leading-relaxed">
              Your trusted contacts will receive access to these instructions through a secure verification
              process. This is guidance from the heart - please also create a legal will with a lawyer.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs - Sage themed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2 p-1.5 bg-sage-light/30 border border-sage/10 rounded-2xl w-fit"
      >
        {[
          { id: "instructions", label: "Instructions", icon: BookOpen },
          { id: "funeral", label: "Final Wishes", icon: Flower2 },
          { id: "messages", label: "Messages", icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-white shadow-md text-sage-dark border border-sage/20"
                : "text-muted-foreground hover:text-sage-dark hover:bg-white/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Instructions Tab */}
      {activeTab === "instructions" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-medium text-foreground">Step-by-Step Guide</h2>
            <Button
              onClick={() => setShowAddModal(true)}
              className="gap-2 bg-sage hover:bg-sage-dark text-white"
            >
              <Plus className="w-4 h-4" />
              Add Instruction
            </Button>
          </div>

          {/* Instructions by Category */}
          {Object.entries(categoryLabels).map(([key, { label, icon: Icon, color, bg }]) => {
            const categoryInstructions = groupedInstructions[key] || [];
            if (categoryInstructions.length === 0) return null;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground">{label}</h3>
                </div>

                <div className="space-y-3">
                  {categoryInstructions
                    .sort((a, b) => {
                      const priorityOrder = { critical: 0, important: 1, normal: 2 };
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    })
                    .map((instruction, index) => (
                      <motion.div
                        key={instruction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`group p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                          instruction.priority === "critical"
                            ? "border-rose-200 bg-gradient-to-r from-rose-50/80 to-sage-light/20"
                            : instruction.priority === "important"
                            ? "border-amber-200 bg-gradient-to-r from-amber-50/80 to-sage-light/20"
                            : "border-sage/20 bg-gradient-to-r from-white to-sage-light/10"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                                instruction.priority === "critical"
                                  ? "bg-gradient-to-br from-rose-400 to-rose-500 text-white"
                                  : instruction.priority === "important"
                                  ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white"
                                  : "bg-gradient-to-br from-sage to-sage-dark text-white"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-foreground">{instruction.title}</h4>
                                {instruction.priority === "critical" && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600 text-xs font-medium">
                                    Critical
                                  </span>
                                )}
                                {instruction.priority === "important" && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-600 text-xs font-medium">
                                    Important
                                  </span>
                                )}
                              </div>
                              <p className="text-muted-foreground mt-1.5 leading-relaxed">{instruction.content}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-sage/10">
                              <Edit2 className="w-4 h-4 text-sage-dark" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-rose-50 text-rose-500"
                              onClick={() =>
                                setInstructions((prev) => prev.filter((i) => i.id !== instruction.id))
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            );
          })}

          {instructions.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-8 rounded-3xl bg-gradient-to-b from-sage-light/20 to-transparent border border-sage/10"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage/10 flex items-center justify-center">
                <HandHeart className="w-10 h-10 text-sage" />
              </div>
              <h3 className="font-serif text-xl font-medium text-foreground mb-2">No instructions yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Write step-by-step guidance to help your family during difficult times
              </p>
              <Button onClick={() => setShowAddModal(true)} className="bg-sage hover:bg-sage-dark text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Instruction
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Funeral Wishes Tab */}
      {activeTab === "funeral" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-medium text-foreground">Final Wishes & Preferences</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Help your family honor you the way you'd want
              </p>
            </div>
            <Button onClick={() => setShowFuneralModal(true)} variant="outline" className="gap-2 border-sage/30 hover:bg-sage/10 hover:border-sage">
              <Plus className="w-4 h-4" />
              Add Custom
            </Button>
          </div>

          {/* Preset Questions - Beautiful cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {funeralQuestions.map((question, index) => {
              const existingAnswer = funeralPrefs.find((p) => p.question === question);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-5 rounded-2xl border transition-all duration-300 ${
                    existingAnswer
                      ? "border-sage/40 bg-gradient-to-br from-sage/10 to-sage-light/20 shadow-sm"
                      : "border-border bg-card hover:border-sage/40 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg ${existingAnswer ? "bg-sage/20" : "bg-muted"}`}>
                      <Flower2 className={`w-4 h-4 ${existingAnswer ? "text-sage-dark" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{question}</p>
                      {existingAnswer ? (
                        <div className="flex items-start justify-between mt-2">
                          <p className="text-muted-foreground text-sm">{existingAnswer.answer}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 -mt-1 hover:bg-rose-50"
                            onClick={() =>
                              setFuneralPrefs((prev) =>
                                prev.filter((p) => p.id !== existingAnswer.id)
                              )
                            }
                          >
                            <X className="w-3 h-3 text-rose-500" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const answer = prompt(question);
                            if (answer) {
                              setFuneralPrefs((prev) => [
                                ...prev,
                                { id: Date.now().toString(), question, answer },
                              ]);
                            }
                          }}
                          className="text-sm text-sage hover:text-sage-dark mt-2 flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add your preference
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Custom Preferences */}
          {funeralPrefs.filter((p) => !funeralQuestions.includes(p.question)).length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sage" />
                Your Additional Wishes
              </h3>
              {funeralPrefs
                .filter((p) => !funeralQuestions.includes(p.question))
                .map((pref) => (
                  <motion.div
                    key={pref.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-5 rounded-2xl border border-sage/20 bg-gradient-to-r from-card to-sage-light/10 flex items-start justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{pref.question}</p>
                      <p className="text-muted-foreground mt-1">{pref.answer}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-rose-50 text-rose-500"
                      onClick={() => setFuneralPrefs((prev) => prev.filter((p) => p.id !== pref.id))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Final Messages Tab */}
      {activeTab === "messages" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div>
            <h2 className="font-serif text-xl font-medium text-foreground">Final Messages</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Personal messages for your loved ones, to be shared when the time comes
            </p>
          </div>

          <div className="grid gap-4">
            {[
              { href: "/dashboard/messages", icon: MessageSquare, color: "sage", title: "Manage Future Messages", desc: "Schedule messages for birthdays, milestones, or special moments" },
              { href: "/dashboard/voice", icon: Heart, color: "rose", title: "Voice Messages", desc: "Record your voice for your loved ones to cherish forever" },
              { href: "/dashboard/memories", icon: Clock, color: "amber", title: "Memory Vault", desc: "Photos, videos, and stories that tell your life's journey" },
            ].map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="group p-6 rounded-2xl border border-border bg-card hover:border-sage/40 hover:shadow-lg transition-all duration-300 block"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${
                        item.color === "sage" ? "bg-gradient-to-br from-sage/20 to-sage-light/40" :
                        item.color === "rose" ? "bg-gradient-to-br from-rose-100 to-rose-50" :
                        "bg-gradient-to-br from-amber-100 to-amber-50"
                      }`}>
                        <item.icon className={`w-6 h-6 ${
                          item.color === "sage" ? "text-sage-dark" :
                          item.color === "rose" ? "text-rose-500" :
                          "text-amber-600"
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-sage-dark transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-sage-dark group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Message Ideas - Sage themed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-sage/10 to-sage-light/20 border border-sage/20"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 text-sage" />
              Message Ideas
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "A letter to your spouse about your life together",
                "Advice for your children when they grow up",
                "A message for your child's wedding day",
                "Words of comfort for hard times",
                "Your life story and lessons learned",
                "A final goodbye and heartfelt thank you",
              ].map((idea, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <div className="w-5 h-5 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-sage-dark" />
                  </div>
                  {idea}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Instruction Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card rounded-3xl border border-sage/20 shadow-2xl overflow-hidden"
            >
              <AddInstructionForm
                onClose={() => setShowAddModal(false)}
                onSave={(instruction) => {
                  setInstructions((prev) => [...prev, { ...instruction, id: Date.now().toString() }]);
                  setShowAddModal(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddInstructionForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (instruction: Omit<Instruction, "id">) => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal" as Instruction["priority"],
    category: "first_steps" as Instruction["category"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 border-b border-sage/10 bg-gradient-to-r from-sage-light/20 to-transparent">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-foreground">Add Instruction</h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-sage/10">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-foreground">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Contact my brother first"
            className="border-sage/20 focus:border-sage focus:ring-sage/30"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-foreground">Instructions *</Label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write detailed instructions with love..."
            className="w-full p-4 rounded-xl border border-sage/20 bg-background min-h-[120px] resize-none focus:border-sage focus:ring-2 focus:ring-sage/30 transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Category</Label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(categoryLabels).map(([key, { label, icon: Icon, color, bg }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFormData({ ...formData, category: key as Instruction["category"] })}
                className={`p-3 rounded-xl border transition-all text-center ${
                  formData.category === key
                    ? "border-sage bg-sage/10 shadow-sm"
                    : "border-border hover:border-sage/50"
                }`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1 ${formData.category === key ? "text-sage-dark" : "text-muted-foreground"}`} />
                <span className={`text-xs ${formData.category === key ? "text-sage-dark font-medium" : "text-muted-foreground"}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Priority</Label>
          <div className="flex gap-2">
            {(["critical", "important", "normal"] as const).map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => setFormData({ ...formData, priority })}
                className={`flex-1 py-2.5 px-4 rounded-xl border transition-all capitalize font-medium ${
                  formData.priority === priority
                    ? priority === "critical"
                      ? "border-rose-300 bg-rose-50 text-rose-600"
                      : priority === "important"
                      ? "border-amber-300 bg-amber-50 text-amber-600"
                      : "border-sage bg-sage/10 text-sage-dark"
                    : "border-border hover:border-sage/50 text-muted-foreground"
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-sage/10 bg-gradient-to-r from-transparent to-sage-light/10 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-sage/10">
          Cancel
        </Button>
        <Button type="submit" className="bg-sage hover:bg-sage-dark text-white">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Save Instruction
        </Button>
      </div>
    </form>
  );
}

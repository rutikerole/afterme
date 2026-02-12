"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  CreditCard,
  Heart,
  RefreshCw,
  Phone,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Sparkles,
  Lock,
  Fingerprint,
  Eye,
  Zap,
  Leaf,
  Loader2,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { vaultApi, type VaultItem } from "@/lib/api";
import { toast } from "sonner";

const defaultVaultSections = [
  {
    id: "identity",
    label: "Identity Documents",
    icon: Shield,
    href: "/dashboard/vault/identity",
    description: "Store your Aadhaar, PAN, Passport & more",
    accentColor: "sage",
    items: 3,
    total: 5,
    status: "incomplete",
  },
  {
    id: "finance",
    label: "Financial Records",
    icon: CreditCard,
    href: "/dashboard/vault/finance",
    description: "Bank accounts, Loans & Investments",
    accentColor: "sage",
    items: 2,
    total: 4,
    status: "incomplete",
  },
  {
    id: "insurance",
    label: "Insurance Policies",
    icon: Heart,
    href: "/dashboard/vault/insurance",
    description: "Health, Life, Vehicle & Property insurance",
    accentColor: "rose",
    items: 0,
    total: 3,
    status: "empty",
  },
  {
    id: "subscriptions",
    label: "Subscriptions & EMIs",
    icon: RefreshCw,
    href: "/dashboard/vault/subscriptions",
    description: "Track all your recurring payments",
    accentColor: "sage",
    items: 4,
    total: 4,
    status: "complete",
  },
  {
    id: "emergency",
    label: "Emergency Contacts",
    icon: Phone,
    href: "/dashboard/vault/emergency",
    description: "People to contact in emergencies",
    accentColor: "amber",
    items: 2,
    total: 3,
    status: "incomplete",
  },
  {
    id: "nominees",
    label: "Nominees & Beneficiaries",
    icon: Users,
    href: "/dashboard/vault/nominees",
    description: "Define who gets access to what",
    accentColor: "sage",
    items: 0,
    total: 2,
    status: "empty",
  },
];

const alerts = [
  {
    type: "warning",
    message: "No nominee assigned to Life Insurance",
    action: "Add Now",
    href: "/dashboard/vault/nominees",
  },
  {
    type: "reminder",
    message: "Car insurance expires in 15 days",
    action: "View",
    href: "/dashboard/vault/insurance",
  },
  {
    type: "warning",
    message: "Emergency contact list incomplete",
    action: "Complete",
    href: "/dashboard/vault/emergency",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

// Animated counter component
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const incrementTime = (duration * 1000) / end;

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
}

// Circular Progress Component - Sage themed
function CircularProgress({ percentage, size = 120, strokeWidth = 8 }: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-sage/20"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#sageProgressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
        <defs>
          <linearGradient id="sageProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--sage))" />
            <stop offset="100%" stopColor="hsl(var(--sage-dark))" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-serif font-semibold text-sage-dark"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          {percentage}%
        </motion.span>
        <span className="text-xs text-muted-foreground">Complete</span>
      </div>
    </div>
  );
}

// Decorative Leaf Component
function FloatingLeaf({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20, rotate: -10 }}
      animate={{
        opacity: [0.4, 0.6, 0.4],
        y: [0, -10, 0],
        rotate: [-10, 10, -10]
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    >
      <Leaf className="w-full h-full text-sage/30" />
    </motion.div>
  );
}

export default function VaultPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [vaultSections, setVaultSections] = useState(defaultVaultSections);

  const exportVaultToPDF = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/export/vault");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to export");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "life-vault-export.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Vault exported successfully!");
    } catch (error) {
      console.error("Failed to export:", error);
      toast.error(error instanceof Error ? error.message : "Failed to export vault");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchVaultItems();
  }, []);

  const fetchVaultItems = async () => {
    try {
      setIsLoading(true);
      const response = await vaultApi.getAll();
      setVaultItems(response.items);

      // Count items by category
      const categoryCounts: Record<string, number> = {};
      response.items.forEach((item: VaultItem) => {
        const cat = item.category.toLowerCase();
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      // Update vault sections with real counts
      const updatedSections = defaultVaultSections.map(section => {
        const count = categoryCounts[section.id] || 0;
        let status: "complete" | "incomplete" | "empty" = "empty";
        if (count > 0 && count >= section.total) {
          status = "complete";
        } else if (count > 0) {
          status = "incomplete";
        }
        return {
          ...section,
          items: count,
          status,
        };
      });

      setVaultSections(updatedSections);
    } catch (error) {
      console.error("Failed to fetch vault items:", error);
      // Keep default sections on error
    } finally {
      setIsLoading(false);
    }
  };

  const completedItems = vaultSections.reduce((acc, s) => acc + s.items, 0);
  const totalItems = vaultSections.reduce((acc, s) => acc + s.total, 0);
  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-8 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Floating Leaves - Decorative */}
      {mounted && (
        <>
          <FloatingLeaf className="absolute -top-4 right-20 w-8 h-8" delay={0} />
          <FloatingLeaf className="absolute top-40 -left-4 w-6 h-6" delay={1.5} />
          <FloatingLeaf className="absolute top-96 right-10 w-7 h-7" delay={3} />
        </>
      )}

      {/* Hero Section - Sage Theme */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl"
      >
        {/* Sage Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sage/20 via-sage-light/30 to-background overflow-hidden">
          {/* Animated organic shapes */}
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-sage/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-80 h-80 bg-sage-light/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -20, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-200/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />

          {/* Decorative wavy lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.15]" viewBox="0 0 800 400" preserveAspectRatio="none">
            <motion.path
              d="M0,100 Q200,50 400,100 T800,100"
              fill="none"
              stroke="hsl(var(--sage))"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <motion.path
              d="M0,200 Q200,150 400,200 T800,200"
              fill="none"
              stroke="hsl(var(--sage))"
              strokeWidth="0.5"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
            />
            <motion.path
              d="M0,300 Q200,250 400,300 T800,300"
              fill="none"
              stroke="hsl(var(--sage-dark))"
              strokeWidth="0.8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, ease: "easeOut", delay: 0.6 }}
            />
          </svg>

          {/* Spinning decorative circle */}
          <svg className="absolute top-10 right-10 w-20 h-20 text-sage/20 animate-spin-slow" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
          </svg>

          {/* Floating dots */}
          {mounted && (
            <>
              <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-sage/40 rounded-full animate-float" />
              <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-sage/30 rounded-full animate-float" style={{ animationDelay: "1s" }} />
              <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-rose-300/30 rounded-full animate-float" style={{ animationDelay: "2s" }} />
            </>
          )}
        </div>

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1">
              <motion.div
                className="flex items-center gap-3 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="p-3 rounded-2xl bg-sage/20 backdrop-blur-sm border border-sage/30"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Lock className="w-6 h-6 text-sage-dark" />
                </motion.div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500/70" />
                  <span className="text-sage-dark text-sm font-medium">Secure & Encrypted</span>
                </div>
              </motion.div>

              <motion.h1
                className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Your Life <span className="text-sage">Vault</span>
              </motion.h1>

              <motion.p
                className="text-muted-foreground max-w-lg text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Keep all your important life documents organized and secure.
                Your family will thank you when they need it most.
              </motion.p>

              {/* Stats Row */}
              <motion.div
                className="flex items-center gap-6 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-sage/15 border border-sage/20">
                    <Fingerprint className="w-4 h-4 text-sage" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold"><AnimatedCounter value={completedItems} /></p>
                    <p className="text-muted-foreground text-xs">Items Added</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-sage/20" />
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-sage/15 border border-sage/20">
                    <Eye className="w-4 h-4 text-sage" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">6</p>
                    <p className="text-muted-foreground text-xs">Categories</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-sage/20" />
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Zap className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">{alerts.length}</p>
                    <p className="text-muted-foreground text-xs">Alerts</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-sage/20" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportVaultToPDF}
                  disabled={isExporting}
                  className="border-sage/30 hover:border-sage hover:bg-sage/10"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4 mr-2" />
                  )}
                  Export PDF
                </Button>
              </motion.div>
            </div>

            {/* Circular Progress */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-sage/10 rounded-full blur-xl" />
                <div className="relative bg-white/60 backdrop-blur-sm rounded-full p-4 border border-sage/20">
                  <CircularProgress percentage={completionPercentage} size={140} strokeWidth={10} />
                </div>
                {/* Decorative leaf */}
                <motion.div
                  className="absolute -top-2 -right-2 p-2 bg-sage/20 rounded-full border border-sage/30"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Leaf className="w-4 h-4 text-sage" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Alerts Section - Warm Muted Theme */}
      {alerts.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </motion.div>
            <h2 className="font-serif text-lg font-medium">Needs Attention</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium border border-amber-500/20">
              {alerts.length}
            </span>
          </div>

          <div className="grid gap-3">
            {alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.01, x: 4 }}
              >
                <Link href={alert.href}>
                  <div
                    className={`group flex items-center justify-between p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                      alert.type === "warning"
                        ? "bg-amber-50/50 border-amber-200/50 hover:border-amber-300/60"
                        : "bg-sage-light/30 border-sage/20 hover:border-sage/40"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        className={`p-2.5 rounded-xl ${
                          alert.type === "warning"
                            ? "bg-amber-100/80 border border-amber-200/50"
                            : "bg-sage/15 border border-sage/20"
                        }`}
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                      >
                        {alert.type === "warning" ? (
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-sage" />
                        )}
                      </motion.div>
                      <span className="text-sm font-medium text-foreground">{alert.message}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-sage opacity-0 group-hover:opacity-100 transition-opacity">
                      {alert.action}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Vault Sections Grid - Sage Theme with Warm Accents */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-lg font-medium">Vault Categories</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="w-4 h-4 text-sage" />
            <span>{completedItems} of {totalItems} items</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vaultSections.map((section, index) => {
            const Icon = section.icon;
            const progress = (section.items / section.total) * 100;

            // Determine accent colors based on section
            const getAccentClasses = () => {
              switch(section.accentColor) {
                case 'rose':
                  return {
                    iconBg: 'bg-rose-100/80 border-rose-200/50',
                    iconText: 'text-rose-500',
                    progressBg: 'bg-rose-400',
                    hoverBorder: 'hover:border-rose-300/50',
                    glow: 'bg-rose-200/20'
                  };
                case 'amber':
                  return {
                    iconBg: 'bg-amber-100/80 border-amber-200/50',
                    iconText: 'text-amber-600',
                    progressBg: 'bg-amber-400',
                    hoverBorder: 'hover:border-amber-300/50',
                    glow: 'bg-amber-200/20'
                  };
                default:
                  return {
                    iconBg: 'bg-sage/15 border-sage/30',
                    iconText: 'text-sage',
                    progressBg: 'bg-sage',
                    hoverBorder: 'hover:border-sage/40',
                    glow: 'bg-sage/10'
                  };
              }
            };

            const accent = getAccentClasses();

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Link href={section.href}>
                  <div className={`relative h-full p-6 rounded-3xl border border-sage/20 bg-white/60 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:shadow-xl ${accent.hoverBorder}`}>
                    {/* Background gradient on hover */}
                    <div className={`absolute inset-0 ${accent.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    {/* Animated corner decoration */}
                    <motion.div
                      className={`absolute -top-20 -right-20 w-40 h-40 rounded-full ${accent.glow} blur-2xl`}
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />

                    {/* Decorative wavy line */}
                    <svg className="absolute bottom-0 left-0 w-full h-12 opacity-[0.08]" viewBox="0 0 300 50" preserveAspectRatio="none">
                      <path d="M0,25 Q75,10 150,25 T300,25" fill="none" stroke="hsl(var(--sage))" strokeWidth="1" />
                    </svg>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      {section.status === "complete" ? (
                        <motion.span
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage/15 text-sage-dark text-xs font-medium border border-sage/30"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Complete
                        </motion.span>
                      ) : section.status === "empty" ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium border border-border/50">
                          Not Started
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-medium border border-amber-200/50">
                          <TrendingUp className="w-3.5 h-3.5" />
                          In Progress
                        </span>
                      )}
                    </div>

                    {/* Icon */}
                    <motion.div
                      className={`relative inline-flex p-4 rounded-2xl ${accent.iconBg} border mb-5`}
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={`w-7 h-7 ${accent.iconText}`} />
                    </motion.div>

                    {/* Content */}
                    <div className="relative">
                      <h3 className="font-serif text-lg font-medium mb-1.5 group-hover:text-sage-dark transition-colors">
                        {section.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-5 line-clamp-2">
                        {section.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {section.items} of {section.total} items
                          </span>
                          <span className="font-semibold text-sage-dark">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-sage/10 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${accent.progressBg}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <motion.div
                      className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    >
                      <div className="p-2 rounded-xl bg-sage/15 border border-sage/30 text-sage">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Tips - Sage Theme */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden p-8 rounded-3xl border border-sage/20 bg-gradient-to-br from-sage-light/20 via-white/40 to-transparent"
      >
        {/* Background decoration */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-sage/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        {/* Decorative wavy line */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.08]" viewBox="0 0 800 300" preserveAspectRatio="none">
          <path d="M0,150 Q200,100 400,150 T800,150" fill="none" stroke="hsl(var(--sage))" strokeWidth="1" />
        </svg>

        {/* Spinning circle decoration */}
        <svg className="absolute bottom-4 right-4 w-16 h-16 text-sage/10 animate-spin-slow" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="p-2 rounded-xl bg-sage/15 border border-sage/30"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-5 h-5 text-sage" />
            </motion.div>
            <h3 className="font-serif text-lg font-medium">Why complete your Life Vault?</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "1",
                title: "Peace of Mind",
                desc: "Your family won't panic searching for documents during emergencies",
                accentBg: "bg-sage/20",
                accentBorder: "border-sage/30",
              },
              {
                num: "2",
                title: "Never Miss Deadlines",
                desc: "Never miss insurance renewals or EMI payments again",
                accentBg: "bg-rose-100/60",
                accentBorder: "border-rose-200/50",
              },
              {
                num: "3",
                title: "Clear Instructions",
                desc: "Ensure your loved ones know exactly what to do when needed",
                accentBg: "bg-amber-100/60",
                accentBorder: "border-amber-200/50",
              },
            ].map((tip, index) => (
              <motion.div
                key={tip.num}
                className="flex items-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <motion.div
                  className={`w-10 h-10 rounded-2xl ${tip.accentBg} border ${tip.accentBorder} flex items-center justify-center flex-shrink-0`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <span className="text-sage-dark font-serif font-semibold">{tip.num}</span>
                </motion.div>
                <div>
                  <p className="font-medium mb-1">{tip.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {tip.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

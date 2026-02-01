"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Plus,
  Tv,
  Music,
  Cloud,
  CreditCard,
  Wifi,
  Smartphone,
  Dumbbell,
  Newspaper,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Calendar,
  IndianRupee,
  AlertCircle,
  Pause,
  Play,
  Sparkles,
  TrendingUp,
  Zap,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SubscriptionCategory = "streaming" | "music" | "cloud" | "utility" | "fitness" | "news" | "emi" | "other";

interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  amount: number;
  frequency: "monthly" | "quarterly" | "yearly";
  nextBillingDate: string;
  paymentMethod: string;
  isActive: boolean;
  autoRenew: boolean;
  notes?: string;
}

// Sage-themed category types with warm accents
const categoryTypes = [
  { id: "streaming", name: "Streaming", icon: Tv, accentType: "rose" },
  { id: "music", name: "Music", icon: Music, accentType: "sage" },
  { id: "cloud", name: "Cloud Storage", icon: Cloud, accentType: "sage" },
  { id: "utility", name: "Utility / Bills", icon: Wifi, accentType: "amber" },
  { id: "fitness", name: "Fitness", icon: Dumbbell, accentType: "sage" },
  { id: "news", name: "News / Magazine", icon: Newspaper, accentType: "sage" },
  { id: "emi", name: "EMI / Loan", icon: CreditCard, accentType: "amber" },
  { id: "other", name: "Other", icon: Smartphone, accentType: "sage" },
];

const getAccentStyles = (accentType: string) => {
  switch (accentType) {
    case 'rose':
      return {
        iconBg: 'bg-rose-100/80 border border-rose-200/50',
        iconText: 'text-rose-500',
        bgLight: 'bg-rose-50/50',
      };
    case 'amber':
      return {
        iconBg: 'bg-amber-100/80 border border-amber-200/50',
        iconText: 'text-amber-600',
        bgLight: 'bg-amber-50/50',
      };
    default:
      return {
        iconBg: 'bg-sage/15 border border-sage/30',
        iconText: 'text-sage',
        bgLight: 'bg-sage-light/30',
      };
  }
};

const initialSubscriptions: Subscription[] = [
  {
    id: "1",
    name: "Netflix",
    category: "streaming",
    amount: 649,
    frequency: "monthly",
    nextBillingDate: "2025-02-15",
    paymentMethod: "HDFC Credit Card",
    isActive: true,
    autoRenew: true,
  },
  {
    id: "2",
    name: "Spotify Premium",
    category: "music",
    amount: 119,
    frequency: "monthly",
    nextBillingDate: "2025-02-10",
    paymentMethod: "UPI Auto-pay",
    isActive: true,
    autoRenew: true,
  },
  {
    id: "3",
    name: "iCloud Storage",
    category: "cloud",
    amount: 75,
    frequency: "monthly",
    nextBillingDate: "2025-02-05",
    paymentMethod: "Apple Pay",
    isActive: true,
    autoRenew: true,
  },
  {
    id: "4",
    name: "Electricity Bill",
    category: "utility",
    amount: 2500,
    frequency: "monthly",
    nextBillingDate: "2025-02-20",
    paymentMethod: "Bank Auto-debit",
    isActive: true,
    autoRenew: true,
    notes: "Average bill amount, varies monthly",
  },
  {
    id: "5",
    name: "Car Loan EMI",
    category: "emi",
    amount: 18500,
    frequency: "monthly",
    nextBillingDate: "2025-02-05",
    paymentMethod: "Bank Auto-debit",
    isActive: true,
    autoRenew: true,
    notes: "36 EMIs remaining",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100 },
  },
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SubscriptionCategory | null>(null);
  const [filterCategory, setFilterCategory] = useState<"all" | SubscriptionCategory>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryInfo = (category: SubscriptionCategory) => {
    return categoryTypes.find((c) => c.id === category) || categoryTypes[7];
  };

  const getDaysUntilBilling = (billingDate: string) => {
    const billing = new Date(billingDate);
    const today = new Date();
    return Math.ceil((billing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const toggleActive = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, isActive: !sub.isActive } : sub))
    );
  };

  const filteredSubscriptions =
    filterCategory === "all"
      ? subscriptions
      : subscriptions.filter((s) => s.category === filterCategory);

  const monthlyTotal = subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => {
      const multiplier = s.frequency === "yearly" ? 1 / 12 : s.frequency === "quarterly" ? 1 / 3 : 1;
      return sum + s.amount * multiplier;
    }, 0);

  const yearlyTotal = monthlyTotal * 12;

  const upcomingBills = subscriptions
    .filter((s) => s.isActive && getDaysUntilBilling(s.nextBillingDate) <= 7 && getDaysUntilBilling(s.nextBillingDate) >= 0)
    .sort((a, b) => getDaysUntilBilling(a.nextBillingDate) - getDaysUntilBilling(b.nextBillingDate));

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-8 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Floating Leaves */}
      {mounted && (
        <>
          <motion.div
            className="absolute -top-4 right-16 w-8 h-8"
            animate={{ y: [0, -10, 0], rotate: [-10, 10, -10], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <Leaf className="w-full h-full text-sage/30" />
          </motion.div>
          <motion.div
            className="absolute top-80 -left-4 w-6 h-6"
            animate={{ y: [0, -8, 0], rotate: [10, -10, 10], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
          >
            <Leaf className="w-full h-full text-sage/25" />
          </motion.div>
        </>
      )}

      {/* Header - Sage Theme */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-sage/20 via-sage-light/30 to-background" />
        <motion.div
          className="absolute top-0 right-0 w-72 h-72 bg-sage/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-56 h-56 bg-sage-light/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />

        {/* Decorative wavy lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.1]" viewBox="0 0 600 200" preserveAspectRatio="none">
          <motion.path
            d="M0,100 Q150,50 300,100 T600,100"
            fill="none"
            stroke="hsl(var(--sage))"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </svg>

        {/* Spinning circle */}
        <svg className="absolute top-4 right-4 w-16 h-16 text-sage/15 animate-spin-slow" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>

        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="p-4 rounded-2xl bg-sage/20 backdrop-blur-sm border border-sage/30"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <RefreshCw className="w-8 h-8 text-sage-dark" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-serif text-2xl font-medium text-foreground">
                    Subscriptions & <span className="text-sage">EMIs</span>
                  </h1>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="w-5 h-5 text-amber-500/70" />
                  </motion.div>
                </div>
                <p className="text-muted-foreground">
                  Track all your recurring payments in one place
                </p>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowAddModal(true)}
                className="gap-2 bg-sage hover:bg-sage-dark text-white shadow-lg shadow-sage/20"
              >
                <Plus className="w-4 h-4" />
                Add Subscription
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards - Sage Theme */}
      <motion.div
        variants={itemVariants}
        className="grid md:grid-cols-3 gap-5"
      >
        <motion.div
          className="relative p-6 rounded-3xl border border-sage/20 bg-white/60 backdrop-blur-sm overflow-hidden"
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <motion.div
            className="absolute -top-10 -right-10 w-32 h-32 bg-sage/15 rounded-full blur-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <svg className="absolute bottom-0 left-0 w-full h-8 opacity-[0.08]" viewBox="0 0 200 30" preserveAspectRatio="none">
            <path d="M0,15 Q50,5 100,15 T200,15" fill="none" stroke="hsl(var(--sage))" strokeWidth="1" />
          </svg>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sage/15 border border-sage/30">
                  <Calendar className="w-5 h-5 text-sage" />
                </div>
                <span className="text-sm font-medium text-sage-dark">Monthly Spend</span>
              </div>
            </div>
            <p className="text-3xl font-serif font-semibold text-sage-dark">{formatCurrency(monthlyTotal)}</p>
          </div>
        </motion.div>

        <motion.div
          className="relative p-6 rounded-3xl border border-rose-200/50 bg-rose-50/30 backdrop-blur-sm overflow-hidden"
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <motion.div
            className="absolute -top-10 -right-10 w-32 h-32 bg-rose-200/30 rounded-full blur-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          />
          <svg className="absolute bottom-0 left-0 w-full h-8 opacity-[0.08]" viewBox="0 0 200 30" preserveAspectRatio="none">
            <path d="M0,15 Q50,5 100,15 T200,15" fill="none" stroke="hsl(var(--sage))" strokeWidth="1" />
          </svg>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-100/80 border border-rose-200/50">
                  <TrendingUp className="w-5 h-5 text-rose-500" />
                </div>
                <span className="text-sm font-medium text-rose-600">Yearly Total</span>
              </div>
            </div>
            <p className="text-3xl font-serif font-semibold text-rose-600">{formatCurrency(yearlyTotal)}</p>
          </div>
        </motion.div>

        <motion.div
          className="relative p-6 rounded-3xl border border-sage/30 bg-sage-light/20 backdrop-blur-sm overflow-hidden"
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <motion.div
            className="absolute -top-10 -right-10 w-32 h-32 bg-sage/20 rounded-full blur-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          />
          <svg className="absolute bottom-0 left-0 w-full h-8 opacity-[0.08]" viewBox="0 0 200 30" preserveAspectRatio="none">
            <path d="M0,15 Q50,5 100,15 T200,15" fill="none" stroke="hsl(var(--sage))" strokeWidth="1" />
          </svg>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sage/20 border border-sage/30">
                  <Zap className="w-5 h-5 text-sage" />
                </div>
                <span className="text-sm font-medium text-sage-dark">Active</span>
              </div>
            </div>
            <p className="text-3xl font-serif font-semibold text-sage-dark">{subscriptions.filter((s) => s.isActive).length}</p>
            <p className="text-xs text-muted-foreground mt-1">subscriptions</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Upcoming Bills Alert - Amber Theme */}
      {upcomingBills.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden p-5 rounded-3xl border border-amber-200/50 bg-amber-50/30 backdrop-blur-sm"
        >
          <motion.div
            className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <svg className="absolute bottom-0 left-0 w-full h-8 opacity-[0.08]" viewBox="0 0 400 30" preserveAspectRatio="none">
            <path d="M0,15 Q100,5 200,15 T400,15" fill="none" stroke="hsl(var(--sage))" strokeWidth="1" />
          </svg>
          <div className="relative flex items-start gap-4">
            <motion.div
              className="p-3 rounded-2xl bg-amber-100/80 border border-amber-200/50"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </motion.div>
            <div className="flex-1">
              <p className="font-serif font-medium text-amber-700 text-lg">Upcoming Bills This Week</p>
              <div className="mt-3 space-y-2">
                {upcomingBills.map((bill, index) => (
                  <motion.div
                    key={bill.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-100/50 border border-amber-200/50"
                  >
                    <span className="font-medium text-amber-700">
                      {bill.name} - {formatCurrency(bill.amount)}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-200/50 text-amber-700 text-sm font-medium">
                      {getDaysUntilBilling(bill.nextBillingDate) === 0
                        ? "Today"
                        : `in ${getDaysUntilBilling(bill.nextBillingDate)} days`}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Filter - Sage Theme */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        <motion.button
          onClick={() => setFilterCategory("all")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
            filterCategory === "all"
              ? "bg-sage text-white shadow-lg shadow-sage/25"
              : "bg-white/60 hover:bg-sage-light/30 border border-sage/20"
          }`}
        >
          All ({subscriptions.length})
        </motion.button>
        {categoryTypes.map((cat) => {
          const count = subscriptions.filter((s) => s.category === cat.id).length;
          if (count === 0) return null;
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id as SubscriptionCategory)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
                filterCategory === cat.id
                  ? "bg-sage text-white shadow-lg shadow-sage/25"
                  : "bg-white/60 hover:bg-sage-light/30 border border-sage/20"
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.name} ({count})
            </motion.button>
          );
        })}
      </motion.div>

      {/* Subscriptions List - Sage Theme */}
      <motion.div variants={itemVariants} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredSubscriptions.map((subscription, index) => {
            const catInfo = getCategoryInfo(subscription.category);
            const Icon = catInfo.icon;
            const accent = getAccentStyles(catInfo.accentType);
            const daysUntil = getDaysUntilBilling(subscription.nextBillingDate);

            return (
              <motion.div
                key={subscription.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, x: -100 }}
                transition={{ delay: index * 0.05, type: "spring" }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="group"
              >
                <div className={`relative p-6 rounded-3xl border bg-white/60 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  subscription.isActive
                    ? "border-sage/20 hover:border-sage/40"
                    : "border-border/30 opacity-60"
                }`}>
                  {/* Background gradient */}
                  <div className={`absolute inset-0 ${accent.bgLight} opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />

                  {/* Decorative corner */}
                  <motion.div
                    className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-sage/10 blur-2xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />

                  {/* Decorative wavy line */}
                  <svg className="absolute bottom-0 left-0 w-full h-8 opacity-[0.06]" viewBox="0 0 400 30" preserveAspectRatio="none">
                    <path d="M0,15 Q100,5 200,15 T400,15" fill="none" stroke="hsl(var(--sage))" strokeWidth="1" />
                  </svg>

                  <div className="relative flex items-start justify-between">
                    <div className="flex items-start gap-5">
                      <motion.div
                        className={`p-4 rounded-2xl ${accent.iconBg} ${!subscription.isActive && "opacity-50"}`}
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className={`w-7 h-7 ${accent.iconText}`} />
                      </motion.div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-serif text-xl font-medium">{subscription.name}</h3>
                            {!subscription.isActive && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                Paused
                              </span>
                            )}
                            {subscription.autoRenew && subscription.isActive && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sage/15 text-sage-dark border border-sage/30">
                                Auto-renew
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sage/15 border border-sage/30">
                            <IndianRupee className="w-4 h-4 text-sage" />
                            <span className="font-bold text-sage-dark">
                              {formatCurrency(subscription.amount)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              /{subscription.frequency.slice(0, 3)}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            via {subscription.paymentMethod}
                          </span>
                        </div>

                        <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl w-fit ${
                          daysUntil <= 3
                            ? "bg-amber-50 text-amber-600 border border-amber-200/50"
                            : "bg-sage-light/30 text-muted-foreground border border-sage/20"
                        }`}>
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">
                            Next billing:{" "}
                            {daysUntil === 0
                              ? "Today"
                              : daysUntil === 1
                              ? "Tomorrow"
                              : `${new Date(subscription.nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                          </span>
                        </div>

                        {subscription.notes && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                            {subscription.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(subscription.id)}
                          className={`h-10 w-10 p-0 rounded-xl ${subscription.isActive ? "text-amber-500 hover:bg-amber-50" : "text-sage hover:bg-sage/10"}`}
                        >
                          {subscription.isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-sage/10"
                        >
                          <Edit2 className="w-4 h-4 text-sage" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                          onClick={() => setSubscriptions((prev) => prev.filter((s) => s.id !== subscription.id))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredSubscriptions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-sage/15 border border-sage/30 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <RefreshCw className="w-12 h-12 text-sage" />
            </motion.div>
            <h3 className="font-serif text-xl font-medium mb-2">No subscriptions yet</h3>
            <p className="text-muted-foreground mb-6">
              Track your recurring payments here
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setShowAddModal(true)} size="lg" className="gap-2 bg-sage hover:bg-sage-dark">
                <Plus className="w-4 h-4" />
                Add Your First Subscription
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Add Modal - Sage Theme */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
            onClick={() => {
              setShowAddModal(false);
              setSelectedCategory(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card rounded-3xl border border-sage/20 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {!selectedCategory ? (
                <>
                  <div className="p-6 border-b border-sage/20 bg-gradient-to-r from-sage-light/30 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-sage/15 border border-sage/30">
                          <Plus className="w-5 h-5 text-sage" />
                        </div>
                        <div>
                          <h2 className="font-serif text-xl font-medium">Add Subscription</h2>
                          <p className="text-sm text-muted-foreground">Choose category</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)} className="h-10 w-10 p-0 rounded-xl hover:bg-sage/10">
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-2 gap-3">
                    {categoryTypes.map((cat, index) => {
                      const Icon = cat.icon;
                      const accent = getAccentStyles(cat.accentType);
                      return (
                        <motion.button
                          key={cat.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedCategory(cat.id as SubscriptionCategory)}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="group flex items-center gap-3 p-4 rounded-2xl border border-sage/20 hover:border-sage/40 hover:bg-sage-light/20 transition-all text-left"
                        >
                          <motion.div
                            className={`p-3 rounded-xl ${accent.iconBg}`}
                            whileHover={{ rotate: [0, -5, 5, 0] }}
                          >
                            <Icon className={`w-5 h-5 ${accent.iconText}`} />
                          </motion.div>
                          <span className="font-medium group-hover:text-sage-dark transition-colors">{cat.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <AddSubscriptionForm
                  category={selectedCategory}
                  onClose={() => {
                    setShowAddModal(false);
                    setSelectedCategory(null);
                  }}
                  onSave={(sub) => {
                    setSubscriptions((prev) => [...prev, { ...sub, id: Date.now().toString() }]);
                    setShowAddModal(false);
                    setSelectedCategory(null);
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AddSubscriptionForm({
  category,
  onClose,
  onSave,
}: {
  category: SubscriptionCategory;
  onClose: () => void;
  onSave: (sub: Omit<Subscription, "id">) => void;
}) {
  const catInfo = categoryTypes.find((c) => c.id === category)!;
  const Icon = catInfo.icon;
  const accent = getAccentStyles(catInfo.accentType);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    frequency: "monthly" as "monthly" | "quarterly" | "yearly",
    nextBillingDate: "",
    paymentMethod: "",
    autoRenew: true,
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      category,
      amount: parseFloat(formData.amount) || 0,
      frequency: formData.frequency,
      nextBillingDate: formData.nextBillingDate,
      paymentMethod: formData.paymentMethod,
      isActive: true,
      autoRenew: formData.autoRenew,
      notes: formData.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 border-b border-sage/20 bg-gradient-to-r from-sage-light/30 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className={`p-3 rounded-xl ${accent.iconBg}`}
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              <Icon className={`w-5 h-5 ${accent.iconText}`} />
            </motion.div>
            <div>
              <h2 className="font-serif text-xl font-medium">Add {catInfo.name}</h2>
              <p className="text-sm text-muted-foreground">Enter details</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0 rounded-xl hover:bg-sage/10">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Netflix, Spotify"
            required
            className="h-12 rounded-xl border-sage/30 focus:border-sage"
          />
        </motion.div>

        <motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="649"
              required
              className="h-12 rounded-xl border-sage/30 focus:border-sage"
            />
          </div>
          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="flex gap-1">
              {(["monthly", "quarterly", "yearly"] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFormData({ ...formData, frequency: freq })}
                  className={`flex-1 py-3 rounded-xl text-xs font-medium transition-all ${
                    formData.frequency === freq
                      ? "bg-sage text-white shadow-lg shadow-sage/25"
                      : "bg-sage-light/30 hover:bg-sage-light/50 border border-sage/20"
                  }`}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1, 3)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="space-y-2">
            <Label htmlFor="nextBillingDate">Next Billing Date *</Label>
            <Input
              id="nextBillingDate"
              type="date"
              value={formData.nextBillingDate}
              onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
              required
              className="h-12 rounded-xl border-sage/30 focus:border-sage"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Input
              id="paymentMethod"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              placeholder="e.g., HDFC Card"
              className="h-12 rounded-xl border-sage/30 focus:border-sage"
            />
          </div>
        </motion.div>

        <motion.div
          className="flex items-center justify-between p-4 rounded-2xl bg-sage-light/30 border border-sage/20"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div>
            <p className="font-medium">Auto-Renew</p>
            <p className="text-sm text-muted-foreground">Automatically renews each cycle</p>
          </div>
          <motion.button
            type="button"
            onClick={() => setFormData({ ...formData, autoRenew: !formData.autoRenew })}
            className={`w-14 h-7 rounded-full transition-colors ${formData.autoRenew ? "bg-sage" : "bg-muted"}`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-6 h-6 rounded-full bg-white shadow-lg"
              animate={{ x: formData.autoRenew ? 28 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </motion.div>

        <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional details..."
            className="h-12 rounded-xl border-sage/30 focus:border-sage"
          />
        </motion.div>
      </div>

      <div className="p-6 border-t border-sage/20 flex justify-end gap-3 bg-sage-light/20">
        <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" className="rounded-xl gap-2 bg-sage hover:bg-sage-dark">
            <CheckCircle2 className="w-4 h-4" />
            Save Subscription
          </Button>
        </motion.div>
      </div>
    </form>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SubscriptionCategory = "streaming" | "software" | "membership" | "utility" | "other";

interface Subscription {
  id: string;
  name: string;
  serviceName: string;
  category: SubscriptionCategory;
  amount: number | null;
  currency: string;
  billingCycle: "monthly" | "quarterly" | "annually" | null;
  nextBillingDate: string | null;
  accountEmail: string | null;
  website: string | null;
  cancellationUrl: string | null;
  cancellationInstructions: string | null;
  isAutoRenew: boolean;
}

const categoryTypes = [
  { id: "streaming", name: "Streaming", icon: Tv, accentType: "rose" },
  { id: "software", name: "Software", icon: Cloud, accentType: "sage" },
  { id: "membership", name: "Membership", icon: Dumbbell, accentType: "sage" },
  { id: "utility", name: "Utility / Bills", icon: Wifi, accentType: "amber" },
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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SubscriptionCategory | null>(null);
  const [filterCategory, setFilterCategory] = useState<"all" | SubscriptionCategory>("all");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ monthlySpend: 0, total: 0 });

  const fetchSubscriptions = useCallback(async () => {
    try {
      const res = await fetch("/api/vault/subscriptions");
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
        setStats({
          monthlySpend: data.stats?.monthlySpend || 0,
          total: data.stats?.total || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryInfo = (category: SubscriptionCategory) => {
    return categoryTypes.find((c) => c.id === category) || categoryTypes[4];
  };

  const getDaysUntilBilling = (billingDate: string | null) => {
    if (!billingDate) return 999;
    const billing = new Date(billingDate);
    const today = new Date();
    return Math.ceil((billing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const deleteSubscription = async (id: string) => {
    try {
      const res = await fetch(`/api/vault/subscriptions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchSubscriptions();
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
    }
  };

  const filteredSubscriptions =
    filterCategory === "all"
      ? subscriptions
      : subscriptions.filter((s) => s.category === filterCategory);

  const monthlyTotal = stats.monthlySpend;
  const yearlyTotal = monthlyTotal * 12;

  const upcomingBills = subscriptions
    .filter((s) => s.nextBillingDate && getDaysUntilBilling(s.nextBillingDate) <= 7 && getDaysUntilBilling(s.nextBillingDate) >= 0)
    .sort((a, b) => getDaysUntilBilling(a.nextBillingDate) - getDaysUntilBilling(b.nextBillingDate));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-sage" />
      </div>
    );
  }

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
        </>
      )}

      {/* Header */}
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
                    Subscriptions & <span className="text-sage">Bills</span>
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

      {/* Summary Cards */}
      <motion.div
        variants={itemVariants}
        className="grid md:grid-cols-3 gap-5"
      >
        <motion.div
          className="relative p-6 rounded-3xl border border-sage/20 bg-white/60 backdrop-blur-sm overflow-hidden"
          whileHover={{ y: -4, scale: 1.02 }}
        >
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
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sage/20 border border-sage/30">
                  <Zap className="w-5 h-5 text-sage" />
                </div>
                <span className="text-sm font-medium text-sage-dark">Active</span>
              </div>
            </div>
            <p className="text-3xl font-serif font-semibold text-sage-dark">{subscriptions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">subscriptions</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Upcoming Bills Alert */}
      {upcomingBills.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden p-5 rounded-3xl border border-amber-200/50 bg-amber-50/30 backdrop-blur-sm"
        >
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
                      {bill.serviceName} - {formatCurrency(bill.amount)}
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

      {/* Category Filter */}
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

      {/* Subscriptions List */}
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
                <div className="relative p-6 rounded-3xl border bg-white/60 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-xl border-sage/20 hover:border-sage/40">
                  {/* Background gradient */}
                  <div className={`absolute inset-0 ${accent.bgLight} opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />

                  <div className="relative flex items-start justify-between">
                    <div className="flex items-start gap-5">
                      <motion.div
                        className={`p-4 rounded-2xl ${accent.iconBg}`}
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className={`w-7 h-7 ${accent.iconText}`} />
                      </motion.div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-serif text-xl font-medium">{subscription.serviceName}</h3>
                            {subscription.isAutoRenew && (
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
                              /{subscription.billingCycle?.slice(0, 3) || "mo"}
                            </span>
                          </div>
                        </div>

                        {subscription.nextBillingDate && (
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
                                : new Date(subscription.nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                          onClick={() => deleteSubscription(subscription.id)}
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

      {/* Add Modal */}
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
                  onSave={() => {
                    setShowAddModal(false);
                    setSelectedCategory(null);
                    fetchSubscriptions();
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
  onSave: () => void;
}) {
  const catInfo = categoryTypes.find((c) => c.id === category)!;
  const Icon = catInfo.icon;
  const accent = getAccentStyles(catInfo.accentType);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    serviceName: "",
    amount: "",
    billingCycle: "monthly" as "monthly" | "quarterly" | "annually",
    nextBillingDate: "",
    accountEmail: "",
    website: "",
    isAutoRenew: true,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/vault/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.serviceName,
          serviceName: formData.serviceName,
          category,
          amount: parseFloat(formData.amount) || null,
          billingCycle: formData.billingCycle,
          nextBillingDate: formData.nextBillingDate || null,
          accountEmail: formData.accountEmail || null,
          website: formData.website || null,
          isAutoRenew: formData.isAutoRenew,
          notes: formData.notes || null,
        }),
      });

      if (res.ok) {
        onSave();
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
    } finally {
      setSaving(false);
    }
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
          <Label htmlFor="serviceName">Service Name *</Label>
          <Input
            id="serviceName"
            value={formData.serviceName}
            onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
            placeholder="e.g., Netflix, Spotify"
            required
            className="h-12 rounded-xl border-sage/30 focus:border-sage"
          />
        </motion.div>

        <motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="649"
              className="h-12 rounded-xl border-sage/30 focus:border-sage"
            />
          </div>
          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="flex gap-1">
              {(["monthly", "quarterly", "annually"] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFormData({ ...formData, billingCycle: freq })}
                  className={`flex-1 py-3 rounded-xl text-xs font-medium transition-all ${
                    formData.billingCycle === freq
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

        <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Label htmlFor="nextBillingDate">Next Billing Date</Label>
          <Input
            id="nextBillingDate"
            type="date"
            value={formData.nextBillingDate}
            onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
            className="h-12 rounded-xl border-sage/30 focus:border-sage"
          />
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
            onClick={() => setFormData({ ...formData, isAutoRenew: !formData.isAutoRenew })}
            className={`w-14 h-7 rounded-full transition-colors ${formData.isAutoRenew ? "bg-sage" : "bg-muted"}`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-6 h-6 rounded-full bg-white shadow-lg"
              animate={{ x: formData.isAutoRenew ? 28 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </motion.div>
      </div>

      <div className="p-6 border-t border-sage/20 flex justify-end gap-3 bg-sage-light/20">
        <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" className="rounded-xl gap-2 bg-sage hover:bg-sage-dark" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Save Subscription
          </Button>
        </motion.div>
      </div>
    </form>
  );
}

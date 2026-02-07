"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Plus,
  Shield,
  Car,
  Home,
  Plane,
  Users,
  Edit2,
  Trash2,
  Calendar,
  IndianRupee,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  FileText,
  Building2,
  Umbrella,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";

type InsuranceType = "health" | "life" | "auto" | "home" | "travel" | "other";

interface InsurancePolicy {
  id: string;
  type: InsuranceType;
  name: string;
  provider: string;
  policyNumber?: string;
  policyNumberMasked?: string;
  coverageAmount?: number;
  premium?: number;
  premiumFrequency?: "monthly" | "quarterly" | "annually";
  startDate?: string;
  endDate?: string;
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  isExpiringSoon?: boolean;
  isExpired?: boolean;
  nominees?: Array<{
    id: string;
    name: string;
    relationship: string;
    sharePercentage?: number;
  }>;
  notes?: string;
}

// Sage-themed insurance types with warm accents
const insuranceTypes = [
  { id: "health", name: "Health Insurance", icon: Heart, accentType: "rose" },
  { id: "life", name: "Life Insurance", icon: Shield, accentType: "sage" },
  { id: "auto", name: "Vehicle Insurance", icon: Car, accentType: "sage" },
  { id: "home", name: "Home Insurance", icon: Home, accentType: "amber" },
  { id: "travel", name: "Travel Insurance", icon: Plane, accentType: "sage" },
  { id: "other", name: "Other Insurance", icon: Umbrella, accentType: "sage" },
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

export default function InsurancePage() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<InsuranceType | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | InsuranceType>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vault/insurance");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPolicies(data.items || []);
    } catch (error) {
      console.error("Error fetching policies:", error);
      toast.error("Failed to load insurance policies");
    } finally {
      setLoading(false);
    }
  };

  const savePolicy = async (policy: Omit<InsurancePolicy, "id">) => {
    setSaving(true);
    try {
      const res = await fetch("/api/vault/insurance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Policy saved successfully!");
      fetchPolicies();
      setShowAddModal(false);
      setSelectedType(null);
    } catch (error) {
      console.error("Error saving policy:", error);
      toast.error("Failed to save policy");
    } finally {
      setSaving(false);
    }
  };

  const deletePolicy = async (id: string) => {
    try {
      const res = await fetch(`/api/vault/insurance/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Policy deleted");
      setPolicies((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting policy:", error);
      toast.error("Failed to delete policy");
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeInfo = (type: InsuranceType) => {
    return insuranceTypes.find((i) => i.id === type) || insuranceTypes[5];
  };

  const isExpiringSoon = (date: string) => {
    const expiry = new Date(date);
    const today = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 30 && daysLeft > 0;
  };

  const isExpired = (date: string) => {
    return new Date(date) < new Date();
  };

  const getDaysLeft = (date: string) => {
    const expiry = new Date(date);
    const today = new Date();
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const filteredPolicies =
    activeTab === "all" ? policies : policies.filter((p) => p.type === activeTab);

  const totalCoverage = policies.reduce((sum, p) => sum + p.sumInsured, 0);
  const totalPremium = policies.reduce((sum, p) => sum + p.premium, 0);
  const expiringSoonCount = policies.filter((p) => isExpiringSoon(p.expiryDate)).length;

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
          className="absolute bottom-0 left-0 w-56 h-56 bg-rose-200/20 rounded-full blur-3xl"
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
                className="p-4 rounded-2xl bg-rose-100/80 border border-rose-200/50 backdrop-blur-sm"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Heart className="w-8 h-8 text-rose-500" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-serif text-2xl font-medium text-foreground">
                    Insurance <span className="text-sage">Policies</span>
                  </h1>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="w-5 h-5 text-amber-500/70" />
                  </motion.div>
                </div>
                <p className="text-muted-foreground">
                  Track all your insurance policies in one place
                </p>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowAddModal(true)}
                className="gap-2 bg-sage hover:bg-sage-dark text-white shadow-lg shadow-sage/20"
              >
                <Plus className="w-4 h-4" />
                Add Policy
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
        {/* Total Coverage */}
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
                  <Shield className="w-5 h-5 text-sage" />
                </div>
                <span className="text-sm font-medium text-sage-dark">Total Coverage</span>
              </div>
            </div>
            <p className="text-3xl font-serif font-semibold text-sage-dark">{formatCurrency(totalCoverage)}</p>
            <p className="text-xs text-muted-foreground mt-1">{policies.length} active policies</p>
          </div>
        </motion.div>

        {/* Annual Premium */}
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
                  <IndianRupee className="w-5 h-5 text-rose-500" />
                </div>
                <span className="text-sm font-medium text-rose-600">Annual Premium</span>
              </div>
            </div>
            <p className="text-3xl font-serif font-semibold text-rose-600">{formatCurrency(totalPremium)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total yearly outgo</p>
          </div>
        </motion.div>

        {/* Expiring Soon */}
        <motion.div
          className={`relative p-6 rounded-3xl border overflow-hidden ${
            expiringSoonCount > 0
              ? "border-amber-200/50 bg-amber-50/30"
              : "border-sage/30 bg-sage-light/20"
          } backdrop-blur-sm`}
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <motion.div
            className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl ${
              expiringSoonCount > 0 ? "bg-amber-200/30" : "bg-sage/15"
            }`}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          />
          <svg className="absolute bottom-0 left-0 w-full h-8 opacity-[0.08]" viewBox="0 0 200 30" preserveAspectRatio="none">
            <path d="M0,15 Q50,5 100,15 T200,15" fill="none" stroke="hsl(var(--sage))" strokeWidth="1" />
          </svg>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${expiringSoonCount > 0 ? "bg-amber-100/80 border border-amber-200/50" : "bg-sage/15 border border-sage/30"}`}>
                  <Clock className={`w-5 h-5 ${expiringSoonCount > 0 ? "text-amber-600" : "text-sage"}`} />
                </div>
                <span className={`text-sm font-medium ${expiringSoonCount > 0 ? "text-amber-700" : "text-sage-dark"}`}>
                  Expiring Soon
                </span>
              </div>
              {expiringSoonCount > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </motion.div>
              )}
            </div>
            <p className={`text-3xl font-serif font-semibold ${expiringSoonCount > 0 ? "text-amber-700" : "text-sage-dark"}`}>
              {expiringSoonCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {expiringSoonCount > 0 ? "Needs renewal" : "All policies active"}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Filter Tabs - Sage Theme */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        <motion.button
          onClick={() => setActiveTab("all")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === "all"
              ? "bg-sage text-white shadow-lg shadow-sage/25"
              : "bg-white/60 hover:bg-sage-light/30 border border-sage/20"
          }`}
        >
          All ({policies.length})
        </motion.button>
        {insuranceTypes.map((type) => {
          const count = policies.filter((p) => p.type === type.id).length;
          if (count === 0) return null;
          const Icon = type.icon;
          return (
            <motion.button
              key={type.id}
              onClick={() => setActiveTab(type.id as InsuranceType)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === type.id
                  ? "bg-sage text-white shadow-lg shadow-sage/25"
                  : "bg-white/60 hover:bg-sage-light/30 border border-sage/20"
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.name.replace(" Insurance", "")} ({count})
            </motion.button>
          );
        })}
      </motion.div>

      {/* Policies List - Sage Theme */}
      <motion.div variants={itemVariants} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredPolicies.map((policy, index) => {
            const typeInfo = getTypeInfo(policy.type);
            const Icon = typeInfo.icon;
            const accent = getAccentStyles(typeInfo.accentType);
            const expiringSoon = isExpiringSoon(policy.expiryDate);
            const expired = isExpired(policy.expiryDate);
            const daysLeft = getDaysLeft(policy.expiryDate);

            return (
              <motion.div
                key={policy.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, x: -100 }}
                transition={{ delay: index * 0.05, type: "spring" }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="group"
              >
                <div className="relative p-6 rounded-3xl border border-sage/20 bg-white/60 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-sage/40">
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

                  {/* Expiry Warning Banner */}
                  {(expired || expiringSoon) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute top-0 left-0 right-0 py-2 px-4 text-center text-xs font-medium ${
                        expired
                          ? "bg-red-50 text-red-500 border-b border-red-200/50"
                          : "bg-amber-50 text-amber-600 border-b border-amber-200/50"
                      }`}
                    >
                      {expired ? (
                        <span className="flex items-center justify-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Policy Expired - Renew immediately
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          Expires in {daysLeft} days - Renew soon
                        </span>
                      )}
                    </motion.div>
                  )}

                  <div className={`relative flex items-start justify-between ${(expired || expiringSoon) ? "mt-6" : ""}`}>
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
                            <h3 className="font-serif text-xl font-medium">{policy.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${accent.bgLight} ${accent.iconText}`}>
                              {typeInfo.name.replace(" Insurance", "")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {policy.provider}
                            <span className="text-muted-foreground/50">•</span>
                            <FileText className="w-3.5 h-3.5" />
                            {policy.policyNumber}
                          </p>
                        </div>

                        {/* Financial Details */}
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sage/15 border border-sage/30">
                            <Shield className="w-4 h-4 text-sage" />
                            <span className="text-sm font-semibold text-sage-dark">
                              Cover: {formatCurrency(policy.sumInsured)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200/50">
                            <IndianRupee className="w-4 h-4 text-rose-500" />
                            <span className="text-sm font-semibold text-rose-600">
                              {formatCurrency(policy.premium)}/{policy.premiumFrequency === "yearly" ? "yr" : policy.premiumFrequency === "monthly" ? "mo" : "qtr"}
                            </span>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Start: {new Date(policy.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>
                          <div className={`flex items-center gap-2 ${expired ? "text-red-500" : expiringSoon ? "text-amber-600" : "text-muted-foreground"}`}>
                            <Calendar className="w-4 h-4" />
                            <span>Expires: {new Date(policy.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>
                        </div>

                        {/* Nominee */}
                        {policy.nominee ? (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4 text-sage" />
                            Nominee: {policy.nominee}
                          </p>
                        ) : (
                          <motion.div
                            className="flex items-center gap-2 text-amber-600 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertTriangle className="w-4 h-4" />
                            No nominee assigned
                          </motion.div>
                        )}

                        {policy.notes && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                            {policy.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-xl hover:bg-sage/10"
                        >
                          <Edit2 className="w-4 h-4 text-sage" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => setPolicies((prev) => prev.filter((p) => p.id !== policy.id))}
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

        {filteredPolicies.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-rose-50 border border-rose-200/50 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Heart className="w-12 h-12 text-rose-400" />
            </motion.div>
            <h3 className="font-serif text-xl font-medium mb-2">No policies yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your insurance policies to keep track
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setShowAddModal(true)} size="lg" className="gap-2 bg-sage hover:bg-sage-dark">
                <Plus className="w-4 h-4" />
                Add Insurance Policy
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Add Policy Modal - Sage Theme */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
            onClick={() => {
              setShowAddModal(false);
              setSelectedType(null);
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
              {!selectedType ? (
                <>
                  <div className="p-6 border-b border-sage/20 bg-gradient-to-r from-sage-light/30 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-sage/15 border border-sage/30">
                          <Plus className="w-5 h-5 text-sage" />
                        </div>
                        <div>
                          <h2 className="font-serif text-xl font-medium">Add Insurance Policy</h2>
                          <p className="text-sm text-muted-foreground">Choose insurance type</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddModal(false)}
                        className="h-10 w-10 p-0 rounded-xl hover:bg-sage/10"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-2 gap-3">
                    {insuranceTypes.map((type, index) => {
                      const Icon = type.icon;
                      const accent = getAccentStyles(type.accentType);
                      return (
                        <motion.button
                          key={type.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedType(type.id as InsuranceType)}
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
                          <span className="font-medium group-hover:text-sage-dark transition-colors">{type.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <AddInsuranceForm
                  type={selectedType}
                  onClose={() => {
                    setShowAddModal(false);
                    setSelectedType(null);
                  }}
                  onSave={(policy) => {
                    setPolicies((prev) => [...prev, { ...policy, id: Date.now().toString() }]);
                    setShowAddModal(false);
                    setSelectedType(null);
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

function AddInsuranceForm({
  type,
  onClose,
  onSave,
}: {
  type: InsuranceType;
  onClose: () => void;
  onSave: (policy: Omit<InsurancePolicy, "id">) => void;
}) {
  const typeInfo = insuranceTypes.find((i) => i.id === type)!;
  const Icon = typeInfo.icon;
  const accent = getAccentStyles(typeInfo.accentType);

  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    policyNumber: "",
    sumInsured: "",
    premium: "",
    premiumFrequency: "yearly" as InsurancePolicy["premiumFrequency"],
    startDate: "",
    expiryDate: "",
    nominee: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      name: formData.name || typeInfo.name,
      provider: formData.provider,
      policyNumber: formData.policyNumber,
      sumInsured: parseFloat(formData.sumInsured) || 0,
      premium: parseFloat(formData.premium) || 0,
      premiumFrequency: formData.premiumFrequency,
      startDate: formData.startDate,
      expiryDate: formData.expiryDate,
      nominee: formData.nominee || undefined,
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
              <h2 className="font-serif text-xl font-medium">Add {typeInfo.name}</h2>
              <p className="text-sm text-muted-foreground">Enter policy details</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0 rounded-xl hover:bg-sage/10">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <Label htmlFor="name">Policy Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Family Floater"
              className="h-12 rounded-xl border-sage/30 focus:border-sage"
            />
          </motion.div>
          <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
            <Label htmlFor="provider">Provider *</Label>
            <Input
              id="provider"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              placeholder="e.g., Star Health"
              required
              className="h-12 rounded-xl border-sage/30 focus:border-sage"
            />
          </motion.div>
        </div>

        <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Label htmlFor="policyNumber">Policy Number *</Label>
          <Input
            id="policyNumber"
            value={formData.policyNumber}
            onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
            placeholder="Enter policy number"
            required
            className="h-12 rounded-xl border-sage/30 focus:border-sage"
          />
        </motion.div>

        <motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <div className="space-y-2">
            <Label htmlFor="sumInsured">Sum Insured (₹) *</Label>
            <Input
              id="sumInsured"
              type="number"
              value={formData.sumInsured}
              onChange={(e) => setFormData({ ...formData, sumInsured: e.target.value })}
              placeholder="1000000"
              required
              className="h-12 rounded-xl border-sage/30 focus:border-sage"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="premium">Premium (₹) *</Label>
            <Input
              id="premium"
              type="number"
              value={formData.premium}
              onChange={(e) => setFormData({ ...formData, premium: e.target.value })}
              placeholder="25000"
              required
              className="h-12 rounded-xl border-sage/30 focus:border-sage"
            />
          </div>
        </motion.div>

        <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Label>Premium Frequency</Label>
          <div className="flex gap-2">
            {(["monthly", "quarterly", "yearly"] as const).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setFormData({ ...formData, premiumFrequency: freq })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  formData.premiumFrequency === freq
                    ? "bg-sage text-white shadow-lg shadow-sage/25"
                    : "bg-sage-light/30 hover:bg-sage-light/50 border border-sage/20"
                }`}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
              className="h-12 rounded-xl border-sage/30 focus:border-sage"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              required
              className="h-12 rounded-xl border-sage/30 focus:border-sage"
            />
          </div>
        </motion.div>

        <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Label htmlFor="nominee">Nominee</Label>
          <Input
            id="nominee"
            value={formData.nominee}
            onChange={(e) => setFormData({ ...formData, nominee: e.target.value })}
            placeholder="e.g., Spouse, Child"
            className="h-12 rounded-xl border-sage/30 focus:border-sage"
          />
        </motion.div>

        <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional details..."
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
            Save Policy
          </Button>
        </motion.div>
      </div>
    </form>
  );
}

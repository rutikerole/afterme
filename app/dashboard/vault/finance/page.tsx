"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  Building2,
  Wallet,
  TrendingUp,
  Home,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  IndianRupee,
  PiggyBank,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  LineChart,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";

type FinanceType = "bank_account" | "loan" | "investment" | "credit_card" | "crypto" | "other";

interface FinanceRecord {
  id: string;
  type: FinanceType;
  name: string;
  institutionName: string;
  accountNumber?: string;
  accountNumberMasked?: string;
  balance?: number;
  currency?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  importance?: string;
  nominees?: Array<{
    id: string;
    name: string;
    relationship: string;
    sharePercentage?: number;
  }>;
  notes?: string;
  createdAt?: string;
}

// Sage-themed finance types with warm accents
const financeTypes = [
  { id: "bank_account", name: "Bank Account", icon: Building2, accentType: "sage" },
  { id: "credit_card", name: "Credit Card", icon: CreditCard, accentType: "sage" },
  { id: "loan", name: "Loan / EMI", icon: Home, accentType: "amber" },
  { id: "investment", name: "Investment", icon: TrendingUp, accentType: "sage" },
  { id: "crypto", name: "Crypto", icon: PiggyBank, accentType: "sage" },
  { id: "other", name: "Other", icon: Landmark, accentType: "rose" },
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

export default function FinancePage() {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<FinanceType | null>(null);
  const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"all" | FinanceType>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vault/finance");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRecords(data.items || []);
    } catch (error) {
      console.error("Error fetching finance records:", error);
      toast.error("Failed to load finance records");
    } finally {
      setLoading(false);
    }
  };

  const saveRecord = async (record: Omit<FinanceRecord, "id">) => {
    setSaving(true);
    try {
      const res = await fetch("/api/vault/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Record saved successfully!");
      fetchRecords();
      setShowAddModal(false);
      setSelectedType(null);
    } catch (error) {
      console.error("Error saving record:", error);
      toast.error("Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/vault/finance/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Record deleted");
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  const toggleNumber = (id: string) => {
    setShowNumbers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskNumber = (number: string, show: boolean) => {
    if (show) return number;
    if (number.length <= 4) return "••••";
    return "••••" + number.slice(-4);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `${(amount / 100000).toFixed(2)} L`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeInfo = (type: FinanceType) => {
    return financeTypes.find((f) => f.id === type) || financeTypes[0];
  };

  const filteredRecords =
    activeTab === "all" ? records : records.filter((r) => r.type === activeTab);

  const totalAssets = records
    .filter((r) => r.type === "bank" || r.type === "investment" || r.type === "ppf_epf")
    .reduce((sum, r) => sum + (r.balance || 0), 0);

  const totalLiabilities = records
    .filter((r) => r.type === "loan")
    .reduce((sum, r) => sum + (r.loanAmount || 0), 0);

  const netWorth = totalAssets - totalLiabilities;

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
        {/* Sage Gradient Background */}
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
          <motion.path
            d="M0,150 Q150,100 300,150 T600,150"
            fill="none"
            stroke="hsl(var(--sage-dark))"
            strokeWidth="0.5"
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
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
                <Wallet className="w-8 h-8 text-sage-dark" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-serif text-2xl font-medium text-foreground">
                    Financial <span className="text-sage">Records</span>
                  </h1>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="w-5 h-5 text-amber-500/70" />
                  </motion.div>
                </div>
                <p className="text-muted-foreground">
                  Track all your accounts, loans & investments
                </p>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowAddModal(true)}
                className="gap-2 bg-sage hover:bg-sage-dark text-white shadow-lg shadow-sage/20"
              >
                <Plus className="w-4 h-4" />
                Add Record
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
        {/* Assets Card */}
        <motion.div
          className="relative p-6 rounded-3xl border border-sage/20 bg-white/60 backdrop-blur-sm overflow-hidden"
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <motion.div
            className="absolute -top-10 -right-10 w-32 h-32 bg-sage/15 rounded-full blur-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          {/* Decorative wavy line */}
          <svg className="absolute bottom-0 left-0 w-full h-8 opacity-[0.08]" viewBox="0 0 200 30" preserveAspectRatio="none">
            <path d="M0,15 Q50,5 100,15 T200,15" fill="none" stroke="hsl(var(--sage))" strokeWidth="1" />
          </svg>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sage/15 border border-sage/30">
                  <ArrowUpRight className="w-5 h-5 text-sage" />
                </div>
                <span className="text-sm font-medium text-sage-dark">Total Assets</span>
              </div>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <LineChart className="w-5 h-5 text-sage/40" />
              </motion.div>
            </div>
            <p className="text-3xl font-serif font-semibold text-sage-dark">{formatCurrency(totalAssets)}</p>
          </div>
        </motion.div>

        {/* Liabilities Card */}
        <motion.div
          className="relative p-6 rounded-3xl border border-amber-200/50 bg-amber-50/30 backdrop-blur-sm overflow-hidden"
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <motion.div
            className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          />
          <svg className="absolute bottom-0 left-0 w-full h-8 opacity-[0.08]" viewBox="0 0 200 30" preserveAspectRatio="none">
            <path d="M0,15 Q50,5 100,15 T200,15" fill="none" stroke="hsl(var(--sage))" strokeWidth="1" />
          </svg>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100/80 border border-amber-200/50">
                  <ArrowDownRight className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-amber-700">Total Liabilities</span>
              </div>
              <Home className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-serif font-semibold text-amber-700">{formatCurrency(totalLiabilities)}</p>
          </div>
        </motion.div>

        {/* Net Worth Card */}
        <motion.div
          className="relative p-6 rounded-3xl border border-sage/30 bg-gradient-to-br from-sage-light/30 via-white/60 to-transparent backdrop-blur-sm overflow-hidden"
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
                  <TrendingUp className="w-5 h-5 text-sage" />
                </div>
                <span className="text-sm font-medium text-sage-dark">Net Worth</span>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-sage/50" />
              </motion.div>
            </div>
            <p className={`text-3xl font-serif font-semibold ${netWorth >= 0 ? "text-sage-dark" : "text-red-500"}`}>
              {formatCurrency(Math.abs(netWorth))}
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
          All ({records.length})
        </motion.button>
        {financeTypes.map((type) => {
          const count = records.filter((r) => r.type === type.id).length;
          if (count === 0) return null;
          const Icon = type.icon;
          const accent = getAccentStyles(type.accentType);
          return (
            <motion.button
              key={type.id}
              onClick={() => setActiveTab(type.id as FinanceType)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === type.id
                  ? "bg-sage text-white shadow-lg shadow-sage/25"
                  : "bg-white/60 hover:bg-sage-light/30 border border-sage/20"
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.name} ({count})
            </motion.button>
          );
        })}
      </motion.div>

      {/* Records List - Sage Theme */}
      <motion.div variants={itemVariants} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredRecords.map((record, index) => {
            const typeInfo = getTypeInfo(record.type);
            const Icon = typeInfo.icon;
            const accent = getAccentStyles(typeInfo.accentType);

            return (
              <motion.div
                key={record.id}
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
                          <h3 className="font-serif text-xl font-medium">{record.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" />
                            {record.institution}
                          </p>
                        </div>

                        {/* Account Number */}
                        {record.accountNumber && (
                          <motion.div
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sage-light/30 border border-sage/20 w-fit"
                            whileHover={{ scale: 1.02 }}
                          >
                            <code className="text-sm font-mono font-semibold text-sage-dark">
                              {maskNumber(record.accountNumber, showNumbers[record.id])}
                            </code>
                            <button
                              onClick={() => toggleNumber(record.id)}
                              className="p-1.5 rounded-lg hover:bg-sage/10 transition-colors"
                            >
                              {showNumbers[record.id] ? (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          </motion.div>
                        )}

                        {/* Financial Details */}
                        <div className="flex flex-wrap gap-3">
                          {record.balance !== undefined && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sage/15 border border-sage/30">
                              <IndianRupee className="w-4 h-4 text-sage" />
                              <span className="text-sm font-semibold text-sage-dark">
                                {formatCurrency(record.balance)}
                              </span>
                            </div>
                          )}
                          {record.loanAmount !== undefined && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/50">
                              <span className="text-sm font-semibold text-amber-700">
                                Outstanding: {formatCurrency(record.loanAmount)}
                              </span>
                            </div>
                          )}
                          {record.emi !== undefined && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200/50">
                              <span className="text-sm font-semibold text-rose-600">
                                EMI: {formatCurrency(record.emi)}/mo
                              </span>
                            </div>
                          )}
                          {record.interestRate !== undefined && (
                            <div className="px-3 py-1.5 rounded-xl bg-sage-light/30 border border-sage/20">
                              <span className="text-sm text-muted-foreground">
                                @ {record.interestRate}% p.a.
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Nominee Warning */}
                        {!record.nominee && record.type !== "loan" && (
                          <motion.div
                            className="flex items-center gap-2 text-amber-600 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertTriangle className="w-4 h-4" />
                            No nominee assigned
                          </motion.div>
                        )}

                        {record.nominee && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                            Nominee: {record.nominee}
                          </p>
                        )}

                        {record.notes && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                            {record.notes}
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
                          onClick={() => setRecords((prev) => prev.filter((r) => r.id !== record.id))}
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

        {filteredRecords.length === 0 && (
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
              <CreditCard className="w-12 h-12 text-sage" />
            </motion.div>
            <h3 className="font-serif text-xl font-medium mb-2">No records yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by adding your financial records
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setShowAddModal(true)} size="lg" className="gap-2 bg-sage hover:bg-sage-dark">
                <Plus className="w-4 h-4" />
                Add Financial Record
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Add Record Modal - Sage Theme */}
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
                          <h2 className="font-serif text-xl font-medium">Add Financial Record</h2>
                          <p className="text-sm text-muted-foreground">Choose record type</p>
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
                    {financeTypes.map((type, index) => {
                      const Icon = type.icon;
                      const accent = getAccentStyles(type.accentType);
                      return (
                        <motion.button
                          key={type.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedType(type.id as FinanceType)}
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
                <AddFinanceForm
                  type={selectedType}
                  onClose={() => {
                    setShowAddModal(false);
                    setSelectedType(null);
                  }}
                  onSave={(record) => {
                    setRecords((prev) => [...prev, { ...record, id: Date.now().toString() }]);
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

function AddFinanceForm({
  type,
  onClose,
  onSave,
}: {
  type: FinanceType;
  onClose: () => void;
  onSave: (record: Omit<FinanceRecord, "id">) => void;
}) {
  const typeInfo = financeTypes.find((f) => f.id === type)!;
  const Icon = typeInfo.icon;
  const accent = getAccentStyles(typeInfo.accentType);

  const [formData, setFormData] = useState({
    name: "",
    institution: "",
    accountNumber: "",
    balance: "",
    loanAmount: "",
    emi: "",
    interestRate: "",
    maturityDate: "",
    nominee: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      name: formData.name || typeInfo.name,
      institution: formData.institution,
      accountNumber: formData.accountNumber || undefined,
      balance: formData.balance ? parseFloat(formData.balance) : undefined,
      loanAmount: formData.loanAmount ? parseFloat(formData.loanAmount) : undefined,
      emi: formData.emi ? parseFloat(formData.emi) : undefined,
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
      maturityDate: formData.maturityDate || undefined,
      nominee: formData.nominee || undefined,
      notes: formData.notes || undefined,
    });
  };

  const isLoan = type === "loan";
  const isAccount = type === "bank" || type === "ppf_epf";
  const isInvestment = type === "investment";

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
              <p className="text-sm text-muted-foreground">Enter details</p>
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
            <Label htmlFor="name">Name / Label</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Savings Account"
              className="h-12 rounded-xl border-sage/30 focus:border-sage"
            />
          </motion.div>
          <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
            <Label htmlFor="institution">Institution *</Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              placeholder="e.g., HDFC Bank"
              required
              className="h-12 rounded-xl border-sage/30 focus:border-sage"
            />
          </motion.div>
        </div>

        <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Label htmlFor="accountNumber">Account / Loan Number</Label>
          <Input
            id="accountNumber"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            placeholder="Enter account number"
            className="h-12 rounded-xl border-sage/30 focus:border-sage"
          />
        </motion.div>

        {(isAccount || isInvestment) && (
          <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <Label htmlFor="balance">Current Balance (INR)</Label>
            <Input
              id="balance"
              type="number"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              placeholder="0"
              className="h-12 rounded-xl border-sage/30 focus:border-sage"
            />
          </motion.div>
        )}

        {isLoan && (
          <>
            <motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <div className="space-y-2">
                <Label htmlFor="loanAmount">Outstanding Amount (INR)</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  value={formData.loanAmount}
                  onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                  placeholder="0"
                  className="h-12 rounded-xl border-sage/30 focus:border-sage"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emi">Monthly EMI (INR)</Label>
                <Input
                  id="emi"
                  type="number"
                  value={formData.emi}
                  onChange={(e) => setFormData({ ...formData, emi: e.target.value })}
                  placeholder="0"
                  className="h-12 rounded-xl border-sage/30 focus:border-sage"
                />
              </div>
            </motion.div>
            <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Label htmlFor="interestRate">Interest Rate (% p.a.)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                placeholder="8.5"
                className="h-12 rounded-xl border-sage/30 focus:border-sage"
              />
            </motion.div>
          </>
        )}

        {!isLoan && (
          <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Label htmlFor="nominee">Nominee</Label>
            <Input
              id="nominee"
              value={formData.nominee}
              onChange={(e) => setFormData({ ...formData, nominee: e.target.value })}
              placeholder="e.g., Spouse, Child"
              className="h-12 rounded-xl border-sage/30 focus:border-sage"
            />
          </motion.div>
        )}

        <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
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
            Save Record
          </Button>
        </motion.div>
      </div>
    </form>
  );
}

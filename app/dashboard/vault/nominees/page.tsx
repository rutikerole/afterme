"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Shield,
  CreditCard,
  Heart,
  Home,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock,
  TrendingUp,
  Briefcase,
  PieChart,
  Phone,
  Mail,
  Percent,
  Link2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Nominee {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  aadhaar?: string;
  photo?: string;
}

interface AssetAssignment {
  id: string;
  assetType: "bank" | "insurance" | "investment" | "property" | "other";
  assetName: string;
  nomineeId: string;
  sharePercentage: number;
  notes?: string;
}

const assetTypes = [
  { id: "bank", name: "Bank Accounts", icon: CreditCard, accent: "text-sage-dark", bgAccent: "bg-sage/10", borderAccent: "border-sage/30" },
  { id: "insurance", name: "Insurance", icon: Shield, accent: "text-rose-600", bgAccent: "bg-rose-500/10", borderAccent: "border-rose-200" },
  { id: "investment", name: "Investments", icon: TrendingUp, accent: "text-sage", bgAccent: "bg-sage-light/30", borderAccent: "border-sage/20" },
  { id: "property", name: "Property", icon: Home, accent: "text-amber-700", bgAccent: "bg-amber/10", borderAccent: "border-amber-200" },
  { id: "other", name: "Other Assets", icon: Briefcase, accent: "text-muted-foreground", bgAccent: "bg-muted", borderAccent: "border-border" },
];

const initialNominees: Nominee[] = [
  {
    id: "1",
    name: "Priya Sharma",
    relationship: "Wife",
    phone: "+91 98765 43210",
    email: "priya@email.com",
  },
  {
    id: "2",
    name: "Arjun Sharma",
    relationship: "Son",
    phone: "+91 98765 11111",
    email: "arjun@email.com",
  },
];

const initialAssignments: AssetAssignment[] = [
  {
    id: "1",
    assetType: "bank",
    assetName: "HDFC Savings Account",
    nomineeId: "1",
    sharePercentage: 100,
  },
  {
    id: "2",
    assetType: "insurance",
    assetName: "Term Insurance - ICICI",
    nomineeId: "1",
    sharePercentage: 50,
    notes: "Primary beneficiary",
  },
  {
    id: "3",
    assetType: "insurance",
    assetName: "Term Insurance - ICICI",
    nomineeId: "2",
    sharePercentage: 50,
    notes: "Secondary beneficiary",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function NomineesPage() {
  const [nominees, setNominees] = useState<Nominee[]>(initialNominees);
  const [assignments, setAssignments] = useState<AssetAssignment[]>(initialAssignments);
  const [showAddNominee, setShowAddNominee] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [activeTab, setActiveTab] = useState<"nominees" | "assignments">("nominees");

  const getNominee = (id: string) => nominees.find((n) => n.id === id);

  const getAssetTypeInfo = (type: string) => {
    return assetTypes.find((a) => a.id === type) || assetTypes[4];
  };

  const getNomineeAssignments = (nomineeId: string) => {
    return assignments.filter((a) => a.nomineeId === nomineeId);
  };

  // Group assignments by asset
  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const key = `${assignment.assetType}-${assignment.assetName}`;
    if (!acc[key]) {
      acc[key] = {
        assetType: assignment.assetType,
        assetName: assignment.assetName,
        assignments: [],
      };
    }
    acc[key].assignments.push(assignment);
    return acc;
  }, {} as Record<string, { assetType: string; assetName: string; assignments: AssetAssignment[] }>);

  // Calculate stats
  const nomineesWithAssets = nominees.filter(n => getNomineeAssignments(n.id).length > 0).length;
  const totalAssetsAssigned = Object.keys(groupedAssignments).length;

  return (
    <div className="min-h-screen relative">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-sage/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-sage-light/20 rounded-full blur-[80px]" />

        {/* Decorative lines */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.08]" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M0,100 Q300,50 600,100 T1200,100" fill="none" stroke="hsl(var(--sage))" strokeWidth="1" />
          <path d="M0,300 Q400,250 800,300 T1200,300" fill="none" stroke="hsl(var(--sage))" strokeWidth="0.5" strokeDasharray="5,5" />
        </svg>

        {/* Spinning decorative circles */}
        <svg className="absolute top-20 right-20 w-24 h-24 text-sage/10 animate-spin-slow" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>

        {/* Floating dots */}
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-sage/30 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-sage/20 rounded-full animate-float" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage/10 border border-sage/30 rounded-full mb-4">
              <Heart className="w-4 h-4 text-sage" />
              <span className="text-sm text-sage-dark font-medium">Legacy Planning</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground tracking-tight">
              Nominees & <span className="text-sage">Beneficiaries</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Define who inherits your assets
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddNominee(true)}
              variant="outline"
              className="border-sage/30 text-sage-dark hover:bg-sage/10 hover:border-sage/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Nominee
            </Button>
            <Button
              onClick={() => setShowAddAssignment(true)}
              className="bg-sage hover:bg-sage-dark text-white shadow-lg shadow-sage/20"
              disabled={nominees.length === 0}
            >
              <Link2 className="w-4 h-4 mr-2" />
              Assign Asset
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10"
      >
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-sage/20 hover:border-sage/40 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sage/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-sage" />
            </div>
            <div>
              <p className="text-3xl font-serif font-medium text-sage">{nominees.length}</p>
              <p className="text-muted-foreground text-sm">Total Nominees</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-sage/20 hover:border-sage/40 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sage/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-sage" />
            </div>
            <div>
              <p className="text-3xl font-serif font-medium text-sage">{nomineesWithAssets}/{nominees.length}</p>
              <p className="text-muted-foreground text-sm">With Assets</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-sage/20 hover:border-sage/40 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sage/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-sage" />
            </div>
            <div>
              <p className="text-3xl font-serif font-medium text-sage">{totalAssetsAssigned}</p>
              <p className="text-muted-foreground text-sm">Assets Assigned</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-sage/20 hover:border-sage/40 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sage/10 flex items-center justify-center">
              <PieChart className="w-6 h-6 text-sage" />
            </div>
            <div>
              <p className="text-3xl font-serif font-medium text-sage">{assignments.length}</p>
              <p className="text-muted-foreground text-sm">Allocations Made</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Important Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-5 rounded-2xl bg-sage/5 border border-sage/20 mb-10"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-sage/10">
            <Lock className="w-5 h-5 text-sage" />
          </div>
          <div>
            <p className="font-medium text-sage-dark">Important Legal Note</p>
            <p className="text-sm text-muted-foreground mt-1">
              This is for your reference and guidance only. For legal inheritance, please update
              nominees with your bank/insurance provider and consider creating a legal will.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex items-center gap-2 p-1.5 bg-secondary/50 rounded-2xl w-fit mb-10"
      >
        <button
          onClick={() => setActiveTab("nominees")}
          className={`relative px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === "nominees"
              ? "text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {activeTab === "nominees" && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-sage rounded-xl shadow-lg shadow-sage/20"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Nominees ({nominees.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab("assignments")}
          className={`relative px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === "assignments"
              ? "text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {activeTab === "assignments" && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-sage rounded-xl shadow-lg shadow-sage/20"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Asset Assignments ({Object.keys(groupedAssignments).length})
          </span>
        </button>
      </motion.div>

      {/* Nominees Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "nominees" && (
          <motion.div
            key="nominees"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 gap-6"
            >
              {nominees.map((nominee) => {
                const nomineeAssignments = getNomineeAssignments(nominee.id);

                return (
                  <motion.div
                    key={nominee.id}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className="group relative p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-sage/20 hover:border-sage/40 hover:shadow-lg hover:shadow-sage/10 transition-all overflow-hidden"
                  >
                    {/* Decorative top accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-sage/30" />

                    <div className="relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-sage/10 border border-sage/30 flex items-center justify-center font-serif text-xl font-medium text-sage">
                            {nominee.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-serif font-medium text-xl text-foreground">{nominee.name}</h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-sage/10 text-sage-dark border border-sage/20 mt-1">
                              <Heart className="w-3 h-3" />
                              {nominee.relationship}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setNominees((prev) => prev.filter((n) => n.id !== nominee.id))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 text-sage" />
                          {nominee.phone}
                        </div>
                        {nominee.email && (
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4 text-sage" />
                            {nominee.email}
                          </div>
                        )}
                      </div>

                      {/* Assigned Assets Preview */}
                      <div className="mt-6 pt-5 border-t border-border">
                        {nomineeAssignments.length > 0 ? (
                          <>
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-medium text-muted-foreground">Assigned Assets</p>
                              <span className="text-xs text-sage font-semibold">
                                {nomineeAssignments.length} asset{nomineeAssignments.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {nomineeAssignments.slice(0, 3).map((assignment) => {
                                const assetInfo = getAssetTypeInfo(assignment.assetType);
                                const Icon = assetInfo.icon;
                                return (
                                  <div
                                    key={assignment.id}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${assetInfo.bgAccent} ${assetInfo.accent} border ${assetInfo.borderAccent} text-xs font-medium`}
                                  >
                                    <Icon className="w-3 h-3" />
                                    <span className="truncate max-w-[100px]">{assignment.assetName}</span>
                                    <span className="px-1.5 py-0.5 rounded-full bg-white/50 text-[10px]">
                                      {assignment.sharePercentage}%
                                    </span>
                                  </div>
                                );
                              })}
                              {nomineeAssignments.length > 3 && (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-muted text-xs font-medium text-muted-foreground">
                                  +{nomineeAssignments.length - 3} more
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber/5 border border-amber-200">
                            <AlertTriangle className="w-5 h-5 text-amber-700" />
                            <div>
                              <p className="text-sm font-medium text-amber-800">No assets assigned</p>
                              <p className="text-xs text-amber-700/70">Assign assets to this nominee</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {nominees.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-sage/10 border border-sage/30 flex items-center justify-center"
                >
                  <Users className="w-12 h-12 text-sage" />
                </motion.div>
                <h3 className="font-serif text-2xl font-medium text-foreground mb-2">No nominees yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Add the people who should inherit your assets and secure your legacy
                </p>
                <Button
                  onClick={() => setShowAddNominee(true)}
                  size="lg"
                  className="bg-sage hover:bg-sage-dark text-white shadow-lg shadow-sage/20"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Nominee
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <motion.div
            key="assignments"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {nominees.length === 0 ? (
              <div className="p-8 rounded-2xl bg-muted/50 text-center">
                <p className="text-muted-foreground">Add nominees first before assigning assets</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {Object.values(groupedAssignments).map((group) => {
                  const assetInfo = getAssetTypeInfo(group.assetType);
                  const Icon = assetInfo.icon;
                  const totalPercentage = group.assignments.reduce((sum, a) => sum + a.sharePercentage, 0);

                  return (
                    <motion.div
                      key={`${group.assetType}-${group.assetName}`}
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                      className="relative p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-sage/20 hover:border-sage/40 hover:shadow-lg transition-all overflow-hidden"
                    >
                      {/* Left accent */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-sage/40" />

                      <div className="flex items-start gap-5 pl-4">
                        <div className={`p-4 rounded-2xl ${assetInfo.bgAccent} border ${assetInfo.borderAccent}`}>
                          <Icon className={`w-7 h-7 ${assetInfo.accent}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-serif font-medium text-xl text-foreground">{group.assetName}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${assetInfo.bgAccent} ${assetInfo.accent} border ${assetInfo.borderAccent} mt-1`}>
                                {assetInfo.name}
                              </span>
                            </div>
                            <div className="text-right">
                              {totalPercentage === 100 ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sage/10 text-sage-dark text-sm font-semibold border border-sage/20">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Fully Allocated
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber/10 text-amber-700 text-sm font-semibold border border-amber-200">
                                  <AlertTriangle className="w-4 h-4" />
                                  {totalPercentage}% Allocated
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Allocation Progress Bar */}
                          <div className="mt-4 mb-5">
                            <div className="h-2 rounded-full bg-sage/10 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(totalPercentage, 100)}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full rounded-full bg-sage"
                              />
                            </div>
                          </div>

                          {/* Beneficiaries */}
                          <div className="space-y-3">
                            {group.assignments.map((assignment) => {
                              const nominee = getNominee(assignment.nomineeId);
                              if (!nominee) return null;

                              return (
                                <div
                                  key={assignment.id}
                                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-sage/10 border border-sage/20 flex items-center justify-center font-serif font-medium text-sage">
                                      {nominee.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground">{nominee.name}</p>
                                      <p className="text-xs text-muted-foreground">{nominee.relationship}</p>
                                      {assignment.notes && (
                                        <p className="text-xs text-muted-foreground italic mt-0.5">{assignment.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <div className="flex items-center gap-1 text-2xl font-serif font-medium text-sage">
                                        {assignment.sharePercentage}
                                        <Percent className="w-4 h-4" />
                                      </div>
                                      <p className="text-xs text-muted-foreground">Share</p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() =>
                                        setAssignments((prev) => prev.filter((a) => a.id !== assignment.id))
                                      }
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {Object.keys(groupedAssignments).length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                  >
                    <motion.div
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-sage/10 border border-sage/30 flex items-center justify-center"
                    >
                      <Link2 className="w-12 h-12 text-sage" />
                    </motion.div>
                    <h3 className="font-serif text-2xl font-medium text-foreground mb-2">No assignments yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Link your assets to nominees to define inheritance
                    </p>
                    <Button
                      onClick={() => setShowAddAssignment(true)}
                      size="lg"
                      className="bg-sage hover:bg-sage-dark text-white shadow-lg shadow-sage/20"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Assign Your First Asset
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Nominee Modal */}
      <AnimatePresence>
        {showAddNominee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
            onClick={() => setShowAddNominee(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl overflow-hidden"
            >
              <AddNomineeForm
                onClose={() => setShowAddNominee(false)}
                onSave={(nominee) => {
                  setNominees((prev) => [...prev, { ...nominee, id: Date.now().toString() }]);
                  setShowAddNominee(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Assignment Modal */}
      <AnimatePresence>
        {showAddAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
            onClick={() => setShowAddAssignment(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl overflow-hidden"
            >
              <AddAssignmentForm
                nominees={nominees}
                onClose={() => setShowAddAssignment(false)}
                onSave={(assignment) => {
                  setAssignments((prev) => [...prev, { ...assignment, id: Date.now().toString() }]);
                  setShowAddAssignment(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddNomineeForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (nominee: Omit<Nominee, "id">) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    aadhaar: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      relationship: formData.relationship,
      phone: formData.phone,
      email: formData.email || undefined,
      aadhaar: formData.aadhaar || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sage/10 border border-sage/30">
              <User className="w-6 h-6 text-sage" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium text-foreground">Add Nominee</h2>
              <p className="text-muted-foreground text-sm">Add a beneficiary to your legacy</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
            required
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship *</Label>
          <Input
            id="relationship"
            value={formData.relationship}
            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            placeholder="e.g., Wife, Son, Daughter"
            required
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98765 43210"
            required
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="p-6 border-t border-border flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <Button type="submit" className="rounded-xl bg-sage hover:bg-sage-dark text-white">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Add Nominee
        </Button>
      </div>
    </form>
  );
}

function AddAssignmentForm({
  nominees,
  onClose,
  onSave,
}: {
  nominees: Nominee[];
  onClose: () => void;
  onSave: (assignment: Omit<AssetAssignment, "id">) => void;
}) {
  const [formData, setFormData] = useState({
    assetType: "bank" as AssetAssignment["assetType"],
    assetName: "",
    nomineeId: "",
    sharePercentage: "100",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      assetType: formData.assetType,
      assetName: formData.assetName,
      nomineeId: formData.nomineeId,
      sharePercentage: parseInt(formData.sharePercentage) || 100,
      notes: formData.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sage/10 border border-sage/30">
              <Link2 className="w-6 h-6 text-sage" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium text-foreground">Assign Asset</h2>
              <p className="text-muted-foreground text-sm">Link an asset to a nominee</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="space-y-3">
          <Label>Asset Type *</Label>
          <div className="grid grid-cols-3 gap-2">
            {assetTypes.map((type) => {
              const Icon = type.icon;
              return (
                <motion.button
                  key={type.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, assetType: type.id as AssetAssignment["assetType"] })}
                  className={`p-3 rounded-2xl border-2 transition-all text-center ${
                    formData.assetType === type.id
                      ? "border-sage bg-sage/5"
                      : "border-border hover:border-sage/40"
                  }`}
                >
                  <div className={`w-10 h-10 mx-auto rounded-xl ${type.bgAccent} border ${type.borderAccent} flex items-center justify-center mb-2`}>
                    <Icon className={`w-5 h-5 ${type.accent}`} />
                  </div>
                  <span className="text-xs font-medium text-foreground">{type.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assetName">Asset Name *</Label>
          <Input
            id="assetName"
            value={formData.assetName}
            onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
            placeholder="e.g., HDFC Savings Account"
            required
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nomineeId">Nominee *</Label>
          <select
            id="nomineeId"
            value={formData.nomineeId}
            onChange={(e) => setFormData({ ...formData, nomineeId: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-sage/50 transition-all"
            required
          >
            <option value="">Select nominee</option>
            {nominees.map((nominee) => (
              <option key={nominee.id} value={nominee.id}>
                {nominee.name} ({nominee.relationship})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sharePercentage">Share Percentage *</Label>
          <div className="relative">
            <Input
              id="sharePercentage"
              type="number"
              min="1"
              max="100"
              value={formData.sharePercentage}
              onChange={(e) => setFormData({ ...formData, sharePercentage: e.target.value })}
              required
              className="rounded-xl pr-12"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Percentage of this asset allocated to the nominee
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g., Primary beneficiary"
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="p-6 border-t border-border flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <Button type="submit" className="rounded-xl bg-sage hover:bg-sage-dark text-white">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Assign Asset
        </Button>
      </div>
    </form>
  );
}

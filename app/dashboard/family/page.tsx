"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Plus,
  Shield,
  Clock,
  X,
  Check,
  MoreVertical,
  UserPlus,
  Heart,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Send,
  Crown,
  User,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Settings,
  Key,
  FileText,
  Mic,
  Images,
  CreditCard,
  Bell,
  Calendar,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Role = "partner" | "child" | "parent" | "guardian" | "trustee" | "friend";
type AccessCondition = "always" | "after_death" | "emergency" | "scheduled";

interface Permission {
  vault: string;
  canView: boolean;
  condition: AccessCondition;
}

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: "active" | "pending" | "inactive";
  addedAt: Date;
  avatar?: string;
  permissions: Permission[];
  isEmergencyContact: boolean;
  canUnlockLegacy: boolean;
}

// Floating Leaf decoration with enhanced animation support
const FloatingLeaf = ({ className, style, size = 40, variant = 1 }: { className?: string; style?: React.CSSProperties; size?: number; variant?: number }) => {
  const paths = [
    // Variant 1: Classic leaf
    "M20 2C20 2 8 12 8 24C8 32 13 38 20 38C27 38 32 32 32 24C32 12 20 2 20 2Z",
    // Variant 2: Maple-like
    "M20 2C15 8 8 15 8 24C8 30 12 36 20 38C28 36 32 30 32 24C32 15 25 8 20 2ZM20 10C18 15 15 20 15 25M20 10C22 15 25 20 25 25",
    // Variant 3: Round leaf
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

// Sparkle/Star decoration
const Sparkle = ({ className, style, size = 20 }: { className?: string; style?: React.CSSProperties; size?: number }) => (
  <svg className={className} style={style} width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path
      d="M10 0L11.5 8.5L20 10L11.5 11.5L10 20L8.5 11.5L0 10L8.5 8.5L10 0Z"
      fill="hsl(var(--sage))"
      fillOpacity="0.5"
    />
  </svg>
);

// Circle ring decoration
const RingDecoration = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} width="80" height="80" viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="35" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="5 5" className="animate-rotate-gentle" style={{ transformOrigin: 'center' }} />
    <circle cx="40" cy="40" r="25" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.3" className="animate-rotate-gentle" style={{ transformOrigin: 'center', animationDirection: 'reverse', animationDuration: '25s' }} />
    <circle cx="40" cy="40" r="15" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.4" fill="hsl(var(--sage))" fillOpacity="0.05" />
  </svg>
);

// People/Connection decoration with animation
const ConnectionDecoration = ({ className }: { className?: string }) => (
  <svg className={className} width="80" height="80" viewBox="0 0 80 80" fill="none">
    <circle cx="25" cy="25" r="10" fill="hsl(var(--sage))" fillOpacity="0.2" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.5" className="animate-breathe" />
    <circle cx="55" cy="25" r="10" fill="hsl(var(--sage))" fillOpacity="0.2" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.5" className="animate-breathe" style={{ animationDelay: '0.5s' }} />
    <circle cx="40" cy="55" r="10" fill="hsl(var(--sage))" fillOpacity="0.2" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.5" className="animate-breathe" style={{ animationDelay: '1s' }} />
    <path d="M32 30L48 30M30 35L36 50M50 35L44 50" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" className="animate-draw-line" />
    <circle cx="40" cy="40" r="3" fill="hsl(var(--sage))" fillOpacity="0.6" className="animate-pulse" />
  </svg>
);

// Flowing vine decoration
const VineDecoration = ({ className }: { className?: string }) => (
  <svg className={className} width="120" height="200" viewBox="0 0 120 200" fill="none">
    <path
      d="M60 0 Q30 50 60 100 Q90 150 60 200"
      stroke="hsl(var(--sage))"
      strokeWidth="2"
      strokeOpacity="0.3"
      fill="none"
      className="animate-line-flow"
    />
    <circle cx="45" cy="40" r="8" fill="hsl(var(--sage))" fillOpacity="0.15" className="animate-breathe" />
    <circle cx="75" cy="80" r="6" fill="hsl(var(--sage))" fillOpacity="0.2" className="animate-breathe" style={{ animationDelay: '0.3s' }} />
    <circle cx="50" cy="130" r="10" fill="hsl(var(--sage))" fillOpacity="0.1" className="animate-breathe" style={{ animationDelay: '0.6s' }} />
    <circle cx="70" cy="170" r="7" fill="hsl(var(--sage))" fillOpacity="0.15" className="animate-breathe" style={{ animationDelay: '0.9s' }} />
  </svg>
);

const roles: { id: Role; label: string; description: string; icon: any; color: string; bg: string }[] = [
  { id: "partner", label: "Partner / Spouse", description: "Your life partner with highest access", icon: Heart, color: "text-rose-600", bg: "bg-rose-100/50" },
  { id: "child", label: "Child", description: "Your son or daughter", icon: User, color: "text-sage-dark", bg: "bg-sage/15" },
  { id: "parent", label: "Parent", description: "Your mother or father", icon: Users, color: "text-sage", bg: "bg-sage-light/40" },
  { id: "guardian", label: "Emergency Guardian", description: "Trusted person for emergencies", icon: Shield, color: "text-amber-600", bg: "bg-amber-100/50" },
  { id: "trustee", label: "Trustee", description: "Legal or financial trustee", icon: Key, color: "text-sage-dark", bg: "bg-sage/20" },
  { id: "friend", label: "Close Friend", description: "Trusted friend", icon: User, color: "text-muted-foreground", bg: "bg-muted" },
];

const vaultTypes = [
  { id: "identity", label: "Identity Documents", icon: FileText },
  { id: "finance", label: "Financial Records", icon: CreditCard },
  { id: "insurance", label: "Insurance Policies", icon: Shield },
  { id: "voice", label: "Voice Messages", icon: Mic },
  { id: "memories", label: "Photos & Memories", icon: Images },
  { id: "legacy", label: "Legacy Instructions", icon: Lock },
];

const accessConditions: { id: AccessCondition; label: string; description: string }[] = [
  { id: "always", label: "Always", description: "Can access anytime" },
  { id: "after_death", label: "After Death", description: "Only after verification of death" },
  { id: "emergency", label: "Emergency Only", description: "Only in verified emergencies" },
  { id: "scheduled", label: "Scheduled", description: "On a specific future date" },
];

const initialMembers: FamilyMember[] = [
  {
    id: "1",
    name: "Priya Sharma",
    email: "priya@email.com",
    phone: "+91 98765 43210",
    role: "partner",
    status: "active",
    addedAt: new Date("2024-01-15"),
    isEmergencyContact: true,
    canUnlockLegacy: true,
    permissions: [
      { vault: "identity", canView: true, condition: "always" },
      { vault: "finance", canView: true, condition: "always" },
      { vault: "insurance", canView: true, condition: "always" },
      { vault: "voice", canView: true, condition: "always" },
      { vault: "memories", canView: true, condition: "always" },
      { vault: "legacy", canView: true, condition: "after_death" },
    ],
  },
  {
    id: "2",
    name: "Arjun Sharma",
    email: "arjun@email.com",
    role: "child",
    status: "active",
    addedAt: new Date("2024-02-10"),
    isEmergencyContact: false,
    canUnlockLegacy: true,
    permissions: [
      { vault: "identity", canView: false, condition: "after_death" },
      { vault: "finance", canView: true, condition: "after_death" },
      { vault: "insurance", canView: true, condition: "after_death" },
      { vault: "voice", canView: true, condition: "always" },
      { vault: "memories", canView: true, condition: "always" },
      { vault: "legacy", canView: true, condition: "after_death" },
    ],
  },
];

export default function TrustedCirclePage() {
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState<FamilyMember | null>(null);
  const [showMemberMenu, setShowMemberMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "permissions" | "unlock">("members");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "child" as Role,
    isEmergencyContact: false,
    canUnlockLegacy: false,
  });

  const handleInvite = () => {
    if (!form.name || !form.email) return;

    const defaultPermissions: Permission[] = vaultTypes.map((vault) => ({
      vault: vault.id,
      canView: form.role === "partner",
      condition: form.role === "partner" ? "always" : "after_death",
    }));

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      role: form.role,
      status: "pending",
      addedAt: new Date(),
      isEmergencyContact: form.isEmergencyContact,
      canUnlockLegacy: form.canUnlockLegacy,
      permissions: defaultPermissions,
    };

    setMembers((prev) => [...prev, newMember]);
    setShowInviteModal(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "child",
      isEmergencyContact: false,
      canUnlockLegacy: false,
    });
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setShowMemberMenu(null);
  };

  const updatePermission = (memberId: string, vaultId: string, updates: Partial<Permission>) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              permissions: m.permissions.map((p) =>
                p.vault === vaultId ? { ...p, ...updates } : p
              ),
            }
          : m
      )
    );
  };

  const getRoleInfo = (roleId: Role) => roles.find((r) => r.id === roleId) || roles[0];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const pendingCount = members.filter((m) => m.status === "pending").length;
  const activeCount = members.filter((m) => m.status === "active").length;
  const legacyUnlockers = members.filter((m) => m.canUnlockLegacy).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-sage-light/10 relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Morphing background blobs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-sage/10 rounded-full blur-3xl animate-blob-morph" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-sage-light/25 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-5s" }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-sage/8 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-10s" }} />

        {/* Floating leaves with different animations */}
        <FloatingLeaf className="absolute top-28 left-[8%] animate-float-rotate opacity-60" style={{ animationDuration: "10s" }} size={50} variant={1} />
        <FloatingLeaf className="absolute top-[40%] right-[5%] animate-sway opacity-50" style={{ animationDuration: "6s" }} size={45} variant={2} />
        <FloatingLeaf className="absolute bottom-[30%] left-[5%] animate-drift opacity-45" style={{ animationDuration: "12s" }} size={55} variant={3} />
        <FloatingLeaf className="absolute top-[20%] right-[25%] animate-swing opacity-40" style={{ animationDuration: "4s" }} size={35} variant={1} />
        <FloatingLeaf className="absolute bottom-[50%] right-[12%] animate-wave opacity-35" style={{ animationDuration: "7s" }} size={40} variant={2} />
        <FloatingLeaf className="absolute top-[60%] left-[15%] animate-float opacity-30" style={{ animationDuration: "9s", animationDelay: "2s" }} size={38} variant={3} />

        {/* Connection decorations */}
        <ConnectionDecoration className="absolute top-32 right-[18%] opacity-40" />
        <ConnectionDecoration className="absolute bottom-40 left-[22%] opacity-35 rotate-45" />

        {/* Ring decorations */}
        <RingDecoration className="absolute top-[15%] left-[12%] opacity-30" />
        <RingDecoration className="absolute bottom-[20%] right-[8%] opacity-25" style={{ transform: 'scale(0.7)' }} />

        {/* Vine decoration */}
        <VineDecoration className="absolute top-0 right-[3%] opacity-40" />
        <VineDecoration className="absolute top-[30%] left-0 opacity-30 -scale-x-100" />

        {/* Sparkles */}
        <Sparkle className="absolute top-36 left-[28%] animate-twinkle opacity-60" style={{ animationDelay: "0s" }} size={16} />
        <Sparkle className="absolute top-[50%] right-[28%] animate-twinkle opacity-50" style={{ animationDelay: "0.5s" }} size={20} />
        <Sparkle className="absolute bottom-32 right-[42%] animate-twinkle opacity-55" style={{ animationDelay: "1s" }} size={14} />
        <Sparkle className="absolute top-[25%] left-[45%] animate-twinkle opacity-45" style={{ animationDelay: "1.5s" }} size={18} />
        <Sparkle className="absolute bottom-[45%] left-[35%] animate-twinkle opacity-40" style={{ animationDelay: "2s" }} size={12} />

        {/* Floating particles with glow */}
        <div className="absolute top-36 left-[30%] w-3 h-3 rounded-full bg-sage/50 animate-firefly" style={{ animationDuration: "8s" }} />
        <div className="absolute top-[50%] right-[30%] w-4 h-4 rounded-full bg-sage/40 animate-firefly" style={{ animationDuration: "10s", animationDelay: "2s" }} />
        <div className="absolute bottom-32 right-[45%] w-3 h-3 rounded-full bg-sage/45 animate-firefly" style={{ animationDuration: "9s", animationDelay: "4s" }} />
        <div className="absolute top-[70%] left-[20%] w-2 h-2 rounded-full bg-sage/35 animate-firefly" style={{ animationDuration: "7s", animationDelay: "1s" }} />
        <div className="absolute top-[35%] right-[40%] w-3 h-3 rounded-full bg-sage/30 animate-firefly" style={{ animationDuration: "11s", animationDelay: "3s" }} />

        {/* Animated decorative lines */}
        <svg className="absolute top-16 left-0 w-full h-32 opacity-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 Q200,20 400,60 T800,60 T1200,60" fill="none" stroke="hsl(var(--sage))" strokeWidth="2" className="animate-line-flow" />
          <path d="M0,80 Q300,40 600,80 T1200,80" fill="none" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.6" className="animate-line-flow" style={{ animationDelay: "-2s" }} />
        </svg>

        {/* Bottom flowing line */}
        <svg className="absolute bottom-20 left-0 w-full h-24 opacity-15" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path d="M0,50 C200,20 400,80 600,50 C800,20 1000,80 1200,50" fill="none" stroke="hsl(var(--sage))" strokeWidth="2" className="animate-line-flow" style={{ animationDirection: "reverse" }} />
        </svg>

        {/* Ripple circles */}
        <div className="absolute top-[40%] left-[50%] w-40 h-40 rounded-full border border-sage/20 animate-ripple" style={{ animationDuration: "4s" }} />
        <div className="absolute top-[40%] left-[50%] w-40 h-40 rounded-full border border-sage/20 animate-ripple" style={{ animationDuration: "4s", animationDelay: "1s" }} />
        <div className="absolute top-[40%] left-[50%] w-40 h-40 rounded-full border border-sage/20 animate-ripple" style={{ animationDuration: "4s", animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-sage-dark hover:bg-sage/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-serif text-3xl font-medium text-foreground">
                Trusted <span className="text-sage-dark">Circle</span>
              </h1>
              <p className="text-muted-foreground">Manage who receives your legacy & when</p>
            </div>
          </div>

          <Button onClick={() => setShowInviteModal(true)} className="bg-sage hover:bg-sage-dark text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-4 gap-4 mb-8"
        >
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-card to-sage-light/10 border border-sage/20 hover:border-sage/40 hover:shadow-lg hover:shadow-sage/10 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-sage/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-2 rounded-xl bg-sage/15 border border-sage/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Users className="w-5 h-5 text-sage-dark" />
              </div>
              <div>
                <p className="text-2xl font-serif font-medium text-sage-dark">{members.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-card to-sage-light/10 border border-sage/20 hover:border-sage/40 hover:shadow-lg hover:shadow-sage/10 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-sage/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-2 rounded-xl bg-sage/15 border border-sage/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <CheckCircle2 className="w-5 h-5 text-sage" />
              </div>
              <div>
                <p className="text-2xl font-serif font-medium text-sage">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-card to-amber-50/30 border border-amber-200/50 hover:border-amber-300/50 hover:shadow-lg hover:shadow-amber/10 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-2 rounded-xl bg-amber-100/50 border border-amber-200/50 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-serif font-medium text-amber-600">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-card to-rose-50/30 border border-rose-200/50 hover:border-rose-300/50 hover:shadow-lg hover:shadow-rose/10 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-2 rounded-xl bg-rose-100/50 border border-rose-200/50 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 animate-heartbeat" style={{ animationDuration: '3s' }}>
                <Key className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-serif font-medium text-rose-600">{legacyUnlockers}</p>
                <p className="text-sm text-muted-foreground">Can Unlock</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 p-1.5 bg-sage-light/30 border border-sage/10 rounded-2xl w-fit mb-6"
        >
          {[
            { id: "members", label: "Members", icon: Users },
            { id: "permissions", label: "Permission Matrix", icon: Shield },
            { id: "unlock", label: "Legacy Unlock", icon: Key },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                activeTab === id
                  ? "bg-white shadow-md text-sage-dark border border-sage/20"
                  : "text-muted-foreground hover:text-sage-dark hover:bg-white/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </motion.div>

        {/* Members Tab */}
        {activeTab === "members" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {members.length === 0 ? (
              <div className="p-16 rounded-3xl border border-sage/20 bg-gradient-to-br from-card to-sage-light/10 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sage/15 to-sage-light/30 flex items-center justify-center mx-auto mb-6 border-2 border-sage/20">
                  <Users className="w-10 h-10 text-sage-dark" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-foreground mb-3">Your trusted circle is empty</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Add family members and loved ones who will receive your legacy when the time comes.
                </p>
                <Button onClick={() => setShowInviteModal(true)} className="bg-sage hover:bg-sage-dark text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Your First Member
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member, index) => {
                  const role = getRoleInfo(member.role);
                  const RoleIcon = role.icon;

                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.08, type: "spring", stiffness: 200 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="group p-5 rounded-2xl bg-gradient-to-br from-card to-sage-light/5 border border-sage/15 hover:border-sage/40 hover:shadow-xl hover:shadow-sage/15 transition-all duration-500 relative overflow-hidden"
                    >
                      {/* Hover gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-sage/5 via-transparent to-sage-light/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      {/* Subtle shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      <div className="flex items-center gap-4 relative z-10">
                        <motion.div
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="w-14 h-14 rounded-full bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center text-white font-semibold text-lg shadow-md group-hover:shadow-lg group-hover:shadow-sage/30 transition-shadow duration-300"
                        >
                          {getInitials(member.name)}
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
                            {member.status === "pending" && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-700 text-xs font-medium border border-amber-200/50">
                                Pending
                              </span>
                            )}
                            {member.status === "active" && (
                              <span className="px-2.5 py-0.5 rounded-full bg-sage/15 text-sage-dark text-xs font-medium border border-sage/20">
                                Active
                              </span>
                            )}
                            {member.isEmergencyContact && (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-100/80 text-rose-600 text-xs font-medium border border-rose-200/50">
                                Emergency
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${role.bg}`}>
                              <RoleIcon className={`w-3 h-3 ${role.color}`} />
                              <span className={role.color}>{role.label}</span>
                            </span>
                            <span className="text-sage/40">•</span>
                            <span className="truncate">{member.email}</span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="hidden md:flex items-center gap-2">
                          {member.canUnlockLegacy && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100/60 text-rose-600 text-sm font-medium border border-rose-200/50">
                              <Key className="w-3.5 h-3.5" />
                              Can Unlock
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage/10 text-sage-dark text-sm font-medium border border-sage/20">
                            <Eye className="w-3.5 h-3.5" />
                            {member.permissions.filter((p) => p.canView).length} Vaults
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPermissionsModal(member)}
                            className="hover:bg-sage/10 hover:text-sage-dark"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setShowMemberMenu(showMemberMenu === member.id ? null : member.id)
                              }
                              className="hover:bg-sage/10"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>

                            {showMemberMenu === member.id && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-sage/20 rounded-xl shadow-xl overflow-hidden z-10">
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-sage/10 transition-colors">
                                  <Edit3 className="w-4 h-4 text-sage" />
                                  Edit Member
                                </button>
                                {member.status === "pending" && (
                                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-sage/10 transition-colors">
                                    <Send className="w-4 h-4 text-sage" />
                                    Resend Invite
                                  </button>
                                )}
                                <button
                                  onClick={() => removeMember(member.id)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Permissions Matrix Tab */}
        {activeTab === "permissions" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sage/10 to-sage-light/20 border border-sage/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sage/15 border border-sage/20">
                  <Shield className="w-5 h-5 text-sage-dark" />
                </div>
                <div>
                  <p className="font-medium text-sage-dark">Permission Matrix</p>
                  <p className="text-sm text-muted-foreground">
                    Control exactly what each member can access and when they can access it.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-sage/20 bg-card">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-sage/10 bg-sage-light/20">
                    <th className="p-4 text-left font-medium text-foreground">Member</th>
                    {vaultTypes.map((vault) => (
                      <th key={vault.id} className="p-4 text-center font-medium text-foreground">
                        <div className="flex flex-col items-center gap-1">
                          <vault.icon className="w-4 h-4 text-sage" />
                          <span className="text-xs">{vault.label}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b border-sage/10 hover:bg-sage-light/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage/30 to-sage-light/50 flex items-center justify-center text-sage-dark font-semibold text-sm">
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{member.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {getRoleInfo(member.role).label}
                            </p>
                          </div>
                        </div>
                      </td>
                      {vaultTypes.map((vault) => {
                        const perm = member.permissions.find((p) => p.vault === vault.id);
                        return (
                          <td key={vault.id} className="p-4 text-center">
                            <button
                              onClick={() =>
                                updatePermission(member.id, vault.id, {
                                  canView: !perm?.canView,
                                })
                              }
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                perm?.canView
                                  ? "bg-sage/15 text-sage-dark border border-sage/30"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {perm?.canView ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                            {perm?.canView && (
                              <p className="text-[10px] text-sage-dark/70 mt-1 capitalize">
                                {perm.condition.replace("_", " ")}
                              </p>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Legacy Unlock Tab */}
        {activeTab === "unlock" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-3xl bg-gradient-to-br from-sage/25 via-sage-light/35 to-sage/15 border border-sage/20 text-foreground">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/60 backdrop-blur border border-sage/20 shadow-sm">
                  <Key className="w-8 h-8 text-sage-dark" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium mb-2">Legacy Unlock System</h3>
                  <p className="text-muted-foreground">
                    When you're no longer here, your designated members can unlock your legacy.
                    Multiple members must verify to ensure security.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/80 to-sage-light/20 border border-amber-200/50">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100/80">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800">Verification Required</p>
                  <p className="text-sm text-amber-700/80">
                    At least 2 designated members must confirm before legacy can be unlocked.
                    A 7-day waiting period applies.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sage/15">
                <Unlock className="w-4 h-4 text-sage-dark" />
              </div>
              Members Who Can Unlock Legacy
            </h3>

            <div className="space-y-3">
              {members
                .filter((m) => m.canUnlockLegacy)
                .map((member) => {
                  const role = getRoleInfo(member.role);

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-5 rounded-2xl border border-sage/20 bg-gradient-to-r from-card to-sage-light/10 hover:border-sage/40 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center border border-rose-200/50">
                          <Key className="w-6 h-6 text-rose-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{role.label}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                        onClick={() =>
                          setMembers((prev) =>
                            prev.map((m) =>
                              m.id === member.id ? { ...m, canUnlockLegacy: false } : m
                            )
                          )
                        }
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Revoke Access
                      </Button>
                    </div>
                  );
                })}

              {members.filter((m) => !m.canUnlockLegacy).length > 0 && (
                <>
                  <h3 className="font-serif text-lg font-medium text-foreground mt-8 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-muted">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    Other Members
                  </h3>
                  {members
                    .filter((m) => !m.canUnlockLegacy)
                    .map((member) => {
                      const role = getRoleInfo(member.role);

                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-5 rounded-2xl border border-border bg-card opacity-70 hover:opacity-100 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{role.label}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-sage/30 hover:bg-sage/10 hover:border-sage"
                            onClick={() =>
                              setMembers((prev) =>
                                prev.map((m) =>
                                  m.id === member.id ? { ...m, canUnlockLegacy: true } : m
                                )
                              )
                            }
                          >
                            <Unlock className="w-4 h-4 mr-2" />
                            Grant Access
                          </Button>
                        </div>
                      );
                    })}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-sage/10 to-sage-light/20 border border-sage/20"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-sage/15 border border-sage/20">
              <Shield className="w-6 h-6 text-sage-dark" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">End-to-End Security</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sage mt-0.5" />
                  <span>All access is encrypted and verified</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sage mt-0.5" />
                  <span>Legacy unlock requires multi-person verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sage mt-0.5" />
                  <span>You can revoke access at any time</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Bottom decorative divider - Enhanced */}
        <div className="flex justify-center pt-16 pb-8">
          <div className="relative">
            {/* Main divider line */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-sage/50 to-sage/30 rounded-full animate-shimmer" />
              <FloatingLeaf className="opacity-60 animate-swing" style={{ animationDuration: "4s" }} size={28} variant={1} />
              <Sparkle className="animate-twinkle opacity-70" size={16} />
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-sage/50 to-sage-dark/40 animate-pulse shadow-lg shadow-sage/20" />
              <Sparkle className="animate-twinkle opacity-70" style={{ animationDelay: "0.5s" }} size={16} />
              <FloatingLeaf className="opacity-60 animate-swing rotate-45" style={{ animationDuration: "4s", animationDelay: "0.5s" }} size={28} variant={2} />
              <div className="w-24 h-0.5 bg-gradient-to-l from-transparent via-sage/50 to-sage/30 rounded-full animate-shimmer" />
            </div>

            {/* Floating elements around divider */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-sage/40 animate-float" style={{ animationDuration: "3s" }} />
            <div className="absolute -bottom-4 left-1/3 w-1.5 h-1.5 rounded-full bg-sage/30 animate-float" style={{ animationDuration: "4s", animationDelay: "1s" }} />
            <div className="absolute -bottom-3 right-1/3 w-2 h-2 rounded-full bg-sage/35 animate-float" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }} />
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-sage/20 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-sage/10 bg-gradient-to-r from-sage-light/20 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sage/15 border border-sage/20">
                      <UserPlus className="w-6 h-6 text-sage-dark" />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-medium text-foreground">Add to Trusted Circle</h2>
                      <p className="text-sm text-muted-foreground">
                        Invite someone to your legacy
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowInviteModal(false)} className="hover:bg-sage/10">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-sage/20 focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="john@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-sage/20 focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.id}
                          onClick={() => setForm((prev) => ({ ...prev, role: role.id }))}
                          className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                            form.role === role.id
                              ? "border-sage bg-sage/10"
                              : "border-border hover:border-sage/50"
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${role.bg}`}>
                            <Icon className={`w-4 h-4 ${role.color}`} />
                          </div>
                          <span className="text-sm font-medium text-foreground">{role.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Special Access</label>
                  <label className="flex items-center justify-between p-4 rounded-xl bg-rose-50/50 border border-rose-200/50 cursor-pointer hover:bg-rose-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-rose-500" />
                      <div>
                        <p className="font-medium text-foreground">Emergency Contact</p>
                        <p className="text-xs text-muted-foreground">
                          Will be notified in emergencies
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.isEmergencyContact}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, isEmergencyContact: e.target.checked }))
                      }
                      className="w-5 h-5 accent-rose-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-xl bg-sage/5 border border-sage/20 cursor-pointer hover:bg-sage/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-sage-dark" />
                      <div>
                        <p className="font-medium text-foreground">Can Unlock Legacy</p>
                        <p className="text-xs text-muted-foreground">
                          Can verify to unlock your legacy
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.canUnlockLegacy}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, canUnlockLegacy: e.target.checked }))
                      }
                      className="w-5 h-5 accent-sage"
                    />
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-sage/30 hover:bg-sage/10"
                    onClick={() => {
                      setShowInviteModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-sage hover:bg-sage-dark text-white"
                    onClick={handleInvite}
                    disabled={!form.name || !form.email}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Individual Permissions Modal */}
      <AnimatePresence>
        {showPermissionsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPermissionsModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-sage/20 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-sage/10 bg-gradient-to-r from-sage-light/20 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center font-semibold text-white">
                      {getInitials(showPermissionsModal.name)}
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-medium text-foreground">{showPermissionsModal.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {getRoleInfo(showPermissionsModal.role).label}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPermissionsModal(null)}
                    className="hover:bg-sage/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sage" />
                  Vault Access
                </h3>
                {vaultTypes.map((vault) => {
                  const perm = showPermissionsModal.permissions.find((p) => p.vault === vault.id);
                  const Icon = vault.icon;

                  return (
                    <div
                      key={vault.id}
                      className="p-4 rounded-xl border border-sage/15 bg-gradient-to-r from-card to-sage-light/5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-sage/10">
                            <Icon className="w-5 h-5 text-sage" />
                          </div>
                          <span className="font-medium text-foreground">{vault.label}</span>
                        </div>
                        <button
                          onClick={() =>
                            updatePermission(showPermissionsModal.id, vault.id, {
                              canView: !perm?.canView,
                            })
                          }
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            perm?.canView
                              ? "bg-sage/15 text-sage-dark border border-sage/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {perm?.canView ? "Can View" : "Hidden"}
                        </button>
                      </div>

                      {perm?.canView && (
                        <div className="flex flex-wrap gap-2">
                          {accessConditions.map((condition) => (
                            <button
                              key={condition.id}
                              onClick={() =>
                                updatePermission(showPermissionsModal.id, vault.id, {
                                  condition: condition.id,
                                })
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                perm.condition === condition.id
                                  ? "bg-sage text-white"
                                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
                              }`}
                            >
                              {condition.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-6 border-t border-sage/10 bg-gradient-to-r from-transparent to-sage-light/10">
                <Button className="w-full bg-sage hover:bg-sage-dark text-white" onClick={() => setShowPermissionsModal(null)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Permissions
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

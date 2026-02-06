"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Shield,
  Clock,
  X,
  Check,
  UserPlus,
  Heart,
  Edit3,
  Trash2,
  Send,
  User,
  CheckCircle2,
  Lock,
  Mic,
  Images,
  FileText,
  CreditCard,
  Loader2,
  Mail,
  UserCheck,
  ChevronRight,
  Settings,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  trustedCircleApi,
  type TrustedCircleInvite,
  type TrustedConnection,
  type AccessPermissions,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type TabType = "circle" | "invites" | "permissions";

const RELATIONSHIP_OPTIONS = [
  { id: "father", label: "Father" },
  { id: "mother", label: "Mother" },
  { id: "spouse", label: "Spouse/Partner" },
  { id: "child", label: "Child" },
  { id: "sibling", label: "Sibling" },
  { id: "grandparent", label: "Grandparent" },
  { id: "friend", label: "Close Friend" },
  { id: "other", label: "Other" },
];

const PERMISSION_ITEMS = [
  { key: "canAccessVoice", label: "Voice Messages", icon: Mic },
  { key: "canAccessMemories", label: "Memories & Photos", icon: Images },
  { key: "canAccessStories", label: "Life Stories", icon: FileText },
  { key: "canAccessVault", label: "Vault Documents", icon: CreditCard },
  { key: "canAccessLegacy", label: "Legacy Instructions", icon: Lock },
];

// ═══════════════════════════════════════════════════════════════════════════════
// DECORATIONS - Matching the app's exact design language from voice/memories pages
// ═══════════════════════════════════════════════════════════════════════════════

const FloatingLeaf = ({ className, style, size = 40, variant = 1 }: { className?: string; style?: React.CSSProperties; size?: number; variant?: number }) => {
  const paths = [
    "M20 2C20 2 8 12 8 24C8 32 13 38 20 38C27 38 32 32 32 24C32 12 20 2 20 2Z",
    "M20 2C15 8 8 15 8 24C8 30 12 36 20 38C28 36 32 30 32 24C32 15 25 8 20 2Z",
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

const Sparkle = ({ className, style, size = 20 }: { className?: string; style?: React.CSSProperties; size?: number }) => (
  <svg className={className} style={style} width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path
      d="M10 0L11.5 8.5L20 10L11.5 11.5L10 20L8.5 11.5L0 10L8.5 8.5L10 0Z"
      fill="hsl(var(--sage))"
      fillOpacity="0.5"
    />
  </svg>
);

// Network/Connection decoration specific to this page
const NetworkDecoration = ({ className }: { className?: string }) => (
  <svg className={className} width="80" height="80" viewBox="0 0 80 80" fill="none">
    <circle cx="20" cy="20" r="8" fill="hsl(var(--sage))" fillOpacity="0.15" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.4" className="animate-pulse" />
    <circle cx="60" cy="20" r="8" fill="hsl(var(--sage))" fillOpacity="0.15" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.4" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
    <circle cx="40" cy="50" r="10" fill="hsl(var(--sage))" fillOpacity="0.2" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.5" className="animate-breathe" />
    <circle cx="15" cy="60" r="6" fill="hsl(var(--sage))" fillOpacity="0.1" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.3" />
    <circle cx="65" cy="60" r="6" fill="hsl(var(--sage))" fillOpacity="0.1" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.3" />
    <path d="M26 24L34 44" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" strokeDasharray="4 4" />
    <path d="M54 24L46 44" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" strokeDasharray="4 4" />
    <path d="M32 54L20 58" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.25" strokeLinecap="round" strokeDasharray="3 3" />
    <path d="M48 54L60 58" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.25" strokeLinecap="round" strokeDasharray="3 3" />
  </svg>
);

const GentleRings = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} width="70" height="70" viewBox="0 0 70 70" fill="none">
    <circle cx="35" cy="35" r="30" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="5 5" className="animate-rotate-gentle" style={{ transformOrigin: 'center' }} />
    <circle cx="35" cy="35" r="20" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.3" className="animate-rotate-gentle" style={{ transformOrigin: 'center', animationDirection: 'reverse', animationDuration: '25s' }} />
    <circle cx="35" cy="35" r="10" fill="hsl(var(--sage))" fillOpacity="0.08" />
  </svg>
);

const HeartDecoration = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} width="50" height="50" viewBox="0 0 50 50" fill="none">
    <path
      d="M25 44C25 44 6 32 6 18C6 12 11 6 18 6C22 6 25 10 25 10C25 10 28 6 32 6C39 6 44 12 44 18C44 32 25 44 25 44Z"
      fill="hsl(var(--sage))"
      fillOpacity="0.12"
      stroke="hsl(var(--sage))"
      strokeWidth="1.5"
      strokeOpacity="0.35"
    />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function TrustedCirclePage() {
  const searchParams = useSearchParams();
  const { refreshPendingInvites } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<TabType>("circle");
  const [isLoading, setIsLoading] = useState(true);
  const [connections, setConnections] = useState<TrustedConnection[]>([]);
  const [sentInvites, setSentInvites] = useState<TrustedCircleInvite[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<TrustedCircleInvite[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState<TrustedCircleInvite | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState<TrustedConnection | null>(null);

  // Handle tab from URL
  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab === "invites") setActiveTab("invites");
    else if (tab === "permissions") setActiveTab("permissions");
    else setActiveTab("circle");
  }, [searchParams]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [connectionsRes, invitesRes] = await Promise.all([
        trustedCircleApi.getConnections(),
        trustedCircleApi.getInvites("all"),
      ]);
      setConnections(connectionsRes.connections);
      setSentInvites(invitesRes.sent.filter((i: TrustedCircleInvite) => i.status === "pending"));
      setReceivedInvites(invitesRes.received.filter((i: TrustedCircleInvite) => i.status === "pending"));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load trusted circle data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tab content
  const tabs = [
    { id: "circle" as TabType, label: "My Circle", icon: Users, count: connections.length },
    { id: "invites" as TabType, label: "Invites", icon: Mail, count: receivedInvites.length + sentInvites.length },
    { id: "permissions" as TabType, label: "Permissions", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-sage-light/10 relative">
      {/* Background decorations - matching voice/memories pages exactly */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Morphing background blobs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-sage/12 rounded-full blur-3xl animate-blob-morph" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-sage-light/28 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-5s" }} />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-sage/8 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-10s" }} />

        {/* Floating leaves with varied animations */}
        <FloatingLeaf className="absolute top-28 left-[8%] animate-float-rotate opacity-55" style={{ animationDuration: "10s" }} size={50} variant={1} />
        <FloatingLeaf className="absolute top-[45%] right-[5%] animate-sway opacity-45 rotate-45" style={{ animationDuration: "6s" }} size={45} variant={2} />
        <FloatingLeaf className="absolute bottom-[25%] left-[6%] animate-drift opacity-40 -rotate-12" style={{ animationDuration: "12s" }} size={52} variant={3} />
        <FloatingLeaf className="absolute top-[60%] right-[10%] animate-wave opacity-35" style={{ animationDuration: "8s" }} size={38} variant={1} />
        <FloatingLeaf className="absolute top-[22%] left-[15%] animate-swing opacity-30" style={{ animationDuration: "4s" }} size={35} variant={2} />

        {/* Network decorations - specific to family page */}
        <NetworkDecoration className="absolute top-32 right-[18%] opacity-50" />
        <NetworkDecoration className="absolute bottom-40 left-[22%] opacity-40" />

        {/* Heart decorations */}
        <HeartDecoration className="absolute top-[40%] left-[3%] opacity-35 animate-heartbeat" />
        <HeartDecoration className="absolute bottom-[30%] right-[4%] opacity-30 animate-heartbeat" style={{ animationDelay: "1s" }} />

        {/* Gentle rings */}
        <GentleRings className="absolute top-[15%] right-[28%] opacity-25" />
        <GentleRings className="absolute bottom-[25%] left-[15%] opacity-20" style={{ transform: "scale(0.7)" }} />

        {/* Sparkles */}
        <Sparkle className="absolute top-36 left-[25%] animate-twinkle opacity-55" style={{ animationDelay: "0s" }} size={16} />
        <Sparkle className="absolute top-[50%] right-[30%] animate-twinkle opacity-50" style={{ animationDelay: "0.7s" }} size={20} />
        <Sparkle className="absolute bottom-32 right-[45%] animate-twinkle opacity-45" style={{ animationDelay: "1.4s" }} size={14} />
        <Sparkle className="absolute top-[68%] left-[20%] animate-twinkle opacity-40" style={{ animationDelay: "2.1s" }} size={18} />

        {/* Firefly particles */}
        <div className="absolute top-36 left-[28%] w-3 h-3 rounded-full bg-sage/50 animate-firefly" style={{ animationDuration: "8s" }} />
        <div className="absolute top-[50%] right-[32%] w-4 h-4 rounded-full bg-sage/40 animate-firefly" style={{ animationDuration: "10s", animationDelay: "2s" }} />
        <div className="absolute bottom-32 right-[48%] w-3 h-3 rounded-full bg-sage/45 animate-firefly" style={{ animationDuration: "9s", animationDelay: "4s" }} />

        {/* Animated decorative lines */}
        <svg className="absolute top-16 left-0 w-full h-28 opacity-20" viewBox="0 0 1200 110" preserveAspectRatio="none">
          <path d="M0,55 Q200,25 400,55 T800,55 T1200,55" fill="none" stroke="hsl(var(--sage))" strokeWidth="2" className="animate-line-flow" />
          <path d="M0,75 Q300,45 600,75 T1200,75" fill="none" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.6" className="animate-line-flow" style={{ animationDelay: "-2s" }} />
        </svg>
        <svg className="absolute bottom-16 left-0 w-full h-20 opacity-15" viewBox="0 0 1200 80" preserveAspectRatio="none">
          <path d="M0,40 C200,10 400,70 600,40 C800,10 1000,70 1200,40" fill="none" stroke="hsl(var(--sage))" strokeWidth="1.5" className="animate-line-flow" style={{ animationDirection: "reverse" }} />
        </svg>
      </div>

      <div className="container mx-auto px-6 py-8 relative">
        {/* Header - matching voice/memories page exactly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-sage-dark hover:bg-sage/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-medium text-foreground">
              Trusted <span className="text-sage-dark">Circle</span>
            </h1>
            <p className="text-muted-foreground">Your connected family network — people who trust you and you trust them</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Card - Invite */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative rounded-3xl bg-gradient-to-br from-card to-sage-light/10 border border-sage/20 p-8 overflow-hidden"
            >
              {/* Decorative element */}
              <div className="absolute top-4 right-4 opacity-30">
                <FloatingLeaf size={30} className="animate-float" style={{ animationDuration: "6s" }} />
              </div>

              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-sage/20 flex items-center justify-center border border-sage/20">
                        <Users className="w-6 h-6 text-sage-dark" />
                      </div>
                      <div>
                        <h2 className="font-serif text-xl font-medium text-foreground">Invite Family</h2>
                        <p className="text-sm text-muted-foreground">Add loved ones to your circle</p>
                      </div>
                    </div>
                  </div>

                  {/* INVITE BUTTON - Matching voice page style */}
                  <motion.button
                    onClick={() => setShowInviteModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-br from-sage to-sage-dark text-white shadow-lg shadow-sage/30 flex items-center justify-center gap-2 font-medium"
                  >
                    <UserPlus className="w-5 h-5" />
                    Invite Family Member
                  </motion.button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-sage/15">
                  <div className="text-center">
                    <div className="text-3xl font-light text-foreground">{connections.length}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Connected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-light text-amber-600">{receivedInvites.length}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-light text-sage-dark">{sentInvites.length}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Sent</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pending Invites Alert */}
            {receivedInvites.length > 0 && activeTab !== "invites" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/80 border border-amber-200/50 p-5"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center border border-amber-200/50">
                      <Mail className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {receivedInvites.length} pending {receivedInvites.length === 1 ? "invitation" : "invitations"}!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Family members want to connect with you
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab("invites")}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    View Invites
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2 p-1.5 rounded-2xl bg-sage/10 border border-sage/15"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    activeTab === tab.id
                      ? "bg-white text-sage-dark shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      activeTab === tab.id
                        ? "bg-sage/15 text-sage-dark"
                        : "bg-sage/10 text-muted-foreground"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {isLoading ? (
                <div className="rounded-3xl bg-gradient-to-br from-card to-sage-light/10 border border-sage/20 p-12 text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-sage mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading your trusted circle...</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {activeTab === "circle" && (
                    <CircleTab
                      key="circle"
                      connections={connections}
                      onRefresh={fetchData}
                      onEditPermissions={setShowPermissionsModal}
                      onInvite={() => setShowInviteModal(true)}
                    />
                  )}
                  {activeTab === "invites" && (
                    <InvitesTab
                      key="invites"
                      sentInvites={sentInvites}
                      receivedInvites={receivedInvites}
                      onRefresh={() => {
                        fetchData();
                        refreshPendingInvites();
                      }}
                      onAccept={setShowAcceptModal}
                    />
                  )}
                  {activeTab === "permissions" && (
                    <PermissionsTab
                      key="permissions"
                      connections={connections}
                      onEditPermissions={setShowPermissionsModal}
                    />
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          </div>

          {/* Right Column - Tips (matching voice/memories pattern) */}
          <div className="space-y-6">
            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-gradient-to-br from-sage/15 to-sage-light/25 border border-sage/20 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sage/20 flex items-center justify-center shrink-0 border border-sage/20">
                  <Heart className="w-6 h-6 text-sage-dark" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Building Your Circle</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage mt-1.5 shrink-0" />
                      Invite close family members you trust completely
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage mt-1.5 shrink-0" />
                      Both parties must accept to form a connection
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage mt-1.5 shrink-0" />
                      Control what each person can access
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage mt-1.5 shrink-0" />
                      Your trusted circle can access your legacy when needed
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* How It Works Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-card border border-sage/15 p-6"
            >
              <h3 className="font-serif text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sage/15">
                  <Shield className="w-4 h-4 text-sage-dark" />
                </div>
                How It Works
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-sage/20 flex items-center justify-center text-sm font-medium text-sage-dark shrink-0">1</div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Send Invitation</p>
                    <p className="text-xs text-muted-foreground">Invite family by their email</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-sage/20 flex items-center justify-center text-sm font-medium text-sage-dark shrink-0">2</div>
                  <div>
                    <p className="font-medium text-foreground text-sm">They Accept</p>
                    <p className="text-xs text-muted-foreground">They choose their relationship to you</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-sage/20 flex items-center justify-center text-sm font-medium text-sage-dark shrink-0">3</div>
                  <div>
                    <p className="font-medium text-foreground text-sm">You&apos;re Connected</p>
                    <p className="text-xs text-muted-foreground">A bidirectional trust is formed</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom decorative divider - matching voice/memories pages */}
        <div className="flex justify-center pt-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-sage/40 to-sage/20 rounded-full" />
            <FloatingLeaf className="opacity-50 animate-float" style={{ animationDuration: "6s" }} size={24} />
            <div className="w-3 h-3 rounded-full bg-sage/40 animate-pulse" />
            <FloatingLeaf className="opacity-50 animate-float rotate-45" style={{ animationDuration: "6s", animationDelay: "1s" }} size={24} />
            <div className="w-16 h-0.5 bg-gradient-to-l from-transparent via-sage/40 to-sage/20 rounded-full" />
          </div>
        </div>

        {/* Modals */}
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            fetchData();
          }}
        />

        <AcceptInviteModal
          invite={showAcceptModal}
          onClose={() => setShowAcceptModal(null)}
          onSuccess={() => {
            setShowAcceptModal(null);
            fetchData();
            refreshPendingInvites();
          }}
        />

        <EditPermissionsModal
          connection={showPermissionsModal}
          onClose={() => setShowPermissionsModal(null)}
          onSuccess={() => {
            setShowPermissionsModal(null);
            fetchData();
          }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CIRCLE TAB
// ═══════════════════════════════════════════════════════════════════════════════

function CircleTab({
  connections,
  onRefresh,
  onEditPermissions,
  onInvite,
}: {
  connections: TrustedConnection[];
  onRefresh: () => void;
  onEditPermissions: (conn: TrustedConnection) => void;
  onInvite: () => void;
}) {
  const handleRemove = async (connection: TrustedConnection) => {
    if (!confirm(`Are you sure you want to remove ${connection.connectedUser.name} from your Trusted Circle?`)) {
      return;
    }

    try {
      await trustedCircleApi.removeConnection(connection.id);
      toast.success(`${connection.connectedUser.name} removed from your circle`);
      onRefresh();
    } catch (error) {
      toast.error("Failed to remove connection");
    }
  };

  if (connections.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="rounded-3xl bg-gradient-to-br from-card to-sage-light/10 border border-sage/20 p-12 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sage/15 to-sage-light/30 flex items-center justify-center mx-auto mb-4 border-2 border-sage/20">
          <Users className="w-10 h-10 text-sage-dark" />
        </div>
        <h3 className="font-serif text-xl font-medium text-foreground mb-2">
          Your circle is empty
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          Start building your trusted circle by inviting family members
        </p>
        <motion.button
          onClick={onInvite}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-xl bg-gradient-to-br from-sage to-sage-dark text-white shadow-lg shadow-sage/30 inline-flex items-center gap-2 font-medium"
        >
          <UserPlus className="w-5 h-5" />
          Invite Your First Family Member
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-3"
    >
      {connections.map((connection, index) => (
        <motion.div
          key={connection.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group rounded-2xl border bg-card border-sage/15 p-4 transition-all duration-300 hover:border-sage/30 hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-xl bg-sage/15 flex items-center justify-center shrink-0 border border-sage/20">
              {connection.connectedUser.avatar ? (
                <img
                  src={connection.connectedUser.avatar}
                  alt={connection.connectedUser.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-sage-dark" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">
                {connection.connectedUser.name}
              </h4>
              <p className="text-sm text-muted-foreground truncate">
                {connection.connectedUser.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-sage/10 text-sage-dark">
                  {connection.myRelationshipToThem}
                </span>
                <span className="text-xs text-muted-foreground">
                  Connected {formatDate(connection.connectedAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditPermissions(connection)}
                className="text-muted-foreground hover:text-sage-dark hover:bg-sage/10"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(connection)}
                className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVITES TAB
// ═══════════════════════════════════════════════════════════════════════════════

function InvitesTab({
  sentInvites,
  receivedInvites,
  onRefresh,
  onAccept,
}: {
  sentInvites: TrustedCircleInvite[];
  receivedInvites: TrustedCircleInvite[];
  onRefresh: () => void;
  onAccept: (invite: TrustedCircleInvite) => void;
}) {
  const handleReject = async (invite: TrustedCircleInvite) => {
    try {
      await trustedCircleApi.rejectInvite(invite.id);
      toast.success("Invitation declined");
      onRefresh();
    } catch (error) {
      toast.error("Failed to decline invitation");
    }
  };

  const handleCancel = async (invite: TrustedCircleInvite) => {
    try {
      await trustedCircleApi.cancelInvite(invite.id);
      toast.success("Invitation cancelled");
      onRefresh();
    } catch (error) {
      toast.error("Failed to cancel invitation");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Received Invites */}
      <section>
        <h2 className="font-serif text-lg font-medium text-foreground mb-4 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100">
            <Mail className="w-4 h-4 text-amber-600" />
          </div>
          Received Invitations
          {receivedInvites.length > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              {receivedInvites.length} new
            </span>
          )}
        </h2>

        {receivedInvites.length === 0 ? (
          <div className="rounded-2xl bg-card border border-sage/15 p-8 text-center">
            <Mail className="w-10 h-10 text-sage/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No pending invitations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {receivedInvites.map((invite, index) => (
              <motion.div
                key={invite.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-200/50 p-5"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center border border-amber-200/50">
                      {invite.sender.avatar ? (
                        <img
                          src={invite.sender.avatar}
                          alt={invite.sender.name}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {invite.sender.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{invite.sender.email}</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Wants to add you as their <span className="font-medium">{invite.relationshipToSender}</span>
                      </p>
                      {invite.message && (
                        <p className="text-sm text-muted-foreground mt-2 italic bg-white/60 px-3 py-2 rounded-lg">
                          <MessageCircle className="w-3 h-3 inline mr-1" />
                          &quot;{invite.message}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => onAccept(invite)}
                      className="bg-sage hover:bg-sage-dark text-white gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReject(invite)}
                      className="border-rose-200 text-rose-500 hover:bg-rose-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Sent Invites */}
      <section>
        <h2 className="font-serif text-lg font-medium text-foreground mb-4 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sage/15">
            <Send className="w-4 h-4 text-sage-dark" />
          </div>
          Sent Invitations
        </h2>

        {sentInvites.length === 0 ? (
          <div className="rounded-2xl bg-card border border-sage/15 p-8 text-center">
            <Send className="w-10 h-10 text-sage/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No pending sent invitations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sentInvites.map((invite, index) => (
              <motion.div
                key={invite.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl bg-card border border-sage/15 p-5"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sage/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-sage-dark" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{invite.inviteeName}</h3>
                      <p className="text-sm text-muted-foreground">{invite.inviteeEmail}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Invited as {invite.relationshipToSender} • Sent {formatDate(invite.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3 h-3" />
                      Waiting for response
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(invite)}
                      className="text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERMISSIONS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function PermissionsTab({
  connections,
  onEditPermissions,
}: {
  connections: TrustedConnection[];
  onEditPermissions: (conn: TrustedConnection) => void;
}) {
  if (connections.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="rounded-3xl bg-gradient-to-br from-card to-sage-light/10 border border-sage/20 p-12 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sage/15 to-sage-light/30 flex items-center justify-center mx-auto mb-4 border-2 border-sage/20">
          <Shield className="w-10 h-10 text-sage-dark" />
        </div>
        <h3 className="font-serif text-xl font-medium text-foreground mb-2">No Permissions to Manage</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Once you have connections in your trusted circle, you can manage what they can access here.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="rounded-2xl bg-card border border-sage/15 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-sage/5">
                <th className="text-left px-5 py-4 text-sm font-medium text-foreground">Person</th>
                {PERMISSION_ITEMS.map((perm) => (
                  <th key={perm.key} className="text-center px-3 py-4 text-sm font-medium text-foreground">
                    <div className="flex flex-col items-center gap-1.5">
                      <perm.icon className="w-4 h-4 text-sage-dark" />
                      <span className="text-xs text-muted-foreground">{perm.label.split(" ")[0]}</span>
                    </div>
                  </th>
                ))}
                <th className="text-center px-5 py-4 text-sm font-medium text-foreground">Edit</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((connection) => (
                <tr key={connection.id} className="border-t border-sage/10 hover:bg-sage/5 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-sage-dark" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{connection.connectedUser.name}</p>
                        <p className="text-xs text-muted-foreground">{connection.myRelationshipToThem}</p>
                      </div>
                    </div>
                  </td>
                  {PERMISSION_ITEMS.map((perm) => (
                    <td key={perm.key} className="text-center px-3 py-4">
                      {connection.myPermissionsToThem[perm.key as keyof AccessPermissions] ? (
                        <CheckCircle2 className="w-5 h-5 text-sage mx-auto" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-sage/20 mx-auto" />
                      )}
                    </td>
                  ))}
                  <td className="text-center px-5 py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditPermissions(connection)}
                      className="text-sage-dark hover:bg-sage/10"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4 text-center">
        This shows what you&apos;ve granted access to. Click Edit to change permissions.
      </p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════════════════════

function InviteModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    relationship: "",
    message: "",
    permissions: {
      canAccessVoice: true,
      canAccessMemories: true,
      canAccessStories: true,
      canAccessVault: false,
      canAccessLegacy: false,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await trustedCircleApi.sendInvite({
        email: formData.email,
        name: formData.name,
        relationship: formData.relationship,
        permissions: formData.permissions,
        message: formData.message || undefined,
      });
      toast.success(`Invitation sent to ${formData.name}!`);
      setFormData({
        email: "",
        name: "",
        relationship: "",
        message: "",
        permissions: {
          canAccessVoice: true,
          canAccessMemories: true,
          canAccessStories: true,
          canAccessVault: false,
          canAccessLegacy: false,
        },
      });
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-sage/20"
      >
        <div className="p-6 border-b border-sage/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage/15 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-sage-dark" />
              </div>
              <h2 className="font-serif text-xl font-medium text-foreground">Invite Family Member</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center text-muted-foreground hover:bg-sage/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Their Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-sage/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-transparent transition-all bg-background text-foreground"
              placeholder="family@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Their Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-sage/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-transparent transition-all bg-background text-foreground"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Relationship to Them
            </label>
            <select
              required
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className="w-full px-4 py-3 border border-sage/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-transparent transition-all bg-background text-foreground"
            >
              <option value="">Select relationship...</option>
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Personal Message <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 border border-sage/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-transparent transition-all resize-none bg-background text-foreground"
              rows={2}
              placeholder="Add a personal note to your invitation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              What can they access?
            </label>
            <div className="space-y-2 bg-sage/5 rounded-xl p-4 border border-sage/10">
              {PERMISSION_ITEMS.map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions[perm.key as keyof typeof formData.permissions]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          [perm.key]: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 text-sage rounded-md border-sage/30 focus:ring-sage"
                  />
                  <perm.icon className="w-5 h-5 text-sage-dark" />
                  <span className="text-foreground">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 py-3 border-sage/20"
            >
              Cancel
            </Button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-br from-sage to-sage-dark text-white shadow-md disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Invitation
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function AcceptInviteModal({
  invite,
  onClose,
  onSuccess,
}: {
  invite: TrustedCircleInvite | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reciprocalRelationship, setReciprocalRelationship] = useState("");
  const [permissions, setPermissions] = useState({
    canAccessVoice: true,
    canAccessMemories: true,
    canAccessStories: true,
    canAccessVault: false,
    canAccessLegacy: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) return;

    setIsSubmitting(true);
    try {
      await trustedCircleApi.acceptInvite(invite.id, {
        reciprocalRelationship,
        grantedPermissions: permissions,
      });
      toast.success(`You are now connected with ${invite.sender.name}!`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to accept invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!invite) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-sage/20"
      >
        <div className="p-6 border-b border-sage/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage/15 flex items-center justify-center">
                <Check className="w-5 h-5 text-sage-dark" />
              </div>
              <h2 className="font-serif text-xl font-medium text-foreground">Accept Invitation</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center text-muted-foreground hover:bg-sage/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Invite Info */}
          <div className="rounded-xl bg-sage/5 border border-sage/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sage/15 flex items-center justify-center">
                <User className="w-6 h-6 text-sage-dark" />
              </div>
              <div>
                <p className="font-medium text-foreground">{invite.sender.name}</p>
                <p className="text-sm text-muted-foreground">
                  wants to add you as their <span className="text-sage-dark font-medium">{invite.relationshipToSender}</span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              What is {invite.sender.name.split(" ")[0]} to you?
            </label>
            <select
              required
              value={reciprocalRelationship}
              onChange={(e) => setReciprocalRelationship(e.target.value)}
              className="w-full px-4 py-3 border border-sage/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-transparent transition-all bg-background text-foreground"
            >
              <option value="">Select your relationship...</option>
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              What can {invite.sender.name.split(" ")[0]} access?
            </label>
            <div className="space-y-2 bg-sage/5 rounded-xl p-4 border border-sage/10">
              {PERMISSION_ITEMS.map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={permissions[perm.key as keyof typeof permissions]}
                    onChange={(e) =>
                      setPermissions({
                        ...permissions,
                        [perm.key]: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-sage rounded-md border-sage/30 focus:ring-sage"
                  />
                  <perm.icon className="w-5 h-5 text-sage-dark" />
                  <span className="text-foreground">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 py-3 border-sage/20"
            >
              Cancel
            </Button>
            <motion.button
              type="submit"
              disabled={isSubmitting || !reciprocalRelationship}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-br from-sage to-sage-dark text-white shadow-md disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Accept & Connect
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function EditPermissionsModal({
  connection,
  onClose,
  onSuccess,
}: {
  connection: TrustedConnection | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<Partial<AccessPermissions>>({});

  useEffect(() => {
    if (connection) {
      setPermissions({ ...connection.myPermissionsToThem });
    }
  }, [connection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connection) return;

    setIsSubmitting(true);
    try {
      await trustedCircleApi.updateConnectionPermissions(connection.id, permissions);
      toast.success("Permissions updated");
      onSuccess();
    } catch (error) {
      toast.error("Failed to update permissions");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!connection) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card rounded-3xl max-w-lg w-full shadow-2xl border border-sage/20"
      >
        <div className="p-6 border-b border-sage/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage/15 flex items-center justify-center">
                <Shield className="w-5 h-5 text-sage-dark" />
              </div>
              <h2 className="font-serif text-xl font-medium text-foreground">Edit Permissions</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center text-muted-foreground hover:bg-sage/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Connection Info */}
          <div className="rounded-xl bg-sage/5 border border-sage/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sage/15 flex items-center justify-center">
                <User className="w-6 h-6 text-sage-dark" />
              </div>
              <div>
                <p className="font-medium text-foreground">{connection.connectedUser.name}</p>
                <p className="text-sm text-muted-foreground">{connection.myRelationshipToThem}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              What can {connection.connectedUser.name.split(" ")[0]} access?
            </label>
            <div className="space-y-2 bg-sage/5 rounded-xl p-4 border border-sage/10">
              {PERMISSION_ITEMS.map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={permissions[perm.key as keyof typeof permissions] as boolean || false}
                    onChange={(e) =>
                      setPermissions({
                        ...permissions,
                        [perm.key]: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-sage rounded-md border-sage/30 focus:ring-sage"
                  />
                  <perm.icon className="w-5 h-5 text-sage-dark" />
                  <span className="text-foreground">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 py-3 border-sage/20"
            >
              Cancel
            </Button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-br from-sage to-sage-dark text-white shadow-md disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

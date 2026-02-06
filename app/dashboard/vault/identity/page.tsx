"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Plus,
  CreditCard,
  FileText,
  Plane,
  Car,
  Vote,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  X,
  Sparkles,
  Lock,
  Fingerprint,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Leaf,
  Users,
  User,
  Heart,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FamilyVaultToggle } from "@/components/vault/FamilyVaultToggle";
import { FamilyMemberSection } from "@/components/vault/FamilyMemberSection";
import { toast } from "sonner";

type DocumentType = "aadhaar" | "pan" | "passport" | "driving" | "voter" | "other";

interface Document {
  id: string;
  type: DocumentType;
  name: string;
  number: string;
  expiryDate?: string;
  issueDate?: string;
  notes?: string;
  fileUrl?: string;
}

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  lifeStatus: string;
}

interface FamilyVaultItem {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  identityDoc?: {
    type: string;
    documentNumber?: string | null;
    issueDate?: string | null;
    expiryDate?: string | null;
  } | null;
  expiryDate?: string | null;
  createdAt: string;
}

interface FamilyMemberData {
  user: FamilyMember;
  vaultItems: FamilyVaultItem[];
  counts: Record<string, number>;
}

// Sage-themed document types with warm accents
const documentTypes = [
  { id: "aadhaar", name: "Aadhaar Card", icon: Fingerprint, accentType: "sage" },
  { id: "pan", name: "PAN Card", icon: CreditCard, accentType: "sage" },
  { id: "passport", name: "Passport", icon: Plane, accentType: "rose" },
  { id: "driving", name: "Driving License", icon: Car, accentType: "sage" },
  { id: "voter", name: "Voter ID", icon: Vote, accentType: "amber" },
  { id: "other", name: "Other Document", icon: FileText, accentType: "sage" },
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

export default function IdentityPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({});
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Family Vault State
  const [vaultMode, setVaultMode] = useState<"personal" | "family">("personal");
  const [familyData, setFamilyData] = useState<{
    currentUser: FamilyMemberData | null;
    familyMembers: FamilyMemberData[];
    totalMembers: number;
  } | null>(null);
  const [loadingFamily, setLoadingFamily] = useState(false);

  // Fetch personal documents on mount
  useEffect(() => {
    setMounted(true);
    fetchDocuments();
  }, []);

  // Fetch family vault data when switching to family mode
  useEffect(() => {
    if (vaultMode === "family") {
      fetchFamilyData();
    }
  }, [vaultMode]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vault/identity");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();

      // Transform API response to Document format
      const docs: Document[] = data.documents.map((item: {
        id: string;
        name: string;
        description?: string | null;
        expiryDate?: string | null;
        identityDoc?: {
          type: string;
          documentNumber?: string | null;
          issueDate?: string | null;
          expiryDate?: string | null;
        } | null;
      }) => ({
        id: item.id,
        type: (item.identityDoc?.type || "other") as DocumentType,
        name: item.name,
        number: item.identityDoc?.documentNumber || "",
        expiryDate: item.identityDoc?.expiryDate ? new Date(item.identityDoc.expiryDate).toISOString().split("T")[0] : undefined,
        issueDate: item.identityDoc?.issueDate ? new Date(item.identityDoc.issueDate).toISOString().split("T")[0] : undefined,
        notes: item.description || undefined,
      }));

      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyData = async () => {
    setLoadingFamily(true);
    try {
      const res = await fetch("/api/vault/family?category=identity");
      if (!res.ok) throw new Error("Failed to fetch family data");
      const data = await res.json();
      setFamilyData(data);
    } catch (error) {
      console.error("Error fetching family vault:", error);
      toast.error("Failed to load family vault data");
    } finally {
      setLoadingFamily(false);
    }
  };

  const saveDocument = async (doc: Omit<Document, "id">) => {
    setSaving(true);
    try {
      const res = await fetch("/api/vault/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: doc.type,
          name: doc.name,
          documentNumber: doc.number,
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          notes: doc.notes,
        }),
      });

      if (!res.ok) throw new Error("Failed to save document");

      toast.success("Document saved successfully!");
      fetchDocuments(); // Refresh the list
      setShowAddModal(false);
      setSelectedType(null);
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  const updateDocument = async (id: string, doc: Partial<Document>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/vault/identity/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: doc.type,
          name: doc.name,
          documentNumber: doc.number,
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          notes: doc.notes,
        }),
      });

      if (!res.ok) throw new Error("Failed to update document");

      toast.success("Document updated successfully!");
      fetchDocuments(); // Refresh the list
      setEditingDoc(null);
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update document");
    } finally {
      setSaving(false);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/vault/identity/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete document");

      toast.success("Document deleted");
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  const toggleNumber = (id: string) => {
    setShowNumbers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskNumber = (number: string, show: boolean) => {
    if (show) return number;
    if (number.length <= 4) return "••••";
    return "••••••••" + number.slice(-4);
  };

  const getDocTypeInfo = (type: DocumentType | string) => {
    return documentTypes.find((d) => d.id === type) || documentTypes[5];
  };

  const isExpiringSoon = (date?: string | null) => {
    if (!date) return false;
    const expiry = new Date(date);
    const today = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 90 && daysLeft > 0;
  };

  const isExpired = (date?: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  // Render a single document card (used for both personal and family views)
  const renderDocumentCard = (
    doc: Document | FamilyVaultItem,
    memberId?: string,
    memberName?: string,
    isReadOnly: boolean = false
  ) => {
    const isPersonalDoc = 'type' in doc;
    const docType = isPersonalDoc ? doc.type : (doc.identityDoc?.type || 'other');
    const docNumber = isPersonalDoc ? doc.number : (doc.identityDoc?.documentNumber || '');
    const docIssueDate = isPersonalDoc ? doc.issueDate : doc.identityDoc?.issueDate;
    const docExpiryDate = isPersonalDoc ? doc.expiryDate : (doc.identityDoc?.expiryDate || doc.expiryDate);
    const docNotes = isPersonalDoc ? doc.notes : doc.description;

    const typeInfo = getDocTypeInfo(docType);
    const Icon = typeInfo.icon;
    const accent = getAccentStyles(typeInfo.accentType);
    const expiringSoon = isExpiringSoon(docExpiryDate);
    const expired = isExpired(docExpiryDate);
    const showKey = `${memberId || 'personal'}-${doc.id}`;

    return (
      <motion.div
        key={doc.id}
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, x: -100 }}
        transition={{ type: "spring" }}
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
              {/* Icon */}
              <motion.div
                className={`p-4 rounded-2xl ${accent.iconBg}`}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Icon className={`w-7 h-7 ${accent.iconText}`} />
              </motion.div>

              {/* Info */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-serif text-xl font-medium">
                      {isPersonalDoc ? doc.name : typeInfo.name}
                    </h3>

                    {/* Family member badge */}
                    {memberName && !isReadOnly && (
                      <span className="px-2.5 py-1 rounded-full bg-sage/15 text-sage-dark text-xs font-medium flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        {memberName}
                      </span>
                    )}

                    {expired && (
                      <motion.span
                        className="px-2 py-1 rounded-full bg-red-50 text-red-500 text-xs font-medium flex items-center gap-1 border border-red-200/50"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Expired
                      </motion.span>
                    )}
                    {expiringSoon && !expired && (
                      <motion.span
                        className="px-2 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium flex items-center gap-1 border border-amber-200/50"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Calendar className="w-3 h-3" />
                        Expiring Soon
                      </motion.span>
                    )}
                  </div>

                  {/* Document Number */}
                  {docNumber && (
                    <div className="flex items-center gap-3 mt-2">
                      <motion.div
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sage-light/30 border border-sage/20"
                        whileHover={{ scale: 1.02 }}
                      >
                        <code className="text-sm font-mono font-semibold text-sage-dark">
                          {maskNumber(docNumber, showNumbers[showKey])}
                        </code>
                        <button
                          onClick={() => toggleNumber(showKey)}
                          className="p-1.5 rounded-lg hover:bg-sage/10 transition-colors"
                        >
                          {showNumbers[showKey] ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Dates */}
                {(docIssueDate || docExpiryDate) && (
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    {docIssueDate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Issued: {new Date(docIssueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    )}
                    {docExpiryDate && (
                      <div className={`flex items-center gap-2 ${expired ? "text-red-500 font-medium" : expiringSoon ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                        <Calendar className="w-4 h-4" />
                        <span>Expires: {new Date(docExpiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {docNotes && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                    {docNotes}
                  </p>
                )}
              </div>
            </div>

            {/* Actions - Only show for personal documents */}
            {!isReadOnly && isPersonalDoc && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingDoc(doc as Document)}
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
                    onClick={() => deleteDocument(doc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            )}
          </div>

          {/* File attachment indicator */}
          {(doc as Document).fileUrl && (
            <motion.div
              className="absolute bottom-4 right-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage/15 text-sage-dark text-xs font-medium border border-sage/30">
                <FileText className="w-3 h-3" />
                Document attached
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-8 relative"
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
            className="absolute top-60 -left-4 w-6 h-6"
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
          className="absolute top-0 right-0 w-64 h-64 bg-sage/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-48 h-48 bg-sage-light/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                className="p-4 rounded-2xl bg-sage/20 backdrop-blur-sm border border-sage/30"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Shield className="w-8 h-8 text-sage-dark" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-serif text-2xl font-medium text-foreground">
                    Identity <span className="text-sage">Documents</span>
                  </h1>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="w-5 h-5 text-amber-500/70" />
                  </motion.div>
                </div>
                <p className="text-muted-foreground">
                  Store your important identity documents securely
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Family/Personal Toggle */}
              <FamilyVaultToggle
                mode={vaultMode}
                onModeChange={setVaultMode}
                familyCount={familyData?.familyMembers.length || 0}
              />

              {vaultMode === "personal" && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="gap-2 bg-sage hover:bg-sage-dark text-white shadow-lg shadow-sage/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add Document
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-6 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-sage/20">
              <FileText className="w-4 h-4 text-sage" />
              <span className="text-foreground font-medium">
                {vaultMode === "personal"
                  ? `${documents.length} Documents`
                  : `${familyData?.totalMembers || 1} Family Members`
                }
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-sage/20">
              <Lock className="w-4 h-4 text-sage" />
              <span className="text-foreground font-medium">Encrypted</span>
            </div>
            {vaultMode === "family" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sage/15 border border-sage/30"
              >
                <Users className="w-4 h-4 text-sage-dark" />
                <span className="text-sage-dark font-medium">Family View</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Content based on mode */}
      <AnimatePresence mode="wait">
        {vaultMode === "personal" ? (
          /* Personal Documents View */
          <motion.div
            key="personal"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {loading ? (
              /* Loading State */
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  className="w-16 h-16 rounded-full border-4 border-sage/30 border-t-sage"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="mt-4 text-muted-foreground">Loading your documents...</p>
              </div>
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  {documents.map((doc) => renderDocumentCard(doc))}
                </AnimatePresence>

                {/* Empty State */}
                {documents.length === 0 && (
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
                      <Shield className="w-12 h-12 text-sage" />
                    </motion.div>
                    <h3 className="font-serif text-xl font-medium mb-2">No documents yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start by adding your identity documents
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={() => setShowAddModal(true)} size="lg" className="gap-2 bg-sage hover:bg-sage-dark">
                        <Plus className="w-4 h-4" />
                        Add Your First Document
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          /* Family Documents View - Enhanced UI */
          <motion.div
            key="family"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {loadingFamily ? (
              /* Loading State */
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  className="w-16 h-16 rounded-full border-4 border-sage/30 border-t-sage"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="mt-4 text-muted-foreground">Loading family vault...</p>
              </div>
            ) : familyData ? (
              <>
                {/* Beautiful Family Overview Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage/20 via-sage-light/30 to-rose-50/20 border border-sage/20 p-6"
                >
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-sage/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-100/30 rounded-full blur-3xl" />

                  {/* Floating hearts */}
                  <motion.div
                    className="absolute top-4 right-8"
                    animate={{ y: [0, -8, 0], rotate: [-5, 5, -5] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Heart className="w-5 h-5 text-rose-300/50 fill-rose-300/30" />
                  </motion.div>
                  <motion.div
                    className="absolute bottom-6 right-20"
                    animate={{ y: [0, -5, 0], rotate: [5, -5, 5] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  >
                    <Heart className="w-4 h-4 text-sage/40 fill-sage/20" />
                  </motion.div>

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="p-3 rounded-2xl bg-gradient-to-br from-sage to-sage-dark shadow-lg shadow-sage/20"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                          <Users className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="font-serif text-xl font-medium text-foreground">
                            Your <span className="text-sage-dark">Family</span> Vault
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {familyData.totalMembers} members • All documents in one place
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Family Members Row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Current User */}
                      {familyData.currentUser && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05, y: -4 }}
                          className="relative group cursor-pointer"
                        >
                          <div className="relative">
                            {familyData.currentUser.user.avatar ? (
                              <img
                                src={familyData.currentUser.user.avatar}
                                alt={familyData.currentUser.user.name}
                                className="w-14 h-14 rounded-2xl object-cover border-3 border-white shadow-lg ring-2 ring-sage/30"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center border-3 border-white shadow-lg">
                                <span className="text-lg font-bold text-white">
                                  {familyData.currentUser.user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </span>
                              </div>
                            )}
                            <motion.div
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <span className="text-[8px] text-white font-bold">YOU</span>
                            </motion.div>
                          </div>
                          <div className="mt-2 text-center">
                            <p className="text-xs font-medium truncate w-14">{familyData.currentUser.user.name.split(" ")[0]}</p>
                            <p className="text-[10px] text-sage-dark font-semibold">{familyData.currentUser.vaultItems.length} docs</p>
                          </div>
                        </motion.div>
                      )}

                      {/* Connector line */}
                      {familyData.familyMembers.length > 0 && (
                        <div className="flex items-center gap-1 px-2">
                          <div className="w-8 h-px bg-gradient-to-r from-sage/40 to-rose-300/40" />
                          <Heart className="w-3 h-3 text-rose-400/60 fill-rose-400/40" />
                          <div className="w-8 h-px bg-gradient-to-r from-rose-300/40 to-sage/40" />
                        </div>
                      )}

                      {/* Family Members */}
                      {familyData.familyMembers.map((member, index) => (
                        <motion.div
                          key={member.user.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -4 }}
                          className="relative group cursor-pointer"
                        >
                          <div className="relative">
                            {member.user.avatar ? (
                              <img
                                src={member.user.avatar}
                                alt={member.user.name}
                                className="w-14 h-14 rounded-2xl object-cover border-3 border-white shadow-lg group-hover:ring-2 group-hover:ring-sage/30 transition-all"
                              />
                            ) : (
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-3 border-white shadow-lg transition-all group-hover:ring-2 group-hover:ring-sage/30 ${
                                index % 3 === 0 ? "bg-gradient-to-br from-rose-400 to-rose-500" :
                                index % 3 === 1 ? "bg-gradient-to-br from-amber-400 to-amber-500" :
                                "bg-gradient-to-br from-violet-400 to-violet-500"
                              }`}>
                                <span className="text-lg font-bold text-white">
                                  {member.user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </span>
                              </div>
                            )}
                            <motion.div
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-sage/20 flex items-center justify-center shadow-sm"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <FileText className="w-2.5 h-2.5 text-sage-dark" />
                            </motion.div>
                          </div>
                          <div className="mt-2 text-center">
                            <p className="text-xs font-medium truncate w-14">{member.user.name.split(" ")[0]}</p>
                            <p className="text-[10px] text-muted-foreground">{member.vaultItems.length} docs</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-6 pt-4 border-t border-sage/10 flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm">
                        <Fingerprint className="w-3.5 h-3.5 text-sage" />
                        <span className="text-xs font-medium">
                          {(familyData.currentUser?.vaultItems.filter(v => v.identityDoc?.type === 'aadhaar').length || 0) +
                           familyData.familyMembers.reduce((acc, m) => acc + m.vaultItems.filter(v => v.identityDoc?.type === 'aadhaar').length, 0)} Aadhaar
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm">
                        <CreditCard className="w-3.5 h-3.5 text-sage" />
                        <span className="text-xs font-medium">
                          {(familyData.currentUser?.vaultItems.filter(v => v.identityDoc?.type === 'pan').length || 0) +
                           familyData.familyMembers.reduce((acc, m) => acc + m.vaultItems.filter(v => v.identityDoc?.type === 'pan').length, 0)} PAN
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm">
                        <Plane className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-xs font-medium">
                          {(familyData.currentUser?.vaultItems.filter(v => v.identityDoc?.type === 'passport').length || 0) +
                           familyData.familyMembers.reduce((acc, m) => acc + m.vaultItems.filter(v => v.identityDoc?.type === 'passport').length, 0)} Passports
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* All Family Documents - Grid Style */}
                <div className="space-y-8">
                  {/* Current User's Documents */}
                  {familyData.currentUser && familyData.currentUser.vaultItems.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {familyData.currentUser.user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-serif text-lg font-medium">
                              Your Documents
                            </h4>
                            <p className="text-xs text-muted-foreground">{familyData.currentUser.vaultItems.length} identity documents</p>
                          </div>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-sage/20 to-transparent" />
                      </div>
                      <div className="space-y-3">
                        {familyData.currentUser.vaultItems.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            {renderDocumentCard(item as unknown as FamilyVaultItem, familyData.currentUser!.user.id, undefined, true)}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Family Members' Documents */}
                  {familyData.familyMembers.map((memberData, memberIndex) => (
                    memberData.vaultItems.length > 0 && (
                      <motion.div
                        key={memberData.user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + memberIndex * 0.1 }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              memberIndex % 3 === 0 ? "bg-gradient-to-br from-rose-400 to-rose-500" :
                              memberIndex % 3 === 1 ? "bg-gradient-to-br from-amber-400 to-amber-500" :
                              "bg-gradient-to-br from-violet-400 to-violet-500"
                            }`}>
                              <span className="text-xs font-bold text-white">
                                {memberData.user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-serif text-lg font-medium">
                                {memberData.user.name}&apos;s Documents
                              </h4>
                              <p className="text-xs text-muted-foreground">{memberData.vaultItems.length} identity documents</p>
                            </div>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-sage/20 to-transparent" />
                        </div>
                        <div className="space-y-3">
                          {memberData.vaultItems.map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              {renderDocumentCard(item as unknown as FamilyVaultItem, memberData.user.id, memberData.user.name, true)}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  ))}
                </div>

                {/* Empty state when no family members */}
                {familyData.familyMembers.length === 0 && !familyData.currentUser?.vaultItems.length && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <motion.div
                      className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-sage/20 to-rose-50/30 border border-sage/30 flex items-center justify-center"
                      animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Users className="w-12 h-12 text-sage" />
                    </motion.div>
                    <h3 className="font-serif text-xl font-medium mb-2">Build Your Family Vault</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Invite trusted family members to your circle and share important documents securely
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        className="gap-2 bg-gradient-to-r from-sage to-sage-dark text-white shadow-lg shadow-sage/20"
                        onClick={() => window.location.href = '/dashboard/family'}
                      >
                        <Heart className="w-4 h-4" />
                        Invite Family Members
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Document Modal */}
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
              className="w-full max-w-lg bg-card rounded-3xl border border-sage/20 shadow-2xl overflow-hidden"
            >
              {!selectedType ? (
                <>
                  {/* Document Type Selection */}
                  <div className="p-6 border-b border-sage/20 bg-gradient-to-r from-sage-light/30 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-sage/15 border border-sage/30">
                          <Plus className="w-5 h-5 text-sage" />
                        </div>
                        <div>
                          <h2 className="font-serif text-xl font-medium">Add Document</h2>
                          <p className="text-sm text-muted-foreground">Choose document type</p>
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
                    {documentTypes.map((type, index) => {
                      const Icon = type.icon;
                      const accent = getAccentStyles(type.accentType);
                      return (
                        <motion.button
                          key={type.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedType(type.id as DocumentType)}
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
                          <div>
                            <span className="font-medium group-hover:text-sage-dark transition-colors">{type.name}</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity inline-block ml-2" />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <AddDocumentForm
                  type={selectedType}
                  onClose={() => {
                    setShowAddModal(false);
                    setSelectedType(null);
                  }}
                  onSave={saveDocument}
                  saving={saving}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Add Document Form Component - Sage themed
function AddDocumentForm({
  type,
  onClose,
  onSave,
  saving = false,
}: {
  type: DocumentType;
  onClose: () => void;
  onSave: (doc: Omit<Document, "id">) => void;
  saving?: boolean;
}) {
  const typeInfo = documentTypes.find((d) => d.id === type)!;
  const Icon = typeInfo.icon;
  const accent = getAccentStyles(typeInfo.accentType);

  const [formData, setFormData] = useState({
    number: "",
    issueDate: "",
    expiryDate: "",
    notes: "",
  });

  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      name: typeInfo.name,
      number: formData.number,
      issueDate: formData.issueDate || undefined,
      expiryDate: formData.expiryDate || undefined,
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
              <p className="text-sm text-muted-foreground">Enter document details</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0 rounded-xl hover:bg-sage/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Document Number */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Label htmlFor="number" className="text-sm font-medium">
            {type === "aadhaar"
              ? "Aadhaar Number"
              : type === "pan"
              ? "PAN Number"
              : type === "passport"
              ? "Passport Number"
              : "Document Number"} *
          </Label>
          <Input
            id="number"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            placeholder={
              type === "aadhaar"
                ? "XXXX-XXXX-XXXX"
                : type === "pan"
                ? "ABCDE1234F"
                : "Enter document number"
            }
            required
            className="h-12 rounded-xl border-sage/30 focus:border-sage focus:ring-sage/20"
          />
        </motion.div>

        {/* Dates */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-2">
            <Label htmlFor="issueDate" className="text-sm font-medium">Issue Date</Label>
            <Input
              id="issueDate"
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="h-12 rounded-xl border-sage/30 focus:border-sage focus:ring-sage/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiryDate" className="text-sm font-medium">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="h-12 rounded-xl border-sage/30 focus:border-sage focus:ring-sage/20"
            />
          </div>
        </motion.div>

        {/* File Upload */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Label className="text-sm font-medium">Attach Document (Optional)</Label>
          <motion.div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragActive
                ? "border-sage bg-sage-light/30"
                : "border-sage/30 hover:border-sage/50 hover:bg-sage-light/20"
            }`}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            whileHover={{ scale: 1.01 }}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <motion.div
              animate={{ y: dragActive ? -5 : 0 }}
              transition={{ type: "spring" }}
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-sage/15 border border-sage/30 flex items-center justify-center">
                <Upload className="w-7 h-7 text-sage" />
              </div>
              <p className="text-sm font-medium">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG up to 5MB
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Notes */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g., Original kept in bank locker"
            className="h-12 rounded-xl border-sage/30 focus:border-sage focus:ring-sage/20"
          />
        </motion.div>
      </div>

      <div className="p-6 border-t border-sage/20 flex justify-end gap-3 bg-sage-light/20">
        <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl" disabled={saving}>
          Cancel
        </Button>
        <motion.div whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.98 }}>
          <Button type="submit" className="rounded-xl gap-2 bg-sage hover:bg-sage-dark" disabled={saving}>
            {saving ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Save Document
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </form>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Plus,
  User,
  Heart,
  Stethoscope,
  Scale,
  Building2,
  Star,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Copy,
  ExternalLink,
  AlertTriangle,
  PhoneCall,
  Users,
  MapPin,
  Mail,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmergencyContact {
  id: string;
  familyMemberId: string;
  name: string;
  relationship: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  priority: number;
  medicalNotes: string | null;
  bloodType: string | null;
  allergies: string[];
  medications: string[];
  instructions: string | null;
}

interface AvailableFamilyMember {
  id: string;
  name: string;
  relationship: string;
  email: string | null;
  phone: string | null;
}

const categoryTypes = [
  { id: "family", name: "Family", icon: Heart, accent: "text-rose-600", bgAccent: "bg-rose-500/10", borderAccent: "border-rose-200" },
  { id: "medical", name: "Medical", icon: Stethoscope, accent: "text-sage-dark", bgAccent: "bg-sage/10", borderAccent: "border-sage/30" },
  { id: "legal", name: "Legal", icon: Scale, accent: "text-amber-700", bgAccent: "bg-amber/10", borderAccent: "border-amber-200" },
  { id: "financial", name: "Financial", icon: Building2, accent: "text-sage", bgAccent: "bg-sage-light/30", borderAccent: "border-sage/20" },
  { id: "neighbor", name: "Neighbor/Friend", icon: User, accent: "text-warm-gray", bgAccent: "bg-secondary", borderAccent: "border-border" },
  { id: "other", name: "Other", icon: Phone, accent: "text-muted-foreground", bgAccent: "bg-muted", borderAccent: "border-border" },
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

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [availableFamilyMembers, setAvailableFamilyMembers] = useState<AvailableFamilyMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/emergency");
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
        setAvailableFamilyMembers(data.availableFamilyMembers || []);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const getCategoryInfo = (relationship: string) => {
    const lower = relationship.toLowerCase();
    if (lower.includes("wife") || lower.includes("husband") || lower.includes("son") || lower.includes("daughter") || lower.includes("mother") || lower.includes("father") || lower.includes("brother") || lower.includes("sister")) {
      return categoryTypes[0]; // Family
    }
    if (lower.includes("doctor") || lower.includes("nurse") || lower.includes("hospital")) {
      return categoryTypes[1]; // Medical
    }
    if (lower.includes("lawyer") || lower.includes("attorney")) {
      return categoryTypes[2]; // Legal
    }
    if (lower.includes("accountant") || lower.includes("financial") || lower.includes("bank")) {
      return categoryTypes[3]; // Financial
    }
    if (lower.includes("neighbor") || lower.includes("friend")) {
      return categoryTypes[4]; // Neighbor/Friend
    }
    return categoryTypes[5]; // Other
  };

  const copyPhone = async (phone: string) => {
    await navigator.clipboard.writeText(phone.replace(/\s/g, ""));
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const deleteContact = async (id: string) => {
    try {
      const res = await fetch(`/api/emergency/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const primaryContact = contacts.find((c) => c.priority === 1);
  const categoriesCovered = new Set(contacts.map((c) => getCategoryInfo(c.relationship).id)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-sage" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-sage/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-sage-light/20 rounded-full blur-[80px]" />
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
              <PhoneCall className="w-4 h-4 text-sage" />
              <span className="text-sm text-sage-dark font-medium">Emergency Network</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground tracking-tight">
              Emergency <span className="text-sage">Contacts</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Your trusted network for critical moments
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-sage hover:bg-sage-dark text-white shadow-lg shadow-sage/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
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
              <p className="text-3xl font-serif font-medium text-sage">{contacts.length}</p>
              <p className="text-muted-foreground text-sm">Total Contacts</p>
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
              <p className="text-3xl font-serif font-medium text-sage">{categoriesCovered}/{categoryTypes.length}</p>
              <p className="text-muted-foreground text-sm">Categories Covered</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-sage/20 hover:border-sage/40 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sage/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-sage" />
            </div>
            <div>
              <p className="text-2xl font-serif font-medium text-sage truncate">{primaryContact?.name.split(' ')[0] || "Not Set"}</p>
              <p className="text-muted-foreground text-sm">Primary Contact</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Primary Contact Card */}
      {primaryContact && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-sage/10 via-sage-light/20 to-transparent border border-sage/30 mb-10"
        >
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-5">
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-sage/20 border border-sage/30">
                    <Star className="w-8 h-8 text-sage-dark" />
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/10 text-sage-dark text-xs border border-sage/20 mb-2">
                    <Star className="w-3 h-3" />
                    Primary Emergency Contact
                  </span>
                  <h3 className="text-2xl font-serif font-medium text-foreground">{primaryContact.name}</h3>
                  <p className="text-muted-foreground">{primaryContact.relationship}</p>
                </div>
              </div>
              {primaryContact.phone && (
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`tel:${primaryContact.phone.replace(/\s/g, "")}`}
                  className="px-6 py-3 rounded-xl bg-sage hover:bg-sage-dark text-white font-medium shadow-lg shadow-sage/20 transition-all flex items-center gap-2"
                >
                  <PhoneCall className="w-5 h-5" />
                  Call Now
                </motion.a>
              )}
            </div>

            <div className="mt-6 flex items-center gap-6 flex-wrap">
              {primaryContact.phone && (
                <button
                  onClick={() => copyPhone(primaryContact.phone!)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/50 border border-sage/20 hover:border-sage/40 transition-all"
                >
                  <Phone className="w-4 h-4 text-sage" />
                  <span className="text-foreground">{primaryContact.phone}</span>
                  {copiedPhone === primaryContact.phone ? (
                    <CheckCircle2 className="w-4 h-4 text-sage" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              )}
              {primaryContact.email && (
                <a
                  href={`mailto:${primaryContact.email}`}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/50 border border-sage/20 hover:border-sage/40 transition-all"
                >
                  <Mail className="w-4 h-4 text-sage" />
                  <span className="text-foreground">{primaryContact.email}</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
            </div>

            {primaryContact.instructions && (
              <div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm">
                <MessageSquare className="w-4 h-4 text-sage" />
                {primaryContact.instructions}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Warning if no contacts */}
      {contacts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-5 rounded-2xl bg-amber/5 border border-amber-200 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-amber/10">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="font-medium text-amber-800">No emergency contacts set up</p>
              <p className="text-sm text-amber-700/80 mt-1">
                Add emergency contacts to ensure your family members can reach out in critical situations.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Contacts Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-6"
      >
        {contacts.map((contact) => {
          const catInfo = getCategoryInfo(contact.relationship);
          const Icon = catInfo.icon;

          return (
            <motion.div
              key={contact.id}
              variants={itemVariants}
              layout
              whileHover={{ y: -4 }}
              className="group relative p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-sage/20 hover:border-sage/40 hover:shadow-lg hover:shadow-sage/10 transition-all overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`relative p-3 rounded-xl ${catInfo.bgAccent} border ${catInfo.borderAccent}`}>
                    <Icon className={`w-5 h-5 ${catInfo.accent}`} />
                    {contact.priority === 1 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sage flex items-center justify-center">
                        <Star className="w-2.5 h-2.5 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-lg text-foreground">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${catInfo.bgAccent} ${catInfo.accent} border ${catInfo.borderAccent}`}>
                      {catInfo.name}
                    </span>
                  </div>
                </div>

                {/* Call Button */}
                {contact.phone && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="p-3 rounded-xl bg-sage hover:bg-sage-dark text-white shadow-lg shadow-sage/20 transition-all"
                  >
                    <PhoneCall className="w-5 h-5" />
                  </motion.a>
                )}
              </div>

              {/* Contact Details */}
              <div className="mt-4 space-y-2">
                {contact.phone && (
                  <button
                    onClick={() => copyPhone(contact.phone!)}
                    className="flex items-center gap-2 text-sm hover:text-sage transition-colors w-full"
                  >
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {contact.phone}
                    {copiedPhone === contact.phone ? (
                      <CheckCircle2 className="w-4 h-4 text-sage ml-auto" />
                    ) : (
                      <Copy className="w-4 h-4 opacity-40 ml-auto" />
                    )}
                  </button>
                )}

                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-sage transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {contact.email}
                  </a>
                )}

                {contact.bloodType && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    Blood Type: {contact.bloodType}
                  </p>
                )}

                {contact.instructions && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground italic">
                    <MessageSquare className="w-4 h-4" />
                    {contact.instructions}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-end">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteContact(contact.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {contacts.length === 0 && (
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
            <Phone className="w-12 h-12 text-sage" />
          </motion.div>
          <h3 className="font-serif text-2xl font-medium text-foreground mb-2">No emergency contacts yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Build your emergency network by adding contacts who should be reached during critical moments
          </p>
          <Button
            onClick={() => setShowAddModal(true)}
            size="lg"
            className="bg-sage hover:bg-sage-dark text-white shadow-lg shadow-sage/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Contact
          </Button>
        </motion.div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <AddContactForm
                availableFamilyMembers={availableFamilyMembers}
                onClose={() => setShowAddModal(false)}
                onSave={() => {
                  setShowAddModal(false);
                  fetchContacts();
                }}
                isFirstContact={contacts.length === 0}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddContactForm({
  availableFamilyMembers,
  onClose,
  onSave,
  isFirstContact,
}: {
  availableFamilyMembers: AvailableFamilyMember[];
  onClose: () => void;
  onSave: () => void;
  isFirstContact: boolean;
}) {
  const [saving, setSaving] = useState(false);
  const [useExisting, setUseExisting] = useState(availableFamilyMembers.length > 0);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    priority: isFirstContact ? 1 : 2,
    bloodType: "",
    instructions: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyMemberId: useExisting ? selectedFamilyMember : undefined,
          name: formData.name,
          relationship: formData.relationship,
          phone: formData.phone || null,
          email: formData.email || null,
          priority: formData.priority,
          bloodType: formData.bloodType || null,
          instructions: formData.instructions || null,
          allergies: [],
          medications: [],
        }),
      });

      if (res.ok) {
        onSave();
      }
    } catch (error) {
      console.error("Error creating contact:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sage/10">
              <Phone className="w-6 h-6 text-sage" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium text-foreground">Add Emergency Contact</h2>
              <p className="text-muted-foreground text-sm">Fill in the details below</p>
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
        {/* Option to use existing family member */}
        {availableFamilyMembers.length > 0 && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUseExisting(true)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                  useExisting
                    ? "bg-sage text-white"
                    : "bg-sage/10 hover:bg-sage/20"
                }`}
              >
                From Family
              </button>
              <button
                type="button"
                onClick={() => setUseExisting(false)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                  !useExisting
                    ? "bg-sage text-white"
                    : "bg-sage/10 hover:bg-sage/20"
                }`}
              >
                New Contact
              </button>
            </div>

            {useExisting && (
              <div className="space-y-2">
                <Label>Select Family Member</Label>
                <select
                  value={selectedFamilyMember}
                  onChange={(e) => setSelectedFamilyMember(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-sage/30 bg-background"
                  required={useExisting}
                >
                  <option value="">Select a family member</option>
                  {availableFamilyMembers.map((fm) => (
                    <option key={fm.id} value={fm.id}>
                      {fm.name} - {fm.relationship}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {!useExisting && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                  required={!useExisting}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship *</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  placeholder="e.g., Wife, Doctor"
                  required={!useExisting}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
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
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full h-10 px-4 rounded-xl border border-sage/30 bg-background"
            >
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>
                  {p === 1 ? "Primary" : `Priority ${p}`}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodType">Blood Type</Label>
            <Input
              id="bloodType"
              value={formData.bloodType}
              onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
              placeholder="e.g., A+, O-"
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Special Instructions</Label>
          <Input
            id="instructions"
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            placeholder="Any additional information..."
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="p-6 border-t border-border flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <Button type="submit" className="rounded-xl bg-sage hover:bg-sage-dark text-white" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          Save Contact
        </Button>
      </div>
    </form>
  );
}

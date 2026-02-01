"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Plus,
  User,
  Heart,
  Stethoscope,
  Scale,
  Shield,
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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ContactCategory = "family" | "medical" | "legal" | "financial" | "neighbor" | "other";

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  category: ContactCategory;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  notes?: string;
}

const categoryTypes = [
  { id: "family", name: "Family", icon: Heart, accent: "text-rose-600", bgAccent: "bg-rose-500/10", borderAccent: "border-rose-200" },
  { id: "medical", name: "Medical", icon: Stethoscope, accent: "text-sage-dark", bgAccent: "bg-sage/10", borderAccent: "border-sage/30" },
  { id: "legal", name: "Legal", icon: Scale, accent: "text-amber-700", bgAccent: "bg-amber/10", borderAccent: "border-amber-200" },
  { id: "financial", name: "Financial", icon: Building2, accent: "text-sage", bgAccent: "bg-sage-light/30", borderAccent: "border-sage/20" },
  { id: "neighbor", name: "Neighbor/Friend", icon: User, accent: "text-warm-gray", bgAccent: "bg-secondary", borderAccent: "border-border" },
  { id: "other", name: "Other", icon: Phone, accent: "text-muted-foreground", bgAccent: "bg-muted", borderAccent: "border-border" },
];

const initialContacts: EmergencyContact[] = [
  {
    id: "1",
    name: "Priya Sharma",
    relationship: "Wife",
    category: "family",
    phone: "+91 98765 43210",
    email: "priya@email.com",
    isPrimary: true,
    notes: "First person to contact in any emergency",
  },
  {
    id: "2",
    name: "Dr. Rajesh Kumar",
    relationship: "Family Doctor",
    category: "medical",
    phone: "+91 98765 12345",
    alternatePhone: "+91 22 2345 6789",
    address: "Apollo Hospital, Andheri",
    isPrimary: false,
    notes: "Available 24/7 for emergencies",
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

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>(initialContacts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<ContactCategory | "all">("all");

  const getCategoryInfo = (category: ContactCategory) => {
    return categoryTypes.find((c) => c.id === category) || categoryTypes[5];
  };

  const copyPhone = async (phone: string) => {
    await navigator.clipboard.writeText(phone.replace(/\s/g, ""));
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const setPrimaryContact = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => ({
        ...c,
        isPrimary: c.id === id,
      }))
    );
  };

  const primaryContact = contacts.find((c) => c.isPrimary);
  const missingCategories = categoryTypes.filter(
    (cat) => !contacts.some((c) => c.category === cat.id)
  );
  const categoriesCovered = categoryTypes.length - missingCategories.length;

  const filteredContacts = filterCategory === "all"
    ? contacts
    : contacts.filter(c => c.category === filterCategory);

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

        {/* Floating dots */}
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-sage/30 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-sage/20 rounded-full animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-sage/25 rounded-full animate-float" style={{ animationDelay: "2s" }} />
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
          {/* Decorative elements */}
          <svg className="absolute top-4 right-4 w-24 h-24 text-sage/10 animate-spin-slow" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
          </svg>

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
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={`tel:${primaryContact.phone.replace(/\s/g, "")}`}
                className="px-6 py-3 rounded-xl bg-sage hover:bg-sage-dark text-white font-medium shadow-lg shadow-sage/20 transition-all flex items-center gap-2"
              >
                <PhoneCall className="w-5 h-5" />
                Call Now
              </motion.a>
            </div>

            <div className="mt-6 flex items-center gap-6 flex-wrap">
              <button
                onClick={() => copyPhone(primaryContact.phone)}
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

            {primaryContact.notes && (
              <div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm">
                <MessageSquare className="w-4 h-4 text-sage" />
                {primaryContact.notes}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Missing Categories Warning */}
      {missingCategories.length > 0 && (
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
              <p className="font-medium text-amber-800">Incomplete emergency network</p>
              <p className="text-sm text-amber-700/80 mt-1">
                Consider adding contacts for:{" "}
                <span className="font-medium">{missingCategories.map((c) => c.name).join(", ")}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 overflow-x-auto pb-2 mb-8"
      >
        <button
          onClick={() => setFilterCategory("all")}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
            filterCategory === "all"
              ? "bg-sage text-white shadow-lg shadow-sage/20"
              : "bg-white/60 border border-sage/20 text-muted-foreground hover:border-sage/40"
          }`}
        >
          All Contacts
        </button>
        {categoryTypes.map((cat) => {
          const Icon = cat.icon;
          const count = contacts.filter(c => c.category === cat.id).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id as ContactCategory)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                filterCategory === cat.id
                  ? "bg-sage text-white shadow-lg shadow-sage/20"
                  : "bg-white/60 border border-sage/20 text-muted-foreground hover:border-sage/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.name}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                filterCategory === cat.id ? "bg-white/20" : "bg-sage/10"
              }`}>{count}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Contacts Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-6"
      >
        {filteredContacts.map((contact) => {
          const catInfo = getCategoryInfo(contact.category);
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
                    {contact.isPrimary && (
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
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="p-3 rounded-xl bg-sage hover:bg-sage-dark text-white shadow-lg shadow-sage/20 transition-all"
                >
                  <PhoneCall className="w-5 h-5" />
                </motion.a>
              </div>

              {/* Contact Details */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => copyPhone(contact.phone)}
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

                {contact.alternatePhone && (
                  <button
                    onClick={() => copyPhone(contact.alternatePhone!)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-sage transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {contact.alternatePhone}
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

                {contact.address && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {contact.address}
                  </p>
                )}

                {contact.notes && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground italic">
                    <MessageSquare className="w-4 h-4" />
                    {contact.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!contact.isPrimary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPrimaryContact(contact.id)}
                      className="h-8 text-sage hover:text-sage-dark hover:bg-sage/10"
                    >
                      <Star className="w-4 h-4 mr-1" />
                      Set Primary
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setContacts((prev) => prev.filter((c) => c.id !== contact.id))}
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
            onClick={() => {
              setShowAddModal(false);
              setSelectedCategory(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {!selectedCategory ? (
                <>
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-serif text-xl font-medium text-foreground">Add Emergency Contact</h2>
                        <p className="text-muted-foreground text-sm mt-1">Select a category first</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddModal(false)}
                        className="h-10 w-10 p-0"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-2 gap-3">
                    {categoryTypes.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <motion.button
                          key={cat.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedCategory(cat.id as ContactCategory)}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-sage/40 hover:bg-sage/5 transition-all text-left group`}
                        >
                          <div className={`p-3 rounded-xl ${cat.bgAccent} border ${cat.borderAccent} group-hover:scale-105 transition-transform`}>
                            <Icon className={`w-5 h-5 ${cat.accent}`} />
                          </div>
                          <span className="font-medium text-foreground">{cat.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <AddContactForm
                  category={selectedCategory}
                  onClose={() => {
                    setShowAddModal(false);
                    setSelectedCategory(null);
                  }}
                  onSave={(contact) => {
                    setContacts((prev) => [...prev, { ...contact, id: Date.now().toString() }]);
                    setShowAddModal(false);
                    setSelectedCategory(null);
                  }}
                  isFirstContact={contacts.length === 0}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddContactForm({
  category,
  onClose,
  onSave,
  isFirstContact,
}: {
  category: ContactCategory;
  onClose: () => void;
  onSave: (contact: Omit<EmergencyContact, "id">) => void;
  isFirstContact: boolean;
}) {
  const catInfo = categoryTypes.find((c) => c.id === category)!;
  const Icon = catInfo.icon;

  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    alternatePhone: "",
    email: "",
    address: "",
    isPrimary: isFirstContact,
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      relationship: formData.relationship,
      category,
      phone: formData.phone,
      alternatePhone: formData.alternatePhone || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
      isPrimary: formData.isPrimary,
      notes: formData.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${catInfo.bgAccent} border ${catInfo.borderAccent}`}>
              <Icon className={`w-6 h-6 ${catInfo.accent}`} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium text-foreground">Add {catInfo.name} Contact</h2>
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full name"
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
              placeholder="e.g., Wife, Doctor"
              required
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="alternatePhone">Alternate Phone</Label>
            <Input
              id="alternatePhone"
              type="tel"
              value={formData.alternatePhone}
              onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
              placeholder="Optional"
              className="rounded-xl"
            />
          </div>
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

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Home or work address"
            className="rounded-xl"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-sage/5 border border-sage/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sage/10">
              <Star className="w-4 h-4 text-sage" />
            </div>
            <div>
              <p className="font-medium text-foreground">Primary Contact</p>
              <p className="text-sm text-muted-foreground">First person to call</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isPrimary: !formData.isPrimary })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              formData.isPrimary ? "bg-sage" : "bg-muted"
            }`}
          >
            <motion.div
              layout
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
              style={{ left: formData.isPrimary ? "calc(100% - 20px)" : "4px" }}
            />
          </button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional information..."
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
          Save Contact
        </Button>
      </div>
    </form>
  );
}

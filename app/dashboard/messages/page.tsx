"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Plus,
  Calendar,
  Clock,
  User,
  Send,
  Trash2,
  X,
  Gift,
  GraduationCap,
  Heart,
  Cake,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FutureMessage {
  id: string;
  title: string;
  content: string;
  recipientName: string;
  recipientEmail: string;
  scheduledDate: string;
  occasion: string;
  status: "scheduled" | "sent" | "draft" | "cancelled";
  createdAt: string;
}

const occasions = [
  { id: "birthday", label: "Birthday", icon: Cake, color: "text-pink-500", bg: "bg-pink-500/10" },
  { id: "wedding", label: "Wedding", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  { id: "graduation", label: "Graduation", icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "holiday", label: "Holiday", icon: Gift, color: "text-green-500", bg: "bg-green-500/10" },
  { id: "milestone", label: "Milestone", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "other", label: "Other", icon: MessageCircle, color: "text-sage", bg: "bg-sage/10" },
];

export default function FutureMessagesPage() {
  const [messages, setMessages] = useState<FutureMessage[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<FutureMessage | null>(null);
  const [filter, setFilter] = useState<"all" | "scheduled" | "sent" | "draft">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    recipientName: "",
    recipientEmail: "",
    scheduledDate: "",
    occasion: "birthday",
  });

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/scheduled");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSubmit = async (asDraft = false) => {
    if (!form.title || !form.content || !form.recipientName) return;

    setSaving(true);
    try {
      const res = await fetch("/api/messages/scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          status: asDraft ? "draft" : "scheduled",
        }),
      });

      if (res.ok) {
        setShowComposer(false);
        resetForm();
        fetchMessages();
      }
    } catch (error) {
      console.error("Error creating message:", error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      recipientName: "",
      recipientEmail: "",
      scheduledDate: "",
      occasion: "birthday",
    });
  };

  const deleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/scheduled/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSelectedMessage(null);
        fetchMessages();
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === "all") return true;
    return m.status === filter;
  });

  const getOccasion = (id: string) => occasions.find((o) => o.id === id) || occasions[5];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sage" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-sage-light/10">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-sage-light/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-sage-dark hover:bg-sage/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-serif text-3xl font-medium text-foreground">Future Messages</h1>
              <p className="text-muted-foreground">Write letters that arrive on special days</p>
            </div>
          </div>

          <Button onClick={() => setShowComposer(true)} className="bg-sage hover:bg-sage-dark">
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "all", label: "All Messages" },
            { id: "scheduled", label: "Scheduled" },
            { id: "draft", label: "Drafts" },
            { id: "sent", label: "Sent" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? "bg-sage text-white"
                  : "bg-sage/10 text-muted-foreground hover:bg-sage/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Messages List */}
        {filteredMessages.length === 0 ? (
          <div className="rounded-3xl bg-card border border-dashed border-sage/30 p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="font-serif text-2xl font-medium text-foreground mb-3">
              No messages yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Write your first letter for a future birthday, graduation, wedding, or any special occasion.
            </p>
            <Button onClick={() => setShowComposer(true)} className="bg-sage hover:bg-sage-dark">
              <Plus className="w-4 h-4 mr-2" />
              Write Your First Letter
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMessages.map((message, index) => {
              const occasion = getOccasion(message.occasion);
              return (
                <div
                  key={message.id}
                  className="group rounded-2xl bg-card border border-sage/10 hover:border-sage/30 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedMessage(message)}
                >
                  {/* Header */}
                  <div className={`p-4 ${occasion.bg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <occasion.icon className={`w-5 h-5 ${occasion.color}`} />
                        <span className={`text-sm font-medium ${occasion.color}`}>
                          {occasion.label}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        message.status === "scheduled"
                          ? "bg-sage/20 text-sage-dark"
                          : message.status === "sent"
                          ? "bg-green-500/20 text-green-600"
                          : "bg-amber/20 text-amber-600"
                      }`}>
                        {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-medium text-foreground mb-1 truncate">
                      {message.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {message.content}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{message.recipientName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(message.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl shadow-2xl animate-fade-in-up">
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-sage/10 p-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-medium text-foreground">
                Write a Future Letter
              </h2>
              <button
                onClick={() => {
                  setShowComposer(false);
                  resetForm();
                }}
                className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sage/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Occasion Selector */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  What's the occasion?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {occasions.map((occ) => (
                    <button
                      key={occ.id}
                      onClick={() => setForm((prev) => ({ ...prev, occasion: occ.id }))}
                      className={`p-3 rounded-xl border transition-all ${
                        form.occasion === occ.id
                          ? `${occ.bg} border-current ${occ.color}`
                          : "border-sage/20 hover:border-sage/40"
                      }`}
                    >
                      <occ.icon className={`w-5 h-5 mx-auto mb-1 ${form.occasion === occ.id ? occ.color : "text-muted-foreground"}`} />
                      <span className={`text-xs ${form.occasion === occ.id ? occ.color : "text-muted-foreground"}`}>
                        {occ.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Letter Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Happy 18th Birthday!"
                  className="w-full px-4 py-3 rounded-xl bg-sage/5 border border-sage/20 focus:border-sage focus:outline-none transition-colors"
                />
              </div>

              {/* Recipient */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={form.recipientName}
                    onChange={(e) => setForm((prev) => ({ ...prev, recipientName: e.target.value }))}
                    placeholder="Who is this for?"
                    className="w-full px-4 py-3 rounded-xl bg-sage/5 border border-sage/20 focus:border-sage focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Email (for delivery)
                  </label>
                  <input
                    type="email"
                    value={form.recipientEmail}
                    onChange={(e) => setForm((prev) => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="their@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-sage/5 border border-sage/20 focus:border-sage focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 rounded-xl bg-sage/5 border border-sage/20 focus:border-sage focus:outline-none transition-colors"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Your Message
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write from your heart... Share memories, wisdom, hopes, and love."
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl bg-sage/5 border border-sage/20 focus:border-sage focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-sage/30"
                  onClick={() => handleSubmit(true)}
                  disabled={saving}
                >
                  Save as Draft
                </Button>
                <Button
                  className="flex-1 bg-sage hover:bg-sage-dark"
                  onClick={() => handleSubmit(false)}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Schedule Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="w-full max-w-2xl bg-card rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-6 ${getOccasion(selectedMessage.occasion).bg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Occ = getOccasion(selectedMessage.occasion);
                    return <Occ.icon className={`w-6 h-6 ${Occ.color}`} />;
                  })()}
                  <div>
                    <h2 className="font-serif text-xl font-medium text-foreground">
                      {selectedMessage.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      To: {selectedMessage.recipientName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="prose prose-sage max-w-none mb-6">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.content}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Scheduled: {new Date(selectedMessage.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Created: {new Date(selectedMessage.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => deleteMessage(selectedMessage.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

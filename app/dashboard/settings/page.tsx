"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Trash2,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Globe,
  Moon,
  Sun,
  ChevronRight,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

// Floating Leaf SVG
const FloatingLeaf = ({ className, style, size = 30 }: { className?: string; style?: React.CSSProperties; size?: number }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} style={style}>
    <path d="M20 2C20 2 8 12 8 24C8 32 13 38 20 38C27 38 32 32 32 24C32 12 20 2 20 2Z" fill="currentColor" opacity="0.6" />
    <path d="M20 8C20 8 20 28 20 36M14 18C14 18 20 22 26 18" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
  </svg>
);

// Sparkle SVG
const Sparkle = ({ className, style, size = 16 }: { className?: string; style?: React.CSSProperties; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style}>
    <path d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z" fill="currentColor" />
  </svg>
);

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const sections: SettingsSection[] = [
  { id: "profile", title: "Profile", icon: <User className="w-5 h-5" />, description: "Manage your personal information" },
  { id: "security", title: "Security", icon: <Lock className="w-5 h-5" />, description: "Password and authentication" },
  { id: "notifications", title: "Notifications", icon: <Bell className="w-5 h-5" />, description: "Email and push notifications" },
  { id: "privacy", title: "Privacy", icon: <Shield className="w-5 h-5" />, description: "Data and privacy controls" },
  { id: "danger", title: "Danger Zone", icon: <AlertTriangle className="w-5 h-5" />, description: "Account deletion" },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderEmails, setReminderEmails] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Privacy state
  const [profileVisibility, setProfileVisibility] = useState("private");
  const [dataSharing, setDataSharing] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // API call to update profile
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) throw new Error("Failed to save");
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsSaving(true);
    try {
      // API call to change password
      const response = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to change password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    try {
      await fetch("/api/auth/account", {
        method: "DELETE",
        credentials: "include",
      });
      toast.success("Account deleted");
      logout();
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-sage/5 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-sage/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-sage-light/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        {/* Floating leaves */}
        {[...Array(6)].map((_, i) => (
          <FloatingLeaf
            key={i}
            className="absolute text-sage/20 animate-sway"
            size={20 + Math.random() * 15}
            style={{
              top: `${10 + i * 15}%`,
              left: i % 2 === 0 ? `${5 + i * 3}%` : undefined,
              right: i % 2 === 1 ? `${5 + i * 3}%` : undefined,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}

        {/* Sparkles */}
        {[...Array(4)].map((_, i) => (
          <Sparkle
            key={i}
            className="absolute text-sage/25 animate-twinkle"
            size={12}
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif font-medium text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences and privacy</p>
        </motion.div>

        {/* Success Toast */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-sage text-white rounded-xl shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Settings saved successfully</span>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:w-72 flex-shrink-0"
          >
            <div className="bg-white/80 backdrop-blur-sm border border-sage/20 rounded-2xl p-4 shadow-lg sticky top-24">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                      activeSection === section.id
                        ? "bg-sage/10 text-sage-dark"
                        : "text-muted-foreground hover:bg-sage/5 hover:text-foreground"
                    }`}
                  >
                    <div className={`${activeSection === section.id ? "text-sage" : ""}`}>
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{section.title}</p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === section.id ? "rotate-90" : ""}`} />
                  </button>
                ))}
              </nav>

              <hr className="my-4 border-sage/10" />

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium text-sm">Sign Out</span>
              </button>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <div className="bg-white/80 backdrop-blur-sm border border-sage/20 rounded-2xl shadow-lg overflow-hidden">
              {/* Profile Section */}
              {activeSection === "profile" && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4 pb-6 border-b border-sage/10">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-medium text-white">
                        {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-medium text-foreground">{user?.name || "User"}</h2>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-sage/20 focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-sage/20 focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sage to-sage-dark text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* Security Section */}
              {activeSection === "security" && (
                <div className="p-6 space-y-6">
                  <div className="pb-6 border-b border-sage/10">
                    <h2 className="text-xl font-medium text-foreground">Change Password</h2>
                    <p className="text-muted-foreground text-sm mt-1">Update your password to keep your account secure</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full pl-12 pr-12 py-3 rounded-xl bg-white border border-sage/20 focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full pl-12 pr-12 py-3 rounded-xl bg-white border border-sage/20 focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-sage/20 focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handlePasswordChange}
                      disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sage to-sage-dark text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4" />
                      {isSaving ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <div className="p-6 space-y-6">
                  <div className="pb-6 border-b border-sage/10">
                    <h2 className="text-xl font-medium text-foreground">Notification Preferences</h2>
                    <p className="text-muted-foreground text-sm mt-1">Choose what notifications you want to receive</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { id: "email", label: "Email Notifications", description: "Receive updates about your account via email", state: emailNotifications, setState: setEmailNotifications },
                      { id: "reminder", label: "Reminder Emails", description: "Get reminded to update your legacy vault", state: reminderEmails, setState: setReminderEmails },
                      { id: "security", label: "Security Alerts", description: "Get notified about security events", state: securityAlerts, setState: setSecurityAlerts },
                      { id: "marketing", label: "Marketing Emails", description: "Receive news and special offers", state: marketingEmails, setState: setMarketingEmails },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-sage/5 hover:bg-sage/10 transition-colors">
                        <div>
                          <p className="font-medium text-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <button
                          onClick={() => item.setState(!item.state)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${item.state ? "bg-sage" : "bg-stone-300"}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${item.state ? "translate-x-7" : "translate-x-1"}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sage to-sage-dark text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Saving..." : "Save Preferences"}
                    </button>
                  </div>
                </div>
              )}

              {/* Privacy Section */}
              {activeSection === "privacy" && (
                <div className="p-6 space-y-6">
                  <div className="pb-6 border-b border-sage/10">
                    <h2 className="text-xl font-medium text-foreground">Privacy Settings</h2>
                    <p className="text-muted-foreground text-sm mt-1">Control your data and privacy</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Profile Visibility</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { value: "private", label: "Private", icon: <Lock className="w-4 h-4" />, description: "Only you" },
                          { value: "family", label: "Family", icon: <User className="w-4 h-4" />, description: "Family members" },
                          { value: "public", label: "Public", icon: <Globe className="w-4 h-4" />, description: "Everyone" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setProfileVisibility(option.value)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              profileVisibility === option.value
                                ? "border-sage bg-sage/10"
                                : "border-sage/20 hover:border-sage/40"
                            }`}
                          >
                            <div className={`${profileVisibility === option.value ? "text-sage" : "text-muted-foreground"}`}>
                              {option.icon}
                            </div>
                            <p className="font-medium text-foreground mt-2">{option.label}</p>
                            <p className="text-xs text-muted-foreground">{option.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-sage/5">
                      <div>
                        <p className="font-medium text-foreground">Data Analytics</p>
                        <p className="text-sm text-muted-foreground">Help improve AfterMe by sharing anonymous usage data</p>
                      </div>
                      <button
                        onClick={() => setDataSharing(!dataSharing)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${dataSharing ? "bg-sage" : "bg-stone-300"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${dataSharing ? "translate-x-7" : "translate-x-1"}`}
                        />
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900">Your data is protected</p>
                          <p className="text-sm text-blue-700 mt-1">
                            We use industry-standard encryption to protect your personal information. Your legacy data is never shared without your explicit consent.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sage to-sage-dark text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </div>
              )}

              {/* Danger Zone Section */}
              {activeSection === "danger" && (
                <div className="p-6 space-y-6">
                  <div className="pb-6 border-b border-red-200">
                    <h2 className="text-xl font-medium text-red-600">Danger Zone</h2>
                    <p className="text-muted-foreground text-sm mt-1">Irreversible actions - proceed with caution</p>
                  </div>

                  <div className="p-6 rounded-xl border-2 border-red-200 bg-red-50/50">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-red-900">Delete Account</h3>
                        <p className="text-sm text-red-700 mt-1">
                          Once you delete your account, there is no going back. All your data, memories, voice recordings, and legacy instructions will be permanently deleted.
                        </p>

                        {!showDeleteConfirm ? (
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete My Account
                          </button>
                        ) : (
                          <div className="mt-4 space-y-3">
                            <p className="text-sm text-red-800 font-medium">
                              Type &quot;DELETE&quot; to confirm:
                            </p>
                            <input
                              type="text"
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value)}
                              placeholder="DELETE"
                              className="w-full px-4 py-2 rounded-lg border border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== "DELETE"}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Permanently Delete
                              </button>
                              <button
                                onClick={() => {
                                  setShowDeleteConfirm(false);
                                  setDeleteConfirmText("");
                                }}
                                className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

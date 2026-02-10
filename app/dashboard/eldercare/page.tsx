"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Phone,
  Pill,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Smile,
  Meh,
  Frown,
  Sun,
  Moon,
  Bell,
  Plus,
  Trash2,
  Activity,
  Mic,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MedicineReminder {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  notes?: string;
  takenToday: boolean[];
}

interface CheckIn {
  id: string;
  date: string;
  mood: "good" | "okay" | "not_good";
  note?: string;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
}

interface ScamAlert {
  id: string;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
}

const scamAlerts: ScamAlert[] = [
  {
    id: "1",
    title: "⚠️ Fake Bank Calls",
    description: "Scammers are calling pretending to be from banks asking for OTP. Never share your OTP with anyone!",
    date: "2025-01-14",
    isRead: false,
  },
  {
    id: "2",
    title: "⚠️ WhatsApp Lottery Scam",
    description: "Messages claiming you've won a lottery are fake. Don't click any links or pay any money.",
    date: "2025-01-10",
    isRead: true,
  },
];

export default function ElderCarePage() {
  const [medicines, setMedicines] = useState<MedicineReminder[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"overview" | "medicine" | "checkins" | "alerts">("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ checkedInToday: false, todayCheckIn: null as CheckIn | null });

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dosage: "",
    times: ["08:00"],
    notes: "",
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [medicineRes, checkInRes] = await Promise.all([
        fetch("/api/eldercare/medicine"),
        fetch("/api/eldercare/checkin"),
      ]);

      if (medicineRes.ok) {
        const medicineData = await medicineRes.json();
        setMedicines(medicineData.medicines || []);
      }

      if (checkInRes.ok) {
        const checkInData = await checkInRes.json();
        setCheckIns(checkInData.checkIns || []);
        setStats({
          checkedInToday: checkInData.stats?.checkedInToday || false,
          todayCheckIn: checkInData.stats?.todayCheckIn || null,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = currentTime.getHours() < 12 ? "Good Morning" : currentTime.getHours() < 17 ? "Good Afternoon" : "Good Evening";
  const GreeingIcon = currentTime.getHours() < 17 ? Sun : Moon;

  const weekMoods = checkIns.slice(0, 7);
  const goodMoodDays = weekMoods.filter((c) => c.mood === "good").length;

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "good":
        return <Smile className="w-5 h-5 text-emerald-500" />;
      case "okay":
        return <Meh className="w-5 h-5 text-amber-500" />;
      default:
        return <Frown className="w-5 h-5 text-red-500" />;
    }
  };

  const handleQuickCheckIn = async (mood: "good" | "okay" | "not_good") => {
    setSaving(true);
    try {
      const res = await fetch("/api/eldercare/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error creating check-in:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/eldercare/medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMedicine),
      });

      if (res.ok) {
        setShowAddMedicine(false);
        setNewMedicine({ name: "", dosage: "", times: ["08:00"], notes: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error adding medicine:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    try {
      const res = await fetch(`/api/eldercare/medicine/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting medicine:", error);
    }
  };

  const handleLogMedicine = async (medicineId: string, timeSlot: string, taken: boolean) => {
    try {
      const res = await fetch(`/api/eldercare/medicine/${medicineId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeSlot, taken }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error logging medicine:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-rose-500 to-pink-500 p-8 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <GreeingIcon className="w-8 h-8" />
            <h1 className="text-3xl font-bold">{greeting}!</h1>
          </div>
          <p className="text-white/80 text-lg">How are you feeling today?</p>

          {/* Quick Check-in */}
          {!stats.checkedInToday ? (
            <div className="mt-6">
              <p className="text-sm text-white/70 mb-3">Quick check-in:</p>
              <div className="flex gap-3">
                {[
                  { mood: "good" as const, icon: Smile, label: "Good" },
                  { mood: "okay" as const, icon: Meh, label: "Okay" },
                  { mood: "not_good" as const, icon: Frown, label: "Not Great" },
                ].map(({ mood, icon: Icon, label }) => (
                  <button
                    key={mood}
                    onClick={() => handleQuickCheckIn(mood)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all disabled:opacity-50"
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 w-fit">
              {stats.todayCheckIn && getMoodIcon(stats.todayCheckIn.mood)}
              <span>
                You checked in today - Feeling{" "}
                {stats.todayCheckIn?.mood === "good" ? "good" : stats.todayCheckIn?.mood === "okay" ? "okay" : "not great"}
              </span>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-4"
      >
        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <Pill className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Medicines Today</p>
              <p className="text-2xl font-bold">
                {medicines.reduce((sum, m) => sum + m.takenToday.filter(Boolean).length, 0)}/
                {medicines.reduce((sum, m) => sum + m.times.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Check-ins</p>
              <p className="text-2xl font-bold">{checkIns.length}</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10">
              <Smile className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Good Days (Week)</p>
              <p className="text-2xl font-bold">{goodMoodDays}/7</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Alerts</p>
              <p className="text-2xl font-bold">{scamAlerts.filter((a) => !a.isRead).length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2 overflow-x-auto pb-2"
      >
        {[
          { id: "overview", label: "Overview", icon: Heart },
          { id: "medicine", label: "Medicine", icon: Pill },
          { id: "checkins", label: "Check-ins", icon: Activity },
          { id: "alerts", label: "Safety Alerts", icon: Shield },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === id
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </motion.div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Medicines Due */}
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-500" />
                Today's Medicines
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("medicine")}>
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {medicines.length === 0 ? (
                <p className="text-muted-foreground text-sm">No medicines added yet</p>
              ) : (
                medicines.slice(0, 3).map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium">{medicine.name}</p>
                      <p className="text-sm text-muted-foreground">{medicine.dosage}</p>
                    </div>
                    <div className="flex gap-2">
                      {medicine.times.map((time, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            medicine.takenToday[i]
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {time} {medicine.takenToday[i] ? "✓" : "○"}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mood History */}
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Smile className="w-5 h-5 text-rose-500" />
                This Week's Mood
              </h3>
            </div>
            <div className="flex justify-between">
              {weekMoods.length === 0 ? (
                <p className="text-muted-foreground text-sm">No check-ins yet this week</p>
              ) : (
                weekMoods.slice(0, 7).reverse().map((checkIn, i) => (
                  <div key={i} className="text-center">
                    <div className="w-10 h-10 mx-auto rounded-full bg-muted flex items-center justify-center mb-1">
                      {getMoodIcon(checkIn.mood)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(checkIn.date).toLocaleDateString("en", { weekday: "short" })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Emergency Call */}
          <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
            <h3 className="font-semibold flex items-center gap-2 text-red-600 mb-4">
              <AlertTriangle className="w-5 h-5" />
              Emergency
            </h3>
            <div className="space-y-3">
              <a
                href="tel:112"
                className="flex items-center justify-between p-4 rounded-xl bg-white border border-red-500/20 hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-semibold">Emergency Services</p>
                    <p className="text-sm text-muted-foreground">Dial 112</p>
                  </div>
                </div>
                <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                  Call
                </Button>
              </a>
            </div>
          </div>

          {/* Scam Alert */}
          {scamAlerts.filter((a) => !a.isRead).length > 0 && (
            <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <h3 className="font-semibold flex items-center gap-2 text-amber-600 mb-4">
                <Shield className="w-5 h-5" />
                Safety Alert
              </h3>
              <div className="space-y-3">
                {scamAlerts
                  .filter((a) => !a.isRead)
                  .slice(0, 1)
                  .map((alert) => (
                    <div key={alert.id} className="p-4 rounded-xl bg-white border border-amber-500/20">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Medicine Tab */}
      {activeTab === "medicine" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Medicine Schedule</h2>
            <Button onClick={() => setShowAddMedicine(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Medicine
            </Button>
          </div>

          {/* Add Medicine Form */}
          {showAddMedicine && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAddMedicine}
              className="p-6 rounded-2xl border border-border bg-card space-y-4"
            >
              <h3 className="font-semibold">Add New Medicine</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medicine Name</Label>
                  <Input
                    id="name"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                    placeholder="e.g., Blood Pressure Medicine"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    value={newMedicine.dosage}
                    onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                    placeholder="e.g., 1 tablet"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Times (comma separated)</Label>
                <Input
                  value={newMedicine.times.join(", ")}
                  onChange={(e) => setNewMedicine({ ...newMedicine, times: e.target.value.split(",").map((t) => t.trim()) })}
                  placeholder="e.g., 08:00, 20:00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  value={newMedicine.notes}
                  onChange={(e) => setNewMedicine({ ...newMedicine, notes: e.target.value })}
                  placeholder="e.g., Take with food"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAddMedicine(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Save Medicine
                </Button>
              </div>
            </motion.form>
          )}

          <div className="space-y-4">
            {medicines.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No medicines added yet. Add your first medicine to start tracking.</p>
              </div>
            ) : (
              medicines.map((medicine, index) => (
                <motion.div
                  key={medicine.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 rounded-2xl border border-border bg-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10">
                        <Pill className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{medicine.name}</h3>
                        <p className="text-muted-foreground">{medicine.dosage}</p>
                        {medicine.notes && (
                          <p className="text-sm text-muted-foreground mt-1">📝 {medicine.notes}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleDeleteMedicine(medicine.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mt-4 flex gap-3">
                    {medicine.times.map((time, i) => (
                      <button
                        key={i}
                        onClick={() => handleLogMedicine(medicine.id, time, !medicine.takenToday[i])}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                          medicine.takenToday[i]
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        {time}
                        {medicine.takenToday[i] ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border-2 border-current" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Check-ins Tab */}
      {activeTab === "checkins" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Check-in History</h2>
          </div>

          <div className="space-y-3">
            {checkIns.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No check-ins yet. Use the quick check-in above to get started.</p>
              </div>
            ) : (
              checkIns.map((checkIn, index) => (
                <motion.div
                  key={checkIn.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      checkIn.mood === "good"
                        ? "bg-emerald-500/10"
                        : checkIn.mood === "okay"
                        ? "bg-amber-500/10"
                        : "bg-red-500/10"
                    }`}
                  >
                    {getMoodIcon(checkIn.mood)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">
                        {checkIn.mood === "not_good" ? "Not Great" : checkIn.mood}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(checkIn.date).toLocaleDateString("en", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {checkIn.note && <p className="text-sm text-muted-foreground mt-1">{checkIn.note}</p>}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Safety Alerts</h2>
            <p className="text-muted-foreground">Stay aware of common scams and safety tips</p>
          </div>

          <div className="space-y-4">
            {scamAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 rounded-2xl border ${
                  alert.isRead ? "border-border bg-card" : "border-amber-500/30 bg-amber-500/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{alert.title}</h3>
                    <p className="text-muted-foreground mt-2">{alert.description}</p>
                    <p className="text-sm text-muted-foreground mt-3">
                      {new Date(alert.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  {!alert.isRead && (
                    <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 text-xs font-medium">
                      New
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Important Reminders */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
            <h3 className="font-semibold mb-4">🛡️ Safety Tips</h3>
            <div className="space-y-3">
              {[
                "Never share OTP or passwords with anyone, even if they claim to be from a bank",
                "Don't click on links in messages from unknown numbers",
                "If unsure about a call, hang up and call your family first",
                "No legitimate company will ask you to pay money to claim a prize",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Voice Assistant Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25 flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Mic className="w-7 h-7" />
      </motion.button>
    </div>
  );
}

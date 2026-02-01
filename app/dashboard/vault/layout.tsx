"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  CreditCard,
  Heart,
  RefreshCw,
  Phone,
  Users,
  ChevronLeft,
  Lock,
  CheckCircle2,
  Sparkles,
  Menu,
  X,
  Folder,
} from "lucide-react";

const vaultSections = [
  {
    id: "identity",
    label: "Identity",
    icon: Shield,
    href: "/dashboard/vault/identity",
    description: "Aadhaar, PAN, Passport",
  },
  {
    id: "finance",
    label: "Finance",
    icon: CreditCard,
    href: "/dashboard/vault/finance",
    description: "Accounts, Loans, Investments",
  },
  {
    id: "insurance",
    label: "Insurance",
    icon: Heart,
    href: "/dashboard/vault/insurance",
    description: "Health, Life, Vehicle",
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: RefreshCw,
    href: "/dashboard/vault/subscriptions",
    description: "EMIs, Recurring payments",
  },
  {
    id: "emergency",
    label: "Emergency",
    icon: Phone,
    href: "/dashboard/vault/emergency",
    description: "Emergency contacts",
  },
  {
    id: "nominees",
    label: "Nominees",
    icon: Users,
    href: "/dashboard/vault/nominees",
    description: "Who gets what",
  },
];

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentSection = vaultSections.find((s) => pathname.includes(s.id));
  const isVaultHome = pathname === "/dashboard/vault";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background - Sage Theme */}
      <div className="fixed inset-0 -z-10">
        {/* Soft Sage Gradient Orbs */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-sage/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-sage-light/15 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sage/5 blur-[120px]" />

        {/* Decorative Lines */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.06]" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M0,150 Q300,100 600,150 T1200,150" fill="none" stroke="hsl(var(--sage))" strokeWidth="1" />
          <path d="M0,400 Q400,350 800,400 T1200,400" fill="none" stroke="hsl(var(--sage))" strokeWidth="0.5" strokeDasharray="5,5" />
          <path d="M0,650 Q300,600 600,650 T1200,650" fill="none" stroke="hsl(var(--sage))" strokeWidth="0.8" />
        </svg>

        {/* Spinning Decorative Circle */}
        <svg className="absolute top-20 right-20 w-24 h-24 text-sage/10 animate-spin-slow" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>
        <svg className="absolute bottom-32 left-20 w-20 h-20 text-sage/8 animate-spin-slow" style={{ animationDirection: "reverse" }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>

        {/* Floating Dots */}
        {mounted && (
          <>
            <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-sage/30 rounded-full animate-float" />
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-sage/20 rounded-full animate-float" style={{ animationDelay: "1s" }} />
            <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-sage/25 rounded-full animate-float" style={{ animationDelay: "2s" }} />
            <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-sage/35 rounded-full animate-float" style={{ animationDelay: "1.5s" }} />
          </>
        )}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-sage/20">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="relative flex items-center justify-between px-4 md:px-6 py-4">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-sage/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link
              href="/dashboard"
              className="group flex items-center gap-2 text-muted-foreground hover:text-sage-dark transition-all duration-300"
            >
              <motion.div
                whileHover={{ x: -3 }}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </motion.div>
            </Link>

            <div className="h-6 w-px bg-sage/20" />

            <div className="flex items-center gap-3">
              <motion.div
                className="relative p-2.5 rounded-2xl bg-sage/10 border border-sage/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Folder className="w-5 h-5 text-sage" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Lock className="w-3 h-3 text-sage-dark" />
                </motion.div>
              </motion.div>
              <div>
                <h1 className="font-serif text-lg md:text-xl font-medium text-foreground">
                  Life <span className="text-sage">Vault</span>
                </h1>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  Your life, organized & protected
                </p>
              </div>
            </div>
          </div>

          {/* Vault Completion Status */}
          <motion.div
            className="flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-2.5 rounded-2xl bg-sage/10 border border-sage/20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-sage" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-semibold text-sage-dark">67%</span>
              <div className="hidden sm:block w-16 md:w-24 h-1.5 bg-sage/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-sage rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "67%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar Navigation */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 280 : 80 }}
          className="hidden md:block sticky top-[73px] h-[calc(100vh-73px)] border-r border-sage/20 bg-card/30 backdrop-blur-sm"
        >
          <div className="p-4 h-full flex flex-col">
            {/* Toggle Button */}
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="self-end mb-4 p-2 rounded-xl hover:bg-sage/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: sidebarOpen ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeft className="w-4 h-4 text-sage" />
              </motion.div>
            </motion.button>

            {/* Navigation Items */}
            <nav className="space-y-2 flex-1">
              {/* Vault Overview Link */}
              <Link href="/dashboard/vault">
                <motion.div
                  className={`relative flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                    isVaultHome
                      ? "bg-sage/15 border border-sage/30"
                      : "hover:bg-sage/10"
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`p-2.5 rounded-xl ${
                    isVaultHome
                      ? "bg-sage text-white"
                      : "bg-sage/10 text-sage"
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex-1 min-w-0"
                      >
                        <p className={`font-medium truncate ${isVaultHome ? "text-sage-dark" : "text-foreground"}`}>
                          Overview
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Vault summary
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>

              <div className="py-2">
                <div className="h-px bg-sage/10" />
              </div>

              {/* Section Links */}
              {vaultSections.map((section) => {
                const Icon = section.icon;
                const isActive = pathname.includes(section.id);

                return (
                  <Link key={section.id} href={section.href}>
                    <motion.div
                      className={`relative flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? "bg-sage/15 border border-sage/30"
                          : "hover:bg-sage/10"
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sage rounded-r-full"
                        />
                      )}

                      <div className={`p-2.5 rounded-xl transition-all ${
                        isActive
                          ? "bg-sage text-white shadow-lg shadow-sage/20"
                          : "bg-sage/10 text-sage group-hover:bg-sage/20"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex-1 min-w-0"
                          >
                            <p className={`font-medium truncate ${isActive ? "text-sage-dark" : "text-foreground"}`}>
                              {section.label}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {section.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Security Badge */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-auto p-4 rounded-2xl bg-sage/5 border border-sage/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-sage/10">
                      <Lock className="w-4 h-4 text-sage" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-sage-dark">Encrypted & Secure</p>
                      <p className="text-[10px] text-muted-foreground">Your data is protected</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-[73px] bottom-0 w-80 bg-card border-r border-sage/20 z-50 md:hidden overflow-y-auto"
              >
                <div className="p-4 space-y-2">
                  <Link href="/dashboard/vault" onClick={() => setMobileMenuOpen(false)}>
                    <div className={`flex items-center gap-3 p-4 rounded-2xl ${
                      isVaultHome ? "bg-sage/15 border border-sage/30" : "hover:bg-sage/10"
                    }`}>
                      <div className={`p-2.5 rounded-xl ${
                        isVaultHome ? "bg-sage text-white" : "bg-sage/10 text-sage"
                      }`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-medium ${isVaultHome ? "text-sage-dark" : ""}`}>Overview</p>
                        <p className="text-xs text-muted-foreground">Vault summary</p>
                      </div>
                    </div>
                  </Link>

                  <div className="py-2">
                    <div className="h-px bg-sage/10" />
                  </div>

                  {vaultSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = pathname.includes(section.id);

                    return (
                      <Link key={section.id} href={section.href} onClick={() => setMobileMenuOpen(false)}>
                        <div className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                          isActive ? "bg-sage/15 border border-sage/30" : "hover:bg-sage/10"
                        }`}>
                          <div className={`p-2.5 rounded-xl ${
                            isActive ? "bg-sage text-white" : "bg-sage/10 text-sage"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`font-medium ${isActive ? "text-sage-dark" : ""}`}>{section.label}</p>
                            <p className="text-xs text-muted-foreground">{section.description}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 min-h-[calc(100vh-73px)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

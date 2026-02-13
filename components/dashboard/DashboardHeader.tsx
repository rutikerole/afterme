"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { Heart, LogOut, Bell, Search, Settings, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/lib/auth-context";

interface DashboardHeaderProps {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Refs for click-outside detection
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Close notifications if clicking outside
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setShowNotifications(false);
      }

      // Close user menu if clicking outside
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    }

    // Only add listener if any dropdown is open
    if (showNotifications || showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showNotifications, showUserMenu]);

  // Close dropdowns on Escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowUserMenu(false);
        setShowMobileMenu(false);
      }
    }

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, []);

  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setShowMobileMenu(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle functions that close other menus
  const toggleNotifications = useCallback(() => {
    setShowNotifications((prev) => !prev);
    setShowUserMenu(false);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setShowUserMenu((prev) => !prev);
    setShowNotifications(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setShowMobileMenu((prev) => !prev);
  }, []);

  // Get initials from name
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Simplified navigation - main items only
  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/voice", label: "Voice" },
    { href: "/dashboard/memories", label: "Memories" },
    { href: "/dashboard/vault", label: "Vault" },
    { href: "/dashboard/family", label: "Family" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-sage/10">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-sage/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-sage/20">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-semibold text-foreground group-hover:text-sage-dark transition-colors">
                AfterMe
              </span>
              <span className="text-[10px] text-sage font-medium tracking-widest uppercase hidden sm:block">
                Legacy Vault
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm text-muted-foreground hover:text-sage-dark transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-sage group-hover:w-3/4 transition-all duration-300 rounded-full" />
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex text-muted-foreground hover:text-sage-dark hover:bg-sage/10"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-sage-dark hover:bg-sage/10 relative"
                onClick={toggleNotifications}
                aria-expanded={showNotifications}
                aria-haspopup="true"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-sage rounded-full animate-pulse" />
              </Button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-card border border-sage/20 rounded-2xl shadow-xl overflow-hidden animate-fade-in-down"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="p-4 border-b border-sage/10 flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Close notifications"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                    <div
                      className="flex items-start gap-3 p-3 rounded-xl bg-sage/5 hover:bg-sage/10 transition-colors cursor-pointer"
                      role="menuitem"
                      tabIndex={0}
                    >
                      <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-4 h-4 text-sage" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground">Welcome to AfterMe!</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Start building your legacy today</p>
                        <p className="text-xs text-sage mt-1">Just now</p>
                      </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground py-2">
                      No more notifications
                    </p>
                  </div>
                  <div className="p-3 border-t border-sage/10">
                    <button className="w-full text-sm text-sage hover:text-sage-dark transition-colors py-2">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={toggleUserMenu}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-sage/10 transition-colors duration-300"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center shadow-md shadow-sage/20">
                  <span className="text-sm font-medium text-white">
                    {initials}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 hidden sm:block ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-card border border-sage/20 rounded-2xl shadow-xl overflow-hidden animate-fade-in-down"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="p-4 border-b border-sage/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center">
                        <span className="text-lg font-medium text-white">{initials}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/dashboard/progress"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-sage/10 rounded-xl transition-colors"
                      onClick={() => setShowUserMenu(false)}
                      role="menuitem"
                    >
                      <Heart className="w-4 h-4" />
                      My Progress
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-sage/10 rounded-xl transition-colors"
                      onClick={() => setShowUserMenu(false)}
                      role="menuitem"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <hr className="my-2 border-sage/10" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-sage-dark hover:bg-sage/10"
              onClick={toggleMobileMenu}
              aria-expanded={showMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <nav
            ref={mobileMenuRef}
            className="lg:hidden pt-4 pb-2 border-t border-sage/10 mt-3 animate-fade-in-down"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sage-dark hover:bg-sage/10 rounded-xl transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-sage/10" />
              <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">More Features</p>
              <Link
                href="/dashboard/stories"
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sage-dark hover:bg-sage/10 rounded-xl transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                Stories
              </Link>
              <Link
                href="/dashboard/messages"
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sage-dark hover:bg-sage/10 rounded-xl transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                Messages
              </Link>
              <Link
                href="/dashboard/eldercare"
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sage-dark hover:bg-sage/10 rounded-xl transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                Eldercare
              </Link>
              <Link
                href="/dashboard/legacy"
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sage-dark hover:bg-sage/10 rounded-xl transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                Legacy
              </Link>
              <Link
                href="/dashboard/progress"
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-sage-dark hover:bg-sage/10 rounded-xl transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                Progress
              </Link>
            </div>
          </nav>
        )}
      </div>

      {/* Mobile menu backdrop */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}

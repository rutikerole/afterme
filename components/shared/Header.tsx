"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-sage/20 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo with Sage Green */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-sage/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-sage/25">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-semibold text-foreground group-hover:text-sage-dark transition-colors duration-300">
                AfterMe
              </span>
              <span className="text-[10px] text-sage font-medium tracking-widest uppercase hidden sm:block">
                Legacy Vault
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="relative text-sm text-muted-foreground hover:text-sage-dark transition-colors duration-300 group"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sage group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="#how-it-works"
              className="relative text-sm text-muted-foreground hover:text-sage-dark transition-colors duration-300 group"
            >
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sage group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="#security"
              className="relative text-sm text-muted-foreground hover:text-sage-dark transition-colors duration-300 group"
            >
              Security
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sage group-hover:w-full transition-all duration-300" />
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-sage-dark hover:text-sage hover:bg-sage/10">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-sage hover:bg-sage-dark shadow-lg shadow-sage/25 transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-sage hover:text-sage-dark transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-6 pb-4 animate-fade-in-down">
            {/* Decorative line */}
            <div className="w-12 h-0.5 bg-gradient-to-r from-sage to-transparent mb-6" />

            <nav className="flex flex-col gap-4 mb-6">
              <Link
                href="#features"
                className="text-base text-muted-foreground hover:text-sage-dark transition-colors py-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-base text-muted-foreground hover:text-sage-dark transition-colors py-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                How It Works
              </Link>
              <Link
                href="#security"
                className="text-base text-muted-foreground hover:text-sage-dark transition-colors py-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                Security
              </Link>
            </nav>
            <div className="flex flex-col gap-3">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-sage/30 text-sage-dark hover:bg-sage/10">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-sage hover:bg-sage-dark">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

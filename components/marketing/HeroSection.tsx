"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

// Floating memory cards data
const floatingMemories = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&h=200&fit=crop",
    label: "Family moments",
    position: "top-32 left-[5%]",
    delay: "0s",
    rotation: "-6deg",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=200&h=200&fit=crop",
    label: "Voice messages",
    position: "top-48 right-[8%]",
    delay: "0.5s",
    rotation: "8deg",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop",
    label: "Precious memories",
    position: "bottom-40 left-[10%]",
    delay: "1s",
    rotation: "4deg",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=200&h=200&fit=crop",
    label: "Together forever",
    position: "bottom-32 right-[5%]",
    delay: "1.5s",
    rotation: "-5deg",
  },
];

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-sage-light/10 to-secondary/20">
      {/* Animated gradient background with SAGE */}
      <div className="absolute inset-0 -z-10">
        {/* Main sage gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-sage/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sage-light/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sage/5 rounded-full blur-[150px]" />

        {/* Decorative animated lines */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-20" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path
            d="M0,400 Q300,300 600,400 T1200,400"
            fill="none"
            stroke="hsl(var(--sage))"
            strokeWidth="1"
            className="animate-draw-line"
          />
          <path
            d="M0,450 Q300,350 600,450 T1200,450"
            fill="none"
            stroke="hsl(var(--sage))"
            strokeWidth="0.5"
            strokeDasharray="5,5"
            className="animate-draw-line"
            style={{ animationDelay: "0.5s" }}
          />
        </svg>

        {/* Decorative circles with sage */}
        <svg className="absolute top-20 right-20 w-32 h-32 text-sage/20 animate-spin-slow" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>
        <svg className="absolute bottom-32 left-20 w-24 h-24 text-sage/20 animate-spin-slow" style={{ animationDirection: "reverse" }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>

        {/* Floating dots in sage */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-sage/40 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-sage/30 rounded-full animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-sage/20 rounded-full animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-sage rounded-full animate-float" style={{ animationDelay: "1.5s" }} />

        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-32 h-32">
          <div className="absolute top-8 left-0 w-16 h-px bg-gradient-to-r from-sage/50 to-transparent" />
          <div className="absolute top-0 left-8 w-px h-16 bg-gradient-to-b from-sage/50 to-transparent" />
        </div>
        <div className="absolute top-0 right-0 w-32 h-32">
          <div className="absolute top-8 right-0 w-16 h-px bg-gradient-to-l from-sage/50 to-transparent" />
          <div className="absolute top-0 right-8 w-px h-16 bg-gradient-to-b from-sage/50 to-transparent" />
        </div>
      </div>

      {/* Floating Memory Cards - Hidden on mobile */}
      <div className="hidden lg:block">
        {floatingMemories.map((memory) => (
          <div
            key={memory.id}
            className={`absolute ${memory.position} z-10 opacity-0 ${mounted ? "animate-float-in" : ""}`}
            style={{
              animationDelay: memory.delay,
              transform: `rotate(${memory.rotation})`,
            }}
          >
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-2 bg-gradient-to-r from-sage/30 to-sage-light/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-card border border-sage/20 rounded-xl p-2 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:border-sage/40">
                <div className="w-28 h-28 rounded-lg overflow-hidden">
                  <Image
                    src={memory.image}
                    alt={memory.label}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-sage-dark mt-2 text-center font-medium">
                  {memory.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-24 pb-16 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Badge with Sage */}
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 bg-sage/10 border border-sage/30 rounded-full mb-8 ${mounted ? "animate-fade-in-down" : "opacity-0"}`}>
            <Sparkles className="w-4 h-4 text-sage animate-pulse" />
            <span className="text-sm text-sage-dark font-medium">
              Preserve what matters most
            </span>
          </div>

          {/* Main Headline with Sage accent */}
          <h1 className={`font-serif text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] mb-8 ${mounted ? "animate-fade-in-up" : "opacity-0"}`}>
            <span className="text-foreground">Everything your</span>
            <br />
            <span className="text-foreground">loved ones will need</span>
            <br />
            <span className="relative inline-block mt-2">
              <span className="text-sage">— after you.</span>
              {/* Decorative underline in sage */}
              <svg className="absolute -bottom-2 left-0 w-full h-4 text-sage/40" viewBox="0 0 200 16" preserveAspectRatio="none">
                <path d="M0,12 Q50,4 100,12 T200,12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className={`text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12 ${mounted ? "animate-fade-in-up delay-100" : "opacity-0"}`}>
            Create a lasting legacy of <span className="text-sage-dark font-medium">voice messages</span>,
            <span className="text-sage-dark font-medium"> cherished memories</span>, and
            <span className="text-sage-dark font-medium"> heartfelt letters</span> for the people you love.
          </p>

          {/* CTA Buttons with Sage */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 ${mounted ? "animate-fade-in-up delay-200" : "opacity-0"}`}>
            <Link href="/auth/register">
              <Button size="lg" className="group text-base px-8 py-6 rounded-full bg-sage hover:bg-sage-dark shadow-lg shadow-sage/30 hover:shadow-xl hover:shadow-sage/40 transition-all duration-300">
                <span>Start Your Legacy</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="text-base px-8 py-6 rounded-full border-2 border-sage/30 text-sage-dark hover:bg-sage/10 hover:border-sage transition-all duration-300">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Trust Stats with Sage accents */}
          <div className={`flex flex-wrap items-center justify-center gap-8 md:gap-12 ${mounted ? "animate-fade-in-up delay-300" : "opacity-0"}`}>
            <div className="text-center group">
              <div className="text-3xl font-serif font-medium text-sage group-hover:scale-110 transition-transform">100%</div>
              <div className="text-sm text-muted-foreground">Private & Secure</div>
            </div>
            <div className="w-px h-10 bg-sage/30 hidden md:block" />
            <div className="text-center group">
              <div className="text-3xl font-serif font-medium text-sage group-hover:scale-110 transition-transform">Forever</div>
              <div className="text-sm text-muted-foreground">Preserved</div>
            </div>
            <div className="w-px h-10 bg-sage/30 hidden md:block" />
            <div className="text-center group">
              <div className="text-3xl font-serif font-medium text-sage group-hover:scale-110 transition-transform">With Love</div>
              <div className="text-sm text-muted-foreground">Built for Families</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator with sage */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-2 text-sage/60">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-8 border-2 border-sage/40 rounded-full flex justify-center pt-1">
            <div className="w-1 h-2 bg-sage rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

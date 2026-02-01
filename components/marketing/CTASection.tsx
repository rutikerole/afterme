"use client";

import Link from "next/link";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Creative Background with sage */}
      <div className="absolute inset-0 -z-10">
        {/* Main gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-sage/5 to-sage/10" />

        {/* Animated orbs in sage */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sage/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sage-light/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />

        {/* Decorative rings in sage */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[600px] h-[600px] border border-sage/10 rounded-full animate-spin-slow" />
          <div className="absolute inset-8 border border-sage/5 rounded-full animate-spin-slow" style={{ animationDirection: "reverse" }} />
          <div className="absolute inset-16 border border-sage/10 rounded-full animate-spin-slow" style={{ animationDuration: "30s" }} />
        </div>

        {/* Floating elements in sage */}
        <div className="absolute top-20 left-20 w-3 h-3 bg-sage/40 rounded-full animate-float" />
        <div className="absolute top-40 right-32 w-2 h-2 bg-sage-dark/30 rounded-full animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-32 left-1/3 w-4 h-4 bg-sage/30 rounded-full animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage/10 border border-sage/30 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-sage animate-pulse" />
            <span className="text-sm text-sage-dark font-medium">
              Begin your journey
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground mb-6 leading-tight">
            Start building your
            <span className="block text-sage">legacy today.</span>
          </h2>

          {/* Supporting text */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            It only takes a moment to begin. One voice message. One memory.
            One letter for the future. Your family will thank you.
          </p>

          {/* CTA Button - Large and prominent */}
          <div className="relative inline-block group">
            {/* Glow effect in sage */}
            <div className="absolute -inset-1 bg-gradient-to-r from-sage/50 to-sage-dark/50 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

            <Link href="/auth/register">
              <Button
                size="lg"
                className="relative text-lg px-12 py-7 rounded-full bg-sage hover:bg-sage-dark shadow-2xl shadow-sage/25 hover:shadow-sage/40 transition-all duration-300 group-hover:scale-105"
              >
                <Heart className="w-5 h-5 mr-3" />
                Create Your Vault
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Reassurance */}
          <p className="mt-8 text-sm text-muted-foreground">
            Free to start • No credit card required • Cancel anytime
          </p>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground/60">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs">256-bit encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs">Private & secure</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs">Made with love</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

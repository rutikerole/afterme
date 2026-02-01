"use client";

import { Lock, Eye, Server, ShieldCheck, Fingerprint, Heart } from "lucide-react";

const trustPoints = [
  {
    icon: Lock,
    title: "End-to-End Encrypted",
    description: "Your memories are encrypted before they leave your device.",
  },
  {
    icon: Eye,
    title: "Zero Knowledge",
    description: "We can't read your content. Only you and your trusted circle can.",
  },
  {
    icon: Server,
    title: "Secure Storage",
    description: "Enterprise-grade infrastructure with redundant backups.",
  },
  {
    icon: Fingerprint,
    title: "Private by Design",
    description: "No ads, no tracking, no selling your information. Ever.",
  },
];

const TrustSection = () => {
  return (
    <section id="security" className="py-24 bg-foreground relative overflow-hidden">
      {/* Decorative background with sage */}
      <div className="absolute inset-0">
        {/* Gradient orbs in sage */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sage/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sage/10 rounded-full blur-[120px]" />

        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="trust-grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#trust-grid)" className="text-background" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage/20 rounded-full mb-6">
            <ShieldCheck className="w-4 h-4 text-sage" />
            <span className="text-sm text-sage font-medium">Your trust, our priority</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-background mb-6">
            Built on trust.
            <span className="block text-sage">Designed for peace of mind.</span>
          </h2>
          <p className="text-lg text-background/60 leading-relaxed max-w-2xl mx-auto">
            Your most precious memories deserve the highest level of protection.
            Security isn&apos;t a feature — it&apos;s our foundation.
          </p>
        </div>

        {/* Trust Points - Creative Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          {trustPoints.map((point, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-background/5 border border-sage/10 backdrop-blur-sm hover:bg-background/10 hover:border-sage/30 transition-all duration-300"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-sage/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

              <div className="relative">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-sage/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <point.icon className="w-6 h-6 text-sage" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-medium text-background mb-2">
                  {point.title}
                </h3>
                <p className="text-sm text-background/50 leading-relaxed">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Visual Trust Badge */}
        <div className="max-w-2xl mx-auto">
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-sage/20 to-sage/5 border border-sage/20">
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-20 h-20 border border-sage/20 rounded-full animate-spin-slow" style={{ animationDuration: "30s" }} />
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-sage/10 rounded-full blur-sm" />

            <div className="relative flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-sage/20 flex items-center justify-center">
                  <Heart className="w-10 h-10 text-sage" />
                </div>
              </div>

              {/* Text */}
              <div>
                <h3 className="font-serif text-2xl font-medium text-background mb-2">
                  Your memories are sacred to us
                </h3>
                <p className="text-background/60">
                  We built AfterMe because we believe everyone deserves to leave a lasting legacy.
                  Your trust is the most important feature we&apos;ll ever build.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;

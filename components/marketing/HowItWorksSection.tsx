"use client";

import Image from "next/image";
import { UserPlus, Heart, Shield, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Vault",
    description: "Sign up in seconds. Your secure, private space is ready instantly — no complicated setup required.",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=500&h=400&fit=crop",
    accent: "sage",
  },
  {
    number: "02",
    icon: Heart,
    title: "Add What Matters",
    description: "Record voice messages, upload cherished photos, write letters for the future. Build your legacy piece by piece.",
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=500&h=400&fit=crop",
    accent: "sage",
  },
  {
    number: "03",
    icon: Shield,
    title: "Set Trusted Access",
    description: "Choose who can access your vault and when. Your wishes are protected and honored, always.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&h=400&fit=crop",
    accent: "sage",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Decorative background with sage accents */}
      <div className="absolute inset-0 -z-10">
        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
        {/* Sage gradient orbs */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-sage/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-0 w-60 h-60 bg-sage-light/20 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <span className="inline-block text-sm font-medium text-sage uppercase tracking-widest mb-4">
            How It Works
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground mb-6">
            Simple. <span className="text-sage">Meaningful.</span> Secure.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Three simple steps to preserve your legacy for generations.
          </p>
        </div>

        {/* Steps - Creative Layout */}
        <div className="max-w-6xl mx-auto space-y-24">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12 lg:gap-20`}
            >
              {/* Image Side */}
              <div className="flex-1 w-full">
                <div className="relative group">
                  {/* Decorative frame */}
                  <div className={`absolute -inset-4 bg-${step.accent}/10 rounded-3xl transform ${index % 2 === 0 ? "rotate-3" : "-rotate-3"} group-hover:rotate-0 transition-transform duration-500`} />

                  {/* Image container */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={500}
                      height={400}
                      className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Number overlay */}
                    <div className="absolute top-6 left-6">
                      <span className="text-7xl font-serif font-bold text-white/20">
                        {step.number}
                      </span>
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="flex-1 w-full">
                <div className="max-w-md">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-${step.accent}/10 flex items-center justify-center mb-6`}>
                    <step.icon className={`w-8 h-8 text-${step.accent}`} />
                  </div>

                  {/* Step number */}
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2 block">
                    Step {step.number}
                  </span>

                  {/* Title */}
                  <h3 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-4">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Arrow indicator (except last) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex items-center gap-2 text-sage/60">
                      <span className="text-sm">Next step</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

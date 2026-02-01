"use client";

import Image from "next/image";
import { Mic, MessageCircle, Users, Images, Play, Heart } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice Vault",
    description:
      "Record messages in your own voice. Let them hear your laugh, your stories, your love — forever.",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=400&fit=crop",
    color: "from-sage/20 to-sage/5",
    iconBg: "bg-sage/10 text-sage",
  },
  {
    icon: Images,
    title: "Memory Vault",
    description:
      "Preserve your most precious photos and moments. Organized beautifully, protected forever.",
    image: "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=600&h=400&fit=crop",
    color: "from-sage-light/40 to-sage/10",
    iconBg: "bg-sage-light text-sage-dark",
  },
  {
    icon: MessageCircle,
    title: "Future Messages",
    description:
      "Write letters that arrive on special days. Be there for birthdays, graduations, weddings.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop",
    color: "from-sage/15 to-sage-light/20",
    iconBg: "bg-sage/10 text-sage-dark",
  },
  {
    icon: Users,
    title: "Trusted Circle",
    description:
      "Choose who receives your legacy. Set access rules that ensure your wishes are honored.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
    color: "from-sage-dark/15 to-sage/10",
    iconBg: "bg-sage-light text-sage-dark",
  },
];

// Floating Leaf SVG Component - BIGGER & MORE VISIBLE
const FloatingLeaf = ({ className, style, size = 50 }: { className?: string; style?: React.CSSProperties; size?: number }) => (
  <svg
    className={className}
    style={style}
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
  >
    <path
      d="M20 2C20 2 8 12 8 24C8 32 13 38 20 38C27 38 32 32 32 24C32 12 20 2 20 2Z"
      fill="hsl(var(--sage))"
      fillOpacity="0.35"
      stroke="hsl(var(--sage))"
      strokeWidth="1.5"
      strokeOpacity="0.6"
    />
    <path
      d="M20 8V32M20 14L14 20M20 20L26 26"
      stroke="hsl(var(--sage))"
      strokeWidth="1.5"
      strokeOpacity="0.5"
      strokeLinecap="round"
    />
  </svg>
);

// Small botanical branch - BIGGER & MORE VISIBLE
const FloatingBranch = ({ className, style, size = 80 }: { className?: string; style?: React.CSSProperties; size?: number }) => (
  <svg
    className={className}
    style={style}
    width={size}
    height={size}
    viewBox="0 0 60 60"
    fill="none"
  >
    <path
      d="M30 55V15"
      stroke="hsl(var(--sage))"
      strokeWidth="2"
      strokeOpacity="0.5"
      strokeLinecap="round"
    />
    <path
      d="M30 35C30 35 20 28 15 18C20 21 27 24 30 30"
      fill="hsl(var(--sage))"
      fillOpacity="0.25"
      stroke="hsl(var(--sage))"
      strokeWidth="1.5"
      strokeOpacity="0.5"
    />
    <path
      d="M30 25C30 25 40 18 45 8C40 11 33 14 30 20"
      fill="hsl(var(--sage))"
      fillOpacity="0.25"
      stroke="hsl(var(--sage))"
      strokeWidth="1.5"
      strokeOpacity="0.5"
    />
    <path
      d="M30 45C30 45 22 40 17 32C22 34 27 37 30 42"
      fill="hsl(var(--sage))"
      fillOpacity="0.25"
      stroke="hsl(var(--sage))"
      strokeWidth="1.5"
      strokeOpacity="0.5"
    />
    <circle cx="30" cy="12" r="3" fill="hsl(var(--sage))" fillOpacity="0.3" />
  </svg>
);

const FeatureSection = () => {
  return (
    <section id="features" className="py-28 bg-background relative overflow-hidden">
      {/* Background decoration with sage - MORE VISIBLE */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sage/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sage-light/40 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-sage/10 rounded-full blur-3xl" />

      {/* Animated decorative lines - Top - MUCH MORE VISIBLE */}
      <svg className="absolute top-12 left-0 w-full h-40 opacity-30" viewBox="0 0 1200 100" preserveAspectRatio="none">
        <path
          d="M0,50 Q300,15 600,50 T1200,50"
          fill="none"
          stroke="hsl(var(--sage))"
          strokeWidth="2"
          className="animate-draw-line"
        />
        <path
          d="M0,75 Q400,35 800,75 T1200,75"
          fill="none"
          stroke="hsl(var(--sage))"
          strokeWidth="1.5"
          className="animate-draw-line"
          style={{ animationDelay: "0.5s" }}
        />
        <path
          d="M0,25 Q500,55 900,25 T1200,30"
          fill="none"
          stroke="hsl(var(--sage))"
          strokeWidth="1"
          className="animate-draw-line"
          style={{ animationDelay: "1s" }}
        />
      </svg>

      {/* Animated decorative lines - Bottom - MUCH MORE VISIBLE */}
      <svg className="absolute bottom-16 left-0 w-full h-40 opacity-25" viewBox="0 0 1200 100" preserveAspectRatio="none">
        <path
          d="M0,30 Q200,70 500,30 T1000,30 T1200,50"
          fill="none"
          stroke="hsl(var(--sage))"
          strokeWidth="2"
          className="animate-draw-line"
          style={{ animationDelay: "1s" }}
        />
        <path
          d="M0,60 Q350,25 700,60 T1200,55"
          fill="none"
          stroke="hsl(var(--sage))"
          strokeWidth="1.5"
          className="animate-draw-line"
          style={{ animationDelay: "1.5s" }}
        />
      </svg>

      {/* Floating leaves - BIGGER & scattered around */}
      <FloatingLeaf
        className="absolute top-28 left-[6%] animate-float"
        style={{ animationDuration: "8s", animationDelay: "0s" }}
        size={55}
      />
      <FloatingLeaf
        className="absolute top-40 right-[10%] animate-float rotate-45"
        style={{ animationDuration: "10s", animationDelay: "2s" }}
        size={50}
      />
      <FloatingLeaf
        className="absolute bottom-36 left-[12%] animate-float -rotate-12"
        style={{ animationDuration: "9s", animationDelay: "1s" }}
        size={60}
      />
      <FloatingLeaf
        className="absolute top-[55%] right-[6%] animate-float rotate-90"
        style={{ animationDuration: "11s", animationDelay: "3s" }}
        size={45}
      />
      <FloatingLeaf
        className="absolute top-[35%] left-[4%] animate-float rotate-180"
        style={{ animationDuration: "7s", animationDelay: "0.5s" }}
        size={50}
      />
      <FloatingLeaf
        className="absolute bottom-[25%] right-[15%] animate-float -rotate-30"
        style={{ animationDuration: "12s", animationDelay: "2.5s" }}
        size={40}
      />

      {/* Floating branches - BIGGER */}
      <FloatingBranch
        className="absolute top-20 right-[18%] animate-float"
        style={{ animationDuration: "12s", animationDelay: "1.5s" }}
        size={90}
      />
      <FloatingBranch
        className="absolute bottom-28 right-[8%] animate-float -rotate-45"
        style={{ animationDuration: "14s", animationDelay: "2.5s" }}
        size={85}
      />
      <FloatingBranch
        className="absolute top-[50%] left-[2%] animate-float rotate-12"
        style={{ animationDuration: "13s", animationDelay: "0.8s" }}
        size={80}
      />
      <FloatingBranch
        className="absolute top-[70%] left-[20%] animate-float rotate-[-20deg]"
        style={{ animationDuration: "15s", animationDelay: "3.5s" }}
        size={70}
      />

      {/* Floating dots/particles - BIGGER */}
      <div className="absolute top-32 left-[22%] w-4 h-4 rounded-full bg-sage/50 animate-float" style={{ animationDuration: "6s" }} />
      <div className="absolute top-48 right-[28%] w-5 h-5 rounded-full bg-sage/40 animate-float" style={{ animationDuration: "8s", animationDelay: "1s" }} />
      <div className="absolute bottom-44 left-[32%] w-4 h-4 rounded-full bg-sage/45 animate-float" style={{ animationDuration: "7s", animationDelay: "2s" }} />
      <div className="absolute top-[42%] right-[22%] w-3 h-3 rounded-full bg-sage/55 animate-float" style={{ animationDuration: "9s", animationDelay: "0.5s" }} />
      <div className="absolute bottom-32 right-[38%] w-4 h-4 rounded-full bg-sage/40 animate-float" style={{ animationDuration: "10s", animationDelay: "3s" }} />
      <div className="absolute top-[65%] left-[42%] w-3 h-3 rounded-full bg-sage/50 animate-float" style={{ animationDuration: "5s", animationDelay: "1.5s" }} />
      <div className="absolute top-24 left-[45%] w-5 h-5 rounded-full bg-sage/35 animate-float" style={{ animationDuration: "11s", animationDelay: "4s" }} />
      <div className="absolute bottom-20 left-[55%] w-4 h-4 rounded-full bg-sage/45 animate-float" style={{ animationDuration: "8s", animationDelay: "2.5s" }} />

      {/* Decorative circles - MORE VISIBLE */}
      <div className="absolute top-16 left-[48%] w-32 h-32 rounded-full border-2 border-sage/25 animate-pulse" style={{ animationDuration: "4s" }} />
      <div className="absolute bottom-24 right-[12%] w-24 h-24 rounded-full border-2 border-sage/30 animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
      <div className="absolute top-[40%] left-[8%] w-20 h-20 rounded-full border border-sage/20 animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />

      <div className="container mx-auto px-6 relative">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage/10 border border-sage/20 rounded-full mb-6">
            <Heart className="w-4 h-4 text-sage" />
            <span className="text-sm text-sage-dark font-medium">Built with love</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground mb-6">
            Your legacy,
            <span className="text-sage"> preserved</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Everything you need to create a meaningful, lasting presence for the people you cherish most.
          </p>
        </div>

        {/* Features Grid - Bento Style */}
        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card border border-border rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500"
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative p-8">
                {/* Top row - Icon and play button */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <button className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-foreground/10">
                    <Play className="w-4 h-4 text-foreground/60" />
                  </button>
                </div>

                {/* Content */}
                <h3 className="font-serif text-2xl font-medium text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Image preview */}
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>

              {/* Decorative corner */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-sage/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* Decorative bottom element - enhanced */}
        <div className="flex flex-col items-center mt-20 space-y-6">
          {/* Botanical divider - MORE VISIBLE */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-sage/60 to-sage/40 rounded-full" />
            <svg width="32" height="32" viewBox="0 0 24 24" className="text-sage animate-float" style={{ animationDuration: "6s" }}>
              <path
                d="M12 2C12 2 6 8 6 14C6 18 8.5 22 12 22C15.5 22 18 18 18 14C18 8 12 2 12 2Z"
                fill="currentColor"
                fillOpacity="0.3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M12 6V18M12 10L9 13M12 14L15 17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <div className="w-4 h-4 rounded-full bg-sage/60 animate-pulse" />
            <svg width="32" height="32" viewBox="0 0 24 24" className="text-sage animate-float" style={{ animationDuration: "6s", animationDelay: "1s" }}>
              <path
                d="M12 2C12 2 6 8 6 14C6 18 8.5 22 12 22C15.5 22 18 18 18 14C18 8 12 2 12 2Z"
                fill="currentColor"
                fillOpacity="0.3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M12 6V18M12 10L9 13M12 14L15 17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <div className="w-20 h-0.5 bg-gradient-to-l from-transparent via-sage/60 to-sage/40 rounded-full" />
          </div>

          {/* Subtitle text */}
          <p className="text-sm text-muted-foreground tracking-wide">
            Your story, preserved forever
          </p>
        </div>
      </div>

      {/* Side decorative elements - vertical lines - MORE VISIBLE */}
      <div className="absolute left-6 top-1/4 bottom-1/4 w-0.5 bg-gradient-to-b from-transparent via-sage/40 to-transparent hidden lg:block rounded-full" />
      <div className="absolute right-6 top-1/3 bottom-1/3 w-0.5 bg-gradient-to-b from-transparent via-sage/35 to-transparent hidden lg:block rounded-full" />

      {/* Extra side decorations */}
      <div className="absolute left-12 top-[30%] w-3 h-3 rounded-full bg-sage/40 animate-pulse hidden lg:block" style={{ animationDuration: "3s" }} />
      <div className="absolute left-12 top-[50%] w-2 h-2 rounded-full bg-sage/50 animate-pulse hidden lg:block" style={{ animationDuration: "4s", animationDelay: "1s" }} />
      <div className="absolute left-12 top-[70%] w-3 h-3 rounded-full bg-sage/35 animate-pulse hidden lg:block" style={{ animationDuration: "3.5s", animationDelay: "2s" }} />

      <div className="absolute right-12 top-[35%] w-2 h-2 rounded-full bg-sage/45 animate-pulse hidden lg:block" style={{ animationDuration: "4s" }} />
      <div className="absolute right-12 top-[55%] w-3 h-3 rounded-full bg-sage/40 animate-pulse hidden lg:block" style={{ animationDuration: "3s", animationDelay: "1.5s" }} />
      <div className="absolute right-12 top-[75%] w-2 h-2 rounded-full bg-sage/50 animate-pulse hidden lg:block" style={{ animationDuration: "5s", animationDelay: "0.5s" }} />
    </section>
  );
};

export default FeatureSection;

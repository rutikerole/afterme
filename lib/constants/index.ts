import { Folder, Lock, Mic, BookOpen, Heart, Users, Mail, Stethoscope, type LucideIcon } from "lucide-react";

// ════════════════════════════════════════════════════════════════════════════
// PILLAR DEFINITIONS - Central source of truth for all dashboard pillars
// ════════════════════════════════════════════════════════════════════════════

export interface Pillar {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  progress: number;
  items: number;
}

export const PILLARS: Pillar[] = [
  {
    id: "vault",
    name: "Life Vault",
    description: "Secure your important documents, passwords, and secrets for those you love.",
    icon: Folder,
    href: "/dashboard/vault",
    progress: 65,
    items: 24,
  },
  {
    id: "legacy",
    name: "If I'm Gone",
    description: "Leave behind your final words, wishes, and guidance.",
    icon: Lock,
    href: "/dashboard/legacy",
    progress: 40,
    items: 8,
  },
  {
    id: "voice",
    name: "Voice Messages",
    description: "Record your voice so they can hear you say I love you, forever.",
    icon: Mic,
    href: "/dashboard/voice",
    progress: 25,
    items: 5,
  },
  {
    id: "stories",
    name: "Life Stories",
    description: "Write the moments that shaped who you are.",
    icon: BookOpen,
    href: "/dashboard/stories",
    progress: 20,
    items: 3,
  },
  {
    id: "memories",
    name: "Memory Vault",
    description: "Preserve photographs of smiles, tears, and everything between.",
    icon: Heart,
    href: "/dashboard/memories",
    progress: 35,
    items: 156,
  },
  {
    id: "family",
    name: "Trusted Circle",
    description: "The people who will carry your memory forward.",
    icon: Users,
    href: "/dashboard/family",
    progress: 50,
    items: 4,
  },
  {
    id: "messages",
    name: "Future Messages",
    description: "Schedule heartfelt messages for birthdays, milestones, and special moments.",
    icon: Mail,
    href: "/dashboard/messages",
    progress: 15,
    items: 2,
  },
  {
    id: "eldercare",
    name: "Eldercare",
    description: "Medicine reminders, daily check-ins, and wellness tracking for loved ones.",
    icon: Stethoscope,
    href: "/dashboard/eldercare",
    progress: 30,
    items: 6,
  },
];

// ════════════════════════════════════════════════════════════════════════════
// FAMILY MEMBERS - Placeholder data for the trusted circle visualization
// ════════════════════════════════════════════════════════════════════════════

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  image: string;
  rotation: number;
}

export const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: "partner",
    name: "Sarah",
    relation: "Wife",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
    rotation: -5,
  },
  {
    id: "son",
    name: "Arjun",
    relation: "Son",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face",
    rotation: 4,
  },
  {
    id: "daughter",
    name: "Priya",
    relation: "Daughter",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face",
    rotation: -3,
  },
  {
    id: "mother",
    name: "Meera",
    relation: "Mother",
    image: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=300&h=300&fit=crop&crop=face",
    rotation: 5,
  },
  {
    id: "father",
    name: "Rajesh",
    relation: "Father",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    rotation: -4,
  },
];

// ════════════════════════════════════════════════════════════════════════════
// DECORATIVE CONFIGURATIONS
// ════════════════════════════════════════════════════════════════════════════

export interface FloatingDot {
  size: string;
  opacity: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay: number;
}

export const FLOATING_DOTS: FloatingDot[] = [
  { size: "w-2 h-2", opacity: "bg-sage/40", top: "15%", left: "10%", delay: 0 },
  { size: "w-3 h-3", opacity: "bg-sage/30", top: "25%", right: "15%", delay: 1 },
  { size: "w-2 h-2", opacity: "bg-sage/20", bottom: "35%", left: "20%", delay: 2 },
  { size: "w-1.5 h-1.5", opacity: "bg-sage/50", top: "45%", right: "25%", delay: 1.5 },
  { size: "w-2 h-2", opacity: "bg-sage/30", bottom: "20%", right: "10%", delay: 0.5 },
  { size: "w-1 h-1", opacity: "bg-sage/60", top: "60%", left: "5%", delay: 2.5 },
  { size: "w-2.5 h-2.5", opacity: "bg-sage/25", bottom: "45%", right: "30%", delay: 1.8 },
  { size: "w-1.5 h-1.5", opacity: "bg-sage/35", top: "70%", left: "30%", delay: 0.8 },
];

// ════════════════════════════════════════════════════════════════════════════
// MEMORY PROMPTS - Daily writing prompts for the dashboard
// ════════════════════════════════════════════════════════════════════════════

export const MEMORY_PROMPTS = [
  "What's a childhood memory that still makes you smile?",
  "Describe a moment when you felt truly proud of yourself.",
  "What's the best advice you've ever received?",
  "Tell the story of how you met someone important to you.",
  "What tradition would you want your family to continue?",
  "Describe your happiest day.",
  "What lesson took you the longest to learn?",
  "What do you want your loved ones to know about you?",
];

// ════════════════════════════════════════════════════════════════════════════
// INSPIRATIONAL QUOTES
// ════════════════════════════════════════════════════════════════════════════

export const INSPIRATIONAL_QUOTES = [
  "The stories we tell become the legacy we leave.",
  "Every moment preserved is a gift for tomorrow.",
  "Your voice will echo through generations.",
  "Love recorded is love remembered forever.",
  "The greatest inheritance is the wisdom we share.",
];

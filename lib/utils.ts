import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Sun, Moon, CloudSun, type LucideIcon } from "lucide-react"
import type { Pillar } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ════════════════════════════════════════════════════════════════════════════
// GREETING UTILITIES
// ════════════════════════════════════════════════════════════════════════════

export interface Greeting {
  text: string;
  icon: LucideIcon;
}

export function getGreetingByHour(hour?: number): Greeting {
  const currentHour = hour ?? new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return { text: "Good morning", icon: Sun };
  } else if (currentHour >= 12 && currentHour < 17) {
    return { text: "Good afternoon", icon: CloudSun };
  } else if (currentHour >= 17 && currentHour < 21) {
    return { text: "Good evening", icon: CloudSun };
  } else {
    return { text: "Good night", icon: Moon };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PROGRESS UTILITIES
// ════════════════════════════════════════════════════════════════════════════

export function calculateOverallProgress(pillars: Pillar[]): number {
  if (pillars.length === 0) return 0;
  return Math.round(pillars.reduce((sum, p) => sum + p.progress, 0) / pillars.length);
}

export function getCompletedPillars(pillars: Pillar[], threshold = 50): Pillar[] {
  return pillars.filter(p => p.progress >= threshold);
}

export function getNextIncompletePillar(pillars: Pillar[]): Pillar | undefined {
  return [...pillars].sort((a, b) => a.progress - b.progress)[0];
}

// ════════════════════════════════════════════════════════════════════════════
// STRING UTILITIES
// ════════════════════════════════════════════════════════════════════════════

export function getFirstName(fullName: string): string {
  return fullName.split(" ")[0];
}

// ════════════════════════════════════════════════════════════════════════════
// RANDOM UTILITIES
// ════════════════════════════════════════════════════════════════════════════

export function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function getDailyItem<T>(items: T[]): T {
  // Get a consistent item for the day based on the date
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return items[dayOfYear % items.length];
}

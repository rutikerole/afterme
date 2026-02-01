"use client";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  Mic,
  Image,
  BookOpen,
  Users,
  FileText,
  Folder,
  Heart,
  Plus,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
  variant?: "default" | "minimal" | "card";
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
  variant = "default",
}: EmptyStateProps) {
  const content = (
    <>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className={cn(
          "w-20 h-20 rounded-2xl flex items-center justify-center mb-6",
          "bg-gradient-to-br from-sage/20 to-sage-light/30"
        )}
      >
        <Icon className="w-10 h-10 text-sage-dark" />
      </motion.div>

      <motion.h3
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-xl font-serif font-medium text-stone-800 mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-stone-500 text-center max-w-sm mb-6"
      >
        {description}
      </motion.p>

      {(actionLabel && (onAction || actionHref)) && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {actionHref ? (
            <Button asChild className="gap-2">
              <a href={actionHref}>
                <Plus className="w-4 h-4" />
                {actionLabel}
              </a>
            </Button>
          ) : (
            <Button onClick={onAction} className="gap-2">
              <Plus className="w-4 h-4" />
              {actionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </>
  );

  if (variant === "minimal") {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        {content}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        "bg-white/60 backdrop-blur-sm rounded-2xl border border-sage/10 border-dashed",
        className
      )}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 text-center",
      "bg-gradient-to-b from-white/60 to-sage-light/10",
      "rounded-3xl border border-sage/10",
      className
    )}>
      {content}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PRESET EMPTY STATES
// ════════════════════════════════════════════════════════════════════════════

export function EmptyVoiceMessages({ onRecord }: { onRecord?: () => void }) {
  return (
    <EmptyState
      icon={Mic}
      title="No voice messages yet"
      description="Record your first voice message. Your words will be treasured forever by those you love."
      actionLabel="Record a Message"
      onAction={onRecord}
    />
  );
}

export function EmptyMemories({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={Image}
      title="No memories added"
      description="Start preserving your precious moments. Upload photos and add stories to create lasting memories."
      actionLabel="Add Memory"
      onAction={onUpload}
    />
  );
}

export function EmptyStories({ onWrite }: { onWrite?: () => void }) {
  return (
    <EmptyState
      icon={BookOpen}
      title="Your story awaits"
      description="Begin writing your life's journey. Share the moments, lessons, and love that shaped who you are."
      actionLabel="Write Your Story"
      onAction={onWrite}
    />
  );
}

export function EmptyFamilyMembers({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="Build your trusted circle"
      description="Add the people who matter most. They'll be there to carry your legacy forward."
      actionLabel="Add Family Member"
      onAction={onAdd}
    />
  );
}

export function EmptyLegacyInstructions({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No instructions added"
      description="Document your wishes and important instructions for your loved ones."
      actionLabel="Add Instructions"
      onAction={onAdd}
    />
  );
}

export function EmptyVaultItems({ onAdd, category }: { onAdd?: () => void; category?: string }) {
  return (
    <EmptyState
      icon={Folder}
      title={`No ${category || "items"} added`}
      description="Securely store your important information so your loved ones have access when they need it."
      actionLabel={`Add ${category || "Item"}`}
      onAction={onAdd}
    />
  );
}

export function EmptyNominees({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Heart}
      title="No nominees designated"
      description="Add the people who should receive access to your accounts and assets."
      actionLabel="Add Nominee"
      onAction={onAdd}
    />
  );
}

// Small inline empty state for cards
export function EmptyStateInline({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-xl bg-sage/10 flex items-center justify-center mb-3">
        <Sparkles className="w-6 h-6 text-sage" />
      </div>
      <p className="text-sm text-stone-500 mb-3">{message}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="gap-1">
          <Plus className="w-3 h-3" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  User,
  Shield,
  Eye,
  EyeOff,
  FileText,
  Calendar,
  AlertTriangle,
  Sparkles,
  Heart,
} from "lucide-react";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  lifeStatus: string;
}

// Generic vault item that works with any item shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericVaultItem = {
  id: string;
  name: string;
  [key: string]: unknown;
};

interface FamilyMemberSectionProps {
  member: FamilyMember;
  items: GenericVaultItem[];
  isCurrentUser?: boolean;
  renderItem: (item: GenericVaultItem, memberId: string, memberName: string) => React.ReactNode;
}

export function FamilyMemberSection({
  member,
  items,
  isCurrentUser = false,
  renderItem,
}: FamilyMemberSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "alive":
        return "bg-emerald-500";
      case "incapacitated":
        return "bg-amber-500";
      case "deceased":
        return "bg-gray-400";
      default:
        return "bg-sage";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Member Header */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full group"
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="relative p-5 rounded-2xl bg-gradient-to-r from-sage-light/40 via-sage-light/20 to-transparent border border-sage/20 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-sage/40">
          {/* Background decoration */}
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-sage/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          {/* Subtle pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 100 100">
            <pattern id="family-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
            <rect x="0" y="0" width="100" height="100" fill="url(#family-dots)" />
          </svg>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center border-2 border-white shadow-md">
                    <span className="text-lg font-semibold text-white">
                      {getInitials(member.name)}
                    </span>
                  </div>
                )}

                {/* Status indicator */}
                <motion.div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${getStatusColor(member.lifeStatus)} border-2 border-white flex items-center justify-center`}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {member.lifeStatus === "alive" && (
                    <Heart className="w-2.5 h-2.5 text-white fill-white" />
                  )}
                </motion.div>

                {/* Current user badge */}
                {isCurrentUser && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full bg-sage text-white text-[10px] font-semibold shadow-md"
                  >
                    You
                  </motion.div>
                )}
              </div>

              {/* Name and info */}
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-medium text-foreground">
                    {member.name}
                  </h3>
                  {isCurrentUser && (
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  {items.length} {items.length === 1 ? "document" : "documents"}
                </p>
              </div>
            </div>

            {/* Expand/Collapse */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="p-2 rounded-xl bg-white/60 border border-sage/20 group-hover:bg-sage/10 transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-sage-dark" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.button>

      {/* Member's Documents */}
      <AnimatePresence>
        {isExpanded && items.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 pl-8 space-y-3">
              {/* Connection line */}
              <div className="absolute left-9 top-24 bottom-4 w-px bg-gradient-to-b from-sage/30 to-transparent" />

              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  {/* Connection dot */}
                  <div className="absolute -left-[26px] top-6 w-2 h-2 rounded-full bg-sage/50" />

                  {renderItem(item, member.id, member.name)}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {isExpanded && items.length === 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pl-8">
              <div className="p-6 rounded-2xl border border-dashed border-sage/30 bg-sage-light/10 text-center">
                <p className="text-sm text-muted-foreground">
                  No documents added yet
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Export a helper for masking sensitive data
export function maskSensitiveData(value: string | null | undefined, show: boolean): string {
  if (!value) return "••••••••";
  if (show) return value;
  if (value.length <= 4) return "••••";
  return "••••••••" + value.slice(-4);
}

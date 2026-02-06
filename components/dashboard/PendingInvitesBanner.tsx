"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export function PendingInvitesBanner() {
  const { pendingInvitesCount } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if no pending invites or dismissed
  if (pendingInvitesCount === 0 || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-sage-100 to-sage-50 border border-sage-200 rounded-xl p-4 mb-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sage-200 flex items-center justify-center">
              <Users className="w-5 h-5 text-sage-700" />
            </div>
            <div>
              <p className="font-medium text-sage-900">
                {pendingInvitesCount === 1
                  ? "You have a pending invitation!"
                  : `You have ${pendingInvitesCount} pending invitations!`}
              </p>
              <p className="text-sm text-sage-600">
                Someone wants to add you to their Trusted Circle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/family?tab=invites"
              className="inline-flex items-center gap-1 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors text-sm font-medium"
            >
              View Invites
              <ChevronRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 text-sage-400 hover:text-sage-600 transition-colors rounded-lg hover:bg-sage-200"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

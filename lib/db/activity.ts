// ════════════════════════════════════════════════════════════════════════════
// ACTIVITY & AUDIT LOG DATABASE SERVICES
// ════════════════════════════════════════════════════════════════════════════

import { prisma } from "./index";
import type { Activity, AuditLog, Prisma } from "@prisma/client";

// ────────────────────────────────────────────────────────────────────────────
// ACTIVITY TYPES
// ────────────────────────────────────────────────────────────────────────────

export const ActivityType = {
  // Voice
  VOICE_RECORDED: "voice_recorded",
  VOICE_DELETED: "voice_deleted",

  // Memories
  MEMORY_ADDED: "memory_added",
  MEMORY_UPDATED: "memory_updated",
  MEMORY_DELETED: "memory_deleted",
  ALBUM_CREATED: "album_created",

  // Stories
  STORY_CREATED: "story_created",
  STORY_PUBLISHED: "story_published",
  STORY_UPDATED: "story_updated",
  STORY_DELETED: "story_deleted",

  // Vault
  VAULT_ITEM_ADDED: "vault_item_added",
  VAULT_ITEM_UPDATED: "vault_item_updated",
  VAULT_ITEM_DELETED: "vault_item_deleted",

  // Family
  FAMILY_MEMBER_ADDED: "family_member_added",
  FAMILY_MEMBER_UPDATED: "family_member_updated",
  FAMILY_MEMBER_REMOVED: "family_member_removed",

  // Legacy
  LEGACY_INSTRUCTION_ADDED: "legacy_instruction_added",
  LEGACY_INSTRUCTION_UPDATED: "legacy_instruction_updated",

  // Account
  PROFILE_UPDATED: "profile_updated",
  SETTINGS_UPDATED: "settings_updated",
  PASSWORD_CHANGED: "password_changed",
} as const;

export type ActivityTypeValue = typeof ActivityType[keyof typeof ActivityType];

// ────────────────────────────────────────────────────────────────────────────
// ACTIVITY LOGGING
// ────────────────────────────────────────────────────────────────────────────

export type LogActivityInput = {
  userId: string;
  type: ActivityTypeValue;
  description: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Log a user activity
 */
export async function logActivity(input: LogActivityInput): Promise<Activity> {
  return prisma.activity.create({
    data: {
      userId: input.userId,
      type: input.type,
      description: input.description,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata as Prisma.InputJsonValue,
    },
  });
}

/**
 * Get recent activities for a user
 */
export async function getRecentActivities(
  userId: string,
  limit: number = 10
): Promise<Activity[]> {
  return prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get activities for a user with pagination
 */
export async function getUserActivities(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    type?: ActivityTypeValue;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Activity[]> {
  const where: Prisma.ActivityWhereInput = { userId };

  if (options?.type) {
    where.type = options.type;
  }

  if (options?.startDate || options?.endDate) {
    where.createdAt = {};
    if (options.startDate) where.createdAt.gte = options.startDate;
    if (options.endDate) where.createdAt.lte = options.endDate;
  }

  return prisma.activity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 20,
    skip: options?.offset,
  });
}

/**
 * Get activity count by type for a user
 */
export async function getActivityStats(
  userId: string
): Promise<Record<string, number>> {
  const activities = await prisma.activity.groupBy({
    by: ["type"],
    where: { userId },
    _count: { type: true },
  });

  return activities.reduce((acc, curr) => {
    acc[curr.type] = curr._count.type;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Get user's activity streak (consecutive days with activity)
 */
export async function getActivityStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
}> {
  const activities = await prisma.activity.findMany({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (activities.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null };
  }

  // Get unique days with activity
  const uniqueDays = new Set<string>();
  activities.forEach((a) => {
    uniqueDays.add(a.createdAt.toISOString().split("T")[0]);
  });

  const sortedDays = Array.from(uniqueDays).sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (let i = 0; i < sortedDays.length; i++) {
    const day = sortedDays[i];

    if (i === 0) {
      // First day - check if it's today or yesterday
      if (day === today || day === yesterday) {
        currentStreak = 1;
        tempStreak = 1;
      }
      lastDate = new Date(day);
    } else {
      const prevDay = sortedDays[i - 1];
      const prevDate = new Date(prevDay);
      const currDate = new Date(day);
      const diffDays = Math.floor(
        (prevDate.getTime() - currDate.getTime()) / 86400000
      );

      if (diffDays === 1) {
        tempStreak++;
        if (i < sortedDays.length && sortedDays[0] === today || sortedDays[0] === yesterday) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);
  }

  return {
    currentStreak,
    longestStreak,
    lastActivityDate: lastDate,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// AUDIT LOGGING (for sensitive operations)
// ────────────────────────────────────────────────────────────────────────────

export const AuditAction = {
  LOGIN: "login",
  LOGOUT: "logout",
  LOGIN_FAILED: "login_failed",
  PASSWORD_RESET: "password_reset",
  VAULT_ACCESS: "vault_access",
  VAULT_EXPORT: "vault_export",
  DATA_EXPORT: "data_export",
  ACCOUNT_DELETE: "account_delete",
  LEGACY_TRIGGER: "legacy_trigger",
} as const;

export type AuditActionValue = typeof AuditAction[keyof typeof AuditAction];

export type CreateAuditLogInput = {
  userId?: string;
  action: AuditActionValue;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: "success" | "failure";
  details?: Record<string, unknown>;
};

/**
 * Create an audit log entry
 */
export async function createAuditLog(input: CreateAuditLogInput): Promise<AuditLog> {
  return prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      status: input.status ?? "success",
      details: input.details as Prisma.InputJsonValue,
    },
  });
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    action?: AuditActionValue;
  }
): Promise<AuditLog[]> {
  return prisma.auditLog.findMany({
    where: {
      userId,
      action: options?.action,
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
    skip: options?.offset,
  });
}

/**
 * Get failed login attempts for a user (security check)
 */
export async function getRecentFailedLogins(
  userId: string,
  minutes: number = 15
): Promise<number> {
  const since = new Date(Date.now() - minutes * 60 * 1000);

  return prisma.auditLog.count({
    where: {
      userId,
      action: AuditAction.LOGIN_FAILED,
      createdAt: { gte: since },
    },
  });
}

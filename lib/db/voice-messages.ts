// ════════════════════════════════════════════════════════════════════════════
// VOICE MESSAGES DATABASE SERVICES
// ════════════════════════════════════════════════════════════════════════════

import { prisma } from "./index";
import type { VoiceMessage, Prisma } from "@prisma/client";

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export type CreateVoiceMessageInput = {
  userId: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  duration: number;
  mimeType?: string;
  tags?: string[];
  isPrivate?: boolean;
  releaseAfterDeath?: boolean;
};

export type UpdateVoiceMessageInput = Partial<
  Pick<VoiceMessage, "title" | "description" | "tags" | "isPrivate" | "releaseAfterDeath" | "transcript" | "isTranscribed">
>;

export type VoiceMessageFilters = {
  userId: string;
  search?: string;
  tags?: string[];
  isPrivate?: boolean;
  startDate?: Date;
  endDate?: Date;
};

// ────────────────────────────────────────────────────────────────────────────
// CRUD OPERATIONS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Create a new voice message
 */
export async function createVoiceMessage(
  data: CreateVoiceMessageInput
): Promise<VoiceMessage> {
  return prisma.voiceMessage.create({
    data: {
      ...data,
      tags: data.tags ?? [],
    },
  });
}

/**
 * Find voice message by ID
 */
export async function findVoiceMessageById(
  id: string
): Promise<VoiceMessage | null> {
  return prisma.voiceMessage.findUnique({
    where: { id },
  });
}

/**
 * Find voice message by ID with user ownership check
 */
export async function findUserVoiceMessage(
  id: string,
  userId: string
): Promise<VoiceMessage | null> {
  return prisma.voiceMessage.findFirst({
    where: { id, userId },
  });
}

/**
 * Get all voice messages for a user
 */
export async function getUserVoiceMessages(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: "newest" | "oldest" | "longest" | "shortest";
  }
): Promise<VoiceMessage[]> {
  const orderByMap: Record<string, Prisma.VoiceMessageOrderByWithRelationInput> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    longest: { duration: "desc" },
    shortest: { duration: "asc" },
  };

  return prisma.voiceMessage.findMany({
    where: { userId },
    orderBy: orderByMap[options?.orderBy ?? "newest"],
    take: options?.limit,
    skip: options?.offset,
  });
}

/**
 * Search and filter voice messages
 */
export async function searchVoiceMessages(
  filters: VoiceMessageFilters,
  options?: { limit?: number; offset?: number }
): Promise<VoiceMessage[]> {
  const where: Prisma.VoiceMessageWhereInput = {
    userId: filters.userId,
  };

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { transcript: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags };
  }

  if (filters.isPrivate !== undefined) {
    where.isPrivate = filters.isPrivate;
  }

  if (filters.startDate || filters.endDate) {
    where.recordedAt = {};
    if (filters.startDate) where.recordedAt.gte = filters.startDate;
    if (filters.endDate) where.recordedAt.lte = filters.endDate;
  }

  return prisma.voiceMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options?.limit,
    skip: options?.offset,
  });
}

/**
 * Update a voice message
 */
export async function updateVoiceMessage(
  id: string,
  userId: string,
  data: UpdateVoiceMessageInput
): Promise<VoiceMessage | null> {
  try {
    return await prisma.voiceMessage.update({
      where: { id, userId },
      data,
    });
  } catch {
    return null;
  }
}

/**
 * Delete a voice message
 */
export async function deleteVoiceMessage(
  id: string,
  userId: string
): Promise<boolean> {
  try {
    await prisma.voiceMessage.delete({
      where: { id, userId },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get voice message count for a user
 */
export async function getVoiceMessageCount(userId: string): Promise<number> {
  return prisma.voiceMessage.count({
    where: { userId },
  });
}

/**
 * Get total duration of all voice messages for a user (in seconds)
 */
export async function getTotalVoiceDuration(userId: string): Promise<number> {
  const result = await prisma.voiceMessage.aggregate({
    where: { userId },
    _sum: { duration: true },
  });
  return result._sum.duration ?? 0;
}

/**
 * Get all unique tags used by a user
 */
export async function getVoiceMessageTags(userId: string): Promise<string[]> {
  const messages = await prisma.voiceMessage.findMany({
    where: { userId },
    select: { tags: true },
  });

  const allTags = messages.flatMap((m) => m.tags);
  return [...new Set(allTags)].sort();
}

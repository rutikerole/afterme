// ════════════════════════════════════════════════════════════════════════════
// FAMILY MEMBERS DATABASE SERVICES
// ════════════════════════════════════════════════════════════════════════════

import { prisma } from "./index";
import type { FamilyMember } from "@prisma/client";

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export type CreateFamilyMemberInput = {
  userId: string;
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  avatar?: string;
  accessLevel?: "viewer" | "editor" | "executor";
  canAccessVoice?: boolean;
  canAccessMemories?: boolean;
  canAccessStories?: boolean;
  canAccessVault?: boolean;
  canAccessLegacy?: boolean;
  notes?: string;
};

export type UpdateFamilyMemberInput = Partial<
  Omit<CreateFamilyMemberInput, "userId">
> & {
  isInvited?: boolean;
  invitedAt?: Date | null;
  acceptedAt?: Date | null;
};

// ────────────────────────────────────────────────────────────────────────────
// CRUD OPERATIONS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Create a new family member
 */
export async function createFamilyMember(
  data: CreateFamilyMemberInput
): Promise<FamilyMember> {
  return prisma.familyMember.create({
    data: {
      ...data,
      accessLevel: data.accessLevel ?? "viewer",
    },
  });
}

/**
 * Find family member by ID
 */
export async function findFamilyMemberById(
  id: string
): Promise<FamilyMember | null> {
  return prisma.familyMember.findUnique({
    where: { id },
  });
}

/**
 * Find user's family member by ID
 */
export async function findUserFamilyMember(
  id: string,
  userId: string
): Promise<FamilyMember | null> {
  return prisma.familyMember.findFirst({
    where: { id, userId },
  });
}

/**
 * Get all family members for a user
 */
export async function getUserFamilyMembers(
  userId: string,
  options?: {
    relationship?: string;
    accessLevel?: string;
  }
): Promise<FamilyMember[]> {
  return prisma.familyMember.findMany({
    where: {
      userId,
      relationship: options?.relationship,
      accessLevel: options?.accessLevel,
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Search family members by name
 */
export async function searchFamilyMembers(
  userId: string,
  query: string
): Promise<FamilyMember[]> {
  return prisma.familyMember.findMany({
    where: {
      userId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { relationship: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Update a family member
 */
export async function updateFamilyMember(
  id: string,
  userId: string,
  data: UpdateFamilyMemberInput
): Promise<FamilyMember | null> {
  try {
    // First verify ownership
    const member = await prisma.familyMember.findFirst({ where: { id, userId } });
    if (!member) return null;

    return await prisma.familyMember.update({
      where: { id },
      data,
    });
  } catch {
    return null;
  }
}

/**
 * Delete a family member
 */
export async function deleteFamilyMember(
  id: string,
  userId: string
): Promise<boolean> {
  try {
    const member = await prisma.familyMember.findFirst({ where: { id, userId } });
    if (!member) return false;

    await prisma.familyMember.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get family member count
 */
export async function getFamilyMemberCount(userId: string): Promise<number> {
  return prisma.familyMember.count({ where: { userId } });
}

/**
 * Invite a family member (mark as invited)
 */
export async function inviteFamilyMember(
  id: string,
  userId: string
): Promise<FamilyMember | null> {
  const member = await findUserFamilyMember(id, userId);
  if (!member || member.isInvited) return null;

  return prisma.familyMember.update({
    where: { id },
    data: {
      isInvited: true,
      invitedAt: new Date(),
    },
  });
}

/**
 * Accept invitation
 */
export async function acceptInvitation(
  id: string
): Promise<FamilyMember | null> {
  const member = await findFamilyMemberById(id);
  if (!member || !member.isInvited || member.acceptedAt) return null;

  return prisma.familyMember.update({
    where: { id },
    data: {
      acceptedAt: new Date(),
    },
  });
}

/**
 * Get executors (family members with executor access level)
 */
export async function getExecutors(userId: string): Promise<FamilyMember[]> {
  return prisma.familyMember.findMany({
    where: {
      userId,
      accessLevel: "executor",
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Get family members by relationship
 */
export async function getFamilyMembersByRelationship(
  userId: string,
  relationship: string
): Promise<FamilyMember[]> {
  return prisma.familyMember.findMany({
    where: { userId, relationship },
    orderBy: { name: "asc" },
  });
}

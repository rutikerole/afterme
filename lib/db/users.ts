// ════════════════════════════════════════════════════════════════════════════
// USER DATABASE SERVICES
// ════════════════════════════════════════════════════════════════════════════

import { prisma } from "./index";
import type { User, UserSettings, Prisma } from "@prisma/client";

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export type UserWithSettings = User & {
  settings: UserSettings | null;
};

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  name: string;
  avatar?: string;
  phone?: string;
};

export type UpdateUserInput = Partial<
  Pick<User, "name" | "avatar" | "phone" | "bio" | "location" | "timezone" | "dateOfBirth">
>;

// ────────────────────────────────────────────────────────────────────────────
// USER CRUD OPERATIONS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Create a new user with default settings
 */
export async function createUser(data: CreateUserInput): Promise<UserWithSettings> {
  return prisma.user.create({
    data: {
      ...data,
      settings: {
        create: {}, // Creates with default values
      },
    },
    include: {
      settings: true,
    },
  });
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<UserWithSettings | null> {
  return prisma.user.findUnique({
    where: { id },
    include: { settings: true },
  });
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Find user by email with settings
 */
export async function findUserByEmailWithSettings(
  email: string
): Promise<UserWithSettings | null> {
  return prisma.user.findUnique({
    where: { email },
    include: { settings: true },
  });
}

/**
 * Update user profile
 */
export async function updateUser(
  id: string,
  data: UpdateUserInput
): Promise<User> {
  return prisma.user.update({
    where: { id },
    data,
  });
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(id: string): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
}

/**
 * Update user password
 */
export async function updatePassword(
  id: string,
  passwordHash: string
): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
}

/**
 * Verify user email
 */
export async function verifyEmail(id: string): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { emailVerified: true },
  });
}

/**
 * Delete user and all associated data (cascades)
 */
export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({
    where: { id },
  });
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return !!user;
}

// ────────────────────────────────────────────────────────────────────────────
// USER SETTINGS
// ────────────────────────────────────────────────────────────────────────────

export type UpdateSettingsInput = Partial<
  Omit<UserSettings, "id" | "userId" | "createdAt" | "updatedAt">
>;

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  data: UpdateSettingsInput
): Promise<UserSettings> {
  return prisma.userSettings.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

/**
 * Get user settings
 */
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  return prisma.userSettings.findUnique({
    where: { userId },
  });
}

// ────────────────────────────────────────────────────────────────────────────
// USER STATISTICS
// ────────────────────────────────────────────────────────────────────────────

export type UserStats = {
  voiceMessagesCount: number;
  memoriesCount: number;
  storiesCount: number;
  familyMembersCount: number;
  vaultItemsCount: number;
};

/**
 * Get user statistics for dashboard
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const [
    voiceMessagesCount,
    memoriesCount,
    storiesCount,
    familyMembersCount,
    vaultItemsCount,
  ] = await Promise.all([
    prisma.voiceMessage.count({ where: { userId } }),
    prisma.memory.count({ where: { userId } }),
    prisma.story.count({ where: { userId } }),
    prisma.familyMember.count({ where: { userId } }),
    prisma.vaultItem.count({ where: { userId } }),
  ]);

  return {
    voiceMessagesCount,
    memoriesCount,
    storiesCount,
    familyMembersCount,
    vaultItemsCount,
  };
}

/**
 * Get user's legacy progress (percentage completion)
 */
export async function getUserLegacyProgress(userId: string): Promise<{
  overall: number;
  byCategory: Record<string, number>;
}> {
  const stats = await getUserStats(userId);

  // Define targets for each category (can be customized)
  const targets = {
    voice: 10,
    memories: 50,
    stories: 5,
    family: 5,
    vault: 10,
  };

  const categoryProgress = {
    voice: Math.min(100, (stats.voiceMessagesCount / targets.voice) * 100),
    memories: Math.min(100, (stats.memoriesCount / targets.memories) * 100),
    stories: Math.min(100, (stats.storiesCount / targets.stories) * 100),
    family: Math.min(100, (stats.familyMembersCount / targets.family) * 100),
    vault: Math.min(100, (stats.vaultItemsCount / targets.vault) * 100),
  };

  const overall =
    Object.values(categoryProgress).reduce((a, b) => a + b, 0) /
    Object.keys(categoryProgress).length;

  return {
    overall: Math.round(overall),
    byCategory: categoryProgress,
  };
}

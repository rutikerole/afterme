// ════════════════════════════════════════════════════════════════════════════
// SESSION DATABASE SERVICES
// For managing user authentication sessions
// ════════════════════════════════════════════════════════════════════════════

import { prisma } from "./index";
import type { Session, User } from "@prisma/client";
import crypto from "crypto";

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export type SessionWithUser = Session & {
  user: User;
};

export type CreateSessionInput = {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  expiresInDays?: number;
};

// ────────────────────────────────────────────────────────────────────────────
// SESSION OPERATIONS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Generate a secure session token
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a new session for a user
 */
export async function createSession(
  input: CreateSessionInput
): Promise<Session> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays ?? 7));

  return prisma.session.create({
    data: {
      userId: input.userId,
      token,
      expiresAt,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    },
  });
}

/**
 * Find session by token
 */
export async function findSessionByToken(
  token: string
): Promise<SessionWithUser | null> {
  return prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
}

/**
 * Find valid (non-expired) session by token
 */
export async function findValidSession(
  token: string
): Promise<SessionWithUser | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    // Session expired, delete it
    await deleteSession(token);
    return null;
  }

  return session;
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({
    where: { token },
  }).catch(() => {
    // Session might already be deleted
  });
}

/**
 * Delete all sessions for a user (logout everywhere)
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

/**
 * Delete expired sessions (cleanup job)
 */
export async function deleteExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  return result.count;
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  return prisma.session.findMany({
    where: {
      userId,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Extend session expiry
 */
export async function extendSession(
  token: string,
  days: number = 7
): Promise<Session | null> {
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + days);

  try {
    return await prisma.session.update({
      where: { token },
      data: { expiresAt: newExpiresAt },
    });
  } catch {
    return null;
  }
}

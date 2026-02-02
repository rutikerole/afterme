// ════════════════════════════════════════════════════════════════════════════
// PRISMA CLIENT - DATABASE CONNECTION
// Optimized for Vercel serverless environment
// ════════════════════════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

// ════════════════════════════════════════════════════════════════════════════
// DATABASE UTILITIES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Safely disconnect from the database
 */
export async function disconnectDB() {
  await prisma.$disconnect();
}

/**
 * Check database connection health
 */
export async function checkDBHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * Transaction wrapper for complex operations
 */
export async function withTransaction<T>(
  fn: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn);
}

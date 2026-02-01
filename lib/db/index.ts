// ════════════════════════════════════════════════════════════════════════════
// PRISMA CLIENT - DATABASE CONNECTION
// Singleton pattern to prevent multiple instances in development
// ════════════════════════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only initialize if not in build phase
const isBuilding = process.env.NEXT_PHASE === "phase-production-build";

function createPrismaClient(): PrismaClient {
  // During build, return a dummy client that won't connect
  if (isBuilding || !process.env.DATABASE_URL) {
    return new PrismaClient();
  }

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasourceUrl: process.env.DATABASE_URL,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Re-export for convenience
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

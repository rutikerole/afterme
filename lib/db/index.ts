// ════════════════════════════════════════════════════════════════════════════
// PRISMA CLIENT - DATABASE CONNECTION
// Singleton pattern to prevent multiple instances in development
// Prisma 7+ requires adapter for "client" engine type
// ════════════════════════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  // Create a connection pool for PostgreSQL
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Create the pg Pool
  const pool = new Pool({ connectionString });
  globalForPrisma.pool = pool;

  // Create the Prisma adapter
  const adapter = new PrismaPg(pool);

  // Create PrismaClient with the adapter (required in Prisma 7)
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
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
 * Use this in cleanup operations
 */
export async function disconnectDB() {
  await prisma.$disconnect();
  // Also close the connection pool
  if (globalForPrisma.pool) {
    await globalForPrisma.pool.end();
  }
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

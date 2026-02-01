// ════════════════════════════════════════════════════════════════════════════
// PRISMA CLIENT - DATABASE CONNECTION
// Singleton pattern to prevent multiple instances in development
// Lazy initialization to prevent build-time connection attempts
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

// Lazy getter for prisma client - only creates connection when first accessed
function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Export a proxy that lazily initializes the client
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

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
  if (globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect();
  }
  if (globalForPrisma.pool) {
    await globalForPrisma.pool.end();
  }
}

/**
 * Check database connection health
 */
export async function checkDBHealth(): Promise<boolean> {
  try {
    await getPrismaClient().$queryRaw`SELECT 1`;
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
  return getPrismaClient().$transaction(fn);
}

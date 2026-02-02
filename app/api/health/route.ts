import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const checks = {
    database: false,
    databaseUrl: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString(),
    error: null as string | null,
  };

  try {
    // Try to connect to database
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    checks.error = error instanceof Error ? error.message : "Unknown database error";
  }

  return NextResponse.json(checks, {
    status: checks.database ? 200 : 500,
  });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getConnections, getConnectionCount } from "@/lib/db/trusted-circle";

// GET /api/trusted-circle/connections - Get all trusted connections
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [connections, totalCount] = await Promise.all([
      getConnections(user.id),
      getConnectionCount(user.id),
    ]);

    return NextResponse.json({
      connections,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

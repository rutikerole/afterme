import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFullNetwork } from "@/lib/db/trusted-circle";

// GET /api/trusted-circle/network - Get the full family network graph
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const depthParam = searchParams.get("depth");
  const depth = depthParam ? Math.min(Math.max(parseInt(depthParam, 10), 1), 3) : 2;

  try {
    const network = await getFullNetwork(user.id, depth);

    return NextResponse.json({
      network,
      currentUserId: user.id,
      depth,
    });
  } catch (error) {
    console.error("Error fetching network:", error);
    return NextResponse.json(
      { error: "Failed to fetch network" },
      { status: 500 }
    );
  }
}

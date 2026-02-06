import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getSentInvites,
  getReceivedInvites,
  getPendingInvitesCount,
} from "@/lib/db/trusted-circle";

// GET /api/trusted-circle/invites - Get all invites (sent and received)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "all"; // "sent", "received", or "all"
  const status = searchParams.get("status") || undefined;

  try {
    let sent: Awaited<ReturnType<typeof getSentInvites>> = [];
    let received: Awaited<ReturnType<typeof getReceivedInvites>> = [];
    let pendingCount = 0;

    if (type === "sent" || type === "all") {
      sent = await getSentInvites(user.id, status);
    }

    if (type === "received" || type === "all") {
      received = await getReceivedInvites(user.email, type === "all" ? false : true);
      pendingCount = await getPendingInvitesCount(user.email);
    }

    return NextResponse.json({
      sent,
      received,
      pendingCount,
    });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: "Failed to fetch invites" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rejectInvite, getInviteById } from "@/lib/db/trusted-circle";

// POST /api/trusted-circle/invites/[id]/reject - Reject an invite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Verify the invite exists and is for this user
    const invite = await getInviteById(id);

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.inviteeEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "This invite was not sent to you" },
        { status: 403 }
      );
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: `Invite is already ${invite.status}` },
        { status: 400 }
      );
    }

    // Reject the invite
    await rejectInvite(id, user.email);

    return NextResponse.json({
      success: true,
      message: "Invite rejected",
    });
  } catch (error) {
    console.error("Error rejecting invite:", error);
    const message =
      error instanceof Error ? error.message : "Failed to reject invite";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

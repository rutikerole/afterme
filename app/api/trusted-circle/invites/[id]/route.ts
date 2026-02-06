import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cancelInvite, getInviteById } from "@/lib/db/trusted-circle";

// GET /api/trusted-circle/invites/[id] - Get a specific invite
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const invite = await getInviteById(id);

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Only sender or recipient can view the invite
    const isSender = invite.senderId === user.id;
    const isRecipient =
      invite.inviteeEmail.toLowerCase() === user.email.toLowerCase();

    if (!isSender && !isRecipient) {
      return NextResponse.json(
        { error: "Not authorized to view this invite" },
        { status: 403 }
      );
    }

    return NextResponse.json({ invite });
  } catch (error) {
    console.error("Error fetching invite:", error);
    return NextResponse.json(
      { error: "Failed to fetch invite" },
      { status: 500 }
    );
  }
}

// DELETE /api/trusted-circle/invites/[id] - Cancel a sent invite
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Verify the invite exists and was sent by this user
    const invite = await getInviteById(id);

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.senderId !== user.id) {
      return NextResponse.json(
        { error: "You can only cancel invites you sent" },
        { status: 403 }
      );
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: `Cannot cancel an invite that is already ${invite.status}` },
        { status: 400 }
      );
    }

    // Cancel the invite
    const success = await cancelInvite(id, user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to cancel invite" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Invite cancelled",
    });
  } catch (error) {
    console.error("Error cancelling invite:", error);
    return NextResponse.json(
      { error: "Failed to cancel invite" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { acceptInvite, getInviteById } from "@/lib/db/trusted-circle";
import { z } from "zod";

// Validation schema for accepting invites
const acceptInviteSchema = z.object({
  reciprocalRelationship: z.string().min(1, "Relationship is required").max(50),
  grantedPermissions: z
    .object({
      accessLevel: z.enum(["viewer", "editor", "executor"]).optional(),
      canAccessVoice: z.boolean().optional(),
      canAccessMemories: z.boolean().optional(),
      canAccessStories: z.boolean().optional(),
      canAccessVault: z.boolean().optional(),
      canAccessLegacy: z.boolean().optional(),
    })
    .optional(),
});

// POST /api/trusted-circle/invites/[id]/accept - Accept an invite
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
    const body = await request.json();
    const validation = acceptInviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

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

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "Invite has expired" },
        { status: 400 }
      );
    }

    const { reciprocalRelationship, grantedPermissions } = validation.data;

    // Accept the invite and create bidirectional connection
    const connection = await acceptInvite(
      id,
      user.id,
      reciprocalRelationship,
      grantedPermissions
    );

    return NextResponse.json({
      success: true,
      connection,
      message: `You are now connected with ${invite.sender.name}!`,
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    const message =
      error instanceof Error ? error.message : "Failed to accept invite";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

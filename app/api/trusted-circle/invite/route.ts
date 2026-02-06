import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createInvite, checkExistingInvite } from "@/lib/db/trusted-circle";
import { getConnectionBetween } from "@/lib/db/trusted-circle";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for sending invites
const sendInviteSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().min(1, "Name is required").max(100),
  relationship: z.string().min(1, "Relationship is required").max(50),
  accessLevel: z.enum(["viewer", "editor", "executor"]).optional(),
  permissions: z
    .object({
      canAccessVoice: z.boolean().optional(),
      canAccessMemories: z.boolean().optional(),
      canAccessStories: z.boolean().optional(),
      canAccessVault: z.boolean().optional(),
      canAccessLegacy: z.boolean().optional(),
    })
    .optional(),
  message: z.string().max(500).optional(),
});

// POST /api/trusted-circle/invite - Send an invite to join trusted circle
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = sendInviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, name, relationship, accessLevel, permissions, message } =
      validation.data;

    // Cannot invite yourself
    if (email.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Cannot send invite to yourself" },
        { status: 400 }
      );
    }

    // Check if already connected
    const inviteeUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (inviteeUser) {
      const existingConnection = await getConnectionBetween(
        user.id,
        inviteeUser.id
      );
      if (existingConnection) {
        return NextResponse.json(
          { error: "Already connected with this person" },
          { status: 400 }
        );
      }
    }

    // Check for existing pending invite
    const existingInvite = await checkExistingInvite(user.id, email);
    if (existingInvite) {
      return NextResponse.json(
        { error: "Pending invite already exists for this email" },
        { status: 400 }
      );
    }

    // Create the invite
    const invite = await createInvite({
      senderId: user.id,
      inviteeEmail: email,
      inviteeName: name,
      relationshipToSender: relationship,
      proposedAccessLevel: accessLevel,
      proposedPermissions: permissions,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        invite,
        message: inviteeUser
          ? "Invitation sent! They will see it when they log in."
          : "Invitation sent! They will see it when they create an account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending invite:", error);
    return NextResponse.json(
      { error: "Failed to send invite" },
      { status: 500 }
    );
  }
}

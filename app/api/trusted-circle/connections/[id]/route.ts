import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  updateConnectionPermissions,
  removeConnection,
} from "@/lib/db/trusted-circle";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for updating connection permissions
const updatePermissionsSchema = z.object({
  permissions: z.object({
    accessLevel: z.enum(["viewer", "editor", "executor"]).optional(),
    canAccessVoice: z.boolean().optional(),
    canAccessMemories: z.boolean().optional(),
    canAccessStories: z.boolean().optional(),
    canAccessVault: z.boolean().optional(),
    canAccessLegacy: z.boolean().optional(),
  }),
});

// GET /api/trusted-circle/connections/[id] - Get a specific connection
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

    const connection = await prisma.trustedConnection.findUnique({
      where: { id },
      include: {
        userA: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            lifeStatus: true,
          },
        },
        userB: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            lifeStatus: true,
          },
        },
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Verify user is part of this connection
    if (connection.userAId !== user.id && connection.userBId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to view this connection" },
        { status: 403 }
      );
    }

    // Normalize the response
    const iAmUserA = connection.userAId === user.id;

    return NextResponse.json({
      connection: {
        id: connection.id,
        connectedUser: iAmUserA ? connection.userB : connection.userA,
        myRelationshipToThem: iAmUserA
          ? connection.relationshipAToB
          : connection.relationshipBToA,
        theirRelationshipToMe: iAmUserA
          ? connection.relationshipBToA
          : connection.relationshipAToB,
        myPermissionsToThem: iAmUserA
          ? connection.accessAToB
          : connection.accessBToA,
        theirPermissionsToMe: iAmUserA
          ? connection.accessBToA
          : connection.accessAToB,
        connectedAt: connection.connectedAt,
        isActive: connection.isActive,
      },
    });
  } catch (error) {
    console.error("Error fetching connection:", error);
    return NextResponse.json(
      { error: "Failed to fetch connection" },
      { status: 500 }
    );
  }
}

// PATCH /api/trusted-circle/connections/[id] - Update connection permissions
export async function PATCH(
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
    const validation = updatePermissionsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { permissions } = validation.data;

    const connection = await updateConnectionPermissions(
      id,
      user.id,
      permissions
    );

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found or not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Permissions updated",
    });
  } catch (error) {
    console.error("Error updating connection:", error);
    return NextResponse.json(
      { error: "Failed to update connection" },
      { status: 500 }
    );
  }
}

// DELETE /api/trusted-circle/connections/[id] - Remove a connection
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

    const success = await removeConnection(id, user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Connection not found or not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Connection removed",
    });
  } catch (error) {
    console.error("Error removing connection:", error);
    return NextResponse.json(
      { error: "Failed to remove connection" },
      { status: 500 }
    );
  }
}

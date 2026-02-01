import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  findFamilyMemberById,
  updateFamilyMember,
  deleteFamilyMember,
  inviteFamilyMember,
} from "@/lib/db/family-members";
import { z } from "zod";

// Validation schema for updating family members
const updateFamilyMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  relationship: z.string().min(1).max(50).optional(),
  email: z.string().email().optional().or(z.literal("")).or(z.null()),
  phone: z.string().max(20).optional().or(z.null()),
  avatar: z.string().url().optional().or(z.null()),
  accessLevel: z.enum(["viewer", "editor", "executor"]).optional(),
  canAccessVoice: z.boolean().optional(),
  canAccessMemories: z.boolean().optional(),
  canAccessStories: z.boolean().optional(),
  canAccessVault: z.boolean().optional(),
  canAccessLegacy: z.boolean().optional(),
  notes: z.string().max(500).optional().or(z.null()),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/family/[id] - Get a specific family member
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const member = await findFamilyMemberById(id);

    if (!member) {
      return NextResponse.json(
        { error: "Family member not found" },
        { status: 404 }
      );
    }

    // Ensure user owns this family member
    if (member.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error fetching family member:", error);
    return NextResponse.json(
      { error: "Failed to fetch family member" },
      { status: 500 }
    );
  }
}

// PUT /api/family/[id] - Update a family member
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check ownership
    const existing = await findFamilyMemberById(id);

    if (!existing) {
      return NextResponse.json(
        { error: "Family member not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateFamilyMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Clean up empty strings to null/undefined
    const data = Object.fromEntries(
      Object.entries(validation.data).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );

    const updated = await updateFamilyMember(id, user.id, data);

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update family member" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating family member:", error);
    return NextResponse.json(
      { error: "Failed to update family member" },
      { status: 500 }
    );
  }
}

// DELETE /api/family/[id] - Delete a family member
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check ownership
    const existing = await findFamilyMemberById(id);

    if (!existing) {
      return NextResponse.json(
        { error: "Family member not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deleted = await deleteFamilyMember(id, user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete family member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting family member:", error);
    return NextResponse.json(
      { error: "Failed to delete family member" },
      { status: 500 }
    );
  }
}

// PATCH /api/family/[id] - Invite a family member
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    if (body.action === "invite") {
      const updated = await inviteFamilyMember(id, user.id);

      if (!updated) {
        return NextResponse.json(
          { error: "Family member not found or already invited" },
          { status: 404 }
        );
      }

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error patching family member:", error);
    return NextResponse.json(
      { error: "Failed to update family member" },
      { status: 500 }
    );
  }
}

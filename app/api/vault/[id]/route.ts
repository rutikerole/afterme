import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  findVaultItemById,
  updateVaultItem,
  deleteVaultItem,
} from "@/lib/db/vault";
import { z } from "zod";

// Validation schema for updating vault items
const updateVaultItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  category: z.enum(["finance", "identity", "insurance", "subscription", "property", "other"]).optional(),
  encryptedData: z.string().optional().nullable(),
  fileUrl: z.string().url().optional().nullable(),
  fileName: z.string().max(255).optional().nullable(),
  fileSize: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string()).optional(),
  importance: z.enum(["low", "normal", "high", "critical"]).optional(),
  expiryDate: z.string().datetime().optional().nullable(),
  reminderDate: z.string().datetime().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/vault/[id] - Get a specific vault item with details
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const vaultItem = await findVaultItemById(id);

    if (!vaultItem) {
      return NextResponse.json(
        { error: "Vault item not found" },
        { status: 404 }
      );
    }

    // Ensure user owns this vault item
    if (vaultItem.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(vaultItem);
  } catch (error) {
    console.error("Error fetching vault item:", error);
    return NextResponse.json(
      { error: "Failed to fetch vault item" },
      { status: 500 }
    );
  }
}

// PUT /api/vault/[id] - Update a vault item
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check ownership
    const existing = await findVaultItemById(id);

    if (!existing) {
      return NextResponse.json(
        { error: "Vault item not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateVaultItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { expiryDate, reminderDate, ...data } = validation.data;

    const updated = await updateVaultItem(id, user.id, {
      ...data,
      expiryDate: expiryDate ? new Date(expiryDate) : expiryDate === null ? undefined : undefined,
      reminderDate: reminderDate ? new Date(reminderDate) : reminderDate === null ? undefined : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update vault item" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating vault item:", error);
    return NextResponse.json(
      { error: "Failed to update vault item" },
      { status: 500 }
    );
  }
}

// DELETE /api/vault/[id] - Delete a vault item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check ownership
    const existing = await findVaultItemById(id);

    if (!existing) {
      return NextResponse.json(
        { error: "Vault item not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deleted = await deleteVaultItem(id, user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete vault item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vault item:", error);
    return NextResponse.json(
      { error: "Failed to delete vault item" },
      { status: 500 }
    );
  }
}

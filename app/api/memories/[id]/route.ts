import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  findMemoryById,
  updateMemory,
  deleteMemory,
  toggleMemoryFavorite,
} from "@/lib/db/memories";
import { z } from "zod";

// Validation schema for updating memories
const updateMemorySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  dateTaken: z.string().datetime().nullable().optional(),
  location: z.string().max(200).optional(),
  albumId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
  people: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/memories/[id] - Get a specific memory
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const memory = await findMemoryById(id);

    if (!memory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    // Ensure user owns this memory
    if (memory.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(memory);
  } catch (error) {
    console.error("Error fetching memory:", error);
    return NextResponse.json(
      { error: "Failed to fetch memory" },
      { status: 500 }
    );
  }
}

// PUT /api/memories/[id] - Update a memory
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check ownership
    const existing = await findMemoryById(id);

    if (!existing) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateMemorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { dateTaken, ...data } = validation.data;

    const updated = await updateMemory(id, user.id, {
      ...data,
      dateTaken: dateTaken ? new Date(dateTaken) : dateTaken === null ? null : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update memory" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating memory:", error);
    return NextResponse.json(
      { error: "Failed to update memory" },
      { status: 500 }
    );
  }
}

// DELETE /api/memories/[id] - Delete a memory
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check ownership
    const existing = await findMemoryById(id);

    if (!existing) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deleted = await deleteMemory(id, user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete memory" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting memory:", error);
    return NextResponse.json(
      { error: "Failed to delete memory" },
      { status: 500 }
    );
  }
}

// PATCH /api/memories/[id] - Toggle favorite
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    if (body.action === "toggleFavorite") {
      const updated = await toggleMemoryFavorite(id, user.id);

      if (!updated) {
        return NextResponse.json({ error: "Memory not found" }, { status: 404 });
      }

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error patching memory:", error);
    return NextResponse.json(
      { error: "Failed to update memory" },
      { status: 500 }
    );
  }
}

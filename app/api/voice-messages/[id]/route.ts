import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  findVoiceMessageById,
  updateVoiceMessage,
  deleteVoiceMessage,
} from "@/lib/db/voice-messages";
import { z } from "zod";

// Validation schema for updating voice messages
const updateVoiceMessageSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
  releaseAfterDeath: z.boolean().optional(),
  transcript: z.string().optional().nullable(),
  isTranscribed: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/voice-messages/[id] - Get a specific voice message
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const voiceMessage = await findVoiceMessageById(id);

    if (!voiceMessage) {
      return NextResponse.json(
        { error: "Voice message not found" },
        { status: 404 }
      );
    }

    // Ensure user owns this voice message
    if (voiceMessage.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(voiceMessage);
  } catch (error) {
    console.error("Error fetching voice message:", error);
    return NextResponse.json(
      { error: "Failed to fetch voice message" },
      { status: 500 }
    );
  }
}

// PUT /api/voice-messages/[id] - Update a voice message
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check ownership
    const existing = await findVoiceMessageById(id);

    if (!existing) {
      return NextResponse.json(
        { error: "Voice message not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateVoiceMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateVoiceMessage(id, user.id, validation.data);

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update voice message" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating voice message:", error);
    return NextResponse.json(
      { error: "Failed to update voice message" },
      { status: 500 }
    );
  }
}

// DELETE /api/voice-messages/[id] - Delete a voice message
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check ownership
    const existing = await findVoiceMessageById(id);

    if (!existing) {
      return NextResponse.json(
        { error: "Voice message not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deleted = await deleteVoiceMessage(id, user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete voice message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting voice message:", error);
    return NextResponse.json(
      { error: "Failed to delete voice message" },
      { status: 500 }
    );
  }
}

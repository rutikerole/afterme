import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateMessageSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  recipientName: z.string().min(1).optional(),
  recipientEmail: z.string().email().optional(),
  scheduledDate: z.string().transform((str) => new Date(str)).optional(),
  occasion: z.enum(["birthday", "wedding", "graduation", "holiday", "milestone", "other"]).optional(),
  status: z.enum(["scheduled", "draft", "cancelled"]).optional(),
});

// GET - Get a single scheduled message
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const message = await prisma.scheduledMessage.findFirst({
      where: { id, userId: user.id },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}

// PATCH - Update a scheduled message
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateMessageSchema.parse(body);

    const existing = await prisma.scheduledMessage.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Don't allow editing sent messages
    if (existing.status === "sent") {
      return NextResponse.json(
        { error: "Cannot edit a sent message" },
        { status: 400 }
      );
    }

    const message = await prisma.scheduledMessage.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail,
        scheduledDate: data.scheduledDate,
        occasion: data.occasion,
        status: data.status,
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a scheduled message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.scheduledMessage.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    await prisma.scheduledMessage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}

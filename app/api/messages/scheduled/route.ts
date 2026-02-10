import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const scheduledMessageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientEmail: z.string().email("Valid email is required"),
  scheduledDate: z.string().transform((str) => new Date(str)),
  occasion: z.enum(["birthday", "wedding", "graduation", "holiday", "milestone", "other"]),
});

// GET - List all scheduled messages
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { userId: user.id };
    if (status) {
      where.status = status;
    }

    const messages = await prisma.scheduledMessage.findMany({
      where,
      orderBy: { scheduledDate: "asc" },
    });

    // Group by status for statistics
    const stats = {
      scheduled: messages.filter((m) => m.status === "scheduled").length,
      sent: messages.filter((m) => m.status === "sent").length,
      draft: messages.filter((m) => m.status === "draft").length,
    };

    // Find upcoming messages (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcoming = messages.filter(
      (m) =>
        m.status === "scheduled" &&
        new Date(m.scheduledDate) <= thirtyDaysFromNow
    );

    return NextResponse.json({
      messages,
      stats,
      upcoming,
    });
  } catch (error) {
    console.error("Error fetching scheduled messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled messages" },
      { status: 500 }
    );
  }
}

// POST - Create a new scheduled message
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = scheduledMessageSchema.parse(body);

    const message = await prisma.scheduledMessage.create({
      data: {
        userId: user.id,
        title: data.title,
        content: data.content,
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail,
        scheduledDate: data.scheduledDate,
        occasion: data.occasion,
        status: "scheduled",
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "scheduled_message",
        description: `Scheduled message "${data.title}" for ${data.recipientName}`,
        entityType: "ScheduledMessage",
        entityId: message.id,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating scheduled message:", error);
    return NextResponse.json(
      { error: "Failed to create scheduled message" },
      { status: 500 }
    );
  }
}

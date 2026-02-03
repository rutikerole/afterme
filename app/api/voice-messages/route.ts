import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createVoiceMessage,
  getUserVoiceMessages,
  searchVoiceMessages,
  getVoiceMessageCount,
} from "@/lib/db/voice-messages";
import { z } from "zod";

// Custom validator for URLs or base64 data URLs
const urlOrDataUrl = z.string().refine(
  (val) => val.startsWith("data:") || val.startsWith("http://") || val.startsWith("https://"),
  { message: "Must be a valid URL or data URL" }
);

// Validation schema for creating voice messages
const createVoiceMessageSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  fileUrl: urlOrDataUrl,
  fileSize: z.number().int().positive("File size must be positive"),
  duration: z.number().int().nonnegative("Duration must be non-negative"),
  mimeType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
  releaseAfterDeath: z.boolean().optional(),
});

// GET /api/voice-messages - List all voice messages for the current user
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || undefined;
  const orderBy = (searchParams.get("orderBy") as "newest" | "oldest" | "longest" | "shortest") || "newest";

  try {
    // If search query, use search function
    if (search) {
      const messages = await searchVoiceMessages(
        { userId: user.id, search },
        { limit }
      );
      return NextResponse.json({ messages, total: messages.length });
    }

    const [messages, total] = await Promise.all([
      getUserVoiceMessages(user.id, {
        limit,
        offset: (page - 1) * limit,
        orderBy,
      }),
      getVoiceMessageCount(user.id),
    ]);

    return NextResponse.json({
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching voice messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch voice messages" },
      { status: 500 }
    );
  }
}

// POST /api/voice-messages - Create a new voice message
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = createVoiceMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const voiceMessage = await createVoiceMessage({
      ...validation.data,
      userId: user.id,
    });

    return NextResponse.json(voiceMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating voice message:", error);
    return NextResponse.json(
      { error: "Failed to create voice message" },
      { status: 500 }
    );
  }
}

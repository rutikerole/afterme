import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createMemory,
  getUserMemories,
  searchMemories,
  getMemoryCount,
} from "@/lib/db/memories";
import { z } from "zod";

// Validation schema for creating memories
const createMemorySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  mediaUrl: z.string().url("Media URL is required"),
  mediaType: z.enum(["image", "video"]).optional(),
  thumbnailUrl: z.string().url().optional(),
  fileSize: z.number().int().positive().optional(),
  dateTaken: z.string().datetime().optional(),
  location: z.string().max(200).optional(),
  albumId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
  people: z.array(z.string()).optional(),
});

// GET /api/memories - List all memories for the current user
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const albumId = searchParams.get("albumId") || undefined;
  const search = searchParams.get("search") || undefined;
  const orderBy = (searchParams.get("orderBy") as "newest" | "oldest" | "dateTaken") || "newest";
  const isFavorite = searchParams.get("isFavorite") === "true" ? true : undefined;

  try {
    // If search query, use search function
    if (search) {
      const memories = await searchMemories(user.id, search, { limit });
      return NextResponse.json({ memories, total: memories.length });
    }

    const [memories, total] = await Promise.all([
      getUserMemories(user.id, {
        limit,
        offset: (page - 1) * limit,
        albumId,
        orderBy,
        isFavorite,
      }),
      getMemoryCount(user.id),
    ]);

    return NextResponse.json({
      memories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching memories:", error);
    return NextResponse.json(
      { error: "Failed to fetch memories" },
      { status: 500 }
    );
  }
}

// POST /api/memories - Create a new memory
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = createMemorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { dateTaken, ...data } = validation.data;

    const memory = await createMemory({
      ...data,
      userId: user.id,
      dateTaken: dateTaken ? new Date(dateTaken) : undefined,
    });

    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    console.error("Error creating memory:", error);
    return NextResponse.json(
      { error: "Failed to create memory" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createStory,
  getUserStories,
  searchStories,
  getStoryCount,
  StoryCategory,
  StoryStatus,
} from "@/lib/db/stories";
import { z } from "zod";

// Validation schema for creating stories
const createStorySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500).optional(),
  category: z.enum(["life", "wisdom", "memories", "advice", "traditions"]).optional(),
  tags: z.array(z.string()).optional(),
  coverImageUrl: z.string().url().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  isPrivate: z.boolean().optional(),
});

// GET /api/stories - List all stories for the current user
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") as StoryStatus | undefined;
  const category = searchParams.get("category") as StoryCategory | undefined;
  const search = searchParams.get("search") || undefined;
  const orderBy = (searchParams.get("orderBy") as "newest" | "oldest" | "title") || "newest";

  try {
    // If search query, use search function
    if (search) {
      const stories = await searchStories(user.id, search, { limit });
      return NextResponse.json({ stories, total: stories.length });
    }

    const [stories, total] = await Promise.all([
      getUserStories(user.id, {
        status,
        category,
        limit,
        offset: (page - 1) * limit,
        orderBy,
      }),
      getStoryCount(user.id, status),
    ]);

    return NextResponse.json({
      stories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

// POST /api/stories - Create a new story
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = createStorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const story = await createStory({
      ...validation.data,
      userId: user.id,
    });

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}

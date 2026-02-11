import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateStorySummary } from "@/lib/openai";

// POST - Generate AI summary for a story
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the story
    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (story.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Need content to summarize
    if (!story.content || story.content.length < 50) {
      return NextResponse.json(
        { error: "Story content is too short to summarize" },
        { status: 400 }
      );
    }

    // Generate summary using AI
    const summary = await generateStorySummary(story.content, story.title);

    if (!summary) {
      return NextResponse.json(
        { error: "Failed to generate summary. Please check OpenAI API key configuration." },
        { status: 500 }
      );
    }

    // Optionally save the summary to the story
    const { saveSummary } = await request.json().catch(() => ({ saveSummary: false }));

    if (saveSummary) {
      await prisma.story.update({
        where: { id },
        data: {
          excerpt: summary,
        },
      });
    }

    return NextResponse.json({
      summary,
      storyId: story.id,
      storyTitle: story.title,
    });
  } catch (error) {
    console.error("Error generating story summary:", error);
    return NextResponse.json(
      { error: "Failed to generate story summary" },
      { status: 500 }
    );
  }
}

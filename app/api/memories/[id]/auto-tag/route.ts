import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateImageTags } from "@/lib/openai";

// POST - Auto-generate tags for a memory using AI
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

    // Get the memory
    const memory = await prisma.memory.findUnique({
      where: { id },
    });

    if (!memory) {
      return NextResponse.json(
        { error: "Memory not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (memory.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Need an image URL
    if (!memory.mediaUrl) {
      return NextResponse.json(
        { error: "No image found for this memory" },
        { status: 400 }
      );
    }

    // Generate tags using AI
    const generatedTags = await generateImageTags(memory.mediaUrl);

    if (!generatedTags || generatedTags.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate tags. Please check OpenAI API key configuration." },
        { status: 500 }
      );
    }

    // Merge with existing tags (avoid duplicates)
    const existingTags = memory.tags || [];
    const allTags = [...new Set([...existingTags, ...generatedTags])];

    // Update the memory with new tags
    const updatedMemory = await prisma.memory.update({
      where: { id },
      data: {
        tags: allTags,
      },
    });

    return NextResponse.json({
      generatedTags,
      allTags: updatedMemory.tags,
      memory: updatedMemory,
    });
  } catch (error) {
    console.error("Error auto-tagging memory:", error);
    return NextResponse.json(
      { error: "Failed to auto-tag memory" },
      { status: 500 }
    );
  }
}

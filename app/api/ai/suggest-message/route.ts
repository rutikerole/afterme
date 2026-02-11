import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { suggestLegacyMessage } from "@/lib/openai";
import { z } from "zod";

const suggestionSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  occasion: z.string().min(1, "Occasion is required"),
});

// POST - Generate AI suggestion for a legacy message
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = suggestionSchema.parse(body);

    const suggestion = await suggestLegacyMessage(
      data.recipientName,
      data.relationship,
      data.occasion
    );

    if (!suggestion) {
      return NextResponse.json(
        { error: "Failed to generate suggestion. Please check OpenAI API key configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      suggestion,
      metadata: {
        recipient: data.recipientName,
        relationship: data.relationship,
        occasion: data.occasion,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error generating message suggestion:", error);
    return NextResponse.json(
      { error: "Failed to generate message suggestion" },
      { status: 500 }
    );
  }
}

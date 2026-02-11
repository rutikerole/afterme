import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { transcribeAudio } from "@/lib/openai";

// POST - Transcribe a voice message
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

    // Get the voice message
    const voiceMessage = await prisma.voiceMessage.findUnique({
      where: { id },
    });

    if (!voiceMessage) {
      return NextResponse.json(
        { error: "Voice message not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (voiceMessage.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if already transcribed
    if (voiceMessage.transcript) {
      return NextResponse.json({
        transcript: voiceMessage.transcript,
        alreadyTranscribed: true,
      });
    }

    // Get the audio file
    if (!voiceMessage.fileUrl) {
      return NextResponse.json(
        { error: "No audio file found" },
        { status: 400 }
      );
    }

    // Fetch the audio file
    const audioResponse = await fetch(voiceMessage.fileUrl);
    if (!audioResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch audio file" },
        { status: 500 }
      );
    }

    const audioArrayBuffer = await audioResponse.arrayBuffer();

    // Transcribe using OpenAI Whisper
    const result = await transcribeAudio(
      Buffer.from(audioArrayBuffer),
      voiceMessage.fileUrl.split("/").pop() || "audio.webm"
    );

    if (!result) {
      return NextResponse.json(
        { error: "Transcription failed. Please check OpenAI API key configuration." },
        { status: 500 }
      );
    }

    // Update the voice message with transcription
    const updatedMessage = await prisma.voiceMessage.update({
      where: { id },
      data: {
        transcript: result.text,
        isTranscribed: true,
      },
    });

    return NextResponse.json({
      transcript: result.text,
      duration: result.duration,
      voiceMessage: updatedMessage,
    });
  } catch (error) {
    console.error("Error transcribing voice message:", error);
    return NextResponse.json(
      { error: "Failed to transcribe voice message" },
      { status: 500 }
    );
  }
}

// GET - Get transcription status
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

    const voiceMessage = await prisma.voiceMessage.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        transcript: true,
        isTranscribed: true,
      },
    });

    if (!voiceMessage) {
      return NextResponse.json(
        { error: "Voice message not found" },
        { status: 404 }
      );
    }

    if (voiceMessage.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      hasTranscription: voiceMessage.isTranscribed,
      transcript: voiceMessage.transcript,
      isTranscribed: voiceMessage.isTranscribed,
    });
  } catch (error) {
    console.error("Error fetching transcription:", error);
    return NextResponse.json(
      { error: "Failed to fetch transcription status" },
      { status: 500 }
    );
  }
}

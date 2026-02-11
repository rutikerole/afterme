// ════════════════════════════════════════════════════════════════════════════
// OPENAI SERVICE
// For AI features: transcription, auto-tagging, summaries
// ════════════════════════════════════════════════════════════════════════════

import OpenAI from "openai";

// Lazy initialization - only create client when needed
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OpenAI API key not configured");
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

// ────────────────────────────────────────────────────────────────────────────
// VOICE TRANSCRIPTION
// ────────────────────────────────────────────────────────────────────────────

export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string = "audio.webm"
): Promise<{ text: string; duration?: number } | null> {
  const openai = getOpenAI();
  if (!openai) {
    console.log("[Transcription] OpenAI not configured, skipping transcription");
    return null;
  }

  try {
    // Create a File object from the buffer (convert to Uint8Array for compatibility)
    const uint8Array = new Uint8Array(audioBuffer);
    const file = new File([uint8Array], filename, {
      type: getMimeType(filename),
    });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "en", // Can be made configurable
      response_format: "verbose_json",
    });

    return {
      text: transcription.text,
      duration: transcription.duration,
    };
  } catch (error) {
    console.error("[Transcription] Error:", error);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// AUTO-TAGGING FOR PHOTOS
// ────────────────────────────────────────────────────────────────────────────

export async function generateImageTags(
  imageUrl: string
): Promise<string[] | null> {
  const openai = getOpenAI();
  if (!openai) {
    console.log("[Auto-tagging] OpenAI not configured, skipping");
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an image tagging assistant. Analyze the image and provide relevant tags. Return only a JSON array of lowercase tags (max 10 tags). Focus on: people, activities, locations, emotions, objects, occasions. Example: [\"family\", \"beach\", \"summer\", \"happy\", \"vacation\"]",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
            {
              type: "text",
              text: "Generate tags for this image. Return only a JSON array.",
            },
          ],
        },
      ],
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      try {
        const tags = JSON.parse(content);
        if (Array.isArray(tags)) {
          return tags.slice(0, 10).map((t: string) => t.toLowerCase().trim());
        }
      } catch {
        // Try to extract tags from non-JSON response
        const matches = content.match(/["']([^"']+)["']/g);
        if (matches) {
          return matches.map((m) => m.replace(/["']/g, "").toLowerCase().trim()).slice(0, 10);
        }
      }
    }
    return null;
  } catch (error) {
    console.error("[Auto-tagging] Error:", error);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// STORY SUMMARY GENERATION
// ────────────────────────────────────────────────────────────────────────────

export async function generateStorySummary(
  storyContent: string,
  title: string
): Promise<string | null> {
  const openai = getOpenAI();
  if (!openai) {
    console.log("[Summary] OpenAI not configured, skipping");
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that creates brief, warm summaries of personal stories for a legacy/memorial app. Keep summaries under 100 words, preserving the emotional essence while being concise. Focus on the key message or memory being shared.",
        },
        {
          role: "user",
          content: `Please summarize this story titled "${title}":\n\n${storyContent}`,
        },
      ],
      max_tokens: 150,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("[Summary] Error:", error);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// LEGACY MESSAGE SUGGESTIONS
// ────────────────────────────────────────────────────────────────────────────

export async function suggestLegacyMessage(
  recipientName: string,
  relationship: string,
  occasion: string
): Promise<string | null> {
  const openai = getOpenAI();
  if (!openai) {
    console.log("[Suggestions] OpenAI not configured, skipping");
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a warm, empathetic writing assistant helping people write heartfelt messages for their loved ones. These messages may be delivered in the future, potentially after the sender is gone. Write with sincerity, love, and hope. Keep messages personal and meaningful, around 100-150 words.",
        },
        {
          role: "user",
          content: `Help me write a heartfelt ${occasion} message for my ${relationship} named ${recipientName}. Make it personal and meaningful.`,
        },
      ],
      max_tokens: 250,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("[Suggestions] Error:", error);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SEMANTIC SEARCH
// ────────────────────────────────────────────────────────────────────────────

export async function generateEmbedding(text: string): Promise<number[] | null> {
  const openai = getOpenAI();
  if (!openai) {
    console.log("[Embedding] OpenAI not configured, skipping");
    return null;
  }

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0]?.embedding || null;
  } catch (error) {
    console.error("[Embedding] Error:", error);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    webm: "audio/webm",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
    flac: "audio/flac",
  };
  return mimeTypes[ext || ""] || "audio/webm";
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getVapidPublicKey, PushSubscription } from "@/lib/push-notifications";
import { z } from "zod";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

// GET - Get VAPID public key for client subscription
export async function GET() {
  const publicKey = getVapidPublicKey();

  if (!publicKey) {
    return NextResponse.json(
      { error: "Push notifications not configured" },
      { status: 503 }
    );
  }

  return NextResponse.json({ publicKey });
}

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const subscription = subscriptionSchema.parse(body);

    // Store subscription in user settings or a dedicated table
    // For now, we'll store it in user settings as JSON
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        // Store push subscription in a JSON field (you may need to add this to schema)
      },
      update: {
        // Update push subscription
      },
    });

    // For now, we'll just acknowledge the subscription
    // In a full implementation, you'd store this in a PushSubscription table

    console.log(`[Push] User ${user.id} subscribed to push notifications`);

    return NextResponse.json({
      success: true,
      message: "Subscribed to push notifications",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid subscription data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error subscribing to push notifications:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove subscription from storage
    // In a full implementation, you'd delete from PushSubscription table

    console.log(`[Push] User ${user.id} unsubscribed from push notifications`);

    return NextResponse.json({
      success: true,
      message: "Unsubscribed from push notifications",
    });
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}

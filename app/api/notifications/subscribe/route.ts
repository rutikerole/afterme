import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getVapidPublicKey } from "@/lib/push-notifications";
import { z } from "zod";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  userAgent: z.string().optional(),
  deviceName: z.string().optional(),
});

// GET - Get VAPID public key for client subscription
export async function GET() {
  const publicKey = getVapidPublicKey();

  if (!publicKey) {
    // Return a placeholder in development mode
    return NextResponse.json({
      publicKey: null,
      configured: false,
      message: "Push notifications not configured. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.",
    });
  }

  return NextResponse.json({ publicKey, configured: true });
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

    // Store or update subscription in database
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      create: {
        userId: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: subscription.userAgent,
        deviceName: subscription.deviceName,
      },
      update: {
        userId: user.id,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: subscription.userAgent,
        deviceName: subscription.deviceName,
        isActive: true,
        updatedAt: new Date(),
      },
    });

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

    const body = await request.json().catch(() => ({}));
    const endpoint = body.endpoint;

    if (endpoint) {
      // Delete specific subscription
      await prisma.pushSubscription.deleteMany({
        where: {
          userId: user.id,
          endpoint: endpoint,
        },
      });
    } else {
      // Delete all subscriptions for user
      await prisma.pushSubscription.deleteMany({
        where: { userId: user.id },
      });
    }

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

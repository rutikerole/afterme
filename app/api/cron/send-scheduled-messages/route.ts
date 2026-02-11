import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

// Vercel Cron Job - runs daily at 8 AM UTC
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/send-scheduled-messages", "schedule": "0 8 * * *" }] }

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sends this header)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // In production, verify the cron secret
    if (process.env.NODE_ENV === "production" && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const now = new Date();

    // Find all scheduled messages that should be sent
    const messagesToSend = await prisma.scheduledMessage.findMany({
      where: {
        status: "scheduled",
        scheduledDate: {
          lte: now,
        },
      },
    });

    console.log(`[Cron] Found ${messagesToSend.length} messages to send`);

    const results = {
      total: messagesToSend.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const message of messagesToSend) {
      try {
        // Get the user who created the message
        const user = await prisma.user.findUnique({
          where: { id: message.userId },
          select: { name: true, email: true },
        });

        if (!user) {
          results.failed++;
          results.errors.push(`User not found for message ${message.id}`);
          continue;
        }

        // Send the email
        await sendEmail({
          to: message.recipientEmail,
          subject: message.title,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">A Special Message For You</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">From ${user.name}</p>
              </div>

              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="color: #6b7280; margin-bottom: 5px; font-size: 14px;">Dear ${message.recipientName},</p>

                <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <p style="margin: 0; white-space: pre-wrap; font-size: 16px;">${message.content}</p>
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                  This message was scheduled by ${user.name} for this special occasion: <strong>${message.occasion}</strong>
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">

                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                  Sent with love via AfterMe - Preserving memories and connections that matter.
                </p>
              </div>
            </body>
            </html>
          `,
          text: `Dear ${message.recipientName},\n\n${message.content}\n\nThis message was scheduled by ${user.name} for this special occasion: ${message.occasion}\n\nSent with love via AfterMe`,
        });

        // Update message status to sent
        await prisma.scheduledMessage.update({
          where: { id: message.id },
          data: {
            status: "sent",
            sentAt: new Date(),
          },
        });

        // Log activity
        await prisma.activity.create({
          data: {
            userId: message.userId,
            type: "scheduled_message_sent",
            description: `Scheduled message "${message.title}" was sent to ${message.recipientName}`,
            entityType: "ScheduledMessage",
            entityId: message.id,
          },
        });

        results.sent++;
        console.log(`[Cron] Sent message ${message.id} to ${message.recipientEmail}`);
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`Failed to send message ${message.id}: ${errorMsg}`);
        console.error(`[Cron] Failed to send message ${message.id}:`, error);
      }
    }

    console.log(`[Cron] Completed: ${results.sent} sent, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error("[Cron] Error in scheduled messages cron:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}

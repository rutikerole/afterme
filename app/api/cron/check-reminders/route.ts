import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMedicineReminder, sendCheckInReminder } from "@/lib/sms";
import { sendPushNotification, notifications, PushSubscription } from "@/lib/push-notifications";

// Vercel Cron Job - runs every hour
// Checks for medicine reminders and missed check-ins

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (process.env.NODE_ENV === "production" && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, "0") + ":00";

    const results = {
      medicineReminders: { sent: 0, failed: 0 },
      checkInReminders: { sent: 0, failed: 0 },
      missedCheckInAlerts: { sent: 0, failed: 0 },
    };

    // 1. Check medicine reminders for current hour
    console.log(`[Cron] Checking medicine reminders for ${currentHour}`);

    const medicineReminders = await prisma.medicineReminder.findMany({
      where: {
        isActive: true,
        times: {
          has: currentHour,
        },
      },
    });

    for (const reminder of medicineReminders) {
      // Check if already taken today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const alreadyTaken = await prisma.medicineLog.findFirst({
        where: {
          reminderId: reminder.id,
          timeSlot: currentHour,
          date: { gte: today },
          taken: true,
        },
      });

      if (!alreadyTaken) {
        // Get user phone for SMS
        const user = await prisma.user.findFirst({
          where: { id: reminder.userId },
          select: { phone: true, name: true },
        });

        // Send SMS if phone available
        if (user?.phone) {
          const smsResult = await sendMedicineReminder(
            user.phone,
            reminder.name,
            reminder.dosage,
            currentHour
          );
          if (smsResult.success) {
            results.medicineReminders.sent++;
          } else {
            results.medicineReminders.failed++;
          }
        }

        // TODO: Send push notification if subscription exists
        // This would require storing push subscriptions in the database
      }
    }

    // 2. Send daily check-in reminders at 9 AM
    if (currentHour === "09:00") {
      console.log("[Cron] Sending daily check-in reminders");

      // Find users who haven't checked in today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get users with eldercare features (have medicine reminders)
      const usersWithEldercare = await prisma.medicineReminder.findMany({
        where: { isActive: true },
        select: { userId: true },
        distinct: ["userId"],
      });

      for (const { userId } of usersWithEldercare) {
        const todayCheckIn = await prisma.dailyCheckIn.findFirst({
          where: {
            userId,
            date: { gte: today },
          },
        });

        if (!todayCheckIn) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { phone: true, name: true },
          });

          if (user?.phone) {
            const smsResult = await sendCheckInReminder(user.phone, user.name || "there");
            if (smsResult.success) {
              results.checkInReminders.sent++;
            } else {
              results.checkInReminders.failed++;
            }
          }
        }
      }
    }

    // 3. Alert emergency contacts for missed check-ins (at 8 PM if no check-in)
    if (currentHour === "20:00") {
      console.log("[Cron] Checking for missed check-ins");

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usersWithEldercare = await prisma.medicineReminder.findMany({
        where: { isActive: true },
        select: { userId: true },
        distinct: ["userId"],
      });

      for (const { userId } of usersWithEldercare) {
        const todayCheckIn = await prisma.dailyCheckIn.findFirst({
          where: {
            userId,
            date: { gte: today },
          },
        });

        if (!todayCheckIn) {
          // Get emergency contacts
          const emergencyContacts = await prisma.emergencyContact.findMany({
            where: {
              familyMember: {
                userId,
              },
            },
            include: {
              familyMember: true,
            },
            orderBy: {
              priority: "asc",
            },
            take: 3, // Alert top 3 priority contacts
          });

          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
          });

          // Import sendEmergencyAlert
          const { sendEmergencyAlert } = await import("@/lib/sms");

          if (emergencyContacts.length > 0) {
            const contacts = emergencyContacts
              .filter((ec) => ec.familyMember.phone)
              .map((ec) => ({
                name: ec.familyMember.name,
                phone: ec.familyMember.phone!,
              }));

            if (contacts.length > 0) {
              const alertResult = await sendEmergencyAlert(
                userId,
                contacts,
                "check_in_missed",
                `${user?.name || "Your loved one"} has not completed their daily check-in today.`
              );

              results.missedCheckInAlerts.sent += alertResult.sent;
              results.missedCheckInAlerts.failed += alertResult.failed;
            }
          }

          // Log activity
          await prisma.activity.create({
            data: {
              userId,
              type: "check_in_missed",
              description: `Daily check-in was missed. Emergency contacts notified.`,
            },
          });
        }
      }
    }

    console.log("[Cron] Reminder check completed:", results);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      hour: currentHour,
      results,
    });
  } catch (error) {
    console.error("[Cron] Error in reminders cron:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}

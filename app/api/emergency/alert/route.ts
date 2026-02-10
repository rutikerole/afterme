import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendEmergencyAlert } from "@/lib/sms";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const alertSchema = z.object({
  alertType: z.enum(["medical", "safety", "check_in_missed", "custom"]),
  customMessage: z.string().optional(),
  contactIds: z.array(z.string()).optional(), // Specific contacts, or all if not provided
});

// POST - Send emergency alert to contacts
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = alertSchema.parse(body);

    // Get emergency contacts
    let emergencyContacts = await prisma.emergencyContact.findMany({
      where: {
        familyMember: {
          userId: user.id,
        },
        ...(data.contactIds ? { id: { in: data.contactIds } } : {}),
      },
      include: {
        familyMember: true,
      },
      orderBy: {
        priority: "asc",
      },
    });

    if (emergencyContacts.length === 0) {
      return NextResponse.json(
        { error: "No emergency contacts found" },
        { status: 400 }
      );
    }

    const results = {
      sms: { sent: 0, failed: 0, errors: [] as string[] },
      email: { sent: 0, failed: 0, errors: [] as string[] },
    };

    // Send SMS alerts
    const smsContacts = emergencyContacts
      .filter((ec) => ec.familyMember.phone)
      .map((ec) => ({
        name: ec.familyMember.name,
        phone: ec.familyMember.phone!,
      }));

    if (smsContacts.length > 0) {
      const smsResult = await sendEmergencyAlert(
        user.id,
        smsContacts,
        data.alertType,
        data.customMessage
      );
      results.sms.sent = smsResult.sent;
      results.sms.failed = smsResult.failed;
      results.sms.errors = smsResult.errors;
    }

    // Send email alerts
    const emailContacts = emergencyContacts.filter((ec) => ec.familyMember.email);

    for (const contact of emailContacts) {
      try {
        let alertTitle: string;
        let alertMessage: string;

        switch (data.alertType) {
          case "medical":
            alertTitle = "URGENT: Medical Emergency";
            alertMessage = `A medical emergency has been reported for ${user.name}. Please check on them immediately or call emergency services.`;
            break;
          case "safety":
            alertTitle = "Safety Alert";
            alertMessage = `A safety concern has been raised for ${user.name}. Please verify their wellbeing.`;
            break;
          case "check_in_missed":
            alertTitle = "Missed Check-in Notice";
            alertMessage = `${user.name} has missed their daily check-in. Please reach out to make sure they are okay.`;
            break;
          case "custom":
            alertTitle = "Important Alert";
            alertMessage = data.customMessage || `An important alert has been triggered by ${user.name}.`;
            break;
        }

        await sendEmail({
          to: contact.familyMember.email!,
          subject: `[AfterMe] ${alertTitle}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: ${data.alertType === "medical" ? "#dc2626" : "#f59e0b"}; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">${alertTitle}</h1>
              </div>
              <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
                <p>Dear ${contact.familyMember.name},</p>
                <p style="font-size: 18px;">${alertMessage}</p>

                <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid ${data.alertType === "medical" ? "#dc2626" : "#f59e0b"};">
                  <p style="margin: 0;"><strong>Contact Information:</strong></p>
                  <p style="margin: 5px 0;">Name: ${user.name}</p>
                  ${user.phone ? `<p style="margin: 5px 0;">Phone: <a href="tel:${user.phone}">${user.phone}</a></p>` : ""}
                </div>

                ${contact.instructions ? `
                <div style="margin: 20px 0; padding: 15px; background: #fef3c7; border-radius: 6px;">
                  <p style="margin: 0;"><strong>Special Instructions:</strong></p>
                  <p style="margin: 5px 0;">${contact.instructions}</p>
                </div>
                ` : ""}

                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  This alert was sent via AfterMe Emergency System.<br>
                  Time: ${new Date().toLocaleString()}
                </p>
              </div>
            </body>
            </html>
          `,
          text: `${alertTitle}\n\n${alertMessage}\n\nContact: ${user.name}${user.phone ? ` - ${user.phone}` : ""}\n\nTime: ${new Date().toLocaleString()}`,
        });

        results.email.sent++;
      } catch (error) {
        results.email.failed++;
        results.email.errors.push(
          `Failed to email ${contact.familyMember.name}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "emergency_alert_sent",
        description: `Emergency alert (${data.alertType}) sent to ${results.sms.sent + results.email.sent} contacts`,
        metadata: {
          alertType: data.alertType,
          smsResults: results.sms,
          emailResults: results.email,
        },
      },
    });

    return NextResponse.json({
      success: true,
      results,
      totalNotified: results.sms.sent + results.email.sent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error sending emergency alert:", error);
    return NextResponse.json(
      { error: "Failed to send emergency alert" },
      { status: 500 }
    );
  }
}

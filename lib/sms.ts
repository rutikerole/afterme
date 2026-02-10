import twilio from "twilio";

// Lazy initialization for Twilio client
let twilioClient: twilio.Twilio | null = null;

function getTwilioClient(): twilio.Twilio | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn("[SMS] Twilio not configured - SMS will be logged to console");
    return null;
  }

  if (!twilioClient) {
    twilioClient = twilio(accountSid, authToken);
  }

  return twilioClient;
}

interface SendSMSOptions {
  to: string;
  message: string;
}

// Send SMS message
export async function sendSMS({ to, message }: SendSMSOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  // If Twilio not configured, log to console
  if (!client || !fromNumber) {
    console.log("═══════════════════════════════════════════");
    console.log("📱 SMS (Development Mode - Not Sent)");
    console.log("═══════════════════════════════════════════");
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log("═══════════════════════════════════════════\n");

    return { success: true, messageId: "dev-mode" };
  }

  try {
    // Format phone number if needed
    const formattedTo = to.startsWith("+") ? to : `+${to}`;

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedTo,
    });

    console.log(`[SMS] Message sent to ${to}: ${result.sid}`);

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error) {
    console.error("[SMS] Failed to send message:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Send emergency alert to all emergency contacts
export async function sendEmergencyAlert(
  userId: string,
  emergencyContacts: Array<{ name: string; phone: string }>,
  alertType: "medical" | "safety" | "check_in_missed" | "custom",
  customMessage?: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Build message based on alert type
  let message: string;
  switch (alertType) {
    case "medical":
      message = "URGENT: A medical emergency has been reported. Please check on your loved one immediately or call emergency services.";
      break;
    case "safety":
      message = "ALERT: A safety concern has been raised. Please verify the wellbeing of your loved one.";
      break;
    case "check_in_missed":
      message = "NOTICE: Your loved one has missed their daily check-in. Please reach out to make sure they are okay.";
      break;
    case "custom":
      message = customMessage || "An important alert has been triggered. Please check in.";
      break;
  }

  message += "\n\n- AfterMe Emergency System";

  for (const contact of emergencyContacts) {
    if (!contact.phone) {
      results.errors.push(`No phone number for ${contact.name}`);
      results.failed++;
      continue;
    }

    const result = await sendSMS({
      to: contact.phone,
      message: `Hi ${contact.name}, ${message}`,
    });

    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push(`Failed to send to ${contact.name}: ${result.error}`);
    }
  }

  return results;
}

// Send medicine reminder
export async function sendMedicineReminder(
  phone: string,
  medicineName: string,
  dosage: string,
  time: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Reminder: It's time to take your ${medicineName} (${dosage}). Scheduled for ${time}.\n\n- AfterMe Medicine Reminder`;

  const result = await sendSMS({ to: phone, message });
  return { success: result.success, error: result.error };
}

// Send daily check-in reminder
export async function sendCheckInReminder(
  phone: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Hi ${userName}, don't forget to complete your daily check-in today! Your loved ones care about your wellbeing.\n\n- AfterMe`;

  const result = await sendSMS({ to: phone, message });
  return { success: result.success, error: result.error };
}

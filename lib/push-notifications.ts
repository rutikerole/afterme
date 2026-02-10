import webpush from "web-push";

// Initialize web-push with VAPID keys
let isInitialized = false;

function initializeWebPush() {
  if (isInitialized) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@afterme.app";

  if (!publicKey || !privateKey) {
    console.warn("[Push] VAPID keys not configured - push notifications disabled");
    return false;
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    isInitialized = true;
    return true;
  } catch (error) {
    console.error("[Push] Failed to initialize web-push:", error);
    return false;
  }
}

// Push subscription type (stored in database)
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Notification payload
interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// Send push notification to a single subscription
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  if (!initializeWebPush()) {
    console.log("═══════════════════════════════════════════");
    console.log("🔔 Push Notification (Development Mode)");
    console.log("═══════════════════════════════════════════");
    console.log(`Title: ${payload.title}`);
    console.log(`Body: ${payload.body}`);
    console.log(`Data:`, payload.data);
    console.log("═══════════════════════════════════════════\n");
    return { success: true };
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify({
        ...payload,
        icon: payload.icon || "/icons/icon-192x192.png",
        badge: payload.badge || "/icons/badge-72x72.png",
      })
    );

    return { success: true };
  } catch (error: any) {
    // Handle expired subscriptions
    if (error.statusCode === 410 || error.statusCode === 404) {
      return { success: false, error: "Subscription expired or invalid" };
    }

    console.error("[Push] Failed to send notification:", error);
    return { success: false, error: error.message };
  }
}

// Send notification to multiple subscriptions
export async function sendPushToMultiple(
  subscriptions: PushSubscription[],
  payload: NotificationPayload
): Promise<{ sent: number; failed: number; expiredEndpoints: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    expiredEndpoints: [] as string[],
  };

  const promises = subscriptions.map(async (sub) => {
    const result = await sendPushNotification(sub, payload);

    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      if (result.error === "Subscription expired or invalid") {
        results.expiredEndpoints.push(sub.endpoint);
      }
    }
  });

  await Promise.all(promises);
  return results;
}

// Pre-built notification templates
export const notifications = {
  // Medicine reminder
  medicineReminder: (medicineName: string, dosage: string): NotificationPayload => ({
    title: "Medicine Reminder",
    body: `Time to take ${medicineName} (${dosage})`,
    tag: "medicine-reminder",
    data: { type: "medicine_reminder" },
    actions: [
      { action: "taken", title: "Mark as Taken" },
      { action: "snooze", title: "Snooze 10min" },
    ],
  }),

  // Daily check-in reminder
  checkInReminder: (): NotificationPayload => ({
    title: "Daily Check-in",
    body: "How are you feeling today? Complete your daily check-in.",
    tag: "check-in-reminder",
    data: { type: "check_in_reminder", url: "/dashboard/eldercare" },
    actions: [{ action: "check-in", title: "Check In Now" }],
  }),

  // Missed check-in alert (to family)
  missedCheckIn: (userName: string): NotificationPayload => ({
    title: "Missed Check-in Alert",
    body: `${userName} hasn't completed their daily check-in. Consider reaching out.`,
    tag: "missed-check-in",
    data: { type: "missed_check_in_alert" },
    actions: [{ action: "call", title: "Call Now" }],
  }),

  // New message received
  newMessage: (senderName: string): NotificationPayload => ({
    title: "New Message",
    body: `You received a special message from ${senderName}`,
    tag: "new-message",
    data: { type: "new_message", url: "/dashboard/messages" },
  }),

  // Legacy access request
  legacyAccessRequest: (requesterName: string): NotificationPayload => ({
    title: "Legacy Access Request",
    body: `${requesterName} has requested access to legacy content`,
    tag: "legacy-access",
    data: { type: "legacy_access_request", url: "/dashboard/legacy" },
    actions: [
      { action: "review", title: "Review Request" },
    ],
  }),

  // Subscription expiring
  subscriptionExpiring: (serviceName: string, daysLeft: number): NotificationPayload => ({
    title: "Subscription Expiring",
    body: `Your ${serviceName} subscription expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
    tag: "subscription-expiring",
    data: { type: "subscription_expiring", url: "/dashboard/vault/subscriptions" },
  }),

  // Document expiring
  documentExpiring: (documentName: string, daysLeft: number): NotificationPayload => ({
    title: "Document Expiring",
    body: `Your ${documentName} expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
    tag: "document-expiring",
    data: { type: "document_expiring", url: "/dashboard/vault/identity" },
  }),

  // Generic notification
  generic: (title: string, body: string, url?: string): NotificationPayload => ({
    title,
    body,
    data: { type: "generic", url },
  }),
};

// Get VAPID public key for client subscription
export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY || null;
}

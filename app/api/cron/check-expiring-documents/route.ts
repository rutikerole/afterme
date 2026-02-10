import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

// Vercel Cron Job - runs daily at 9 AM
// Checks for expiring documents, subscriptions, and insurance policies

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
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const results = {
      documents: { notified: 0 },
      subscriptions: { notified: 0 },
      insurance: { notified: 0 },
    };

    // 1. Check identity documents expiring in 30 days
    console.log("[Cron] Checking expiring identity documents");

    const expiringDocs = await prisma.identityDocument.findMany({
      where: {
        expiryDate: {
          gte: now,
          lte: in30Days,
        },
      },
      include: {
        vaultItem: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });

    for (const doc of expiringDocs) {
      const daysUntilExpiry = Math.ceil(
        (doc.expiryDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only notify at 30, 14, 7, 3, 1 days
      if ([30, 14, 7, 3, 1].includes(daysUntilExpiry)) {
        await sendEmail({
          to: doc.vaultItem.user.email,
          subject: `Document Expiring: ${doc.vaultItem.name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Document Expiration Notice</h2>
              <p>Hi ${doc.vaultItem.user.name},</p>
              <p>Your <strong>${doc.vaultItem.name}</strong> (${doc.type}) will expire in <strong>${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}</strong>.</p>
              <p>Expiry Date: ${doc.expiryDate?.toLocaleDateString()}</p>
              <p>Please take action to renew this document before it expires.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/vault/identity"
                 style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
                View in Vault
              </a>
              <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">- AfterMe</p>
            </div>
          `,
          text: `Hi ${doc.vaultItem.user.name}, Your ${doc.vaultItem.name} (${doc.type}) will expire in ${daysUntilExpiry} days. Expiry Date: ${doc.expiryDate?.toLocaleDateString()}. Please renew before it expires.`,
        });

        results.documents.notified++;
      }
    }

    // 2. Check subscriptions with upcoming billing in 7 days
    console.log("[Cron] Checking upcoming subscription renewals");

    const upcomingSubscriptions = await prisma.subscription.findMany({
      where: {
        nextBillingDate: {
          gte: now,
          lte: in7Days,
        },
        isAutoRenew: true,
      },
      include: {
        vaultItem: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });

    for (const sub of upcomingSubscriptions) {
      const daysUntilBilling = Math.ceil(
        (sub.nextBillingDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only notify at 7 and 1 days
      if ([7, 1].includes(daysUntilBilling)) {
        await sendEmail({
          to: sub.vaultItem.user.email,
          subject: `Subscription Renewal: ${sub.serviceName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">Subscription Renewal Notice</h2>
              <p>Hi ${sub.vaultItem.user.name},</p>
              <p>Your <strong>${sub.serviceName}</strong> subscription will auto-renew in <strong>${daysUntilBilling} day${daysUntilBilling !== 1 ? "s" : ""}</strong>.</p>
              <p>Amount: ${sub.currency} ${sub.amount}</p>
              <p>Next Billing Date: ${sub.nextBillingDate?.toLocaleDateString()}</p>
              ${sub.cancellationUrl ? `<p><a href="${sub.cancellationUrl}">Cancel Subscription</a></p>` : ""}
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/vault/subscriptions"
                 style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
                Manage Subscriptions
              </a>
              <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">- AfterMe</p>
            </div>
          `,
          text: `Hi ${sub.vaultItem.user.name}, Your ${sub.serviceName} subscription will auto-renew in ${daysUntilBilling} days. Amount: ${sub.currency} ${sub.amount}. Next Billing: ${sub.nextBillingDate?.toLocaleDateString()}.`,
        });

        results.subscriptions.notified++;
      }
    }

    // 3. Check insurance policies expiring in 30 days
    console.log("[Cron] Checking expiring insurance policies");

    const expiringInsurance = await prisma.insurancePolicy.findMany({
      where: {
        endDate: {
          gte: now,
          lte: in30Days,
        },
      },
      include: {
        vaultItem: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });

    for (const policy of expiringInsurance) {
      const daysUntilExpiry = Math.ceil(
        (policy.endDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only notify at 30, 14, 7 days
      if ([30, 14, 7].includes(daysUntilExpiry)) {
        await sendEmail({
          to: policy.vaultItem.user.email,
          subject: `Insurance Policy Expiring: ${policy.provider}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Insurance Policy Expiration</h2>
              <p>Hi ${policy.vaultItem.user.name},</p>
              <p>Your <strong>${policy.type}</strong> insurance policy with <strong>${policy.provider}</strong> will expire in <strong>${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}</strong>.</p>
              <p>Policy Number: ${policy.policyNumber || "N/A"}</p>
              <p>Expiry Date: ${policy.endDate?.toLocaleDateString()}</p>
              ${policy.agentPhone ? `<p>Agent Contact: ${policy.agentPhone}</p>` : ""}
              <p>Please contact your insurance provider to renew your policy.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/vault/insurance"
                 style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
                View Policy Details
              </a>
              <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">- AfterMe</p>
            </div>
          `,
          text: `Hi ${policy.vaultItem.user.name}, Your ${policy.type} insurance with ${policy.provider} expires in ${daysUntilExpiry} days. Please renew before ${policy.endDate?.toLocaleDateString()}.`,
        });

        results.insurance.notified++;
      }
    }

    console.log("[Cron] Expiring documents check completed:", results);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error("[Cron] Error in expiring documents cron:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}

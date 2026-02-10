import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const subscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  serviceName: z.string().min(1, "Service name is required"),
  category: z.enum(["streaming", "software", "membership", "utility", "other"]),
  amount: z.number().positive().optional(),
  currency: z.string().default("USD"),
  billingCycle: z.enum(["monthly", "quarterly", "annually"]).optional(),
  nextBillingDate: z.string().transform((str) => new Date(str)).optional(),
  accountEmail: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  cancellationUrl: z.string().url().optional().nullable(),
  cancellationInstructions: z.string().optional().nullable(),
  isAutoRenew: z.boolean().default(true),
  notes: z.string().optional(),
});

// GET - List all subscriptions
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vaultItems = await prisma.vaultItem.findMany({
      where: {
        userId: user.id,
        category: "subscription",
        isArchived: false,
      },
      include: {
        subscription: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const subscriptions = vaultItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      serviceName: item.subscription?.serviceName,
      category: item.subscription?.category,
      amount: item.subscription?.amount ? Number(item.subscription.amount) : null,
      currency: item.subscription?.currency,
      billingCycle: item.subscription?.billingCycle,
      nextBillingDate: item.subscription?.nextBillingDate,
      accountEmail: item.subscription?.accountEmail,
      website: item.subscription?.website,
      cancellationUrl: item.subscription?.cancellationUrl,
      cancellationInstructions: item.subscription?.cancellationInstructions,
      isAutoRenew: item.subscription?.isAutoRenew,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    // Calculate monthly spend
    const monthlySpend = subscriptions.reduce((total, sub) => {
      if (!sub.amount) return total;
      switch (sub.billingCycle) {
        case "annually":
          return total + sub.amount / 12;
        case "quarterly":
          return total + sub.amount / 3;
        default:
          return total + sub.amount;
      }
    }, 0);

    return NextResponse.json({
      subscriptions,
      stats: {
        total: subscriptions.length,
        monthlySpend: Math.round(monthlySpend * 100) / 100,
        byCategory: {
          streaming: subscriptions.filter((s) => s.category === "streaming").length,
          software: subscriptions.filter((s) => s.category === "software").length,
          membership: subscriptions.filter((s) => s.category === "membership").length,
          utility: subscriptions.filter((s) => s.category === "utility").length,
          other: subscriptions.filter((s) => s.category === "other").length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// POST - Create a new subscription
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = subscriptionSchema.parse(body);

    // Create vault item with subscription
    const vaultItem = await prisma.vaultItem.create({
      data: {
        userId: user.id,
        name: data.name,
        description: data.notes || null,
        category: "subscription",
        subscription: {
          create: {
            serviceName: data.serviceName,
            category: data.category,
            amount: data.amount,
            currency: data.currency,
            billingCycle: data.billingCycle,
            nextBillingDate: data.nextBillingDate,
            accountEmail: data.accountEmail,
            website: data.website,
            cancellationUrl: data.cancellationUrl,
            cancellationInstructions: data.cancellationInstructions,
            isAutoRenew: data.isAutoRenew,
          },
        },
      },
      include: {
        subscription: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "vault_item_added",
        description: `Added subscription: ${data.serviceName}`,
        entityType: "VaultItem",
        entityId: vaultItem.id,
      },
    });

    return NextResponse.json(
      {
        subscription: {
          id: vaultItem.id,
          name: vaultItem.name,
          serviceName: vaultItem.subscription?.serviceName,
          category: vaultItem.subscription?.category,
          amount: vaultItem.subscription?.amount ? Number(vaultItem.subscription.amount) : null,
          currency: vaultItem.subscription?.currency,
          billingCycle: vaultItem.subscription?.billingCycle,
          nextBillingDate: vaultItem.subscription?.nextBillingDate,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

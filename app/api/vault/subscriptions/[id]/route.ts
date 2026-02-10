import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateSubscriptionSchema = z.object({
  name: z.string().min(1).optional(),
  serviceName: z.string().min(1).optional(),
  category: z.enum(["streaming", "software", "membership", "utility", "other"]).optional(),
  amount: z.number().positive().optional().nullable(),
  currency: z.string().optional(),
  billingCycle: z.enum(["monthly", "quarterly", "annually"]).optional().nullable(),
  nextBillingDate: z.string().transform((str) => new Date(str)).optional().nullable(),
  accountEmail: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  cancellationUrl: z.string().url().optional().nullable(),
  cancellationInstructions: z.string().optional().nullable(),
  isAutoRenew: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

// GET - Get a single subscription
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const vaultItem = await prisma.vaultItem.findFirst({
      where: {
        id,
        userId: user.id,
        category: "subscription",
      },
      include: {
        subscription: true,
      },
    });

    if (!vaultItem) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    return NextResponse.json({
      subscription: {
        id: vaultItem.id,
        name: vaultItem.name,
        description: vaultItem.description,
        serviceName: vaultItem.subscription?.serviceName,
        category: vaultItem.subscription?.category,
        amount: vaultItem.subscription?.amount ? Number(vaultItem.subscription.amount) : null,
        currency: vaultItem.subscription?.currency,
        billingCycle: vaultItem.subscription?.billingCycle,
        nextBillingDate: vaultItem.subscription?.nextBillingDate,
        accountEmail: vaultItem.subscription?.accountEmail,
        website: vaultItem.subscription?.website,
        cancellationUrl: vaultItem.subscription?.cancellationUrl,
        cancellationInstructions: vaultItem.subscription?.cancellationInstructions,
        isAutoRenew: vaultItem.subscription?.isAutoRenew,
        createdAt: vaultItem.createdAt,
        updatedAt: vaultItem.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// PATCH - Update a subscription
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateSubscriptionSchema.parse(body);

    const existing = await prisma.vaultItem.findFirst({
      where: {
        id,
        userId: user.id,
        category: "subscription",
      },
      include: {
        subscription: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Update vault item and subscription
    const vaultItem = await prisma.vaultItem.update({
      where: { id },
      data: {
        name: data.name,
        description: data.notes,
        subscription: {
          update: {
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

    return NextResponse.json({
      subscription: {
        id: vaultItem.id,
        name: vaultItem.name,
        serviceName: vaultItem.subscription?.serviceName,
        category: vaultItem.subscription?.category,
        amount: vaultItem.subscription?.amount ? Number(vaultItem.subscription.amount) : null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a subscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.vaultItem.findFirst({
      where: {
        id,
        userId: user.id,
        category: "subscription",
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Delete vault item (cascade deletes subscription)
    await prisma.vaultItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}

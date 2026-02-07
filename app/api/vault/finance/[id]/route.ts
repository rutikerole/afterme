import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { encrypt, decrypt, maskString } from "@/lib/encryption";
import { z } from "zod";

const updateFinanceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["bank_account", "credit_card", "investment", "loan", "crypto", "other"]).optional(),
  institutionName: z.string().min(1).optional(),
  accountNumber: z.string().optional(),
  balance: z.number().optional(),
  currency: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  importance: z.enum(["low", "normal", "high", "critical"]).optional(),
  notes: z.string().optional(),
});

// GET - Get a single finance item
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

    const item = await prisma.vaultItem.findFirst({
      where: {
        id,
        userId: user.id,
        category: "finance",
      },
      include: {
        financeItem: {
          include: {
            nominees: {
              include: {
                familyMember: {
                  select: {
                    id: true,
                    name: true,
                    relationship: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Decrypt sensitive data
    let decryptedData: Record<string, unknown> = {};
    if (item.encryptedData) {
      try {
        decryptedData = JSON.parse(decrypt(item.encryptedData));
      } catch {
        console.error("Failed to decrypt finance item:", item.id);
      }
    }

    // Update last accessed timestamp
    await prisma.vaultItem.update({
      where: { id },
      data: { lastAccessedAt: new Date() },
    });

    return NextResponse.json({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.financeItem?.type,
      institutionName: item.financeItem?.institutionName,
      accountNumber: decryptedData.fullAccountNumber || item.financeItem?.accountNumber,
      accountNumberMasked: item.financeItem?.accountNumber,
      balance: decryptedData.balance,
      currency: item.financeItem?.currency,
      contactPhone: item.financeItem?.contactPhone,
      contactEmail: item.financeItem?.contactEmail,
      website: item.financeItem?.website,
      importance: item.importance,
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      expiryDate: item.expiryDate,
      nominees: item.financeItem?.nominees.map(n => ({
        id: n.id,
        familyMemberId: n.familyMemberId,
        name: n.familyMember.name,
        relationship: n.familyMember.relationship,
        email: n.familyMember.email,
        phone: n.familyMember.phone,
        sharePercentage: n.sharePercentage,
        notes: n.notes,
      })),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lastAccessedAt: item.lastAccessedAt,
    });
  } catch (error) {
    console.error("Error fetching finance item:", error);
    return NextResponse.json(
      { error: "Failed to fetch finance item" },
      { status: 500 }
    );
  }
}

// PATCH - Update a finance item
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
    const data = updateFinanceSchema.parse(body);

    // Check ownership
    const existingItem = await prisma.vaultItem.findFirst({
      where: {
        id,
        userId: user.id,
        category: "finance",
      },
      include: { financeItem: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Get existing encrypted data
    let existingEncryptedData: Record<string, unknown> = {};
    if (existingItem.encryptedData) {
      try {
        existingEncryptedData = JSON.parse(decrypt(existingItem.encryptedData));
      } catch {
        console.error("Failed to decrypt existing data");
      }
    }

    // Update encrypted data if balance or account number changed
    const sensitiveData = {
      balance: data.balance !== undefined ? data.balance : existingEncryptedData.balance,
      fullAccountNumber: data.accountNumber !== undefined ? data.accountNumber : existingEncryptedData.fullAccountNumber,
    };
    const encryptedData = encrypt(JSON.stringify(sensitiveData));

    // Update the item
    const updatedItem = await prisma.vaultItem.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        importance: data.importance,
        encryptedData,
        financeItem: {
          update: {
            type: data.type,
            institutionName: data.institutionName,
            accountNumber: data.accountNumber ? maskString(data.accountNumber, 4) : undefined,
            currency: data.currency,
            contactPhone: data.contactPhone,
            contactEmail: data.contactEmail,
            website: data.website,
          },
        },
      },
      include: { financeItem: true },
    });

    return NextResponse.json({
      id: updatedItem.id,
      name: updatedItem.name,
      type: updatedItem.financeItem?.type,
      updatedAt: updatedItem.updatedAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating finance item:", error);
    return NextResponse.json(
      { error: "Failed to update finance item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a finance item
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

    // Check ownership
    const item = await prisma.vaultItem.findFirst({
      where: {
        id,
        userId: user.id,
        category: "finance",
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete the item (cascade will handle financeItem)
    await prisma.vaultItem.delete({
      where: { id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "vault_updated",
        description: `Deleted finance item - ${item.name}`,
        entityType: "VaultItem",
        entityId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting finance item:", error);
    return NextResponse.json(
      { error: "Failed to delete finance item" },
      { status: 500 }
    );
  }
}

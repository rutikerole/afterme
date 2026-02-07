import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { encrypt, decrypt, maskString } from "@/lib/encryption";
import { z } from "zod";

const financeItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["bank_account", "credit_card", "investment", "loan", "crypto", "other"]),
  institutionName: z.string().min(1, "Institution name is required"),
  accountNumber: z.string().optional(),
  balance: z.number().optional(),
  currency: z.string().default("INR"),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  importance: z.enum(["low", "normal", "high", "critical"]).default("normal"),
  notes: z.string().optional(),
});

// GET - List all finance items
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const whereClause: Record<string, unknown> = {
      userId: user.id,
      category: "finance",
      isArchived: false,
    };

    const financeItems = await prisma.vaultItem.findMany({
      where: whereClause,
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
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter by type if specified and transform response
    const items = financeItems
      .filter(item => !type || item.financeItem?.type === type)
      .map(item => {
        // Decrypt sensitive data if present
        let decryptedData: Record<string, unknown> = {};
        if (item.encryptedData) {
          try {
            decryptedData = JSON.parse(decrypt(item.encryptedData));
          } catch {
            console.error("Failed to decrypt finance item:", item.id);
          }
        }

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          type: item.financeItem?.type,
          institutionName: item.financeItem?.institutionName,
          accountNumber: item.financeItem?.accountNumber,
          accountNumberMasked: item.financeItem?.accountNumber
            ? maskString(item.financeItem.accountNumber, 4)
            : null,
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
            sharePercentage: n.sharePercentage,
          })),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      });

    // Calculate summary statistics
    const stats = {
      total: items.length,
      byType: {
        bank_account: items.filter(i => i.type === "bank_account").length,
        credit_card: items.filter(i => i.type === "credit_card").length,
        investment: items.filter(i => i.type === "investment").length,
        loan: items.filter(i => i.type === "loan").length,
        crypto: items.filter(i => i.type === "crypto").length,
        other: items.filter(i => i.type === "other").length,
      },
    };

    return NextResponse.json({ items, stats });
  } catch (error) {
    console.error("Error fetching finance items:", error);
    return NextResponse.json(
      { error: "Failed to fetch finance items" },
      { status: 500 }
    );
  }
}

// POST - Create a new finance item
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = financeItemSchema.parse(body);

    // Encrypt sensitive data
    const sensitiveData = {
      balance: data.balance,
      fullAccountNumber: data.accountNumber,
    };
    const encryptedData = encrypt(JSON.stringify(sensitiveData));

    // Create vault item with finance details
    const vaultItem = await prisma.vaultItem.create({
      data: {
        userId: user.id,
        name: data.name,
        description: data.description || null,
        category: "finance",
        encryptedData,
        importance: data.importance,
        financeItem: {
          create: {
            type: data.type,
            institutionName: data.institutionName,
            accountNumber: data.accountNumber ? maskString(data.accountNumber, 4) : null,
            currency: data.currency,
            contactPhone: data.contactPhone || null,
            contactEmail: data.contactEmail || null,
            website: data.website || null,
          },
        },
      },
      include: {
        financeItem: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "vault_updated",
        description: `Added ${data.type.replace("_", " ")} - ${data.name}`,
        entityType: "VaultItem",
        entityId: vaultItem.id,
      },
    });

    return NextResponse.json({
      id: vaultItem.id,
      name: vaultItem.name,
      type: vaultItem.financeItem?.type,
      institutionName: vaultItem.financeItem?.institutionName,
      createdAt: vaultItem.createdAt,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating finance item:", error);
    return NextResponse.json(
      { error: "Failed to create finance item" },
      { status: 500 }
    );
  }
}

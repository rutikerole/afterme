import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { encrypt, decrypt, maskString } from "@/lib/encryption";
import { z } from "zod";

const insuranceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["life", "health", "auto", "home", "travel", "other"]),
  provider: z.string().min(1, "Provider is required"),
  policyNumber: z.string().optional(),
  coverageAmount: z.number().optional(),
  premium: z.number().optional(),
  premiumFrequency: z.enum(["monthly", "quarterly", "annually"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  agentName: z.string().optional(),
  agentPhone: z.string().optional(),
  agentEmail: z.string().email().optional().or(z.literal("")),
  importance: z.enum(["low", "normal", "high", "critical"]).default("high"),
});

// GET - List all insurance policies
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const insuranceItems = await prisma.vaultItem.findMany({
      where: {
        userId: user.id,
        category: "insurance",
        isArchived: false,
      },
      include: {
        insurancePolicy: {
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
    const items = insuranceItems
      .filter(item => !type || item.insurancePolicy?.type === type)
      .map(item => {
        // Decrypt sensitive data if present
        let decryptedData: Record<string, unknown> = {};
        if (item.encryptedData) {
          try {
            decryptedData = JSON.parse(decrypt(item.encryptedData));
          } catch {
            console.error("Failed to decrypt insurance item:", item.id);
          }
        }

        const policy = item.insurancePolicy;
        const isExpiringSoon = policy?.endDate &&
          new Date(policy.endDate) > new Date() &&
          new Date(policy.endDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        const isExpired = policy?.endDate && new Date(policy.endDate) < new Date();

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          type: policy?.type,
          provider: policy?.provider,
          policyNumber: policy?.policyNumber,
          policyNumberMasked: policy?.policyNumber
            ? maskString(policy.policyNumber, 4)
            : null,
          coverageAmount: decryptedData.coverageAmount || (policy?.coverageAmount ? Number(policy.coverageAmount) : null),
          premium: decryptedData.premium || (policy?.premium ? Number(policy.premium) : null),
          premiumFrequency: policy?.premiumFrequency,
          startDate: policy?.startDate,
          endDate: policy?.endDate,
          agentName: policy?.agentName,
          agentPhone: policy?.agentPhone,
          agentEmail: policy?.agentEmail,
          importance: item.importance,
          isExpiringSoon,
          isExpired,
          fileUrl: item.fileUrl,
          fileName: item.fileName,
          nominees: policy?.nominees.map(n => ({
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
      expiringSoon: items.filter(i => i.isExpiringSoon).length,
      expired: items.filter(i => i.isExpired).length,
      byType: {
        life: items.filter(i => i.type === "life").length,
        health: items.filter(i => i.type === "health").length,
        auto: items.filter(i => i.type === "auto").length,
        home: items.filter(i => i.type === "home").length,
        travel: items.filter(i => i.type === "travel").length,
        other: items.filter(i => i.type === "other").length,
      },
      totalCoverage: items.reduce((sum, i) => sum + (i.coverageAmount || 0), 0),
      totalPremiumMonthly: items.reduce((sum, i) => {
        if (!i.premium) return sum;
        switch (i.premiumFrequency) {
          case "monthly": return sum + i.premium;
          case "quarterly": return sum + i.premium / 3;
          case "annually": return sum + i.premium / 12;
          default: return sum;
        }
      }, 0),
    };

    return NextResponse.json({ items, stats });
  } catch (error) {
    console.error("Error fetching insurance policies:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurance policies" },
      { status: 500 }
    );
  }
}

// POST - Create a new insurance policy
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = insuranceSchema.parse(body);

    // Encrypt sensitive data
    const sensitiveData = {
      coverageAmount: data.coverageAmount,
      premium: data.premium,
      fullPolicyNumber: data.policyNumber,
    };
    const encryptedData = encrypt(JSON.stringify(sensitiveData));

    // Create vault item with insurance details
    const vaultItem = await prisma.vaultItem.create({
      data: {
        userId: user.id,
        name: data.name,
        description: data.description || null,
        category: "insurance",
        encryptedData,
        importance: data.importance,
        expiryDate: data.endDate ? new Date(data.endDate) : null,
        reminderDate: data.endDate
          ? new Date(new Date(data.endDate).getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days before expiry
          : null,
        insurancePolicy: {
          create: {
            type: data.type,
            provider: data.provider,
            policyNumber: data.policyNumber ? maskString(data.policyNumber, 4) : null,
            coverageAmount: data.coverageAmount,
            premium: data.premium,
            premiumFrequency: data.premiumFrequency || null,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            agentName: data.agentName || null,
            agentPhone: data.agentPhone || null,
            agentEmail: data.agentEmail || null,
          },
        },
      },
      include: {
        insurancePolicy: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "vault_updated",
        description: `Added ${data.type} insurance - ${data.name}`,
        entityType: "VaultItem",
        entityId: vaultItem.id,
      },
    });

    return NextResponse.json({
      id: vaultItem.id,
      name: vaultItem.name,
      type: vaultItem.insurancePolicy?.type,
      provider: vaultItem.insurancePolicy?.provider,
      createdAt: vaultItem.createdAt,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating insurance policy:", error);
    return NextResponse.json(
      { error: "Failed to create insurance policy" },
      { status: 500 }
    );
  }
}

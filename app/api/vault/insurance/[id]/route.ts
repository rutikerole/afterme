import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { encrypt, decrypt, maskString } from "@/lib/encryption";
import { z } from "zod";

const updateInsuranceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["life", "health", "auto", "home", "travel", "other"]).optional(),
  provider: z.string().min(1).optional(),
  policyNumber: z.string().optional(),
  coverageAmount: z.number().optional(),
  premium: z.number().optional(),
  premiumFrequency: z.enum(["monthly", "quarterly", "annually"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  agentName: z.string().optional(),
  agentPhone: z.string().optional(),
  agentEmail: z.string().email().optional().or(z.literal("")),
  importance: z.enum(["low", "normal", "high", "critical"]).optional(),
});

// GET - Get a single insurance policy
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
        category: "insurance",
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
        console.error("Failed to decrypt insurance item:", item.id);
      }
    }

    // Update last accessed timestamp
    await prisma.vaultItem.update({
      where: { id },
      data: { lastAccessedAt: new Date() },
    });

    const policy = item.insurancePolicy;

    return NextResponse.json({
      id: item.id,
      name: item.name,
      description: item.description,
      type: policy?.type,
      provider: policy?.provider,
      policyNumber: decryptedData.fullPolicyNumber || policy?.policyNumber,
      policyNumberMasked: policy?.policyNumber,
      coverageAmount: decryptedData.coverageAmount || (policy?.coverageAmount ? Number(policy.coverageAmount) : null),
      premium: decryptedData.premium || (policy?.premium ? Number(policy.premium) : null),
      premiumFrequency: policy?.premiumFrequency,
      startDate: policy?.startDate,
      endDate: policy?.endDate,
      agentName: policy?.agentName,
      agentPhone: policy?.agentPhone,
      agentEmail: policy?.agentEmail,
      importance: item.importance,
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      nominees: policy?.nominees.map(n => ({
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
    console.error("Error fetching insurance policy:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurance policy" },
      { status: 500 }
    );
  }
}

// PATCH - Update an insurance policy
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
    const data = updateInsuranceSchema.parse(body);

    // Check ownership
    const existingItem = await prisma.vaultItem.findFirst({
      where: {
        id,
        userId: user.id,
        category: "insurance",
      },
      include: { insurancePolicy: true },
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

    // Update encrypted data if sensitive fields changed
    const sensitiveData = {
      coverageAmount: data.coverageAmount !== undefined ? data.coverageAmount : existingEncryptedData.coverageAmount,
      premium: data.premium !== undefined ? data.premium : existingEncryptedData.premium,
      fullPolicyNumber: data.policyNumber !== undefined ? data.policyNumber : existingEncryptedData.fullPolicyNumber,
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
        expiryDate: data.endDate ? new Date(data.endDate) : undefined,
        reminderDate: data.endDate
          ? new Date(new Date(data.endDate).getTime() - 30 * 24 * 60 * 60 * 1000)
          : undefined,
        insurancePolicy: {
          update: {
            type: data.type,
            provider: data.provider,
            policyNumber: data.policyNumber ? maskString(data.policyNumber, 4) : undefined,
            coverageAmount: data.coverageAmount,
            premium: data.premium,
            premiumFrequency: data.premiumFrequency,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            agentName: data.agentName,
            agentPhone: data.agentPhone,
            agentEmail: data.agentEmail,
          },
        },
      },
      include: { insurancePolicy: true },
    });

    return NextResponse.json({
      id: updatedItem.id,
      name: updatedItem.name,
      type: updatedItem.insurancePolicy?.type,
      updatedAt: updatedItem.updatedAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating insurance policy:", error);
    return NextResponse.json(
      { error: "Failed to update insurance policy" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an insurance policy
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
        category: "insurance",
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete the item (cascade will handle insurancePolicy)
    await prisma.vaultItem.delete({
      where: { id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "vault_updated",
        description: `Deleted insurance policy - ${item.name}`,
        entityType: "VaultItem",
        entityId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting insurance policy:", error);
    return NextResponse.json(
      { error: "Failed to delete insurance policy" },
      { status: 500 }
    );
  }
}

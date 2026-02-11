import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { exportVaultToPDF } from "@/lib/pdf-export";

// GET - Export vault data as PDF
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all finance items
    const financeItems = await prisma.vaultItem.findMany({
      where: {
        userId: user.id,
        category: "finance",
      },
      include: {
        financeItem: {
          include: {
            nominees: {
              include: {
                familyMember: {
                  select: { name: true, relationship: true },
                },
              },
            },
          },
        },
      },
    });

    // Get all insurance items
    const insuranceItems = await prisma.vaultItem.findMany({
      where: {
        userId: user.id,
        category: "insurance",
      },
      include: {
        insurancePolicy: {
          include: {
            nominees: {
              include: {
                familyMember: {
                  select: { name: true, relationship: true },
                },
              },
            },
          },
        },
      },
    });

    // Transform data for PDF
    const financeData = financeItems.map((item) => ({
      name: item.name,
      type: item.financeItem?.type || "other",
      description: item.description || undefined,
      importance: item.importance || undefined,
      institutionName: item.financeItem?.institutionName || "",
      accountNumber: item.financeItem?.accountNumber || undefined,
      balance: undefined, // Sensitive - would need decryption
      currency: item.financeItem?.currency || "INR",
      nominees: item.financeItem?.nominees.map((n) => ({
        name: n.familyMember.name,
        relationship: n.familyMember.relationship,
      })),
    }));

    const insuranceData = insuranceItems.map((item) => ({
      name: item.name,
      type: item.insurancePolicy?.type || "other",
      description: item.description || undefined,
      importance: item.importance || undefined,
      provider: item.insurancePolicy?.provider || "",
      policyNumber: item.insurancePolicy?.policyNumber || undefined,
      coverageAmount: item.insurancePolicy?.coverageAmount
        ? Number(item.insurancePolicy.coverageAmount)
        : undefined,
      premium: item.insurancePolicy?.premium
        ? Number(item.insurancePolicy.premium)
        : undefined,
      premiumFrequency: item.insurancePolicy?.premiumFrequency || undefined,
      endDate: item.insurancePolicy?.endDate?.toISOString() || undefined,
      nominees: item.insurancePolicy?.nominees.map((n) => ({
        name: n.familyMember.name,
        relationship: n.familyMember.relationship,
      })),
    }));

    // Generate PDF
    const pdf = exportVaultToPDF(financeData, insuranceData, {
      title: "Vault Summary",
      userName: user.name,
    });

    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="afterme-vault-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error exporting vault:", error);
    return NextResponse.json(
      { error: "Failed to export vault" },
      { status: 500 }
    );
  }
}

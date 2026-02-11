import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { exportLegacySummaryToPDF } from "@/lib/pdf-export";

// GET - Export complete legacy summary as PDF
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all counts and data
    const [
      voiceMessagesCount,
      memoriesCount,
      storiesCount,
      familyMembersCount,
      financeItemsCount,
      insuranceItemsCount,
      emergencyContacts,
      trustees,
      legacyInstruction,
    ] = await Promise.all([
      prisma.voiceMessage.count({ where: { userId: user.id } }),
      prisma.memory.count({ where: { userId: user.id } }),
      prisma.story.count({ where: { userId: user.id } }),
      prisma.familyMember.count({ where: { userId: user.id } }),
      prisma.vaultItem.count({ where: { userId: user.id, category: "finance" } }),
      prisma.vaultItem.count({ where: { userId: user.id, category: "insurance" } }),
      prisma.emergencyContact.findMany({
        where: {
          familyMember: {
            userId: user.id,
          },
        },
        include: {
          familyMember: {
            select: {
              name: true,
              phone: true,
              relationship: true,
            },
          },
        },
        orderBy: { priority: "asc" },
      }),
      prisma.trustee.findMany({
        where: { userId: user.id },
        select: {
          name: true,
          email: true,
        },
      }),
      prisma.legacyInstruction.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    // Generate PDF
    const pdf = exportLegacySummaryToPDF({
      userName: user.name,
      voiceMessagesCount,
      memoriesCount,
      storiesCount,
      familyMembersCount,
      financeItemsCount,
      insuranceItemsCount,
      emergencyContacts: emergencyContacts.map((ec) => ({
        name: ec.familyMember.name,
        phone: ec.familyMember.phone || "",
        relationship: ec.familyMember.relationship,
      })),
      trustees: trustees.map((t) => ({
        name: t.name,
        email: t.email,
      })),
      legacyInstructions: legacyInstruction?.content || undefined,
    });

    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="afterme-legacy-summary-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error exporting legacy summary:", error);
    return NextResponse.json(
      { error: "Failed to export legacy summary" },
      { status: 500 }
    );
  }
}

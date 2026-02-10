import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateEmergencyContactSchema = z.object({
  name: z.string().min(1).optional(),
  relationship: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  priority: z.number().int().min(1).max(10).optional(),
  medicalNotes: z.string().optional().nullable(),
  bloodType: z.string().optional().nullable(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  instructions: z.string().optional().nullable(),
});

// GET - Get a single emergency contact
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

    const emergencyContact = await prisma.emergencyContact.findFirst({
      where: { id },
      include: {
        familyMember: true,
      },
    });

    if (!emergencyContact || emergencyContact.familyMember.userId !== user.id) {
      return NextResponse.json(
        { error: "Emergency contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      contact: {
        id: emergencyContact.id,
        familyMemberId: emergencyContact.familyMemberId,
        name: emergencyContact.familyMember.name,
        relationship: emergencyContact.familyMember.relationship,
        email: emergencyContact.familyMember.email,
        phone: emergencyContact.familyMember.phone,
        avatar: emergencyContact.familyMember.avatar,
        priority: emergencyContact.priority,
        medicalNotes: emergencyContact.medicalNotes,
        bloodType: emergencyContact.bloodType,
        allergies: emergencyContact.allergies,
        medications: emergencyContact.medications,
        instructions: emergencyContact.instructions,
        createdAt: emergencyContact.createdAt,
        updatedAt: emergencyContact.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching emergency contact:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergency contact" },
      { status: 500 }
    );
  }
}

// PATCH - Update an emergency contact
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
    const data = updateEmergencyContactSchema.parse(body);

    const existing = await prisma.emergencyContact.findFirst({
      where: { id },
      include: {
        familyMember: true,
      },
    });

    if (!existing || existing.familyMember.userId !== user.id) {
      return NextResponse.json(
        { error: "Emergency contact not found" },
        { status: 404 }
      );
    }

    // Update family member info
    if (data.name || data.relationship || data.email !== undefined || data.phone !== undefined) {
      await prisma.familyMember.update({
        where: { id: existing.familyMemberId },
        data: {
          name: data.name,
          relationship: data.relationship,
          email: data.email,
          phone: data.phone,
        },
      });
    }

    // Update emergency contact info
    const emergencyContact = await prisma.emergencyContact.update({
      where: { id },
      data: {
        priority: data.priority,
        medicalNotes: data.medicalNotes,
        bloodType: data.bloodType,
        allergies: data.allergies,
        medications: data.medications,
        instructions: data.instructions,
      },
      include: {
        familyMember: true,
      },
    });

    return NextResponse.json({
      contact: {
        id: emergencyContact.id,
        familyMemberId: emergencyContact.familyMemberId,
        name: emergencyContact.familyMember.name,
        relationship: emergencyContact.familyMember.relationship,
        email: emergencyContact.familyMember.email,
        phone: emergencyContact.familyMember.phone,
        priority: emergencyContact.priority,
        medicalNotes: emergencyContact.medicalNotes,
        bloodType: emergencyContact.bloodType,
        allergies: emergencyContact.allergies,
        medications: emergencyContact.medications,
        instructions: emergencyContact.instructions,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating emergency contact:", error);
    return NextResponse.json(
      { error: "Failed to update emergency contact" },
      { status: 500 }
    );
  }
}

// DELETE - Remove emergency contact (keeps family member)
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

    const existing = await prisma.emergencyContact.findFirst({
      where: { id },
      include: {
        familyMember: true,
      },
    });

    if (!existing || existing.familyMember.userId !== user.id) {
      return NextResponse.json(
        { error: "Emergency contact not found" },
        { status: 404 }
      );
    }

    // Delete only the emergency contact (keep family member)
    await prisma.emergencyContact.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting emergency contact:", error);
    return NextResponse.json(
      { error: "Failed to delete emergency contact" },
      { status: 500 }
    );
  }
}

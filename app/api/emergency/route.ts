import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const emergencyContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  priority: z.number().int().min(1).max(10).default(1),
  medicalNotes: z.string().optional().nullable(),
  bloodType: z.string().optional().nullable(),
  allergies: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  instructions: z.string().optional().nullable(),
});

// GET - List all emergency contacts
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get family members that have emergency contact info
    const familyMembers = await prisma.familyMember.findMany({
      where: { userId: user.id },
      include: {
        emergencyContact: true,
      },
      orderBy: [
        { emergencyContact: { priority: "asc" } },
        { name: "asc" },
      ],
    });

    const contacts = familyMembers
      .filter((fm) => fm.emergencyContact)
      .map((fm) => ({
        id: fm.emergencyContact!.id,
        familyMemberId: fm.id,
        name: fm.name,
        relationship: fm.relationship,
        email: fm.email,
        phone: fm.phone,
        avatar: fm.avatar,
        priority: fm.emergencyContact!.priority,
        medicalNotes: fm.emergencyContact!.medicalNotes,
        bloodType: fm.emergencyContact!.bloodType,
        allergies: fm.emergencyContact!.allergies,
        medications: fm.emergencyContact!.medications,
        instructions: fm.emergencyContact!.instructions,
        createdAt: fm.emergencyContact!.createdAt,
      }));

    // Also get non-emergency family members for potential addition
    const availableFamilyMembers = familyMembers
      .filter((fm) => !fm.emergencyContact)
      .map((fm) => ({
        id: fm.id,
        name: fm.name,
        relationship: fm.relationship,
        email: fm.email,
        phone: fm.phone,
      }));

    return NextResponse.json({
      contacts,
      availableFamilyMembers,
      stats: {
        total: contacts.length,
        primary: contacts.filter((c) => c.priority === 1).length,
      },
    });
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergency contacts" },
      { status: 500 }
    );
  }
}

// POST - Add emergency contact (from existing family member or create new)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = emergencyContactSchema.parse(body);

    // Check if we're linking to existing family member
    const existingFamilyMemberId = body.familyMemberId as string | undefined;

    let familyMember;

    if (existingFamilyMemberId) {
      // Link to existing family member
      familyMember = await prisma.familyMember.findFirst({
        where: { id: existingFamilyMemberId, userId: user.id },
        include: { emergencyContact: true },
      });

      if (!familyMember) {
        return NextResponse.json(
          { error: "Family member not found" },
          { status: 404 }
        );
      }

      if (familyMember.emergencyContact) {
        return NextResponse.json(
          { error: "Family member is already an emergency contact" },
          { status: 400 }
        );
      }
    } else {
      // Create new family member first
      familyMember = await prisma.familyMember.create({
        data: {
          userId: user.id,
          name: data.name,
          relationship: data.relationship,
          email: data.email,
          phone: data.phone,
        },
      });
    }

    // Create emergency contact
    const emergencyContact = await prisma.emergencyContact.create({
      data: {
        familyMemberId: familyMember.id,
        priority: data.priority,
        medicalNotes: data.medicalNotes,
        bloodType: data.bloodType,
        allergies: data.allergies,
        medications: data.medications,
        instructions: data.instructions,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "emergency_contact_added",
        description: `Added emergency contact: ${familyMember.name}`,
        entityType: "EmergencyContact",
        entityId: emergencyContact.id,
      },
    });

    return NextResponse.json(
      {
        contact: {
          id: emergencyContact.id,
          familyMemberId: familyMember.id,
          name: familyMember.name,
          relationship: familyMember.relationship,
          email: familyMember.email,
          phone: familyMember.phone,
          priority: emergencyContact.priority,
          medicalNotes: emergencyContact.medicalNotes,
          bloodType: emergencyContact.bloodType,
          allergies: emergencyContact.allergies,
          medications: emergencyContact.medications,
          instructions: emergencyContact.instructions,
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
    console.error("Error creating emergency contact:", error);
    return NextResponse.json(
      { error: "Failed to create emergency contact" },
      { status: 500 }
    );
  }
}

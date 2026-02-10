import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateMedicineSchema = z.object({
  name: z.string().min(1).optional(),
  dosage: z.string().min(1).optional(),
  times: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

const logMedicineSchema = z.object({
  timeSlot: z.string(),
  taken: z.boolean().default(true),
});

// GET - Get a single medicine reminder
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

    const medicine = await prisma.medicineReminder.findFirst({
      where: { id, userId: user.id },
      include: {
        logs: {
          orderBy: { date: "desc" },
          take: 30, // Last 30 logs
        },
      },
    });

    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    return NextResponse.json({ medicine });
  } catch (error) {
    console.error("Error fetching medicine:", error);
    return NextResponse.json(
      { error: "Failed to fetch medicine" },
      { status: 500 }
    );
  }
}

// PATCH - Update a medicine reminder
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
    const data = updateMedicineSchema.parse(body);

    const existing = await prisma.medicineReminder.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    const medicine = await prisma.medicineReminder.update({
      where: { id },
      data: {
        name: data.name,
        dosage: data.dosage,
        times: data.times,
        notes: data.notes,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ medicine });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating medicine:", error);
    return NextResponse.json(
      { error: "Failed to update medicine" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a medicine reminder
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

    const existing = await prisma.medicineReminder.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    await prisma.medicineReminder.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting medicine:", error);
    return NextResponse.json(
      { error: "Failed to delete medicine" },
      { status: 500 }
    );
  }
}

// POST - Log medicine taken
export async function POST(
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
    const data = logMedicineSchema.parse(body);

    const existing = await prisma.medicineReminder.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    // Check if already logged for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await prisma.medicineLog.findFirst({
      where: {
        reminderId: id,
        timeSlot: data.timeSlot,
        date: { gte: today },
      },
    });

    if (existingLog) {
      // Update existing log
      const log = await prisma.medicineLog.update({
        where: { id: existingLog.id },
        data: { taken: data.taken },
      });
      return NextResponse.json({ log });
    }

    // Create new log
    const log = await prisma.medicineLog.create({
      data: {
        reminderId: id,
        timeSlot: data.timeSlot,
        taken: data.taken,
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error logging medicine:", error);
    return NextResponse.json(
      { error: "Failed to log medicine" },
      { status: 500 }
    );
  }
}

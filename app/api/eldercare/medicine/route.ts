import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const medicineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  times: z.array(z.string()).min(1, "At least one time is required"),
  notes: z.string().optional(),
});

// GET - List all medicine reminders
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const medicines = await prisma.medicineReminder.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        logs: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to include today's taken status
    const items = medicines.map((med) => ({
      id: med.id,
      name: med.name,
      dosage: med.dosage,
      times: med.times,
      notes: med.notes,
      takenToday: med.times.map((time) =>
        med.logs.some((log) => log.timeSlot === time && log.taken)
      ),
      createdAt: med.createdAt,
    }));

    return NextResponse.json({ medicines: items });
  } catch (error) {
    console.error("Error fetching medicines:", error);
    return NextResponse.json(
      { error: "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}

// POST - Create a new medicine reminder
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = medicineSchema.parse(body);

    const medicine = await prisma.medicineReminder.create({
      data: {
        userId: user.id,
        name: data.name,
        dosage: data.dosage,
        times: data.times,
        notes: data.notes || null,
      },
    });

    return NextResponse.json({ medicine }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating medicine:", error);
    return NextResponse.json(
      { error: "Failed to create medicine" },
      { status: 500 }
    );
  }
}

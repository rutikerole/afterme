import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const checkInSchema = z.object({
  mood: z.enum(["good", "okay", "not_good"]),
  note: z.string().optional(),
  bloodPressure: z.string().optional(),
  heartRate: z.number().int().positive().optional(),
  temperature: z.number().positive().optional(),
  weight: z.number().positive().optional(),
});

// GET - List all check-ins
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30");
    const offset = parseInt(searchParams.get("offset") || "0");

    const [checkIns, total] = await Promise.all([
      prisma.dailyCheckIn.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.dailyCheckIn.count({ where: { userId: user.id } }),
    ]);

    // Calculate stats
    const recentCheckIns = await prisma.dailyCheckIn.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 7,
    });

    const moodCounts = {
      good: recentCheckIns.filter((c) => c.mood === "good").length,
      okay: recentCheckIns.filter((c) => c.mood === "okay").length,
      not_good: recentCheckIns.filter((c) => c.mood === "not_good").length,
    };

    // Check if checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCheckIn = await prisma.dailyCheckIn.findFirst({
      where: {
        userId: user.id,
        date: { gte: today },
      },
    });

    return NextResponse.json({
      checkIns: checkIns.map((c) => ({
        id: c.id,
        date: c.date,
        mood: c.mood,
        note: c.note,
        bloodPressure: c.bloodPressure,
        heartRate: c.heartRate,
        temperature: c.temperature ? Number(c.temperature) : null,
        weight: c.weight ? Number(c.weight) : null,
      })),
      total,
      stats: {
        moodCounts,
        checkedInToday: !!todayCheckIn,
        todayCheckIn: todayCheckIn
          ? {
              id: todayCheckIn.id,
              mood: todayCheckIn.mood,
              note: todayCheckIn.note,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching check-ins:", error);
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}

// POST - Create a new check-in
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = checkInSchema.parse(body);

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCheckIn = await prisma.dailyCheckIn.findFirst({
      where: {
        userId: user.id,
        date: { gte: today },
      },
    });

    if (existingCheckIn) {
      // Update existing check-in
      const checkIn = await prisma.dailyCheckIn.update({
        where: { id: existingCheckIn.id },
        data: {
          mood: data.mood,
          note: data.note,
          bloodPressure: data.bloodPressure,
          heartRate: data.heartRate,
          temperature: data.temperature,
          weight: data.weight,
        },
      });

      return NextResponse.json({ checkIn, updated: true });
    }

    // Create new check-in
    const checkIn = await prisma.dailyCheckIn.create({
      data: {
        userId: user.id,
        mood: data.mood,
        note: data.note,
        bloodPressure: data.bloodPressure,
        heartRate: data.heartRate,
        temperature: data.temperature,
        weight: data.weight,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "daily_checkin",
        description: `Daily check-in: Feeling ${data.mood}`,
        entityType: "DailyCheckIn",
        entityId: checkIn.id,
      },
    });

    return NextResponse.json({ checkIn }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating check-in:", error);
    return NextResponse.json(
      { error: "Failed to create check-in" },
      { status: 500 }
    );
  }
}

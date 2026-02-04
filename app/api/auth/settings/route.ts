import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  reminderFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  profileVisibility: z.enum(["private", "family", "public"]).optional(),
  inactivityPeriod: z.number().int().min(30).max(730).optional(),
  legacyReleaseEnabled: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().min(2).max(10).optional(),
});

// GET - Get current user settings
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    if (!settings) {
      // Create default settings if none exist
      const newSettings = await prisma.userSettings.create({
        data: { userId: user.id },
      });
      return NextResponse.json({ settings: newSettings });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = updateSettingsSchema.parse(body);

    // Upsert settings (create if doesn't exist, update if does)
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...data,
      },
      update: data,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

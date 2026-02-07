import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendTrusteeVerificationEmail } from "@/lib/email";
import { z } from "zod";
import crypto from "crypto";

const trusteeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  relationship: z.string().min(1, "Relationship is required"),
  priority: z.number().int().min(1).max(10).optional(),
});

// GET - List all trustees for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trustees = await prisma.trustee.findMany({
      where: { userId: user.id },
      orderBy: { priority: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        relationship: true,
        isVerified: true,
        verifiedAt: true,
        isActive: true,
        priority: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ trustees });
  } catch (error) {
    console.error("Error fetching trustees:", error);
    return NextResponse.json(
      { error: "Failed to fetch trustees" },
      { status: 500 }
    );
  }
}

// POST - Add a new trustee
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = trusteeSchema.parse(body);

    // Check if trustee with this email already exists for this user
    const existingTrustee = await prisma.trustee.findUnique({
      where: {
        userId_email: {
          userId: user.id,
          email: data.email,
        },
      },
    });

    if (existingTrustee) {
      return NextResponse.json(
        { error: "A trustee with this email already exists" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const trustee = await prisma.trustee.create({
      data: {
        userId: user.id,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        relationship: data.relationship,
        priority: data.priority || 1,
        verificationToken,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        relationship: true,
        isVerified: true,
        isActive: true,
        priority: true,
        createdAt: true,
      },
    });

    // Send verification email to trustee
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/trustees/verify?token=${verificationToken}`;
    await sendTrusteeVerificationEmail({
      trusteeEmail: data.email,
      trusteeName: data.name,
      userName: user.name || 'A user',
      verificationLink,
    });

    return NextResponse.json({ trustee }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating trustee:", error);
    return NextResponse.json(
      { error: "Failed to create trustee" },
      { status: 500 }
    );
  }
}

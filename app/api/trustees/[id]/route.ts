import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateTrusteeSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  relationship: z.string().min(1).optional(),
  priority: z.number().int().min(1).max(10).optional(),
  isActive: z.boolean().optional(),
});

// GET - Get a specific trustee
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

    const trustee = await prisma.trustee.findFirst({
      where: {
        id,
        userId: user.id,
      },
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

    if (!trustee) {
      return NextResponse.json({ error: "Trustee not found" }, { status: 404 });
    }

    return NextResponse.json({ trustee });
  } catch (error) {
    console.error("Error fetching trustee:", error);
    return NextResponse.json(
      { error: "Failed to fetch trustee" },
      { status: 500 }
    );
  }
}

// PATCH - Update a trustee
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
    const data = updateTrusteeSchema.parse(body);

    // Verify ownership
    const existingTrustee = await prisma.trustee.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingTrustee) {
      return NextResponse.json({ error: "Trustee not found" }, { status: 404 });
    }

    // If email is being changed, check for duplicates
    if (data.email && data.email !== existingTrustee.email) {
      const duplicateEmail = await prisma.trustee.findUnique({
        where: {
          userId_email: {
            userId: user.id,
            email: data.email,
          },
        },
      });

      if (duplicateEmail) {
        return NextResponse.json(
          { error: "A trustee with this email already exists" },
          { status: 400 }
        );
      }
    }

    const trustee = await prisma.trustee.update({
      where: { id },
      data: {
        ...data,
        // Reset verification if email changed
        ...(data.email && data.email !== existingTrustee.email
          ? { isVerified: false, verifiedAt: null }
          : {}),
      },
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

    return NextResponse.json({ trustee });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating trustee:", error);
    return NextResponse.json(
      { error: "Failed to update trustee" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a trustee
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

    // Verify ownership
    const trustee = await prisma.trustee.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!trustee) {
      return NextResponse.json({ error: "Trustee not found" }, { status: 404 });
    }

    await prisma.trustee.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting trustee:", error);
    return NextResponse.json(
      { error: "Failed to delete trustee" },
      { status: 500 }
    );
  }
}

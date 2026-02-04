import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

const confirmationSchema = z.object({
  token: z.string().min(1, "Token is required"),
  action: z.enum(["confirm", "deny"]),
  notes: z.string().optional(),
});

// POST - Trustee confirms or denies a legacy access request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = confirmationSchema.parse(body);

    // Find the confirmation by token
    const confirmation = await prisma.trusteeConfirmation.findUnique({
      where: { confirmationToken: data.token },
      include: {
        trustee: true,
        legacyRequest: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            trusteeConfirmations: true,
          },
        },
      },
    });

    if (!confirmation) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation link" },
        { status: 404 }
      );
    }

    if (confirmation.status !== "pending") {
      return NextResponse.json(
        { error: "This confirmation has already been processed" },
        { status: 400 }
      );
    }

    // Update the confirmation
    await prisma.trusteeConfirmation.update({
      where: { id: confirmation.id },
      data: {
        status: data.action === "confirm" ? "confirmed" : "denied",
        confirmedAt: new Date(),
        notes: data.notes || null,
        confirmationToken: null, // Invalidate token after use
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: confirmation.legacyRequest.userId,
        action: `trustee_${data.action}`,
        resource: "TrusteeConfirmation",
        resourceId: confirmation.id,
        details: {
          trusteeEmail: confirmation.trustee.email,
          trusteeName: confirmation.trustee.name,
          requestId: confirmation.legacyRequestId,
        },
      },
    });

    // Check if this was a denial - if so, reject the request
    if (data.action === "deny") {
      await prisma.legacyAccessRequest.update({
        where: { id: confirmation.legacyRequestId },
        data: {
          status: "rejected",
          statusMessage: `Denied by trustee: ${confirmation.trustee.name}`,
          verifiedBy: confirmation.trustee.email,
          verifiedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "You have denied this access request.",
      });
    }

    // Check if we have enough confirmations
    const allConfirmations = await prisma.trusteeConfirmation.findMany({
      where: { legacyRequestId: confirmation.legacyRequestId },
    });

    const confirmedCount = allConfirmations.filter(c => c.status === "confirmed").length;
    const totalTrustees = allConfirmations.length;

    // Require majority confirmation (at least 1 if only 1 trustee, 2 if 2-3, etc.)
    const requiredConfirmations = Math.max(1, Math.ceil(totalTrustees / 2));

    if (confirmedCount >= requiredConfirmations) {
      // Check verification method
      const legacyRequest = confirmation.legacyRequest;

      if (legacyRequest.verificationMethod === "trustee_confirmation") {
        // Trustee-only: Start grace period immediately
        await startGracePeriod(legacyRequest.id, "trustee_confirmation");
      } else if (legacyRequest.verificationMethod === "both") {
        // Both methods required: Check if death certificate was also verified
        // For now, auto-verify if death certificate was uploaded and trustees confirmed
        if (legacyRequest.deathCertificateUrl) {
          await startGracePeriod(legacyRequest.id, "trustee_confirmation");
        } else {
          await prisma.legacyAccessRequest.update({
            where: { id: legacyRequest.id },
            data: {
              status: "under_review",
              statusMessage: "Trustees confirmed. Awaiting death certificate verification.",
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for confirming this request.",
      confirmations: {
        confirmed: confirmedCount,
        required: requiredConfirmations,
        total: totalTrustees,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error processing confirmation:", error);
    return NextResponse.json(
      { error: "Failed to process confirmation" },
      { status: 500 }
    );
  }
}

// GET - Get confirmation details (for the trustee to see what they're confirming)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const confirmation = await prisma.trusteeConfirmation.findUnique({
      where: { confirmationToken: token },
      include: {
        trustee: {
          select: { name: true },
        },
        legacyRequest: {
          select: {
            requesterName: true,
            requesterEmail: true,
            relationship: true,
            verificationMethod: true,
            deathCertificateUrl: true,
            createdAt: true,
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!confirmation) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation link" },
        { status: 404 }
      );
    }

    if (confirmation.status !== "pending") {
      return NextResponse.json(
        { error: "This confirmation has already been processed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      trusteeName: confirmation.trustee.name,
      userName: confirmation.legacyRequest.user.name,
      requesterName: confirmation.legacyRequest.requesterName,
      requesterEmail: confirmation.legacyRequest.requesterEmail,
      relationship: confirmation.legacyRequest.relationship,
      verificationMethod: confirmation.legacyRequest.verificationMethod,
      hasDeathCertificate: !!confirmation.legacyRequest.deathCertificateUrl,
      requestDate: confirmation.legacyRequest.createdAt,
    });
  } catch (error) {
    console.error("Error fetching confirmation details:", error);
    return NextResponse.json(
      { error: "Failed to fetch details" },
      { status: 500 }
    );
  }
}

// Helper function to start the grace period
async function startGracePeriod(requestId: string, verifiedBy: string) {
  const gracePeriodDays = 7;
  const gracePeriodStart = new Date();
  const gracePeriodEnd = new Date();
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + gracePeriodDays);

  await prisma.legacyAccessRequest.update({
    where: { id: requestId },
    data: {
      status: "grace_period",
      statusMessage: `Verification complete. A ${gracePeriodDays}-day grace period has started.`,
      verifiedBy,
      verifiedAt: new Date(),
      gracePeriodStart,
      gracePeriodEnd,
    },
  });

  // TODO: Send notification email to requester about grace period
  // TODO: Send notification email to the user (in case of false positive)
}

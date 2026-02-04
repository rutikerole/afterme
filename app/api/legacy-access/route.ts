import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

// Custom validator for URLs (including data URLs for death certificate images)
const urlOrDataUrl = z.string().refine(
  (val) => val.startsWith("data:") || val.startsWith("http://") || val.startsWith("https://"),
  { message: "Must be a valid URL or data URL" }
);

const legacyAccessRequestSchema = z.object({
  userEmail: z.string().email("Valid user email is required"),
  requesterName: z.string().min(1, "Your name is required"),
  requesterEmail: z.string().email("Valid email is required"),
  requesterPhone: z.string().optional(),
  relationship: z.string().min(1, "Relationship is required"),
  verificationMethod: z.enum(["death_certificate", "trustee_confirmation", "both"]),
  deathCertificateUrl: urlOrDataUrl.optional(),
});

const statusCheckSchema = z.object({
  email: z.string().email("Valid email is required"),
  requestId: z.string().optional(),
});

// POST - Create a new legacy access request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = legacyAccessRequestSchema.parse(body);

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: data.userEmail },
      select: {
        id: true,
        name: true,
        settings: {
          select: {
            legacyReleaseEnabled: true,
          },
        },
      },
    });

    if (!user) {
      // Don't reveal if user exists or not for privacy
      return NextResponse.json(
        { error: "If this account exists, a request has been submitted." },
        { status: 200 }
      );
    }

    // Check if legacy release is enabled
    if (!user.settings?.legacyReleaseEnabled) {
      return NextResponse.json(
        { error: "Legacy access is not enabled for this account." },
        { status: 403 }
      );
    }

    // Check for existing pending request from same requester
    const existingRequest = await prisma.legacyAccessRequest.findFirst({
      where: {
        userId: user.id,
        requesterEmail: data.requesterEmail,
        status: { in: ["pending", "under_review", "grace_period"] },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          error: "You already have a pending request for this account.",
          requestId: existingRequest.id,
        },
        { status: 400 }
      );
    }

    // Death certificate is required for death_certificate method
    if (
      (data.verificationMethod === "death_certificate" || data.verificationMethod === "both") &&
      !data.deathCertificateUrl
    ) {
      return NextResponse.json(
        { error: "Death certificate is required for this verification method" },
        { status: 400 }
      );
    }

    // Create the request
    const accessRequest = await prisma.legacyAccessRequest.create({
      data: {
        userId: user.id,
        requesterName: data.requesterName,
        requesterEmail: data.requesterEmail,
        requesterPhone: data.requesterPhone || null,
        relationship: data.relationship,
        verificationMethod: data.verificationMethod,
        deathCertificateUrl: data.deathCertificateUrl || null,
        deathCertificateUploadedAt: data.deathCertificateUrl ? new Date() : null,
        status: "pending",
      },
    });

    // If trustee confirmation is needed, notify trustees
    if (data.verificationMethod === "trustee_confirmation" || data.verificationMethod === "both") {
      const trustees = await prisma.trustee.findMany({
        where: {
          userId: user.id,
          isActive: true,
        },
        orderBy: { priority: "asc" },
      });

      // Create confirmation requests for each trustee
      for (const trustee of trustees) {
        const confirmationToken = crypto.randomBytes(32).toString("hex");

        await prisma.trusteeConfirmation.create({
          data: {
            legacyRequestId: accessRequest.id,
            trusteeId: trustee.id,
            confirmationToken,
            status: "pending",
          },
        });

        // TODO: Send email to trustee with confirmation link
        // /legacy-access/trustee-confirm?token=${confirmationToken}
      }
    }

    // Log the request
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "legacy_access_requested",
        resource: "LegacyAccessRequest",
        resourceId: accessRequest.id,
        details: {
          requesterEmail: data.requesterEmail,
          verificationMethod: data.verificationMethod,
        },
      },
    });

    return NextResponse.json({
      success: true,
      requestId: accessRequest.id,
      message: "Your request has been submitted. You will be notified when it is reviewed.",
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating legacy access request:", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}

// GET - Check status of a legacy access request
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const requestId = searchParams.get("requestId");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const whereClause: Record<string, unknown> = {
      requesterEmail: email,
    };

    if (requestId) {
      whereClause.id = requestId;
    }

    const requests = await prisma.legacyAccessRequest.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        statusMessage: true,
        verificationMethod: true,
        gracePeriodStart: true,
        gracePeriodEnd: true,
        accessGrantedAt: true,
        accessExpiresAt: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
        trusteeConfirmations: {
          select: {
            status: true,
            trustee: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform the response to hide sensitive details
    const safeRequests = requests.map(req => ({
      id: req.id,
      status: req.status,
      statusMessage: req.statusMessage,
      verificationMethod: req.verificationMethod,
      userName: req.user.name,
      gracePeriodEnd: req.gracePeriodEnd,
      accessExpiresAt: req.accessExpiresAt,
      createdAt: req.createdAt,
      trusteeConfirmations: req.trusteeConfirmations.length > 0 ? {
        total: req.trusteeConfirmations.length,
        confirmed: req.trusteeConfirmations.filter(tc => tc.status === "confirmed").length,
      } : null,
    }));

    return NextResponse.json({ requests: safeRequests });
  } catch (error) {
    console.error("Error checking status:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}

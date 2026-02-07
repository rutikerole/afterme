import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendAccessGrantedEmail } from "@/lib/email";
import crypto from "crypto";

// POST - Grant access after grace period ends (called by cron or manually)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, adminKey } = body;

    // Simple admin verification (in production, use proper admin auth)
    // This can also be called by a cron job that checks grace periods
    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    const legacyRequest = await prisma.legacyAccessRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!legacyRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Check if grace period has ended
    if (legacyRequest.status === "grace_period") {
      if (!legacyRequest.gracePeriodEnd || new Date() < legacyRequest.gracePeriodEnd) {
        return NextResponse.json(
          { error: "Grace period has not ended yet" },
          { status: 400 }
        );
      }
    } else if (legacyRequest.status !== "verified") {
      return NextResponse.json(
        { error: "Request is not verified or in grace period" },
        { status: 400 }
      );
    }

    // Generate access token
    const accessToken = crypto.randomBytes(48).toString("hex");
    const accessExpiresAt = new Date();
    accessExpiresAt.setDate(accessExpiresAt.getDate() + 30); // 30 days access

    await prisma.legacyAccessRequest.update({
      where: { id: requestId },
      data: {
        status: "granted",
        accessToken,
        accessGrantedAt: new Date(),
        accessExpiresAt,
        statusMessage: "Access has been granted.",
      },
    });

    // Log the access grant
    await prisma.auditLog.create({
      data: {
        userId: legacyRequest.userId,
        action: "legacy_access_granted",
        resource: "LegacyAccessRequest",
        resourceId: requestId,
        details: {
          requesterEmail: legacyRequest.requesterEmail,
          accessExpiresAt,
        },
      },
    });

    // Send email to requester with access link
    const accessLink = `${process.env.NEXT_PUBLIC_APP_URL}/legacy-access/view?token=${accessToken}`;
    await sendAccessGrantedEmail({
      requesterEmail: legacyRequest.requesterEmail,
      requesterName: legacyRequest.requesterName,
      userName: legacyRequest.user.name || 'User',
      accessLink,
      accessToken,
    });

    return NextResponse.json({
      success: true,
      message: "Access has been granted.",
      accessToken,
      accessExpiresAt,
    });
  } catch (error) {
    console.error("Error granting access:", error);
    return NextResponse.json(
      { error: "Failed to grant access" },
      { status: 500 }
    );
  }
}

// GET - Access the legacy content using the access token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    const legacyRequest = await prisma.legacyAccessRequest.findUnique({
      where: { accessToken: token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    if (!legacyRequest) {
      return NextResponse.json(
        { error: "Invalid access token" },
        { status: 404 }
      );
    }

    if (legacyRequest.status !== "granted") {
      return NextResponse.json(
        { error: "Access has not been granted" },
        { status: 403 }
      );
    }

    if (legacyRequest.accessExpiresAt && new Date() > legacyRequest.accessExpiresAt) {
      return NextResponse.json(
        { error: "Access has expired" },
        { status: 403 }
      );
    }

    // Fetch all content that's marked for release after death
    const [voiceMessages, memories, stories, legacyInstructions] = await Promise.all([
      prisma.voiceMessage.findMany({
        where: {
          userId: legacyRequest.userId,
          releaseAfterDeath: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          fileUrl: true,
          duration: true,
          transcript: true,
          recordedAt: true,
          tags: true,
        },
        orderBy: { recordedAt: "desc" },
      }),
      prisma.memory.findMany({
        where: {
          userId: legacyRequest.userId,
          isPrivate: false,
        },
        select: {
          id: true,
          title: true,
          description: true,
          mediaType: true,
          mediaUrl: true,
          dateTaken: true,
          location: true,
          tags: true,
          people: true,
        },
        orderBy: { dateTaken: "desc" },
      }),
      prisma.story.findMany({
        where: {
          userId: legacyRequest.userId,
          status: "published",
          isPrivate: false,
        },
        select: {
          id: true,
          title: true,
          content: true,
          excerpt: true,
          category: true,
          coverImageUrl: true,
          publishedAt: true,
          tags: true,
        },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.legacyInstruction.findMany({
        where: {
          userId: legacyRequest.userId,
          triggerType: "death",
        },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          attachmentUrls: true,
        },
        orderBy: { priority: "desc" },
      }),
    ]);

    // Log the access
    await prisma.auditLog.create({
      data: {
        userId: legacyRequest.userId,
        action: "legacy_content_accessed",
        resource: "LegacyAccessRequest",
        resourceId: legacyRequest.id,
        details: {
          requesterEmail: legacyRequest.requesterEmail,
          contentAccessed: {
            voiceMessages: voiceMessages.length,
            memories: memories.length,
            stories: stories.length,
            legacyInstructions: legacyInstructions.length,
          },
        },
      },
    });

    return NextResponse.json({
      user: legacyRequest.user,
      accessExpiresAt: legacyRequest.accessExpiresAt,
      content: {
        voiceMessages,
        memories,
        stories,
        legacyInstructions,
      },
    });
  } catch (error) {
    console.error("Error accessing legacy content:", error);
    return NextResponse.json(
      { error: "Failed to access content" },
      { status: 500 }
    );
  }
}

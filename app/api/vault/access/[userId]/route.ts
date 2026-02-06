import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkVaultAccess } from "@/lib/db/trusted-circle";
import { prisma } from "@/lib/db";

// GET /api/vault/access/[userId] - View a trusted person's vault
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId: targetUserId } = await params;

    // Check if user can access the target's vault
    const accessCheck = await checkVaultAccess(user.id, targetUserId);

    if (!accessCheck.canAccess) {
      return NextResponse.json(
        {
          canAccess: false,
          reason: accessCheck.reason,
        },
        { status: 403 }
      );
    }

    // Get the target user info
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        lifeStatus: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    // Fetch vault items based on permissions
    const permissions = accessCheck.permissions!;
    const where: Record<string, unknown> = {
      userId: targetUserId,
      isArchived: false,
    };

    if (category) {
      where.category = category;
    }

    // Get vault items
    const [items, total] = await Promise.all([
      prisma.vaultItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          tags: true,
          importance: true,
          expiryDate: true,
          createdAt: true,
          // Only include sensitive data if user has vault access
          ...(permissions.canAccessVault && {
            encryptedData: true,
            fileUrl: true,
            fileName: true,
            fileSize: true,
          }),
        },
      }),
      prisma.vaultItem.count({ where }),
    ]);

    // Also get content counts based on permissions
    const contentCounts: Record<string, number> = {};

    if (permissions.canAccessVoice) {
      contentCounts.voiceMessages = await prisma.voiceMessage.count({
        where: { userId: targetUserId, isPrivate: false },
      });
    }

    if (permissions.canAccessMemories) {
      contentCounts.memories = await prisma.memory.count({
        where: { userId: targetUserId, isPrivate: false },
      });
    }

    if (permissions.canAccessStories) {
      contentCounts.stories = await prisma.story.count({
        where: {
          userId: targetUserId,
          isPrivate: false,
          status: "published",
        },
      });
    }

    if (permissions.canAccessLegacy) {
      contentCounts.legacyInstructions = await prisma.legacyInstruction.count({
        where: { userId: targetUserId },
      });
    }

    return NextResponse.json({
      canAccess: true,
      user: targetUser,
      permissions,
      vaultItems: items,
      contentCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error accessing vault:", error);
    return NextResponse.json(
      { error: "Failed to access vault" },
      { status: 500 }
    );
  }
}

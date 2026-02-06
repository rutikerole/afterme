import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAccessibleVaults } from "@/lib/db/trusted-circle";
import { prisma } from "@/lib/db";

// GET /api/vault/family - Get all family members' vault data grouped by user
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || undefined;

    // Get all users whose vaults I can access
    const accessibleVaults = await getAccessibleVaults(user.id);

    // Fetch vault data for each accessible user
    const familyData = await Promise.all(
      accessibleVaults.map(async ({ user: familyMember, permissions }) => {
        // Build where clause
        const where: Record<string, unknown> = {
          userId: familyMember.id,
          isArchived: false,
        };

        if (category) {
          where.category = category;
        }

        // Fetch vault items with related data based on category
        const vaultItems = await prisma.vaultItem.findMany({
          where,
          orderBy: { createdAt: "desc" },
          include: {
            identityDoc: true,
            financeItem: true,
            insurancePolicy: true,
            subscription: true,
            property: true,
          },
        });

        // Get counts by category
        const categoryCounts = await prisma.vaultItem.groupBy({
          by: ["category"],
          where: {
            userId: familyMember.id,
            isArchived: false,
          },
          _count: {
            id: true,
          },
        });

        const counts = categoryCounts.reduce((acc, item) => {
          acc[item.category] = item._count.id;
          return acc;
        }, {} as Record<string, number>);

        return {
          user: familyMember,
          permissions,
          vaultItems,
          counts,
        };
      })
    );

    // Also include current user's data
    const currentUserWhere: Record<string, unknown> = {
      userId: user.id,
      isArchived: false,
    };

    if (category) {
      currentUserWhere.category = category;
    }

    const currentUserItems = await prisma.vaultItem.findMany({
      where: currentUserWhere,
      orderBy: { createdAt: "desc" },
      include: {
        identityDoc: true,
        financeItem: true,
        insurancePolicy: true,
        subscription: true,
        property: true,
      },
    });

    const currentUserCategoryCounts = await prisma.vaultItem.groupBy({
      by: ["category"],
      where: {
        userId: user.id,
        isArchived: false,
      },
      _count: {
        id: true,
      },
    });

    const currentUserCounts = currentUserCategoryCounts.reduce((acc, item) => {
      acc[item.category] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      currentUser: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          lifeStatus: "alive",
        },
        vaultItems: currentUserItems,
        counts: currentUserCounts,
      },
      familyMembers: familyData,
      totalMembers: familyData.length + 1, // Including current user
    });
  } catch (error) {
    console.error("Error fetching family vault data:", error);
    return NextResponse.json(
      { error: "Failed to fetch family vault data" },
      { status: 500 }
    );
  }
}

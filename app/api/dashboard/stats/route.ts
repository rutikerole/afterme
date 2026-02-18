import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all stats in parallel for performance
    const [
      memoriesCount,
      voiceMessagesCount,
      storiesCount,
      vaultItemsCount,
      legacyInstructionsCount,
      connectionsCount,
      scheduledMessages,
      recentActivity,
    ] = await Promise.all([
      // Memories count
      prisma.memory.count({ where: { userId: user.id } }),

      // Voice messages count
      prisma.voiceMessage.count({ where: { userId: user.id } }),

      // Stories count
      prisma.story.count({ where: { userId: user.id } }),

      // Vault items count
      prisma.vaultItem.count({ where: { userId: user.id } }),

      // Legacy instructions count
      prisma.legacyInstruction.count({ where: { userId: user.id } }),

      // Trusted connections count (both directions)
      prisma.trustedConnection.count({
        where: {
          OR: [{ userAId: user.id }, { userBId: user.id }],
          isActive: true,
        },
      }),

      // Upcoming scheduled messages (next 3)
      prisma.scheduledMessage.findMany({
        where: {
          userId: user.id,
          status: "scheduled",
          scheduledDate: { gte: new Date() },
        },
        orderBy: { scheduledDate: "asc" },
        take: 5,
        select: {
          id: true,
          title: true,
          recipientName: true,
          scheduledDate: true,
          occasion: true,
        },
      }),

      // Recent activity from connections
      prisma.activity.findMany({
        where: {
          userId: {
            in: await getConnectedUserIds(user.id),
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    // Calculate days active
    const daysActive = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate pillar progress based on real data
    const pillarStats = {
      vault: {
        items: vaultItemsCount,
        progress: calculateProgress(vaultItemsCount, 50), // Target: 50 items
      },
      legacy: {
        items: legacyInstructionsCount,
        progress: calculateProgress(legacyInstructionsCount, 10), // Target: 10 instructions
      },
      voice: {
        items: voiceMessagesCount,
        progress: calculateProgress(voiceMessagesCount, 20), // Target: 20 messages
      },
      stories: {
        items: storiesCount,
        progress: calculateProgress(storiesCount, 15), // Target: 15 stories
      },
      memories: {
        items: memoriesCount,
        progress: calculateProgress(memoriesCount, 200), // Target: 200 memories
      },
      family: {
        items: connectionsCount,
        progress: calculateProgress(connectionsCount, 8), // Target: 8 connections
      },
      messages: {
        items: scheduledMessages.length,
        progress: calculateProgress(scheduledMessages.length, 10), // Target: 10 scheduled
      },
      eldercare: {
        items: 0, // TODO: Add eldercare tracking
        progress: 0,
      },
    };

    // Calculate overall progress (average of all pillars)
    const overallProgress = Math.round(
      Object.values(pillarStats).reduce((sum, p) => sum + p.progress, 0) /
        Object.keys(pillarStats).length
    );

    // Format upcoming events
    const upcomingEvents = scheduledMessages.map((msg) => {
      const daysLeft = Math.ceil(
        (new Date(msg.scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return {
        id: msg.id,
        name: msg.recipientName,
        date: formatDate(msg.scheduledDate),
        type: formatOccasion(msg.occasion),
        title: msg.title,
        daysLeft: Math.max(0, daysLeft),
      };
    });

    // Format family activity
    const familyActivity = recentActivity.map((activity) => ({
      id: activity.id,
      name: activity.user.name.split(" ")[0], // First name only
      avatar: activity.user.name.charAt(0).toUpperCase(),
      action: formatActivityAction(activity.type),
      item: activity.description,
      time: formatRelativeTime(activity.createdAt),
    }));

    return NextResponse.json({
      stats: {
        memories: memoriesCount,
        familyMembers: connectionsCount,
        scheduledMessages: scheduledMessages.length,
        daysActive: Math.max(1, daysActive),
      },
      pillarStats,
      overallProgress,
      upcomingEvents,
      familyActivity,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

// Helper: Get IDs of connected users
async function getConnectedUserIds(userId: string): Promise<string[]> {
  const connections = await prisma.trustedConnection.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
      isActive: true,
    },
    select: {
      userAId: true,
      userBId: true,
    },
  });

  const ids = new Set<string>();
  connections.forEach((c) => {
    if (c.userAId !== userId) ids.add(c.userAId);
    if (c.userBId !== userId) ids.add(c.userBId);
  });

  return Array.from(ids);
}

// Helper: Calculate progress percentage (capped at 100)
function calculateProgress(current: number, target: number): number {
  return Math.min(100, Math.round((current / target) * 100));
}

// Helper: Format date to readable string
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

// Helper: Format occasion type
function formatOccasion(occasion: string): string {
  const occasionMap: Record<string, string> = {
    birthday: "Birthday Message",
    wedding: "Wedding Anniversary",
    graduation: "Graduation Note",
    holiday: "Holiday Greeting",
    milestone: "Milestone Message",
    other: "Special Message",
  };
  return occasionMap[occasion] || "Message";
}

// Helper: Format activity action
function formatActivityAction(type: string): string {
  const actionMap: Record<string, string> = {
    voice_recorded: "listened to",
    memory_added: "viewed",
    memory_viewed: "viewed",
    story_written: "read",
    story_viewed: "read",
    vault_updated: "accessed",
    vault_viewed: "accessed",
    photo_downloaded: "downloaded",
  };
  return actionMap[type] || "interacted with";
}

// Helper: Format relative time
function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
}

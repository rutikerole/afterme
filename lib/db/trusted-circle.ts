// ════════════════════════════════════════════════════════════════════════════
// TRUSTED CIRCLE DATABASE SERVICES
// Bidirectional family network with invites and connections
// ════════════════════════════════════════════════════════════════════════════

import { prisma, withTransaction } from "./index";
import type { TrustedCircleInvite, TrustedConnection, User } from "@prisma/client";

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export type AccessPermissions = {
  accessLevel: "viewer" | "editor" | "executor";
  canAccessVoice: boolean;
  canAccessMemories: boolean;
  canAccessStories: boolean;
  canAccessVault: boolean;
  canAccessLegacy: boolean;
};

export const DEFAULT_PERMISSIONS: AccessPermissions = {
  accessLevel: "viewer",
  canAccessVoice: true,
  canAccessMemories: true,
  canAccessStories: true,
  canAccessVault: false,
  canAccessLegacy: false,
};

export type CreateInviteInput = {
  senderId: string;
  inviteeEmail: string;
  inviteeName: string;
  relationshipToSender: string;
  proposedAccessLevel?: string;
  proposedPermissions?: Partial<AccessPermissions>;
  message?: string;
};

export type InviteWithSender = TrustedCircleInvite & {
  sender: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
};

export type ConnectionWithUsers = TrustedConnection & {
  userA: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    lifeStatus: string;
  };
  userB: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    lifeStatus: string;
  };
};

export type NetworkNode = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  lifeStatus: string;
  isCurrentUser: boolean;
  connectionDegree: number;
};

export type NetworkEdge = {
  from: string;
  to: string;
  relationship: string;
  connectionId: string;
};

export type NetworkGraph = {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
};

// ════════════════════════════════════════════════════════════════════════════
// INVITE OPERATIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a new trusted circle invite
 */
export async function createInvite(
  data: CreateInviteInput
): Promise<TrustedCircleInvite> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

  const permissions: AccessPermissions = {
    ...DEFAULT_PERMISSIONS,
    ...data.proposedPermissions,
    accessLevel: (data.proposedAccessLevel as AccessPermissions["accessLevel"]) ?? "viewer",
  };

  return prisma.trustedCircleInvite.create({
    data: {
      senderId: data.senderId,
      inviteeEmail: data.inviteeEmail.toLowerCase(),
      inviteeName: data.inviteeName,
      relationshipToSender: data.relationshipToSender,
      proposedAccessLevel: permissions.accessLevel,
      proposedPermissions: permissions,
      message: data.message,
      expiresAt,
    },
  });
}

/**
 * Get invite by token
 */
export async function getInviteByToken(
  token: string
): Promise<InviteWithSender | null> {
  return prisma.trustedCircleInvite.findUnique({
    where: { token },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Get invite by ID
 */
export async function getInviteById(
  id: string
): Promise<InviteWithSender | null> {
  return prisma.trustedCircleInvite.findUnique({
    where: { id },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Get all invites sent by a user
 */
export async function getSentInvites(
  userId: string,
  status?: string
): Promise<InviteWithSender[]> {
  return prisma.trustedCircleInvite.findMany({
    where: {
      senderId: userId,
      ...(status && { status }),
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get all invites received by an email (pending only by default)
 */
export async function getReceivedInvites(
  email: string,
  includeAll: boolean = false
): Promise<InviteWithSender[]> {
  const now = new Date();

  return prisma.trustedCircleInvite.findMany({
    where: {
      inviteeEmail: email.toLowerCase(),
      ...(includeAll ? {} : {
        status: "pending",
        expiresAt: { gt: now },
      }),
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get count of pending invites for an email
 */
export async function getPendingInvitesCount(email: string): Promise<number> {
  const now = new Date();

  return prisma.trustedCircleInvite.count({
    where: {
      inviteeEmail: email.toLowerCase(),
      status: "pending",
      expiresAt: { gt: now },
    },
  });
}

/**
 * Check if an invite already exists between two users
 */
export async function checkExistingInvite(
  senderId: string,
  inviteeEmail: string
): Promise<TrustedCircleInvite | null> {
  return prisma.trustedCircleInvite.findFirst({
    where: {
      senderId,
      inviteeEmail: inviteeEmail.toLowerCase(),
      status: "pending",
    },
  });
}

/**
 * Accept an invite and create bidirectional connection
 */
export async function acceptInvite(
  inviteId: string,
  acceptingUserId: string,
  reciprocalRelationship: string,
  grantedPermissions?: Partial<AccessPermissions>
): Promise<TrustedConnection> {
  return withTransaction(async (tx) => {
    // Get the invite
    const invite = await tx.trustedCircleInvite.findUnique({
      where: { id: inviteId },
      include: { sender: true },
    });

    if (!invite) {
      throw new Error("Invite not found");
    }

    if (invite.status !== "pending") {
      throw new Error("Invite is no longer pending");
    }

    if (new Date() > invite.expiresAt) {
      throw new Error("Invite has expired");
    }

    // Get accepting user to verify email match
    const acceptingUser = await tx.user.findUnique({
      where: { id: acceptingUserId },
    });

    if (!acceptingUser) {
      throw new Error("User not found");
    }

    if (acceptingUser.email.toLowerCase() !== invite.inviteeEmail.toLowerCase()) {
      throw new Error("Email mismatch - invite was sent to a different email");
    }

    // Cannot accept your own invite
    if (invite.senderId === acceptingUserId) {
      throw new Error("Cannot accept your own invite");
    }

    // Check if connection already exists
    const existingConnection = await getConnectionBetweenUsers(
      tx,
      invite.senderId,
      acceptingUserId
    );

    if (existingConnection) {
      throw new Error("Connection already exists");
    }

    // Determine userA and userB (sender is always A for invite-based connections)
    const userAId = invite.senderId;
    const userBId = acceptingUserId;

    // Access permissions
    const accessAToB = invite.proposedPermissions as AccessPermissions ?? DEFAULT_PERMISSIONS;
    const accessBToA: AccessPermissions = {
      ...DEFAULT_PERMISSIONS,
      ...grantedPermissions,
    };

    // Create the bidirectional connection
    const connection = await tx.trustedConnection.create({
      data: {
        userAId,
        userBId,
        relationshipAToB: invite.relationshipToSender,
        relationshipBToA: reciprocalRelationship,
        accessAToB,
        accessBToA,
        connectionOrigin: "invite",
        originInviteId: invite.id,
      },
    });

    // Update invite status
    await tx.trustedCircleInvite.update({
      where: { id: inviteId },
      data: {
        status: "accepted",
        respondedAt: new Date(),
      },
    });

    return connection;
  });
}

/**
 * Reject an invite
 */
export async function rejectInvite(
  inviteId: string,
  rejectingUserEmail: string
): Promise<TrustedCircleInvite> {
  const invite = await prisma.trustedCircleInvite.findUnique({
    where: { id: inviteId },
  });

  if (!invite) {
    throw new Error("Invite not found");
  }

  if (invite.inviteeEmail.toLowerCase() !== rejectingUserEmail.toLowerCase()) {
    throw new Error("You can only reject invites sent to you");
  }

  if (invite.status !== "pending") {
    throw new Error("Invite is no longer pending");
  }

  return prisma.trustedCircleInvite.update({
    where: { id: inviteId },
    data: {
      status: "rejected",
      respondedAt: new Date(),
    },
  });
}

/**
 * Cancel a sent invite
 */
export async function cancelInvite(
  inviteId: string,
  senderId: string
): Promise<boolean> {
  const invite = await prisma.trustedCircleInvite.findFirst({
    where: { id: inviteId, senderId },
  });

  if (!invite) {
    return false;
  }

  if (invite.status !== "pending") {
    return false;
  }

  await prisma.trustedCircleInvite.update({
    where: { id: inviteId },
    data: { status: "cancelled" },
  });

  return true;
}

/**
 * Expire old invites (utility function for cron job)
 */
export async function expireOldInvites(): Promise<number> {
  const result = await prisma.trustedCircleInvite.updateMany({
    where: {
      status: "pending",
      expiresAt: { lt: new Date() },
    },
    data: { status: "expired" },
  });

  return result.count;
}

// ════════════════════════════════════════════════════════════════════════════
// CONNECTION OPERATIONS
// ════════════════════════════════════════════════════════════════════════════

// Transaction client type
type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Helper to get connection between two users (internal use)
 */
async function getConnectionBetweenUsers(
  tx: TransactionClient,
  userIdA: string,
  userIdB: string
): Promise<TrustedConnection | null> {
  // Check both orderings since we might be A or B
  return tx.trustedConnection.findFirst({
    where: {
      OR: [
        { userAId: userIdA, userBId: userIdB },
        { userAId: userIdB, userBId: userIdA },
      ],
      isActive: true,
    },
  });
}

/**
 * Get connection between two users
 */
export async function getConnectionBetween(
  userIdA: string,
  userIdB: string
): Promise<ConnectionWithUsers | null> {
  return prisma.trustedConnection.findFirst({
    where: {
      OR: [
        { userAId: userIdA, userBId: userIdB },
        { userAId: userIdB, userBId: userIdA },
      ],
      isActive: true,
    },
    include: {
      userA: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          lifeStatus: true,
        },
      },
      userB: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          lifeStatus: true,
        },
      },
    },
  });
}

/**
 * Get all connections for a user
 * Returns normalized data with 'them' being the other person
 */
export async function getConnections(userId: string): Promise<Array<{
  id: string;
  connectedUser: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    lifeStatus: string;
  };
  myRelationshipToThem: string;
  theirRelationshipToMe: string;
  myPermissionsToThem: AccessPermissions;
  theirPermissionsToMe: AccessPermissions;
  connectedAt: Date;
  isActive: boolean;
}>> {
  const connections = await prisma.trustedConnection.findMany({
    where: {
      OR: [
        { userAId: userId },
        { userBId: userId },
      ],
      isActive: true,
    },
    include: {
      userA: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          lifeStatus: true,
        },
      },
      userB: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          lifeStatus: true,
        },
      },
    },
    orderBy: { connectedAt: "desc" },
  });

  // Normalize the connections so "them" is always the other person
  return connections.map((conn) => {
    const iAmUserA = conn.userAId === userId;

    return {
      id: conn.id,
      connectedUser: iAmUserA ? conn.userB : conn.userA,
      myRelationshipToThem: iAmUserA ? conn.relationshipAToB : conn.relationshipBToA,
      theirRelationshipToMe: iAmUserA ? conn.relationshipBToA : conn.relationshipAToB,
      myPermissionsToThem: (iAmUserA ? conn.accessAToB : conn.accessBToA) as AccessPermissions,
      theirPermissionsToMe: (iAmUserA ? conn.accessBToA : conn.accessAToB) as AccessPermissions,
      connectedAt: conn.connectedAt,
      isActive: conn.isActive,
    };
  });
}

/**
 * Get connection count for a user
 */
export async function getConnectionCount(userId: string): Promise<number> {
  return prisma.trustedConnection.count({
    where: {
      OR: [
        { userAId: userId },
        { userBId: userId },
      ],
      isActive: true,
    },
  });
}

/**
 * Update permissions for a connection
 * Only updates the permissions you grant to the other person
 */
export async function updateConnectionPermissions(
  connectionId: string,
  userId: string,
  permissions: Partial<AccessPermissions>
): Promise<TrustedConnection | null> {
  const connection = await prisma.trustedConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection || !connection.isActive) {
    return null;
  }

  const iAmUserA = connection.userAId === userId;
  const iAmUserB = connection.userBId === userId;

  if (!iAmUserA && !iAmUserB) {
    return null; // Not part of this connection
  }

  // Get current permissions and merge with new ones
  const currentPermissions = (iAmUserA ? connection.accessAToB : connection.accessBToA) as AccessPermissions;
  const newPermissions: AccessPermissions = {
    ...currentPermissions,
    ...permissions,
  };

  return prisma.trustedConnection.update({
    where: { id: connectionId },
    data: iAmUserA
      ? { accessAToB: newPermissions }
      : { accessBToA: newPermissions },
  });
}

/**
 * Remove a connection (soft delete by setting isActive to false)
 */
export async function removeConnection(
  connectionId: string,
  userId: string
): Promise<boolean> {
  const connection = await prisma.trustedConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    return false;
  }

  // Verify user is part of this connection
  if (connection.userAId !== userId && connection.userBId !== userId) {
    return false;
  }

  await prisma.trustedConnection.update({
    where: { id: connectionId },
    data: { isActive: false },
  });

  return true;
}

// ════════════════════════════════════════════════════════════════════════════
// NETWORK GRAPH OPERATIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get full network graph for a user
 * Returns all connected users within specified depth (degrees of separation)
 */
export async function getFullNetwork(
  userId: string,
  maxDepth: number = 2
): Promise<NetworkGraph> {
  const nodes: Map<string, NetworkNode> = new Map();
  const edges: NetworkEdge[] = [];
  const visited = new Set<string>();
  const queue: Array<{ userId: string; depth: number }> = [{ userId, depth: 0 }];

  // Get the starting user
  const startUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      lifeStatus: true,
    },
  });

  if (!startUser) {
    return { nodes: [], edges: [] };
  }

  nodes.set(userId, {
    ...startUser,
    isCurrentUser: true,
    connectionDegree: 0,
  });

  // BFS to find all connected users
  while (queue.length > 0) {
    const { userId: currentUserId, depth } = queue.shift()!;

    if (visited.has(currentUserId)) continue;
    visited.add(currentUserId);

    if (depth >= maxDepth) continue;

    // Get all connections for current user
    const connections = await prisma.trustedConnection.findMany({
      where: {
        OR: [
          { userAId: currentUserId },
          { userBId: currentUserId },
        ],
        isActive: true,
      },
      include: {
        userA: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            lifeStatus: true,
          },
        },
        userB: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            lifeStatus: true,
          },
        },
      },
    });

    for (const conn of connections) {
      const iAmUserA = conn.userAId === currentUserId;
      const otherUser = iAmUserA ? conn.userB : conn.userA;
      const relationship = iAmUserA ? conn.relationshipAToB : conn.relationshipBToA;

      // Add edge
      edges.push({
        from: currentUserId,
        to: otherUser.id,
        relationship,
        connectionId: conn.id,
      });

      // Add node if not already added
      if (!nodes.has(otherUser.id)) {
        nodes.set(otherUser.id, {
          ...otherUser,
          isCurrentUser: otherUser.id === userId,
          connectionDegree: depth + 1,
        });

        // Queue for further exploration if not at max depth
        if (!visited.has(otherUser.id)) {
          queue.push({ userId: otherUser.id, depth: depth + 1 });
        }
      }
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    edges,
  };
}

/**
 * Check if two users are connected (directly or indirectly)
 */
export async function areUsersConnected(
  userIdA: string,
  userIdB: string,
  maxDepth: number = 3
): Promise<boolean> {
  const network = await getFullNetwork(userIdA, maxDepth);
  return network.nodes.some((node) => node.id === userIdB);
}

// ════════════════════════════════════════════════════════════════════════════
// VAULT ACCESS HELPERS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Check if a user can access another user's vault
 * Returns permissions if allowed, null if not
 */
export async function checkVaultAccess(
  requesterId: string,
  ownerId: string
): Promise<{ canAccess: boolean; permissions: AccessPermissions | null; reason?: string }> {
  // Self access is always allowed
  if (requesterId === ownerId) {
    return {
      canAccess: true,
      permissions: {
        accessLevel: "executor",
        canAccessVoice: true,
        canAccessMemories: true,
        canAccessStories: true,
        canAccessVault: true,
        canAccessLegacy: true,
      },
    };
  }

  // Get connection between users
  const connection = await getConnectionBetween(requesterId, ownerId);

  if (!connection) {
    return {
      canAccess: false,
      permissions: null,
      reason: "No trusted connection exists",
    };
  }

  // Determine which set of permissions applies
  const iRequesterUserA = connection.userAId === requesterId;
  const permissionsToMe = (iRequesterUserA ? connection.accessBToA : connection.accessAToB) as AccessPermissions;
  const owner = iRequesterUserA ? connection.userB : connection.userA;

  // Check if vault access is granted
  if (!permissionsToMe.canAccessVault) {
    return {
      canAccess: false,
      permissions: permissionsToMe,
      reason: "Vault access not granted",
    };
  }

  // Check life status based access (future: implement conditional access)
  // For now, if canAccessVault is true, allow access

  return {
    canAccess: true,
    permissions: permissionsToMe,
  };
}

/**
 * Get users whose vaults I can access
 */
export async function getAccessibleVaults(userId: string): Promise<Array<{
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    lifeStatus: string;
  };
  permissions: AccessPermissions;
}>> {
  const connections = await getConnections(userId);

  return connections
    .filter((conn) => conn.theirPermissionsToMe.canAccessVault)
    .map((conn) => ({
      user: conn.connectedUser,
      permissions: conn.theirPermissionsToMe,
    }));
}

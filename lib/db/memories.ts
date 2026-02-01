// ════════════════════════════════════════════════════════════════════════════
// MEMORIES DATABASE SERVICES
// ════════════════════════════════════════════════════════════════════════════

import { prisma } from "./index";
import type { Memory, Album, Prisma } from "@prisma/client";

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export type CreateMemoryInput = {
  userId: string;
  title: string;
  description?: string;
  mediaType?: "image" | "video";
  mediaUrl: string;
  thumbnailUrl?: string;
  fileSize?: number;
  dateTaken?: Date;
  location?: string;
  tags?: string[];
  people?: string[];
  albumId?: string;
  isPrivate?: boolean;
};

export type UpdateMemoryInput = Partial<
  Pick<Memory, "title" | "description" | "dateTaken" | "location" | "tags" | "people" | "albumId" | "isPrivate" | "isFavorite">
>;

export type MemoryWithAlbum = Memory & {
  album: Album | null;
};

// ────────────────────────────────────────────────────────────────────────────
// MEMORY CRUD
// ────────────────────────────────────────────────────────────────────────────

/**
 * Create a new memory
 */
export async function createMemory(data: CreateMemoryInput): Promise<Memory> {
  return prisma.memory.create({
    data: {
      ...data,
      tags: data.tags ?? [],
      people: data.people ?? [],
    },
  });
}

/**
 * Find memory by ID
 */
export async function findMemoryById(id: string): Promise<MemoryWithAlbum | null> {
  return prisma.memory.findUnique({
    where: { id },
    include: { album: true },
  });
}

/**
 * Find user's memory by ID
 */
export async function findUserMemory(
  id: string,
  userId: string
): Promise<Memory | null> {
  return prisma.memory.findFirst({
    where: { id, userId },
  });
}

/**
 * Get all memories for a user
 */
export async function getUserMemories(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    albumId?: string;
    isFavorite?: boolean;
    orderBy?: "newest" | "oldest" | "dateTaken";
  }
): Promise<Memory[]> {
  const orderByMap: Record<string, Prisma.MemoryOrderByWithRelationInput> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    dateTaken: { dateTaken: "desc" },
  };

  return prisma.memory.findMany({
    where: {
      userId,
      albumId: options?.albumId,
      isFavorite: options?.isFavorite,
    },
    orderBy: orderByMap[options?.orderBy ?? "newest"],
    take: options?.limit,
    skip: options?.offset,
  });
}

/**
 * Get favorite memories
 */
export async function getFavoriteMemories(
  userId: string,
  limit?: number
): Promise<Memory[]> {
  return prisma.memory.findMany({
    where: { userId, isFavorite: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Search memories
 */
export async function searchMemories(
  userId: string,
  query: string,
  options?: { limit?: number }
): Promise<Memory[]> {
  return prisma.memory.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
        { tags: { hasSome: [query] } },
        { people: { hasSome: [query] } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit,
  });
}

/**
 * Update a memory
 */
export async function updateMemory(
  id: string,
  userId: string,
  data: UpdateMemoryInput
): Promise<Memory | null> {
  try {
    return await prisma.memory.update({
      where: { id, userId },
      data,
    });
  } catch {
    return null;
  }
}

/**
 * Toggle favorite status
 */
export async function toggleMemoryFavorite(
  id: string,
  userId: string
): Promise<Memory | null> {
  const memory = await findUserMemory(id, userId);
  if (!memory) return null;

  return prisma.memory.update({
    where: { id },
    data: { isFavorite: !memory.isFavorite },
  });
}

/**
 * Delete a memory
 */
export async function deleteMemory(id: string, userId: string): Promise<boolean> {
  try {
    await prisma.memory.delete({
      where: { id, userId },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get memory count
 */
export async function getMemoryCount(userId: string): Promise<number> {
  return prisma.memory.count({ where: { userId } });
}

// ────────────────────────────────────────────────────────────────────────────
// ALBUM CRUD
// ────────────────────────────────────────────────────────────────────────────

export type CreateAlbumInput = {
  userId: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
};

/**
 * Create a new album
 */
export async function createAlbum(data: CreateAlbumInput): Promise<Album> {
  return prisma.album.create({ data });
}

/**
 * Get user's albums
 */
export async function getUserAlbums(userId: string): Promise<(Album & { _count: { memories: number } })[]> {
  return prisma.album.findMany({
    where: { userId },
    include: { _count: { select: { memories: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get album with memories
 */
export async function getAlbumWithMemories(
  id: string,
  userId: string
): Promise<(Album & { memories: Memory[] }) | null> {
  return prisma.album.findFirst({
    where: { id, userId },
    include: { memories: { orderBy: { createdAt: "desc" } } },
  });
}

/**
 * Update album
 */
export async function updateAlbum(
  id: string,
  userId: string,
  data: Partial<Pick<Album, "name" | "description" | "coverImageUrl">>
): Promise<Album | null> {
  try {
    // First verify ownership
    const album = await prisma.album.findFirst({ where: { id, userId } });
    if (!album) return null;

    return await prisma.album.update({
      where: { id },
      data,
    });
  } catch {
    return null;
  }
}

/**
 * Delete album (memories are not deleted, just unlinked)
 */
export async function deleteAlbum(id: string, userId: string): Promise<boolean> {
  try {
    const album = await prisma.album.findFirst({ where: { id, userId } });
    if (!album) return false;

    // Unlink memories from album
    await prisma.memory.updateMany({
      where: { albumId: id },
      data: { albumId: null },
    });

    await prisma.album.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/**
 * Add memory to album
 */
export async function addMemoryToAlbum(
  memoryId: string,
  albumId: string,
  userId: string
): Promise<boolean> {
  try {
    // Verify ownership of both
    const [memory, album] = await Promise.all([
      prisma.memory.findFirst({ where: { id: memoryId, userId } }),
      prisma.album.findFirst({ where: { id: albumId, userId } }),
    ]);

    if (!memory || !album) return false;

    await prisma.memory.update({
      where: { id: memoryId },
      data: { albumId },
    });
    return true;
  } catch {
    return false;
  }
}

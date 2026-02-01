// ════════════════════════════════════════════════════════════════════════════
// STORIES DATABASE SERVICES
// ════════════════════════════════════════════════════════════════════════════

import { prisma } from "./index";
import type { Story, Prisma } from "@prisma/client";

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export type StoryCategory = "life" | "wisdom" | "memories" | "advice" | "traditions";
export type StoryStatus = "draft" | "published" | "archived";

export type CreateStoryInput = {
  userId: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: StoryCategory;
  tags?: string[];
  coverImageUrl?: string;
  status?: StoryStatus;
  isPrivate?: boolean;
};

export type UpdateStoryInput = {
  title?: string;
  content?: string;
  excerpt?: string | null;
  category?: StoryCategory;
  tags?: string[];
  coverImageUrl?: string | null;
  status?: StoryStatus;
  isPrivate?: boolean;
  publishedAt?: Date | null;
};

// ────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Calculate word count from content
 */
function calculateWordCount(content: string): number {
  // Remove HTML tags and count words
  const text = content.replace(/<[^>]*>/g, " ");
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
}

/**
 * Calculate read time in minutes (average 200 words per minute)
 */
function calculateReadTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Generate excerpt from content
 */
function generateExcerpt(content: string, maxLength: number = 150): string {
  const text = content.replace(/<[^>]*>/g, " ");
  if (text.length <= maxLength) return text.trim();
  return text.substring(0, maxLength).trim() + "...";
}

// ────────────────────────────────────────────────────────────────────────────
// CRUD OPERATIONS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Create a new story
 */
export async function createStory(data: CreateStoryInput): Promise<Story> {
  const wordCount = calculateWordCount(data.content);
  const readTime = calculateReadTime(wordCount);
  const excerpt = data.excerpt || generateExcerpt(data.content);

  return prisma.story.create({
    data: {
      ...data,
      excerpt,
      wordCount,
      readTime,
      tags: data.tags ?? [],
      category: data.category ?? "life",
      status: data.status ?? "draft",
    },
  });
}

/**
 * Find story by ID
 */
export async function findStoryById(id: string): Promise<Story | null> {
  return prisma.story.findUnique({
    where: { id },
  });
}

/**
 * Find user's story by ID
 */
export async function findUserStory(
  id: string,
  userId: string
): Promise<Story | null> {
  return prisma.story.findFirst({
    where: { id, userId },
  });
}

/**
 * Get all stories for a user
 */
export async function getUserStories(
  userId: string,
  options?: {
    status?: StoryStatus;
    category?: StoryCategory;
    limit?: number;
    offset?: number;
    orderBy?: "newest" | "oldest" | "title";
  }
): Promise<Story[]> {
  const orderByMap: Record<string, Prisma.StoryOrderByWithRelationInput> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    title: { title: "asc" },
  };

  return prisma.story.findMany({
    where: {
      userId,
      status: options?.status,
      category: options?.category,
    },
    orderBy: orderByMap[options?.orderBy ?? "newest"],
    take: options?.limit,
    skip: options?.offset,
  });
}

/**
 * Get published stories for a user
 */
export async function getPublishedStories(
  userId: string,
  options?: { limit?: number }
): Promise<Story[]> {
  return prisma.story.findMany({
    where: { userId, status: "published" },
    orderBy: { publishedAt: "desc" },
    take: options?.limit,
  });
}

/**
 * Search stories
 */
export async function searchStories(
  userId: string,
  query: string,
  options?: { limit?: number }
): Promise<Story[]> {
  return prisma.story.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { tags: { hasSome: [query] } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit,
  });
}

/**
 * Update a story
 */
export async function updateStory(
  id: string,
  userId: string,
  data: UpdateStoryInput
): Promise<Story | null> {
  try {
    const story = await prisma.story.findFirst({ where: { id, userId } });
    if (!story) return null;

    // Recalculate word count and read time if content changed
    let wordCount = story.wordCount;
    let readTime = story.readTime;
    let excerpt = data.excerpt;

    if (data.content) {
      wordCount = calculateWordCount(data.content);
      readTime = calculateReadTime(wordCount);
      if (!data.excerpt) {
        excerpt = generateExcerpt(data.content);
      }
    }

    // Set publishedAt when publishing
    let publishedAt = data.publishedAt;
    if (data.status === "published" && story.status !== "published") {
      publishedAt = new Date();
    }

    return await prisma.story.update({
      where: { id },
      data: {
        ...data,
        wordCount,
        readTime,
        excerpt,
        publishedAt,
      },
    });
  } catch {
    return null;
  }
}

/**
 * Publish a story
 */
export async function publishStory(
  id: string,
  userId: string
): Promise<Story | null> {
  const story = await findUserStory(id, userId);
  if (!story) return null;

  return prisma.story.update({
    where: { id },
    data: {
      status: "published",
      publishedAt: new Date(),
    },
  });
}

/**
 * Unpublish (draft) a story
 */
export async function unpublishStory(
  id: string,
  userId: string
): Promise<Story | null> {
  const story = await findUserStory(id, userId);
  if (!story) return null;

  return prisma.story.update({
    where: { id },
    data: {
      status: "draft",
    },
  });
}

/**
 * Archive a story
 */
export async function archiveStory(
  id: string,
  userId: string
): Promise<Story | null> {
  const story = await findUserStory(id, userId);
  if (!story) return null;

  return prisma.story.update({
    where: { id },
    data: {
      status: "archived",
    },
  });
}

/**
 * Delete a story
 */
export async function deleteStory(id: string, userId: string): Promise<boolean> {
  try {
    const story = await prisma.story.findFirst({ where: { id, userId } });
    if (!story) return false;

    await prisma.story.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get story count
 */
export async function getStoryCount(
  userId: string,
  status?: StoryStatus
): Promise<number> {
  return prisma.story.count({
    where: { userId, status },
  });
}

/**
 * Get stories by category
 */
export async function getStoriesByCategory(
  userId: string,
  category: StoryCategory,
  options?: { limit?: number }
): Promise<Story[]> {
  return prisma.story.findMany({
    where: { userId, category },
    orderBy: { createdAt: "desc" },
    take: options?.limit,
  });
}

/**
 * Get recent draft stories
 */
export async function getRecentDrafts(
  userId: string,
  limit: number = 5
): Promise<Story[]> {
  return prisma.story.findMany({
    where: { userId, status: "draft" },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

/**
 * Get total word count across all stories
 */
export async function getTotalWordCount(userId: string): Promise<number> {
  const result = await prisma.story.aggregate({
    where: { userId },
    _sum: { wordCount: true },
  });
  return result._sum.wordCount ?? 0;
}

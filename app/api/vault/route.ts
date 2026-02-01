import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createVaultItem,
  getUserVaultItems,
  searchVaultItems,
  getVaultItemCount,
  getVaultItemCountByCategory,
  VaultCategory,
  VaultImportance,
} from "@/lib/db/vault";
import { z } from "zod";

// Validation schema for creating vault items
const createVaultItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(["finance", "identity", "insurance", "subscription", "property", "other"]),
  encryptedData: z.string().optional(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().max(255).optional(),
  fileSize: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  importance: z.enum(["low", "normal", "high", "critical"]).optional(),
  expiryDate: z.string().datetime().optional(),
  reminderDate: z.string().datetime().optional(),
});

// GET /api/vault - List all vault items for the current user
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const category = searchParams.get("category") as VaultCategory | undefined;
  const importance = searchParams.get("importance") as VaultImportance | undefined;
  const search = searchParams.get("search") || undefined;
  const countOnly = searchParams.get("countOnly") === "true";

  try {
    // If only counts are needed
    if (countOnly) {
      const counts = await getVaultItemCountByCategory(user.id);
      const total = await getVaultItemCount(user.id);
      return NextResponse.json({ counts, total });
    }

    // If search query, use search function
    if (search) {
      const items = await searchVaultItems(user.id, search, { limit });
      return NextResponse.json({ items, total: items.length });
    }

    const [items, total] = await Promise.all([
      getUserVaultItems(user.id, {
        category,
        importance,
        limit,
        offset: (page - 1) * limit,
      }),
      getVaultItemCount(user.id),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching vault items:", error);
    return NextResponse.json(
      { error: "Failed to fetch vault items" },
      { status: 500 }
    );
  }
}

// POST /api/vault - Create a new vault item
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = createVaultItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { expiryDate, reminderDate, ...data } = validation.data;

    const vaultItem = await createVaultItem({
      ...data,
      userId: user.id,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      reminderDate: reminderDate ? new Date(reminderDate) : undefined,
    });

    return NextResponse.json(vaultItem, { status: 201 });
  } catch (error) {
    console.error("Error creating vault item:", error);
    return NextResponse.json(
      { error: "Failed to create vault item" },
      { status: 500 }
    );
  }
}

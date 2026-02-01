import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createFamilyMember,
  getUserFamilyMembers,
  searchFamilyMembers,
  getFamilyMemberCount,
} from "@/lib/db/family-members";
import { z } from "zod";

// Validation schema for creating family members
const createFamilyMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  relationship: z.string().min(1, "Relationship is required").max(50),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  avatar: z.string().url().optional(),
  accessLevel: z.enum(["viewer", "editor", "executor"]).optional(),
  canAccessVoice: z.boolean().optional(),
  canAccessMemories: z.boolean().optional(),
  canAccessStories: z.boolean().optional(),
  canAccessVault: z.boolean().optional(),
  canAccessLegacy: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

// GET /api/family - List all family members for the current user
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || undefined;
  const relationship = searchParams.get("relationship") || undefined;
  const accessLevel = searchParams.get("accessLevel") || undefined;

  try {
    // If search query, use search function
    if (search) {
      const members = await searchFamilyMembers(user.id, search);
      return NextResponse.json({ members, total: members.length });
    }

    const [members, total] = await Promise.all([
      getUserFamilyMembers(user.id, { relationship, accessLevel }),
      getFamilyMemberCount(user.id),
    ]);

    return NextResponse.json({ members, total });
  } catch (error) {
    console.error("Error fetching family members:", error);
    return NextResponse.json(
      { error: "Failed to fetch family members" },
      { status: 500 }
    );
  }
}

// POST /api/family - Create a new family member
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = createFamilyMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Clean up empty email
    const { email, ...rest } = validation.data;
    const memberData = {
      ...rest,
      email: email || undefined,
      userId: user.id,
    };

    const member = await createFamilyMember(memberData);

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error creating family member:", error);
    return NextResponse.json(
      { error: "Failed to create family member" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for identity documents
const createIdentityDocSchema = z.object({
  type: z.enum(["aadhaar", "pan", "passport", "driving", "voter", "other"]),
  name: z.string().min(1),
  documentNumber: z.string().min(1),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
  issuingCountry: z.string().optional(),
  issuingAuthority: z.string().optional(),
});

// GET /api/vault/identity - Get all identity documents for current user
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const documents = await prisma.vaultItem.findMany({
      where: {
        userId: user.id,
        category: "identity",
        isArchived: false,
      },
      include: {
        identityDoc: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching identity documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST /api/vault/identity - Create a new identity document
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = createIdentityDocSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Create VaultItem and IdentityDocument in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the vault item
      const vaultItem = await tx.vaultItem.create({
        data: {
          userId: user.id,
          name: data.name,
          description: data.notes || null,
          category: "identity",
          importance: "high",
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        },
      });

      // Create the identity document
      const identityDoc = await tx.identityDocument.create({
        data: {
          vaultItemId: vaultItem.id,
          type: data.type,
          documentNumber: data.documentNumber,
          issuingCountry: data.issuingCountry || "India",
          issuingAuthority: data.issuingAuthority,
          issueDate: data.issueDate ? new Date(data.issueDate) : null,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        },
      });

      return { ...vaultItem, identityDoc };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating identity document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for updating identity documents
const updateIdentityDocSchema = z.object({
  type: z.enum(["aadhaar", "pan", "passport", "driving", "voter", "other"]).optional(),
  name: z.string().min(1).optional(),
  documentNumber: z.string().min(1).optional(),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  issuingCountry: z.string().optional(),
  issuingAuthority: z.string().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/vault/identity/[id] - Get a specific identity document
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const document = await prisma.vaultItem.findFirst({
      where: {
        id,
        userId: user.id,
        category: "identity",
      },
      include: {
        identityDoc: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching identity document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

// PUT /api/vault/identity/[id] - Update an identity document
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check ownership
    const existing = await prisma.vaultItem.findFirst({
      where: {
        id,
        userId: user.id,
        category: "identity",
      },
      include: {
        identityDoc: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateIdentityDocSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Update both VaultItem and IdentityDocument in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update vault item
      const vaultItem = await tx.vaultItem.update({
        where: { id },
        data: {
          name: data.name,
          description: data.notes,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : data.expiryDate === null ? null : undefined,
        },
      });

      // Update identity document if exists
      if (existing.identityDoc) {
        await tx.identityDocument.update({
          where: { id: existing.identityDoc.id },
          data: {
            type: data.type,
            documentNumber: data.documentNumber,
            issuingCountry: data.issuingCountry,
            issuingAuthority: data.issuingAuthority,
            issueDate: data.issueDate ? new Date(data.issueDate) : data.issueDate === null ? null : undefined,
            expiryDate: data.expiryDate ? new Date(data.expiryDate) : data.expiryDate === null ? null : undefined,
          },
        });
      }

      // Fetch updated document
      return tx.vaultItem.findUnique({
        where: { id },
        include: { identityDoc: true },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating identity document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

// DELETE /api/vault/identity/[id] - Delete an identity document
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check ownership
    const existing = await prisma.vaultItem.findFirst({
      where: {
        id,
        userId: user.id,
        category: "identity",
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete vault item (cascades to identity doc)
    await prisma.vaultItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting identity document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

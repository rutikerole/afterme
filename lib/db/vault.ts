// ════════════════════════════════════════════════════════════════════════════
// VAULT DATABASE SERVICES
// ════════════════════════════════════════════════════════════════════════════

import { prisma } from "./index";
import type { VaultItem, FinanceItem, IdentityDocument, InsurancePolicy, Subscription, Property } from "@prisma/client";

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export type VaultCategory = "finance" | "identity" | "insurance" | "subscription" | "property" | "other";
export type VaultImportance = "low" | "normal" | "high" | "critical";

export type CreateVaultItemInput = {
  userId: string;
  name: string;
  description?: string;
  category: VaultCategory;
  encryptedData?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  tags?: string[];
  importance?: VaultImportance;
  expiryDate?: Date;
  reminderDate?: Date;
};

export type UpdateVaultItemInput = {
  name?: string;
  description?: string | null;
  category?: VaultCategory;
  encryptedData?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  tags?: string[];
  importance?: VaultImportance;
  expiryDate?: Date | null;
  reminderDate?: Date | null;
};

export type VaultItemWithDetails = VaultItem & {
  financeItem?: FinanceItem | null;
  identityDoc?: IdentityDocument | null;
  insurancePolicy?: InsurancePolicy | null;
  subscription?: Subscription | null;
  property?: Property | null;
};

// ────────────────────────────────────────────────────────────────────────────
// VAULT ITEM CRUD
// ────────────────────────────────────────────────────────────────────────────

/**
 * Create a new vault item
 */
export async function createVaultItem(data: CreateVaultItemInput): Promise<VaultItem> {
  return prisma.vaultItem.create({
    data: {
      ...data,
      tags: data.tags ?? [],
      importance: data.importance ?? "normal",
    },
  });
}

/**
 * Find vault item by ID
 */
export async function findVaultItemById(id: string): Promise<VaultItemWithDetails | null> {
  return prisma.vaultItem.findUnique({
    where: { id },
    include: {
      financeItem: true,
      identityDoc: true,
      insurancePolicy: true,
      subscription: true,
      property: true,
    },
  });
}

/**
 * Find user's vault item by ID
 */
export async function findUserVaultItem(
  id: string,
  userId: string
): Promise<VaultItem | null> {
  return prisma.vaultItem.findFirst({
    where: { id, userId },
  });
}

/**
 * Get all vault items for a user
 */
export async function getUserVaultItems(
  userId: string,
  options?: {
    category?: VaultCategory;
    importance?: VaultImportance;
    limit?: number;
    offset?: number;
  }
): Promise<VaultItemWithDetails[]> {
  return prisma.vaultItem.findMany({
    where: {
      userId,
      category: options?.category,
      importance: options?.importance,
    },
    include: {
      financeItem: true,
      identityDoc: true,
      insurancePolicy: true,
      subscription: true,
      property: true,
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit,
    skip: options?.offset,
  });
}

/**
 * Search vault items
 */
export async function searchVaultItems(
  userId: string,
  query: string,
  options?: { limit?: number }
): Promise<VaultItem[]> {
  return prisma.vaultItem.findMany({
    where: {
      userId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { tags: { hasSome: [query] } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit,
  });
}

/**
 * Update a vault item
 */
export async function updateVaultItem(
  id: string,
  userId: string,
  data: UpdateVaultItemInput
): Promise<VaultItem | null> {
  try {
    const item = await prisma.vaultItem.findFirst({ where: { id, userId } });
    if (!item) return null;

    return await prisma.vaultItem.update({
      where: { id },
      data,
    });
  } catch {
    return null;
  }
}

/**
 * Delete a vault item
 */
export async function deleteVaultItem(id: string, userId: string): Promise<boolean> {
  try {
    const item = await prisma.vaultItem.findFirst({ where: { id, userId } });
    if (!item) return false;

    await prisma.vaultItem.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get vault item count by category
 */
export async function getVaultItemCountByCategory(
  userId: string
): Promise<Record<string, number>> {
  const counts = await prisma.vaultItem.groupBy({
    by: ["category"],
    where: { userId },
    _count: true,
  });

  return counts.reduce((acc, item) => {
    acc[item.category] = item._count;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Get expiring items (within specified days)
 */
export async function getExpiringVaultItems(
  userId: string,
  daysAhead: number = 30
): Promise<VaultItem[]> {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return prisma.vaultItem.findMany({
    where: {
      userId,
      expiryDate: {
        lte: futureDate,
        gte: new Date(),
      },
    },
    orderBy: { expiryDate: "asc" },
  });
}

// ────────────────────────────────────────────────────────────────────────────
// FINANCE ITEMS
// ────────────────────────────────────────────────────────────────────────────

export type CreateFinanceItemInput = {
  vaultItemId: string;
  type: string;
  institutionName: string;
  accountNumber?: string;
  currency?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
};

/**
 * Create finance item (linked to vault item)
 */
export async function createFinanceItem(data: CreateFinanceItemInput): Promise<FinanceItem> {
  return prisma.financeItem.create({
    data: {
      ...data,
      currency: data.currency ?? "USD",
    },
  });
}

/**
 * Update finance item
 */
export async function updateFinanceItem(
  id: string,
  data: Partial<Omit<CreateFinanceItemInput, "vaultItemId">>
): Promise<FinanceItem | null> {
  try {
    return await prisma.financeItem.update({
      where: { id },
      data,
    });
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// IDENTITY DOCUMENTS
// ────────────────────────────────────────────────────────────────────────────

export type CreateIdentityDocumentInput = {
  vaultItemId: string;
  type: string;
  documentNumber?: string;
  issuingCountry?: string;
  issuingAuthority?: string;
  issueDate?: Date;
  expiryDate?: Date;
};

/**
 * Create identity document
 */
export async function createIdentityDocument(
  data: CreateIdentityDocumentInput
): Promise<IdentityDocument> {
  return prisma.identityDocument.create({ data });
}

/**
 * Update identity document
 */
export async function updateIdentityDocument(
  id: string,
  data: Partial<Omit<CreateIdentityDocumentInput, "vaultItemId">>
): Promise<IdentityDocument | null> {
  try {
    return await prisma.identityDocument.update({
      where: { id },
      data,
    });
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// INSURANCE POLICIES
// ────────────────────────────────────────────────────────────────────────────

export type CreateInsurancePolicyInput = {
  vaultItemId: string;
  type: string;
  provider: string;
  policyNumber?: string;
  coverageAmount?: number;
  premium?: number;
  premiumFrequency?: string;
  startDate?: Date;
  endDate?: Date;
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
};

/**
 * Create insurance policy
 */
export async function createInsurancePolicy(
  data: CreateInsurancePolicyInput
): Promise<InsurancePolicy> {
  return prisma.insurancePolicy.create({ data });
}

/**
 * Update insurance policy
 */
export async function updateInsurancePolicy(
  id: string,
  data: Partial<Omit<CreateInsurancePolicyInput, "vaultItemId">>
): Promise<InsurancePolicy | null> {
  try {
    return await prisma.insurancePolicy.update({
      where: { id },
      data,
    });
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTIONS
// ────────────────────────────────────────────────────────────────────────────

export type CreateSubscriptionInput = {
  vaultItemId: string;
  serviceName: string;
  category: string; // streaming, software, membership, utility, other
  amount?: number;
  currency?: string;
  billingCycle?: string;
  nextBillingDate?: Date;
  accountEmail?: string;
  website?: string;
  cancellationUrl?: string;
  cancellationInstructions?: string;
  isAutoRenew?: boolean;
};

/**
 * Create subscription
 */
export async function createSubscription(
  data: CreateSubscriptionInput
): Promise<Subscription> {
  return prisma.subscription.create({ data });
}

/**
 * Update subscription
 */
export async function updateSubscription(
  id: string,
  data: Partial<Omit<CreateSubscriptionInput, "vaultItemId">>
): Promise<Subscription | null> {
  try {
    return await prisma.subscription.update({
      where: { id },
      data,
    });
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// PROPERTIES
// ────────────────────────────────────────────────────────────────────────────

export type CreatePropertyInput = {
  vaultItemId: string;
  type: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  currentValue?: number;
  ownershipType?: string;
  propertyTax?: number;
  taxDueDate?: Date;
};

/**
 * Create property
 */
export async function createProperty(data: CreatePropertyInput): Promise<Property> {
  return prisma.property.create({ data });
}

/**
 * Update property
 */
export async function updateProperty(
  id: string,
  data: Partial<Omit<CreatePropertyInput, "vaultItemId">>
): Promise<Property | null> {
  try {
    return await prisma.property.update({
      where: { id },
      data,
    });
  } catch {
    return null;
  }
}

/**
 * Get total vault item count
 */
export async function getVaultItemCount(userId: string): Promise<number> {
  return prisma.vaultItem.count({ where: { userId } });
}

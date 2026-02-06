/**
 * Seed script for vault identity documents
 * Run with: npx tsx scripts/seed-vault-data.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sample identity documents for each family member
const FAMILY_DOCUMENTS = {
  "father@gmail.com": {
    name: "Father Test",
    documents: [
      {
        type: "aadhaar",
        name: "Aadhaar Card",
        documentNumber: "4567-8901-2345",
        notes: "Original kept in bank locker",
      },
      {
        type: "pan",
        name: "PAN Card",
        documentNumber: "ABCDE1234F",
        notes: "Digital copy saved",
      },
      {
        type: "passport",
        name: "Passport",
        documentNumber: "J1234567",
        issueDate: "2020-03-15",
        expiryDate: "2030-03-14",
        issuingAuthority: "Passport Office Mumbai",
      },
      {
        type: "driving",
        name: "Driving License",
        documentNumber: "MH01-2018-0012345",
        issueDate: "2018-06-20",
        expiryDate: "2038-06-19",
        issuingAuthority: "RTO Mumbai",
      },
      {
        type: "voter",
        name: "Voter ID",
        documentNumber: "XYZ1234567",
        notes: "Updated address 2022",
      },
    ],
  },
  "mother@gmail.com": {
    name: "Mother Test",
    documents: [
      {
        type: "aadhaar",
        name: "Aadhaar Card",
        documentNumber: "5678-9012-3456",
        notes: "Updated mobile number linked",
      },
      {
        type: "pan",
        name: "PAN Card",
        documentNumber: "BCDEF2345G",
        notes: "Joint account holder",
      },
      {
        type: "passport",
        name: "Passport",
        documentNumber: "K2345678",
        issueDate: "2019-08-10",
        expiryDate: "2029-08-09",
        issuingAuthority: "Passport Office Pune",
      },
      {
        type: "voter",
        name: "Voter ID",
        documentNumber: "ABC9876543",
        notes: "Constituency: Mumbai North",
      },
    ],
  },
  "sister@gmail.com": {
    name: "Sister Test",
    documents: [
      {
        type: "aadhaar",
        name: "Aadhaar Card",
        documentNumber: "6789-0123-4567",
        notes: "College ID linked",
      },
      {
        type: "pan",
        name: "PAN Card",
        documentNumber: "CDEFG3456H",
      },
      {
        type: "passport",
        name: "Passport",
        documentNumber: "L3456789",
        issueDate: "2022-01-20",
        expiryDate: "2032-01-19",
        issuingAuthority: "Passport Office Mumbai",
      },
      {
        type: "driving",
        name: "Driving License",
        documentNumber: "MH02-2023-0098765",
        issueDate: "2023-02-15",
        expiryDate: "2043-02-14",
        issuingAuthority: "RTO Thane",
        notes: "Learner's license - 2 wheeler only",
      },
    ],
  },
  "brother@gmail.com": {
    name: "Brother Test (Rutik)",
    documents: [
      {
        type: "aadhaar",
        name: "Aadhaar Card",
        documentNumber: "7890-1234-5678",
        notes: "Biometric update done 2024",
      },
      {
        type: "pan",
        name: "PAN Card",
        documentNumber: "DEFGH4567I",
        notes: "Linked with bank accounts",
      },
      {
        type: "passport",
        name: "Passport",
        documentNumber: "M4567890",
        issueDate: "2021-05-10",
        expiryDate: "2031-05-09",
        issuingAuthority: "Passport Office Mumbai",
        notes: "ECNR passport",
      },
      {
        type: "driving",
        name: "Driving License",
        documentNumber: "MH01-2021-0054321",
        issueDate: "2021-08-25",
        expiryDate: "2041-08-24",
        issuingAuthority: "RTO Mumbai Central",
        notes: "4 wheeler + 2 wheeler",
      },
      {
        type: "voter",
        name: "Voter ID",
        documentNumber: "DEF5432109",
        notes: "First-time voter 2024",
      },
    ],
  },
};

async function main() {
  console.log("🌱 Seeding vault identity documents...\n");

  for (const [email, data] of Object.entries(FAMILY_DOCUMENTS)) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`⚠️  User ${email} not found, skipping...`);
      continue;
    }

    console.log(`\n📄 Adding documents for ${data.name}...`);

    for (const doc of data.documents) {
      // Check if document already exists
      const existingDoc = await prisma.vaultItem.findFirst({
        where: {
          userId: user.id,
          category: "identity",
          identityDoc: {
            type: doc.type,
          },
        },
      });

      if (existingDoc) {
        console.log(`   ⏭️  ${doc.name} already exists, skipping...`);
        continue;
      }

      // Create vault item and identity document
      await prisma.$transaction(async (tx) => {
        const vaultItem = await tx.vaultItem.create({
          data: {
            userId: user.id,
            name: doc.name,
            description: doc.notes || null,
            category: "identity",
            importance: "high",
            expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
          },
        });

        await tx.identityDocument.create({
          data: {
            vaultItemId: vaultItem.id,
            type: doc.type,
            documentNumber: doc.documentNumber,
            issuingCountry: "India",
            issuingAuthority: doc.issuingAuthority || null,
            issueDate: doc.issueDate ? new Date(doc.issueDate) : null,
            expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
          },
        });
      });

      console.log(`   ✅ Added ${doc.name} (${doc.documentNumber})`);
    }
  }

  console.log("\n🎉 Vault identity documents seeded successfully!");
  console.log("\n📋 Summary:");
  console.log("─".repeat(50));

  for (const [email, data] of Object.entries(FAMILY_DOCUMENTS)) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const count = await prisma.vaultItem.count({
        where: { userId: user.id, category: "identity" },
      });
      console.log(`   ${data.name}: ${count} identity documents`);
    }
  }

  console.log("─".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Error seeding vault data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

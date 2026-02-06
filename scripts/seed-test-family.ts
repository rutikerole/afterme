/**
 * Seed script for test family accounts
 * Run with: npx ts-node scripts/seed-test-family.ts
 * Or: npx tsx scripts/seed-test-family.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEST_USERS = [
  {
    email: "father@gmail.com",
    password: "Father@123",
    name: "Father Test",
  },
  {
    email: "mother@gmail.com",
    password: "Mother@123",
    name: "Mother Test",
  },
  {
    email: "sister@gmail.com",
    password: "Sister@123",
    name: "Sister Test",
  },
  {
    email: "brother@gmail.com",
    password: "Brother@123",
    name: "Brother Test",
  },
];

async function main() {
  console.log("🌱 Seeding test family accounts...\n");

  for (const userData of TEST_USERS) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`⚠️  User ${userData.email} already exists, skipping...`);
      continue;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        name: userData.name,
        emailVerified: true, // Pre-verify for testing
        isActive: true,
      },
    });

    // Create user settings
    await prisma.userSettings.create({
      data: {
        userId: user.id,
      },
    });

    console.log(`✅ Created user: ${userData.name} (${userData.email})`);
  }

  console.log("\n🎉 Test family accounts seeded successfully!");
  console.log("\n📋 Test Accounts:");
  console.log("─".repeat(50));
  for (const user of TEST_USERS) {
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log("─".repeat(50));
  }

  console.log("\n📝 Test Flow:");
  console.log("1. Register as primary user (Rutik) at /auth/register");
  console.log("2. Go to /dashboard/family and send invites to test accounts");
  console.log("3. Login as each test account and accept invites");
  console.log("4. Verify bidirectional connections are created");
  console.log("5. Test vault access permissions");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding test accounts:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

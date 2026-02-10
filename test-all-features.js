// Comprehensive API Test Script for AfterMe
const BASE_URL = "http://localhost:3000";

let sessionCookie = null;
let testUserId = null;

// Helper for making API requests
async function api(method, path, body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (sessionCookie) {
    options.headers["Cookie"] = sessionCookie;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);

  // Capture session cookie from login
  const setCookie = response.headers.get("set-cookie");
  if (setCookie && setCookie.includes("session=")) {
    sessionCookie = setCookie.split(";")[0];
  }

  // Handle non-JSON responses
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    return { status: response.status, data: { error: "Non-JSON response", text: text.substring(0, 200) } };
  }

  const data = await response.json();
  return { status: response.status, data };
}

// Test utilities
function log(section, message, status = "info") {
  const icons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
  console.log(`${icons[status]} [${section}] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ================================
// AUTHENTICATION TESTS
// ================================
async function testAuth() {
  console.log("\n" + "=".repeat(60));
  console.log("🔐 TESTING AUTHENTICATION");
  console.log("=".repeat(60));

  // Create test user
  const testEmail = `test_${Date.now()}@afterme.test`;
  const testPassword = "TestPassword123!";

  log("Auth", "Creating test user...");
  const signupRes = await api("POST", "/api/auth/register", {
    name: "Test User",
    email: testEmail,
    password: testPassword,
  });

  if (signupRes.status === 201 || signupRes.status === 200) {
    log("Auth", `User created: ${testEmail}`, "success");
    testUserId = signupRes.data.user?.id;
  } else {
    log("Auth", `Signup failed: ${JSON.stringify(signupRes.data)}`, "error");

    // Try logging in with existing test user
    log("Auth", "Trying to log in with existing credentials...");
  }

  // Login
  log("Auth", "Logging in...");
  const loginRes = await api("POST", "/api/auth/login", {
    email: testEmail,
    password: testPassword,
  });

  if (loginRes.status === 200) {
    log("Auth", "Login successful", "success");
    testUserId = loginRes.data.user?.id;
  } else {
    log("Auth", `Login failed: ${JSON.stringify(loginRes.data)}`, "error");
    throw new Error("Cannot proceed without authentication");
  }

  // Verify session
  log("Auth", "Verifying session...");
  const meRes = await api("GET", "/api/auth/me");
  if (meRes.status === 200) {
    log("Auth", `Session valid for: ${meRes.data.user?.name}`, "success");
  } else {
    log("Auth", "Session verification failed", "error");
  }

  return { email: testEmail, password: testPassword };
}

// ================================
// FAMILY MEMBERS TESTS
// ================================
async function testFamilyMembers() {
  console.log("\n" + "=".repeat(60));
  console.log("👨‍👩‍👧‍👦 TESTING FAMILY MEMBERS");
  console.log("=".repeat(60));

  const familyMembers = [
    { name: "John Doe (Father)", relationship: "father", email: "father@test.com", phone: "+1234567890" },
    { name: "Jane Doe (Mother)", relationship: "mother", email: "mother@test.com", phone: "+1234567891" },
    { name: "Sarah Doe (Sister)", relationship: "sister", email: "sister@test.com", phone: "+1234567892" },
    { name: "Mike Doe (Brother)", relationship: "brother", email: "brother@test.com", phone: "+1234567893" },
    { name: "Emma Doe (Daughter)", relationship: "daughter", email: "daughter@test.com", phone: "+1234567894" },
  ];

  const createdMembers = [];

  for (const member of familyMembers) {
    log("Family", `Creating: ${member.name}...`);
    const res = await api("POST", "/api/family", member);

    if (res.status === 201 || res.status === 200) {
      log("Family", `Created: ${member.name}`, "success");
      // API returns member directly or in familyMember field
      const created = res.data.familyMember || res.data.member || res.data;
      if (created.id) {
        createdMembers.push(created);
      }
    } else {
      log("Family", `Failed to create ${member.name}: ${JSON.stringify(res.data)}`, "error");
    }
  }

  // List all family members
  log("Family", "Listing all family members...");
  const listRes = await api("GET", "/api/family");
  if (listRes.status === 200) {
    const count = listRes.data.members?.length || listRes.data.total || 0;
    log("Family", `Found ${count} family members`, "success");
  }

  return createdMembers;
}

// ================================
// ELDERCARE MODULE TESTS
// ================================
async function testEldercare() {
  console.log("\n" + "=".repeat(60));
  console.log("💊 TESTING ELDERCARE MODULE");
  console.log("=".repeat(60));

  // Test Medicines
  const medicines = [
    { name: "Aspirin", dosage: "100mg", times: ["08:00", "20:00"], notes: "Take with food" },
    { name: "Vitamin D", dosage: "1000 IU", times: ["09:00"], notes: "Morning only" },
    { name: "Blood Pressure Med", dosage: "50mg", times: ["07:00", "19:00"], notes: "Before meals" },
  ];

  const createdMedicines = [];

  for (const med of medicines) {
    log("Eldercare", `Adding medicine: ${med.name}...`);
    const res = await api("POST", "/api/eldercare/medicine", med);

    if (res.status === 201 || res.status === 200) {
      log("Eldercare", `Added: ${med.name}`, "success");
      createdMedicines.push(res.data.medicine || res.data);
    } else {
      log("Eldercare", `Failed: ${JSON.stringify(res.data)}`, "error");
    }
  }

  // List medicines
  log("Eldercare", "Listing all medicines...");
  const listMedsRes = await api("GET", "/api/eldercare/medicine");
  if (listMedsRes.status === 200) {
    log("Eldercare", `Found ${listMedsRes.data.medicines?.length || 0} medicines`, "success");
  }

  // Log a dose for first medicine (POST to medicine/{id} logs the dose)
  if (createdMedicines.length > 0) {
    log("Eldercare", "Logging dose taken...");
    const logRes = await api("POST", `/api/eldercare/medicine/${createdMedicines[0].id}`, {
      timeSlot: "08:00",
      taken: true,
    });
    if (logRes.status === 201 || logRes.status === 200) {
      log("Eldercare", "Dose logged successfully", "success");
    } else {
      log("Eldercare", `Failed to log dose: ${JSON.stringify(logRes.data)}`, "error");
    }
  }

  // Test Check-ins
  const checkIns = [
    { mood: "good", note: "Feeling great today!", bloodPressure: "120/80", heartRate: 72 },
    { mood: "okay", note: "A bit tired but okay", bloodPressure: "125/82" },
    { mood: "not_good", note: "Not feeling well, stayed in bed" },
  ];

  for (const checkIn of checkIns) {
    log("Eldercare", `Creating check-in: ${checkIn.mood}...`);
    const res = await api("POST", "/api/eldercare/checkin", checkIn);

    if (res.status === 201 || res.status === 200) {
      log("Eldercare", `Check-in created: ${checkIn.mood}`, "success");
    } else {
      log("Eldercare", `Failed: ${JSON.stringify(res.data)}`, "error");
    }
  }

  // List check-ins
  log("Eldercare", "Listing all check-ins...");
  const listCheckinsRes = await api("GET", "/api/eldercare/checkin");
  if (listCheckinsRes.status === 200) {
    log("Eldercare", `Found ${listCheckinsRes.data.checkIns?.length || 0} check-ins`, "success");
  }

  return createdMedicines;
}

// ================================
// MESSAGES MODULE TESTS
// ================================
async function testMessages() {
  console.log("\n" + "=".repeat(60));
  console.log("✉️ TESTING MESSAGES MODULE");
  console.log("=".repeat(60));

  const messages = [
    {
      title: "Happy Birthday Dad!",
      content: "Dear Dad, wishing you the happiest birthday! May all your dreams come true.",
      recipientName: "John Doe",
      recipientEmail: "father@test.com",
      scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      occasion: "birthday",
    },
    {
      title: "Congratulations on Graduation!",
      content: "So proud of your achievement! Your hard work has paid off.",
      recipientName: "Emma Doe",
      recipientEmail: "daughter@test.com",
      scheduledDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
      occasion: "graduation",
    },
    {
      title: "Happy Anniversary Mom & Dad",
      content: "Celebrating your love and journey together. You are an inspiration to us all.",
      recipientName: "Parents",
      recipientEmail: "parents@test.com",
      scheduledDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      occasion: "milestone",
    },
  ];

  const createdMessages = [];

  for (const msg of messages) {
    log("Messages", `Creating message: ${msg.title}...`);
    const res = await api("POST", "/api/messages/scheduled", msg);

    if (res.status === 201 || res.status === 200) {
      log("Messages", `Created: ${msg.title}`, "success");
      createdMessages.push(res.data.message || res.data);
    } else {
      log("Messages", `Failed: ${JSON.stringify(res.data)}`, "error");
    }
  }

  // List messages
  log("Messages", "Listing all scheduled messages...");
  const listRes = await api("GET", "/api/messages/scheduled");
  if (listRes.status === 200) {
    log("Messages", `Found ${listRes.data.messages?.length || 0} messages`, "success");
    log("Messages", `Stats: ${JSON.stringify(listRes.data.stats)}`, "info");
  }

  // Update a message
  if (createdMessages.length > 0) {
    log("Messages", "Updating first message...");
    const updateRes = await api("PATCH", `/api/messages/scheduled/${createdMessages[0].id}`, {
      title: "Updated: Happy Birthday Dad!",
      content: "Updated content with even more love!",
    });
    if (updateRes.status === 200) {
      log("Messages", "Message updated successfully", "success");
    } else {
      log("Messages", `Update failed: ${JSON.stringify(updateRes.data)}`, "error");
    }
  }

  return createdMessages;
}

// ================================
// SUBSCRIPTIONS VAULT TESTS
// ================================
async function testSubscriptions() {
  console.log("\n" + "=".repeat(60));
  console.log("📺 TESTING SUBSCRIPTIONS VAULT");
  console.log("=".repeat(60));

  const subscriptions = [
    {
      name: "Netflix",
      serviceName: "Netflix Premium",
      category: "streaming",
      amount: 22.99,
      currency: "USD",
      billingCycle: "monthly",
      nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      accountEmail: "user@test.com",
      website: "https://netflix.com",
      cancellationUrl: "https://netflix.com/cancel",
      isAutoRenew: true,
    },
    {
      name: "Spotify",
      serviceName: "Spotify Family",
      category: "streaming",
      amount: 16.99,
      currency: "USD",
      billingCycle: "monthly",
      nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      accountEmail: "user@test.com",
      website: "https://spotify.com",
      isAutoRenew: true,
    },
    {
      name: "Adobe CC",
      serviceName: "Adobe Creative Cloud",
      category: "software",
      amount: 599.88,
      currency: "USD",
      billingCycle: "annually",
      nextBillingDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      accountEmail: "user@test.com",
      website: "https://adobe.com",
      isAutoRenew: true,
    },
    {
      name: "Gym Membership",
      serviceName: "Planet Fitness",
      category: "membership",
      amount: 25.00,
      currency: "USD",
      billingCycle: "monthly",
      nextBillingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      cancellationInstructions: "Must cancel in person at gym location",
      isAutoRenew: true,
    },
  ];

  const createdSubscriptions = [];

  for (const sub of subscriptions) {
    log("Subscriptions", `Creating: ${sub.name}...`);
    const res = await api("POST", "/api/vault/subscriptions", sub);

    if (res.status === 201 || res.status === 200) {
      log("Subscriptions", `Created: ${sub.name}`, "success");
      createdSubscriptions.push(res.data.subscription || res.data);
    } else {
      log("Subscriptions", `Failed: ${JSON.stringify(res.data)}`, "error");
    }
  }

  // List subscriptions
  log("Subscriptions", "Listing all subscriptions...");
  const listRes = await api("GET", "/api/vault/subscriptions");
  if (listRes.status === 200) {
    log("Subscriptions", `Found ${listRes.data.subscriptions?.length || 0} subscriptions`, "success");
    log("Subscriptions", `Monthly spend: $${listRes.data.stats?.monthlySpend}`, "info");
    log("Subscriptions", `By category: ${JSON.stringify(listRes.data.stats?.byCategory)}`, "info");
  }

  // Update a subscription
  if (createdSubscriptions.length > 0) {
    log("Subscriptions", "Updating subscription amount...");
    const updateRes = await api("PATCH", `/api/vault/subscriptions/${createdSubscriptions[0].id}`, {
      amount: 24.99,
      notes: "Price increased",
    });
    if (updateRes.status === 200) {
      log("Subscriptions", "Subscription updated", "success");
    } else {
      log("Subscriptions", `Update failed: ${JSON.stringify(updateRes.data)}`, "error");
    }
  }

  // Delete one subscription
  if (createdSubscriptions.length > 1) {
    log("Subscriptions", "Testing delete...");
    const deleteRes = await api("DELETE", `/api/vault/subscriptions/${createdSubscriptions[1].id}`);
    if (deleteRes.status === 200) {
      log("Subscriptions", "Subscription deleted", "success");
    } else {
      log("Subscriptions", `Delete failed: ${JSON.stringify(deleteRes.data)}`, "error");
    }
  }

  return createdSubscriptions;
}

// ================================
// EMERGENCY CONTACTS TESTS
// ================================
async function testEmergencyContacts(familyMembers) {
  console.log("\n" + "=".repeat(60));
  console.log("🆘 TESTING EMERGENCY CONTACTS");
  console.log("=".repeat(60));

  // Create emergency contacts - some from existing family, some new
  const emergencyContacts = [
    {
      name: "Dr. Smith",
      relationship: "doctor",
      email: "drsmith@hospital.com",
      phone: "+1555123456",
      priority: 1,
      medicalNotes: "Primary care physician",
      bloodType: "O+",
      allergies: ["Penicillin", "Shellfish"],
      medications: ["Lisinopril", "Metformin"],
      instructions: "Contact immediately in case of emergency",
    },
    {
      name: "Emergency Contact 2",
      relationship: "neighbor",
      email: "neighbor@test.com",
      phone: "+1555789012",
      priority: 2,
      instructions: "Has spare keys to house",
    },
  ];

  const createdContacts = [];

  // Create new emergency contacts
  for (const contact of emergencyContacts) {
    log("Emergency", `Creating emergency contact: ${contact.name}...`);
    const res = await api("POST", "/api/emergency", contact);

    if (res.status === 201 || res.status === 200) {
      log("Emergency", `Created: ${contact.name}`, "success");
      createdContacts.push(res.data.contact || res.data);
    } else {
      log("Emergency", `Failed: ${JSON.stringify(res.data)}`, "error");
    }
  }

  // Link existing family member as emergency contact
  if (familyMembers && familyMembers.length > 0) {
    log("Emergency", `Linking family member as emergency contact...`);
    const linkRes = await api("POST", "/api/emergency", {
      familyMemberId: familyMembers[0].id,
      name: familyMembers[0].name,
      relationship: familyMembers[0].relationship,
      priority: 3,
      instructions: "Family contact",
    });

    if (linkRes.status === 201 || linkRes.status === 200) {
      log("Emergency", `Linked: ${familyMembers[0].name}`, "success");
      createdContacts.push(linkRes.data.contact || linkRes.data);
    } else {
      log("Emergency", `Link failed: ${JSON.stringify(linkRes.data)}`, "error");
    }
  }

  // List emergency contacts
  log("Emergency", "Listing all emergency contacts...");
  const listRes = await api("GET", "/api/emergency");
  if (listRes.status === 200) {
    log("Emergency", `Found ${listRes.data.contacts?.length || 0} emergency contacts`, "success");
    log("Emergency", `Available family members: ${listRes.data.availableFamilyMembers?.length || 0}`, "info");
    log("Emergency", `Stats: ${JSON.stringify(listRes.data.stats)}`, "info");
  }

  // Update emergency contact
  if (createdContacts.length > 0) {
    log("Emergency", "Updating emergency contact priority...");
    const updateRes = await api("PATCH", `/api/emergency/${createdContacts[0].id}`, {
      priority: 1,
      medicalNotes: "Updated medical notes",
      allergies: ["Penicillin", "Shellfish", "Peanuts"],
    });
    if (updateRes.status === 200) {
      log("Emergency", "Emergency contact updated", "success");
    } else {
      log("Emergency", `Update failed: ${JSON.stringify(updateRes.data)}`, "error");
    }
  }

  return createdContacts;
}

// ================================
// EDGE CASES & ERROR HANDLING
// ================================
async function testEdgeCases() {
  console.log("\n" + "=".repeat(60));
  console.log("🔬 TESTING EDGE CASES & ERROR HANDLING");
  console.log("=".repeat(60));

  // Test invalid data
  log("EdgeCase", "Testing invalid medicine data...");
  const invalidMed = await api("POST", "/api/eldercare/medicine", {
    name: "", // Empty name should fail
    dosage: "100mg",
  });
  if (invalidMed.status === 400) {
    log("EdgeCase", "Invalid medicine rejected correctly", "success");
  } else {
    log("EdgeCase", `Unexpected: ${invalidMed.status}`, "warning");
  }

  // Test invalid email in message
  log("EdgeCase", "Testing invalid email in message...");
  const invalidMsg = await api("POST", "/api/messages/scheduled", {
    title: "Test",
    content: "Content",
    recipientName: "Test",
    recipientEmail: "not-an-email", // Invalid email
    scheduledDate: new Date().toISOString(),
    occasion: "other",
  });
  if (invalidMsg.status === 400) {
    log("EdgeCase", "Invalid email rejected correctly", "success");
  } else {
    log("EdgeCase", `Unexpected: ${invalidMsg.status}`, "warning");
  }

  // Test non-existent resource
  log("EdgeCase", "Testing non-existent resource...");
  const notFound = await api("GET", "/api/emergency/non-existent-id");
  if (notFound.status === 404) {
    log("EdgeCase", "Non-existent resource returns 404", "success");
  } else {
    log("EdgeCase", `Unexpected: ${notFound.status}`, "warning");
  }

  // Test invalid subscription category
  log("EdgeCase", "Testing invalid subscription category...");
  const invalidSub = await api("POST", "/api/vault/subscriptions", {
    name: "Test",
    serviceName: "Test Service",
    category: "invalid_category", // Should fail
    amount: 10,
  });
  if (invalidSub.status === 400) {
    log("EdgeCase", "Invalid category rejected correctly", "success");
  } else {
    log("EdgeCase", `Unexpected: ${invalidSub.status}`, "warning");
  }

  // Test unauthorized access (clear session)
  const savedCookie = sessionCookie;
  sessionCookie = null;

  log("EdgeCase", "Testing unauthorized access...");
  const unauthorized = await api("GET", "/api/emergency");
  if (unauthorized.status === 401) {
    log("EdgeCase", "Unauthorized access rejected correctly", "success");
  } else {
    log("EdgeCase", `Unexpected: ${unauthorized.status}`, "warning");
  }

  // Restore session
  sessionCookie = savedCookie;
}

// ================================
// CLEANUP
// ================================
async function cleanup(messages, subscriptions, emergencyContacts) {
  console.log("\n" + "=".repeat(60));
  console.log("🧹 CLEANUP (OPTIONAL - keeping test data)");
  console.log("=".repeat(60));

  log("Cleanup", "Test data preserved for manual inspection", "info");
  log("Cleanup", `Messages created: ${messages?.length || 0}`, "info");
  log("Cleanup", `Subscriptions created: ${subscriptions?.length || 0}`, "info");
  log("Cleanup", `Emergency contacts created: ${emergencyContacts?.length || 0}`, "info");
}

// ================================
// MAIN TEST RUNNER
// ================================
async function runTests() {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 AFTERME COMPREHENSIVE API TESTS");
  console.log("=".repeat(60));
  console.log(`Started at: ${new Date().toISOString()}\n`);

  try {
    // Authentication
    await testAuth();

    // Family Members
    const familyMembers = await testFamilyMembers();

    // Eldercare Module
    await testEldercare();

    // Messages Module
    const messages = await testMessages();

    // Subscriptions Vault
    const subscriptions = await testSubscriptions();

    // Emergency Contacts
    const emergencyContacts = await testEmergencyContacts(familyMembers);

    // Edge Cases
    await testEdgeCases();

    // Cleanup
    await cleanup(messages, subscriptions, emergencyContacts);

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));

  } catch (error) {
    console.log("\n" + "=".repeat(60));
    console.log("❌ TEST SUITE FAILED");
    console.log("=".repeat(60));
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

// Run tests
runTests();

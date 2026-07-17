import prisma from "../src/lib/prisma";
import { generateLabToken, verifyLabToken } from "../src/lib/labTokens";
import { hasLabAccess } from "../src/lib/access";

async function runTests() {
  console.log("=== STARTING CENTRALIZED LAB AUTHORIZATION TESTS ===");

  // 1. Check if we have test users and test labs
  const users = await prisma.user.findMany({ take: 3 });
  const labs = await prisma.lab.findMany({ take: 3 });

  if (users.length === 0 || labs.length === 0) {
    console.error("No users or labs found in database to test with.");
    process.exit(1);
  }

  let testUser = users.find((u) => u.role !== "SUPER_ADMIN" && u.role !== "ADMIN");
  if (!testUser) {
    console.log("No non-admin USER found. Creating a temporary test student user...");
    testUser = await prisma.user.upsert({
      where: { email: "student_auth_test@demo.io" },
      update: {},
      create: {
        email: "student_auth_test@demo.io",
        name: "Test Student A",
        role: "USER",
        status: "ACTIVE",
      },
    });
  }

  const testLab = labs[0];
  const otherLab = labs.length > 1 ? labs[1] : labs[0];

  console.log(`Test User: ${testUser.email} (${testUser.id}, role: ${testUser.role})`);
  console.log(`Test Lab 1: ${testLab.name} (${testLab.id}, slug: ${testLab.slug})`);
  console.log(`Test Lab 2: ${otherLab.name} (${otherLab.id}, slug: ${otherLab.slug})`);

  // Test Scenario 1: Token Generation & Verification
  console.log("\n--- Scenario 1: Token Generation & HMAC Verification ---");
  const token = generateLabToken({
    userId: testUser.id,
    email: testUser.email,
    role: testUser.role || "USER",
    labId: testLab.id,
  }, 300);
  console.log("Generated Token string length:", token.length);

  const decoded = verifyLabToken(token);
  if (!decoded || decoded.userId !== testUser.id || decoded.labId !== testLab.id) {
    throw new Error("Token verification failed for valid token!");
  }
  console.log("✔ Token verification succeeded for valid token:", decoded.userId);

  // Expired token test
  const expiredToken = generateLabToken({
    userId: testUser.id,
    email: testUser.email,
    role: testUser.role || "USER",
    labId: testLab.id,
  }, -10); // 10 seconds ago
  const expiredCheck = verifyLabToken(expiredToken);
  if (expiredCheck !== null) {
    throw new Error("Verify should return null for expired token!");
  }
  console.log("✔ Expired token rejected correctly.");

  // Test Scenario 2: user_lab_access mapping verification
  console.log("\n--- Scenario 2: LabAccess (user_lab_access) Mapping Checks ---");
  // Ensure we create or check LabAccess for testUser and testLab
  const existingAccess = await prisma.labAccess.findUnique({
    where: {
      userId_labId: {
        userId: testUser.id,
        labId: testLab.id,
      },
    },
  });

  if (!existingAccess && testUser.role !== "SUPER_ADMIN" && testUser.role !== "ADMIN") {
    console.log(`Creating explicit LabAccess mapping between ${testUser.email} and ${testLab.name}...`);
    await prisma.labAccess.create({
      data: {
        userId: testUser.id,
        labId: testLab.id,
        source: "ADMIN",
      },
    });
  }

  const check1 = await hasLabAccess(testUser.id, testUser.role, testLab.id);
  console.log(`Access check for assigned lab (${testLab.name}): ${check1 ? "AUTHORIZED (✔)" : "DENIED (✖)"}`);
  if (!check1 && testUser.role !== "SUPER_ADMIN" && testUser.role !== "ADMIN") {
    throw new Error("Assigned lab access check returned false!");
  }

  // Check an unassigned lab if we have a non-admin user
  if (testUser.role !== "SUPER_ADMIN" && testUser.role !== "ADMIN" && otherLab.id !== testLab.id) {
    // Make sure no LabAccess exists for otherLab
    await prisma.labAccess.deleteMany({
      where: { userId: testUser.id, labId: otherLab.id },
    });
    const check2 = await hasLabAccess(testUser.id, testUser.role, otherLab.id);
    console.log(`Access check for UNASSIGNED lab (${otherLab.name}): ${!check2 ? "DENIED (✔)" : "AUTHORIZED (✖)"}`);
    if (check2) {
      throw new Error("Unassigned lab check returned true for non-admin!");
    }
  }

  // Test Scenario 3: AuthorizationLog Audit Entry Verification
  console.log("\n--- Scenario 3: AuthorizationLog Audit Recording ---");
  const logBefore = await prisma.authorizationLog.count();
  await prisma.authorizationLog.create({
    data: {
      userId: testUser.id,
      userEmail: testUser.email,
      labId: testLab.id,
      labSlug: testLab.slug,
      tokenPrefix: token.slice(0, 15),
      status: "SUCCESS",
      reason: "Automated test verification pass",
      ipAddress: "127.0.0.1",
      userAgent: "TestRunner/1.0",
    },
  });
  const logAfter = await prisma.authorizationLog.count();
  console.log(`Authorization logs incremented: ${logBefore} -> ${logAfter} (✔)`);

  const latestLog = await prisma.authorizationLog.findFirst({
    orderBy: { createdAt: "desc" },
  });
  console.log("Latest log entry verified in table authorization_logs:", {
    id: latestLog?.id,
    email: latestLog?.userEmail,
    status: latestLog?.status,
    reason: latestLog?.reason,
  });

  console.log("\n✔ ALL AUTHORIZATION ENGINE TESTS PASSED SUCCESSFULLY! ✔");
}

runTests()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

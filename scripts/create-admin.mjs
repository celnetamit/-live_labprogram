// Create (or update) a user with a known password.
//
// Usage:
//   node scripts/create-admin.mjs <email> <password> [USER|SUPER_ADMIN]
//
// Examples:
//   node scripts/create-admin.mjs admin@panoptical.com "Admin@12345"            # SUPER_ADMIN (default)
//   node scripts/create-admin.mjs user@panoptical.com  "User@12345" USER        # normal user
//
// Works locally and inside the Coolify app terminal (uses DATABASE_URL).

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [, , email, password, roleArg] = process.argv;

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password> [USER|SUPER_ADMIN]");
  process.exit(1);
}

const role = roleArg === "USER" ? "USER" : "SUPER_ADMIN";
const prisma = new PrismaClient();

const hash = await bcrypt.hash(password, 10);
const user = await prisma.user.upsert({
  where: { email: email.toLowerCase() },
  update: { password: hash, role, status: "ACTIVE" },
  create: {
    name: email.split("@")[0],
    email: email.toLowerCase(),
    password: hash,
    role,
    status: "ACTIVE",
  },
});

console.log(`✓ ${user.role} ready → ${user.email}`);
await prisma.$disconnect();

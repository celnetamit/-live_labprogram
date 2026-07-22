const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.authorizationLog.create({
      data: {
        labId: "unknown",
        status: "FAILED_INVALID_TOKEN",
        reason: "Token signature invalid or expired",
      },
    });
    console.log("Success!");
  } catch(e) {
    console.error(e);
  }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());

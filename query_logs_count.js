const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.authorizationLog.count();
  const recent = await prisma.authorizationLog.findMany({ orderBy: { createdAt: 'desc' }, take: 2 });
  console.log("Total logs:", count);
  console.log("Most recent:", recent);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());

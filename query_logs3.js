const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.authorizationLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log(logs);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());

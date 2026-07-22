const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.authorizationLog.findMany({
    where: { labSlug: 'denovo-genai-lab' },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(logs);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());

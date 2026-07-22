const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const labs = await prisma.lab.findMany({
    select: { id: true, slug: true, domainUrl: true }
  });
  console.log(labs);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());

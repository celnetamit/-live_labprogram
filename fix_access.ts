import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  const labs = await prisma.lab.findMany({ where: { enabled: true } });
  
  console.log(`Found ${users.length} users and ${labs.length} labs.`);
  
  for (const user of users) {
    if (labs.length > 0) {
      await prisma.labAccess.createMany({
        data: labs.map(lab => ({
          userId: user.id,
          labId: lab.id,
        })),
        skipDuplicates: true,
      });
    }
  }
  console.log('Done granting access.');
}
main().catch(console.error).finally(() => prisma.$disconnect());

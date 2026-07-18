import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const labs = [
    { name: "Cognicore AI", domainUrl: "https://cognicore.celnet.in/", sourceUrl: "https://cognicore.celnet.in/", slug: "cognicore-ai", category: "Computer Science", status: "ACTIVE", accessType: "PRIVATE", points: 300, difficulty: "Intermediate" },
    { name: "Denovo GenAI Lab", domainUrl: "https://denovo.celnet.in/", sourceUrl: "https://denovo.celnet.in/", slug: "denovo-genai-lab", category: "Computer Science", status: "ACTIVE", accessType: "PRIVATE", points: 300, difficulty: "Beginner" }
  ];

  for (const lab of labs) {
    await prisma.lab.upsert({
      where: { domainUrl: lab.domainUrl },
      update: {},
      create: lab,
    })
  }

  console.log('Database seeded with labs.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

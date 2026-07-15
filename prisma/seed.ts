import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const labs = [
    { name: "AI Research Lab", domainUrl: "ai.panoptical.org", category: "Artificial Intelligence", status: "Active", accessType: "Subscription" },
    { name: "Nano Simulation Lab", domainUrl: "nano.panoptical.org", category: "Nanotechnology", status: "Active", accessType: "Private" },
    { name: "Cyber Security Lab", domainUrl: "cyber.panoptical.org", category: "Security", status: "Active", accessType: "Public" },
    { name: "Data Science Hub", domainUrl: "data.panoptical.org", category: "Data Analytics", status: "Active", accessType: "Subscription" },
    { name: "Biotech Research", domainUrl: "biotech.panoptical.org", category: "Bio-Engineering", status: "Maintenance", accessType: "Private" },
    { name: "Quantum Computing", domainUrl: "quantum.panoptical.org", category: "Physics", status: "Archived", accessType: "Private" },
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

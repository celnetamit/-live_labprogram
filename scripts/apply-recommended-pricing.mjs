// Apply the pricing brief to matching lab rows in the configured database.
// Usage: node scripts/apply-recommended-pricing.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const prices = {
  "ai-6g": 14900,
  logiclab: 9900,
  "cognicore-ai": 9900,
  "micro-ai": 29900,
  "denovo-genai-lab": 39900,
  "drugdiscovery-ai": 49900,
  "battery-ai": 29900,
  "virtual-ai": 29900,
  omicslab: 49900,
  metamaterials: 39900,
  fraudshield: 19900,
};

async function main() {
  let updated = 0;
  for (const [slug, priceMinor] of Object.entries(prices)) {
    const existing = await prisma.lab.findUnique({ where: { slug } });
    if (existing) {
      await prisma.lab.update({ where: { slug }, data: { priceMinor, currency: "USD" } });
      updated++;
    } else if (slug === "omicslab") {
      await prisma.lab.create({
        data: {
          name: "OmicsLab Pro",
          slug,
          domainUrl: "https://omicslab.live-labs.org/",
          sourceUrl: "https://omicslab.live-labs.org/",
          subject: "Biology",
          category: "Biology",
          difficulty: "Advanced",
          points: 800,
          priceMinor,
          currency: "USD",
          accessType: "PRIVATE",
          status: "ACTIVE",
        },
      });
      updated++;
    }
  }
  console.log(`Applied USD recommendations to ${updated} lab rows.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());

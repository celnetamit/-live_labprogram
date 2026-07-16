// Import / re-sync premium workshop labs into this app's database.
// Source order: live API (LAB_SOURCE_URL) -> local snapshot fallback.
// Idempotent: upserts by `slug`.
//
// Usage: node scripts/import-labs.mjs   (or: npm run import:labs)

import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT = path.join(__dirname, "..", "prisma", "labs-snapshot.json");
const SOURCE_URL = process.env.LAB_SOURCE_URL || "http://localhost:3000/api/labs";

const PRICE_BY_DIFFICULTY = {
  Beginner: 49900,
  Intermediate: 99900,
  Advanced: 149900,
};

async function loadLabs() {
  try {
    const res = await fetch(SOURCE_URL, {
      headers: { "x-user-email": process.env.LAB_SOURCE_EMAIL || "amit@conwiz.in" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        console.log(`Loaded ${data.length} labs from live source: ${SOURCE_URL}`);
        return data;
      }
    }
    console.warn(`Live source returned no labs (HTTP ${res.status}); falling back to snapshot.`);
  } catch (err) {
    console.warn(`Live source unavailable (${err.message}); falling back to snapshot.`);
  }
  const raw = await readFile(SNAPSHOT, "utf8");
  const data = JSON.parse(raw);
  console.log(`Loaded ${data.length} labs from snapshot: ${SNAPSHOT}`);
  return data;
}

function domainFor(w) {
  if (w.sourceUrl && /^https?:\/\//i.test(w.sourceUrl)) return w.sourceUrl;
  return `https://lab.local/${w.id}`;
}

async function main() {
  const labs = await loadLabs();
  let created = 0;
  let updated = 0;

  for (const w of labs) {
    const slug = String(w.id);
    const priceMinor = PRICE_BY_DIFFICULTY[w.difficulty] ?? 49900;
    const data = {
      slug,
      name: w.title ?? slug,
      description: w.synopsis ?? null,
      synopsis: w.synopsis ?? null,
      subject: w.subject ?? null,
      difficulty: w.difficulty ?? null,
      points: Number.isFinite(w.points) ? w.points : 0,
      instructions: w.instructions ?? null,
      starterCode: w.starterCode ?? null,
      sourceUrl: w.sourceUrl ?? null,
      tags: JSON.stringify(Array.isArray(w.tags) ? w.tags : []),
      keySkills: JSON.stringify(Array.isArray(w.keySkills) ? w.keySkills : []),
      category: w.subject ?? null,
      domainUrl: domainFor(w),
      accessType: "PRIVATE",
      status: "ACTIVE",
      enabled: true,
    };

    const existing = await prisma.lab.findUnique({ where: { slug } });
    if (existing) {
      // Preserve admin-edited price/enabled/status on re-sync.
      const { priceMinor: _p, enabled: _e, status: _s, ...syncable } = data;
      await prisma.lab.update({ where: { slug }, data: syncable });
      updated++;
    } else {
      await prisma.lab.create({ data: { ...data, priceMinor } });
      created++;
    }
  }

  const total = await prisma.lab.count();
  console.log(`Import complete. created=${created} updated=${updated} totalLabs=${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import prisma from "@/lib/prisma";
import { readFile } from "node:fs/promises";
import path from "node:path";

const SNAPSHOT = path.join(process.cwd(), "prisma", "labs-snapshot.json");
const SOURCE_URL = process.env.LAB_SOURCE_URL || "http://localhost:3000/api/labs";

const PRICE_BY_DIFFICULTY: Record<string, number> = {
  Beginner: 49900,
  Intermediate: 99900,
  Advanced: 149900,
};

type SourceLab = {
  id: string;
  title?: string;
  synopsis?: string;
  subject?: string;
  difficulty?: string;
  points?: number;
  instructions?: string;
  starterCode?: string;
  sourceUrl?: string;
  tags?: string[];
  keySkills?: string[];
};

async function loadLabs(): Promise<SourceLab[]> {
  try {
    const res = await fetch(SOURCE_URL, {
      headers: { "x-user-email": process.env.LAB_SOURCE_EMAIL || "amit@conwiz.in" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data;
    }
  } catch {
    // fall through to snapshot
  }
  const raw = await readFile(SNAPSHOT, "utf8");
  return JSON.parse(raw);
}

function domainFor(w: SourceLab): string {
  if (w.sourceUrl && /^https?:\/\//i.test(w.sourceUrl)) return w.sourceUrl;
  return `https://lab.local/${w.id}`;
}

export async function importLabs(): Promise<{ created: number; updated: number; total: number }> {
  const labs = await loadLabs();
  let created = 0;
  let updated = 0;

  for (const w of labs) {
    const slug = String(w.id);
    const priceMinor = PRICE_BY_DIFFICULTY[w.difficulty ?? ""] ?? 49900;
    const syncable = {
      slug,
      name: w.title ?? slug,
      description: w.synopsis ?? null,
      synopsis: w.synopsis ?? null,
      subject: w.subject ?? null,
      difficulty: w.difficulty ?? null,
      points: Number.isFinite(w.points) ? (w.points as number) : 0,
      instructions: w.instructions ?? null,
      starterCode: w.starterCode ?? null,
      sourceUrl: w.sourceUrl ?? null,
      tags: JSON.stringify(Array.isArray(w.tags) ? w.tags : []),
      keySkills: JSON.stringify(Array.isArray(w.keySkills) ? w.keySkills : []),
      category: w.subject ?? null,
      domainUrl: domainFor(w),
    };

    const existing = await prisma.lab.findUnique({ where: { slug } });
    if (existing) {
      // preserve admin-edited price/enabled/status/accessType
      await prisma.lab.update({ where: { slug }, data: syncable });
      updated++;
    } else {
      await prisma.lab.create({
        data: { ...syncable, priceMinor, accessType: "PRIVATE", status: "ACTIVE", enabled: true },
      });
      created++;
    }
  }

  const total = await prisma.lab.count();
  return { created, updated, total };
}

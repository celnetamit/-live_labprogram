import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * Tutorial progress for the signed-in learner.
 *
 *   GET  ?slug=<labSlug>   this account's progress for one lab
 *   GET                    every lab this account has progress on
 *   PUT  { slug, completedSteps, totalSteps }
 *
 * Called from the hub's own pages, so it authenticates with the NextAuth
 * session rather than a lab token — unlike `/api/labs/projects`, which exists
 * for labs calling in from their own origins.
 *
 * Progress is deliberately not access-gated. A learner can read a locked lab's
 * step titles, so ticking one off is not privileged, and refusing to store it
 * would lose the work of anyone whose access lapses and is later restored. What
 * is checked is that the slug names a real lab, so the table cannot be used as
 * arbitrary per-account storage.
 */

/** No authored guide is near this long; it rejects a bug, not a real tutorial. */
const MAX_STEPS = 500;

function unauthorized() {
  return NextResponse.json({ ok: false, message: "Not signed in" }, { status: 401 });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return unauthorized();

  const slug = new URL(req.url).searchParams.get("slug");

  if (slug) {
    const row = await prisma.labProgress.findUnique({
      where: { userId_labSlug: { userId, labSlug: slug } },
    });
    return NextResponse.json({
      ok: true,
      progress: row ? { completedSteps: row.completedSteps, totalSteps: row.totalSteps } : null,
    });
  }

  const rows = await prisma.labProgress.findMany({
    where: { userId },
    orderBy: { lastActiveAt: "desc" },
  });
  return NextResponse.json({
    ok: true,
    progress: rows.map((r) => ({
      slug: r.labSlug,
      completedSteps: r.completedSteps,
      totalSteps: r.totalSteps,
      lastActiveAt: r.lastActiveAt,
      completedAt: r.completedAt,
    })),
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const { slug, completedSteps, totalSteps } = (body ?? {}) as {
    slug?: unknown;
    completedSteps?: unknown;
    totalSteps?: unknown;
  };

  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ ok: false, message: "slug is required" }, { status: 400 });
  }
  const total = Number(totalSteps);
  if (!Number.isInteger(total) || total < 0 || total > MAX_STEPS) {
    return NextResponse.json({ ok: false, message: "totalSteps out of range" }, { status: 400 });
  }

  /*
    Normalise rather than trust: de-duplicate, drop anything outside the guide's
    range, and sort. The client sends a Set it built from its own state, and a
    guide that lost a step would otherwise leave an index behind that makes the
    row read as more complete than it is.
  */
  const steps = Array.isArray(completedSteps)
    ? [...new Set(completedSteps.filter((n): n is number => Number.isInteger(n) && n >= 0 && n < total))].sort(
        (a, b) => a - b,
      )
    : [];

  // The slug must name a lab that exists; this table is not general storage.
  const lab = await prisma.lab.findUnique({ where: { slug }, select: { id: true } });
  if (!lab) return NextResponse.json({ ok: false, message: "Unknown lab" }, { status: 404 });

  const completedAt = total > 0 && steps.length >= total ? new Date() : null;

  const row = await prisma.labProgress.upsert({
    where: { userId_labSlug: { userId, labSlug: slug } },
    create: { userId, labSlug: slug, completedSteps: steps, totalSteps: total, completedAt },
    /*
      `completedAt` is rewritten on every update, not set once. Un-ticking a step
      has to clear it, or a lab stays "Completed" on the dashboard while its
      tutorial visibly is not.
    */
    update: { completedSteps: steps, totalSteps: total, completedAt },
  });

  return NextResponse.json({
    ok: true,
    progress: { completedSteps: row.completedSteps, totalSteps: row.totalSteps },
  });
}

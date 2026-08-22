import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { labCorsHeaders, readLabToken, resolveLabApiSession } from "@/lib/labSession";

/**
 * Project storage for labs, scoped to the signed-in account.
 *
 * Labs used to keep a learner's saved work in localStorage, which tied it to a
 * browser rather than to a person: sign in from a second machine and the lab
 * was empty. This route is the account-scoped store behind that, so a learner
 * finds their own projects wherever they sign in.
 *
 *   GET    ?limit=50            list this account's projects for the lab
 *   POST   { projectRef, ... }  create or replace one
 *   DELETE ?projectRef=…        remove one
 *
 * Every request is authenticated by the lab session token and re-checked
 * against the database — an account whose access was revoked stops being able
 * to read or write on the next call, not whenever its token expires.
 */

/** Keeps one runaway lab from filling the table on a single account. */
const MAX_PROJECTS_PER_LAB = 50;

/**
 * One megabyte of serialised project. MicrobeAI's largest realistic payload —
 * a full run with QC metrics, per-taxon assignments, guilds and a bioreactor
 * time series — is comfortably under a tenth of that, so this rejects a bug
 * rather than a legitimate project.
 */
const MAX_PAYLOAD_BYTES = 1_000_000;

export async function OPTIONS() {
  return NextResponse.json({}, { headers: labCorsHeaders });
}

function fail(failure: { status: number; code: string; message: string }) {
  return NextResponse.json(
    { ok: false, code: failure.code, message: failure.message },
    { status: failure.status, headers: labCorsHeaders }
  );
}

export async function GET(req: Request) {
  const { session, failure } = await resolveLabApiSession(readLabToken(req));
  if (failure) return fail(failure);

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 50, 1), MAX_PROJECTS_PER_LAB);

  const projects = await prisma.labProject.findMany({
    where: { userId: session.user.id, labId: session.lab.id },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  return NextResponse.json(
    {
      ok: true,
      user: { id: session.user.id, email: session.user.email, name: session.user.name, role: session.user.role },
      lab: { id: session.lab.id, slug: session.lab.slug },
      projects: projects.map((project) => ({
        projectRef: project.projectRef,
        title: project.title,
        summary: project.summary,
        payload: project.payload,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      })),
    },
    { headers: labCorsHeaders }
  );
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const { session, failure } = await resolveLabApiSession(readLabToken(req, body));
  if (failure) return fail(failure);

  const projectRef = typeof body.projectRef === "string" ? body.projectRef.trim() : "";
  const title = typeof body.title === "string" && body.title.trim() !== "" ? body.title.trim() : projectRef;
  const summary = typeof body.summary === "string" ? body.summary.slice(0, 500) : null;
  const payload = body.payload;

  if (!projectRef) {
    return fail({ status: 403, code: "NO_PROJECT_REF", message: "A projectRef is required." });
  }
  if (payload === undefined || payload === null || typeof payload !== "object") {
    return fail({ status: 403, code: "NO_PAYLOAD", message: "A project payload object is required." });
  }
  if (JSON.stringify(payload).length > MAX_PAYLOAD_BYTES) {
    return fail({
      status: 403,
      code: "PAYLOAD_TOO_LARGE",
      message: `Project payload exceeds ${MAX_PAYLOAD_BYTES} bytes. Labs must not send raw input data.`,
    });
  }

  const saved = await prisma.labProject.upsert({
    where: {
      userId_labId_projectRef: { userId: session.user.id, labId: session.lab.id, projectRef },
    },
    update: { title, summary, payload: payload as object },
    create: {
      userId: session.user.id,
      labId: session.lab.id,
      projectRef,
      title,
      summary,
      payload: payload as object,
    },
  });

  /*
   * Evict the oldest beyond the cap, rather than refusing the save. A learner
   * whose lab stops being able to save is a learner losing the work in front of
   * them; losing the least recently touched project instead is the kinder
   * failure, and the lab tells them the cap exists.
   */
  const count = await prisma.labProject.count({
    where: { userId: session.user.id, labId: session.lab.id },
  });
  if (count > MAX_PROJECTS_PER_LAB) {
    const surplus = await prisma.labProject.findMany({
      where: { userId: session.user.id, labId: session.lab.id },
      orderBy: { updatedAt: "asc" },
      take: count - MAX_PROJECTS_PER_LAB,
      select: { id: true },
    });
    await prisma.labProject.deleteMany({ where: { id: { in: surplus.map((row) => row.id) } } });
  }

  return NextResponse.json(
    { ok: true, projectRef: saved.projectRef, updatedAt: saved.updatedAt.toISOString() },
    { headers: labCorsHeaders }
  );
}

export async function DELETE(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const { session, failure } = await resolveLabApiSession(readLabToken(req, body));
  if (failure) return fail(failure);

  const url = new URL(req.url);
  const projectRef =
    url.searchParams.get("projectRef") || (typeof body.projectRef === "string" ? body.projectRef : "");
  if (!projectRef) {
    return fail({ status: 403, code: "NO_PROJECT_REF", message: "A projectRef is required." });
  }

  // Scoped to this user and lab, so a projectRef from elsewhere deletes nothing.
  await prisma.labProject.deleteMany({
    where: { userId: session.user.id, labId: session.lab.id, projectRef },
  });

  return NextResponse.json({ ok: true }, { headers: labCorsHeaders });
}

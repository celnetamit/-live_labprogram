"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { isCustomRequestStatus } from "@/lib/labStatus";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

function revalidateRequestSurfaces() {
  revalidatePath("/admin/lab-requests");
  revalidatePath("/dashboard/labs");
  revalidatePath("/labs");
}

/** Triage a request: move it along the pipeline and optionally reply to the learner. */
export async function reviewRequest(id: string, status: string, notes: string) {
  const session = await requireAdmin();
  if (!isCustomRequestStatus(status)) throw new Error("Unknown status");

  await prisma.customLabRequest.update({
    where: { id },
    data: {
      status,
      adminNotes: notes.trim() || null,
      reviewedAt: new Date(),
      reviewedBy: (session.user as { id?: string }).id ?? null,
    },
  });

  revalidateRequestSurfaces();
  return { success: true };
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "custom-lab"
  );
}

/** First free `base`, `base-2`, `base-3`… */
async function uniqueSlug(base: string): Promise<string> {
  let candidate = base;
  for (let n = 2; await prisma.lab.findUnique({ where: { slug: candidate } }); n++) {
    candidate = `${base}-${n}`;
  }
  return candidate;
}

/**
 * Accept a request by turning it into a real (but not yet live) lab: the learner
 * then sees it in the catalogue's "Coming soon" rail, and the admin fills in
 * pricing and the launch URL from Lab Management as usual.
 */
export async function planRequestAsLab(id: string, launchAt: string | null, notes = "") {
  const session = await requireAdmin();

  const request = await prisma.customLabRequest.findUnique({ where: { id } });
  if (!request) throw new Error("Request not found");
  if (request.plannedLabId) throw new Error("This request already has a lab");

  const slug = await uniqueSlug(slugify(request.title));
  const parsed = launchAt ? new Date(`${launchAt}T00:00:00`) : null;

  const lab = await prisma.lab.create({
    data: {
      slug,
      name: request.title,
      description: request.description,
      synopsis: request.description.slice(0, 240),
      subject: request.subject ?? "Custom",
      difficulty: request.difficulty ?? "Intermediate",
      category: request.subject ?? "Custom",
      // Placeholder host, same shape importLabs uses for labs with no live URL yet.
      domainUrl: `https://lab.local/${slug}`,
      status: "UPCOMING",
      launchAt: parsed && !Number.isNaN(parsed.getTime()) ? parsed : null,
      enabled: true,
      accessType: "PRIVATE",
      ownerId: (session.user as { id?: string }).id ?? null,
    },
  });

  await prisma.customLabRequest.update({
    where: { id },
    data: {
      status: "PLANNED",
      plannedLabId: lab.id,
      // Keep whatever reply the admin typed before converting — dropping it
      // would silently lose the message the learner is meant to see.
      ...(notes.trim() ? { adminNotes: notes.trim() } : {}),
      reviewedAt: new Date(),
      reviewedBy: (session.user as { id?: string }).id ?? null,
    },
  });

  revalidateRequestSurfaces();
  revalidatePath("/admin/labs");
  return { success: true, labId: lab.id, slug };
}

export async function deleteRequest(id: string) {
  await requireAdmin();
  await prisma.customLabRequest.delete({ where: { id } });
  revalidateRequestSurfaces();
  return { success: true };
}

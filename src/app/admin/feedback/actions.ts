"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { isFeedbackStatus } from "@/lib/feedbackStatus";

/**
 * Triage actions for lab feedback.
 *
 * The model already carried `status`, `adminNotes`, `reviewedAt` and
 * `reviewedBy` when it shipped, and nothing wrote to any of them — feedback
 * landed in the table and could only be read with a database console. These are
 * the actions that make the fields mean something.
 */

/*
 * The vocabulary lives in @/lib/feedbackStatus, not here. A "use server" module
 * may only export async functions, and a const exported from one reaches the
 * client as a server reference — see the note in that file.
 */

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Move a piece of feedback along, and record who moved it.
 *
 * `reviewedBy` is taken from the session rather than passed in. A client-
 * supplied reviewer id would let one admin's action be recorded against
 * another's name, which is precisely what an audit field exists to prevent.
 */
export async function reviewFeedback(id: string, status: string, notes: string) {
  const session = await requireAdmin();
  if (!isFeedbackStatus(status)) throw new Error("Unknown status");

  await prisma.labFeedback.update({
    where: { id },
    data: {
      status,
      adminNotes: notes.trim() || null,
      /*
       * Stamped only when the status moves off NEW. Setting it on every save
       * would make "reviewed" true for a row somebody merely typed a note on
       * and left untouched, and the column is what tells you which feedback has
       * actually been dealt with.
       */
      reviewedAt: status === "NEW" ? null : new Date(),
      reviewedBy: status === "NEW" ? null : ((session.user as { id?: string }).id ?? null),
    },
  });

  revalidatePath("/admin/feedback");
  revalidatePath("/admin");
  return { success: true };
}

/** Save a note without changing the status. */
export async function saveFeedbackNotes(id: string, notes: string) {
  await requireAdmin();
  await prisma.labFeedback.update({
    where: { id },
    data: { adminNotes: notes.trim() || null },
  });
  revalidatePath("/admin/feedback");
  return { success: true };
}

/**
 * Delete a piece of feedback.
 *
 * Offered because somebody has to be able to remove a test submission or a
 * duplicate, and because a person may ask for their message to be erased —
 * which they are entitled to do, since it carries their name and address.
 * It is a hard delete: a "deleted" flag on a row containing personal data that
 * someone asked to have removed would not be a deletion.
 */
export async function deleteFeedback(id: string) {
  await requireAdmin();
  await prisma.labFeedback.delete({ where: { id } });
  revalidatePath("/admin/feedback");
  revalidatePath("/admin");
  return { success: true };
}

/** Bulk triage, for clearing a batch of NEW rows that need no individual reply. */
export async function bulkSetStatus(ids: string[], status: string) {
  const session = await requireAdmin();
  if (!isFeedbackStatus(status)) throw new Error("Unknown status");
  if (ids.length === 0) return { success: true, count: 0 };

  const result = await prisma.labFeedback.updateMany({
    where: { id: { in: ids } },
    data: {
      status,
      reviewedAt: status === "NEW" ? null : new Date(),
      reviewedBy: status === "NEW" ? null : ((session.user as { id?: string }).id ?? null),
    },
  });

  revalidatePath("/admin/feedback");
  revalidatePath("/admin");
  return { success: true, count: result.count };
}

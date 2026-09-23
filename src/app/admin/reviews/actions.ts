"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Clear a submitted review out of the admin queue once it has been read.
 *
 * Archiving, not deleting. A review is a named expert's signed assessment of a
 * specific build — the sort of record you want to still have when someone asks
 * six months later what the reviewer actually said. The row stays and keeps its
 * fingerprint; only the queue stops showing it.
 */
export async function archiveReview(reviewId: string) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  /*
    Guarded by `archivedAt: null` rather than read-then-write: two admins
    clearing the same queue would otherwise both write, and the second would
    overwrite the first's timestamp and name with their own.
  */
  const { count } = await prisma.labReview.updateMany({
    where: { id: reviewId, archivedAt: null },
    data: { archivedAt: new Date(), archivedBy: user.id },
  });

  revalidatePath("/admin/reviews");
  return { ok: true, alreadyArchived: count === 0 };
}

/** Put an archived review back in the queue. */
export async function restoreReview(reviewId: string) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.labReview.updateMany({
    where: { id: reviewId },
    data: { archivedAt: null, archivedBy: null },
  });

  revalidatePath("/admin/reviews");
  return { ok: true };
}

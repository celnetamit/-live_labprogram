"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");
  return user;
}

export async function setUserRole(userId: string, role: string) {
  await requireAdmin();
  if (!["USER", "SUPER_ADMIN"].includes(role)) throw new Error("Invalid role");
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Mark an account as an expert reviewer, or unmark it.
 *
 * A reviewer sees the NanoSchool Expert Review Form inside every lab they can
 * open. The flag is on the person rather than on a lab because it describes
 * their standing — which labs they may review is already decided by the access
 * they hold, and a second per-lab table would let the two disagree.
 */
export async function setUserReviewer(userId: string, isReviewer: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isReviewer } });
  revalidatePath("/admin/users");
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function setUserStatus(userId: string, status: string) {
  await requireAdmin();
  if (!["ACTIVE", "SUSPENDED"].includes(status)) throw new Error("Invalid status");
  await prisma.user.update({ where: { id: userId }, data: { status } });
  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Grant a lab, optionally at its premium tier.
 *
 * The tier argument is new and it closes a real hole. A LabAccess row means
 * "may open this lab"; the `tier` column says whether the premium tier is
 * included, and MicrobeAI's Advanced Mode is gated on it. Nothing in this
 * codebase ever wrote ADVANCED — not this action, not access-request approval,
 * not order fulfilment — so the column defaulted to STANDARD everywhere and
 * Advanced Mode was unreachable for every account, with no way for an
 * administrator to hand it out.
 *
 * `update` deliberately sets the tier too. An upsert that ignored it on an
 * existing row would mean the only way to upgrade somebody was to revoke their
 * access and grant it again, which loses the original grant date.
 */
export async function grantLabAccess(
  userId: string,
  labId: string,
  tier: "STANDARD" | "ADVANCED" = "STANDARD"
) {
  const admin = await requireAdmin();
  if (tier !== "STANDARD" && tier !== "ADVANCED") throw new Error("Unknown tier");
  await prisma.labAccess.upsert({
    where: { userId_labId: { userId, labId } },
    create: { userId, labId, source: "ADMIN", grantedBy: admin.id ?? null, tier },
    update: { tier },
  });
  revalidatePath("/admin/users");
  revalidatePath("/admin/access");
  return { success: true };
}

/**
 * Move an existing grant between tiers without touching anything else.
 *
 * Separate from `grantLabAccess` so the intent is legible in the audit trail
 * and at the call site: this is an upgrade or downgrade of something the
 * account already has, not a new grant, and it leaves grantedAt, source and
 * orderId alone.
 */
export async function setLabAccessTier(
  userId: string,
  labId: string,
  tier: "STANDARD" | "ADVANCED"
) {
  await requireAdmin();
  if (tier !== "STANDARD" && tier !== "ADVANCED") throw new Error("Unknown tier");
  await prisma.labAccess.update({
    where: { userId_labId: { userId, labId } },
    data: { tier },
  });
  revalidatePath("/admin/users");
  revalidatePath("/admin/access");
  return { success: true };
}

export async function revokeLabAccess(userId: string, labId: string) {
  await requireAdmin();
  await prisma.labAccess
    .delete({ where: { userId_labId: { userId, labId } } })
    .catch(() => null);
  revalidatePath("/admin/users");
  return { success: true };
}

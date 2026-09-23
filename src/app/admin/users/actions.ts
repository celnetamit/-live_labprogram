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

/**
 * What a permanent delete would destroy, counted before it happens.
 *
 * Every relation from `User` is `onDelete: Cascade`, so removing the account
 * removes a good deal more than the login. The admin is shown these numbers
 * before confirming, because "delete the user" quietly meaning "delete their
 * orders and their signed expert reviews" is not something to discover after
 * the fact.
 */
export async function getUserDeletionImpact(userId: string) {
  await requireAdmin();

  const [user, labAccess, orders, reviews, agreements, projects, progress, requests, feedback, ownedLabs] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true, role: true } }),
      prisma.labAccess.count({ where: { userId } }),
      prisma.order.count({ where: { userId } }),
      prisma.labReview.count({ where: { userId } }),
      prisma.reviewerAgreement.count({ where: { userId } }),
      prisma.labProject.count({ where: { userId } }),
      prisma.labProgress.count({ where: { userId } }),
      prisma.accessRequest.count({ where: { userId } }),
      prisma.labFeedback.count({ where: { userId } }),
      // `Lab.owner` is restrict, not cascade — a delete would fail on the
      // foreign key rather than proceed, so it is reported as a blocker.
      prisma.lab.count({ where: { ownerId: userId } }),
    ]);

  if (!user) throw new Error("User not found");

  return {
    email: user.email,
    name: user.name,
    role: user.role,
    labAccess,
    orders,
    reviews,
    agreements,
    projects,
    progress,
    requests,
    feedback,
    ownedLabs,
  };
}

/**
 * Permanently delete an account and everything that cascades from it.
 *
 * Irreversible, and deliberately narrow about when it will run:
 *
 *  - an admin cannot delete their own account, which would end their session
 *    mid-action and leave the UI talking to a user that no longer exists;
 *  - the last remaining SUPER_ADMIN cannot be deleted, because nobody could
 *    then reach the admin area to undo it;
 *  - an account that owns labs is refused rather than attempted, since
 *    `Lab.owner` restricts and the delete would fail on a foreign key with an
 *    error no admin could act on. Reassign the labs first.
 *
 * Suspending is the reversible alternative and is what most cases want; this
 * exists for the ones that genuinely need the record gone.
 *
 * Refusals are RETURNED, not thrown. A `throw` from a server action is redacted
 * in a production build — the client receives "An error occurred in the Server
 * Components render… the specific message is omitted", so an admin blocked by
 * one of these rules would be shown a wall of boilerplate instead of the reason
 * and the thing they need to do about it. Only a genuine authorisation failure
 * throws, because that is not a message for the person to act on.
 */
export async function deleteUser(
  userId: string,
): Promise<{ ok: true; email: string | null } | { ok: false; message: string }> {
  const admin = await requireAdmin();

  if (admin.id === userId) {
    return { ok: false, message: "You cannot delete your own account. Ask another administrator." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true },
  });
  if (!target) return { ok: false, message: "That account no longer exists." };

  if (target.role === "SUPER_ADMIN") {
    const admins = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
    if (admins <= 1) {
      return {
        ok: false,
        message: "This is the only administrator. Promote another account before deleting this one.",
      };
    }
  }

  const ownedLabs = await prisma.lab.count({ where: { ownerId: userId } });
  if (ownedLabs > 0) {
    return {
      ok: false,
      message: `This account owns ${ownedLabs} lab${ownedLabs === 1 ? "" : "s"}. Reassign ${
        ownedLabs === 1 ? "it" : "them"
      } under Lab Management first.`,
    };
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true, email: target.email };
}

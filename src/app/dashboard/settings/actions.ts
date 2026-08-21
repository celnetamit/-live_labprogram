"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getSettings } from "@/lib/platformSettings";

async function requireUser(): Promise<{ id: string; email?: string; role?: string }> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!user?.id) throw new Error("Not signed in");
  return { ...user, id: user.id };
}

const MAX = { name: 80, organization: 120, designation: 120 };

function clean(value: FormDataEntryValue | null, limit: number): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

/**
 * Save the editable profile fields. Email is deliberately not among them — it
 * identifies the account across sessions, lab tokens and orders, so changing it
 * is not a profile edit.
 */
export async function updateProfile(formData: FormData) {
  const user = await requireUser();

  const name = clean(formData.get("name"), MAX.name);
  if (name.length < 2) {
    return { success: false as const, message: "Enter your name" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      organization: clean(formData.get("organization"), MAX.organization) || null,
      designation: clean(formData.get("designation"), MAX.designation) || null,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true as const, message: "Profile saved." };
}

/**
 * Change the password, or set a first one for an account that has only ever
 * signed in through Google.
 */
export async function changePassword(formData: FormData) {
  const sessionUser = await requireUser();

  const account = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { password: true },
  });
  if (!account) return { success: false as const, message: "Account not found" };

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");

  const { minPasswordLength } = await getSettings();
  if (next.length < minPasswordLength) {
    return {
      success: false as const,
      message: `Choose a password of at least ${minPasswordLength} characters`,
    };
  }

  // Only an account that already has a password must prove the old one.
  if (account.password) {
    if (!current || !(await bcrypt.compare(current, account.password))) {
      return { success: false as const, message: "That current password isn't right" };
    }
    if (await bcrypt.compare(next, account.password)) {
      return { success: false as const, message: "That's already your password" };
    }
  }

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { password: await bcrypt.hash(next, 10) },
  });

  // Any outstanding reset links are void once the password changes by hand.
  await prisma.passwordResetToken.deleteMany({ where: { userId: sessionUser.id } });

  revalidatePath("/dashboard/settings/security");
  return { success: true as const, message: "Password updated." };
}

/** Save notification choices. Absent row means defaults, so this upserts. */
export async function updateNotificationPreferences(formData: FormData) {
  const sessionUser = await requireUser();

  const on = (name: string) => formData.get(name) === "on" || formData.get(name) === "true";
  const prefs = {
    accessDecisions: on("accessDecisions"),
    orderReceipts: on("orderReceipts"),
    labRequestUpdates: on("labRequestUpdates"),
    labLaunches: on("labLaunches"),
    productNews: on("productNews"),
  };

  await prisma.notificationPreference.upsert({
    where: { userId: sessionUser.id },
    create: { userId: sessionUser.id, ...prefs },
    update: prefs,
  });

  revalidatePath("/dashboard/settings/notifications");
  return { success: true as const, message: "Preferences saved." };
}

/**
 * Delete the signed-in user's account.
 *
 * Requires the account's own email typed back as confirmation, and refuses to
 * remove the last remaining administrator — that would lock everyone out of
 * lab management with no way back in.
 */
export async function deleteAccount(confirmation: string) {
  const user = await requireUser();

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, role: true },
  });
  if (!account) return { success: false as const, message: "Account not found" };

  if (confirmation.trim().toLowerCase() !== (account.email ?? "").toLowerCase()) {
    return { success: false as const, message: "That doesn't match your email address" };
  }

  if (account.role === "SUPER_ADMIN") {
    const admins = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
    if (admins <= 1) {
      return {
        success: false as const,
        message: "You're the only admin — promote someone else before deleting this account.",
      };
    }
  }

  // Sessions, lab access, orders, access requests and reset tokens all cascade
  // from the User row.
  await prisma.user.delete({ where: { id: user.id } });

  return { success: true as const, message: "Account deleted." };
}

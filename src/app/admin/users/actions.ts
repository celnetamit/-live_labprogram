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

export async function setUserStatus(userId: string, status: string) {
  await requireAdmin();
  if (!["ACTIVE", "SUSPENDED"].includes(status)) throw new Error("Invalid status");
  await prisma.user.update({ where: { id: userId }, data: { status } });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function grantLabAccess(userId: string, labId: string) {
  const admin = await requireAdmin();
  await prisma.labAccess.upsert({
    where: { userId_labId: { userId, labId } },
    create: { userId, labId, source: "ADMIN", grantedBy: admin.id ?? null },
    update: {},
  });
  revalidatePath("/admin/users");
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

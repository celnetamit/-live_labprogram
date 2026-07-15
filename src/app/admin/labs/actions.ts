"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function createLab(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const domainUrl = formData.get("domainUrl") as string;
  const category = formData.get("category") as string;
  const accessType = formData.get("accessType") as string;
  const status = formData.get("status") as string;

  if (!name || !domainUrl) {
    throw new Error("Name and Domain URL are required");
  }

  await prisma.lab.create({
    data: {
      name,
      domainUrl,
      category,
      accessType,
      status,
      ownerId: session.user.id as string
    }
  });

  revalidatePath("/admin/labs");
  return { success: true };
}

export async function updateLab(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const domainUrl = formData.get("domainUrl") as string;
  const category = formData.get("category") as string;
  const accessType = formData.get("accessType") as string;
  const status = formData.get("status") as string;

  if (!name || !domainUrl) {
    throw new Error("Name and Domain URL are required");
  }

  await prisma.lab.update({
    where: { id },
    data: {
      name,
      domainUrl,
      category,
      accessType,
      status
    }
  });

  revalidatePath("/admin/labs");
  return { success: true };
}

export async function deleteLab(id: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.lab.delete({
    where: { id }
  });

  revalidatePath("/admin/labs");
  return { success: true };
}

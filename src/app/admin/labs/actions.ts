"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { importLabs } from "@/lib/importLabs";
import { isLabStatus } from "@/lib/labStatus";

/** Every surface that renders a lab's status or availability. */
function revalidateLabSurfaces() {
  revalidatePath("/admin/labs");
  revalidatePath("/dashboard/labs");
  revalidatePath("/labs");
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

function fields(formData: FormData) {
  const priceMajor = parseFloat((formData.get("price") as string) || "0");
  const status = (formData.get("status") as string) || "ACTIVE";
  const launchRaw = ((formData.get("launchAt") as string) || "").trim();
  const launchAt = launchRaw ? new Date(`${launchRaw}T00:00:00`) : null;

  return {
    name: (formData.get("name") as string)?.trim(),
    domainUrl: (formData.get("domainUrl") as string)?.trim(),
    sourceUrl: ((formData.get("sourceUrl") as string) || "").trim() || null,
    subject: ((formData.get("subject") as string) || "").trim() || null,
    difficulty: (formData.get("difficulty") as string) || null,
    category: ((formData.get("category") as string) || "").trim() || null,
    accessType: (formData.get("accessType") as string) || "PRIVATE",
    status: isLabStatus(status) ? status : "ACTIVE",
    // Only upcoming labs advertise a date; clearing the status clears the date.
    launchAt: status === "UPCOMING" && launchAt && !Number.isNaN(launchAt.getTime()) ? launchAt : null,
    priceMinor: Number.isFinite(priceMajor) ? Math.round(priceMajor * 100) : 0,
    enabled: formData.get("enabled") === "on" || formData.get("enabled") === "true",
  };
}

export async function createLab(formData: FormData) {
  const session = await requireAdmin();
  const data = fields(formData);
  if (!data.name || !data.domainUrl) {
    throw new Error("Name and Domain URL are required");
  }

  await prisma.lab.create({
    data: {
      name: data.name,
      domainUrl: data.domainUrl,
      sourceUrl: data.sourceUrl,
      subject: data.subject,
      difficulty: data.difficulty,
      category: data.category,
      accessType: data.accessType,
      status: data.status,
      launchAt: data.launchAt,
      priceMinor: data.priceMinor,
      enabled: data.enabled,
      ownerId: (session.user as { id?: string }).id ?? null,
    },
  });

  revalidateLabSurfaces();
  return { success: true };
}

export async function updateLab(id: string, formData: FormData) {
  await requireAdmin();
  const data = fields(formData);
  if (!data.name || !data.domainUrl) {
    throw new Error("Name and Domain URL are required");
  }

  await prisma.lab.update({
    where: { id },
    data: {
      name: data.name,
      domainUrl: data.domainUrl,
      sourceUrl: data.sourceUrl,
      subject: data.subject,
      difficulty: data.difficulty,
      category: data.category,
      accessType: data.accessType,
      status: data.status,
      launchAt: data.launchAt,
      priceMinor: data.priceMinor,
      enabled: data.enabled,
    },
  });

  revalidateLabSurfaces();
  return { success: true };
}

export async function deleteLab(id: string) {
  await requireAdmin();
  await prisma.lab.delete({ where: { id } });
  revalidateLabSurfaces();
  return { success: true };
}

export async function syncLabs() {
  await requireAdmin();
  const result = await importLabs();
  revalidateLabSurfaces();
  return result;
}

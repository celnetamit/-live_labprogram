"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { notifyUser, simpleEmail } from "@/lib/notifications";

/** Where a learner should land from an email about their lab access. */
function labsUrl() {
  const base = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/dashboard/labs`;
}

export async function approveRequest(requestId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  // Find the request
  const request = await prisma.accessRequest.findUnique({
    where: { id: requestId }
  });

  if (!request || request.status !== "PENDING") {
    throw new Error("Request not found or already processed");
  }

  // Update request status
  await prisma.accessRequest.update({
    where: { id: requestId },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedBy: session.user.id as string
    }
  });

  // Grant lab access
  await prisma.labAccess.upsert({
    where: {
      userId_labId: {
        userId: request.userId,
        labId: request.labId
      }
    },
    update: {
      grantedAt: new Date(),
      grantedBy: session.user.id as string
    },
    create: {
      userId: request.userId,
      labId: request.labId,
      grantedBy: session.user.id as string
    }
  });

  const lab = await prisma.lab.findUnique({
    where: { id: request.labId },
    select: { name: true },
  });

  await notifyUser(
    request.userId,
    "accessDecisions",
    simpleEmail(
      "Your lab access was approved",
      `You now have access to <strong>${lab?.name ?? "the lab you requested"}</strong>. It's ready to open from My Labs.`,
      { label: "Open My Labs", href: labsUrl() }
    )
  );

  revalidatePath("/admin/access");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function rejectRequest(requestId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const rejected = await prisma.accessRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: session.user.id as string
    },
    include: { lab: { select: { name: true } } }
  });

  await notifyUser(
    rejected.userId,
    "accessDecisions",
    simpleEmail(
      "Update on your lab access request",
      `Your request for <strong>${rejected.lab.name}</strong> wasn't approved this time. You can still browse the catalogue or purchase access directly.`,
      { label: "Browse labs", href: labsUrl() }
    )
  );

  revalidatePath("/admin/access");
  return { success: true };
}

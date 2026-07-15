"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

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

  revalidatePath("/admin/access");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function rejectRequest(requestId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.accessRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: session.user.id as string
    }
  });

  revalidatePath("/admin/access");
  return { success: true };
}

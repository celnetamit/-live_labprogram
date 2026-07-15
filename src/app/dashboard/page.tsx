import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;

  // Get all labs
  const allLabs = await prisma.lab.findMany({
    orderBy: { createdAt: 'asc' }
  });

  // Get user's lab access
  const userAccesses = await prisma.labAccess.findMany({
    where: { userId: user.id },
    select: { labId: true }
  });
  
  const authorizedLabIds = new Set(userAccesses.map(a => a.labId));

  // Get user's pending access requests
  const pendingRequests = await prisma.accessRequest.findMany({
    where: { 
      userId: user.id,
      status: "PENDING"
    }
  });

  const authorizedLabs = allLabs.filter(lab => authorizedLabIds.has(lab.id) || lab.accessType === "Public");
  const restrictedLabs = allLabs.filter(lab => !authorizedLabIds.has(lab.id) && lab.accessType !== "Public");

  return (
    <DashboardClient 
      userName={user.name || "User"} 
      authorizedLabs={authorizedLabs}
      restrictedLabs={restrictedLabs}
      pendingRequests={pendingRequests}
    />
  );
}

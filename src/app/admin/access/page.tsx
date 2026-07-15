import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AccessClient from "./AccessClient";

export default async function AccessRequestsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  // Fetch pending requests
  const pendingRequestsRaw = await prisma.accessRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { requestedAt: "asc" },
    include: {
      user: { select: { name: true, email: true, designation: true, organization: true } },
      lab: { select: { name: true, domainUrl: true, accessType: true } }
    }
  });

  // Fetch recently processed requests
  const processedRequestsRaw = await prisma.accessRequest.findMany({
    where: { status: { in: ["APPROVED", "REJECTED"] } },
    orderBy: { reviewedAt: "desc" },
    take: 10,
    include: {
      user: { select: { name: true, email: true, designation: true, organization: true } },
      lab: { select: { name: true, domainUrl: true, accessType: true } }
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Access Requests</h1>
        <p className="text-muted-foreground mt-1">Review and process student applications for restricted lab environments.</p>
      </div>

      <AccessClient 
        pendingRequests={pendingRequestsRaw} 
        processedRequests={processedRequestsRaw} 
      />
    </div>
  );
}

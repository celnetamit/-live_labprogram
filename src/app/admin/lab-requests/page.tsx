import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import LabRequestsClient from "./LabRequestsClient";

export const dynamic = "force-dynamic";

export default async function CustomLabRequestsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const requests = await prisma.customLabRequest.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      user: { select: { name: true, email: true, organization: true, designation: true } },
      plannedLab: { select: { id: true, name: true, slug: true, status: true, launchAt: true } },
    },
  });

  return (
    <div className="max-w-6xl mx-auto">
      <LabRequestsClient requests={requests} />
    </div>
  );
}

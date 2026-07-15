
import prisma from "@/lib/prisma";
import LabsClient from "./LabsClient";

export default async function LabManagement() {
  const labs = await prisma.lab.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Lab Management</h1>
        <p className="text-muted-foreground mt-1">Manage external lab deployments and ecosystem integrations.</p>
      </div>

      <LabsClient initialLabs={labs} />
    </div>
  );
}

import prisma from "@/lib/prisma";
import LabsClient from "./LabsClient";

export const dynamic = "force-dynamic";

export default async function LabManagement() {
  const labs = await prisma.lab.findMany({
    orderBy: [{ points: "desc" }, { name: "asc" }],
  });

  return (
    <div className="max-w-7xl mx-auto">
      <LabsClient initialLabs={labs} />
    </div>
  );
}

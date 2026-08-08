import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ownedLabIds, ownsLab, parseList } from "@/lib/access";
import { getLabPreview } from "@/lib/labPreview";
import { CATALOG_STATUSES, formatLaunchDate } from "@/lib/labStatus";
import LabCatalogClient, { type CatalogLab } from "./LabCatalogClient";
import { type MyLabRequest } from "./CustomLabRequestPanel";

export const dynamic = "force-dynamic";

export default async function LabsCatalog() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) redirect("/login");

  const [labs, requests] = await Promise.all([
    prisma.lab.findMany({
      where: { enabled: true, status: { in: [...CATALOG_STATUSES] } },
      // Upcoming labs sort by their launch date; the client splits the two lists.
      orderBy: [{ points: "desc" }, { name: "asc" }],
    }),
    prisma.customLabRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        status: true,
        adminNotes: true,
        createdAt: true,
      },
    }),
  ]);

  const owned = await ownedLabIds(user.id, user.role);

  const catalog: CatalogLab[] = labs.map((lab) => ({
    id: lab.id,
    slug: lab.slug ?? lab.id,
    title: lab.name,
    synopsis: lab.synopsis ?? lab.description ?? "",
    subject: lab.subject ?? "General",
    difficulty: lab.difficulty ?? "Beginner",
    points: lab.points,
    keySkills: parseList(lab.keySkills),
    priceMinor: lab.priceMinor,
    currency: lab.currency,
    // Upcoming labs are never "owned" — nothing to open yet.
    owned: lab.status === "ACTIVE" && ownsLab(owned, lab.id),
    status: lab.status,
    launchLabel: formatLaunchDate(lab.launchAt),
    // Hover reveal is for labs you can actually open today.
    preview: lab.status === "ACTIVE" ? getLabPreview(lab.slug) : null,
  }));

  const myRequests: MyLabRequest[] = requests.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <LabCatalogClient
      labs={catalog}
      isAdmin={user.role === "SUPER_ADMIN"}
      myRequests={myRequests}
    />
  );
}

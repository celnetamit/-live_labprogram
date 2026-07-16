import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ownedLabIds, ownsLab, parseList } from "@/lib/access";
import LabCatalogClient, { type CatalogLab } from "./LabCatalogClient";

export default async function LabsCatalog() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) redirect("/login");

  const labs = await prisma.lab.findMany({
    where: { enabled: true, status: "ACTIVE" },
    orderBy: [{ points: "desc" }, { name: "asc" }],
  });

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
    owned: ownsLab(owned, lab.id),
  }));

  return <LabCatalogClient labs={catalog} isAdmin={user.role === "SUPER_ADMIN"} />;
}

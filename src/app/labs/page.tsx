import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import Navbar from "@/components/navbar";
import { parseList } from "@/lib/access";
import LabCatalogClient, { type CatalogLab } from "@/app/dashboard/labs/LabCatalogClient";

export const metadata: Metadata = {
  title: "Explore Labs — Panoptical Labs",
  description: "Browse all premium workshop labs. Sign in to open a lab and unlock its resources.",
};

export default async function PublicLabs() {
  const labs = await prisma.lab.findMany({
    where: { enabled: true, status: "ACTIVE" },
    orderBy: [{ points: "desc" }, { name: "asc" }],
  });

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
    owned: false,
  }));

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <LabCatalogClient labs={catalog} isAdmin={false} publicMode />
      </main>
    </>
  );
}

import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import Navbar from "@/components/navbar";
import { parseList } from "@/lib/access";
import { CATALOG_STATUSES, formatLaunchDate } from "@/lib/labStatus";
import LabCatalogClient, { type CatalogLab } from "@/app/dashboard/labs/LabCatalogClient";

export const metadata: Metadata = {
  title: "Explore Labs — Panoptical Labs",
  description: "Browse all premium workshop labs. Sign in to open a lab and unlock its resources.",
};

// Reads the DB per-request; never prerender at build time.
export const dynamic = "force-dynamic";

export default async function PublicLabs({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const initialQuery = Array.isArray(q) ? (q[0] ?? "") : (q ?? "");

  const labs = await prisma.lab.findMany({
    where: { enabled: true, status: { in: [...CATALOG_STATUSES] } },
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
    status: lab.status,
    launchLabel: formatLaunchDate(lab.launchAt),
  }));

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <LabCatalogClient labs={catalog} isAdmin={false} publicMode initialQuery={initialQuery} />
      </main>
    </>
  );
}

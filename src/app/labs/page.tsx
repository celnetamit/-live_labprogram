import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Navbar from "@/components/navbar";
import { ownedLabIds, ownsLab, parseList } from "@/lib/access";
import { EXPLORE_STATUSES, formatLaunchDate } from "@/lib/labStatus";
import LabCatalogClient, { type CatalogLab } from "@/app/dashboard/labs/LabCatalogClient";

export const metadata: Metadata = {
  title: "Explore Labs — Panoptical Labs",
  description: "Browse all premium workshop labs. Sign in to open a lab and unlock its resources.",
};

// Reads the DB and the session per-request; never prerender at build time.
export const dynamic = "force-dynamic";

export default async function PublicLabs({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const initialQuery = Array.isArray(q) ? (q[0] ?? "") : (q ?? "");

  /*
    This page is reachable both signed out (marketing) and signed in (the
    "Explore more labs" button on the dashboard). It must read the session:
    without it a signed-in learner saw a "Sign In" header and every lab marked
    Locked, which reads as having been logged out.
  */
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | { id?: string; role?: string; name?: string | null; email?: string | null }
    | undefined;

  const [labs, owned] = await Promise.all([
    prisma.lab.findMany({
      where: { enabled: true, status: { in: [...EXPLORE_STATUSES] } },
      orderBy: [{ points: "desc" }, { name: "asc" }],
    }),
    ownedLabIds(user?.id, user?.role),
  ]);

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
    // Only a live lab can actually be opened, so only those carry "Owned".
    owned: lab.status === "ACTIVE" && !!user?.id && ownsLab(owned, lab.id),
    status: lab.status,
    launchLabel: formatLaunchDate(lab.launchAt),
  }));

  return (
    <>
      <Navbar user={user ? { name: user.name, email: user.email } : null} />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <LabCatalogClient
          labs={catalog}
          isAdmin={user?.role === "SUPER_ADMIN"}
          publicMode
          signedIn={!!user?.id}
          initialQuery={initialQuery}
        />
      </main>
    </>
  );
}

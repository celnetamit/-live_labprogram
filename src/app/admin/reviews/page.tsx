import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ReviewsClient from "./ReviewsClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  /*
   * Submitted reviews only. A draft is a reviewer's private working copy —
   * reading someone's half-formed opinion of your product before they have
   * signed it off would be a good way to stop getting honest reviews.
   */
  const reviews = await prisma.labReview.findMany({
    where: { status: "SUBMITTED" },
    orderBy: [{ submittedAt: "desc" }],
    include: {
      user: { select: { email: true, name: true, organization: true } },
      lab: { select: { name: true, slug: true } },
    },
  });

  const draftCount = await prisma.labReview.count({ where: { status: "DRAFT" } });

  return (
    <div className="max-w-5xl mx-auto">
      <ReviewsClient
        draftCount={draftCount}
        reviews={reviews.map((r) => ({
          ...r,
          ratings: r.ratings as Record<string, string>,
          issues: (r.issues ?? []) as { module: string; severity: string; observation: string; recommendation: string }[],
          domainChecks: (r.domainChecks ?? {}) as Record<string, string[]>,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          submittedAt: r.submittedAt ? r.submittedAt.toISOString() : null,
        }))}
      />
    </div>
  );
}

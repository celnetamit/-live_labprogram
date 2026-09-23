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
    // Archived reviews are cleared from the queue but kept — see `archiveReview`.
    where: { status: "SUBMITTED", archivedAt: null },
    orderBy: [{ submittedAt: "desc" }],
    include: {
      user: { select: { email: true, name: true, organization: true } },
      lab: { select: { name: true, slug: true } },
    },
  });

  const draftCount = await prisma.labReview.count({ where: { status: "DRAFT" } });
  const archivedCount = await prisma.labReview.count({
    where: { status: "SUBMITTED", archivedAt: { not: null } },
  });

  /*
   * The signed undertakings. Still on this page — "who has signed" and "whose
   * review have we received" are two halves of one question, and a reviewer who
   * has signed but not yet reported is the state worth being able to see — but
   * on their own tab now. Stacked above the reviews, this list pushed the thing
   * the page is named after below the fold as soon as a few reviewers signed.
   */
  const agreements = await prisma.reviewerAgreement.findMany({
    where: { revokedAt: null },
    orderBy: [{ acknowledgedAt: "desc" }],
    include: { user: { select: { email: true } }, lab: { select: { name: true } } },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <ReviewsClient
        draftCount={draftCount}
        archivedCount={archivedCount}
        agreements={agreements.map((a) => ({
          id: a.id,
          reviewerName: a.reviewerName,
          designation: a.designation,
          institution: a.institution,
          email: a.email,
          domain: a.domain,
          labName: a.lab?.name ?? a.labSlug,
          reviewBuild: a.reviewBuild,
          reviewRoles: (a.reviewRoles ?? []) as string[],
          agreementVersion: a.agreementVersion,
          agreementFingerprint: a.agreementFingerprint,
          acknowledgedAt: a.acknowledgedAt.toISOString(),
          accountEmail: a.user?.email ?? null,
        }))}
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

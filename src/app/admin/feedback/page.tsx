import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import FeedbackClient from "./FeedbackClient";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  /*
   * The account is joined in so the page can show what the sender typed beside
   * what their account says. They are usually the same and occasionally not —
   * a shared machine, a teaching session, a stale registration — and that
   * difference is worth being able to see rather than having to go looking for.
   */
  const feedback = await prisma.labFeedback.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, email: true, organization: true, designation: true } },
      lab: { select: { name: true, slug: true } },
    },
  });

  const reviewerIds = [...new Set(feedback.map((f) => f.reviewedBy).filter(Boolean) as string[])];
  const reviewers = reviewerIds.length
    ? await prisma.user.findMany({
        where: { id: { in: reviewerIds } },
        select: { id: true, name: true, email: true },
      })
    : [];

  return (
    <div className="max-w-6xl mx-auto">
      <FeedbackClient
        feedback={feedback.map((f) => ({
          ...f,
          createdAt: f.createdAt.toISOString(),
          reviewedAt: f.reviewedAt ? f.reviewedAt.toISOString() : null,
          reviewerName:
            reviewers.find((r) => r.id === f.reviewedBy)?.name ??
            reviewers.find((r) => r.id === f.reviewedBy)?.email ??
            null,
        }))}
      />
    </div>
  );
}

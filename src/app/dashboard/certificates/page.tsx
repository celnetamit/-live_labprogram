import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import { buildLearnerLab, formatMinutes } from "@/lib/learnerLabs";
import { ProgressBar } from "@/components/learner-lab-card";

/**
 * The learner's completion record.
 *
 * This page previously rendered two hardcoded certificates with invented
 * issuers ("Panoptical AI Institute"), invented credential IDs (P-AI-9823) and
 * invented dates, shown to every account regardless of what they had done.
 * There is no Certificate model in the schema and nothing in the platform
 * issues one, so none of it could be true for anybody.
 *
 * What is real is completion: `LabProgress.completedAt` is set when a learner
 * ticks off every step of a lab's authored tutorial. That is what this page
 * shows now, and it says plainly what it is — the learner's own record, not an
 * issued credential — so nobody is handed a document to put on a CV that this
 * platform never actually awarded.
 */

export const dynamic = "force-dynamic";

export default async function CompletionRecord() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; name?: string } | undefined;
  if (!user?.id) redirect("/login");
  const userId = user.id;

  const [progressRows, labs] = await Promise.all([
    prisma.labProgress.findMany({ where: { userId }, orderBy: { lastActiveAt: "desc" } }),
    prisma.lab.findMany({ where: { enabled: true, status: "ACTIVE" } }),
  ]);

  const progressBySlug = new Map(progressRows.map((r) => [r.labSlug, r]));
  const touched = labs
    .map((lab) => ({
      lab: buildLearnerLab(lab, progressBySlug.get(lab.slug ?? lab.id)),
      completedAt: progressBySlug.get(lab.slug ?? lab.id)?.completedAt ?? null,
    }))
    .filter((r) => r.lab.completedSteps > 0);

  const done = touched.filter((r) => r.lab.status === "completed");
  const inProgress = touched.filter((r) => r.lab.status === "in-progress");

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Your progress record</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Labs you have worked through, and how far you got in each.
        </p>
      </header>

      {/* Said once, plainly, rather than implied by a certificate-shaped card. */}
      <p className="mb-8 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        This is your own record of what you have completed. Live Labs does not currently issue a
        formal certificate or a verifiable credential for finishing a lab — if that changes, it will
        appear here.
      </p>

      {done.length === 0 && inProgress.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
          <h2 className="font-semibold">Nothing completed yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Work through a lab&apos;s tutorial and tick off the steps as you go. Whatever you finish
            shows up here.
          </p>
          <Link
            href="/dashboard/labs"
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go to your labs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {done.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-semibold">
                Completed <span className="font-normal text-muted-foreground">({done.length})</span>
              </h2>
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                {done.map(({ lab, completedAt }) => (
                  <li key={lab.slug}>
                    <Link
                      href={`/dashboard/labs/${lab.slug}`}
                      className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-accent/50"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[color:var(--color-success)]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{lab.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {lab.subject} · all {lab.totalSteps} steps
                          {formatMinutes(lab.minutesTotal)
                            ? ` · ${formatMinutes(lab.minutesTotal)} of hands-on work`
                            : ""}
                        </span>
                      </span>
                      {completedAt && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {completedAt.toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {inProgress.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-semibold">
                Still going{" "}
                <span className="font-normal text-muted-foreground">({inProgress.length})</span>
              </h2>
              <ul className="space-y-3">
                {inProgress.map(({ lab }) => (
                  <li key={lab.slug}>
                    <Link
                      href={`/dashboard/labs/${lab.slug}`}
                      className="block rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/20"
                    >
                      <div className="mb-2 flex items-baseline justify-between gap-3">
                        <span className="truncate font-medium">{lab.title}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {lab.completedSteps} of {lab.totalSteps}
                        </span>
                      </div>
                      <ProgressBar percent={lab.percent} />
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                        {lab.nextStep && (
                          <span className="truncate">
                            Next: <span className="text-foreground">{lab.nextStep}</span>
                          </span>
                        )}
                        {lab.minutesLeft > 0 && (
                          <span className="inline-flex shrink-0 items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatMinutes(lab.minutesLeft)} left
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

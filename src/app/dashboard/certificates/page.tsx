import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Info, ListChecks, Trophy } from "lucide-react";
import prisma from "@/lib/prisma";
import { buildLearnerLab, formatMinutes } from "@/lib/learnerLabs";
import { ProgressBar } from "@/components/learner-lab-card";
import { IconTile, LearnerPage, PageHeader, SectionTitle, StatTile } from "@/components/learner-page";

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

  /* Counted from the same rows as the lists below — nothing estimated. */
  const stepsTicked = touched.reduce((n, r) => n + r.lab.completedSteps, 0);

  return (
    <LearnerPage>
      <div className="mx-auto max-w-5xl pb-12">
        <PageHeader
          eyebrow={`${done.length} completed · ${inProgress.length} in progress`}
          eyebrowTone={touched.length > 0 ? "live" : "idle"}
          title="Your progress"
          subtitle="Labs you have worked through, and how far you got in each."
          aside={
            <Link href="/dashboard/labs" className="ui-btn ui-btn-ghost focus-ring">
              Go to My Labs <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
          <StatTile icon={Trophy} tone="success" value={done.length} label="Labs completed" />
          <StatTile icon={Clock} tone="warning" value={inProgress.length} label="In progress" />
          <StatTile icon={ListChecks} tone="primary" value={stepsTicked} label="Steps ticked off" />
        </div>

        {/* Said once, plainly, rather than implied by a certificate-shaped card. */}
        <p className="ui-note mb-9">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-info-ink)]" />
          <span>
            This is your own record of what you have completed. Live Labs does not currently issue a
            formal certificate or a verifiable credential for finishing a lab — if that changes, it
            will appear here.
          </span>
        </p>

        {done.length === 0 && inProgress.length === 0 ? (
          <div className="ui-card flex flex-col items-center px-6 py-14 text-center">
            <IconTile icon={Trophy} tone="success" />
            <h2 className="ui-h2 mt-4 text-lg">Nothing completed yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Work through a lab&apos;s tutorial and tick off the steps as you go. Whatever you
              finish shows up here.
            </p>
            <Link href="/dashboard/labs" className="ui-btn ui-btn-primary focus-ring mt-5">
              Go to your labs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-9">
            {done.length > 0 && (
              <section>
                <SectionTitle icon={CheckCircle2} tone="success" title="Completed" count={done.length} />
                <ul className="ui-card ui-divide overflow-hidden">
                  {done.map(({ lab, completedAt }) => (
                    <li key={lab.slug}>
                      <Link
                        href={`/dashboard/labs/${lab.slug}`}
                        className="ui-row flex items-center gap-4 px-4 py-4 sm:px-5"
                      >
                        <IconTile icon={CheckCircle2} tone="success" size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{lab.title}</span>
                          <span className="block text-xs text-muted-foreground">
                            {lab.subject} · all {lab.totalSteps} steps
                            {formatMinutes(lab.minutesTotal)
                              ? ` · ${formatMinutes(lab.minutesTotal)} of hands-on work`
                              : ""}
                          </span>
                        </span>
                        {completedAt && (
                          <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
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
                <SectionTitle icon={Clock} tone="warning" title="Still going" count={inProgress.length} />
                <ul className="grid gap-4 sm:grid-cols-2">
                  {inProgress.map(({ lab }) => (
                    <li key={lab.slug}>
                      <Link
                        href={`/dashboard/labs/${lab.slug}`}
                        className="ui-card ui-card-link block h-full p-5"
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {lab.subject}
                        </span>
                        <span className="ui-h2 mt-1 block truncate text-lg">{lab.title}</span>
                        <div className="mb-2 mt-4 flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            <span className="font-semibold text-foreground">
                              {lab.completedSteps} of {lab.totalSteps}
                            </span>{" "}
                            steps · {lab.percent}%
                          </span>
                          {lab.minutesLeft > 0 && (
                            <span className="inline-flex shrink-0 items-center gap-1">
                              <Clock className="h-3 w-3" /> {formatMinutes(lab.minutesLeft)} left
                            </span>
                          )}
                        </div>
                        <ProgressBar percent={lab.percent} className="h-2" />
                        {lab.nextStep && (
                          <p className="mt-3 truncate text-xs text-muted-foreground">
                            Next: <span className="font-medium text-foreground">{lab.nextStep}</span>
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </LearnerPage>
  );
}

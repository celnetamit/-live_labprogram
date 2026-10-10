import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Clock,
  ExternalLink,
  Gauge,
  ListChecks,
  Lock,
  Target,
} from "lucide-react";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import EditorialHeader from "@/components/editorial-header";
import EditorialFooter from "@/components/editorial-footer";
import { JsonLd } from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import { getLabGuide, totalMinutes, type LabGuide } from "@/content/labs";
import { EXPLORE_STATUSES, LAB_STATUS_LABEL, formatLaunchDate } from "@/lib/labStatus";
import prisma from "@/lib/prisma";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

/*
  The public page for one laboratory.

  Until this existed, nothing crawlable and nothing readable without an account
  said what a lab actually contains: the detail page lives under /dashboard and
  the middleware sends a signed-out visitor to /login, while the home page's
  Access section promised "Every lab page lists its objective, all of its
  steps, the result each step should produce, its troubleshooting entries and
  its sources. No account, no email, no trial clock." Thirteen guides — 104
  steps, 104 expected results, 71 troubleshooting entries and 46 cited sources
  — sat in `src/content/labs/` and were served to nobody.

  This page is that promise kept. It publishes the method in full. What it does
  NOT do is run the experiment: the lab environment itself still needs an
  account and access, which the page says plainly rather than discovering at
  the end of a sign-up.
*/

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const getLab = cache(async (slug: string) => {
  const lab = await prisma.lab.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      synopsis: true,
      description: true,
      subject: true,
      difficulty: true,
      status: true,
      enabled: true,
      launchAt: true,
    },
  });
  if (!lab?.enabled || !lab.slug) return null;
  // A lab that is archived or hidden is not a page; it is a 404.
  if (!(EXPLORE_STATUSES as readonly string[]).includes(lab.status)) return null;
  return { ...lab, slug: lab.slug };
});

type Lab = NonNullable<Awaited<ReturnType<typeof getLab>>>;

/** The lab's own sentence, in its own words, falling back to the catalogue copy. */
function taglineOf(lab: Lab, guide: LabGuide | null): string {
  return guide?.summary.tagline ?? lab.synopsis ?? lab.description ?? `A guided laboratory on ${lab.name}.`;
}

function hoursLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** ISO 8601 duration, for `timeRequired` in the structured data. */
function isoDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}` || "PT0M";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lab = await getLab(slug);
  if (!lab) return {};
  const guide = getLabGuide(slug);
  const description = taglineOf(lab, guide).slice(0, 300);
  const url = absoluteUrl(`/labs/${lab.slug}`);
  return {
    title: `${lab.name} — ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: { title: lab.name, description, url, type: "article", siteName: SITE_NAME },
    twitter: { card: "summary_large_image", title: lab.name, description },
  };
}

export default async function PublicLabPage({ params }: Props) {
  const { slug } = await params;
  const lab = await getLab(slug);
  if (!lab) notFound();

  const session = await getServerSession(authOptions);
  const user = session?.user as { name?: string | null; email?: string | null } | undefined;

  const guide = getLabGuide(lab.slug);
  const minutes = guide ? totalMinutes(guide) : 0;
  const launch = formatLaunchDate(lab.launchAt);
  const runHref = `/dashboard/labs/${lab.slug}`;

  const stats = [
    guide ? { icon: ListChecks, value: String(guide.steps.length), label: "guided steps" } : null,
    minutes ? { icon: Clock, value: hoursLabel(minutes), label: "hands-on" } : null,
    lab.difficulty ? { icon: Gauge, value: lab.difficulty, label: "level" } : null,
    guide?.furtherReading.length
      ? { icon: BookOpen, value: String(guide.furtherReading.length), label: "sources" }
      : null,
  ].filter(Boolean) as { icon: typeof Clock; value: string; label: string }[];

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Labs", item: absoluteUrl("/labs") },
      { "@type": "ListItem", position: 2, name: lab.name, item: absoluteUrl(`/labs/${lab.slug}`) },
    ],
  };

  /*
    Two objects, because the page is two things: a course (what it is, who it
    is for, what it costs you in time) and a method (the steps themselves).

    Nothing here is asserted that the page does not show. `isAccessibleForFree`
    is on the HowTo and not on the Course, because the method is free to read
    while running the lab is not — which is the whole distinction this page is
    drawing.
  */
  const courseLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: lab.name,
    description: taglineOf(lab, guide),
    url: absoluteUrl(`/labs/${lab.slug}`),
    provider: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    ...(lab.difficulty ? { educationalLevel: lab.difficulty } : {}),
    ...(minutes ? { timeRequired: isoDuration(minutes) } : {}),
    ...(guide?.summary.outcomes.length ? { teaches: guide.summary.outcomes } : {}),
    ...(guide?.prerequisites.length ? { coursePrerequisites: guide.prerequisites } : {}),
    ...(lab.subject ? { about: lab.subject } : {}),
  };

  const howToLd = guide?.steps.length
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `${lab.name}: the method`,
        description: guide.summary.what,
        isAccessibleForFree: true,
        ...(minutes ? { totalTime: isoDuration(minutes) } : {}),
        step: guide.steps.map((step, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: step.title,
          text: step.goal,
          ...(step.actions.length
            ? {
                itemListElement: step.actions.map((action) => ({
                  "@type": "HowToDirection",
                  text: action,
                })),
              }
            : {}),
        })),
      }
    : null;

  return (
    <>
      <EditorialHeader user={user ? { name: user.name, email: user.email } : null} />
      <JsonLd data={breadcrumbs} />
      <JsonLd data={courseLd} />
      {howToLd && <JsonLd data={howToLd} />}

      <main id="main" className="flex-grow pb-20 pt-10">
        {/* ===== Hero ===== */}
        <section className="band-ink hero-light border-b border-border py-10 md:py-14">
          <div className="shell">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
              {/* `py-1` takes the hit box past 24px — WCAG 2.2 AA target size.
                  Bare, the breadcrumb link was 32x20. */}
              <Link
                href="/labs"
                className="-mx-1 inline-flex items-center rounded px-1 py-1 transition-colors hover:text-foreground"
              >
                Labs
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="min-w-0 truncate text-foreground">{lab.name}</span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-16">
              <div className="min-w-0">
                <p className="viv-eyebrow mb-5">
                  {lab.subject ?? "Laboratory"}
                  {lab.status !== "ACTIVE" ? ` · ${LAB_STATUS_LABEL[lab.status] ?? lab.status}` : ""}
                </p>
                <h1 className="text-[clamp(2rem,3.2vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.035em] text-balance">
                  {lab.name}
                </h1>
                <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-muted-foreground">
                  {taglineOf(lab, guide)}
                </p>

                {stats.length > 0 && (
                  <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
                    {stats.map((s) => (
                      <div key={s.label} className="flex items-center gap-2.5">
                        <s.icon className="h-4 w-4 shrink-0 text-[color:var(--color-primary-ink)]" aria-hidden="true" />
                        <dd className="font-semibold tabular-nums">{s.value}</dd>
                        <dt className="text-sm text-muted-foreground">{s.label}</dt>
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              {/*
                Access, stated before you invest any reading.

                The one thing this page cannot do is run the experiment, so it
                says so here rather than at the bottom of a sign-up form.
              */}
              <aside className="viv-card min-w-0 self-start px-6 py-6">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Lock className="h-4 w-4 shrink-0 text-[color:var(--color-primary-ink)]" aria-hidden="true" />
                  Reading this guide is free
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Everything below — the objective, every step, the result each step should produce,
                  the troubleshooting list and the sources — is public. No account and no email.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {lab.status === "ACTIVE" ? (
                    <>Running the experiment itself needs an account and access to this lab.</>
                  ) : launch ? (
                    <>
                      This lab is {(LAB_STATUS_LABEL[lab.status] ?? lab.status).toLowerCase()} and is
                      expected to open on {launch}.
                    </>
                  ) : (
                    <>
                      This lab is {(LAB_STATUS_LABEL[lab.status] ?? lab.status).toLowerCase()} and cannot
                      be opened right now.
                    </>
                  )}
                </p>
                {lab.status === "ACTIVE" && (
                  <Link
                    href={runHref}
                    className="viv-btn group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold"
                  >
                    Open the lab
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                )}
              </aside>
            </div>
          </div>
        </section>

        {guide ? (
          <>
            {/* ===== Overview ===== */}
            <section id="overview" className="scroll-mt-24 py-12 md:py-16">
              <div className="shell grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
                <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
                  <span className="viv-eyebrow">Overview</span>
                  <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-balance md:text-[2.4rem]">
                    What this laboratory is
                  </h2>
                </div>
                <div className="min-w-0 space-y-8">
                  <Prose text={guide.summary.what} />

                  <div>
                    <h3 className="mb-3 text-lg font-semibold tracking-tight">Why it matters</h3>
                    {Array.isArray(guide.summary.why) ? (
                      <ul className="space-y-2.5">
                        {guide.summary.why.map((line) => (
                          <li key={line} className="flex items-start gap-3 text-muted-foreground">
                            <span className="viv-check mt-1 shrink-0" aria-hidden="true">
                              <Check className="h-3 w-3" />
                            </span>
                            <span className="leading-relaxed">
                              <RichText>{line}</RichText>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Prose text={guide.summary.why} />
                    )}
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold tracking-tight">Who it is for</h3>
                    <Prose text={guide.summary.whoFor} />
                  </div>

                  {guide.summary.outcomes.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-lg font-semibold tracking-tight">What you will be able to do</h3>
                      <ul className="space-y-2.5">
                        {guide.summary.outcomes.map((outcome) => (
                          <li key={outcome} className="flex items-start gap-3 text-muted-foreground">
                            <span className="viv-check mt-1 shrink-0" aria-hidden="true">
                              <Check className="h-3 w-3" />
                            </span>
                            <span className="leading-relaxed">
                              <RichText>{outcome}</RichText>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ===== Prerequisites ===== */}
            {guide.prerequisites.length > 0 && (
              <section id="prepare" className="viv-surface viv-seam scroll-mt-24 border-y border-border py-12 md:py-16">
                <div className="shell grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
                  <div className="min-w-0">
                    <span className="viv-eyebrow">Before you begin</span>
                    <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-balance md:text-[2.2rem]">
                      {guide.prerequisitesLabel ?? "What's included in the lab"}
                    </h2>
                  </div>
                  <ul className="grid min-w-0 gap-3 sm:grid-cols-2">
                    {guide.prerequisites.map((item) => (
                      <li key={item} className="viv-card flex items-start gap-3 px-5 py-4 text-[15px] leading-relaxed">
                        <span className="viv-check mt-0.5 shrink-0" aria-hidden="true">
                          <Check className="h-3 w-3" />
                        </span>
                        <span>
                          <RichText>{item}</RichText>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* ===== The method ===== */}
            <section id="method" className="scroll-mt-24 py-12 md:py-16">
              <div className="shell">
                <div className="mb-10 max-w-2xl">
                  <span className="viv-eyebrow">The method</span>
                  <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-balance md:text-[2.4rem]">
                    Every step, and the result it should produce
                  </h2>
                  <p className="mt-4 leading-relaxed text-muted-foreground">
                    Each step states what you are doing it for, the actions in order, and what you
                    should see when it worked. If you do not see it, you know immediately that you
                    are off track — and the troubleshooting list below is written from the places
                    people actually get stuck.
                  </p>
                </div>

                {/* Capped: a step's expected result is a sentence to read, and
                    across the full shell it was a single 1300px line. */}
                <ol className="max-w-5xl space-y-5">
                  {guide.steps.map((step, index) => (
                    <li key={step.title} className="viv-card px-6 py-6 md:px-8 md:py-7">
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span className="viv-num text-2xl font-bold tabular-nums tracking-[-0.03em]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="min-w-0 text-lg font-semibold tracking-tight">{step.title}</h3>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                          {step.minutes} min
                        </span>
                      </div>

                      <p className="mt-2 flex items-start gap-2.5 text-[15px] leading-relaxed text-muted-foreground">
                        <Target className="mt-1 h-4 w-4 shrink-0 text-[color:var(--color-primary-ink)]" aria-hidden="true" />
                        <span>
                          <RichText>{step.goal}</RichText>
                        </span>
                      </p>

                      {step.actions.length > 0 && (
                        <ol className="mt-5 space-y-2.5">
                          {step.actions.map((action, i) => (
                            <li key={action} className="flex gap-3 text-[15px] leading-relaxed">
                              <span
                                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-semibold tabular-nums text-muted-foreground"
                                aria-hidden="true"
                              >
                                {i + 1}
                              </span>
                              <span className="min-w-0">
                                <RichText>{action}</RichText>
                              </span>
                            </li>
                          ))}
                        </ol>
                      )}

                      {step.expect && (
                        <div className="mt-5 rounded-xl border border-[color:var(--color-success-ink)]/25 bg-[color:var(--color-success-ink)]/[0.07] px-4 py-3.5">
                          <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-success-ink)]">
                            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            You should see
                          </p>
                          <p className="text-[15px] leading-relaxed">
                            <RichText>{step.expect}</RichText>
                          </p>
                        </div>
                      )}

                      {step.why && (
                        <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                          <span className="font-semibold text-foreground">Why: </span>
                          <RichText>{step.why}</RichText>
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* ===== Troubleshooting ===== */}
            {guide.troubleshooting.length > 0 && (
              <section
                id="troubleshooting"
                className="viv-seam scroll-mt-24 border-y border-border bg-muted/20 py-12 md:py-16"
              >
                <div className="shell grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
                  <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
                    <span className="viv-eyebrow">If it goes wrong</span>
                    <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-balance md:text-[2.2rem]">
                      Troubleshooting
                    </h2>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      {guide.troubleshooting.length}{" "}
                      {guide.troubleshooting.length === 1 ? "entry" : "entries"}, written from the
                      places people actually get stuck in this lab.
                    </p>
                  </div>
                  <dl className="min-w-0 space-y-4">
                    {guide.troubleshooting.map((item) => (
                      <div key={item.problem} className="viv-card px-6 py-5">
                        <dt className="flex items-start gap-2.5 font-semibold">
                          <CircleHelp
                            className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-primary-ink)]"
                            aria-hidden="true"
                          />
                          <span className="min-w-0">
                            <RichText>{item.problem}</RichText>
                          </span>
                        </dt>
                        <dd className="mt-2 pl-[1.625rem] text-[15px] leading-relaxed text-muted-foreground">
                          <RichText>{item.fix}</RichText>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>
            )}

            {/* ===== Sources ===== */}
            {guide.furtherReading.length > 0 && (
              <section id="sources" className="scroll-mt-24 py-12 md:py-16">
                <div className="shell grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
                  <div className="min-w-0">
                    <span className="viv-eyebrow">Sources</span>
                    <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-balance md:text-[2.2rem]">
                      Where this comes from
                    </h2>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      The published work behind the method, so you can check it rather than take it
                      on trust.
                    </p>
                  </div>
                  <ul className="min-w-0 space-y-2.5">
                    {/* One guide's further reading carries an internal link to
                        the catalogue rather than a citation. Rendering it with
                        an external-link icon and "opens in a new tab" would
                        describe it as something it is not. */}
                    {guide.furtherReading.map((ref) => {
                      const external = /^https?:\/\//i.test(ref.href);
                      const Icon = external ? ExternalLink : BookOpen;
                      const body = (
                        <>
                          <Icon
                            className="mt-1 h-4 w-4 shrink-0 text-[color:var(--color-primary-ink)]"
                            aria-hidden="true"
                          />
                          <span className="min-w-0">
                            {ref.label}
                            {external && <span className="sr-only"> (opens in a new tab)</span>}
                          </span>
                        </>
                      );
                      const className =
                        "viv-card flex items-start gap-3 px-5 py-4 text-[15px] leading-relaxed transition-colors hover:border-[color:var(--color-primary)]";
                      return (
                        <li key={ref.href}>
                          {external ? (
                            <a href={ref.href} target="_blank" rel="noopener noreferrer" className={className}>
                              {body}
                            </a>
                          ) : (
                            <Link href={ref.href} className={className}>
                              {body}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            )}
          </>
        ) : (
          /*
            A lab in the catalogue with no authored guide module yet. The page
            still exists and still says what the catalogue knows — it just does
            not pretend to a method it has not been given.
          */
          <section className="py-12 md:py-16">
            <div className="shell max-w-[70ch]">
              <p className="leading-relaxed text-muted-foreground">
                {lab.description ?? lab.synopsis ?? "A guided laboratory on this subject."}
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                The step-by-step guide for this laboratory has not been published yet. The lab
                itself is listed in the{" "}
                <Link href="/labs" className="font-semibold text-[color:var(--color-primary-ink)] hover:underline">
                  catalogue
                </Link>
                .
              </p>
            </div>
          </section>
        )}

        {/* ===== Close ===== */}
        <section className="pb-4 pt-6">
          <div className="shell">
            <div className="viv-panel mx-auto max-w-4xl px-8 py-10 text-center md:px-12">
              <h2 className="text-2xl font-bold leading-[1.15] tracking-[-0.025em] text-balance md:text-[2rem]">
                {lab.status === "ACTIVE" ? "Ready to run it yourself?" : "Browse the rest of the catalogue"}
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted-foreground">
                {lab.status === "ACTIVE"
                  ? "You have read the method. Opening the lab environment needs an account and access to this laboratory."
                  : "This laboratory is not open yet. Every other lab publishes its method the same way."}
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                {lab.status === "ACTIVE" && (
                  <Link
                    href={runHref}
                    className="viv-btn group inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 font-semibold"
                  >
                    Open the lab
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                )}
                <Link href="/labs" className="viv-btn-ghost rounded-xl px-7 py-3.5 text-center font-semibold">
                  All laboratories
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <EditorialFooter />
    </>
  );
}

/** Guide prose: a blank line starts a new paragraph, as `LabSummary` documents. */
function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      {text.split(/\n\s*\n/).map((para) => (
        <p key={para} className="max-w-[68ch] leading-relaxed text-muted-foreground">
          <RichText>{para}</RichText>
        </p>
      ))}
    </div>
  );
}

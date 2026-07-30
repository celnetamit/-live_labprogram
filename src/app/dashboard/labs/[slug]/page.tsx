import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BarChart3,
  CheckCircle2,
  Clapperboard,
  ExternalLink,
  FlaskConical,
  ListChecks,
  Lock,
  Play,
} from "lucide-react";
import { hasLabAccess, parseList, formatPrice } from "@/lib/access";
import { getLabGuide } from "@/content/labs";
import CheckoutButton from "./CheckoutButton";
import DemoVideo from "./DemoVideo";
import SectionNav, { type Section } from "./SectionNav";
import TutorialSteps from "./TutorialSteps";
import {
  LabSummarySection,
  PrerequisitesSection,
  TroubleshootingSection,
} from "./LabGuideSections";

const DIFFICULTY_TONE: Record<string, string> = {
  Beginner: "text-[color:var(--color-success)] border-[color:color-mix(in_oklch,var(--color-success)_35%,transparent)]",
  Intermediate: "text-[color:var(--color-warning)] border-[color:color-mix(in_oklch,var(--color-warning)_35%,transparent)]",
  Advanced: "text-[color:var(--color-destructive)] border-[color:color-mix(in_oklch,var(--color-destructive)_35%,transparent)]",
};

/** One figure in the hero's at-a-glance row. */
function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Award;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-0.5 font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export default async function LabDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) redirect("/login");

  const lab = await prisma.lab.findUnique({ where: { slug } });
  if (!lab || !lab.enabled) notFound();

  const owned = await hasLabAccess(user.id, user.role, lab.id);
  const skills = parseList(lab.keySkills);
  const tags = parseList(lab.tags);
  const launchUrl = lab.id ? `/api/labs/${lab.slug}/launch` : null;
  const guide = getLabGuide(lab.slug);

  const sections: Section[] = guide
    ? [
        { id: "overview", label: "Overview" },
        { id: "demo", label: "Demo" },
        ...(guide.prerequisites.length ? [{ id: "prepare", label: "Before you start" }] : []),
        { id: "tutorial", label: "Tutorial" },
        ...(owned && guide.troubleshooting.length
          ? [{ id: "troubleshooting", label: "Troubleshooting" }]
          : []),
      ]
    : [];

  const price = formatPrice(lab.priceMinor, lab.currency);

  const videoLength = guide?.video.durationSec
    ? `${Math.floor(guide.video.durationSec / 60)}:${String(
        guide.video.durationSec % 60,
      ).padStart(2, "0")}`
    : null;

  const stats = [
    ...(guide ? [{ icon: ListChecks, value: `${guide.steps.length}`, label: "Steps" }] : []),
    videoLength
      ? { icon: Clapperboard, value: videoLength, label: "Demo" }
      : { icon: BarChart3, value: lab.difficulty ?? "—", label: "Level" },
    { icon: Award, value: `${lab.points}`, label: "Points" },
  ];

  /**
   * The launch link. `width` differs by placement: the hero sizes to content
   * from `sm` up, while the sticky rail and the mobile action bar always fill
   * their container.
   */
  const launchButton = (width: "auto" | "full") =>
    launchUrl ? (
      <a
        href={launchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn-brand inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          width === "full" ? "w-full" : "w-full sm:w-auto"
        }`}
      >
        Launch lab <ExternalLink className="h-4 w-4" />
      </a>
    ) : (
      <span className="text-sm text-muted-foreground">No launch URL configured.</span>
    );

  return (
    /* Bottom padding clears the fixed mobile action bar. */
    <div className="mx-auto max-w-7xl pb-24 xl:pb-0">
      <Link
        href="/dashboard/labs"
        className="-ml-2 mb-2 inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-4 w-4" /> Back to catalog
      </Link>

      {/* Hero */}
      <header className="glass brand-ring relative overflow-hidden rounded-2xl p-5 sm:p-7">
        <div className="aurora-blob animate-aurora bg-brand-1 -top-24 -right-10 h-72 w-72 opacity-30" />
        {/*
          Two columns from `lg`: the copy never needs the full width at this
          size, and the right half was empty. A poster preview there shows the
          learner what the lab actually looks like before they commit.
        */}
        <div className="relative lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
          <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <FlaskConical className="h-3.5 w-3.5" />
              {lab.subject ?? "General"}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                DIFFICULTY_TONE[lab.difficulty ?? ""] ?? "border-border text-muted-foreground"
              }`}
            >
              {lab.difficulty ?? "Beginner"}
            </span>
            {owned ? (
              <span className="pill border-[color:color-mix(in_oklch,var(--color-success)_40%,transparent)] text-[color:var(--color-success)]">
                Owned
              </span>
            ) : (
              <span className="pill border-border text-muted-foreground">Locked</span>
            )}
          </div>

          <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {lab.name}
          </h1>
          {/* The guide's own tagline when it has one — the seeded synopsis is
              generic marketing copy that tells a newcomer very little. */}
          <p className="mt-2.5 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            {guide?.summary.tagline ?? lab.synopsis ?? lab.description}
          </p>

          {/*
            At a glance. Built as a list so the column count follows the number
            of tiles — a fixed 4-up grid left a hole once the duration tile was
            dropped.
          */}
          <div
            className={`mt-5 grid grid-cols-2 gap-2 sm:gap-3 ${
              stats.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
            }`}
          >
            {stats.map((s) => (
              <Stat key={s.label} icon={s.icon} value={s.value} label={s.label} />
            ))}
          </div>

          {/*
            Owners only. The hero used to carry the price and an Unlock button
            for locked visitors; the purchase path still lives in the sticky
            rail, the mobile bar and the paywall panel below.
          */}
          {owned && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              {launchButton("auto")}
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-[color:var(--color-success)]" />
                Opens in a new tab
              </span>
            </div>
          )}

          {skills.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <li
                  key={s}
                  className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
          </div>

          {/*
            Poster preview. Anchors to the demo section rather than playing here
            — one player on the page, one place the video lives. Hidden below
            `lg`, where the real player is only a short scroll away anyway.
          */}
          {guide?.video.poster && (
            <a
              href="#demo"
              aria-label="Jump to the demo video"
              className="group relative hidden self-start overflow-hidden rounded-xl border border-border bg-black lg:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a local
                  static asset; next/image adds a loader for no benefit here. */}
              <img
                src={guide.video.poster}
                alt=""
                className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 grid place-items-center bg-black/30 transition-colors group-hover:bg-black/15">
                <span className="grid h-14 w-14 place-items-center rounded-full btn-brand shadow-lg">
                  <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
                </span>
              </span>
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-6 text-xs font-medium text-white">
                <span>Watch the walkthrough</span>
                {guide.video.durationSec ? (
                  <span className="tabular-nums">
                    {Math.floor(guide.video.durationSec / 60)}:
                    {String(guide.video.durationSec % 60).padStart(2, "0")}
                  </span>
                ) : null}
              </span>
            </a>
          )}
        </div>
      </header>

      {guide ? (
        <>
          <SectionNav sections={sections} variant="strip" />

          <div className="mt-4 grid gap-5 xl:mt-6 xl:grid-cols-[minmax(0,1fr)_16rem] xl:gap-6">
            <div className="min-w-0 space-y-5">
              <LabSummarySection guide={guide} />
              <DemoVideo video={guide.video} labName={lab.name} />
              <PrerequisitesSection guide={guide} />
              <TutorialSteps guide={guide} locked={!owned} />
              {owned && <TroubleshootingSection guide={guide} />}
              {!owned && (
                <section className="glass brand-ring rounded-2xl p-6 text-center sm:p-8">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
                    <Lock className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="mb-2 text-xl font-bold">Unlock the full lab</h2>
                  <p className="mx-auto mb-5 max-w-md text-muted-foreground">
                    Get the step-by-step instructions, the expected result for every step,
                    troubleshooting, and the live launch link.
                  </p>
                  <div className="text-gradient mb-5 text-3xl font-extrabold">{price}</div>
                  <CheckoutButton labId={lab.id} priceLabel={price} compact />
                  <p className="mt-4 text-xs text-muted-foreground">
                    One-time purchase · lifetime access to this lab
                  </p>
                </section>
              )}

              {owned && lab.starterCode && (
                <section className="glass rounded-2xl p-5 sm:p-6">
                  <h2 className="mb-3 text-base font-semibold sm:text-lg">Starter code</h2>
                  <pre className="overflow-x-auto rounded-lg border border-border bg-background/60 p-4 text-sm">
                    {lab.starterCode.trim()}
                  </pre>
                </section>
              )}
            </div>

            {/* Sticky rail. Only from `xl`, where taking 16rem off the content
                column still leaves comfortable measure for the prose. */}
            <aside className="hidden xl:block">
              <div className="sticky top-24 space-y-4">
                <div className="glass rounded-2xl p-3">
                  <SectionNav sections={sections} variant="rail" />
                </div>
                <div className="glass rounded-2xl p-4">
                  {owned ? (
                    <>
                      <p className="mb-3 text-sm text-muted-foreground">
                        Ready when you are — the tutorial assumes the lab is open alongside it.
                      </p>
                      {launchButton("full")}
                    </>
                  ) : (
                    <>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Full access
                      </p>
                      <p className="text-gradient my-1 text-2xl font-extrabold">{price}</p>
                      <p className="mb-3 text-xs text-muted-foreground">
                        One-time · lifetime access
                      </p>
                      <CheckoutButton labId={lab.id} priceLabel={price} />
                    </>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </>
      ) : (
        /* Labs with no authored guide keep the previous behaviour. */
        <div className="mt-5 space-y-5">
          {owned ? (
            <>
              {lab.instructions && (
                <section className="glass rounded-2xl p-5 sm:p-6">
                  <h2 className="mb-3 text-base font-semibold sm:text-lg">Instructions</h2>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                    {lab.instructions.trim()}
                  </pre>
                </section>
              )}
              {lab.starterCode && (
                <section className="glass rounded-2xl p-5 sm:p-6">
                  <h2 className="mb-3 text-base font-semibold sm:text-lg">Starter code</h2>
                  <pre className="overflow-x-auto rounded-lg border border-border bg-background/60 p-4 text-sm">
                    {lab.starterCode.trim()}
                  </pre>
                </section>
              )}
            </>
          ) : (
            <section className="glass brand-ring rounded-2xl p-6 text-center sm:p-8">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mb-2 text-xl font-bold">Unlock the full course</h2>
              <p className="mx-auto mb-5 max-w-md text-muted-foreground">
                Buy this course to access the instructions, starter code and the live launch link.
              </p>
              <div className="text-gradient mb-5 text-3xl font-extrabold">{price}</div>
              <CheckoutButton labId={lab.id} priceLabel={price} compact />
            </section>
          )}
        </div>
      )}

      {tags.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <li
              key={t}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              #{t}
            </li>
          ))}
        </ul>
      )}

      {/*
        Persistent action bar on narrow screens. The hero CTA scrolls away
        within one swipe on a phone, and on a page this long that leaves the
        primary action unreachable without scrolling back up.
      */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 p-3 backdrop-blur-md xl:hidden [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          {!owned && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted-foreground">Full access</p>
              <p className="font-bold leading-tight">{price}</p>
            </div>
          )}
          <div className={owned ? "flex-1" : "shrink-0"}>
            {owned ? launchButton("full") : <CheckoutButton labId={lab.id} priceLabel={price} />}
          </div>
        </div>
      </div>
    </div>
  );
}

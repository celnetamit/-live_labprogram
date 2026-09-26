import type { CSSProperties } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  CalendarClock,
  CheckCircle2,
  Clock,
  Clapperboard,
  ExternalLink,
  FlaskConical,
  ListChecks,
  Lock,
  Play,
} from "lucide-react";
import { formatPrice, hasLabAccess, parseList } from "@/lib/access";
import { formatLaunchDate } from "@/lib/labStatus";
import { getLabGuide, totalMinutes } from "@/content/labs";
import { labImage, labImageCredit, labImageEdge } from "@/lib/learnerLabs";
import { ProgressBar } from "@/components/learner-lab-card";
import AccessRequestPanel, { type AccessRequestState } from "./AccessRequestPanel";
import DemoVideo from "./DemoVideo";
import ShowcaseHero, {
  ShowcaseProgressBar,
  showcaseChromeCss,
  showcaseRootClass,
  showcaseVars,
} from "./ShowcaseHero";
import SectionNav, { type Section } from "./SectionNav";
import TutorialSteps from "./TutorialSteps";
import {
  LabSummarySection,
  LearningOutcomesSection,
  PrerequisitesSection,
  TroubleshootingSection,
} from "./LabGuideSections";

const DIFFICULTY_TONE: Record<string, string> = {
  Beginner: "text-[color:var(--color-success-ink)] border-[color:color-mix(in_oklch,var(--color-success)_35%,transparent)]",
  Intermediate: "text-[color:var(--color-warning-ink)] border-[color:color-mix(in_oklch,var(--color-warning)_35%,transparent)]",
  Advanced: "text-[color:var(--color-destructive-ink)] border-[color:color-mix(in_oklch,var(--color-destructive)_35%,transparent)]",
};

/*
  What unlocking a lab actually gives you. The paywall panel used to lead with
  the amount; it leads with the contents instead, which is the part a learner
  is deciding on. The charge is settled in the payment sheet.

  Each line names something the locked page does not already show — the step
  titles are public, their instructions, expected result and explanation are
  what `TutorialSteps` withholds. The panel's intro and the line under the
  button say nothing that is repeated here.
*/
function unlockIncludes(stepCount: number) {
  return [
    `The exact instructions for all ${stepCount} steps`,
    "What you should see after each one",
    "Why each step behaves the way it does",
    "Troubleshooting, and the live launch link",
  ];
}

/**
 * One figure in the hero's at-a-glance row.
 *
 * A cell in a divided strip, not a card of its own. As three separate
 * bordered boxes in a `grid-cols-2` they left the third tile alone in the
 * left column with an empty cell beside it at every phone width, and they
 * were a box inside a box inside the page.
 *
 * Value above label: the label was 11px uppercase over a 16px value, a ratio
 * of 1.45, so each tile read as a caption with a footnote rather than as the
 * number it exists to show.
 */
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
    <div className="min-w-0 flex-1 px-3 py-2.5 first:pl-0 sm:px-4">
      <p className="text-lg font-semibold leading-tight tabular-nums">{value}</p>
      <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate text-xs font-medium">{label}</span>
      </div>
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

  /* Rendered with the tutorial, so the steps arrive already ticked rather than
     flashing empty while a client fetch resolves. */
  const progressRow = await prisma.labProgress.findUnique({
    where: { userId_labSlug: { userId: user.id, labSlug: slug } },
    select: { completedSteps: true },
  });
  const serverCompleted = progressRow?.completedSteps ?? [];


  /*
    The learner's most recent request for this lab. Latest rather than "any
    pending": a rejection can be followed by a new request, so the newest row is
    the only one that describes where they actually stand.
  */
  const latestRequest = await prisma.accessRequest.findFirst({
    where: { userId: user.id, labId: lab.id },
    orderBy: { requestedAt: "desc" },
    select: { status: true, reviewedAt: true, notes: true },
  });
  const requestState: AccessRequestState =
    latestRequest?.status === "PENDING"
      ? "pending"
      : latestRequest?.status === "REJECTED"
        ? "rejected"
        : "none";
  /*
    The fee for this lab, shown on the lab page only — the catalogue and Explore
    stay free of amounts. Access is granted by an administrator rather than
    bought here, so the price is stated as information a learner needs before
    asking, not as a checkout. The wording says so, so nobody waits for a
    payment step that does not exist on this page.
  */
  const price = formatPrice(lab.priceMinor, lab.currency);

  /* The colour this lab's cover photograph ends in, so the hero is tinted by
     the same picture the catalogue card leads with. Null for a lab whose card
     is a screenshot; the hero then keeps the plain surface it always had. */
  const coverEdge = labImageEdge(slug);
  const coverPhoto = coverEdge ? labImage(slug, true) : null;
  const coverCredit = labImageCredit(slug);

  const requestProps = {
    labId: lab.id,
    state: requestState,
    reviewedAt: latestRequest?.reviewedAt?.toISOString() ?? null,
    note: latestRequest?.notes ?? null,
  };

  // Announced but not open yet: there is nothing to launch or buy, so the page
  // is just the pitch and the date.
  if (lab.status === "UPCOMING") {
    const launch = formatLaunchDate(lab.launchAt);
    return (
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/labs"
          className="-ml-2 mb-4 inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Labs
        </Link>

        <section className="panel">
          <div className="relative z-10 p-6 sm:p-8">
            {/* Token colours, not raw `sky-400`: a fixed palette class does not
                flip with the theme, and this one sat at about 2:1 on the light
                background. */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:color-mix(in_oklch,var(--color-info-ink)_30%,transparent)] bg-[color:color-mix(in_oklch,var(--color-info-ink)_10%,transparent)] px-3 py-1 text-xs font-medium text-[color:var(--color-info-ink)]">
              <CalendarClock className="h-3.5 w-3.5" /> Coming soon
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{lab.name}</h1>
            <p className="mt-2.5 max-w-2xl leading-relaxed text-muted-foreground">
              {lab.synopsis ?? lab.description ?? "This lab is being built."}
            </p>
            <p className="mt-5 text-sm text-muted-foreground">
              {launch ? (
                <>
                  Expected to open on{" "}
                  <span className="font-semibold text-foreground">{launch}</span>.
                </>
              ) : (
                "The launch date hasn't been announced yet."
              )}
            </p>
          </div>
        </section>
      </div>
    );
  }

  const owned = await hasLabAccess(user.id, user.role, lab.id);
  const skills = parseList(lab.keySkills);
  const tags = parseList(lab.tags);
  const launchUrl = lab.id ? `/api/labs/${lab.slug}/launch` : null;
  const guide = getLabGuide(lab.slug);
  /*
    The guide handed to `TutorialSteps` is redacted server-side when the lab is
    locked.

    `TutorialSteps` is a client component, so every prop it receives is
    serialised into the RSC payload whether the component renders it or not —
    its `locked` branch controls the DOM, not what was sent. The whole guide was
    being passed, so a learner without access could read every step's actions,
    expected result and explanation, plus the entire troubleshooting section,
    straight out of View Source. The UI hid it; the page shipped it.

    What survives the redaction is what the locked page shows on purpose: each
    step's title and goal, so the outline is browsable before you ask for
    access. Everything gated is removed from the object, not merely unrendered.
  */
  const tutorialGuide =
    guide && !owned
      ? {
          ...guide,
          steps: guide.steps.map((step) => ({
            title: step.title,
            goal: step.goal,
            minutes: step.minutes,
            actions: [],
            expect: "",
          })),
          troubleshooting: [],
        }
      : guide;

  const sections: Section[] = guide
    ? [
        { id: "overview", label: "Overview" },
        { id: "demo", label: "Demo" },
        ...(guide.prerequisites.length ? [{ id: "prepare", label: "Before you start" }] : []),
        { id: "tutorial", label: "Tutorial" },
        /* A showcase page moves the outcomes out of the overview into a
           panel of their own, after the tutorial. */
        ...(guide.showcase ? [{ id: "outcomes", label: "Learning outcomes" }] : []),
        ...(owned && guide.troubleshooting.length
          ? [{ id: "troubleshooting", label: "Troubleshooting" }]
          : []),
      ]
    : [];

  /*
   * A runtime is only shown when there is something to run. `durationSec` is
   * also set on a guide whose video is still to be recorded — the chapter list
   * is useful before the file exists — and advertising "Demo 4:00" in the hero
   * for a video that is not there promises the learner something the page
   * cannot deliver.
   */
  const videoLength =
    guide?.video.url && guide.video.durationSec
      ? `${Math.floor(guide.video.durationSec / 60)}:${String(
          guide.video.durationSec % 60,
        ).padStart(2, "0")}`
      : null;

  /*
    No points tile. Nothing in the platform ever awards points — every reference
    to `Lab.points` is a read — so the figure measured nothing. The hands-on time
    the guide actually adds up to is a real number and more use to a learner
    deciding whether to start now.
  */
  /*
    Progress for the hero. Counted against the guide's current length rather
    than any stored total, and indices outside it are dropped: a guide that
    gained a step since the learner last worked means they are genuinely no
    longer finished, and 100% would hide the new step from them. Same rule as
    `buildLearnerLab`, which is what the catalogue card counted with.
  */
  const heroSteps = guide?.steps.length ?? 0;
  const heroDone = new Set(serverCompleted.filter((n) => n >= 0 && n < heroSteps)).size;
  const heroPercent = heroSteps ? Math.round((heroDone / heroSteps) * 100) : 0;

  const guideMinutes = guide ? totalMinutes(guide) : 0;
  const handsOn = guideMinutes
    ? guideMinutes >= 60
      ? `${Math.floor(guideMinutes / 60)}h ${guideMinutes % 60}m`
      : `${guideMinutes}m`
    : null;
  /* The editorial hero needs the photograph it is built on. */
  const showcase = guide?.showcase ?? null;
  /*
    Only figures that exist.

    "Level" used to fill two independent slots — once when there was no video,
    once when the guide carried no timings — so a lab with neither rendered it
    twice, side by side, with the same React key. It was duplication even when
    it appeared once: the difficulty already has a chip a few pixels above.
  */
  const stats = [
    ...(guide ? [{ icon: ListChecks, value: `${guide.steps.length}`, label: "Steps" }] : []),
    ...(videoLength ? [{ icon: Clapperboard, value: videoLength, label: "Demo" }] : []),
    ...(guideMinutes
      ? [
          {
            icon: Clock,
            value: handsOn!,
            label: "Hands-on",
          },
        ]
      : []),
  ];

  /**
   * The launch link. `width` differs by placement: the hero sizes to content
   * from `sm` up, while the sticky rail and the mobile action bar always fill
   * their container.
   */
  /*
    The catalogue card's verb for where this learner is. A showcase page uses
    it on every launch control — hero, rail and mobile bar — so one page does
    not offer the same link under two names.
  */
  const startLabel =
    heroSteps && heroDone >= heroSteps ? "Review lab" : heroDone > 0 ? "Resume lab" : "Start lab";

  const launchButton = (width: "auto" | "full") =>
    launchUrl ? (
      /*
        The dashboard already links this exact href, and calls it "Open the
        lab" on a flat `bg-primary` button. This one said "Launch lab" on a
        `btn-brand` gradient — so a learner who pressed "Start lab" on a card
        reached a page offering a third verb for the same action, in a fourth
        shape. The gradient also failed contrast: `--primary-foreground` over
        it runs 5.07:1 at the violet end down to 3.20:1 at the blue end in the
        light theme, and the centred label sits in the failing half.
      */
      <a
        href={launchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`focus-ring inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 ${
          width === "full" ? "w-full" : "w-full sm:w-auto"
        }`}
      >
        {showcase ? startLabel : "Open the lab"} <ExternalLink className="h-4 w-4" />
      </a>
    ) : (
      <span className="text-sm text-muted-foreground">No launch URL configured.</span>
    );

  return (
    /* Bottom padding clears the fixed mobile action bar. */
    <div
      /* The bar is ~98px with the safe-area inset and ~130px once a failed
         request adds its error line; a flat `pb-24` was 96. */
      className={`mx-auto max-w-7xl pb-[calc(8rem+env(safe-area-inset-bottom))] xl:pb-0 ${showcase ? showcaseRootClass : ""}`}
      /*
        The lab's own colour, published once for the whole page.

        `--lab-tint` inherits, and `.panel` in `globals.css` paints it behind
        every panel's content, so the page is coloured by the same photograph
        the catalogue card leads with rather than being a tinted hero above a
        stack of plain grey boxes. A lab with no cover photograph never sets
        it and every panel falls back to `transparent`.

        A showcase lab does not take the tint: its design sets its own neutral
        surfaces and carries the photograph's colour in a palette of accents
        instead, and the two together turned every panel maroon.
      */
      style={
        showcase
          ? showcaseVars(showcase)
          : coverEdge
            ? ({ "--lab-tint": coverEdge.color } as CSSProperties)
            : undefined
      }
    >
      {showcase && <style>{showcaseChromeCss(showcase)}</style>}
      <Link
        href="/dashboard/labs"
        className="-ml-2 mb-4 inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My Labs
      </Link>

      {/*
        Hero.

        Previously `glass brand-ring` over an animated aurora blob. All three
        went: the review asked for a plainer, human-designed surface and named
        glassmorphism and decorative glow specifically, and the hero now has
        the lab's own photographic colour to distinguish it, which means
        something. Its weight comes from the headline and the poster instead.
      */}
      {showcase && coverPhoto ? (
        <ShowcaseHero
          name={lab.name}
          subject={lab.subject}
          difficulty={lab.difficulty}
          showcase={showcase}
          photo={coverPhoto}
          credit={coverCredit?.text ?? null}
          videoLength={videoLength}
          steps={guide?.steps.length ?? 0}
          handsOn={handsOn}
          owned={owned}
          startLabel={startLabel}
          launchUrl={launchUrl}
          requestState={requestState}
          progress={owned && heroSteps ? { done: heroDone, total: heroSteps, percent: heroPercent } : null}
        />
      ) : (
      <header className="panel overflow-hidden">
        {/*
          The photograph the page's colour is taken from.

          The tint was being read off a cover the route never displayed, so a
          learner saw a mauve page with no idea why. Cropped to its bottom
          edge on purpose: `edge` is sampled from the last 4% of the picture's
          rows, which is exactly the band showing here, so the seam into the
          tinted panel below is the same colour on both sides and there is no
          line across it. `z-10` because the tint layers are absolutely
          positioned and would otherwise paint over the picture.
        */}
        {coverPhoto && (
          <div className="relative z-10 h-20 w-full sm:h-28">
            <Image
              src={coverPhoto}
              alt=""
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1000px"
              className="object-cover object-bottom"
            />
            {/* The card is no longer the only place these appear, so the
                source line has to be here too. */}
            {coverCredit && (
              <span
                title={coverCredit.text}
                style={{
                  backgroundImage: `linear-gradient(to top, ${coverEdge!.color} 60%, color-mix(in srgb, ${coverEdge!.color} 50%, transparent) 85%, transparent)`,
                  color: coverEdge!.isLight ? "rgba(0,0,0,0.78)" : "rgba(255,255,255,0.92)",
                }}
                className="absolute inset-x-0 bottom-0 line-clamp-1 px-4 pb-1 pt-5 text-[10px] font-medium leading-tight"
              >
                {coverCredit.text}
              </span>
            )}
          </div>
        )}
        {/*
          Two columns from `lg`: the copy never needs the full width at this
          size, and the right half was empty. A poster preview there shows the
          learner what the lab actually looks like before they commit.
        */}
        {/*
          Split at `xl`, not `lg`. The shell's 16rem sidebar arrives at
          exactly 1024px, so splitting at `lg` handed 320px to a decorative
          poster and left the title, tagline, stat strip, CTA and skills
          sharing about 294px. At `xl` the copy column keeps ~550px.
        */}
        <div className="relative z-10 p-5 sm:p-7 xl:grid xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-8">
          <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-primary-ink)]">
              <FlaskConical className="h-3.5 w-3.5" />
              {lab.subject ?? "General"}
            </span>
            {/*
              One chip spec, the catalogue's. This row held three: a 12px/600
              uppercase eyebrow, a 12px/500 bordered capsule and `.pill` at
              11.2px/600 with a glowing dot. The eyebrow keeps its own look
              because it has a different job; the other two now agree.
            */}
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                DIFFICULTY_TONE[lab.difficulty ?? ""] ?? "border-border text-muted-foreground"
              }`}
            >
              {lab.difficulty ?? "Beginner"}
            </span>
            {!owned && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Lock className="h-3 w-3" /> Locked
              </span>
            )}
          </div>

          <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {lab.name}
          </h1>
          {/* The guide's own tagline when it has one — the seeded synopsis is
              generic marketing copy that tells a newcomer very little. */}
          {/* `max-w-xl` measures about 72 characters a line in Inter at this
              size; `max-w-2xl` measured 89, and only bound on labs with no
              poster, so two labs read at noticeably different widths. */}
          <p className="mt-2.5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            {guide?.summary.tagline ?? lab.synopsis ?? lab.description}
          </p>

          {/*
            At a glance. Built as a list so the column count follows the number
            of tiles — a fixed 4-up grid left a hole once the duration tile was
            dropped.
          */}
          {stats.length > 0 && (
            <div className="mt-5 flex divide-x divide-border border-y border-border py-1">
              {stats.map((s) => (
                <Stat key={s.label} icon={s.icon} value={s.value} label={s.label} />
              ))}
            </div>
          )}

          {/*
            Owners only. The hero used to carry an Unlock button for locked
            visitors; the purchase path still lives in the sticky rail, the
            mobile bar and the paywall panel below.
          */}
          {/*
            Where this learner actually is, at the top of the page.

            `serverCompleted` and the guide are both already loaded, and the
            catalogue card the learner just clicked showed exactly this line —
            but the page replaced it with a binary "Owned" badge and buried
            the real figure under the overview and the demo.
          */}
          {owned && guide && guide.steps.length > 0 && (
            <div className="mt-5 max-w-sm">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {heroDone} of {guide.steps.length} steps
                </span>
                {heroDone >= guide.steps.length ? (
                  <span className="inline-flex items-center gap-1 font-medium text-[color:var(--color-success-ink)]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                  </span>
                ) : heroDone > 0 ? (
                  <span className="font-medium text-primary">In progress</span>
                ) : (
                  <span>Not started</span>
                )}
              </div>
              <ProgressBar percent={heroPercent} />
            </div>
          )}

          {owned && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              {launchButton("auto")}
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-[color:var(--color-success-ink)]" />
                Opens in a new tab
              </span>
            </div>
          )}

          {skills.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <li
                  key={s}
                  /* A hairline, not a fill: an opaque `bg-secondary` chip
                     sits above the panel's tint layers and stayed cool grey
                     on a warm surface. */
                  className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
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
              className="focus-ring group relative hidden self-start overflow-hidden rounded-xl border border-border bg-black xl:block"
            >
              {/* The posters are 1280x720 and this slot is the 20rem column,
                  so a raw <img> downloaded about four times the pixels it
                  draws, with no AVIF/WebP — on a desktop this is the largest
                  element in the viewport. */}
              <Image
                src={guide.video.poster}
                alt=""
                width={640}
                height={360}
                sizes="320px"
                className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 grid place-items-center bg-black/30 transition-colors group-hover:bg-black/15">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
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
      )}

      {guide ? (
        <>
          <SectionNav sections={sections} variant="strip" />

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_16rem]">
            <div className="min-w-0 space-y-6">
              <LabSummarySection guide={guide} />
              <DemoVideo
                video={guide.video}
                labName={lab.name}
                cover={showcase && coverPhoto ? { image: coverPhoto, title: showcase.walkthroughTitle } : undefined}
              />
              <PrerequisitesSection guide={guide} />
              <TutorialSteps guide={tutorialGuide!} locked={!owned} serverCompleted={serverCompleted} />
              {showcase && <LearningOutcomesSection guide={guide} />}
              {owned && <TroubleshootingSection guide={guide} />}
              {!owned && (
                <section id="access" className="panel scroll-mt-32" aria-labelledby="unlock-heading">
                  <div className="relative z-10 p-6 text-center sm:p-8">
                  <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-muted/50">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <h2 id="unlock-heading" className="mb-2 text-lg font-semibold tracking-tight">
                    Request access to this lab
                  </h2>
                  <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                    You have the overview and the demo. Approved access opens the rest:
                  </p>
                  {/* What access opens up, in place of the amount. */}
                  <ul className="mx-auto mb-6 grid max-w-md gap-2 text-left sm:grid-cols-2">
                    {unlockIncludes(guide.steps.length).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-success-ink)]" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mb-1 text-2xl font-semibold tabular-nums">{price}</p>
                  <p className="mb-5 text-xs text-muted-foreground">
                    One-time fee · access granted by an administrator
                  </p>
                  <AccessRequestPanel {...requestProps} compact />
                  </div>
                </section>
              )}

              {owned && lab.starterCode && (
                <section className="panel" aria-labelledby="starter-heading">
                  <div className="relative z-10 p-5 sm:p-6">
                    <h2 id="starter-heading" className="mb-3 text-lg font-semibold tracking-tight">
                      Starter code
                    </h2>
                    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-sm">
                      {lab.starterCode.trim()}
                    </pre>
                  </div>
                </section>
              )}
            </div>

            {/* Sticky rail. Only from `xl`, where taking 16rem off the content
                column still leaves comfortable measure for the prose. */}
            <aside className="hidden xl:block">
              <div className="sticky top-24 space-y-4">
                {showcase ? (
                  /*
                    The design's rail: the contents and the learner's progress
                    in one panel. Progress is shown to a locked visitor too, at
                    zero — it tells them the lab tracks their steps — with
                    wording that does not invite them to begin what they
                    cannot yet open.
                  */
                  <div className="panel">
                    <div className="relative z-10 p-4">
                      <SectionNav sections={sections} variant="rail" appearance="showcase" />
                      {heroSteps > 0 && (
                        <div className="sc-progress-card">
                          <small>Your progress</small>
                          <strong>
                            {!owned
                              ? `Request access to begin the ${showcase.journey} journey.`
                              : heroDone >= heroSteps
                                ? "Every step complete."
                                : heroDone > 0
                                  ? `${heroSteps - heroDone} ${heroSteps - heroDone === 1 ? "step" : "steps"} to go.`
                                  : `Ready to begin the ${showcase.journey} journey.`}
                          </strong>
                          <ShowcaseProgressBar percent={owned ? heroPercent : 0} />
                          <div className="sc-progress-meta">
                            <span>
                              {owned ? heroDone : 0} of {heroSteps} steps
                            </span>
                            <span className="tabular-nums">{owned ? heroPercent : 0}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="panel">
                    <div className="relative z-10 p-3">
                      <SectionNav sections={sections} variant="rail" />
                    </div>
                  </div>
                )}
                <div className="panel">
                  <div className="relative z-10 p-4">
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
                      <p className="my-1 text-xl font-semibold tabular-nums">{price}</p>
                      {/* The panel below lists what access opens and repeats
                          this caption verbatim; at `xl` both are on screen at
                          once, so the rail states the amount and stops. */}
                      <p className="mb-3 mt-1 text-xs text-muted-foreground">
                        One-time fee, granted by an administrator
                      </p>
                      <AccessRequestPanel {...requestProps} variant="rail" />
                    </>
                  )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </>
      ) : (
        /* Labs with no authored guide keep the previous behaviour. */
        <div className="mt-6 space-y-6">
          {owned ? (
            <>
              {lab.instructions && (
                <section className="panel" aria-labelledby="instructions-heading">
                  <div className="relative z-10 p-5 sm:p-6">
                    <h2
                      id="instructions-heading"
                      className="mb-3 text-lg font-semibold tracking-tight"
                    >
                      Instructions
                    </h2>
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                      {lab.instructions.trim()}
                    </pre>
                  </div>
                </section>
              )}
              {lab.starterCode && (
                <section className="panel" aria-labelledby="starter-heading">
                  <div className="relative z-10 p-5 sm:p-6">
                    <h2 id="starter-heading" className="mb-3 text-lg font-semibold tracking-tight">
                      Starter code
                    </h2>
                    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-sm">
                      {lab.starterCode.trim()}
                    </pre>
                  </div>
                </section>
              )}
            </>
          ) : (
            <section className="panel" aria-labelledby="unlock-heading">
              <div className="relative z-10 p-6 text-center sm:p-8">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-muted/50">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h2 id="unlock-heading" className="mb-2 text-lg font-semibold tracking-tight">
                Request access to this lab
              </h2>
              <p className="mx-auto mb-5 max-w-md text-muted-foreground">
                Access opens the instructions, the starter code and the live launch link. An
                administrator reviews each request.
              </p>
              <AccessRequestPanel {...requestProps} compact />
              </div>
            </section>
          )}
        </div>
      )}

      {/*
        Topics. The hash is gone: nothing else in the product prefixes
        anything with one, and it promised a filter these chips do not
        perform — they are list items, not links. Same chip as the skills
        above and as the catalogue card, rather than a third padding and
        size for the same kind of thing.
      */}
      {tags.length > 0 && (
        <section className="mt-8" aria-labelledby="topics-heading">
          <h2 id="topics-heading" className="mb-2.5 text-sm font-semibold">
            Topics
          </h2>
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/*
        Persistent action bar on narrow screens. The hero CTA scrolls away
        within one swipe on a phone, and on a page this long that leaves the
        primary action unreachable without scrolling back up.
      */}
      {/*
        `left-0 lg:left-64`, not `inset-x-0`: the shell offsets its content by
        `lg:pl-64` from 1024px, but this bar is live up to 1279px, so across
        that band its blurred surface ran the full viewport width and was
        sliced by the fixed sidebar above it, while its centred inner sat
        128px left of the content it belongs to.
      */}
      <div
        role="region"
        aria-label="Lab actions"
        className="lab-tinted fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background p-3 lg:left-64 xl:hidden [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]"
      >
        {/*
            Capped and centred rather than stretched — this bar runs up to `xl`,
            and a full-bleed control on a tablet is a very long way for one
            label. The price sits beside the button for a learner who never
            scrolls as far as the panel.
        */}
        <div className="relative z-10 mx-auto flex w-full max-w-md items-center gap-3">
          {!owned && (
            <div className="min-w-0 shrink-0">
              <p className="truncate text-[11px] text-muted-foreground">One-time fee</p>
              <p className="font-semibold leading-tight tabular-nums">{price}</p>
            </div>
          )}
          <div className="min-w-0 flex-1">
            {owned ? launchButton("full") : <AccessRequestPanel {...requestProps} variant="bar" />}
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  BookOpen,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  FlaskConical,
  Lightbulb,
  Target,
  Users,
  Wrench,
} from "lucide-react";
import type { LabGuide } from "@/content/labs";
import { RichText } from "@/components/rich-text";
import { SHOWCASE_ICONS, SHOWCASE_TONES } from "./ShowcaseHero";

/**
 * Shared section chrome: one surface, one heading treatment, one scroll offset.
 *
 * `.panel` is defined once in `globals.css` and carries the cover-photograph
 * tint for every panel on the page. Its two tint layers are pseudo-elements,
 * so everything written here has to sit in the `relative z-10` wrapper below —
 * otherwise the blend lands on the text instead of the surface.
 */
function Panel({
  id,
  icon: Icon,
  title,
  children,
  aside,
}: {
  id: string;
  icon: typeof BookOpen;
  title: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    /* The sticky stack below `xl` is the 64px shell header plus the 55px
       section strip; `scroll-mt-24` (96px) parked each panel 23px behind it,
       clipping the very heading you navigated to. */
    <section
      id={id}
      className="panel scroll-mt-[8.5rem] xl:scroll-mt-24"
      aria-labelledby={headingId}
    >
      <div className="relative z-10 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2
            id={headingId}
            className="panel-heading flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            {/* A bare icon here; `.showcase-scope` draws it a tile. */}
            <span aria-hidden className="panel-heading-icon">
              <Icon className="h-[1.125rem] w-[1.125rem] shrink-0 text-[color:var(--color-primary-ink)]" />
            </span>{" "}
            {title}
          </h2>
          {aside}
        </div>
        {children}
      </div>
    </section>
  );
}

/**
 * A sub-heading inside a panel.
 *
 * Set well below the panel's own `h2` rather than one notch under it. These
 * were `text-sm font-semibold` — the same weight as the heading above them and
 * nearly the same size, so four headings on one panel all read as the same
 * level and nothing looked subordinate to anything.
 */
function FieldLabel({
  icon: Icon,
  tone = "text-[color:var(--color-primary-ink)]",
  children,
}: {
  icon: typeof BookOpen;
  tone?: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className={`h-3.5 w-3.5 shrink-0 ${tone}`} />
      {children}
    </h3>
  );
}

/** Why the lab matters and who it is for, as one banded row. */
function WhyAndWho({ guide }: { guide: LabGuide }) {
  const { summary } = guide;
  return (
    /*
      Two fields in one banded row rather than two cards.

      As bordered boxes in a stretch grid they were forced to equal height,
      so whichever paragraph was shorter ended in a visible pocket of empty
      box. A rule between two columns carries the same separation and has
      no bottom edge to leave hanging.
    */
    <div className="grid gap-5 border-y border-border py-5 md:grid-cols-2 md:gap-0 md:divide-x md:divide-border">
      <div className="md:pr-6">
        <FieldLabel icon={Lightbulb} tone="text-[color:var(--color-warning-ink)]">
          Why it matters
        </FieldLabel>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <RichText>{summary.why}</RichText>
        </p>
      </div>
      <div className="md:pl-6">
        <FieldLabel icon={Users}>Who it&apos;s for</FieldLabel>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <RichText>{summary.whoFor}</RichText>
        </p>
      </div>
    </div>
  );
}

/**
 * A checklist, not a grid of cards. Each outcome was previously its own
 * bordered, filled box — a third level of container inside a panel inside
 * the page, for one line of text apiece.
 */
function OutcomeList({ guide }: { guide: LabGuide }) {
  return (
    <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
      {guide.summary.outcomes.map((outcome) => (
        <li key={outcome} className="flex gap-2.5 text-sm text-muted-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-success-ink)]" />
          <span className="leading-relaxed">
            <RichText>{outcome}</RichText>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The public half of a guide: what the lab is, why it matters, who it is for,
 * and what you will be able to do. Rendered for locked visitors too — a
 * prospective learner cannot judge a lab from its title alone.
 *
 * A showcase lab gets the design's short version instead — two paragraphs
 * and four feature cards — and its why, audience and outcomes move to
 * `LearningOutcomesSection`, so nothing the guide says is dropped.
 */
export function LabSummarySection({ guide }: { guide: LabGuide }) {
  const { summary, showcase } = guide;

  if (showcase) {
    return (
      <Panel id="overview" icon={FlaskConical} title="About this lab">
        <div className="sc-about">
          {showcase.about.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>
        {/*
          A container query rather than a breakpoint: the column this sits in
          is narrowed by the shell's sidebar from `lg` and by the rail from
          `xl`, so the viewport says little about how wide four cards would
          actually be.
        */}
        <div className="@container">
          <ul className="sc-feature-grid">
            {showcase.features.map((f, i) => {
              const Icon = SHOWCASE_ICONS[f.icon];
              return (
                <li key={f.title} className={`sc-feature sc-tone-${SHOWCASE_TONES[i % 4]}`}>
                  <span aria-hidden className="sc-feature-icon">
                    <Icon />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </Panel>
    );
  }

  return (
    <Panel id="overview" icon={BookOpen} title="About this lab">
      <div className="space-y-5">
        {/*
          Capped at about 70 characters a line, measured rather than assumed:
          `ch` is the width of the digit "0" (0.556em in Inter), not of an
          average letter (~0.477em), so `58ch` renders at roughly 69 and the
          `68ch` this started as rendered at 81. Uncapped it ran the full
          column — 91 characters at 1280px and 140 at 1920px — and the eye
          loses the return on lines that long.
        */}
        <p className="max-w-[58ch] text-[15px] leading-relaxed text-pretty text-muted-foreground">
          <RichText>{summary.what}</RichText>
        </p>

        <WhyAndWho guide={guide} />

        <div>
          {/* A rung above the two field labels, not level with them: this
              heading governs the list a locked visitor is deciding on. */}
          <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold">
            <Target className="h-4 w-4 shrink-0 text-[color:var(--color-primary-ink)]" /> What you&apos;ll be able to do
          </h3>
          <OutcomeList guide={guide} />
        </div>
      </div>
    </Panel>
  );
}

/**
 * Showcase labs only: the guide's why, audience and outcomes, which the
 * design's shorter "About this lab" no longer carries.
 */
export function LearningOutcomesSection({ guide }: { guide: LabGuide }) {
  return (
    <Panel id="outcomes" icon={Target} title="Learning outcomes">
      <div className="space-y-5">
        <OutcomeList guide={guide} />
        <WhyAndWho guide={guide} />
      </div>
    </Panel>
  );
}

export function PrerequisitesSection({ guide }: { guide: LabGuide }) {
  if (guide.prerequisites.length === 0) return null;

  return (
    <Panel id="prepare" icon={ClipboardList} title="Before you start">
      <ul className="space-y-2">
        {guide.prerequisites.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-muted-foreground">
            <span
              aria-hidden
              className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
            />
            <span className="leading-relaxed">
              <RichText>{item}</RichText>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function TroubleshootingSection({ guide }: { guide: LabGuide }) {
  if (guide.troubleshooting.length === 0) return null;

  return (
    <Panel
      id="troubleshooting"
      icon={Wrench}
      title="Troubleshooting"
      aside={
        <span className="text-xs text-muted-foreground">
          {guide.troubleshooting.length} common issues
        </span>
      }
    >
      {/*
        Collapsed by default. This is reference material you reach for when
        something has already gone wrong — expanded, it buries the sections
        after it under a wall of text nobody is reading yet.
      */}
      <div className="divide-y divide-border rounded-lg border border-border">
        {guide.troubleshooting.map((item) => (
          <details key={item.problem} className="group first:rounded-t-lg last:rounded-b-lg">
            <summary className="focus-ring flex cursor-pointer list-none items-start gap-2.5 p-3.5 text-sm font-medium marker:hidden hover:bg-muted/40">
              <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-primary-ink)]" />
              <span className="flex-1 leading-snug">
                <RichText>{item.problem}</RichText>
              </span>
              <span
                aria-hidden
                className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-3.5 pb-3.5 pl-[2.6rem] text-sm leading-relaxed text-muted-foreground">
              <RichText>{item.fix}</RichText>
            </p>
          </details>
        ))}
      </div>
    </Panel>
  );
}

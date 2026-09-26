import Image from "next/image";
import { ArrowRight, ChartColumn, CirclePlay, Dna, Lightbulb, Locate, Play } from "lucide-react";
import type { LabShowcase } from "@/content/labs";
export { showcaseChromeCss, showcaseRootClass, showcaseVars } from "@/lib/showcase";
import type { AccessRequestState } from "./AccessRequestPanel";

export const SHOWCASE_ICONS = {
  sequence: Dna,
  analysis: ChartColumn,
  simulation: Locate,
  insight: Lightbulb,
} as const;

/** Card order is palette order, so card n always wears accent n. */
export const SHOWCASE_TONES = ["primary", "secondary", "action", "quiet"] as const;

type Props = {
  name: string;
  subject: string | null;
  difficulty: string | null;
  showcase: LabShowcase;
  photo: string;
  credit: string | null;
  videoLength: string | null;
  steps: number;
  handsOn: string | null;
  owned: boolean;
  /** The catalogue card's verb for this learner: Start, Resume or Review lab. */
  startLabel: string;
  launchUrl: string | null;
  requestState: AccessRequestState;
  progress: { done: number; total: number; percent: number } | null;
};

/**
 * The editorial hero: the lab's cover photograph full-bleed under a scrim,
 * copy on the left, the walkthrough on the right.
 *
 * The surface is dark in both themes. It is a photograph, and the scrim is
 * what every text colour here is measured against — so these colours are
 * fixed rather than theme tokens, and the light theme meets the page again
 * at the hero's edge.
 */
export default function ShowcaseHero(props: Props) {
  const { showcase, owned } = props;

  /*
    The wordmark is authored separately from `Lab.name`, which an admin can
    change. If they no longer spell the same thing, the heading falls back to
    the real name rather than advertising one the rest of the hub does not use.
  */
  const wordmark = showcase.title.map((s) => s.text).join("");
  const title =
    wordmark === props.name
      ? showcase.title.map((s, i) => (
          <span key={i} className={s.accent ? `sc-title-${s.accent}` : undefined}>
            {s.text}
          </span>
        ))
      : props.name;

  const stats = [
    { value: String(props.steps), label: "Guided lab steps" },
    ...(props.handsOn ? [{ value: props.handsOn, label: "Hands-on time" }] : []),
    ...(props.difficulty ? [{ value: props.difficulty, label: "Difficulty level" }] : []),
  ];

  /*
    One primary action per state. A locked visitor gets a way forward from the
    hero too — the design leads with a button, and a hero whose only control
    is "watch a video" reads as a page that cannot be used. It anchors to the
    request panel rather than duplicating the request form here.
  */
  const primary = owned
    ? props.launchUrl && (
        <a
          href={props.launchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="sc-btn sc-btn-primary focus-ring"
        >
          {props.startLabel}
          <ArrowRight className="h-[17px] w-[17px]" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )
    : (
        <a href="#access" className="sc-btn sc-btn-primary focus-ring">
          {props.requestState === "pending" ? "View your request" : "Request access"}
          <ArrowRight className="h-[17px] w-[17px]" />
        </a>
      );

  return (
    <header className="showcase-hero">
      <Image
        src={props.photo}
        alt=""
        fill
        /* `loading`, not the deprecated `priority`: both copies of the
           micrograph are above the fold, and either can be the LCP element
           depending on the viewport, which rules out `preload`. */
        loading="eager"
        fetchPriority="high"
        sizes="(max-width: 1280px) 100vw, 1200px"
        /* Framed high: the cover is a 16:9 crop, and centred in a hero this
           wide it cut the pink filament that crosses the top of the
           micrograph — the strongest line in the picture. */
        className="sc-photo object-cover object-[50%_18%]"
      />
      <div aria-hidden className="sc-scrim" />
      <div aria-hidden className="sc-rings" />

      <div className="sc-hero-inner">
        <div className="min-w-0">
          <div className="sc-eyebrow">
            <span className="sc-badge sc-badge-subject">{props.subject ?? "General"}</span>
            {props.difficulty && <span className="sc-badge sc-badge-level">{props.difficulty}</span>}
            {owned ? (
              <span className="sc-badge sc-badge-open">Unlocked</span>
            ) : (
              <span className="sc-badge sc-badge-lock">Locked</span>
            )}
          </div>

          <p className="sc-overline">{showcase.overline}</p>

          <h1 className="sc-title">{title}</h1>

          <p className="sc-copy">
            <strong>{showcase.headline}</strong>
            <br />
            {showcase.intro}
          </p>

          <div className="sc-cta-row">
            {primary}
            {props.videoLength && (
              <a href="#demo" className="sc-btn sc-btn-ghost focus-ring">
                <CirclePlay className="h-[17px] w-[17px]" />
                Watch {props.videoLength} Demo
              </a>
            )}
          </div>

          <dl className="sc-stats">
            {stats.map((s) => (
              /* Term first in the markup, as a `dl` requires; the CSS puts
                 the value first on screen, because the number is what the
                 strip is for. */
              <div key={s.label} className="sc-stat">
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>

          {/* Below `xl` the rail that carries the progress card is hidden, so
              the figure sits here instead of disappearing. */}
          {props.progress && (
            <div className="mt-5 max-w-sm xl:hidden">
              <div className="mb-1.5 flex justify-between text-xs text-[#9da9a3]">
                <span>
                  {props.progress.done} of {props.progress.total} steps
                </span>
                <span className="tabular-nums">{props.progress.percent}%</span>
              </div>
              <ShowcaseProgressBar percent={props.progress.percent} dark />
            </div>
          )}

          {showcase.tags.length > 0 && (
            <ul className="sc-tags" aria-label="Topics">
              {showcase.tags.map((t) => (
                <li key={t} className="sc-tag">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/*
          The walkthrough card. It jumps to the player below rather than
          playing here — one player on the page, one place the video lives.
        */}
        {props.videoLength && (
          <div className="sc-video-wrap">
            <a href="#demo" className="sc-video focus-ring" aria-label={`Watch the ${props.videoLength} lab walkthrough`}>
              <Image
                src={props.photo}
                alt=""
                fill
                loading="eager"
                sizes="(max-width: 1280px) 650px, 460px"
                className="object-cover"
              />
              <span aria-hidden className="sc-play">
                <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" strokeWidth={0} />
              </span>
              <span className="sc-video-foot">
                <span>
                  <small>Lab walkthrough</small>
                  <strong>{showcase.walkthroughTitle}</strong>
                </span>
                <span className="sc-duration">{props.videoLength}</span>
              </span>
            </a>
          </div>
        )}
      </div>

      {/* The photograph is a published micrograph, so it is credited where it
          is shown, as it is on the catalogue card. */}
      {props.credit && <p className="sc-credit">Micrograph: {props.credit}</p>}
    </header>
  );
}

/** The showcase's two-accent bar. `dark` for the hero's photographic surface. */
export function ShowcaseProgressBar({ percent, dark = false }: { percent: number; dark?: boolean }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Tutorial progress"
      className={`sc-progress-track ${dark ? "sc-progress-track-dark" : ""}`}
    >
      <div className="sc-progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}

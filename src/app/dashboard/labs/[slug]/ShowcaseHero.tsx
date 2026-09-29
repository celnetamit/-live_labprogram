import Image from "next/image";
import type { LabShowcase } from "@/content/labs";
import { ArrowGlyph, PlayCircleGlyph, PlayGlyph } from "@/components/showcase-icons";
import { wordmark } from "@/components/showcase-wordmark";
export { showcaseChromeCss, showcaseRootClass, showcaseVars } from "@/lib/showcase";
import type { AccessRequestState } from "./AccessRequestPanel";

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
  const title = wordmark(showcase, props.name, "sc-title");

  /* Authored labels, computed values; a figure with no value is dropped
     rather than shown as a dash. */
  const values = {
    steps: String(props.steps),
    handsOn: props.handsOn,
    difficulty: props.difficulty,
    walkthrough: props.videoLength,
  };
  const stats = (
    showcase.stats ?? [
      { kind: "steps", label: "Guided lab steps" },
      { kind: "handsOn", label: "Hands-on time" },
      { kind: "difficulty", label: "Difficulty level" },
    ]
  ).flatMap((s) => (values[s.kind] ? [{ value: values[s.kind]!, label: s.label }] : []));

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
          <ArrowGlyph className="h-[17px] w-[17px]" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )
    : (
        <a href="#access" className="sc-btn sc-btn-primary focus-ring">
          {props.requestState === "pending" ? "View your request" : "Request access"}
          <ArrowGlyph className="h-[17px] w-[17px]" />
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
        /* Per lab: MicrobeAI frames high, because centred in a hero this
           wide the 16:9 cover cut the pink filament that crosses the top of
           the micrograph — the strongest line in the picture. */
        className="sc-photo object-cover"
        style={{ objectPosition: showcase.photo?.position ?? "50% 50%" }}
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
                <PlayCircleGlyph className="h-[17px] w-[17px]" />
                {props.videoLength} Walkthrough
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
                <PlayGlyph className="h-6 w-6" />
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

      {/* A published photograph is credited where it is shown, as it is on
          the catalogue card. */}
      {props.credit && (
        <p className="sc-credit">
          {showcase.photo?.creditLabel ?? "Photograph"}: {props.credit}
        </p>
      )}
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

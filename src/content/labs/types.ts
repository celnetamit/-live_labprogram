/**
 * Authored guide content for a lab: the plain-language summary, the demo video,
 * and the step-by-step tutorial shown on `/dashboard/labs/[slug]`.
 *
 * This lives in the repo rather than the database on purpose. The guides are
 * long-form prose that wants review in a diff, they reference controls that
 * change when the lab app changes, and they must not require a migration to
 * ship. `getLabGuide()` falls back to the DB `instructions` column for any lab
 * that has no module here yet.
 */

/**
 * One tutorial step, modelled on the GROMACS tutorial convention: do the thing,
 * confirm you saw the right thing, then understand why it happened. `expect` is
 * the part that makes a tutorial checkable rather than merely readable — a
 * learner who does not see it knows immediately that they are off track.
 */
export type TutorialStep = {
  /** Short imperative title, e.g. "Collect the diffraction pattern". */
  title: string;
  /** One line: what this step is for. Rendered under the title. */
  goal: string;
  /** The literal clicks, in order. Each entry is one action. */
  actions: string[];
  /** The observable result. "You should see…" — always concrete. */
  expect: string;
  /** The reason it behaves that way. Optional, but present on most steps. */
  why?: string;
  /** Roughly how long this step takes, in minutes. Used for the time estimate. */
  minutes: number;
};

/** A jump point in the demo video, and a line in the recording shot list. */
export type VideoChapter = {
  /** Offset from the start of the video, in seconds. */
  at: number;
  label: string;
  /**
   * What is on screen for this chapter — the actual clicks, in order. Supplying
   * it turns the generated shot list into something a person can record from,
   * instead of a table of "fill in during storyboard".
   */
  shot?: string;
  /** The line spoken over this chapter. Keep it to what the shot shows. */
  say?: string;
};

export type LabVideo = {
  /**
   * `/demos/<slug>.mp4` for a self-hosted file in `public/demos/`, or a YouTube
   * or Vimeo watch/share URL. `null` renders the "in production" placeholder
   * with the chapter list, so the section is useful before a file exists.
   */
  url: string | null;
  /** Poster frame path, e.g. `/demos/<slug>.jpg`. Self-hosted files only. */
  poster?: string;
  /** Total runtime in seconds, for the label next to the heading. */
  durationSec?: number;
  /** Optional transcript or caption file, `.vtt`, in `public/demos/`. */
  captions?: string;
  chapters: VideoChapter[];
};

export type LabSummary = {
  /**
   * One punchy sentence for the hero, in the lab's own words. Falls back to the
   * database `synopsis`, which is seeded marketing copy and usually says far
   * less. Keep it under about 25 words — it sits directly under the title.
   */
  tagline?: string;
  /** What the lab *is*, for a reader who does not know the field. No jargon. */
  what: string;
  /** Why the problem matters outside the classroom. */
  why: string;
  /** Who should take it, and what background is assumed. */
  whoFor: string;
  /** Concrete capabilities, each starting with a verb. Shown as a checklist. */
  outcomes: string[];
};

/**
 * An accent drawn from the lab's own cover photograph. `onDark` is used where
 * the surface is the photograph under its dark scrim, which is the same in
 * both themes; `ink` is the darker partner for a light-theme panel, where the
 * photograph's pastel would fail 3:1 as an icon or 4.5:1 as text.
 */
export type ShowcaseAccent = { onDark: string; ink: string };

/**
 * An editorial hero for a lab that has one: the cover photograph full-bleed
 * behind the copy, a split-colour wordmark, and four "what makes this lab
 * different" cards under the overview.
 *
 * Opt-in per lab. A guide without it keeps the standard hero, so a lab only
 * gets this treatment once someone has written copy that is true of it — the
 * feature cards in particular are claims about the lab, and are held to the
 * same standard as a tutorial step.
 */
export type LabShowcase = {
  /** Small line above the title, e.g. "Living intelligence". */
  overline: string;
  /**
   * The title, in coloured segments. Rendered as one heading; the colours are
   * decoration and the accessible name is the joined text.
   */
  title: { text: string; accent?: "primary" | "secondary" }[];
  /** One bold line leading the hero copy. */
  headline: string;
  /** The sentence under the headline. Replaces the guide's tagline in the hero. */
  intro: string;
  /**
   * The "About this lab" prose, as paragraphs. The guide's longer `why`,
   * `whoFor` and `outcomes` move to their own "Learning outcomes" panel on a
   * showcase page, so this is the short version.
   */
  about: string[];
  /** Topic chips under the hero figures, in place of the database skills. */
  tags: string[];
  /** Caption on the walkthrough card, e.g. "From microbial community to ecosystem model". */
  walkthroughTitle: string;
  /** Used in the progress card: "Ready to begin the {journey} journey." */
  journey: string;
  /** The catalogue card's own copy. */
  card: {
    /** Pill on the card photograph, e.g. "Interactive lab". */
    badge: string;
    /** Replaces the database synopsis on the card. Four lines at most. */
    description: string;
  };
  /** Sampled from the cover photograph so the page and the picture agree. */
  palette: {
    /** Title highlight, links, active states. */
    primary: ShowcaseAccent;
    /** Second title segment and the progress label. */
    secondary: ShowcaseAccent;
    /** The call to action and the overline. */
    action: ShowcaseAccent & { text: string };
    /** Fourth feature card. */
    quiet: ShowcaseAccent;
  };
  /** Exactly four, one per accent, in palette order: primary, secondary, action, quiet. */
  features: {
    icon: "sequence" | "analysis" | "simulation" | "insight";
    title: string;
    body: string;
  }[];
};

export type LabGuide = {
  /** Must match `Lab.slug` in the database. */
  slug: string;
  summary: LabSummary;
  showcase?: LabShowcase;
  video: LabVideo;
  /** What to have ready before starting. Empty array renders nothing. */
  prerequisites: string[];
  steps: TutorialStep[];
  troubleshooting: { problem: string; fix: string }[];
  furtherReading: { label: string; href: string }[];
};

/** Total tutorial time, summed from the steps so it can never drift. */
export function totalMinutes(guide: LabGuide): number {
  return guide.steps.reduce((sum, step) => sum + step.minutes, 0);
}

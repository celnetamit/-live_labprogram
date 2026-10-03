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
  /**
   * Why the problem matters outside the classroom. A string renders as prose —
   * a blank line (`\n\n`) starts a new paragraph; an array renders as a
   * bulleted list, for a guide whose points read better broken out than run
   * together.
   */
  why: string | string[];
  /** Who should take it, and what background is assumed. A blank line starts a new paragraph. */
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

/** The icons a showcase may use, for its feature cards and its catalogue card. */
export type ShowcaseIcon = "sequence" | "analysis" | "simulation" | "insight" | "graph";

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
  /** Small line above the title, e.g. "Single-cell & spatial omics". */
  overline: string;
  /**
   * The title, in coloured segments. Rendered as one heading; the colours are
   * decoration and the accessible name is the joined text. A `subtitle`
   * segment drops to its own, smaller line ("Drug Discovery Lab").
   *
   * Compared with `Lab.name` letters-and-digits only, so "RepurposeAI: Drug
   * Discovery Lab" matches a wordmark that leaves the colon out; if an admin
   * renames the lab, the page falls back to the plain name.
   */
  title: { text: string; accent?: "primary" | "secondary"; subtitle?: boolean }[];
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
  /** How the cover photograph sits in the hero. */
  photo?: {
    /** CSS `object-position`, e.g. "50% 18%" to keep the top of the picture. */
    position?: string;
    /** Word before the credit line: "Micrograph", "Photograph". */
    creditLabel?: string;
  };
  /**
   * The hero's three figures, in order, with their labels. Omitted: steps,
   * hands-on time and difficulty, as MicrobeAI and RepurposeAI show them.
   * Every value is computed (step count, summed minutes, video length, the
   * lab's difficulty); only the labels are authored.
   */
  stats?: { kind: "steps" | "handsOn" | "difficulty" | "walkthrough"; label: string }[];
  /**
   * The card under the contents rail for a learner who has access: their
   * progress (default), or a launch card that opens the lab
   * (omicslab_pro_with_new_image.html). A locked visitor always gets the price.
   */
  rail?: {
    owned?: "progress" | "launch";
    /** Which accent colours the rail card's label and border. Default `action`. */
    accent?: "action" | "secondary";
  };
  /** The catalogue card's own copy. */
  card: {
    /** Pill on the card photograph, e.g. "Interactive lab". */
    badge: string;
    /** Replaces the database synopsis on the card. Two lines are shown. */
    description: string;
    /** The tile beside the card's title. */
    icon: ShowcaseIcon;
  };
  /** Sampled from the cover photograph so the page and the picture agree. */
  palette: {
    /** Title highlight, subject badge, links, active states, the card's button. */
    primary: ShowcaseAccent;
    /** The title's second part and the progress label. */
    secondary: ShowcaseAccent;
    /** The page's voice: overline, headline, walkthrough caption. */
    action: ShowcaseAccent;
    /** The "Unlocked" badge and the card's third figure. */
    quiet: ShowcaseAccent;
    /** The hero button, the play button and the walkthrough frame; `text` is the ink on it. */
    cta: ShowcaseAccent & { text: string };
    /** The difficulty badge. It only ever sits on the dark hero, so it has no `ink`. */
    level: string;
    /** One per feature card, in order. */
    features: [ShowcaseAccent, ShowcaseAccent, ShowcaseAccent, ShowcaseAccent];
  };
  /**
   * The dark theme's neutrals, which the design tints to match the picture:
   * green-black under a micrograph, blue-grey under a pharmacy shelf. Used by
   * the hero in both themes and by the page and shell in the dark one.
   */
  ground: {
    /** Page background behind the whole dashboard. */
    page: string;
    /** The shell's sidebar. */
    sidebar: string;
    /** Panel gradient, top-left to bottom-right. */
    surface: [string, string];
    /** The hero's own backing colour, under the photograph. */
    hero: string;
    /** The scrim laid over the photograph, and the shade of anything on it. */
    scrim: string;
    /**
     * The wide hero's scrim, as opacities: left edge, 45%, 72%, right edge,
     * then the bottom fade. Omitted, MicrobeAI's [96, 89, 52, 22, 74].
     */
    scrimStops?: [number, number, number, number, number];
    /** Headings and figures. */
    text: string;
    /** Secondary text. */
    muted: string;
    /** Body copy in the overview. */
    copy: string;
    /** Small print: feature-card bodies, rail labels. */
    soft: string;
  };
  /** Exactly four, in the order of `palette.features`. */
  features: {
    icon: ShowcaseIcon;
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
  /**
   * What to have ready before starting — for most labs a readiness
   * checklist (browser, time needed, prior knowledge), though the section's
   * default heading, "What's Included in the Lab", reads more naturally for
   * a guide whose list is scope/contents rather than prerequisites. Empty
   * array renders nothing.
   */
  prerequisites: string[];
  /**
   * Overrides the section's default heading and nav label, "What's Included
   * in the Lab", for a guide whose `prerequisites` really is a readiness
   * checklist and reads oddly under that title — e.g. `"Before you start"`.
   */
  prerequisitesLabel?: string;
  steps: TutorialStep[];
  troubleshooting: { problem: string; fix: string }[];
  furtherReading: { label: string; href: string }[];
};

/** Total tutorial time, summed from the steps so it can never drift. */
export function totalMinutes(guide: LabGuide): number {
  return guide.steps.reduce((sum, step) => sum + step.minutes, 0);
}

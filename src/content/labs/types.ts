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
  /** What the lab *is*, for a reader who does not know the field. No jargon. */
  what: string;
  /** Why the problem matters outside the classroom. */
  why: string;
  /** Who should take it, and what background is assumed. */
  whoFor: string;
  /** Concrete capabilities, each starting with a verb. Shown as a checklist. */
  outcomes: string[];
};

export type LabGuide = {
  /** Must match `Lab.slug` in the database. */
  slug: string;
  summary: LabSummary;
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

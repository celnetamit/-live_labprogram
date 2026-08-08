import { getLabGuide, totalMinutes } from "@/content/labs";

/**
 * The compact "what's actually inside this lab" summary shown when a learner
 * hovers a catalogue card. Built from the authored guide, so it is the real
 * tutorial — not marketing copy — and it stays in step with the lab's content
 * without anyone maintaining a second description.
 *
 * Deliberately small: a hover card that has to be read slowly defeats the point.
 */
export type LabPreview = {
  /** One punchy sentence in the lab's own words. */
  tagline: string;
  /** Concrete capabilities the learner walks away with. Capped to fit the card. */
  outcomes: string[];
  /** The opening tutorial steps, in order. Capped to fit the card. */
  steps: string[];
  stepCount: number;
  /** Total tutorial time in minutes, summed from the steps. */
  minutes: number;
  /** "6:12" when the lab has a timed demo video, else null. */
  videoLabel: string | null;
  prerequisiteCount: number;
};

/** Two per list is what fits a catalogue card without the overlay clipping. */
const PREVIEW_ITEMS = 2;

export function getLabPreview(slug: string | null | undefined): LabPreview | null {
  const guide = getLabGuide(slug);
  if (!guide) return null;

  const seconds = guide.video.durationSec;

  return {
    tagline: guide.summary.tagline ?? guide.summary.what,
    outcomes: guide.summary.outcomes.slice(0, PREVIEW_ITEMS),
    steps: guide.steps.slice(0, PREVIEW_ITEMS).map((s) => s.title),
    stepCount: guide.steps.length,
    minutes: totalMinutes(guide),
    videoLabel: seconds
      ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
      : null,
    prerequisiteCount: guide.prerequisites.length,
  };
}

import type { Lab, LabProgress } from "@prisma/client";
import { getLabGuide, totalMinutes } from "@/content/labs";
import { parseList } from "@/lib/access";

/**
 * Assembles what the learner-facing surfaces need to say about a lab: where the
 * learner got to, what is next, and how long is left.
 *
 * Both the dashboard and My Labs render the same statuses and the same progress
 * bars, and they were previously deriving them separately. Anything that
 * decides "In progress" belongs here, once, or the two views eventually
 * disagree about the same lab on the same screen.
 *
 * Server-only: it imports the authored guides, which are large. Importing this
 * from a client component would pull every guide into the browser bundle.
 */

export type LearnerLabStatus = "not-started" | "in-progress" | "completed";

export type LearnerLab = {
  slug: string;
  title: string;
  subject: string;
  difficulty: string;
  synopsis: string;
  skills: string[];
  /** A real screenshot of the lab, or null for a lab with no guide/poster. */
  image: string | null;
  sourceUrl: string | null;
  status: LearnerLabStatus;
  totalSteps: number;
  completedSteps: number;
  percent: number;
  /** Title of the first unfinished step, so a card can say what comes next. */
  nextStep: string | null;
  /** Authored step time for the whole tutorial, in minutes. */
  minutesTotal: number;
  /** Authored time for the steps not yet ticked. */
  minutesLeft: number;
  /** ISO string, or null if this learner has never opened the tutorial. */
  lastActiveAt: string | null;
};

/**
 * Labs whose card leads with a photograph rather than a screenshot of the app.
 *
 * The default card image is the demo poster — a screenshot of the lab's own
 * interface. That works for a tool whose screen is the point, but for these
 * three the subject is what the learner is actually studying, and a browser
 * window full of panels says less about it than the instrument or the specimen
 * does. The screenshots are untouched: the demo video still opens on its own
 * poster inside the lab page.
 */
const COVER_PHOTO: Record<string, string> = {
  "drugdiscovery-ai": "/labs/drugdiscovery-ai.jpg",
  omicslab: "/labs/omicslab.jpg",
  "virtual-ai": "/labs/virtual-ai.jpg",
};

/**
 * The image for a lab's card.
 *
 * A cover photograph wins where one exists; otherwise the demo poster in
 * `public/demos/`, which is an exact one-to-one match with the authored
 * guides. A lab with neither gets a lettered tile rather than a broken image.
 */
export function labImage(slug: string, hasGuide: boolean): string | null {
  const photo = COVER_PHOTO[slug];
  if (photo) return photo;
  return hasGuide ? `/demos/${slug}.jpg` : null;
}

export function buildLearnerLab(lab: Lab, progress: LabProgress | undefined): LearnerLab {
  const slug = lab.slug ?? lab.id;
  const guide = getLabGuide(slug);
  const steps = guide?.steps ?? [];
  const totalSteps = steps.length;

  /*
    Trust the guide's current length, not the stored `totalSteps`. If a guide
    gained a step since the learner last worked, they are genuinely no longer
    finished, and showing 100% would hide the new step from them entirely.
  */
  const doneSet = new Set((progress?.completedSteps ?? []).filter((n) => n >= 0 && n < totalSteps));
  const completedSteps = doneSet.size;
  const percent = totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const firstUnfinished = steps.findIndex((_, i) => !doneSet.has(i));
  const minutesTotal = guide ? totalMinutes(guide) : 0;
  const minutesLeft = steps.reduce((sum, step, i) => (doneSet.has(i) ? sum : sum + step.minutes), 0);

  const status: LearnerLabStatus =
    totalSteps > 0 && completedSteps >= totalSteps
      ? "completed"
      : completedSteps > 0
        ? "in-progress"
        : "not-started";

  return {
    slug,
    title: lab.name,
    subject: lab.subject ?? "General",
    difficulty: lab.difficulty ?? "Beginner",
    synopsis: lab.synopsis ?? lab.description ?? "",
    skills: parseList(lab.keySkills),
    image: labImage(slug, !!guide),
    sourceUrl: lab.sourceUrl,
    status,
    totalSteps,
    completedSteps,
    percent,
    nextStep: firstUnfinished >= 0 ? (steps[firstUnfinished]?.title ?? null) : null,
    minutesTotal,
    minutesLeft,
    lastActiveAt: progress?.lastActiveAt?.toISOString() ?? null,
  };
}

/** "1 h 20 m", "45 m", or null when the guide carries no timings. */
export function formatMinutes(mins: number): string | null {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export const STATUS_LABEL: Record<LearnerLabStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
};

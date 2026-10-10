import type { Lab, LabProgress } from "@prisma/client";
import { getLabGuide, totalMinutes, type LabShowcase } from "@/content/labs";
import { parseList } from "@/lib/access";
import { COVER_PHOTO, type CoverPhoto } from "@/content/labs/photos";

// Re-exported: this module owned both until the home page needed them too.
export { COVER_PHOTO };
export type { CoverPhoto };

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

/**
 * What a showcase card needs from the guide's `showcase` — the copy, the
 * palette and the split wordmark — and nothing else, since it is serialised
 * into the client catalogue for every learner.
 */
export type CardShowcase = {
  badge: string;
  description: string;
  icon: LabShowcase["card"]["icon"];
  palette: LabShowcase["palette"];
  ground: LabShowcase["ground"];
  /** Checked against `Lab.name` where it is drawn (`showcase-wordmark.tsx`). */
  title: LabShowcase["title"];
};

export type LearnerLab = {
  slug: string;
  title: string;
  subject: string;
  difficulty: string;
  synopsis: string;
  skills: string[];
  /** A real screenshot of the lab, or null for a lab with no guide/poster. */
  image: string | null;
  /** Source line for the cover photograph, with its colours. */
  imageCredit: ImageCredit | null;
  /** The colour the cover ends in, carried into the card body. */
  imageEdge: CoverEdge | null;
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
  /** Set for a lab with a showcase design; its card is drawn to match. */
  showcase: CardShowcase | null;
};


/** A photograph's source line, with the hue to wash its strip in. */
export type ImageCredit = { text: string; tint: string };

/** The colour a cover photograph ends in, carried into the card below it. */
export type CoverEdge = { color: string; isLight: boolean };

/** The seam colour for a lab's cover, or null for a lab with no photograph. */
export function labImageEdge(slug: string): CoverEdge | null {
  const photo = COVER_PHOTO[slug];
  if (!photo) return null;
  return { color: photo.edge, isLight: photo.edgeIsLight ?? false };
}

/**
 * The image for a lab's card.
 *
 * A cover photograph wins where one exists; otherwise the demo poster in
 * `public/demos/`, which is an exact one-to-one match with the authored
 * guides. A lab with neither gets a lettered tile rather than a broken image.
 */
export function labImage(slug: string, hasGuide: boolean): string | null {
  const photo = COVER_PHOTO[slug];
  if (photo) return photo.src;
  return hasGuide ? `/demos/${slug}.jpg` : null;
}

/** A lab's cover credit, with the tint taken from the photograph itself. */
export function labImageCredit(slug: string): ImageCredit | null {
  const photo = COVER_PHOTO[slug];
  if (!photo?.credit) return null;
  return { text: photo.credit, tint: photo.tint };
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
    imageCredit: labImageCredit(slug),
    imageEdge: labImageEdge(slug),
    sourceUrl: lab.sourceUrl,
    status,
    totalSteps,
    completedSteps,
    percent,
    nextStep: firstUnfinished >= 0 ? (steps[firstUnfinished]?.title ?? null) : null,
    minutesTotal,
    minutesLeft,
    lastActiveAt: progress?.lastActiveAt?.toISOString() ?? null,
    showcase:
      cardShowcase(guide?.showcase) ??
      defaultCardShowcase(lab.name, lab.subject, guide?.summary.tagline ?? lab.synopsis ?? lab.description ?? "", !!guide),
  };
}

/** The card's slice of a guide's showcase, or null for a lab without one. */
export function cardShowcase(showcase: LabShowcase | undefined): CardShowcase | null {
  if (!showcase) return null;
  return {
    badge: showcase.card.badge,
    description: showcase.card.description,
    icon: showcase.card.icon,
    palette: showcase.palette,
    ground: showcase.ground,
    title: showcase.title,
  };
}

type Accent = { onDark: string; ink: string };
const TONE: Record<string, Accent> = {
  teal: { onDark: "#5cc8c0", ink: "#287771" },
  amber: { onDark: "#eaa65a", ink: "#9c5c14" },
  green: { onDark: "#7cc98f", ink: "#327a44" },
  coral: { onDark: "#ee8a74", ink: "#c53718" },
  steel: { onDark: "#9fb4c8", ink: "#516f8d" },
  sky: { onDark: "#6fb0e8", ink: "#1d6fb5" },
  violet: { onDark: "#a09df7", ink: "#5954f1" },
  cyan: { onDark: "#4fd0e2", ink: "#167582" },
  blue: { onDark: "#8aaede", ink: "#346cb7" },
  rose: { onDark: "#e8a0b4", ink: "#c7305a" },
};

/* A colour family per subject: the title accent and button, the second
   accent, the icon tile, and the card's icon. */
const SUBJECT_TONES: Record<string, { primary: Accent; secondary: Accent; action: Accent; icon: CardShowcase["icon"] }> = {
  Materials: { primary: TONE.teal, secondary: TONE.violet, action: TONE.violet, icon: "graph" },
  Engineering: { primary: TONE.amber, secondary: TONE.sky, action: TONE.sky, icon: "simulation" },
  Electronics: { primary: TONE.sky, secondary: TONE.amber, action: TONE.green, icon: "analysis" },
  "Computer Science": { primary: TONE.violet, secondary: TONE.sky, action: TONE.rose, icon: "insight" },
  Security: { primary: TONE.cyan, secondary: TONE.coral, action: TONE.teal, icon: "analysis" },
  Biology: { primary: TONE.green, secondary: TONE.coral, action: TONE.rose, icon: "sequence" },
  Physics: { primary: TONE.blue, secondary: TONE.amber, action: TONE.steel, icon: "simulation" },
};

/**
 * The showcase card for a lab that has no showcase of its own, so every card
 * in a catalogue is the same design rather than two designs side by side.
 *
 * Nothing here is a claim about the lab: the description is its guide's own
 * tagline, the colours come from its subject, and the only emphasis is the
 * last word of its real name. A lab with no guide keeps the plain card — it
 * has no picture to lead with.
 */
function defaultCardShowcase(
  name: string,
  subject: string | null,
  description: string,
  hasGuide: boolean,
): CardShowcase | null {
  if (!hasGuide) return null;
  const tones = SUBJECT_TONES[subject ?? ""] ?? SUBJECT_TONES["Computer Science"];
  const cut = name.lastIndexOf(" ");
  return {
    badge: "Interactive lab",
    description,
    icon: tones.icon,
    title:
      cut > 0
        ? [{ text: name.slice(0, cut + 1) }, { text: name.slice(cut + 1), accent: "primary" }]
        : [{ text: name, accent: "primary" }],
    palette: {
      primary: tones.primary,
      secondary: tones.secondary,
      action: tones.action,
      quiet: TONE.steel,
      cta: { ...tones.primary, text: "#081018" },
      level: tones.secondary.onDark,
      features: [tones.primary, tones.secondary, tones.action, TONE.steel],
    },
    /* The hub's own neutral dark, rather than any one photograph's. */
    ground: {
      page: "#0b0d12",
      sidebar: "#0b0e12",
      surface: ["#161a22", "#0f1218"],
      hero: "#12151b",
      scrim: "#080a0f",
      text: "#f3f4f7",
      muted: "#a3a9b6",
      copy: "#b0b6c2",
      soft: "#808796",
    },
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

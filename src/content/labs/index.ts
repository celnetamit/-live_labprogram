import type { LabGuide } from "./types";

import aiProgramNavigator from "./ai-program-navigator";
import ai6g from "./ai-6g";
import batteryAi from "./battery-ai";
import cognicoreAi from "./cognicore-ai";
import denovoGenaiLab from "./denovo-genai-lab";
import drugdiscoveryAi from "./drugdiscovery-ai";
import fraudshield from "./fraudshield";
import logiclab from "./logiclab";
import metamaterials from "./metamaterials";
import microAi from "./micro-ai";
import smartfactoryAi from "./smartfactory-ai";
import virtualAi from "./virtual-ai";

/**
 * Every authored guide, keyed by `Lab.slug`. A lab with no entry here still
 * renders — the detail page falls back to the `instructions` column — so adding
 * a lab to the catalogue never requires touching this file.
 */
const GUIDES: Record<string, LabGuide> = Object.fromEntries(
  [
    aiProgramNavigator,
    ai6g,
    batteryAi,
    cognicoreAi,
    denovoGenaiLab,
    drugdiscoveryAi,
    fraudshield,
    logiclab,
    metamaterials,
    microAi,
    smartfactoryAi,
    virtualAi,
  ].map((guide) => [guide.slug, guide]),
);

export function getLabGuide(slug: string | null | undefined): LabGuide | null {
  if (!slug) return null;
  return GUIDES[slug] ?? null;
}

/** Slugs that have an authored guide. Used by the admin content-coverage view. */
export function guideSlugs(): string[] {
  return Object.keys(GUIDES).sort();
}

export type { LabGuide, LabSummary, LabVideo, TutorialStep, VideoChapter } from "./types";
export { totalMinutes } from "./types";

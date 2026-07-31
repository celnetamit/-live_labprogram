// Generate a recording shot list per lab, from the authored guide modules.
//
// The guides in src/content/labs are the single source of truth: chapter marks
// and tutorial steps live there, so a shot list generated from them cannot
// drift out of sync with the tutorial the learner reads on the site. Re-run
// after editing a guide.
//
// Usage: npm run demo:scripts   (writes docs/demo-scripts/<slug>.md)

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getLabGuide, guideSlugs, totalMinutes } from "../src/content/labs";
import type { LabGuide } from "../src/content/labs/types";

// Run from the project root via `npm run demo:scripts`, which compiles this
// file and its imports to CommonJS first — hence `process.cwd()` rather than
// `import.meta.url`, which is not available in the compiled output.
const OUT_DIR = path.join(process.cwd(), "docs", "demo-scripts");

function timecode(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function shotList(guide: LabGuide): string {
  const { chapters, durationSec } = guide.video;
  const lines: string[] = [];

  lines.push(`# Demo video shot list — \`${guide.slug}\``);
  lines.push("");
  lines.push(
    `Target runtime **${durationSec ? timecode(durationSec) : "TBD"}**. Generated from ` +
      `\`src/content/labs/${guide.slug}.ts\` — edit the guide, not this file, then re-run ` +
      "`npm run demo:scripts`.",
  );
  lines.push("");

  lines.push("## Before recording");
  lines.push("");
  lines.push("- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.");
  lines.push("- Use a clean profile: no extensions, no notifications, no personal tabs.");
  lines.push("- Rehearse each shot once. Cursor movement should be slow and deliberate.");
  lines.push("- Pause 1s after each click so the viewer can see what changed.");
  lines.push("");
  lines.push("Set up in advance so no shot is spent waiting:");
  lines.push("");
  for (const item of guide.prerequisites) {
    lines.push(`- ${item.replace(/\*\*/g, "")}`);
  }
  lines.push("");

  lines.push("## Shots");
  lines.push("");

  const storyboarded = chapters.some((chapter) => chapter.shot || chapter.say);

  if (storyboarded) {
    // A guide that supplies `shot`/`say` gets a table you can record straight
    // from, narration included.
    lines.push("| In | Out | Chapter | On screen | Say over it |");
    lines.push("| --- | --- | --- | --- | --- |");
    chapters.forEach((chapter, index) => {
      const end = chapters[index + 1]?.at ?? durationSec ?? chapter.at;
      const shot = (chapter.shot ?? "_fill in during storyboard_").replace(/\|/g, "\\|");
      const say = (chapter.say ?? "—").replace(/\|/g, "\\|");
      lines.push(`| ${timecode(chapter.at)} | ${timecode(end)} | ${chapter.label} | ${shot} | ${say} |`);
    });
  } else {
    lines.push("| In | Out | Chapter | On screen |");
    lines.push("| --- | --- | --- | --- |");
    chapters.forEach((chapter, index) => {
      const end = chapters[index + 1]?.at ?? durationSec ?? chapter.at;
      lines.push(
        `| ${timecode(chapter.at)} | ${timecode(end)} | ${chapter.label} | _fill in during storyboard_ |`,
      );
    });
  }
  lines.push("");

  lines.push("## Narration source");
  lines.push("");
  lines.push(
    "The opening line comes from the guide summary; each subsequent beat mirrors a tutorial " +
      "step, so the video and the written tutorial teach the same thing in the same order.",
  );
  lines.push("");
  lines.push("**Open with:**");
  lines.push("");
  lines.push(`> ${guide.summary.what}`);
  lines.push("");
  lines.push(
    `**Then work the ${guide.steps.length} tutorial steps** (${totalMinutes(guide)} min in written form, ` +
      "compressed to the runtime above — demonstrate, do not narrate every click):",
  );
  lines.push("");
  guide.steps.forEach((step, index) => {
    lines.push(`### ${index + 1}. ${step.title}`);
    lines.push("");
    lines.push(`_${step.goal}_`);
    lines.push("");
    lines.push("Show, in order:");
    lines.push("");
    for (const action of step.actions) {
      lines.push(`- ${action.replace(/\*\*/g, "")}`);
    }
    lines.push("");
    lines.push(`**Hold the shot on:** ${step.expect.replace(/\*\*/g, "")}`);
    lines.push("");
    if (step.why) {
      lines.push(`**Say over it:** ${step.why.replace(/\*\*/g, "")}`);
      lines.push("");
    }
  });

  lines.push("## Close with");
  lines.push("");
  for (const outcome of guide.summary.outcomes) {
    lines.push(`- ${outcome}`);
  }
  lines.push("");

  lines.push("## Publishing");
  lines.push("");
  lines.push(
    "1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.",
  );
  lines.push(
    `2. Drop them in \`public/demos/\` as \`${guide.slug}.mp4\` and \`${guide.slug}.jpg\`.`,
  );
  lines.push(
    `3. In \`src/content/labs/${guide.slug}.ts\`, set \`video.url\` to \`"/demos/${guide.slug}.mp4"\`.`,
  );
  lines.push(
    "4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks " +
      "are clickable seek points on the self-hosted player.",
  );
  lines.push("");
  lines.push(
    "To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player " +
      "switches to a privacy-mode embed. Chapters then render as a static outline, because a " +
      "cross-origin iframe cannot be seeked without loading the provider's SDK.",
  );
  lines.push("");

  return lines.join("\n");
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  const slugs = guideSlugs();

  for (const slug of slugs) {
    const guide = getLabGuide(slug);
    if (!guide) continue;
    await writeFile(path.join(OUT_DIR, `${slug}.md`), shotList(guide), "utf8");
  }

  console.log(`Wrote ${slugs.length} shot lists to docs/demo-scripts/`);
}

void main();

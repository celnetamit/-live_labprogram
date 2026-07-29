// Record a demo walkthrough by driving a lab app in a real browser.
//
// Produces public/demos/<slug>.mp4 plus a poster frame, and prints the chapter
// marks read off the finished cut. Silent screen capture — no narration.
//
// Requirements (not portal dependencies; install when you want to record):
//   npm i -D puppeteer ffmpeg-static
//
// Usage:
//   node scripts/record-demo.mjs virtual-ai http://localhost:3000/
//
// Add a lab by writing a walkthrough in WALKTHROUGHS below. Keep the beats in
// the same order as the guide's tutorial steps so the video and the written
// page teach the same thing in the same sequence.
//
// Two things bite every time, both handled by the helpers here:
//   * Lab apps render navigation as <a>, not <button> — match "a,button".
//   * Several render their stepper twice (mobile chips + desktop list), one
//     always display:none. Without the visibility filter you click the hidden
//     copy and Puppeteer throws "Node is either not clickable".

import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [, , SLUG, APP_URL = "http://localhost:3000/"] = process.argv;
if (!SLUG) {
  console.error("usage: node scripts/record-demo.mjs <slug> [appUrl]");
  process.exit(1);
}

const { default: puppeteer } = await import("puppeteer");
const { default: ffmpegPath } = await import("ffmpeg-static");

const OUT_DIR = path.join(process.cwd(), "public", "demos");
mkdirSync(OUT_DIR, { recursive: true });
const webm = path.join(OUT_DIR, `${SLUG}.webm`);
const mp4 = path.join(OUT_DIR, `${SLUG}.mp4`);
const poster = path.join(OUT_DIR, `${SLUG}.jpg`);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Click the first *visible* element matching `selector` whose text contains `text`. */
async function clickText(page, selector, text, { timeout = 15000 } = {}) {
  const deadline = Date.now() + timeout;
  for (;;) {
    const handle = await page.evaluateHandle(
      (sel, txt) =>
        [...document.querySelectorAll(sel)].find(
          (el) =>
            (el.textContent || "").toLowerCase().includes(txt.toLowerCase()) &&
            el.getClientRects().length > 0,
        ) || null,
      selector,
      text,
    );
    const el = handle.asElement();
    if (el) {
      await el.evaluate((n) => n.scrollIntoView({ block: "center" }));
      await wait(120);
      await el.click();
      return;
    }
    if (Date.now() > deadline) throw new Error(`not found: ${selector} "${text}"`);
    await wait(200);
  }
}

/** Set a range input to a fraction of its span and fire the events React listens for. */
async function slide(page, id, fraction) {
  await page.evaluate(
    (elId, frac) => {
      const el = document.getElementById(elId);
      if (!el) return;
      const min = Number(el.min || 0);
      const max = Number(el.max || 100);
      const step = Number(el.step || 1);
      const value = Math.round((min + (max - min) * frac) / step) * step;
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(
        el,
        String(value),
      );
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.scrollIntoView({ block: "center" });
    },
    id,
    fraction,
  );
  await wait(500);
}

const WALKTHROUGHS = {
  "virtual-ai": async (page, beat) => {
    await beat("The lab: what X-ray diffraction measures", 3500);

    await beat("Loading Silicon Powder from the Sample Library");
    await clickText(page, "a,button", "Sample Library");
    await wait(2000);
    await clickText(page, "button", "Load in Simulator");
    await wait(2500);

    await beat("Step 1 — the unit cell in 3D");
    await clickText(page, "a,button", "Virtual Lab");
    await wait(2000);
    await clickText(page, "button", "Sample prep");
    await wait(5000); // the 3D viewer is lazy-loaded

    await beat("Step 2 — tube, scan range, crystallite size");
    await clickText(page, "button", "Instrument setup");
    await wait(1500);
    await slide(page, "lab-start", 0.27); // ~20 deg
    await slide(page, "lab-end", 0.38); // ~90 deg
    await slide(page, "lab-size", 0.1); // ~35 nm
    await wait(1500);

    await beat("Step 3 — running the 2θ scan");
    await clickText(page, "button", "Data collection");
    await wait(1200);
    await clickText(page, "button", "Run scan");
    await wait(4000);

    await beat("Step 4 — background subtraction and Kα2 stripping");
    await clickText(page, "button", "Data processing");
    await wait(1500);
    for (const box of await page.$$('input[type="checkbox"]')) {
      await box.click();
      await wait(2500);
    }

    await beat("Step 5 — peaks, Scherrer and Williamson–Hall");
    await clickText(page, "button", "Analysis");
    await wait(1500);
    await clickText(page, "button", "Find peaks");
    await wait(4500);
    await page.evaluate(() => window.scrollBy({ top: 320, behavior: "smooth" }));
    await wait(4000);
  },
};

const walkthrough = WALKTHROUGHS[SLUG];
if (!walkthrough) {
  console.error(`No walkthrough for "${SLUG}". Known: ${Object.keys(WALKTHROUGHS).join(", ")}`);
  process.exit(1);
}

const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  args: [
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1280,720",
    "--force-device-scale-factor=1",
    "--use-gl=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
  defaultViewport: { width: 1280, height: 720 },
});

const page = await browser.newPage();
await page.goto(APP_URL, { waitUntil: "networkidle2", timeout: 60000 });
await wait(1500);

const recorder = await page.screencast({ path: webm, overwrite: true });
const started = Date.now();
const beats = [];

/*
 * Wall-clock beats are recorded only to order the chapters. They are NOT the
 * final chapter times: frame delivery slows while heavy views (3D viewers)
 * load, so the finished cut runs longer than the wall clock and the two drift
 * apart non-linearly. The marks below are rescaled to the real duration, and
 * you should still spot-check them against frames before publishing.
 */
const beat = async (label, hold = 0) => {
  beats.push({ label, wall: (Date.now() - started) / 1000 });
  if (hold) await wait(hold);
};

try {
  await walkthrough(page, beat);
} catch (err) {
  console.error("WALKTHROUGH ERROR:", err.message);
} finally {
  await recorder.stop();
  await browser.close();
}

const run = (args) => spawnSync(ffmpegPath, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

run(["-y", "-i", webm, "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
     "-crf", "26", "-movflags", "+faststart", "-an", mp4]);
run(["-y", "-ss", "3", "-i", mp4, "-vframes", "1", "-q:v", "3", poster]);

const probe = run(["-i", mp4]).stderr || "";
const m = probe.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
const durationSec = m ? Math.round(+m[1] * 3600 + +m[2] * 60 + +m[3]) : 0;

const wallTotal = beats.length ? beats[beats.length - 1].wall + 4 : 1;
const scale = durationSec / wallTotal;
const chapters = beats.map((b) => ({ at: Math.round(b.wall * scale), label: b.label }));

console.log(`\nWrote ${mp4} and ${poster}`);
console.log(`\nPaste into src/content/labs/${SLUG}.ts, then spot-check the marks against frames:\n`);
console.log(
  `  video: {\n    url: "/demos/${SLUG}.mp4",\n    poster: "/demos/${SLUG}.jpg",\n` +
    `    durationSec: ${durationSec},\n    chapters: [\n` +
    chapters.map((c) => `      { at: ${c.at}, label: ${JSON.stringify(c.label)} },`).join("\n") +
    `\n    ],\n  },`,
);
console.log(
  `\nSpot-check:  ffmpeg -ss <at> -i public/demos/${SLUG}.mp4 -vframes 1 /tmp/check.png`,
);

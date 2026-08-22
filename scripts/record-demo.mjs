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

/**
 * Scroll the pane the app actually scrolls.
 *
 * These labs put their content in a flex child with its own overflow, so the
 * document never scrolls and `window.scrollTo` silently does nothing — the
 * recording sits at the top of the page while the walkthrough believes it has
 * moved. Falls back to the window for apps that scroll normally.
 */
async function scrollLab(page, top) {
  await page.evaluate((y) => {
    const pane = document.getElementById("workspace-main");
    if (pane && pane.scrollHeight > pane.clientHeight) pane.scrollTo({ top: y, behavior: "smooth" });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }, top);
  await wait(700);
}

/** Click a sidebar entry by its exact label, avoiding partial-text collisions. */
async function clickNav(page, label) {
  await page.evaluate((text) => {
    const nav = document.getElementById("workspace-nav");
    const hit = [...(nav ? nav.querySelectorAll("a,button") : [])]
      .find((el) => (el.innerText || "").trim().toLowerCase().startsWith(text.toLowerCase()));
    hit?.click();
  }, label);
  await wait(400);
}

/**
 * Set a labelled number input the way React will notice.
 *
 * Assigning `.value` directly is swallowed by a controlled input — React's own
 * setter has to be called, then an input event dispatched, or the field shows
 * the new number while the component still holds the old one.
 */
async function setNumber(page, labelText, value) {
  await page.evaluate((text, v) => {
    /*
     * Match the label's *caption*, not the whole label.
     *
     * A form field's <label> wraps its caption, the input and a hint line, so
     * matching on the label's full innerText matches the hint too. Asking for
     * "PH" that way selected the temperature field, because its hint reads
     * "Mesophilic ~37" — and the recording then showed 5.5 °C while the caption
     * claimed a pH change. The caption is the first span; compare against that.
     */
    const label = [...document.querySelectorAll("label")].find((l) => {
      const caption = l.querySelector("span")?.textContent || "";
      return caption.trim().toUpperCase().startsWith(text.toUpperCase());
    });
    const input = label?.querySelector("input[type=number]");
    if (!input) return;
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(input, String(v));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.scrollIntoView({ block: "center" });
  }, labelText, value);
  await wait(600);
}

const WALKTHROUGHS = {
  /*
   * MicrobeAI BioLab — the §6 workflow, compressed to about three minutes.
   *
   * The beats deliberately mirror the eight tutorial steps on the lab page so
   * the video and the written guide teach the same thing in the same order. A
   * learner who watches this and then follows the page should recognise every
   * screen.
   *
   * Pass a launch URL carrying a fresh `?auth_token=` — the lab redirects an
   * unauthenticated visit to the hub login, and a login form is not what the
   * demo is for.
   */
  "micro-ai": async (page, beat) => {
    // Waiting on a still screen sends no frames, so this walkthrough's pauses
    // keep the repaint pulse running rather than calling wait() directly.
    const pause = (ms) => holdOnScreen(page, ms);
    await beat("Most microbes will not grow in a dish — so we read their DNA instead", 4500);

    await beat("Pick what you want out of the lab; the goal loads a real dataset", 1000);
    await clickText(page, "a,button", "Explore anaerobic digestion");
    await pause(1200);
    await clickText(page, "a,button", "Start with this goal");
    await pause(3500);

    await beat("Step 1 of 4 — see exactly what is about to be analysed", 4000);
    await clickText(page, "a,button", "Next: inspect the content");
    await pause(1500);

    await beat("Step 2 — the content is measured, not guessed from the filename", 4000);
    await clickText(page, "a,button", "Next: run format-specific QC");
    await pause(1500);

    await beat("Step 3 — quality control chosen to match what the file actually is", 2500);
    await clickText(page, "a,button", "Run format-specific QC and analysis");
    await pause(9000);

    await beat("QC passes: 4,000 reads, mean quality Q34", 3500);
    await clickText(page, "a,button", "Next: analysis eligibility");
    await pause(2000);

    await beat("Step 4 — every analysis gets its own verdict, and its reason", 5000);

    await beat("Who is in the sample: 37% archaea, so this community makes methane", 1000);
    await clickText(page, "a,button", "Open the community profile");
    await pause(3500);
    await scrollLab(page, 430);
    await pause(2600);

    await beat("Click a phylum to open the species inside it", 800);
    await page.evaluate(() => {
      const chip = [...document.querySelectorAll("button")]
        .find((b) => /^Euryarchaeota\s+[\d.]+%$/.test((b.innerText || "").trim()));
      chip?.click();
    });
    await pause(1200);
    await scrollLab(page, 1180);
    await pause(4200);

    await beat("Function here is INFERRED from who is present — no gene was detected", 1000);
    await clickNav(page, "Functional potential");
    await pause(3000);
    await scrollLab(page, 300);
    await pause(3800);

    await beat("The four stages of digestion, and which organisms run each", 800);
    await clickNav(page, "Traits & guilds");
    await pause(4500);

    await beat("Now run the digester those microbes live in", 800);
    await clickNav(page, "Bioreactor");
    await pause(2500);
    await clickText(page, "a,button", "Run educational simulator");
    await pause(3800);
    await scrollLab(page, 470);
    await pause(2500);

    await beat("Baseline: 0.535 m³/kg VS at 55% methane", 4000);

    await beat("Drop the pH to 5.5 — this is how a real digester dies", 800);
    await scrollLab(page, 0);
    await setNumber(page, "PH", 5.5);
    await pause(1400);
    await clickText(page, "a,button", "Run educational simulator");
    await pause(3800);
    await scrollLab(page, 470);
    await pause(2500);

    await beat("Yield collapses to about a tenth — and it is never called a prediction", 4500);

    await beat("Finish Basic Mode with the assessment", 800);
    await clickNav(page, "Assessment");
    await pause(2200);
    await clickText(page, "a,button", "Start the basic assessment");
    await pause(2000);
    await page.evaluate(() => {
      const groups = new Map();
      for (const input of document.querySelectorAll("input[type=radio]")) {
        if (!groups.has(input.name)) groups.set(input.name, input);
      }
      for (const input of groups.values()) input.click();
    });
    await pause(1500);
    await clickText(page, "a,button", "Submit");
    await pause(3000);

    await beat("Completing it offers the unlock — you choose to take it", 1200);
    await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")]
        .find((x) => /Unlock Moderate Mode/i.test(x.innerText || ""));
      b?.scrollIntoView({ block: "center" });
      b?.click();
    });
    await pause(3500);

    await beat("Moderate unlocked. Advanced is a separate paid tier.", 7000);
  },

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

/*
 * `ffmpegPath` is required, not optional. Puppeteer's screen recorder spawns a
 * bare `ffmpeg` and fails with ENOENT when the system has none — which is the
 * normal case here, since ffmpeg arrives as the ffmpeg-static package rather
 * than a system install. Handing it the resolved binary is the whole fix.
 */
const recorder = await page.screencast({ path: webm, overwrite: true, ffmpegPath });
const started = Date.now();
const beats = [];

/*
 * Wall-clock beats are recorded only to order the chapters. They are NOT the
 * final chapter times: frame delivery slows while heavy views (3D viewers)
 * load, so the finished cut runs longer than the wall clock and the two drift
 * apart non-linearly. The marks below are rescaled to the real duration, and
 * you should still spot-check them against frames before publishing.
 */
/**
 * Put the beat label on screen as well as in the chapter list.
 *
 * The capture is silent, so without this the finished video is a stranger
 * clicking through an interface with no indication of what they are doing or
 * why. The caption is what makes it a walkthrough rather than a screen
 * recording. It is injected into the page rather than burned in afterwards,
 * so it survives the webm→mp4 re-encode and needs no filter graph.
 */
async function caption(page, text) {
  await page.evaluate((line) => {
    let bar = document.getElementById("__demo_caption");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "__demo_caption";
      bar.style.cssText = [
        "position:fixed", "left:0", "right:0", "bottom:0", "z-index:2147483647",
        "padding:14px 22px", "font:600 19px/1.35 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
        "color:#fff", "background:linear-gradient(to top,rgba(4,20,24,.96),rgba(4,20,24,.82) 70%,rgba(4,20,24,0))",
        "text-align:center", "pointer-events:none", "letter-spacing:.1px",
        "text-shadow:0 1px 3px rgba(0,0,0,.7)", "transition:opacity .18s ease",
      ].join(";");
      document.body.appendChild(bar);
      /*
       * The bar is fixed, so it sits on top of whatever is at the foot of the
       * scroll pane — which is exactly where a result panel tends to be. Give
       * the scrolling container room to scroll clear of it.
       */
      const pane = document.getElementById("workspace-main");
      if (pane) pane.style.paddingBottom = "96px";
    }
    bar.textContent = line;
    bar.style.opacity = line ? "1" : "0";
  }, text);
}

/**
 * Hold a still screen while keeping frames flowing.
 *
 * CDP's screencast emits a frame only when the page repaints, so a deliberately
 * still moment — the whole point of a caption you want people to read — sends
 * nothing at all. The encoder then has no frames for that span, and the beat is
 * compressed to nothing or lost off the end of the cut. It cost the closing
 * line of this walkthrough, which simply never appeared however long it was
 * held.
 *
 * Nudging one sub-pixel of an already-invisible element forces a repaint per
 * tick without altering a single visible pixel, so a held beat occupies the
 * time on screen that it occupies in the script.
 */
async function holdOnScreen(page, ms) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    await page
      .evaluate(() => {
        const bar = document.getElementById("__demo_caption");
        if (bar) bar.style.letterSpacing = bar.style.letterSpacing === "0.1px" ? "0.11px" : "0.1px";
      })
      .catch(() => {});
    await wait(200);
  }
}

const beat = async (label, hold = 0) => {
  beats.push({ label, wall: (Date.now() - started) / 1000 });
  /*
   * A swallowed failure here is invisible in the finished cut except as a
   * caption that never changes — which is exactly how the closing line went
   * missing once. Report it instead.
   */
  await caption(page, label).catch((err) => {
    console.error(`CAPTION FAILED at "${label}": ${err.message}`);
  });
  if (hold) await holdOnScreen(page, hold);
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

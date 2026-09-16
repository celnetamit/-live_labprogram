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

  /*
   * XRD Virtual Live Lab — the 13-step Basic project, in about four minutes.
   *
   * Rewritten for v2.0.0. The previous walkthrough drove the old app: a
   * "Sample Library", a "Virtual Lab" sidebar entry and a "Run scan" button,
   * none of which exist. The beats mirror the guide's tutorial steps so the
   * video and the written page teach the same thing in the same order.
   *
   * The pre-lab diagnostic is answered through the API rather than on camera.
   * It is eight questions of radio buttons; filling them in visibly costs a
   * minute of watching a cursor and teaches nothing that the brief has not
   * already said. Everything after it is driven through the real interface.
   */
  "virtual-ai": async (page, beat) => {
    /*
     * Click a step in the workflow rail.
     *
     * The link's text carries its position — "4 Configure instrument" — while a
     * completed step shows a tick and no number at all. Comparing for equality
     * against the bare label therefore matched nothing, the walkthrough never
     * left the project brief, and each run failed at whichever control it
     * expected to find on the step it had not actually opened. Strip a leading
     * number before comparing, and throw rather than click nothing, so a miss
     * is reported instead of silently recorded.
     */
    const clickStep = async (label) => {
      const hit = await page.evaluate((text) => {
        const rail = document.querySelector('nav[aria-label="Workflow steps"]');
        const norm = (el) => (el.innerText || "").trim().replace(/^\d+\s+/, "").toLowerCase();
        const link = [...(rail ? rail.querySelectorAll("a") : [])].find((el) => norm(el) === text.toLowerCase());
        link?.click();
        return !!link;
      }, label);
      if (!hit) throw new Error(`step not available in the rail: "${label}"`);
      await wait(1600);
    };
    const toTop = async () => {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await wait(300);
    };

    /*
     * Clear any diagnostic standing between the walkthrough and the next screen.
     *
     * The lab gates steps behind short prediction forms — the pre-lab diagnostic
     * before the workflow opens, and a "Predict before you configure" checkpoint
     * before the instrument. They are radio buttons, so the first option of each
     * question is chosen and the block submitted. The button is matched on
     * "Submit" rather than its full caption: the brief's reads "Submit and start
     * the workflow" and the checkpoint's "Submit answers", and matching the
     * longer one meant the pre-lab was never answered, every later step stayed
     * locked, and the walkthrough was quietly redirected back to the brief.
     * Driving the real form rather
     * than seeding through the API keeps the recording honest about what a
     * learner actually has to do, and costs only a few seconds on screen.
     *
     * Returns false when there was no form to answer, so callers can use it
     * unconditionally after a navigation.
     */
    const answerAnyQuestions = async () => {
      for (let round = 0; round < 4; round += 1) {
        const answered = await page.evaluate(() => {
          const submit = [...document.querySelectorAll("button")].find(
            (b) => (b.textContent || "").trim().startsWith("Submit") && b.getClientRects().length > 0,
          );
          if (!submit) return false;
          for (const set of document.querySelectorAll("fieldset")) {
            const first = set.querySelector('input[type="radio"]:not(:disabled)');
            if (first && !set.querySelector('input[type="radio"]:checked')) first.click();
          }
          return true;
        });
        if (!answered) return round > 0;
        await wait(900);
        await page.evaluate(() => {
          const submit = [...document.querySelectorAll("button")].find(
            (b) => (b.textContent || "").trim().startsWith("Submit") && !b.disabled,
          );
          submit?.click();
        });
        await wait(2500);
      }
      return true;
    };

    await beat("What the lab is", 4500);
    await page.evaluate(() => window.scrollBy({ top: 520, behavior: "smooth" }));
    await wait(3500);

    await beat("Choose a level and meet the sample");
    await toTop();
    await clickText(page, "a,button", "Choose a level");
    await wait(2200);
    await clickText(page, "a,button", "Read the project brief");
    await wait(3000);
    await page.evaluate(() => window.scrollBy({ top: 620, behavior: "smooth" }));
    await wait(4000);

    await toTop();
    await clickText(page, "a,button", "Start this project");
    await wait(3500);
    await answerAnyQuestions();

    await beat("Prepare the specimen");
    await clickStep("Prepare specimen");
    await wait(2000);
    await answerAnyQuestions();
    await wait(1500);
    await page.evaluate(() => window.scrollBy({ top: 420, behavior: "smooth" }));
    await wait(2500);
    /*
     * Basic's preparation is a guided route, not a form: Grind, Fill holder,
     * Pack, Level, Mount, each enabled only once the previous one is done, and
     * a save at the end. Clicking whatever single action is currently enabled
     * walks it without hard-coding five captions, and the step is worth showing
     * — it is the one place the lab makes the physical handling explicit.
     * Saving is also what unlocks Configure; navigating past it leaves the rest
     * of the workflow locked.
     */
    for (let i = 0; i < 8; i += 1) {
      const clicked = await page.evaluate(() => {
        const main = document.querySelector("main");
        const skip = /^(KB-|Sample$|Next:|Switch to)/;
        const btn = [...(main ? main.querySelectorAll("button") : [])].find(
          (b) => b.getClientRects().length > 0 && !b.disabled && !skip.test((b.innerText || "").trim()),
        );
        if (!btn) return null;
        const label = (btn.innerText || "").trim();
        btn.scrollIntoView({ block: "center" });
        btn.click();
        return label;
      });
      if (!clicked) break;
      await wait(1500);
      if (clicked.startsWith("Save changes")) break;
    }
    await wait(2500);

    await beat("Configure the instrument");
    await toTop();
    await clickStep("Configure instrument");
    await wait(2500);
    await answerAnyQuestions();
    await wait(1500);
    await page.evaluate(() => window.scrollBy({ top: 320, behavior: "smooth" }));
    await wait(4500);

    await beat("Start the virtual scan");
    await clickText(page, "a,button", "Create run and go to the scan");
    await wait(3000);
    /*
     * Fastest playback first. The later steps unlock only once a run has
     * actually finished — ten points is not enough, the status has to reach
     * completed — and three thousand points at the default speed is a minute of
     * watching a line grow. 200x keeps the beat honest and watchable; it changes
     * how fast points are shown, never the counts.
     */
    await clickText(page, "a,button", "200×");
    await wait(800);
    await clickText(page, "a,button", "Start virtual XRD scan");
    await wait(26000);

    await beat("Process and fit");
    await toTop();
    await clickStep("Process");
    await wait(4000);
    await page.evaluate(() => window.scrollBy({ top: 260, behavior: "smooth" }));
    await wait(3500);
    await toTop();
    await clickStep("Detect & fit peaks");
    await wait(5000);
    await page.evaluate(() => window.scrollBy({ top: 520, behavior: "smooth" }));
    await wait(4500);

    await beat("Analyse");
    await toTop();
    await clickStep("Assign reflections");
    await wait(5000);
    await page.evaluate(() => window.scrollBy({ top: 460, behavior: "smooth" }));
    await wait(4000);
    await toTop();
    await clickStep("Analyse");
    await wait(5000);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
    await wait(4000);

    await beat("Validate and redesign");
    await toTop();
    await clickStep("Interpret & submit");
    await wait(4000);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
    await wait(5000);

    await beat("Where to get help");
    await toTop();
    await clickText(page, "a,button", "Knowledge Bank");
    await wait(4000);
    await page.evaluate(() => window.scrollBy({ top: 380, behavior: "smooth" }));
    await wait(4500);
  },

  /*
   * OmicsLab Pro — the eight tutorial steps of the lab page, in their order.
   *
   * Unlike the client-only labs, this one has a server: runs execute on a
   * worker pool and belong to the learner's account. Two consequences for a
   * recording. First, the lab must be launched with a token (see below), the
   * same as a learner arriving from the dashboard. Second, a Core run takes
   * about three quarters of a minute, which is not something to watch — so the
   * walkthrough starts one for real, says that it queues on the server, and
   * then opens an earlier run of the same pipeline that has finished. Both runs
   * are genuine; nothing here is staged data.
   *
   * Run it against a lab whose database has at least two completed Core runs,
   * pointed at a hub that will authorise the token:
   *   node scripts/record-demo.mjs omicslab "http://localhost:5174/?auth_token=<token>"
   */
  omicslab: async (page, beat) => {
    const pause = (ms) => holdOnScreen(page, ms);

    /** Open a top-bar group, then the screen inside it. */
    const nav = async (group, item) => {
      await page.evaluate((label) => {
        const button = [...document.querySelectorAll("nav button")].find((b) =>
          (b.innerText || "").trim().toLowerCase().startsWith(label.toLowerCase()),
        );
        button?.click();
      }, group);
      await wait(450);
      await clickText(page, "a", item);
      await wait(1400);
    };

    /** Choose an option in a labelled <select> the way React will notice. */
    const pick = async (labelText, optionText) => {
      await page.evaluate((text, wanted) => {
        const label = [...document.querySelectorAll("label")].find((l) =>
          (l.innerText || "").trim().toLowerCase().startsWith(text.toLowerCase()),
        );
        const select = label?.querySelector("select") ||
          document.getElementById(label?.getAttribute("for") || "");
        if (!select) return;
        const option = [...select.options].find((o) => o.text.includes(wanted));
        if (!option) return;
        Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set.call(
          select,
          option.value,
        );
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }, labelText, optionText);
      await wait(900);
    };

    // The caption bar is fixed to the foot of the window and this app scrolls
    // the document, so give the page room to scroll clear of it.
    await page.evaluate(() => {
      document.body.style.paddingBottom = "110px";
    });

    await beat("OmicsLab Pro — the Live Lab for the eight-week single-cell and spatial programme", 4500);
    await scrollLab(page, 520);
    await beat("Lab Home: your week, and which analysis tracks your access opens", 4500);
    await scrollLab(page, 0);

    await nav("Program", "Knowledge Bank");
    await beat("Step 1 — read the method before you run it", 3500);
    await scrollLab(page, 700);
    await beat("Clusters are a model output, not a discovery — the reference says so plainly", 4500);

    await nav("Program", "Pre-Lab Assessment");
    await beat("Step 2 — the Pre-Lab Assessment finds the gaps while they are cheap to fix", 5000);

    await nav("Program", "Experimental Design Studio");
    await beat("Step 3 — plan the comparison before a run answers a different question", 4500);
    await scrollLab(page, 420);
    await pause(3000);
    await scrollLab(page, 0);

    await nav("Analysis", "Dataset Selector");
    await beat("Step 4 — every dataset names its source, accession, licence and limits", 4500);
    await scrollLab(page, 900);
    await beat("The teaching datasets say so until their files are ingested and validated", 4000);
    await scrollLab(page, 0);
    await clickText(page, "a", "Inspect and analyse");
    await wait(1600);
    await beat("The inspector lists what this dataset supports — and what it does not", 5000);

    await clickText(page, "button", "Start the guided analysis");
    await wait(2500);
    await beat("Step 5 — the run queues on the server, so you can close the tab", 4500);

    await nav("Analysis", "Analysis Workspace");
    await beat("An earlier run of the same pipeline has finished", 3000);
    await page.evaluate(() => {
      // The run just started is still queued. Open a finished *original* one —
      // the row carries both facts, so ask for them rather than taking the
      // first link and hoping.
      const link = [...document.querySelectorAll('a[href*="/runs/"]')].find((a) => {
        const row = a.closest("tr,li,article,div")?.innerText || "";
        return /completed/i.test(row) && /original/i.test(row);
      });
      link?.click();
    });
    await wait(3000);

    // Land on a step that drew something. The last step of this pipeline is
    // pathway enrichment, which records numbers rather than a figure, and
    // opening there shows an empty panel under a caption promising figures.
    await clickText(page, "button", "UMAP layout");
    await wait(2200);
    await beat("Step 6 — ten steps, each with its figure and the parameters that produced it", 4500);
    await clickText(page, "button", "Cell quality control");
    await wait(2200);
    await beat("Quality control: what was excluded, and on which thresholds", 4500);
    await clickText(page, "button", "Leiden clustering");
    await wait(2200);
    await beat("Clustering at the resolution this run recorded", 4000);
    await clickText(page, "button", "Marker genes and annotation");
    await wait(2200);
    await beat("Marker genes — the evidence behind any label you give a cluster", 4500);

    await scrollLab(page, 900);
    await beat("Step 7 — the Copilot speaks only about numbers this run produced", 5000);
    await scrollLab(page, 1500);
    await beat("And you write the interpretation; it is saved against the run", 4500);

    await nav("Analysis", "Compare Runs");
    // Two *different* runs, or the screen truthfully reports that nothing
    // changed. The option text carries which is which.
    await pick("Original run", "original");
    await pick("Alternate run", "alternate");
    await wait(2000);
    await beat("The same data at two clustering resolutions — and which conclusions moved", 5500);

    await nav("Record", "Capstone Workspace");
    await beat("Step 8 — the capstone will not submit without the runs it rests on", 5000);

    await nav("Record", "Report and Portfolio");
    await beat("Export a report that carries the parameters and the caveats with the figures", 5000);

    await nav("Program", "Knowledge Bank");
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await beat("OmicsLab Pro — a NanoSchool Live Lab", 4500);
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

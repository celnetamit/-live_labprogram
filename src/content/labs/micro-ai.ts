import type { LabGuide } from "./types";

/**
 * MicrobeAI Lab — https://micro.live-labs.org/
 *
 * Four sidebar modules (Knowledge Bank, Visualizer, Virtual Lab, Assessment).
 * The Virtual Lab holds the two experiments: Metagenomic Profiler and
 * Bioreactor Simulator.
 *
 * Both experiments now compute locally and deterministically — the eight demo
 * datasets and the whole digester model — so every claim below holds on every
 * run. Only an uploaded file goes to a language model.
 */
const guide: LabGuide = {
  slug: "micro-ai",

  summary: {
    tagline:
      "Find out which microbes live in a sample, then feed them in a digester and see how much biogas you can get out.",
    what: "Most microbes refuse to grow in a dish, so scientists read their DNA instead. This lab lets you do both halves of that job: first find out who lives in a sample of gut, sludge or soil, then run a digester and watch how temperature, pH and feed change the amount of biogas those microbes produce.",
    why: "Microbes do real industrial work. They turn waste into methane, clean our water, and digest our food. Sequencing them is now cheap — the skill in short supply is reading what comes back and knowing which dial to turn.",
    whoFor: "Biology, biotech and environmental engineering students. No coding and no command line. If you know roughly what DNA is, you can start here.",
    outcomes: [
      "Say what each stage of a metagenomics pipeline does to the data",
      "Read a community profile and name the organisms that dominate it",
      "Predict how temperature, pH, feed and retention time change biogas yield",
      "Explain why a digester goes sour, and how to spot it in the numbers",
      "Explain why growing microbes in a dish misses almost all of them",
    ],
  },

  /*
   * A captioned walkthrough: a title card stating the problem, on-screen
   * guidance over every action, and a closing card telling the learner what to
   * do next. The earlier cut was a silent click-through that never explained
   * why any of it mattered.
   */
  video: {
    url: "/demos/micro-ai.mp4",
    poster: "/demos/micro-ai.jpg",
    durationSec: 93,
    chapters: [
      { at: 0, label: "Why this lab exists" },
      { at: 9, label: "Knowledge Bank — the words you need first" },
      { at: 14, label: "Experiment 1 — the Metagenomic Profiler" },
      { at: 24, label: "Pick a demo dataset and run it" },
      { at: 28, label: "Reading a healthy gut profile" },
      { at: 40, label: "Compare it with an acid mine drainage site" },
      { at: 53, label: "Experiment 2 — the Bioreactor Simulator" },
      { at: 57, label: "A baseline at 37 °C and pH 7" },
      { at: 69, label: "Drop pH to 5.5 and watch it sour" },
      { at: 88, label: "What to do next" },
    ],
  },

  prerequisites: [
    "School-level biology — what DNA is, and roughly what a species is",
    "A desktop browser for the 3D visualiser",
    "Nothing to download. The eight demo datasets run offline, instantly",
  ],

  steps: [
    {
      title: "Learn the words first",
      goal: "Pick up the handful of terms the experiments use without explaining.",
      actions: [
        "Open **Knowledge Bank** in the sidebar.",
        "Read the entries on metagenomics, taxonomic ranks, anaerobic digestion and the 16S rRNA gene.",
        "Check you can order the ranks from Kingdom down to Species.",
      ],
      expect: "You can say how a genus differs from a species, and how a metagenome differs from a genome.",
      why: "Results come back at several taxonomic levels at once. Without the hierarchy in your head, a composition chart is just coloured bars.",
      minutes: 8,
    },
    {
      title: "Run your first sample",
      goal: "Get a community profile out of the machine.",
      actions: [
        "Open **Virtual Lab**. It opens on the **Metagenomic Profiler** tab.",
        "Under **Or select example data**, choose **Demo Data: Healthy Gut Microbiome**.",
        "Click **Run Analysis**.",
      ],
      expect: "A composition chart, a ranked species list and a short written interpretation. Bacteroidetes and Firmicutes together take about 80% of a healthy gut.",
      why: "The demo datasets are computed on your own machine, so they are instant, work offline, and give the same answer every time. That matters: you need a fixed reference before you can tell whether anything you change later made a difference.",
      minutes: 8,
    },
    {
      title: "Read the result, don't just look at it",
      goal: "Turn the chart into a sentence about the sample.",
      actions: [
        "Find the two phyla that dominate, and note roughly what share they hold.",
        "Look down the species list — several are butyrate producers, which feed the cells lining your colon.",
        "Read the lab's interpretation, then check it against the chart yourself.",
      ],
      expect: "You can describe the sample in one sentence, and point to the numbers that back it up.",
      why: "These percentages are relative, not absolute. They tell you the proportions in the sample, never how many cells there are. Two samples with identical charts can differ enormously in total biomass — mixing those up is the most common beginner error.",
      minutes: 8,
    },
    {
      title: "Compare two very different worlds",
      goal: "See how much the shape of a profile tells you on its own.",
      actions: [
        "Run **Demo Data: Acid Mine Drainage** and look at how few groups there are.",
        "Now run **Demo Data: Bioreactor Sludge** and notice the archaea — nearly a third of it.",
        "Compare both against the gut sample you started with.",
      ],
      expect: "Acid mine drainage is dominated by one genus. Sludge is rich in methanogens. The gut sits in between.",
      why: "A flat, even profile means many niches and a stable habitat. A spiky one means harsh conditions where only a few organisms cope. You can read that off the shape before you know a single species name.",
      minutes: 10,
    },
    {
      title: "Set a bioreactor baseline",
      goal: "Get one reference run before changing anything.",
      actions: [
        "Click the **Bioreactor Simulator** tab.",
        "Leave the defaults: 37 °C, pH 7.0, glucose, HRT 20 days.",
        "Click **Start Simulation** and write down the total yield and methane percentage.",
      ],
      expect: "About 0.78 m³/kg of biogas at roughly 55% methane, with a curve that rises steeply then flattens.",
      why: "37 °C and pH 7 are where most real digesters run. Starting anywhere else makes every later comparison meaningless.",
      minutes: 7,
    },
    {
      title: "Sour the digester on purpose",
      goal: "See the failure that ruins real plants, safely.",
      actions: [
        "Change pH to **5.5** and leave everything else alone. Run it.",
        "Compare the yield against your baseline, and read the suggestion.",
        "Put pH back to 7.0 and confirm it recovers.",
      ],
      expect: "Yield collapses from about 0.78 to about 0.13 — roughly a sixth — and the methane percentage drops too.",
      why: "Methanogens are the fussiest organisms in the tank and fail outside about pH 6.8–7.2. This is how digesters die: acid-forming bacteria outrun the methanogens, pH falls, more methanogens die, pH falls further. Notice the methane share drops as well — a struggling reactor vents proportionally more CO₂.",
      minutes: 10,
    },
    {
      title: "Change the feed and the clock",
      goal: "Learn why the same reactor gives different answers.",
      actions: [
        "Back at pH 7.0, switch the substrate to **cellulose** and run. Compare with glucose.",
        "Now raise HRT to **60 days** and run again.",
        "Try **15 °C** at 20 days, then the same 15 °C at a much longer HRT.",
      ],
      expect: "Cellulose gives less than glucose in 20 days (~0.66 vs ~0.78) but catches up by 60. Cold is slow rather than hopeless — hold it longer and it recovers.",
      why: "Cellulose has to be broken down into sugars before anything can ferment it, and that hydrolysis step is the slow one. Temperature and pH set the *rate*; how much gas a kilogram can ever give is fixed by the feed. So a cold reactor is not broken, just slow — which is exactly why retention time is a design decision.",
      minutes: 12,
    },
    {
      title: "Find your best settings, then test yourself",
      goal: "Put it together and check it stuck.",
      actions: [
        "Predict the settings that maximise yield, write the prediction down, then run it.",
        "Open **Visualizer** for the 3D models and supporting data.",
        "Open **Assessment** and complete it.",
      ],
      expect: "Your best run beats the baseline, and you can explain why rather than having found it by trial and error.",
      minutes: 10,
    },
  ],

  troubleshooting: [
    {
      problem: "Run Analysis gives an error.",
      fix: "If you selected one of the eight demo datasets, it should never fail — those are computed locally. If you uploaded your own file, profiling it needs an AI provider key on the deployment; without one, use a demo dataset instead.",
    },
    {
      problem: "The demo dataset gives the same answer every time.",
      fix: "That is deliberate. Demo results are computed, not guessed, so they are reproducible — which is what makes them usable as a reference to compare your later runs against.",
    },
    {
      problem: "Every bioreactor run gives roughly the same yield.",
      fix: "Change one field at a time and press Start Simulation after each change. Also check the value actually committed — click out of the field first. Above 20 days most settings are near completion anyway, so differences show up best at shorter retention times.",
    },
    {
      problem: "The 3D visualiser is blank.",
      fix: "It needs WebGL. Enable hardware acceleration and use a desktop browser.",
    },
  ],

  furtherReading: [
    { label: "EBI Metagenomics (MGnify) — real metagenomic datasets", href: "https://www.ebi.ac.uk/metagenomics/" },
    { label: "Krona — the hierarchical taxonomy viewer", href: "https://github.com/marbl/Krona/wiki" },
    { label: "IWA Anaerobic Digestion Model No. 1 (ADM1)", href: "https://iwaponline.com/wst/article/45/10/65/6034" },
  ],
};

export default guide;

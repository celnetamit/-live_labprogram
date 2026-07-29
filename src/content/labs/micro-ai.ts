import type { LabGuide } from "./types";

/**
 * MicrobeAI Lab — https://micro.live-labs.org/
 *
 * Four modules in the sidebar (Knowledge Bank, Visualizer, Virtual Lab,
 * Assessment). The Virtual Lab itself splits into two tabs — Metagenomic
 * Profiler and Bioreactor Simulator — each driven by an animated pipeline.
 */
const guide: LabGuide = {
  slug: "micro-ai",

  summary: {
    what: "A spoonful of soil or a sample of sludge contains thousands of microbial species, almost none of which will grow in a petri dish. Modern microbiology sequences all of their DNA at once instead, then uses computation to work out who is present and what they are doing. This lab runs that whole workflow: you take raw sequencing reads through a metagenomics pipeline to a species breakdown, then use a bioreactor simulator to tune the conditions those microbes live in and see what it does to biogas yield.",
    why: "Microbial communities do industrial work — they digest waste, produce methane from it, fix nitrogen in soil, and dominate the human gut. Getting more out of them means understanding which organisms are present and what conditions favour them, and that has become a computational discipline rather than a bench one. Sequencing costs have collapsed; the bottleneck now is people who can interpret the output.",
    whoFor: "Biology, biotechnology, environmental engineering and bioinformatics students. No command-line or programming experience needed — the pipeline that would normally be a week of shell scripting is presented as a visual sequence of stages.",
    outcomes: [
      "Name the stages of a metagenomics pipeline and say what each one does to the data",
      "Read a taxonomic composition result and identify which organisms dominate a community",
      "Predict how temperature, pH, substrate and retention time affect anaerobic digestion",
      "Find operating conditions that raise biogas yield, and explain the mechanism rather than just the number",
      "Explain why culture-based microbiology misses the great majority of species present",
    ],
  },

  video: {
    url: "/demos/micro-ai.mp4",
    poster: "/demos/micro-ai.jpg",
    durationSec: 47,
    chapters: [
      { at: 0, label: "Sequencing a community you cannot culture" },
      { at: 4, label: "Knowledge Bank — the concepts first" },
      { at: 12, label: "Visualizer — 3D models and data" },
      { at: 19, label: "Virtual Lab — the Metagenomic Profiler" },
      { at: 32, label: "Bioreactor Simulator — temperature, pH, substrate" },
      { at: 41, label: "Assessment" },
    ],
  },

  prerequisites: [
    "Introductory biology — what DNA is, and roughly what a species is",
    "A desktop browser for the 3D visualiser",
    "About 55 minutes for both halves of the Virtual Lab",
    "Nothing to upload: the lab ships demo sequencing data, though you may supply your own file",
  ],

  steps: [
    {
      title: "Build vocabulary in the Knowledge Bank",
      goal: "Learn the six or seven terms the rest of the lab uses without explanation.",
      actions: [
        "Open **Knowledge Bank** in the sidebar.",
        "Read the entries on metagenomics, taxonomic ranks, anaerobic digestion and the 16S rRNA gene.",
        "Make sure you can order the taxonomic ranks from Kingdom down to Species.",
      ],
      expect: "You can say what distinguishes a genus from a species, and what a metagenome is as opposed to a genome.",
      why: "The profiler reports results at several taxonomic levels at once. Without the hierarchy in mind, a composition chart is just coloured bars.",
      minutes: 8,
    },
    {
      title: "Open the Metagenomic Profiler and load data",
      goal: "Get sequencing reads into the pipeline.",
      actions: [
        "Open **Virtual Lab** in the sidebar. It opens on the **Profiler** tab.",
        "Use the demo dataset rather than your own file for the first run, so you have a known result to compare against.",
        "Start the pipeline.",
      ],
      expect: "The pipeline visualiser lights up and begins advancing through its stages.",
      why: "Real metagenomics starts with a FASTQ file of millions of short reads, each a fragment of some organism's genome, with no label saying which. Everything the pipeline does is an attempt to put those fragments back together and attribute them.",
      minutes: 5,
    },
    {
      title: "Follow all six pipeline stages",
      goal: "Understand what each stage contributes, rather than watching an animation.",
      actions: [
        "Watch the stage indicator move through **Data Ingestion**, **QC & Trimming**, **Assembly**, **Binning**, **Taxonomy** and **Analysis**.",
        "Pause on each and write one sentence on what it does.",
        "Pay particular attention to Binning — it is the step most people cannot explain afterwards.",
      ],
      expect: "Six stages complete in order, each marked done before the next begins.",
      why: "In brief: ingestion reads the file; QC discards low-quality bases and adapter sequence; assembly stitches overlapping reads into longer contigs; binning groups those contigs by which organism they probably came from, using composition and coverage; taxonomy assigns names to the bins; analysis summarises. Skip QC and every later stage inherits the errors.",
      minutes: 10,
    },
    {
      title: "Read the taxonomic result properly",
      goal: "Turn a composition chart into a statement about the community.",
      actions: [
        "Read the composition breakdown and identify the dominant groups.",
        "Look at the top species list and their abundances.",
        "Read the interpretation the lab provides, then check it against the chart yourself.",
        "Open the Krona plot link to explore the hierarchy interactively.",
      ],
      expect: "A composition chart, a ranked species list with abundances, and a written interpretation.",
      why: "Abundance is relative, not absolute — it tells you the proportions in your sample, not how many cells are in the reactor. Two samples with identical composition can differ by orders of magnitude in total biomass, and conflating the two is a common misreading.",
      minutes: 10,
    },
    {
      title: "Switch to the Bioreactor Simulator and establish a baseline",
      goal: "Get one reference run before you start changing things.",
      actions: [
        "Click the **Simulator** tab inside the Virtual Lab.",
        "Leave the defaults: temperature 37 °C, pH 7.0, substrate glucose, hydraulic retention time 20 days.",
        "Run it and watch the five stages — Initialize, Thermodynamics, Kinetics, Mass Balance, Yield Calc.",
        "Write down the total yield and the methane percentage.",
      ],
      expect: "A biogas production curve over time, a total yield figure, a methane percentage and a written suggestion.",
      why: "37 °C and pH 7 are the mesophilic optimum — the conditions most anaerobic digesters actually run at, and close to human body temperature for the same underlying reason. Starting anywhere else makes your later comparisons meaningless.",
      minutes: 8,
    },
    {
      title: "Change one parameter at a time",
      goal: "Attribute each change in yield to a specific cause.",
      actions: [
        "Drop the pH to around 5.5, leaving everything else alone. Run and compare against your baseline.",
        "Restore pH 7.0, then raise the temperature towards the thermophilic range. Run and compare.",
        "Restore the temperature, then switch the substrate from glucose to cellulose. Run and compare.",
        "Finally, shorten the retention time substantially and see what happens to yield.",
      ],
      expect: "Acidic pH cuts yield sharply. Higher temperature speeds the reaction but is less forgiving. Cellulose yields more slowly than glucose. Short retention times cut yield because the process is stopped before it finishes.",
      why: "Methanogens — the archaea that make the methane — are the most fragile organisms in the reactor and the first to fail outside pH 6.8–7.2. Acidification is the classic digester failure: acid-producing bacteria run faster than methanogens can consume their output, pH drops, methanogens die, pH drops further. Cellulose is slower simply because it must be hydrolysed to sugars before anything can ferment it.",
      minutes: 14,
    },
    {
      title: "Optimise deliberately, then check the visualiser",
      goal: "Combine what you learned into a best run and confirm your model of it.",
      actions: [
        "Choose parameters you predict will maximise yield, and write the prediction down before running.",
        "Run and compare with the lab's own suggestion.",
        "Open **Visualizer** in the sidebar to explore the 3D models and supporting data.",
      ],
      expect: "Your best run beats the baseline, and the lab's suggestion is close to what you reasoned your way to.",
      minutes: 10,
    },
    {
      title: "Take the assessment",
      goal: "Confirm the mechanisms stuck, not just the settings.",
      actions: [
        "Open **Assessment** in the sidebar and complete it.",
        "For anything you get wrong, return to the relevant module rather than guessing again.",
      ],
      expect: "A completed assessment with explanations for incorrect answers.",
      minutes: 8,
    },
  ],

  troubleshooting: [
    {
      problem: "The pipeline stalls partway through.",
      fix: "The taxonomy stage calls a language model through a gateway; a transient upstream error stops the run. Retry, and if it fails repeatedly the workshop's provider key needs attention from the organiser.",
    },
    {
      problem: "My uploaded file produces nothing useful.",
      fix: "Start with the built-in demo dataset to confirm the pipeline works, then compare its format against yours. Arbitrary text files will not profile.",
    },
    {
      problem: "Every bioreactor run gives roughly the same yield.",
      fix: "Check you are actually committing the slider changes before running, and that you are comparing against a written-down baseline rather than an impression of one.",
    },
    {
      problem: "The 3D visualiser is blank.",
      fix: "It needs WebGL. Enable hardware acceleration and use a desktop browser.",
    },
  ],

  furtherReading: [
    { label: "EBI Metagenomics (MGnify) — real metagenomic datasets and analyses", href: "https://www.ebi.ac.uk/metagenomics/" },
    { label: "Krona — the hierarchical taxonomy viewer the results link to", href: "https://github.com/marbl/Krona/wiki" },
    { label: "IWA Anaerobic Digestion Model No. 1 (ADM1)", href: "https://iwaponline.com/wst/article/45/10/65/6034" },
  ],
};

export default guide;

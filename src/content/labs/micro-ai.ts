import type { LabGuide } from "./types";

/**
 * MicrobeAI BioLab — https://micro.live-labs.org/
 *
 * The tutorial's eight steps were rewritten again on 29 September 2026 to
 * carry the "Live lab Profile content" brief's own Step-by-Step Tutorial
 * verbatim into this schema's title/goal/actions/expect/why shape, replacing
 * an earlier rewrite done against the Final Developer Implementation &
 * Public Launch Document (NSTC / NanoSchool, 19 August 2026).
 *
 * That earlier version's `expect` lines quoted specific figures measured by
 * running the lab's own engines against its curated datasets (percentages,
 * QC scores, digester yields). The brief describes what each screen shows in
 * general terms rather than any one dataset's numbers, so this version's
 * `expect` lines do the same — the specific figures still hold and are
 * exactly what a learner following **Explore anaerobic digestion** will see,
 * they are just no longer asserted here as a value to check against. Where
 * the brief gave no "Why it matters" line (step 8), none is added.
 */
const guide: LabGuide = {
  slug: "micro-ai",

  summary: {
    tagline:
      "Read the DNA of a whole microbial community, then run the digester those microbes live in and watch what makes it fail.",

    what:
      "Fewer than one microbe in a hundred will grow in a laboratory dish, so most of what lives in soil, sludge or a human gut has never been cultured. Metagenomics gets around that by skipping cultivation entirely: extract all the DNA in a sample at once and read it. This lab takes you through that workflow end to end — inspect the sequence file, quality-control it, find out which organisms are there and in what proportion, work out what that community could do chemically, and then run an anaerobic digester to see how temperature, pH, feedstock and retention time change how much methane those organisms give you.",

    why: [
      "Anaerobic digestion depends on different groups of microorganisms working together to break down organic matter and produce biogas.",
      "Sequencing helps us study these microbial communities, but the results need to be interpreted carefully — a community profile shows which microbial groups were classified and their relative abundance, which is a proportion of sequencing data, not a direct measure of cell number, biomass, or microbial activity.",
      "Some information, such as functional potential, may be inferred from the organisms identified in the sample and available reference information — it can suggest what a community may be capable of doing, but not whether that function is active in the sample.",
      "Understanding the difference between detected, inferred, predicted, and unknown information helps users interpret the results more carefully.",
    ],

    whoFor:
      "This lab is suitable for students, researchers, and professionals interested in microbiology, biotechnology, bioinformatics, environmental science, anaerobic digestion, and bioprocess engineering.",

    outcomes: [
      "Identify the type of sequencing data from the information available in a file.",
      "Read a quality-control report and understand whether the data are suitable for further analysis.",
      "Explore a microbial community profile and interpret relative abundance and unclassified reads.",
      "Compare an analysed microbial community with a mock community of known composition.",
      "Distinguish between detected and inferred results.",
      "Describe the main microbial stages involved in anaerobic digestion.",
      "Explore how pH, temperature, substrate, and hydraulic retention time affect the digester simulation.",
      "Compare microbial profiles from normal and stressed digester conditions.",
    ],
  },

  /*
   * Rewritten again against the "Live lab Profile content" brief (29 September
   * 2026), which moves the lab's category from the "Living intelligence"
   * framing to the plainer "Metagenomics and anaerobic digestion" and supplies
   * its own about/feature/tag copy — the four feature cards below carry the
   * brief's own full paragraphs verbatim rather than the condensed one-liners
   * this file used at first. Every claim carried over was re-checked against
   * the lab, not just copied:
   *  - "Digester Simulation" ("change parameters such as pH, temperature,
   *    substrate, and retention time, and see how the simulation changes"):
   *    true in the narrow sense `engine/adm1Mapping.ts` defines — a detected
   *    organism selects an ADM1 guild and perturbs the biomass in it, and
   *    never overwrites a kinetic constant.
   *  - "Real-World Sequencing Data" ("public microbial sequencing data, along
   *    with selected reference and mock datasets"): `engine/realDatasets.ts`
   *    ships ENA subsamples (SRR2039580 and others), and the curated sets in
   *    `datasets.ts` are synthetic mock communities of known composition —
   *    the two halves of the claim.
   *  - The brief's demo-chapter timestamps (0:00 through 2:28) match this
   *    file's `video.chapters` exactly, confirming it describes the same cut
   *    already recorded; its flagged gap — no audio track, no captions — was
   *    checked directly against `public/demos/micro-ai.mp4` (no `mp4a`/`soun`
   *    atoms) and closed here with a `.vtt` built from the existing `say`
   *    lines, which were already written as narration rather than shot notes.
   *  - "AI-assisted analysis" is dropped from the tag list: the brief's own
   *    tags don't carry it, and it was the one claim in the previous copy the
   *    lab itself couldn't fully back — the Evidence screen's explanation is
   *    model-written, but nothing else on the page is.
   *
   * The palette is sampled from the cover micrograph (Yong, Nature 2012): the
   * blue rods, the coral clusters, the pink filament and the olive matrix.
   * `ink` values are the same hues darkened until they hold at least 4.5:1 on
   * the light-theme panel.
   */
  showcase: {
    overline: "Metagenomics and anaerobic digestion",
    title: [{ text: "Microbe" }, { text: "AI", accent: "primary" }, { text: " Lab", accent: "secondary" }],
    headline: "Explore microbial communities through metagenomics and anaerobic digestion.",
    intro:
      "Analyze microbial sequence data, understand how different microorganisms contribute to substrate breakdown and methane production, and link microbial composition to digester performance.",
    about: [
      "The MicrobeAI Live Lab is designed to introduce learners to computational analysis of complex microbial communities using metagenomic sequencing data and process-based simulation. Since a large proportion of microorganisms present in the environment cannot be readily cultured under standard laboratory conditions, **metagenomics** enables their investigation through **direct analysis of microbial DNA** recovered from a sample.",
      "Learners will work with microbial sequencing datasets to perform **quality assessment, taxonomic profiling, community composition analysis, and interpretation of microbial diversity patterns**. The lab further connects microbial community analysis with an **anaerobic digestion simulation**, enabling users to examine how operational variables such as **pH, temperature, substrate conditions, and retention time** can influence microbial activity, process stability, and predicted digester performance.",
      "By integrating **microbial data analysis with bioprocess simulation**, the lab provides a practical framework for understanding how microbial community structure and environmental conditions interact within anaerobic systems.",
    ],
    tags: ["Metagenomics", "Microbial Ecology", "Bioinformatics", "Anaerobic Digestion", "Simulation"],
    walkthroughTitle: "From microbial community to ecosystem model",
    journey: "MicrobeAI",
    card: {
      badge: "Interactive lab",
      icon: "sequence",
      description:
        "Explore microbial communities through metagenomics and anaerobic digestion. Analyze sequencing data, identify microbial groups, and simulate how a digester responds to changing conditions.",
    },
    photo: { position: "50% 18%", creditLabel: "Micrograph" },
    palette: {
      primary: { onDark: "#8fb8c7", ink: "#2f6477" },
      secondary: { onDark: "#d96058", ink: "#b0372e" },
      action: { onDark: "#d799a9", ink: "#9c3f58" },
      quiet: { onDark: "#9da68c", ink: "#56603f" },
      cta: { onDark: "#d799a9", ink: "#9c3f58", text: "#241216" },
      level: "#e6c9bc",
      features: [
        { onDark: "#8fb8c7", ink: "#2f6477" },
        { onDark: "#d96058", ink: "#b0372e" },
        { onDark: "#d799a9", ink: "#9c3f58" },
        { onDark: "#9da68c", ink: "#56603f" },
      ],
    },
    ground: {
      page: "#0a0f0e",
      sidebar: "#0b1012",
      surface: ["#161d1b", "#0d1311"],
      hero: "#101715",
      scrim: "#080d0c",
      text: "#f5f1e9",
      muted: "#9ca8a2",
      copy: "#aeb9b3",
      soft: "#83918a",
    },
    features: [
      {
        icon: "sequence",
        title: "Metagenomic Data",
        body: "Explore public microbial sequencing data, along with selected reference and mock datasets. Review the data, check its quality, and understand how sequencing information is used before moving to biological interpretation.",
      },
      {
        icon: "analysis",
        title: "Microbial Community Analysis",
        body: "Analyze microbial sequencing data through a structured bioinformatics workflow. Examine sequence-level information, evaluate data quality, identify microbial taxa, and compare community composition and diversity patterns to understand how sequencing data can reveal microbial ecosystem structure.",
      },
      {
        icon: "simulation",
        title: "Digester Simulation",
        body: "Explore how an anaerobic digester responds to different operating conditions. Change parameters such as pH, temperature, substrate, and retention time, and see how the simulation changes. This helps you understand how different process conditions may be related to digester behaviour.",
      },
      {
        icon: "insight",
        title: "Practical Learning",
        body: "Explore how metagenomics, microbial ecology, bioinformatics, and anaerobic digestion come together in one workflow. Follow the process step by step, from sequencing data and microbial community analysis to biological interpretation and understanding digester behaviour.",
      },
    ],
  },

  /*
   * Recorded against the running lab with `node scripts/record-demo.mjs
   * micro-ai <launch-url>`, so the walkthrough shows the workflow this page
   * describes rather than a previous version of it. The chapter marks are the
   * ones the recorder read off the finished cut, and each was checked against
   * the frame at that timestamp — an earlier take had 5.5 typed into the
   * temperature field while the caption claimed a pH change, which only the
   * frame check caught.
   *
   * The cut itself has no audio track — checked directly against the file
   * rather than taken on the brief's word, since a video element that fails
   * to load a missing captions file fails silently. `micro-ai.vtt` below is
   * built from the `say` line already on each chapter, so a voiceover
   * recorded to that same script will line up with it; until then it is the
   * caption track for a demo that plays silently.
   */
  video: {
    url: "/demos/micro-ai.mp4",
    poster: "/demos/micro-ai.jpg",
    captions: "/demos/micro-ai.vtt",
    durationSec: 153,
    chapters: [
      {
        at: 0,
        label: "Why metagenomics is useful",
        shot: "Title card, then Getting started with the three goal cards.",
        say: "Many microbes are difficult to grow in the lab, so we study the DNA present in the sample instead.",
      },
      {
        at: 6,
        label: "Choose what you want to study",
        shot: "Click 'Explore anaerobic digestion', then 'Start with this goal'.",
        say: "Select the anaerobic digestion goal and load the provided dataset.",
      },
      {
        at: 13,
        label: "Check the input first",
        shot: "The Input summary panel: file, size, expected type, detected format, SHA-256.",
        say: "See the file details before any microbial analysis is shown.",
      },
      {
        at: 20,
        label: "Look at what is actually in the file",
        shot: "The Inspection step: record count, length range, measured alphabet.",
        say: "Check the number of records, sequence length, and sequence content.",
      },
      {
        at: 27,
        label: "Run the quality check",
        shot: "The QC route banner, then Run format-specific QC and analysis.",
        say: "The lab applies quality checks based on the type of sequencing data.",
      },
      {
        at: 42,
        label: "Read the QC result",
        shot: "The QC verdict badge and findings list.",
        say: "Check the read count and the main quality values before moving ahead.",
      },
      {
        at: 49,
        label: "See which analyses are possible",
        shot: "The eligibility table: Eligible, Eligible with limitations, Module not built.",
        say: "The lab shows which analyses can be used with the dataset and why.",
      },
      {
        at: 55,
        label: "See which microbes are present",
        shot: "Community profile: the phylum pie and the abundant-species bar graph.",
        say: "View the main microbial groups in the sample and their relative abundance.",
      },
      {
        at: 65,
        label: "Look inside a microbial group",
        shot: "Click the Euryarchaeota chip; the species-level graph opens beneath.",
        say: "Select a phylum to see the species classified within it.",
      },
      {
        at: 74,
        label: "Understand what is inferred",
        shot: "Functional potential, with the red banner in frame.",
        say: "Functional potential is based on the organisms identified in the sample; it is not the same as directly detecting a gene.",
      },
      {
        at: 85,
        label: "Follow the stages of anaerobic digestion",
        shot: "Traits and guilds, the four stages in process order.",
        say: "See the main microbial groups linked with each stage of the process.",
      },
      {
        at: 92,
        label: "Open the digester model",
        shot: "Bioreactor, Educational Simulator, defaults at 37 degrees and pH 7.",
        say: "Use the simulator to see how the model responds under different conditions.",
      },
      {
        at: 106,
        label: "Start with the baseline",
        shot: "The result tiles: total yield, methane content, stability risk.",
        say: "Check the starting values for biogas yield, methane content, and stability.",
      },
      {
        at: 110,
        label: "Change the pH",
        shot: "Set pH to 5.5 and run again.",
        say: "Lower the pH and see how the simulated digester responds.",
      },
      {
        at: 124,
        label: "Compare the change",
        shot: "The collapsed result beside the mandatory label.",
        say: "Look at how the yield and methane values change. These are simulation results, not real-plant predictions.",
      },
      {
        at: 129,
        label: "Complete the Basic Mode assessment",
        shot: "Assessment, answering and submitting.",
        say: "Use the assessment to check what you understood from the workflow.",
      },
      {
        at: 142,
        label: "Move to Moderate Mode",
        shot: "The Unlock Moderate Mode button appearing.",
        say: "After completing the assessment, you can unlock the next level.",
      },
      {
        at: 148,
        label: "Continue to the next level",
        shot: "Moderate unlocked in the sidebar, Advanced still locked.",
        say: "Moderate Mode is unlocked after assessment. Advanced Mode is available separately.",
      },
    ],
  },

  /*
   * The brief supplies "What's Included in the Lab" content here rather than
   * a readiness checklist, so this list answers "what's in here" rather than
   * "what you need before you begin" — which is now every lab's section
   * heading (`LabGuideSections.tsx`/`page.tsx`), not just this one's, so no
   * `prerequisitesLabel` override is needed.
   */
  prerequisites: [
    "**Curated Microbial Sequencing Datasets** — Work with selected sequencing datasets representing diverse microbial communities and varying data-quality conditions.",
    "**Sequence Quality Assessment** — Evaluate sequencing quality and key QC indicators to determine whether datasets are suitable for downstream analysis.",
    "**Microbial Community Profiling** — Examine taxonomic composition, relative abundance, classified microbial groups, and unclassified reads to characterize community structure.",
    "**Functional Interpretation** — Explore predicted biological functions and metabolic potential associated with microbial community profiles.",
    "**Anaerobic Digester Simulation** — Modify parameters such as pH, temperature, substrate conditions, and retention time to investigate their influence on simulated digester performance.",
    "**Guided Analysis & Assessment** — Follow a structured workflow with guided interpretation and knowledge checks to understand results and progress through each stage of the lab.",
  ],

  steps: [
    {
      title: "Understand the Key Terms",
      goal: "Start by reviewing the terms used throughout the lab.",
      actions: [
        "Open the Knowledge Bank and read about metagenomics, taxonomic levels, functional potential, and anaerobic digestion.",
        "Pay particular attention to terms such as detected, inferred, predicted, and unknown.",
      ],
      expect:
        "You can explain metagenomics, taxonomic levels, functional potential and anaerobic digestion in your own words, and say what detected, inferred, predicted and unknown each mean.",
      why:
        "These words describe different types and levels of scientific evidence. Understanding the distinction will help you interpret the results appropriately.",
      minutes: 8,
    },

    {
      title: "Start with a Digester Dataset",
      goal: "Load a real dataset and see what it is before any microbial result appears.",
      actions: [
        "Open Getting Started and select Explore Anaerobic Digestion.",
      ],
      expect:
        "The lab loads the anaerobic-digester sludge dataset and takes you to QC & Eligibility, where you can review the file information before examining microbial results.",
      why:
        "Before analysing a sample, it is important to understand the type and quality of data you are working with.",
      minutes: 6,
    },

    {
      title: "Check the Data Quality",
      goal: "Work through QC & Eligibility to understand what the data is and what it can support.",
      actions: [
        "Work through the four sections in QC & Eligibility: Input Summary, Content Inspection, Quality Control, and Analysis Eligibility.",
      ],
      expect:
        "Each section reviews the file format, sequence information, quality measures, and the analyses that are suitable for the dataset.",
      why:
        "A dataset may be appropriate for some analyses but not others. These checks help you understand what conclusions the data can reasonably support.",
      minutes: 10,
    },

    {
      title: "Explore the Microbial Community",
      goal: "View the microbial groups classified in the sample.",
      actions: [
        "Open Community Profile to view the microbial groups classified in the sample.",
        "Explore the community at different taxonomic levels and examine the relative abundance of different groups.",
        "View the proportion of sequences that remain unclassified.",
      ],
      expect:
        "You see the community profile: the microbial groups classified in the sample, their relative abundance across taxonomic levels, and the unclassified fraction.",
      why:
        "The community profile provides an overview of the microbial composition of the sample. Relative abundance represents proportions within the classified data; it is not a direct measurement of cell number, biomass, or activity.",
      minutes: 12,
    },

    {
      title: "Explore Functional Potential",
      goal: "Explore possible biological roles associated with the identified microbial community.",
      actions: [
        "Open Functional Potential and Traits & Guilds to explore possible biological roles associated with the identified microbial community.",
      ],
      expect:
        "You see the possible biological roles associated with the microbial community identified in the sample, organised by pathway and by guild.",
      why:
        "In MicrobeAI, functional information is inferred from the organisms identified in the sample together with curated reference information. It can suggest what the community may be capable of doing, but it does not demonstrate that these functions are currently active. This distinction should remain clear throughout the lab.",
      minutes: 10,
    },

    {
      title: "Understand the Visual Results",
      goal: "Explore the available figures, and check what each one is claiming.",
      actions: [
        "Open the Visualiser and explore the available figures.",
        "Check the source label on each visual.",
      ],
      expect:
        "Some figures are based on project data, while others are curated examples or supporting learning materials — and the source label tells you which.",
      why:
        "A reference diagram can explain a biological concept, but it is different from a result generated from the learner's sample. Source labels help learners distinguish between sample-derived results and educational reference material.",
      minutes: 6,
    },

    {
      title: "Explore the Anaerobic Digestion Model",
      goal: "Run the digester simulation and see how operating conditions change its output.",
      actions: [
        "Open Bioreactor and begin with the default conditions.",
        "Run the simulation, then change one condition at a time.",
        "Explore the effects of changing pH, temperature, substrate, and hydraulic retention time (HRT).",
        "Compare the outputs after each change.",
      ],
      expect:
        "The outputs change as you vary pH, temperature, substrate and HRT. Note: the results are generated by an educational simulation. They are not predictions for a real biogas plant or operating digester.",
      why:
        "Anaerobic digestion is affected by both microbial processes and operating conditions. The simulation helps you explore how these factors are represented in the model.",
      minutes: 14,
    },

    {
      title: "Check Your Understanding",
      goal: "Test what you understood, and unlock the next level.",
      actions: [
        "After completing the workflow, open the Assessment.",
        "Answer the questions and submit. Each tests your understanding of a different part of the lab.",
        "Once you complete the required assessment, unlock Moderate Mode and continue to the next level.",
        "Optional: compare the starting digester dataset with the provided acid-stress dataset to examine how microbial communities differ under stressed conditions.",
      ],
      expect:
        "Completing the required assessment lets you unlock Moderate Mode and continue to the next level.",
      minutes: 12,
    },
  ],

  troubleshooting: [
    {
      problem: "Moderate Mode is locked, and I have finished the tutorial.",
      fix: "Moderate needs three things: the guided Basic demo walked as far as the eligibility step, the Assessment submitted, and then your own press of **Unlock Moderate Mode** on the Access screen. Meeting the conditions offers the unlock; it does not perform it. The Access screen lists all three with a tick or a cross against each, so it will tell you which one is outstanding.",
    },
    {
      problem: "Advanced Mode is locked even though I bought the lab.",
      fix: "Advanced is a separate paid tier, sold on top of lab access rather than included with it, and it is checked with the server on every load — no amount of tutorial or assessment progress opens it. The Access screen states which of the two you hold. If you believe you have purchased Advanced and it still shows locked, press **Re-check paid access** there and, if it persists, contact support with the endpoint named on that screen.",
    },
    {
      problem: "The lab says 'Blocked — expected and detected do not match' and will not run.",
      fix: "The input type you selected disagrees with what the file actually contains — for example a FASTQ file loaded while an assembled-contig FASTA was selected, or protein sequence loaded as a genome. The inspection step names both what it expected and what it found, and suggests the input type that fits. Change the type on **Objective & input data**, or load the file the type describes. The lab reads the content rather than the extension, so renaming a file will not resolve it.",
    },
    {
      problem: "No quality score, Q20 or Q30 is shown for my file.",
      fix: "That is correct for FASTA. FASTA carries sequence only, with no per-base quality, so there is no Phred score to report and the lab shows no quality tiles at all rather than an empty one. If you need quality-aware QC, supply the FASTQ. The curated *Hot compost* dataset is FASTA if you want to see this behaviour deliberately.",
    },
    {
      problem: "I have paired-end data. Where do I put R2?",
      fix: "Select both files together in the same file dialog — the upload accepts two. Which one leads is decided from the reads rather than from the file names, so it does not matter which order they come back in. The lab then checks that they really are one library: it matches record names across all three mate conventions in common use (Casava `1:N:0:`, a trailing `/1` and `/2`, and unmarked headers), and reports whether the two files are also in the same order. A pair that matches by name but not by position is reported separately, because that is the case that silently mates the wrong reads. Only the first file is analysed — a mate carries the same community as its partner, so counting both would double every number without adding an observation.",
    },
    {
      problem: "Community composition says 'Requires metadata' and asks me to demultiplex.",
      fix: "The run still holds several samples pooled together. The lab detects this when you supply the run's index reads alongside the amplicons — an index file is recognised by its shape, short uniform reads of around 8 to 12 bases, not by being called 'barcodes' — and it counts how many distinct barcodes are present to estimate how many samples are in the pool. Nothing is wrong with the reads, which is exactly why this is blocked rather than warned about: quality control passes, a community profile would appear, and it would be the average of every sample in the run rather than a description of any one of them. Split the run by sample first (QIIME 2's `demux emp-paired`, `cutadapt demultiplex`, or sabre), then load a single sample's reads.",
    },
    {
      problem: "Most of my reads come back unclassified.",
      fix: "That is usually honest rather than broken. Organisms are called by exact 31-base matches against a shipped reference index of a few dozen genomes, so anything outside that panel cannot be named and is reported as unclassified rather than being spread across the organisms that happen to be on it. A human gut or a soil sample will be largely unclassified here for that reason. Two other contributions are worth knowing about: the index keeps only a sample of each genome's k-mers, so some reads from a panel organism carry none of the indexed ones; and matching is strain-sensitive, so an organism present as a divergent strain is under-reported rather than misnamed. The unclassified fraction is therefore an upper bound on what is unknown, not a measurement of it.",
    },
    {
      problem: "Functional potential says the analysis is not eligible.",
      fix: "Most often the input is 16S or ITS amplicon data. A marker gene tells you who is present and carries no information about the rest of the genome, so genes, pathways and biosynthetic clusters cannot be derived from it. This block is enforced in the engine rather than advised in a banner, and it cannot be overridden from the interface. Shotgun sequencing is what supports functional questions.",
    },
    {
      problem: "Assembly, MAG recovery or biosynthetic gene clusters say 'Module not built'.",
      fix: "They are not implemented in this deployment. Each needs a server-side workflow and substantial compute that this browser-based build does not have, so the lab reports their absence instead of showing a plausible-looking result. In particular no MAG quality classification — high, medium or low — is produced anywhere, because none of the criteria behind those terms can be checked here. The Implementation register lists every module with its real status.",
    },
    {
      problem: "My project history is empty after signing in on another computer.",
      fix: "Projects are stored against your account, so they follow you — but only when you reach the lab by launching it from your dashboard, which is what signs you in. Opening the lab URL directly leaves the session unidentified and the history falls back to that browser alone. The Project history screen states which of the two you are looking at: 'Saved to your account' or 'This browser only'.",
    },
    {
      problem: "The Visualiser says it opens onto project data after functional profiling.",
      fix: "That is the intended order rather than a fault. Until functional profiling has run there is nothing project-specific to visualise, and every panel would be a teaching diagram identical for everyone. Run the analysis through the eligibility step first; if functional profiling was not eligible for your input, the QC & eligibility screen gives the reason.",
    },
    {
      problem: "The analysis sits on 'Generating the explanation' at stage 9 of 9.",
      fix: "That last stage asks a language model to write the summary prose, and it is the only part of the pipeline that leaves your browser. It gives up after thirty seconds and falls back to a deterministic template, so the run always completes. Every scientific number was already computed locally in the eight stages before it — the explanation is wording, never calculation.",
    },
  ],

  furtherReading: [
    {
      label: "MGnify (EBI Metagenomics) — real metagenomic datasets and analyses",
      href: "https://www.ebi.ac.uk/metagenomics/",
    },
    {
      label: "Gloor et al. 2017 — Microbiome datasets are compositional, and this is not optional",
      href: "https://doi.org/10.3389/fmicb.2017.02224",
    },
    {
      label: "Bowers et al. 2017 — MIMAG: minimum information about a metagenome-assembled genome",
      href: "https://doi.org/10.1038/nbt.3893",
    },
    {
      label: "Batstone et al. 2002 — IWA Anaerobic Digestion Model No. 1 (ADM1)",
      href: "https://doi.org/10.2166/wst.2002.0292",
    },
    {
      label: "Krona — the hierarchical taxonomy viewer",
      href: "https://github.com/marbl/Krona/wiki",
    },
  ],
};

export default guide;

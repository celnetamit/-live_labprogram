import type { LabGuide } from "./types";

/**
 * MicrobeAI BioLab — https://micro.live-labs.org/
 *
 * Rewritten against the Final Developer Implementation & Public Launch
 * Document (NSTC / NanoSchool, 19 August 2026). The previous guide described a
 * lab that no longer exists: it told learners to open a "Metagenomic Profiler"
 * tab and press "Run Analysis", and neither control is there any more. A
 * tutorial that names buttons which do not exist is worse than no tutorial,
 * because the learner assumes they are the ones who have gone wrong.
 *
 * §5.1 requires the tutorial to assume the BioLab is open alongside this page
 * and to walk the exact final workflow, so the eight steps below are §6's eight
 * steps, in §6's order, using the lab's real control names.
 *
 * Every number in an `expect` line was measured by running the lab's own
 * engines, not estimated. The datasets are generated deterministically, so a
 * learner sees the same figures — and if the model changes, these lines become
 * wrong and should be re-measured rather than quietly rounded.
 */
const guide: LabGuide = {
  slug: "micro-ai",

  summary: {
    tagline:
      "Read the DNA of a whole microbial community, then run the digester those microbes live in and watch what makes it fail.",

    what:
      "Fewer than one microbe in a hundred will grow in a laboratory dish, so most of what lives in soil, sludge or a human gut has never been cultured. Metagenomics gets around that by skipping cultivation entirely: extract all the DNA in a sample at once and read it. This lab takes you through that workflow end to end — inspect the sequence file, quality-control it, find out which organisms are there and in what proportion, work out what that community could do chemically, and then run an anaerobic digester to see how temperature, pH, feedstock and retention time change how much methane those organisms give you.",

    why:
      "Anaerobic digestion is microbiology doing industrial work. The same four-stage microbial chain runs sewage works, farm digesters and the biogas plants that turn food waste into fuel, and when it fails it fails for microbiological reasons that show up in the data days before the gas output drops. Sequencing is now cheap enough that the bottleneck is no longer generating the data. It is reading it honestly — knowing what a percentage in a community profile actually refers to, and knowing which claims the data will not support.",

    whoFor:
      "Biology, biotechnology and environmental engineering students, and process engineers who want to understand what the biology is doing. No coding, no command line. If you know what DNA is and roughly what a species is, you have enough to begin.",

    outcomes: [
      "Inspect a sequence file and say what it is from its contents, not its filename",
      "Read a quality-control report and explain which analyses it does and does not permit",
      "Interpret a community profile, including the unclassified fraction and what a relative abundance really measures",
      "Tell a detected result from an inferred one, and say why the difference matters",
      "Name the four stages of anaerobic digestion and the organisms that run each",
      "Predict how temperature, pH, feedstock and retention time change biogas yield, and explain the mechanism",
      "Recognise the microbial signature of a souring digester before the gas output falls",
    ],
  },

  /*
   * The recorded walkthrough shows the previous version of the lab — the old
   * two-experiment layout, with controls that have since been replaced. Rather
   * than leave a video that contradicts the running application, the section
   * renders the chapter list for the walkthrough to be recorded against the
   * final workflow. A learner following a video of a UI that no longer exists
   * concludes the lab is broken, which is the opposite of what a demo is for.
   */
  video: {
    url: null,
    /*
     * No runtime: the walkthrough has not been recorded yet, and a duration for
     * a video that does not exist would be a guess presented as a fact. The
     * chapter offsets below are a shot plan for whoever records it, which is
     * what this section is for until a file lands.
     */
    chapters: [
      {
        at: 0,
        label: "The problem: most microbes will not grow in a dish",
        shot: "Title card, then the Getting started screen with the three goal cards visible.",
        say: "Fewer than one percent of microbes will grow in a laboratory. So we read the DNA of the whole community at once instead.",
      },
      {
        at: 20,
        label: "Choosing a goal, and what a goal actually sets",
        shot: "Click 'Explore anaerobic digestion', then 'Start with this goal'.",
        say: "The goal sets the objective, loads a dataset, and decides where you land. It does not skip anything.",
      },
      {
        at: 40,
        label: "Step 1 of 4 — what was loaded",
        shot: "The Input summary panel: file name, size, expected type, detected format, SHA-256.",
        say: "Before any result, the lab shows you what it is about to analyse — including the format it read out of the bytes, not the file extension.",
      },
      {
        at: 65,
        label: "Steps 2 and 3 — inspection, then format-specific QC",
        shot: "Click through Inspection and QC. Show the QC route banner and the verdict badge.",
        say: "The content is inspected, then quality control runs — and which QC runs depends on what the file actually contains.",
      },
      {
        at: 95,
        label: "Step 4 — what the data will and will not support",
        shot: "The eligibility table, showing Eligible, Eligible with limitations and Module not built side by side.",
        say: "Eligibility is decided per analysis. Some things this data cannot support, and some this build does not implement — and those are different statements.",
      },
      {
        at: 125,
        label: "The community, and drilling into a phylum",
        shot: "Community profile: pie chart, then click the Euryarchaeota slice to open the species graph.",
        say: "Thirty-seven percent archaea. Click the slice and you see which three methanogens they are.",
      },
      {
        at: 160,
        label: "Function is inferred here, not detected",
        shot: "Functional potential, with the red banner at the top in frame, then Traits and guilds.",
        say: "No gene was detected anywhere in this build. Everything functional is inferred from which organisms were found, and the screen says so.",
      },
      {
        at: 195,
        label: "The Bioreactor, and souring it on purpose",
        shot: "Educational Simulator at pH 7 (0.535), then pH 5.5 (0.056). Show the mandatory label both times.",
        say: "Drop the pH and the yield falls to about a tenth. That is how a real digester dies — and the label never calls this a prediction.",
      },
      {
        at: 225,
        label: "Finishing Basic, and what comes next",
        shot: "Assessment, then the Unlock Moderate Mode button on the Access screen.",
        say: "Finish the Bioreactor step, take the assessment, and Moderate unlocks. Advanced is a separate paid tier.",
      },
    ],
  },

  prerequisites: [
    "Open the lab in a second tab and put it side by side with this page — every step below names a control you click in the lab",
    "School-level biology: what DNA is, and roughly what a species is",
    "A desktop browser. Nothing to install, and no command line at any point",
    "No data of your own is needed. The lab ships nine curated datasets, including a deliberately failed sequencing run",
    "Expect about an hour for the full workflow. It saves as you go, so you can stop and come back",
  ],

  steps: [
    {
      title: "Learn the words the results are written in",
      goal: "Pick up the vocabulary the rest of the workflow uses without stopping to explain.",
      actions: [
        "In the lab sidebar, under **LEARN**, open **Knowledge Bank**.",
        "Read the entries on metagenomics, taxonomic ranks, functional potential and anaerobic digestion.",
        "Pay particular attention to four words the lab uses precisely: **detected**, **inferred**, **predicted** and **unknown**.",
      ],
      expect:
        "You can say how a metagenome differs from a genome, order the taxonomic ranks from domain down to species, and explain why 'this organism was detected' and 'this function was inferred' are different kinds of claim.",
      why:
        "Those four words are the backbone of every result screen in this lab. Detected means something in your file matched a rule. Inferred means an organism was identified and a curated reference says organisms like it can do a particular thing — no gene was looked for at all. Confusing the two is the most common way metagenomics gets over-read, in student work and in published papers alike.",
      minutes: 8,
    },

    {
      title: "Start a guided analysis from a goal",
      goal: "Load a real dataset through the real pipeline, and see what it is before anything is computed from it.",
      actions: [
        "Open **Getting started** under **LEARN**.",
        "Choose **Explore anaerobic digestion**. This is the thread the rest of the tutorial follows.",
        "Press **Start with this goal**.",
      ],
      expect:
        "The lab loads *Anaerobic digester sludge* and takes you to **QC & eligibility**, which opens on step 1 of 4, **Input summary** — the file name, its size in bytes, the input type you declared, the format detected from the content, and a SHA-256 checksum. No microbial result is on screen yet.",
      why:
        "The ordering is deliberate and it is the point of this step. You are shown what is about to be analysed before you are shown any conclusion drawn from it. The curated datasets are real files that go through the identical pipeline — validation, inspection, quality control and classification — rather than stored answers. That is what makes them usable as a reference: change the file and every number downstream changes with it.",
      minutes: 6,
    },

    {
      title: "Walk the four steps that come before any result",
      goal: "Understand what the data is, whether it is any good, and which analyses that permits.",
      actions: [
        "On **Input summary**, note that *Detected format* says it was read from the content, not the extension.",
        "Press **Next: inspect the content**. Read the measured record count, length range and alphabet.",
        "Press **Next: run format-specific QC**, then **Run format-specific QC and analysis**.",
        "When the verdict appears, press **Next: analysis eligibility** and read the whole table.",
      ],
      expect:
        "Inspection reports 4,000 FASTQ records and confirms every sampled residue is nucleotide. QC returns **PASS** — mean quality Q34, 93.6% of bases at Q30 or above, GC 45.5%. The eligibility table then shows *Community composition: Eligible*, *Functional profiling: Eligible with limitations*, and *Assembly*, *MAG recovery* and *Biosynthetic gene clusters* all as **Module not built**.",
      why:
        "Quality control here is not one pass-or-fail stamp. A sample can be perfectly good for asking who is present and useless for asking what genes they carry, so eligibility is decided per analysis and each verdict carries its reason. Read the three kinds of 'no' carefully, because they mean different things: *Not eligible* means this data cannot support it, *Not applicable* means the question does not arise for this kind of file, and *Module not built* means the analysis does not exist in this deployment at all. A platform that blurred those together would be implying capabilities it does not have.",
      minutes: 10,
    },

    {
      title: "Read the community, then open up a phylum",
      goal: "Turn a chart into a defensible sentence about the sample.",
      actions: [
        "Press **Open the community profile** — or pick **Community profile** from the sidebar under **RESULTS**.",
        "Look at the phylum pie and the abundant-species bar graph, then read the **Unclassified** figure in the tiles above them.",
        "Click the **Euryarchaeota** slice — or its chip beneath the chart — to open the species-level graph.",
        "Read the confidence and evidence chips beside each species in the drill-down.",
      ],
      expect:
        "Euryarchaeota is about 37% of the sample, Firmicutes 27%, Chloroflexi 15%. Drilling into Euryarchaeota gives three species: *Methanothrix concilii* at 22%, *Methanosarcina barkeri* at 8% and *Methanobacterium formicicum* at 7% — which sum to the 37% on the pie.",
      why:
        "Thirty-seven percent archaea is the headline: archaea in a digester are the methanogens, so this community is genuinely making methane rather than merely rotting. Two cautions travel with every number here. First, these are proportions of the **classified** fraction, not cell counts — two samples with identical charts can hold vastly different amounts of biomass, and nothing in a proportion can tell you which. Second, the grey Unclassified slice is charted rather than hidden, because a profile that quietly drops what it could not identify looks far more complete than it is.",
      minutes: 12,
    },

    {
      title: "Ask what the community could do — and notice what that does not mean",
      goal: "Read functional results while keeping hold of how weak the evidence behind them is.",
      actions: [
        "Open **Functional potential** under **RESULTS**. Read the red banner at the top before anything else.",
        "Look at the pathway completeness bars, and at which mandatory steps are ticked.",
        "Open **Traits & guilds** and read the four anaerobic-digestion guilds in process order.",
      ],
      expect:
        "Methanogenesis shows 100% of its mandatory steps supported, as do carbohydrate degradation to VFA and syntrophic VFA oxidation. On Traits & guilds, hydrolysis and all three methanogenesis guilds are **PRESENT**; acidogenesis, acetogenesis and syntrophic oxidation are **PARTIAL**. Every block is labelled *Taxonomically inferred*.",
      why:
        "The banner is the most important thing on the screen. No sequence in your file was searched for any enzyme. What happened is that organisms were identified, and a curated reference records what organisms of that kind are documented to carry — so this is a lookup, one inference removed from a taxonomic call that is itself uncertain. That is why a guild is only ever called PRESENT when every mandatory marker has support, and why nothing here can tell you whether any of it is switched on. Metagenomics measures genetic potential. Activity needs RNA or protein, and neither is in this file.",
      minutes: 10,
    },

    {
      title: "Look at the community, and check what each picture is claiming",
      goal: "Use the visual material without mistaking a teaching diagram for a measurement.",
      actions: [
        "Open **Visualiser** under **RESULTS**.",
        "Find the source label on every panel: *Curated example*, *Derived from project data*, *Live project data* or *Demo only*.",
        "Open the organism explorer and look at a methanogen you saw in the drill-down.",
      ],
      expect:
        "The cell diagrams and the four-stage schematic are labelled **Curated example** — they are identical whatever you upload. The domain composition strip is labelled **Derived from project data** and changes with your sample.",
      why:
        "This screen mixes two very different things on purpose, and labels them, because that is a skill worth practising. A schematic of a methanogen teaches you what it looks like; it is not evidence about your sample. The composition strip is evidence about your sample. Being able to tell at a glance which is which — on any figure, in any paper — is most of what scientific reading is.",
      minutes: 6,
    },

    {
      title: "Run the digester, then break it on purpose",
      goal: "Connect the community you just profiled to the process it drives, and see the failure that ruins real plants.",
      actions: [
        "Open **Bioreactor** under **RESULTS**. It opens on the **Educational Simulator**.",
        "Leave the defaults — 37 °C, pH 7.0, mixed sludge, HRT 20 days — and press **Run educational simulator**. Write the yield down.",
        "Change pH to **5.5**, run again, and compare.",
        "Put pH back to 7.0, set temperature to **25 °C**, and run. Then try **55 °C**.",
        "Return to 37 °C and pH 7, switch the substrate to **cellulose**, run at HRT 20, then at HRT 60.",
      ],
      expect:
        "Baseline is about **0.535 m³/kg VS at 55% methane**, stability LOW. At pH 5.5 it collapses to about **0.056** — roughly a tenth — the methane share falls to 38.5%, and stability reads HIGH. At 25 °C you get about 0.251; at 55 °C about 0.533, nearly as good as 37 °C. Cellulose gives about 0.658 at HRT 20 and 0.739 at HRT 60. Every run carries the label *Educational simulation - not a plant prediction*.",
      why:
        "Each of those is a mechanism worth holding onto. The pH collapse is how digesters actually die: methanogens are the slowest-growing and fussiest organisms in the tank and stall outside roughly pH 6.8–7.2, so when acid formers outrun them the acids accumulate, consume the alkalinity buffering the tank, and drive the pH down further — a runaway that is well advanced by the time gas output visibly drops. Notice the methane share falls too; a struggling reactor vents proportionally more CO₂. The temperature result surprises people: 37 °C and 55 °C both work well while 45 °C between them is worse, because mesophiles and thermophiles are different communities with different optima and the gap belongs to neither. And retention time matters for cellulose but barely for sugars, because cellulose must be hydrolysed before anything can ferment it and that step is the slow one — the feedstock fixes the ceiling, temperature and pH set the rate of approach to it.",
      minutes: 14,
    },

    {
      title: "Finish Basic Mode and unlock Moderate",
      goal: "Close the loop, and see how access to the next level is earned.",
      actions: [
        "From the Bioreactor result, press **Go to the Assessment**.",
        "Work through it — each question is tied to one competency, so the result tells you where you are weak rather than giving one number.",
        "Submit, then press **Unlock Moderate Mode**.",
        "Optional, and the most instructive comparison in the lab: open **Objective & input data**, load the curated **Digester under acid stress** dataset, re-run, and compare its community with the healthy sludge you started from.",
      ],
      expect:
        "Completing the assessment exposes **Unlock Moderate Mode**; pressing it unlocks Moderate, and it stays unlocked when you sign in again. If you run the soured dataset, *Methanothrix* has fallen from 22% to 3% while *Methanosarcina* has risen from 8% to 11%, and total archaea have dropped from 37% to 14%.",
      why:
        "That shift is the microbial signature of overload, and it is visible before the gas output tells you anything. *Methanothrix* is an acetate specialist with a high affinity for it, so it dominates a stable digester running at low acetate. *Methanosarcina* is the generalist — slower at low acetate, but far more tolerant when acetate accumulates. So the ratio between those two genera reads as an early warning: when the specialist gives way to the generalist, acetate is building up and the tank is heading for trouble. Reading that from a community profile, days ahead of the gas meter, is the whole reason anyone sequences a digester.",
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

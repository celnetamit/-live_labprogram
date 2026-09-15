import type { LabGuide } from "./types";

/**
 * OmicsLab Pro — https://omicslab.live-labs.org/
 *
 * The Live Lab for the eight-week single-cell and spatial transcriptomics
 * programme, and the only lab in the catalogue with a server of its own: runs
 * execute on a worker pool and the results belong to the learner's account, so
 * work survives closing the tab and moving machines.
 *
 * Navigation is a grouped top bar — Program, Analysis, Record, Governance —
 * plus Access. The tutorial follows that order, because the pipeline refuses to
 * start on a dataset the learner has not looked at and the capstone refuses to
 * be submitted without runs behind it.
 */
const guide: LabGuide = {
  slug: "omicslab",

  summary: {
    tagline:
      "Analyse real single-cell and spatial transcriptomics data the way a lab does: a versioned pipeline, your own interpretation, and a report that shows its working.",
    what: "Every cell in your body carries the same genome and uses a different part of it. Single-cell RNA sequencing measures which genes each individual cell is using, and spatial transcriptomics does it without losing track of where the cell sat in the tissue. This lab is the working bench for that data: you pick a dataset, run quality control, clustering, annotation and differential expression through a pipeline whose method versions are locked, write down what you think it means, and produce a report that carries the parameters and the caveats alongside the figures.",
    why: "This is how tumours, immune responses and developing tissue are studied now — and it is also where the analysis mistakes are. A cluster can be a cell type or a batch effect; a striking marker gene can be an artefact of the filter you chose three steps earlier. The skill the field is short of is not running the tools, which is a few lines of code, but knowing which result to trust and being able to show why. So the pipeline here records the parameters of every step, the interpretation is yours to write, and nothing in the report asserts a result the run did not produce.",
    whoFor: "Life-science students, bioinformatics beginners and wet-lab researchers moving to computational work. No programming is required — the pipeline runs from the interface — but you should be comfortable with genes, cell types and the idea of an experimental control. Biology graduates and medical researchers are the intended audience.",
    outcomes: [
      "Judge whether a single-cell dataset passed quality control, and say what the thresholds excluded",
      "Cluster and annotate cells, and distinguish a real population from a batch effect",
      "Read a differential expression result with its multiple-testing correction rather than its top gene list",
      "Design a comparison that can actually answer a question, including its controls and replicates",
      "Defend an interpretation in a capstone that links every claim to the run that supports it",
    ],
  },

  /*
   * Recorded from the lab itself with scripts/record-demo.mjs, against a
   * database holding two genuine Core runs — an original and the alternate its
   * own what-if produced. The dataset on screen is the labelled synthetic
   * fixture, because the teaching datasets open only once an operator has
   * ingested them; the walkthrough says so rather than implying otherwise.
   */
  video: {
    url: "/demos/omicslab.mp4",
    poster: "/demos/omicslab.jpg",
    durationSec: 173,
    chapters: [
      { at: 0, label: "OmicsLab Pro — the Live Lab for the eight-week single-cell and spatial programme" },
      { at: 6, label: "Lab Home: your week, and which analysis tracks your access opens" },
      { at: 15, label: "Step 1 — read the method before you run it" },
      { at: 21, label: "Clusters are a model output, not a discovery — the reference says so plainly" },
      { at: 28, label: "Step 2 — the Pre-Lab Assessment finds the gaps while they are cheap to fix" },
      { at: 37, label: "Step 3 — plan the comparison before a run answers a different question" },
      { at: 50, label: "Step 4 — every dataset names its source, accession, licence and limits" },
      { at: 57, label: "The teaching datasets say so until their files are ingested and validated" },
      { at: 64, label: "The inspector lists what this dataset supports — and what it does not" },
      { at: 74, label: "Step 5 — the run queues on the server, so you can close the tab" },
      { at: 82, label: "An earlier run of the same pipeline has finished" },
      { at: 92, label: "Step 6 — ten steps, each with its figure and the parameters that produced it" },
      { at: 100, label: "Quality control: what was excluded, and on which thresholds" },
      { at: 109, label: "Clustering at the resolution this run recorded" },
      { at: 116, label: "Marker genes — the evidence behind any label you give a cluster" },
      { at: 123, label: "Step 7 — the Copilot speaks only about numbers this run produced" },
      { at: 130, label: "And you write the interpretation; it is saved against the run" },
      { at: 142, label: "The same data at two clustering resolutions — and which conclusions moved" },
      { at: 151, label: "Step 8 — the capstone will not submit without the runs it rests on" },
      { at: 160, label: "Export a report that carries the parameters and the caveats with the figures" },
      { at: 168, label: "OmicsLab Pro — a NanoSchool Live Lab" },
    ],
  },

  prerequisites: [
    "Undergraduate biology: genes, cell types, tissue, and what a control is",
    "A desktop browser — the workspace is a multi-panel layout and the spatial views need room",
    "No installation and no programming: the pipeline runs on the lab's own server",
    "About 90 minutes for the first full pass; a Core run takes several minutes of that on its own",
  ],

  steps: [
    {
      title: "Start at Lab Home and find your week",
      goal: "See the shape of the programme before opening any data.",
      actions: [
        "Open the lab from your NanoSchool dashboard — that launch is what signs you in; there is no separate password.",
        "Read **Programme progress** to see which week you are in.",
        "Read **Analysis tracks open to you**: Foundation, Core and Advanced are different tracks, not difficulty settings.",
      ],
      expect:
        "Lab Home naming your week, and a tracks panel that says plainly which tracks your access includes and which it does not.",
      why: "The tracks correspond to real method families — bulk-style analysis, single-cell, and spatial. A locked track is a real boundary, not a teaser: the server checks it again on every request.",
      minutes: 5,
    },
    {
      title: "Read the Knowledge Bank entry for the method you are about to run",
      goal: "Know what the step is for before you see its output.",
      actions: [
        "Open **Program → Knowledge Bank**.",
        "Find quality control and clustering, and read both.",
        "Use the glossary for any term you would not be able to define out loud.",
      ],
      expect: "Short reference entries with the vocabulary used by the workspace panels.",
      why: "The workspace labels its panels with the real method names. Reading them here first means the run is teaching you results rather than vocabulary.",
      minutes: 8,
    },
    {
      title: "Take the Pre-Lab Assessment",
      goal: "Find the gaps while they are cheap to fix.",
      actions: [
        "Open **Program → Pre-Lab Assessment** and answer the questions.",
        "Press **Submit answers** and read the explanation on anything you got wrong.",
      ],
      expect: "A score with an explanation per question, not just a mark.",
      why: "Almost every bad single-cell conclusion traces back to one misunderstanding upstream — usually about what filtering removed. This is the cheapest place to catch yours.",
      minutes: 10,
    },
    {
      title: "Plan the comparison in the Experimental Design Studio",
      goal: "Decide what question the run is answering, before it answers something else.",
      actions: [
        "Open **Program → Experimental Design Studio**.",
        "State the comparison you want: which condition against which control, and how many replicates.",
        "Press **Save the plan** so the capstone can refer to it later.",
      ],
      expect: "A saved plan, with the studio flagging a design that cannot support the comparison you asked for.",
      why: "A single-cell experiment with one sample per condition cannot separate biological difference from donor difference, no matter how many cells it contains. The studio says so now rather than after the run.",
      minutes: 12,
    },
    {
      title: "Choose a dataset, and read what it cannot tell you",
      goal: "Treat provenance as part of the analysis.",
      actions: [
        "Open **Analysis → Dataset Selector**.",
        "Pick a dataset and read its source, accession, citation and licence.",
        "Read the **limitations** listed on the card — they are specific to that dataset.",
        "Press **Inspect and analyse**.",
      ],
      expect:
        "A dataset inspector listing the analyses this dataset supports and, separately, the ones it does not, each with the reason.",
      why: "Every guided dataset here is real published data with real terms of use, so it names its accession and its licence. The 'not supported' list exists because the commonest way to get a confident wrong answer is to run a method the data cannot support.",
      minutes: 10,
    },
    {
      title: "Run the pipeline and watch the steps, not just the end",
      goal: "See each step's figure next to the parameters that produced it.",
      actions: [
        "Press **Start the guided analysis**. The run queues on the server — you can close the tab.",
        "Open the run from **Analysis → Analysis Workspace** once it is running.",
        "Step through **Pipeline steps** and, at each one, expand the parameters.",
        "At the quality-control step, note how many cells were excluded and on which thresholds.",
      ],
      expect:
        "A run that progresses through named steps, each with its own figure and the exact parameter values used, and a pipeline version stamped on the run.",
      why: "The method versions are locked and checked against the installed libraries: a run cannot silently substitute a different implementation, because the version stamped on your report has to be true.",
      minutes: 20,
    },
    {
      title: "Interrogate the result with the Copilot, then change one parameter",
      goal: "Separate what the data shows from what the settings decided.",
      actions: [
        "Open **Copilot and what-if** in the workspace.",
        "Ask what drove the clustering at this resolution.",
        "Use **Run this alternate analysis** to change one threshold — the QC minimum, or the clustering resolution — and start a second run.",
        "Compare the two in **Analysis → Compare Runs**.",
      ],
      expect:
        "Copilot answers that quote numbers from your run, and a second run that differs from the first in a way you can point at.",
      why: "The Copilot is grounded: it can only speak about values this run produced, so it cannot invent a plausible cell type that is not in your data. Doing the what-if is how you find out which conclusions were robust and which were artefacts of a setting.",
      minutes: 15,
    },
    {
      title: "Write the interpretation, then submit the capstone",
      goal: "Make a claim and attach the evidence to it.",
      actions: [
        "In the workspace, write what you think the result means and press **Save my interpretation**.",
        "Open **Record → Capstone Workspace** and write it up; the **runs this rests on** list ties each claim to a run.",
        "Press **Submit the capstone**, then export from **Record → Report and Portfolio**.",
      ],
      expect:
        "A capstone that will not submit without runs behind it, and an exported report carrying the parameters and the caveats alongside the figures.",
      why: "The report is the deliverable, and it is built to be checkable: someone reading it can see which parameters produced each figure and what the dataset could not support. That is the difference between a result and a screenshot.",
      minutes: 20,
    },
  ],

  troubleshooting: [
    {
      problem: "The lab sends me to the NanoSchool login when I open the address directly.",
      fix: "That is the gate working: this lab has no sign-in of its own, so a session only starts from a dashboard launch. Open it from your dashboard rather than a bookmark or a copied URL — launch links are single-use and short-lived.",
    },
    {
      problem: "A dataset says it opens once its files are ingested.",
      fix: "The guided datasets are real published data, downloaded and validated by the lab operator rather than shipped in the image. The card says so rather than showing you a placeholder result. Use the synthetic fixture in the meantime — it is labelled as having no biological meaning.",
    },
    {
      problem: "A run is queued for a long time, or looks stuck.",
      fix: "Runs execute on a shared worker pool, so a Core or Advanced run takes minutes and queues behind others. Leave the page — the run is server-side and the workspace picks it up when you return. A run that genuinely died is closed out and marked failed, never left showing as in progress.",
    },
    {
      problem: "A track or a feature is locked.",
      fix: "Open **Access** to see what your current tier includes and what the next one adds. Basic comes with programme enrolment and is never sold; the paid tiers open upload, the communication explorer, the spatial workflow and the export formats.",
    },
    {
      problem: "The clustering looks nothing like the published figure for this dataset.",
      fix: "Expect that, and treat it as the exercise. Check the QC step first: a different cell filter changes the neighbourhood graph and therefore every cluster downstream. Run the what-if with the published thresholds and compare.",
    },
  ],

  furtherReading: [
    {
      label: "Luecken & Theis — Current best practices in single-cell RNA-seq analysis",
      href: "https://www.embopress.org/doi/full/10.15252/msb.20188746",
    },
    {
      label: "Scanpy documentation — the library behind the Core track",
      href: "https://scanpy.readthedocs.io/",
    },
    {
      label: "Single-cell best practices (Theis lab, online book)",
      href: "https://www.sc-best-practices.org/",
    },
    {
      label: "10x Genomics — what spatial transcriptomics measures",
      href: "https://www.10xgenomics.com/platforms/visium",
    },
  ],
};

export default guide;

import type { LabGuide } from "./types";

/**
 * Spatial Omics AI Virtual LiveLab — https://spatial.live-labs.org/
 *
 * A teaching and research lab for spatial perturbation propagation: pick a
 * spatial transcriptomics section, perturb it — a gene knockout, an
 * overexpression, or a real compound at a real concentration — and the lab
 * simulates how that perturbation spreads through the tissue, then compares
 * candidate rescue interventions against the altered state.
 *
 * Navigation is a fixed twelve-step scientific workflow (Project through
 * Report), because the sequence mirrors the method, not generic software
 * menus — a stage that cannot run yet says why rather than disappearing. The
 * tutorial follows that order. §1.4 of the lab's own methodology handbook is
 * the rule everything else answers to: no LLM-generated numerical biology.
 * Every number comes from a solver, a statistical test, a trained model with
 * a published validation table, or a retrieved measurement with a citation —
 * the AI panel only writes prose about numbers that already exist, and a
 * gate rejects anything it cannot trace back to the evidence it was given.
 *
 * The `showcase` block below gives this lab the editorial page the other
 * showcased labs get. It only takes effect once a cover photograph is
 * registered for `spatial-ai` in `src/content/labs/photos.ts`: the page
 * branches on `showcase && coverPhoto`, so until then it keeps rendering the
 * standard template rather than a hero with a hole where the picture goes.
 *
 * The palette is keyed to a spatial transcriptomics section — a near-black
 * ground with the cyan, magenta, green and amber of the cluster colours. Once
 * the photograph is in place these should be re-checked against it, the way
 * every other lab's were sampled from its own cover.
 */
const guide: LabGuide = {
  slug: "spatial-ai",


  showcase: {
    overline: "Spatial perturbation & rescue",
    title: [{ text: "Spatial" }, { text: " Omics", accent: "primary" }],
    headline: "Perturb a tissue section and watch the effect spread, not just land.",
    intro:
      "Knock out a gene or dose a real compound, see how the change propagates through the section's own cell neighbourhood, then compare rescue candidates on evidence rather than on a single invented score.",
    about: [
      "A tumour is not a dish of identical cells; it is tissue, and what happens to one cell depends on what is next to it. This lab makes that spatial structure the subject rather than averaging it away.",
      "A mechanistic tissue solver and a trained graph neural network show how a perturbation spreads outward from the cells it touched directly. Every eligible rescue therapy is then simulated separately against the same altered tissue before any of them are compared.",
    ],
    tags: ["Spatial transcriptomics", "Perturbation modelling", "Model validation", "Therapeutic rescue"],
    walkthroughTitle: "From a perturbed section to a comparable rescue",
    journey: "Spatial Omics",
    /* No demo video for this lab yet (`video.url` is null), so the hero shows
       the two figures it can compute rather than an empty walkthrough slot. */
    stats: [
      { kind: "steps", label: "Guided steps" },
      { kind: "handsOn", label: "Hands-on time" },
    ],
    rail: { owned: "launch", accent: "secondary" },
    card: {
      badge: "Interactive lab",
      icon: "simulation",
      description:
        "Perturb a simulated tumour section, watch the effect propagate through the tissue, and compare rescue candidates on traceable numbers.",
    },
    /* Sampled from the cover: #0398ca cyan, #0faaa5 teal, #880577 magenta and
       #f1d804 yellow are the four most-present cluster colours in the section.
       `onDark` is each lifted to read on the near-black hero; `ink` is each
       darkened to clear 4.5:1 as text on white. */
    palette: {
      primary: { onDark: "#3fb6e0", ink: "#0a6a8c" },
      secondary: { onDark: "#d861c2", ink: "#8a1a79" },
      action: { onDark: "#dcd9e4", ink: "#5b5566" },
      quiet: { onDark: "#35c4bd", ink: "#0d6f6a" },
      cta: { onDark: "#3fb6e0", ink: "#0a6a8c", text: "#04101a" },
      level: "#f1d804",
      features: [
        { onDark: "#3fb6e0", ink: "#0a6a8c" },
        { onDark: "#d861c2", ink: "#8a1a79" },
        { onDark: "#35c4bd", ink: "#0d6f6a" },
        { onDark: "#f1d804", ink: "#6f5e03" },
      ],
    },
    /* The picture's own ground is #0a0112 — a very dark violet-black, read off
       all four corners — so the page's neutrals are tinted toward it. */
    ground: {
      page: "#0a0710",
      sidebar: "#07040c",
      surface: ["#171222", "#0c0814"],
      hero: "#0a0112",
      scrim: "#050009",
      scrimStops: [97, 90, 46, 16, 84],
      text: "#f6f4f8",
      muted: "#aaa3b4",
      copy: "#b0a9ba",
      soft: "#817a8c",
    },
    /*
      Four claims, each one true of this lab and checkable in the guide below:
      the propagation model, the simulate-before-ranking rule, the refusal to
      print a composite score, and §1.4's no-LLM-numbers gate.
    */
    features: [
      {
        icon: "simulation",
        title: "Effects that propagate",
        body: "A tissue solver and a trained graph network show how a change spreads through the section's neighbourhood, not only the cells it touched.",
      },
      {
        icon: "analysis",
        title: "Simulated before compared",
        body: "Every eligible rescue candidate is run separately against the same altered tissue before any of them are placed against each other.",
      },
      {
        icon: "graph",
        title: "No invented score",
        body: "Candidates meet on an endpoint table and a Pareto front; no single ranking is printed without frozen, reviewer-approved weights.",
      },
      {
        icon: "insight",
        title: "Numbers you can trace",
        body: "Every figure comes from a solver, a statistical test or a validated model. The AI panel writes prose about numbers that already exist.",
      },
    ],
  },

  summary: {
    tagline:
      "Perturb a simulated tumour section, watch the effect propagate through the tissue, and compare rescue candidates — with every number traced back to the method that produced it.",
    what: "A tumour is not a dish of identical cells; it is tissue, and what happens to one cell depends on what is next to it. This lab makes that spatial structure the subject: you open a spatial transcriptomics section, knock out or overexpress a gene — or dose it with a real compound at a real concentration — and a mechanistic tissue solver and a trained graph neural network show how that change spreads outward through the section's own cell neighbourhood, not just in the cells it touched directly. From there you retrieve candidate rescue therapies, simulate every eligible one separately against the same altered tissue, and compare them on an endpoint table and a Pareto front rather than a single invented score.",
    why: [
      "Most of what goes wrong in a tumour's response to treatment is not what happens inside one cell type — it is what spreads between them.",
      "A drug that silences its target directly can still fail the tissue, because the signal it blocks was feeding three other pathways in the cells next door.",
      "Modelling that honestly means refusing a few tempting shortcuts: no ranking a therapy before it has actually been simulated, no composite score invented to make a chart simpler, no AI-generated number standing in for a measurement nobody made.",
      "So this lab enforces those refusals in the software rather than describing them in a caveat — a rejected AI draft shows the numbers with no prose rather than a softened re-try, and a comparison that cannot support a ranking says so instead of printing one anyway.",
    ],
    whoFor: "Life-science students, computational biology beginners and wet-lab researchers who want to reason about spatial effects rather than single-cell averages. No programming is required — the whole workflow runs from the interface — but you should already be comfortable with genes, cell types, and what an untreated control is for. Biology and bioinformatics students, and researchers moving into spatial transcriptomics, are the intended audience.",
    outcomes: [
      "Read a spatial QC report and say which checks are structural, which are data-driven, and which are engineering guardrails rather than biology",
      "Define a perturbation — genetic or a real compound at a real concentration — and read the evidence behind it, including what was retrieved versus curated",
      "Distinguish a direct effect from a propagated one, and recognise when a result sits outside a model's validated domain",
      "Compare rescue candidates on an endpoint table and a Pareto front, and explain why no single ranking is shown without frozen, reviewer-approved weights",
      "Judge a trained model by its baseline table — including a graph-shuffled control — rather than by a single headline accuracy figure",
    ],
  },

  video: {
    url: null,
    chapters: [
      { at: 0, label: "Spatial Omics Virtual LiveLab — spatial perturbation propagation and therapeutic rescue" },
      { at: 8, label: "Step 1 — the research-use boundary, and starting a new project" },
      { at: 20, label: "Step 2 — Data & QC: structural checks, data-driven checks, and prediction eligibility" },
      { at: 34, label: "Step 3 — Baseline tissue: the spatial map, markers, pathway activity, the spatial graph" },
      { at: 48, label: "Step 4 — Experiment: defining a genetic knockout and a real-compound perturbation" },
      { at: 62, label: "Step 5 — Propagation and Predicted tissue: direct response versus the spread, and the uncertainty panel" },
      { at: 78, label: "Step 6 — Rescue candidates: every eligible candidate simulated separately first" },
      { at: 90, label: "Step 7 — Compare candidates: the endpoint table and the Pareto front, and why there is no single score" },
      { at: 102, label: "Step 8 — Interpretation, Validate and Report: AI prose grounded in the run, and the assembled report" },
      { at: 112, label: "Methods & model card, and the parameter registry" },
      { at: 118, label: "Spatial Omics Virtual LiveLab — a Live Labs laboratory" },
    ],
  },

  prerequisites: [
    "Undergraduate biology: genes, cell types, tissue, and what an untreated control is",
    "A desktop browser — the workspace is a multi-panel layout and the tissue map needs room",
    "No installation and no programming: the whole workflow runs from the interface",
    "About 90 minutes for a first full pass through all twelve workflow steps",
  ],

  steps: [
    {
      title: "Read the research-use boundary, then start a project",
      goal: "Know what the lab will and will not claim before running anything.",
      actions: [
        "Open the lab from your Live Labs dashboard — that launch is what signs you in; there is no separate password.",
        "Read the **Research-use boundary** panel on the Project screen in full.",
        "Give the project a title and a study question, choose the bundled dataset, and pick a mode — Beginner, Intermediate or Advanced.",
        "Press **Create project**.",
      ],
      expect:
        "A boundary statement that says plainly this is not a clinical treatment recommendation system, and a new project showing the selected dataset's cell and feature counts.",
      why: "The three modes differ only in which controls, diagnostics and exports are available — for the same dataset, parameters, model version and seed, all three return the same result. Reading the boundary first is what makes every later number legible as a measurement rather than a claim.",
      minutes: 8,
    },
    {
      title: "Run Data & QC, and read what each check actually is",
      goal: "See the difference between a structural check, a data-driven threshold, and an engineering guardrail.",
      actions: [
        "Open **Data & QC** and press **Run analysis**.",
        "Read the QC dashboard's **verdict** and, separately, the **prediction eligible** readout.",
        "Expand a few checks and read their **kind** label — structural, data-driven, or engineering guardrail.",
      ],
      expect:
        "A table of checks each carrying a pass/fail and a stated reason, and a QC verdict that is a different thing from whether prediction is allowed to run at all.",
      why: "There is no universal hard-coded biological threshold across tissues here — a data-driven check is computed from this dataset's own distribution, not a constant borrowed from a different assay. The analysis also produces the baseline annotation and spatial graph every later screen depends on.",
      minutes: 12,
    },
    {
      title: "Explore the Baseline tissue",
      goal: "Read the unperturbed section before changing anything in it.",
      actions: [
        "Open **Baseline tissue** and pan and zoom the tissue map.",
        "Switch the **layer** selector between cell type, a marker gene and a pathway activity score.",
        "Open **Reference comparison**, if a comparable section is available, and read the comparability note.",
      ],
      expect:
        "A spatial map coloured by whichever layer is selected, with a marker table and a pathway-activity chart computed from this section's own cell groups.",
      why: "A pathway score here is the between-group share of variance in a z-scored quantity, not the section mean — the mean of a z-scored quantity is zero by construction, so reporting it would just be reporting zero every time. Reading the baseline carefully is what makes a later propagation map legible as a *change*.",
      minutes: 12,
    },
    {
      title: "Define a perturbation in the Experiment screen",
      goal: "State what is being changed, and on what cells, before simulating anything.",
      actions: [
        "Open **Experiment** and choose the **genetic** branch: a target gene, an operator (knockout or overexpression) and a cell-type or region selection.",
        "Switch to the **drug** branch and choose a compound; read its evidence record, including whether its potency value was retrieved or curated.",
        "Press **Save perturbation**.",
      ],
      expect:
        "A saved perturbation with its eligibility decision, and — on the drug branch — a compound whose concentration defaults to a real retrieved potency measurement rather than an assumed one.",
      why: "A handful of compounds in the catalogue have no usable potency measurement and are excluded from simulation rather than given an invented concentration; the evidence record says which fields were retrieved from the source database and which were curated by hand, because those are different kinds of claim.",
      minutes: 15,
    },
    {
      title: "Run the prediction, and read propagation before the predicted tissue",
      goal: "See the direct effect and the spread as two separate things before reading the combined result.",
      actions: [
        "Press **Run prediction** from the Experiment screen.",
        "Open **Propagation** and step through the stages, watching how far the effect reaches from the perturbed cells.",
        "Open **Predicted tissue** and read the **confidence** label and the **uncertainty** panel, including whether the run sits inside the model's validated domain.",
      ],
      expect:
        "A propagation view that visibly decays with distance from the perturbed cells, and a predicted-tissue screen that states its confidence rather than presenting every run as equally trustworthy.",
      why: "Direct response and spatial propagation are computed and stored as separate artefacts — a merged number could not answer whether an effect spread or only acted where it landed. A run outside the model's training domain is marked out-of-domain rather than shown with an unqualified number.",
      minutes: 15,
    },
    {
      title: "Simulate rescue candidates — every eligible one, separately",
      goal: "See the §2 workflow rule in practice: nothing is ranked before it has been simulated.",
      actions: [
        "Open **Rescue candidates** and press **Simulate candidates**.",
        "Read the **eligible** and **excluded** lists, and the stated reason for each exclusion.",
        "Watch the per-candidate simulations complete one at a time against the same altered tissue state.",
      ],
      expect:
        "A list of candidates, each simulated separately against the identical altered-tissue starting point, with excluded candidates naming a specific reason rather than being silently dropped.",
      why: "Ranking candidates before simulating them would rank a heuristic, not a result. Simulating every eligible one against the same state is slower, and that is deliberate — it is the only way the comparison that follows is actually comparing like with like.",
      minutes: 15,
    },
    {
      title: "Compare candidates, and read why there may be no single ranking",
      goal: "Use the endpoint table and the Pareto front the way the lab intends them to be read.",
      actions: [
        "Open **Compare candidates** and sort the endpoint table by a column that matters to your question.",
        "Find the **Pareto front** and read which candidates are on it.",
        "If a **no clear winner** message appears, read the stated reason — it may name a component that is not actually separating the candidates.",
      ],
      expect:
        "A sortable table of outcomes, a Pareto front of candidates nothing else beats on every axis at once, and — without a frozen, reviewer-approved weight set — no single composite score pretending to summarise them.",
      why: "A composite score here is only produced with weights that are frozen, justified, benchmarked and reviewer-approved; otherwise the comparison stays as components and a Pareto front. The lab also detects when apparent separation between candidates is an artefact of how a component happens to be scaled, and says so rather than letting a scaling choice masquerade as a finding.",
      minutes: 12,
    },
    {
      title: "Read the Interpretation, Validate and Report screens, then check the model card",
      goal: "See the §1.4 rule — no LLM-generated numerical biology — enforced rather than merely stated.",
      actions: [
        "Open **Interpretation** and request a summary; read its citations back against the evidence panel.",
        "Open **Validate** to see the suggested wet-lab or imaging experiment the predicted changes imply.",
        "Open **Report** to see the full document assembled across every run in the project.",
        "Open **Methods & model card** in the reference section and find the baseline comparison table, including the graph-shuffled control.",
      ],
      expect:
        "AI prose that cites numbers already on screen and nothing it did not receive as evidence, a report whose sections are present or explicitly absent with a reason, and a model card reporting the trained model against seven baselines rather than a single accuracy figure.",
      why: "The AI layer's one job is explaining structured results; a gate parses its draft and rejects an unattributable number, an uncited claim, a certainty claim or clinical-advice language outright, with no softened retry. The baseline table exists so a reader can judge whether the model is using the tissue's spatial structure at all, not just whether it scores well — a graph-shuffled control that scored the same as the real model would mean it was not.",
      minutes: 12,
    },
  ],

  troubleshooting: [
    {
      problem: "The lab sends me to the Live Labs login when I open the address directly.",
      fix: "That is the gate working: this lab has no sign-in of its own, so a session only starts from a dashboard launch. Open it from your dashboard rather than a bookmark or a copied URL — launch links are single-use and short-lived.",
    },
    {
      problem: "Prediction, uncertainty or rescue say they are unavailable.",
      fix: "Those stages need a trained propagation model pack installed on the server. Baseline analysis, QC and the direct (non-spatial) response still work without one, and the screen states the reason rather than substituting a weaker result.",
    },
    {
      problem: "A compound I expected to simulate is marked excluded.",
      fix: "A small number of compounds in the evidence catalogue have no usable potency measurement retrieved for them. Rather than assume a concentration, the lab excludes them and names the reason on the candidate card — check the Experiment screen's evidence panel for that compound.",
    },
    {
      problem: "My run is marked out-of-domain, or its confidence reads 'not interpretable'.",
      fix: "That is the uncertainty check doing its job: the model's training distribution does not cover this configuration closely enough to trust its output numerically. The result still shows what was computed, labelled honestly, rather than hiding the run or pretending the confidence is higher than it is.",
    },
    {
      problem: "Compare candidates shows no ranking even though I expected one.",
      fix: "A composite score only appears with a frozen, justified, benchmarked and reviewer-approved weight set. Without one, read the endpoint table and the Pareto front directly — that is the comparison the evidence actually supports, and it is more informative than a single invented number once you know how to read it.",
    },
  ],

  furtherReading: [
    {
      label: "Rao, Barkley, França & Yanai — Exploring tissue architecture using spatial transcriptomics (Nature, 2021)",
      href: "https://www.nature.com/articles/s41586-021-03634-9",
    },
    {
      label: "Cang et al. — Screening cell–cell communication in spatial transcriptomics via collective optimal transport (Nature Methods, 2023)",
      href: "https://www.nature.com/articles/s41592-022-01728-4",
    },
    {
      label: "Zhou et al. — Graph neural networks: a review of methods and applications (AI Open, 2020)",
      href: "https://doi.org/10.1016/j.aiopen.2021.01.001",
    },
    {
      label: "10x Genomics — what spatial transcriptomics measures (Xenium In Situ platform overview)",
      href: "https://www.10xgenomics.com/platforms/xenium",
    },
  ],
};

export default guide;

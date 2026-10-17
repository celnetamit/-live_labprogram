import type { LabGuide } from "./types";

/**
 * RepurposeAI: Drug Discovery Lab, https://drug.live-labs.org/
 *
 * One workflow, the Research Project, whose Analysis Pipeline has the same
 * eight steps in every mode: Start the Lab, Project, Input Data, Validation &
 * Data Retrieval, Knowledge Graph, Analysis, Prediction & Ranking, Results &
 * Report. The sidebar holds Research Project, Knowledge Bank and Assessment,
 * plus the AI Chat. Beginner works through one of nine checked example cases
 * in the browser; Intermediate and Advanced create a project on the analysis
 * server. (Review of 16 October 2026 removed the Dashboard, the Learning Lab
 * and the Graph Explorer.)
 */
const guide: LabGuide = {
  slug: "drugdiscovery-ai",

  summary: {
    tagline: "Explore, Predict, and Prioritize New Therapeutic Potentials for Existing Drugs",
    what: "Repurpose is an experimental approach to identifying new therapeutic applications for existing drugs by investigating their molecular targets, biological pathways, and disease associations. In this interactive Live Lab, explore a biomedical knowledge graph to integrate drugs, genes, diseases, and adverse drug effects.",
    /*
     * The brief gives this as two paragraphs; Amit asked for bullets on
     * 3 October, which is also how the other twelve labs carry the section.
     * Split at sentence boundaries only: every word is still the brief's.
     */
    why: [
      "Drug repurposing looks at whether an existing medicine may also be useful for another disease.",
      "An existing drug may already have safety, pharmacology, and clinical information available, which can support research into a new use.",
      "However, its safety and effectiveness for the new disease still need to be tested.",
      "Biomedical information is spread across research papers and databases.",
      "Knowledge graphs bring information about drugs, genes, diseases, and other biological entities together in a structured way.",
      "Graph-based methods can then help researchers study these relationships and identify possible connections for further investigation.",
    ],
    whoFor: "This lab is suitable for **students and researchers in drug discovery, pharmacology, bioinformatics, computational biology, and related life-science fields** who want to understand how graph-based methods can be used to study drug-target-disease relationships.\n\nBasic knowledge of **drug targets, genes, and disease biology** is helpful. No previous experience with knowledge graphs, graph embeddings, or TransE is required.",
    outcomes: [
      "Explain how drugs, genes, diseases, and side effects can be represented in a knowledge graph.",
      "Explain how graph embeddings represent these relationships in numerical form.",
      "Use link prediction and interpret the model score correctly.",
      "Develop a drug-repurposing hypothesis from a predicted drug-disease link.",
      "Identify the evidence needed to test the hypothesis.",
      "Explain why a predicted link needs further research and validation.",
    ],
  },

  /*
   * The designer's page (drugdiscovery.html / drugdiscovery.css), copy and
   * colours as supplied. Checked against the lab: the Knowledge Graph step
   * draws Drug, Gene, Pathway, Disease and Side Effect nodes, so "side
   * effects" and "adverse effects" hold for the graph the learner works in;
   * Prediction & Ranking ranks candidate drug-disease links, and Advanced
   * mode compares TransE with other models and simple baselines on the
   * analysis server.
   *
   * Review of 15 October 2026: headline, intro and About This Lab replaced
   * with the reviewer's wording, headings in Title Case, dashes removed and
   * "associated_with" written as "associated with". The lab app carries the
   * same changes in `drugdiscovery-ai/data/labProfile.ts`.
   *
   * On 3 October 2026 every section carried the "Live labs - Contents" brief
   * for RepurposeAI verbatim: tagline, the two-sentence intro, the four
   * "About this lab" paragraphs, the feature cards, "What's Included in the
   * Lab", all eight tutorial steps with the brief's bold, the outcomes, and
   * "Why It Matters" and "Who It's For" as the brief's two paragraphs each.
   * An earlier pass had merged, reworded and bulleted some of it; Amit asked
   * for the document as written.
   *
   * The lab app carries the same text in `drugdiscovery-ai/data/labProfile.ts`
   * (`LAB_PROFILE` and `TUTORIAL_STEPS`), and every control the steps name
   * exists there under that name: the three sidebar sections, the Analysis
   * Pipeline and its steps, Run New Experiment, My Experiments, Validate and
   * run analysis, Results & Report, the AI Chat. Change the
   * two together.
   *
   * Review of 16 October 2026: the lab became one Research Project workflow,
   * so the tutorial (nine steps, word for word from `TUTORIAL_STEPS`), "What's
   * Included in the Lab" (from `LAB_PROFILE.included`) and the troubleshooting
   * entries now follow it. The lab's `TUTORIAL_INTRO` has no field here: the
   * tutorial panel's lead line is shared by every lab.
   *
   * Palette from drugdiscovery.css: blue #74a9cf, rose #e6a1ad, coral
   * #ec785f, green #6fa58d. The design is dark only; each `ink` is the same
   * hue darkened to at least 5.3:1 on white for the light theme.
   */
  showcase: {
    overline: "Network pharmacology",
    title: [
      { text: "Repurpose" },
      { text: "AI", accent: "primary" },
      { text: "Drug Discovery Lab", accent: "secondary", subtitle: true },
    ],
    headline: "Explore, Predict, and Prioritize New Therapeutic Potentials for Existing Drugs",
    intro:
      "Explore relationships among drugs, diseases, genes, and adverse effects using a biomedical knowledge graph. Learn how graph embeddings and link prediction can help uncover possible drug-disease connections for further research.",
    about: [
      "**Repurpose** is an experimental approach to identifying new therapeutic applications for existing drugs by investigating their molecular targets, biological pathways, and disease associations.",
      "In this interactive Live Lab, explore a biomedical knowledge graph to integrate drugs, genes, diseases, and adverse drug effects. Apply **knowledge graph embeddings using the TransE model** to represent biological relationships computationally and predict potential drug-disease associations through link prediction.",
      "In this interactive Virtual Live Lab, investigate the complex relationships among drugs, genes, diseases, and adverse drug effects using a biomedical knowledge graph. Apply **TransE based knowledge graph** embeddings and link prediction techniques to analyze biological associations, identify previously unobserved drug disease connections, and explore potential opportunities for drug repurposing research.",
      "Analyze and rank promising drug candidates, examine their supporting biological relationships, and interpret predictions to identify potential therapeutic leads. Use these findings to formulate **scientifically grounded, testable hypothesis for future drug discovery**.",
    ],
    tags: ["Drug Repurposing", "Knowledge Graphs", "Graph Embeddings", "AI Prediction"],
    walkthroughTitle: "From known medicines to new treatment hypotheses",
    journey: "Repurpose",
    card: {
      badge: "Interactive lab",
      icon: "graph",
      description:
        "Build a drug-gene-disease knowledge graph, learn numerical embeddings, and predict promising links that are not yet recorded.",
    },
    photo: { position: "50% 50%" },
    palette: {
      primary: { onDark: "#74a9cf", ink: "#35709b" },
      secondary: { onDark: "#ec785f", ink: "#c63617" },
      action: { onDark: "#e6a1ad", ink: "#c4344d" },
      quiet: { onDark: "#6fa58d", ink: "#497461" },
      cta: { onDark: "#74a9cf", ink: "#35709b", text: "#071016" },
      level: "#ec785f",
      features: [
        { onDark: "#74a9cf", ink: "#35709b" },
        { onDark: "#e6a1ad", ink: "#c4344d" },
        { onDark: "#ec785f", ink: "#c63617" },
        { onDark: "#6fa58d", ink: "#497461" },
      ],
    },
    ground: {
      page: "#0b1013",
      sidebar: "#0b1012",
      surface: ["#171a21", "#0e1116"],
      hero: "#141a20",
      scrim: "#090d11",
      scrimStops: [97, 92, 60, 24, 76],
      text: "#f5f1eb",
      muted: "#9fa9b0",
      copy: "#adb7bd",
      soft: "#7f8b92",
    },
    features: [
      {
        icon: "graph",
        title: "Knowledge Graph Reasoning",
        body: "Explore how medicines, gene targets, diseases, and side effects are connected in a structured network.",
      },
      {
        icon: "analysis",
        title: "Graph Embeddings",
        body: "Learn how relationships in the graph can be represented as numbers for computational analysis.",
      },
      {
        icon: "simulation",
        title: "Link Prediction",
        body: "Use patterns in the graph to identify and rank possible drug-disease connections for further study.",
      },
      {
        icon: "insight",
        title: "Testable Hypothesis",
        body: "Use the model result and supporting graph information to develop a clear drug-repurposing hypothesis that can be investigated further.",
      },
    ],
  },

  /*
   * Recorded 29 July 2026, before the review of 16 October 2026: the footage
   * still shows the old sections. The chapter labels name what is on screen
   * without naming sections the lab no longer has; the video itself needs
   * re-recording against the Research Project.
   */
  video: {
    url: "/demos/drugdiscovery-ai.mp4",
    poster: "/demos/drugdiscovery-ai.jpg",
    durationSec: 61,
    chapters: [
      { at: 0, label: "Drugs that found their real purpose late" },
      { at: 6, label: "Entering the laboratory" },
      { at: 16, label: "Graphs, embeddings and link prediction" },
      { at: 28, label: "An interactive knowledge graph" },
      { at: 39, label: "Adding a drug and predicting links" },
      { at: 53, label: "Knowledge Bank and assessment" },
    ],
  },

  /*
   * The brief's list here is "What's Included in the Lab", not a readiness
   * checklist: same treatment as MicrobeAI's, and now every lab's section
   * heading, so no `prerequisitesLabel` override is needed.
   */
  prerequisites: [
    "**Guided Workflow:** Follow one research project step by step, from the input data to the report.",
    "**Interactive Knowledge Graph:** Explore links between drugs, genes, diseases, and side effects.",
    "**Graph Embedding Models:** See how graph relationships are represented as numbers, and compare TransE with other models in Advanced mode.",
    "**Link Prediction Experiment:** Rank possible drug-disease links for further study.",
    "**Supporting Graph Paths:** Follow the connections behind a predicted link.",
    "**Testable Hypothesis:** Use the result to develop a clear drug-repurposing research hypothesis.",
  ],

  /*
   * `TUTORIAL_STEPS` in `drugdiscovery-ai/data/labProfile.ts`, word for word:
   * the same nine steps in the same order, each title, goal, action, expected
   * result and "why" as the lab shows them. Only `minutes` is the hub's own.
   */
  steps: [
    {
      title: "Start the Lab",
      goal: "Get familiar with the lab and see how your progress is tracked.",
      actions: [
        "Open the lab and read the aims and objectives on **Start the Lab**.",
        "Find the sections in the sidebar: Research Project, Knowledge Bank, and Assessment.",
        "Look at the Analysis Pipeline above the page: eight numbered steps, each one ticked when it is done.",
      ],
      expect: "The Analysis Pipeline, with Start the Lab as step 1.",
      minutes: 4,
    },
    {
      title: "Create a Project",
      goal: "Set up an experiment you can come back to.",
      actions: [
        "Click **Run New Experiment**.",
        "Give the project a name and create it.",
        "Use **My Experiments** to reopen a saved project later.",
      ],
      expect: "Your project open, with its name shown above the steps.",
      minutes: 3,
    },
    {
      title: "Enter the Input Data",
      goal: "Choose the disease, the drugs, and the genes they act on.",
      actions: [
        "In Beginner mode, choose one of the checked example cases and one or more of its drugs.",
        "In Intermediate and Advanced mode, search for a disease, add your drugs, and retrieve each drug’s gene targets from ChEMBL.",
        "Check the action of each drug on each target, and add extra genes of interest if you have them.",
      ],
      expect: "A disease, at least one drug, and the targets each drug acts on.",
      why: "The results depend on the information and relationships in the graph. Reliable input is important for meaningful results.",
      minutes: 10,
    },
    {
      title: "Validate the Inputs and Retrieve the Data",
      goal: "Check every entry against open databases and collect the evidence.",
      actions: [
        "Click **Validate and run analysis** (in Beginner mode the case is already checked).",
        "Read the validation report and correct anything it flags.",
        "Watch each analysis step finish. The data comes from ChEMBL, Open Targets, STRING, Reactome, and PubMed.",
      ],
      expect: "Validated inputs and a finished analysis.",
      why: "Each entry is matched to a standard identifier, so the graph joins the right drug, gene, and disease records.",
      minutes: 10,
    },
    {
      title: "Explore the Knowledge Graph",
      goal: "See how drugs, genes, diseases, and side effects are connected in a knowledge graph.",
      actions: [
        "Identify the node types: Drug, Gene, Pathway, Disease, and Side Effect.",
        "Look at the relationship types: **targets, associated with, and participates in**. The link being predicted is **treats**, from a drug to a disease.",
        "Follow one path: a drug targets a gene, and the gene is associated with a disease.",
        "Download the graph as an image for your notes.",
      ],
      expect: "A drug-gene-disease path and what each relationship means.",
      why: "The relationship type tells you how two nodes are connected and gives the link its meaning.",
      minutes: 12,
    },
    {
      title: "Read the Analysis",
      goal: "See how each drug’s targets relate to the biology of the disease.",
      actions: [
        "Compare the targets of your drugs and the pathways they share with the disease.",
        "Check how close each target sits to the disease genes in the protein network.",
        "Read whether each drug acts on its target in the direction the disease needs.",
      ],
      expect: "The shared targets, pathways, and direction of action for each drug.",
      why: "Not every drug-gene relationship has the same effect, so the direction of action matters as much as the connection.",
      minutes: 12,
    },
    {
      title: "Check the Prediction and Ranking",
      goal: "Learn how the model ranks possible missing links.",
      actions: [
        "Look at the ranked list of drug-disease candidates and the score of each one.",
        "In Advanced mode, compare TransE (**head + relation ≈ tail**) with the other models and the simple baselines.",
        "Check what the model score means and what it does not mean.",
      ],
      expect: "A ranked list of possible drug-disease links with their scores.",
      why: "The score shows how well a link fits the patterns learned from the graph. It does not prove that the biological relationship is real.",
      minutes: 12,
    },
    {
      title: "Form a Hypothesis and Download the Report",
      goal: "Use the prediction to develop a testable research hypothesis.",
      actions: [
        "Open **Results & Report** and read the result, its evidence level, and its limitations.",
        "Follow the related graph path and note the target and disease association.",
        "Read the hypothesis and how it could be tested.",
        "Download the report as a PDF, with the knowledge graph included.",
      ],
      expect: "A predicted drug-disease link, its score, and the related graph connections.",
      why: "A model score is not biological proof. The graph provides useful context, but the predicted relationship still needs further evidence and testing.",
      minutes: 14,
    },
    {
      title: "Review and Assess",
      goal: "Review the main concepts and check your understanding.",
      actions: [
        "Use the AI Chat if you need help with a concept.",
        "Review the Knowledge Bank sections on drug repurposing, network medicine, and TransE.",
        "Complete the Assessment.",
      ],
      expect: "A completed assessment and a drug-repurposing hypothesis based on the lab results.",
      minutes: 12,
    },
  ],

  troubleshooting: [
    {
      problem: "The first analysis takes several minutes.",
      fix: "In Intermediate and Advanced mode, the data is fetched live from the databases on a first run, which can take a few minutes. Data already retrieved for a drug or disease is reused, so later runs are faster. You can move to other steps while it runs, and the analysis carries on.",
    },
    {
      problem: "A step says it is not ready yet.",
      fix: "Each step works from the one before it. Until its input exists, a step says what it needs, for example **No project open yet** or **Not run yet**, with a button back to the step that provides it. A step turns green with a tick in the Analysis Pipeline once it is done.",
    },
    {
      problem: "Input Data says this mode’s drug limit is reached.",
      fix: "Each mode caps how many drugs one project can take: up to 10 in Intermediate and up to 500 in Advanced. Remove a drug before adding another, or switch to a higher mode from the header.",
    },
    {
      problem: "The knowledge graph does not render or is blank.",
      fix: "In Intermediate and Advanced mode the graph is drawn in 3D and needs WebGL. Enable hardware acceleration and use a desktop browser. The graph is also hard to use on a small screen even when it renders.",
    },
    {
      problem: "A prediction looks implausible.",
      fix: "That is a genuine and instructive outcome. Follow the related graph path in **Results & Report**. You will usually find that the graph states an association more strongly than the underlying biology supports.",
    },
    {
      problem: "The AI Chat returns an error.",
      fix: "The AI Chat calls a language model through Live Labs. Retry once. If it keeps failing, it answers from the lab's own notes instead. The analysis, the ranking and the report do not depend on it, because the lab computes them itself.",
    },
  ],

  furtherReading: [
    { label: "ChEMBL: drugs, their targets and mechanisms of action", href: "https://www.ebi.ac.uk/chembl/" },
    { label: "Open Targets Platform: evidence linking genes to diseases", href: "https://platform.opentargets.org/" },
    { label: "Bordes et al., \"Translating Embeddings for Modeling Multi-relational Data\" (TransE)", href: "https://papers.nips.cc/paper/5071-translating-embeddings-for-modeling-multi-relational-data" },
    { label: "Barabási et al., \"Network medicine: a network-based approach to human disease\"", href: "https://www.nature.com/articles/nrg2918" },
  ],
};

export default guide;

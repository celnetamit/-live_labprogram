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
     * Four bullets, as the 17 October brief writes them. `whoFor` is that
     * brief's lead sentence followed by its four subject areas, one per
     * paragraph, because the field is prose rather than a list.
     */
    why: [
      "Drug repurposing explores new therapeutic applications for existing medicines, potentially reducing early stage drug development time and costs.",
      "AI assisted drug discovery helps researchers identify promising drug and disease associations from complex biomedical data.",
      "Biomedical knowledge graphs integrate drugs, genes, diseases, and biological pathways to reveal meaningful molecular relationships.",
      "Network pharmacology and link prediction support evidence based drug candidate prioritization and guide further experimental research.",
    ],
    whoFor:
      "This lab is designed for students, researchers, academicians, and industry professionals interested in computational drug discovery and biomedical research.\n\nPharmacy, Pharmacology & Pharmaceutical Sciences\n\nBioinformatics, Computational Biology & Biotechnology\n\nDrug Discovery, Network Pharmacology & Systems Biology\n\nArtificial Intelligence, Machine Learning & Biomedical Data Science",
    outcomes: [
      "Understand how drugs, genes, diseases, and molecular targets are connected through biomedical knowledge graphs.",
      "Explore graph embeddings and network based methods for representing drug disease relationships.",
      "Apply link prediction concepts to identify potential drug repurposing opportunities.",
      "Analyze drug target interactions and interpret computational prediction scores.",
      "Prioritize promising drug candidates using network pharmacology and biomedical evidence.",
      "Develop evidence based drug repurposing hypotheses for further experimental validation.",
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
   * so "What's Included in the Lab" (from `LAB_PROFILE.included`) and the
   * troubleshooting entries follow it.
   *
   * 17 October 2026, from the brief: the tutorial, the outcomes, "Why It
   * Matters" and "Who It's For" are rewritten, About's third paragraph is
   * replaced, and the dashes come out of the words — "drug disease", not
   * "drug-disease" — which is the same treatment as the 15 October pass and
   * is why nothing here is hyphenated any more. Published titles under
   * `furtherReading` keep theirs, being citations. This lab now carries its
   * own tutorial lead line in `tutorialIntro`; the panel's shared line is
   * the fallback.
   *
   * The eight steps here are the brief's, not `TUTORIAL_STEPS`: they name
   * the pipeline in general terms ("select Mode", "Select a research case")
   * rather than the lab's exact controls, so they are deliberately looser
   * than the previous nine, which were the app's own wording.
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
      "Explore relationships among drugs, diseases, genes, and adverse effects using a biomedical knowledge graph. Learn how graph embeddings and link prediction can help uncover possible drug disease connections for further research.",
    about: [
      "**Repurpose** is an experimental approach to identifying new therapeutic applications for existing drugs by investigating their molecular targets, biological pathways, and disease associations.",
      "In this interactive Live Lab, explore a biomedical knowledge graph to integrate drugs, genes, diseases, and adverse drug effects. Apply **knowledge graph embeddings using the TransE model** to represent biological relationships computationally and predict potential drug disease associations through link prediction.",
      "Investigate multiple drug disease associations using evidence weighted scoring, safety assessment, literature validation, and server based comparison of TransE with other knowledge graph models.",
      "Analyze and rank promising drug candidates, examine their supporting biological relationships, and interpret predictions to identify potential therapeutic leads. Use these findings to formulate **scientifically grounded, testable hypothesis for future drug discovery**.",
    ],
    tags: ["Drug Repurposing", "Knowledge Graphs", "Graph Embeddings", "AI Prediction"],
    walkthroughTitle: "From known medicines to new treatment hypotheses",
    journey: "Repurpose",
    card: {
      badge: "Interactive lab",
      icon: "graph",
      description:
        "Build a drug gene disease knowledge graph, learn numerical embeddings, and predict promising links that are not yet recorded.",
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
        body: "Use patterns in the graph to identify and rank possible drug disease connections for further study.",
      },
      {
        icon: "insight",
        title: "Testable Hypothesis",
        body: "Use the model result and supporting graph information to develop a clear drug repurposing hypothesis that can be investigated further.",
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
    "**Link Prediction Experiment:** Rank possible drug disease links for further study.",
    "**Supporting Graph Paths:** Follow the connections behind a predicted link.",
    "**Testable Hypothesis:** Use the result to develop a clear drug repurposing research hypothesis.",
  ],

  /*
   * The 17 October brief's eight steps, verbatim, in its order: each title,
   * goal, the three actions and the expected result as written. The brief
   * gives no "why" line, so none is invented. Only `minutes` is the hub's
   * own; they are the previous steps' figures carried across one for one, so
   * the hands-on total falls from 89 to 77 because the ninth step (Review
   * and Assess) is no longer in the brief.
   */
  tutorialIntro:
    "Follow the AI powered drug repurposing workflow, explore biomedical knowledge graphs, evaluate drug disease associations, and develop evidence based research hypotheses.",

  steps: [
    {
      title: "Start the Lab",
      goal: "Explore the Repurpose Drug Discovery Lab and understand the computational drug repurposing workflow.",
      actions: [
        "Open the Repurpose: Drug Discovery Lab and select Mode.",
        "Review the research objectives and eight stage analysis pipeline.",
        "Explore how existing drugs can be investigated for new therapeutic applications.",
      ],
      expect: "An interactive drug repurposing workflow connecting biomedical data, network analysis, and AI assisted predictions.",
      minutes: 4,
    },
    {
      title: "Set Up Your Research Project",
      goal: "Create a research project to investigate potential drug and disease associations.",
      actions: [
        "Select a research case or disease of interest.",
        "Enter the project name and define the therapeutic research objective.",
        "Review the selected disease and candidate drugs for computational analysis.",
      ],
      expect: "A structured research project with selected drug candidates and a defined disease target.",
      minutes: 3,
    },
    {
      title: "Enter Drug and Disease Data",
      goal: "Prepare the biomedical inputs required for drug repurposing analysis.",
      actions: [
        "Enter or review the selected disease and existing drugs.",
        "Identify relevant drug names and disease information.",
        "Prepare the input data for biomedical database validation.",
      ],
      expect: "A structured drug and disease dataset ready for validation and further analysis.",
      minutes: 10,
    },
    {
      title: "Validate Biomedical Data",
      goal: "Explore how reliable biomedical databases support evidence based drug discovery.",
      actions: [
        "Validate drug and disease entries against open biomedical databases.",
        "Retrieve available information on drug targets and disease associated genes.",
        "Review the validated records and supporting biological evidence.",
      ],
      expect: "Validated biomedical information linking candidate drugs, molecular targets, and disease biology.",
      minutes: 10,
    },
    {
      title: "Explore the Biomedical Knowledge Graph",
      goal: "Visualize molecular relationships through network pharmacology and knowledge graph analysis.",
      actions: [
        "Generate a biomedical knowledge graph connecting drugs, genes, diseases, pathways, and side effects.",
        "Examine relationships between drug targets and disease associated genes.",
        "Explore network connections that may support potential drug repurposing hypotheses.",
      ],
      expect: "An interactive molecular network highlighting biologically relevant drug target disease relationships.",
      minutes: 12,
    },
    {
      title: "Analyze Drug Disease Relationships",
      goal: "Investigate how network based computational methods identify promising therapeutic connections.",
      actions: [
        "Analyze drug target interactions and their relevance to disease biology.",
        "Explore how graph embeddings and link prediction can represent and evaluate drug disease relationships.",
        "Review available network based evidence supporting potential therapeutic associations.",
      ],
      expect: "Computational analysis results highlighting potential drug disease associations and supporting network evidence.",
      minutes: 12,
    },
    {
      title: "Predict and Rank Drug Candidates",
      goal: "Explore AI assisted drug repurposing and evidence based candidate prioritization.",
      actions: [
        "Evaluate potential drug disease links using the available prediction and scoring methods.",
        "Compare candidate drugs based on network relationships and supporting biomedical evidence.",
        "Rank promising candidates for further investigation and experimental validation.",
      ],
      expect: "A ranked list of potential drug repurposing candidates with prediction scores and supporting evidence.",
      minutes: 12,
    },
    {
      title: "Interpret Results and Generate a Research Report",
      goal: "Translate computational predictions into scientifically testable drug repurposing hypotheses.",
      actions: [
        "Review the ranked candidates, biological relationships, and supporting evidence.",
        "Identify promising drug disease associations and evaluate their scientific relevance.",
        "Generate a research report summarizing the findings and proposed experimental validation steps.",
      ],
      expect: "A structured drug repurposing research report containing prioritized drug candidates, supporting biomedical evidence, and testable therapeutic hypotheses.",
      minutes: 14,
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

import type { LabGuide } from "./types";

/**
 * RepurposeAI: Drug Discovery Lab — https://drug.live-labs.org/
 *
 * Five routes: Dashboard, Learning Lab, Experiment, Knowledge Bank,
 * Assessment. The Learning Lab is explicitly three sequenced labs (Knowledge
 * Graph Integration → Graph Embeddings → Link Prediction) that the Experiment
 * page then puts to work on an interactive graph.
 */
const guide: LabGuide = {
  slug: "drugdiscovery-ai",

  summary: {
    tagline: "Explore how existing medicines can be studied for new therapeutic uses.",
    what: "Drug repurposing is the study of whether an existing medicine may also be useful for treating another disease. In this lab, you will explore how drugs, genes, diseases, and side effects are connected in a knowledge graph. You will learn how these connections can be represented as numbers and used to identify possible drug–disease links for further study.",
    /*
     * The brief gives this as two paragraphs; Amit asked for bullets on
     * 3 October, which is also how the other twelve labs carry the section.
     * Split at sentence boundaries only — every word is still the brief's.
     */
    why: [
      "Drug repurposing looks at whether an existing medicine may also be useful for another disease.",
      "An existing drug may already have safety, pharmacology, and clinical information available, which can support research into a new use.",
      "However, its safety and effectiveness for the new disease still need to be tested.",
      "Biomedical information is spread across research papers and databases.",
      "Knowledge graphs bring information about drugs, genes, diseases, and other biological entities together in a structured way.",
      "Graph-based methods can then help researchers study these relationships and identify possible connections for further investigation.",
    ],
    whoFor: "This lab is suitable for **students and researchers in drug discovery, pharmacology, bioinformatics, computational biology, and related life-science fields** who want to understand how graph-based methods can be used to study drug–target–disease relationships.\n\nBasic knowledge of **drug targets, genes, and disease biology** is helpful. No previous experience with knowledge graphs, graph embeddings, or TransE is required.",
    outcomes: [
      "Explain how drugs, genes, diseases, and side effects can be represented in a knowledge graph.",
      "Explain how graph embeddings represent these relationships in numerical form.",
      "Use link prediction and interpret the model score correctly.",
      "Develop a drug-repurposing hypothesis from a predicted drug–disease link.",
      "Identify the evidence needed to test the hypothesis.",
      "Explain why a predicted link needs further research and validation.",
    ],
  },

  /*
   * The designer's page (drugdiscovery.html / drugdiscovery.css), copy and
   * colours as supplied. Checked against the lab: the teaching graph in
   * `data/knowledgeGraph.ts` carries SIDER side-effect edges, so "side
   * effects" and "adverse effects" hold for the graph the learner works in
   * (the Hetionet reference graph behind the API drops them under its
   * commercial-safe licence policy); the embedding is TransE, trained in the
   * browser (`engine/transe.ts`), and link prediction ranks from it.
   *
   * Every section now carries the "Live labs - Contents" brief for RepurposeAI
   * (3 October 2026) verbatim — tagline, the two-sentence intro, the four
   * "About this lab" paragraphs, the feature cards, "What's Included in the
   * Lab", all eight tutorial steps with the brief's bold, the outcomes, and
   * "Why It Matters" and "Who It's For" as the brief's two paragraphs each.
   * An earlier pass had merged, reworded and bulleted some of it; Amit asked
   * for the document as written.
   *
   * The lab app carries the same text in `drugdiscovery-ai/data/labProfile.ts`,
   * and every control the steps name exists there under that name: the five
   * sections in a sidebar, the XP counter, "Lab 1: Knowledge Graph
   * Integration", the four tour steps, Add Drug, AI Link Prediction, the AI
   * Chat. Change the two together.
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
    headline: "Explore how existing medicines can be studied for new therapeutic uses.",
    intro:
      "Discover how drugs, genes, diseases, and side effects are connected through a knowledge graph. Learn how graph embeddings and link prediction can help uncover possible drug–disease connections for further research.",
    about: [
      "Drug repurposing is the study of whether an existing medicine may also be useful for treating another disease.",
      "In this lab, you will explore how drugs, genes, diseases, and side effects are connected in a knowledge graph. You will learn how these connections can be represented as numbers and used to identify possible drug–disease links for further study.",
      "You will also examine the graph information that supports a predicted link. Using this information, you will develop a testable drug-repurposing hypothesis.",
      "A predicted link is not proof that a drug will work for a disease. It is a starting point for further research and testing.",
    ],
    tags: ["Drug Repurposing", "Knowledge Graphs", "Graph Embeddings", "AI Prediction"],
    walkthroughTitle: "From known medicines to new treatment hypotheses",
    journey: "Repurpose",
    card: {
      badge: "Interactive lab",
      icon: "graph",
      description:
        "Build a drug–gene–disease knowledge graph, learn numerical embeddings, and predict promising links that are not yet recorded.",
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
        title: "Knowledge graph reasoning",
        body: "Explore how medicines, gene targets, diseases, and side effects are connected in a structured network.",
      },
      {
        icon: "analysis",
        title: "Graph embeddings",
        body: "Learn how relationships in the graph can be represented as numbers for computational analysis.",
      },
      {
        icon: "simulation",
        title: "Link prediction",
        body: "Use patterns in the graph to identify and rank possible drug–disease connections for further study.",
      },
      {
        icon: "insight",
        title: "Testable hypothesis",
        body: "Use the model result and supporting graph information to develop a clear drug-repurposing hypothesis that can be investigated further.",
      },
    ],
  },

  video: {
    url: "/demos/drugdiscovery-ai.mp4",
    poster: "/demos/drugdiscovery-ai.jpg",
    durationSec: 61,
    chapters: [
      { at: 0, label: "Drugs that found their real purpose late" },
      { at: 6, label: "Entering the laboratory" },
      { at: 16, label: "Learning Lab — graphs, embeddings, link prediction" },
      { at: 28, label: "The Experiment — an interactive knowledge graph" },
      { at: 39, label: "Adding a drug and predicting links" },
      { at: 53, label: "Knowledge Bank and assessment" },
    ],
  },

  /*
   * The brief's list here is "What's Included in the Lab", not a readiness
   * checklist — same treatment as MicrobeAI's, and now every lab's section
   * heading, so no `prerequisitesLabel` override is needed.
   */
  prerequisites: [
    "**Guided learning:** Understand knowledge graphs, graph embeddings, and link prediction step by step.",
    "**Interactive knowledge graph:** Explore links between drugs, genes, diseases, and side effects.",
    "**Graph embedding activity:** See how graph relationships are represented as numbers.",
    "**Link prediction experiment:** Rank possible drug–disease links for further study.",
    "**Supporting graph paths:** Follow the connections behind a predicted link.",
    "**Testable hypothesis:** Use the result to develop a clear drug-repurposing research hypothesis.",
  ],

  steps: [
    {
      title: "Take the Dashboard Tour",
      goal: "Get familiar with the lab and see how your progress is tracked.",
      actions: [
        "Sign in and open the Dashboard.",
        "Find the five sections: Dashboard, Learning Lab, Experiment, Knowledge Bank, and Assessment.",
        "Check the XP counter. You earn points as you complete labs and use the tools.",
      ],
      expect: "A dashboard showing your progress and links to each section.",
      minutes: 4,
    },
    {
      title: "Learning Lab 1 — Knowledge Graph Integration",
      goal: "See how drugs, genes, diseases, and side effects are connected in a knowledge graph.",
      actions: [
        "Open Learning Lab and start **Lab 1: Knowledge Graph Integration**.",
        "Identify the four node types: Drug, Disease, Gene, and Side Effect.",
        "Look at the relationship types: **treats, targets, and associated_with**.",
        "Follow one path: a drug targets a gene, and the gene is associated with a disease.",
      ],
      expect: "A drug–gene–disease path and what each relationship means.",
      why: "The relationship type tells you how two nodes are connected and gives the link its meaning.",
      minutes: 14,
    },
    {
      title: "Learning Lab 2 — Graph Embeddings",
      goal: "See how information in a graph can be represented as numbers.",
      actions: [
        "Start **Lab 2: Graph Embeddings**.",
        "See how each entity is represented by a vector.",
        "Observe how the model learns patterns from the relationships in the graph.",
        "See how a relation is represented as a change between positions in the embedding space.",
      ],
      expect: "How graph information is represented in numerical form.",
      why: "This numerical form allows the model to compare relationships and look for possible missing links.",
      minutes: 14,
    },
    {
      title: "Learning Lab 3 — Link Prediction",
      goal: "Learn how the model ranks possible missing links.",
      actions: [
        "Start **Lab 3: Link Prediction**.",
        "See the basic TransE relationship: **head + relation ≈ tail**.",
        "See how candidate entities are ranked by how well they fit the learned relationship.",
        "Check what the model score means and what it does not mean.",
      ],
      expect: "How TransE produces a ranked list of possible relationships.",
      why: "The score shows how well a link fits the patterns learned from the graph. It does not prove that the biological relationship is real.",
      minutes: 14,
    },
    {
      title: "Open the Experiment and Take the Guided Tour",
      goal: "Get familiar with the interactive graph before starting the experiment.",
      actions: [
        "Open **Experiment** from the sidebar.",
        "Follow the four tour steps: Welcome to the Lab, Drug–Target Interaction, Target–Disease Association, and Repurposing Hypothesis.",
        "Move the nodes and click on them to explore their details and connections.",
      ],
      expect: "An interactive graph showing different node types and their connections.",
      why: "The tour shows how drug–target and target–disease relationships can be used to form a possible drug–disease hypothesis.",
      minutes: 12,
    },
    {
      title: "Add Your Own Drug Candidate",
      goal: "Add a drug and explore how it connects to the graph.",
      actions: [
        "Click **Add Drug**.",
        "Enter the drug name, gene targets, and side effects.",
        "Add the drug and find its node in the graph.",
        "Check which nodes it connects to and the relationships behind those connections.",
      ],
      expect: "Your drug as a new node linked through the information you entered.",
      why: "The results depend on the information and relationships in the graph. Reliable input is important for meaningful results.",
      minutes: 12,
    },
    {
      title: "Run Link Prediction and Form a Hypothesis",
      goal: "Use the prediction to develop a testable research hypothesis.",
      actions: [
        "Click **AI Link Prediction**.",
        "Check the predicted drug–disease link and its model score.",
        "Follow the related graph path and note the target and disease association.",
        "Write a short hypothesis and describe how it could be tested.",
      ],
      expect: "A predicted drug–disease link, its model score, and the related graph connections.",
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
      problem: "The graph does not render or is blank.",
      fix: "It needs WebGL. Enable hardware acceleration and use a desktop browser — the graph is also unusable on a small screen even when it renders.",
    },
    {
      problem: "Add Drug says the limit is used.",
      fix: "Each lab mode caps how many drug candidates you can add, and Beginner allows one. Click your drug, choose **Remove drug** in its panel and add it again, or switch to a higher mode from the header.",
    },
    {
      problem: "Link prediction produces an implausible result.",
      fix: "That is a genuine and instructive outcome. Follow the related graph path in the Link Prediction panel — you will usually find the graph asserts an association more strongly than the underlying biology warrants. Garbage in, confident garbage out.",
    },
    {
      problem: "The AI Chat or an AI hypothesis returns an error.",
      fix: "Those call a language model through a gateway. Retry once; if they keep failing, the provider key needs attention from the organiser. **AI Link Prediction** does not depend on it — the model runs in your browser.",
    },
  ],

  furtherReading: [
    { label: "DrugBank — drug and target reference database", href: "https://go.drugbank.com/" },
    { label: "Bordes et al., \"Translating Embeddings for Modeling Multi-relational Data\" (TransE)", href: "https://papers.nips.cc/paper/5071-translating-embeddings-for-modeling-multi-relational-data" },
    { label: "Barabási et al., \"Network medicine: a network-based approach to human disease\"", href: "https://www.nature.com/articles/nrg2918" },
  ],
};

export default guide;

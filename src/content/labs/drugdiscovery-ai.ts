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
    what: "Some of the most important drugs in use today were developed for something else entirely and found their real purpose later. Drug repurposing tries to make that happen deliberately instead of by accident. This lab teaches the network approach: represent drugs, genes, diseases and side effects as a connected graph, learn a numerical embedding of that graph, and then predict the connections that ought to exist but have not been recorded yet — each one a repurposing hypothesis.",
    why: "A repurposed drug has already cleared safety trials in humans, which removes years and a large fraction of the cost from development. The obstacle is that the useful connections are buried in millions of papers and databases that no individual can hold in their head. Graph methods are how that search is made tractable, and they are now standard in pharmaceutical informatics.",
    whoFor: "Biology, pharmacy, bioinformatics and computer science students. It is an advanced lab, but the difficulty is conceptual rather than mathematical — you need curiosity about how biological knowledge gets represented, not linear algebra.",
    outcomes: [
      "Model biomedical knowledge as a graph of typed entities and typed relationships",
      "Explain what a graph embedding is and why proximity in that space is meaningful",
      "Run link prediction and read the confidence score for what it is",
      "Generate a repurposing hypothesis and articulate what evidence would test it",
      "Explain why a predicted link is a starting point for experiments, not a conclusion",
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

  prerequisites: [
    "Introductory biology — genes, proteins, what a drug target is",
    "A desktop browser with WebGL for the interactive graph",
    "About 75 minutes for the three learning labs plus the experiment",
  ],

  steps: [
    {
      title: "Take the dashboard tour",
      goal: "See the structure and how progress is tracked.",
      actions: [
        "Sign in and land on **Dashboard**.",
        "Note the five sections: Dashboard, Learning Lab, Experiment, Knowledge Bank, Assessment.",
        "Note the XP counter — the app awards points for completing labs and running tools, which is how it tracks what you have done.",
      ],
      expect: "A dashboard with progress indicators and clear entry points.",
      minutes: 4,
    },
    {
      title: "Learning Lab 1 — knowledge graph integration",
      goal: "Understand how biomedical knowledge becomes a graph.",
      actions: [
        "Open **Learning Lab** and start **Lab 1: Knowledge Graph Integration**.",
        "Note the four node types: Drug, Disease, Gene and Side Effect.",
        "Note that edges are typed too — 'treats', 'targets', 'associated_with' — not just connections.",
        "Trace one path in your head: a drug targets a gene, that gene is associated with a disease.",
      ],
      expect: "You can describe a drug-target-disease path and say what each edge type means.",
      why: "Typed edges are what make this more than a diagram. 'Drug A treats Disease B' and 'Drug A causes Disease B' connect the same two nodes and mean opposite things, so the relation type carries as much information as the link itself.",
      minutes: 14,
    },
    {
      title: "Learning Lab 2 — graph embeddings",
      goal: "See how a graph becomes numbers a model can work with.",
      actions: [
        "Start **Lab 2: Graph Embeddings**.",
        "Follow how each entity is assigned a position in a vector space.",
        "Note the property that matters: entities playing similar roles end up close together.",
        "Look at how a relation becomes a translation between positions rather than a point.",
      ],
      expect: "You can explain why two drugs that treat the same diseases through the same targets end up near each other in the embedding.",
      why: "The embedding is a lossy compression of the graph that preserves relational structure. That compression is the point — it lets you ask about connections that were never recorded, because the geometry generalises beyond the specific edges it was trained on.",
      minutes: 14,
    },
    {
      title: "Learning Lab 3 — link prediction",
      goal: "Understand the algorithm that turns geometry into a hypothesis.",
      actions: [
        "Start **Lab 3: Link Prediction**.",
        "Read how TransE works: it trains so that the embedding of the head entity plus the embedding of the relation lands near the tail entity.",
        "Understand the inference step: given a head and a relation, the nearest entities are the most likely tails.",
        "Note that every prediction comes with a score, and what that score does and does not mean.",
      ],
      expect: "You can state the TransE relationship — head + relation ≈ tail — and explain how it produces ranked candidates.",
      why: "The score measures geometric consistency with the training graph, nothing more. It is not a probability that the biology is real, and reading it as one is the central mistake this field makes.",
      minutes: 14,
    },
    {
      title: "Open the Experiment and take the guided tour",
      goal: "Get oriented on the interactive graph before manipulating it.",
      actions: [
        "Open **Experiment** in the sidebar.",
        "Start the guided tour and follow all four steps: Welcome to the Lab, Drug-Target Interaction, Target-Disease Association, and Repurposing Hypothesis.",
        "Then explore freely — drag nodes, click them for details, and see how the graph responds.",
      ],
      expect: "An interactive graph, colour-coded by node type, with a four-step tour that walks a complete repurposing argument.",
      why: "The tour is the argument in miniature: drug to target, target to disease, therefore drug to disease as a hypothesis. Everything you do afterwards is a variation on that chain.",
      minutes: 12,
    },
    {
      title: "Add your own drug candidate",
      goal: "Extend the graph and see how new knowledge propagates.",
      actions: [
        "Click **Add Drug**.",
        "Give it a name, list the gene targets you want it to act on, and list its side effects.",
        "Submit it and find your node in the graph.",
        "Look at what it is now connected to, and through which paths.",
      ],
      expect: "Your drug appears as a new node, linked through the targets you specified, and reachable from diseases associated with those genes.",
      why: "Adding a node with no edges tells you nothing. The value came entirely from the relationships you declared — which is exactly why building these graphs from literature is slow, expensive work, and why the graph's quality caps the quality of every prediction made on it.",
      minutes: 12,
    },
    {
      title: "Run link prediction and form a hypothesis",
      goal: "Generate a candidate and turn it into something testable.",
      actions: [
        "Click **AI Link Prediction**.",
        "Read the result: which drug is predicted to treat which disease, and with what score.",
        "Trace the path through the graph that supports it — which target, which association.",
        "Write the hypothesis in one sentence, and then write down the experiment that would falsify it.",
      ],
      expect: "A predicted drug-disease link with a confidence score, and a traceable path through the graph explaining it.",
      why: "The traceable path is what makes a prediction usable. A high score with no mechanistic path is unpublishable and unfundable; a moderate score with a clear target-disease mechanism is a research proposal. Always look for the path before looking at the number.",
      minutes: 14,
    },
    {
      title: "Consolidate and assess",
      goal: "Fill gaps and check understanding.",
      actions: [
        "Use the **AI Chat** sidebar for anything unclear.",
        "Read the Knowledge Bank sections on drug repurposing, network medicine and the TransE algorithm.",
        "Take the **Assessment**.",
      ],
      expect: "A completed assessment and a repurposing hypothesis you could defend.",
      minutes: 12,
    },
  ],

  troubleshooting: [
    {
      problem: "The graph does not render or is blank.",
      fix: "It needs WebGL. Enable hardware acceleration and use a desktop browser — the graph is also unusable on a small screen even when it renders.",
    },
    {
      problem: "My added drug sits alone with no connections.",
      fix: "You submitted it without gene targets. Edit it to include targets that already exist in the graph — a node with no edges cannot participate in any prediction.",
    },
    {
      problem: "Link prediction produces an implausible result.",
      fix: "That is a genuine and instructive outcome. Trace the supporting path — you will usually find the graph asserts an association more strongly than the underlying biology warrants. Garbage in, confident garbage out.",
    },
    {
      problem: "An AI feature returns an error.",
      fix: "Those call a language model through a gateway. Retry once; if all of them fail, the provider key needs attention from the organiser.",
    },
  ],

  furtherReading: [
    { label: "DrugBank — drug and target reference database", href: "https://go.drugbank.com/" },
    { label: "Bordes et al., \"Translating Embeddings for Modeling Multi-relational Data\" (TransE)", href: "https://papers.nips.cc/paper/5071-translating-embeddings-for-modeling-multi-relational-data" },
    { label: "Barabási et al., \"Network medicine: a network-based approach to human disease\"", href: "https://www.nature.com/articles/nrg2918" },
  ],
};

export default guide;

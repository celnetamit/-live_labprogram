import type { LabGuide } from "./types";

/**
 * CogniCore AI — https://cognicore.live-labs.org/
 *
 * Two domain modules (Legal Lens AI, Finance Flow AI) each expose the same
 * three modes: Analyze Document, Compare Documents, Search Clause Atlas. The
 * tutorial takes them in that order because each needs more documents loaded
 * than the last.
 */
const guide: LabGuide = {
  slug: "cognicore-ai",

  summary: {
    tagline:
      "Summarise a contract, compare two drafts, and search a whole pile of documents by meaning rather than keyword.",
    what: "Contracts, invoices and financial reports are long, repetitive, and expensive to read carefully — which is why important details in them get missed. This lab is a document-intelligence workbench: upload a document and get it summarised, put two versions side by side and get the differences that matter surfaced, or search a whole corpus for a clause by meaning rather than by keyword. It ships two modules, one tuned for legal documents and one for financial ones.",
    why: "Semantic search is the part worth understanding. Keyword search for 'termination' misses a clause that says 'either party may bring this agreement to an end on thirty days' notice'. Meaning-based retrieval finds it. That single capability is what makes AI genuinely useful on document piles, and knowing both its power and its failure modes is now a basic professional skill in law, finance and compliance.",
    whoFor: "Computer science students interested in applied LLM systems, plus legal, finance and compliance professionals evaluating these tools. You need no machine-learning background; the lab is about using and judging the system rather than building it.",
    outcomes: [
      "Summarise a long document and check the summary against the source rather than trusting it",
      "Compare two versions and identify substantive changes as distinct from cosmetic ones",
      "Search a corpus by meaning and explain why that finds clauses keyword search misses",
      "Write prompts that produce specific, checkable output instead of generic prose",
      "Describe where these systems fail — hallucinated citations, missed negations, lost context",
    ],
  },

  video: {
    url: "/demos/cognicore-ai.mp4",
    poster: "/demos/cognicore-ai.jpg",
    durationSec: 51,
    chapters: [
      { at: 0, label: "Choosing a workspace profile" },
      { at: 9, label: "Legal Lens and Finance Flow modules" },
      { at: 21, label: "Opening the document workbench" },
      { at: 38, label: "Analyze, Compare and Clause Atlas modes" },
    ],
  },

  prerequisites: [
    "A document to work with. The lab ships samples; if you bring your own, use nothing confidential — it is processed by a language model provider",
    "For the comparison mode, two versions of the same document",
    "About 50 minutes",
  ],

  steps: [
    {
      title: "Choose a domain module",
      goal: "Enter the workbench tuned for the kind of document you have.",
      actions: [
        "Sign in and look at the module cards on the landing page.",
        "Choose **Legal Lens AI** for contracts and agreements, or **Finance Flow AI** for invoices, statements and reports.",
        "Note that module access is governed by your permissions — you may not see both.",
      ],
      expect: "The workbench opens with a mode switch offering Analyze Document, Compare Documents and Search Clause Atlas.",
      why: "The two modules differ in their system instructions and suggested prompts, not in their mechanics. A legal summariser is told to watch for obligations, liabilities and termination rights; a financial one for figures, periods and anomalies. Using the wrong one still works, just less well.",
      minutes: 4,
    },
    {
      title: "Analyze a single document",
      goal: "Get a first summary and, more importantly, learn to check it.",
      actions: [
        "Stay in **Analyze Document** mode and upload a document into the slot.",
        "Wait for the automatic summary — it runs as soon as a document is loaded.",
        "Read the summary, then open the document preview alongside it.",
        "Pick three specific claims from the summary and verify each against the source.",
      ],
      expect: "A structured summary appears without you prompting. Most claims check out; occasionally one is subtly overstated.",
      why: "Verification is the whole discipline. Summaries are fluent and confident regardless of accuracy, so fluency carries no information about correctness. Building the habit of spot-checking three claims — every time — is the single most valuable thing to take away from this lab.",
      minutes: 12,
    },
    {
      title: "Prompt for something specific",
      goal: "See how much the question shapes the usefulness of the answer.",
      actions: [
        "Try one of the suggested prompts to see the expected format.",
        "Now write a vague one: \"tell me about this document\". Note how generic the response is.",
        "Write a precise one instead: \"list every obligation this agreement places on the supplier, with the clause number for each\".",
        "Compare the two responses for how easy each is to check.",
      ],
      expect: "The vague prompt returns readable but unverifiable prose. The precise one returns a list you can walk through against the document.",
      why: "A response you cannot check is worth very little, however good it sounds. Asking for clause numbers, figures and quotations forces the model to anchor to the source and gives you the means to catch it when it does not.",
      minutes: 10,
    },
    {
      title: "Compare two versions",
      goal: "Find the changes that matter between drafts.",
      actions: [
        "Switch the mode to **Compare Documents**.",
        "Load version one into **Document One** and version two into **Document Two**.",
        "Let the automatic comparison run, then ask specifically which changes alter the parties' obligations.",
        "Check the comparison against the actual documents — particularly for changes it did *not* mention.",
      ],
      expect: "A comparison distinguishing substantive changes from formatting or renumbering.",
      why: "Omission is the failure mode to watch here, and it is much harder to spot than invention. A missing change reads as a clean comparison, so if the stakes are real, a diff tool should be run alongside this — one finds the meaning, the other guarantees completeness.",
      minutes: 12,
    },
    {
      title: "Search a corpus by meaning",
      goal: "Use the capability keyword search cannot reproduce.",
      actions: [
        "Switch to **Search Clause Atlas** and upload several documents into the corpus.",
        "Search for a concept rather than a phrase — \"what happens if either side wants to end this early\".",
        "Note that matches come back which never use the words you typed.",
        "Now search for a term you know appears verbatim and check that it is also found.",
      ],
      expect: "Concept searches return relevant clauses phrased entirely differently, ranked by semantic similarity.",
      why: "The retrieval works on embeddings — numerical representations where similar meanings sit close together — so it matches ideas rather than characters. The corresponding weakness is that it can rank something topically related but legally irrelevant above an exact match, which is why the exact-term check in the last action matters.",
      minutes: 12,
    },
    {
      title: "Probe the failure modes deliberately",
      goal: "Learn where not to trust the system before it matters.",
      actions: [
        "Ask about something the document does not contain and see whether you get a hedge or an invention.",
        "Find a clause with a negation or a double negative and ask about it directly.",
        "Ask for a specific figure and check it digit by digit.",
        "Ask a question whose answer depends on two clauses far apart in the document.",
      ],
      expect: "Negations and long-range dependencies are where errors cluster. Absent information sometimes produces a confident answer rather than an admission.",
      why: "These failures are structural, not bugs. Negation flips meaning with very little surface signal, and questions requiring two distant clauses depend on both landing in the retrieved context at once. Knowing this tells you which answers to verify hardest.",
      minutes: 12,
    },
  ],

  troubleshooting: [
    {
      problem: "The summary never appears after upload.",
      fix: "The automatic summary needs the document to finish loading, and in comparison mode it waits for both slots. If it still does not run, the provider call is failing — retry, then check with the organiser.",
    },
    {
      problem: "Comparison mode will not start.",
      fix: "It requires two documents. One slot filled produces nothing by design.",
    },
    {
      problem: "Clause Atlas returns nothing.",
      fix: "The corpus is empty. Clause Atlas searches the uploaded corpus, not the single-document slots — upload documents into the corpus first.",
    },
    {
      problem: "A PDF uploads but produces gibberish.",
      fix: "Scanned PDFs are images, not text. Unless the file has been through OCR there is nothing for the model to read.",
    },
    {
      problem: "Can I use this on confidential documents?",
      fix: "Not unless your organiser has confirmed the deployment routes through a gateway you control. Documents are sent to a language-model provider for processing.",
    },
  ],

  furtherReading: [
    { label: "Anthropic — prompt engineering guidance", href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" },
    { label: "Lewis et al., \"Retrieval-Augmented Generation\" — the pattern behind Clause Atlas", href: "https://arxiv.org/abs/2005.11401" },
    { label: "Stanford CodeX — the Center for Legal Informatics", href: "https://law.stanford.edu/codex-the-stanford-center-for-legal-informatics/" },
  ],
};

export default guide;

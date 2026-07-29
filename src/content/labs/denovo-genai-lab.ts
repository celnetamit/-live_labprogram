import type { LabGuide } from "./types";

/**
 * Denovo GenAI Lab — https://denovo.live-labs.org/
 *
 * The sidebar is explicitly numbered by the app itself (Lab 1: Chemical
 * Language → Lab 2: Latent Space → Lab 3: Constrained Gen → Exp 1: Morphing →
 * Exp 2: Optimization), so the tutorial follows that sequence exactly.
 */
const guide: LabGuide = {
  slug: "denovo-genai-lab",

  summary: {
    what: "Designing a new drug molecule from scratch is a search problem: there are more possible small molecules than there are atoms in the solar system, and almost all of them are useless. This lab teaches the generative-AI approach to that search. You learn how a molecule is written down as text a model can read, how a neural network compresses millions of molecules into a smooth map you can navigate, and then how to generate genuinely new candidates that satisfy the constraints a chemist actually cares about.",
    why: "Bringing one drug to market takes over a decade and costs billions, and the earliest stage — deciding which molecules are even worth making — has traditionally relied on chemists' intuition applied to a vanishingly small fraction of the possibilities. Generative models change what is searchable. Understanding how they represent chemistry, and where that representation breaks down, is now foundational for computational chemistry and cheminformatics work.",
    whoFor: "Chemistry, pharmacy, biotechnology and computer science students. It is the gentlest entry point in the catalogue: the labs build from \"how do you write a molecule as a string\" upwards, and no machine-learning background is assumed. Some familiarity with chemical structures helps but is not required.",
    outcomes: [
      "Read and write SMILES strings, and explain why molecules are represented as text for these models",
      "Describe what an autoencoder's latent space is and why a smooth one matters for molecule design",
      "Generate molecules under explicit constraints and check whether the model respected them",
      "Interpolate between two molecules and interpret the chemically nonsensical results along the way",
      "Run a multi-objective optimisation and articulate why properties trade off against each other",
    ],
  },

  video: {
    url: "/demos/denovo-genai-lab.mp4",
    poster: "/demos/denovo-genai-lab.jpg",
    durationSec: 46,
    chapters: [
      { at: 0, label: "De novo design: searching chemical space" },
      { at: 5, label: "Entering the lab" },
      { at: 12, label: "Lab 1 — molecules as SMILES strings" },
      { at: 24, label: "Lab 2 — the VAE latent space" },
      { at: 32, label: "Lab 3 — generating under constraints" },
      { at: 39, label: "Exp 1 — morphing, and Exp 2 — optimisation" },
    ],
  },

  prerequisites: [
    "No chemistry beyond school level — the lab introduces what it needs",
    "A browser with WebGL for the 3D molecule viewer",
    "About 70 minutes for all five labs; each is self-contained if you have less",
  ],

  steps: [
    {
      title: "Start at the dashboard",
      goal: "See the five labs and the order they are meant to be taken in.",
      actions: [
        "Sign in and land on **Home**.",
        "Read the lab cards — the sidebar numbers them Lab 1 to Lab 3, then Exp 1 and Exp 2.",
        "Open **About Platform** if you want the background before starting.",
      ],
      expect: "A dashboard listing five numbered exercises plus a Knowledge Bank, an AI Research Tutor and a final assessment.",
      why: "The numbering is not decorative. Lab 2 assumes you can read a SMILES string; Exp 2 assumes you understand what the latent space is doing.",
      minutes: 3,
    },
    {
      title: "Lab 1 — the chemical language",
      goal: "Learn how a molecule becomes a string, which is the precondition for everything else.",
      actions: [
        "Open **Lab 1: Chemical Language**.",
        "Work through the tokenizer: enter a simple SMILES string such as `CCO` (ethanol) and watch it split into tokens.",
        "Try `c1ccccc1` (benzene) and note how the ring closure digit and the lower-case aromatic atoms work.",
        "Deliberately enter something invalid — an unclosed ring, say `C1CCC` — and see what the parser does.",
      ],
      expect: "Valid strings tokenize cleanly and render as a structure; the unclosed ring fails to parse.",
      why: "SMILES exists so that chemistry can be fed to models built for language. That choice has a consequence you will meet in Exp 1: most random strings are not valid molecules, so a model generating character by character can easily produce nonsense.",
      minutes: 10,
    },
    {
      title: "Lab 2 — see inside the latent space",
      goal: "Understand what the model actually learns: a compressed map of chemical space.",
      actions: [
        "Open **Lab 2: Latent Space**.",
        "Study the VAE architecture diagram — encoder, bottleneck, decoder.",
        "Move through the latent space visualisation and watch the decoded molecule change as you move.",
        "Find two points close together and confirm the molecules they decode to are chemically similar.",
      ],
      expect: "Nearby points decode to similar molecules; distant points to very different ones.",
      why: "That property — nearness in the latent space meaning similarity in chemistry — is the entire reason this architecture is used. It turns \"design a molecule\" into \"move to a promising coordinate\", which is a problem optimisation can solve.",
      minutes: 12,
    },
    {
      title: "Lab 3 — generate under constraints",
      goal: "Produce new molecules that satisfy properties you specify, and verify the model obeyed.",
      actions: [
        "Open **Lab 3: Constrained Gen**.",
        "Choose a preset to see the format, then set your own constraints — molecular weight range, solubility, ring count.",
        "Generate a batch of candidates.",
        "Check each result against the constraints you set, rather than assuming compliance.",
      ],
      expect: "A set of generated structures, most of which satisfy the constraints and some of which do not.",
      why: "Constraints in these systems are a soft pull on the sampling, not a hard filter. Treating generative output as guaranteed-valid is the most common and most expensive mistake in applied de novo design — every candidate needs checking downstream.",
      minutes: 14,
    },
    {
      title: "Exp 1 — morph one molecule into another",
      goal: "Walk a straight line through latent space and watch chemistry break in the middle.",
      actions: [
        "Open **Exp 1: Morphing**.",
        "Pick a start and end molecule.",
        "Step through the interpolation slowly and inspect the intermediates.",
        "Note where the intermediates stop being plausible molecules.",
      ],
      expect: "Smooth structural change near both ends, and a middle region containing strained or chemically implausible structures.",
      why: "The latent space is continuous but chemistry is not — valence rules are discrete. A straight line between two valid points passes through regions the model has never seen and cannot decode sensibly. This is exactly why generated candidates go to a validity filter before anyone considers synthesising them.",
      minutes: 12,
    },
    {
      title: "Exp 2 — optimise against several objectives at once",
      goal: "Experience the trade-off that defines real drug design.",
      actions: [
        "Open **Exp 2: Optimization**.",
        "Set at least two competing objectives — for example maximise binding affinity while keeping the molecule small and soluble.",
        "Run the optimisation and watch the population evolve.",
        "Try weighting one objective much more heavily and observe what happens to the others.",
      ],
      expect: "No single molecule wins on every objective. Push affinity hard and solubility or size degrades.",
      why: "This is why drug discovery is hard and why most candidates fail late. Potency is comparatively easy to optimise in isolation; potency together with solubility, safety, metabolic stability and synthetic accessibility is a different problem, and molecules that ace one axis routinely fail on another.",
      minutes: 14,
    },
    {
      title: "Consolidate with the tutor and the assessment",
      goal: "Close gaps and check your understanding.",
      actions: [
        "Open **AI Research Tutor** and ask about anything that did not land — the reparameterisation trick, why validity filters are needed, what a Pareto front is.",
        "Browse the **Knowledge Bank** for reference material.",
        "Take the **Final Assessment**.",
      ],
      expect: "A completed assessment with explanations for anything you got wrong.",
      minutes: 10,
    },
  ],

  troubleshooting: [
    {
      problem: "A SMILES string I know is correct will not parse.",
      fix: "Check ring-closure digits are paired and that aromatic atoms are lower case (`c1ccccc1`, not `C1CCCCC1` for benzene). Copy-pasting from a PDF often brings invisible characters with it — retype it.",
    },
    {
      problem: "Generation returns nothing or errors.",
      fix: "The generative labs call a model through a gateway. Retry once; if every AI feature in the app fails, the workshop's provider key needs attention from the organiser.",
    },
    {
      problem: "The 3D molecule viewer is blank.",
      fix: "It needs WebGL. Enable hardware acceleration and use a desktop browser.",
    },
    {
      problem: "The morphing intermediates are nonsense — is the lab broken?",
      fix: "No, that is the finding. Step 5 exists to show you that a continuous latent space produces chemically invalid points between valid ones.",
    },
  ],

  furtherReading: [
    { label: "Daylight — the SMILES specification", href: "https://www.daylight.com/dayhtml/doc/theory/theory.smiles.html" },
    { label: "RDKit — the open-source cheminformatics toolkit", href: "https://www.rdkit.org/" },
    { label: "Gómez-Bombarelli et al., \"Automatic Chemical Design Using a Data-Driven Continuous Representation of Molecules\"", href: "https://pubs.acs.org/doi/10.1021/acscentsci.7b00572" },
  ],
};

export default guide;

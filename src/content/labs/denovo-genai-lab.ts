import type { LabGuide } from "./types";

/**
 * Denovo GenAI Lab — https://denovo.live-labs.org/
 *
 * The lab computes its chemistry in the browser: a SMILES parser, real
 * descriptors, distance-geometry 3D coordinates, a PCA map of ~116 real
 * molecules, a fragment-based generator and a genetic algorithm. Nothing is
 * fetched and nothing is invented, which is why the tutorial can tell a learner
 * exactly what number to expect on screen.
 *
 * The sidebar is numbered Lab 1 → Lab 2 → Lab 3 → Exp 1 → Exp 2, so the
 * tutorial follows that order exactly.
 */
const guide: LabGuide = {
  slug: "denovo-genai-lab",

  summary: {
    tagline:
      "Design a molecule that has never existed — and find out exactly where the AI stops being trustworthy.",

    what: "Every new medicine starts as a molecule somebody had to think of. This lab shows you how AI does that thinking. You write a molecule down as a line of text, watch it turn into a 3D structure, explore a map where similar molecules sit near each other, and then ask the computer to invent new ones that match a specification you set. It takes about seventy minutes and needs nothing but a browser.",

    why: "Bringing one drug to market takes over a decade and costs billions, and the very first decision — which molecules are even worth making — used to depend on one chemist's intuition. Generative AI widens that search enormously, and it also fails in a new way: it will hand you a confident answer for something that cannot exist. Telling those two apart is now a basic skill in any lab that uses these tools, and it is what this lab is really about.",

    whoFor: "Anyone curious about how AI is used in medicine — students of chemistry, pharmacy, biology or computer science, and complete beginners in either half. School-level chemistry is enough and no machine-learning background is assumed. Everything is computed in front of you, so you can check the lab rather than take its word.",

    outcomes: [
      "Read and write a molecule as a SMILES string, and explain why models are given chemistry as text",
      "Recognise the two different ways a generated molecule can be wrong: broken notation, and impossible chemistry",
      "Navigate a map of chemical space, and say what it means when a region of it is empty",
      "Generate molecules to a specification and check, rather than assume, that the constraints were met",
      "Explain from your own results why improving one property usually costs you another",
      "Tell which numbers in a computational result are measured, which are calculated, and which are predicted",
    ],
  },

  video: {
    /**
     * Deliberately null. `public/demos/denovo-genai-lab.mp4` is a 46-second cut
     * of the previous interface — different navigation, different labs, numbers
     * that were being produced by a language model. Showing it now would teach a
     * prospective learner the wrong app, so the section falls back to the chapter
     * list until the re-shoot lands. The storyboard is ready to record:
     * `docs/demo-scripts/denovo-genai-lab.md`.
     */
    url: null,
    durationSec: 95,
    chapters: [
      {
        at: 0,
        label: "The problem: too many possible molecules",
        shot:
          "Landing page, full screen. Cycle the hero molecule through Aspirin → Caffeine → Ibuprofen so a real structure is turning from the first frame. Do not scroll yet.",
        say:
          "Every medicine you have ever taken started as a molecule somebody had to think of. There are more possible ones than there are atoms in the solar system, and almost all of them are useless. This lab is about how AI searches that space — and where it goes wrong.",
      },
      {
        at: 10,
        label: "Lab 1 — a molecule as a line of text",
        shot:
          "Open Lab 1. Clear the box and type CCO slowly, letter by letter. Let the 3D structure and the C2H6O readout settle. Then type c1ccccc1 and rotate the benzene ring until it is edge-on and visibly flat.",
        say:
          "A molecule can be written as one line of text. Type it, and the lab works out the hydrogens from the bonds each atom has spare, then solves for a real three-dimensional shape. Nothing is looked up and nothing is guessed — benzene comes out flat because the geometry says so.",
      },
      {
        at: 26,
        label: "Lab 1 — breaking it on purpose",
        shot:
          "Click the red 'unclosed ring' chip. Hold on the caret sitting under the offending character. Then click 'five bonds on carbon' and hold on the second, different error.",
        say:
          "Now break it deliberately. The first string opens a ring and never closes it — a grammar mistake. The second is perfectly well formed and still impossible, because it asks carbon for five bonds. A model writing text one character at a time makes both kinds of mistake, and only the first one looks wrong.",
      },
      {
        at: 38,
        label: "Lab 2 — the map of chemical space",
        shot:
          "Open Lab 2. Rotate the map for two seconds, then click a dot near the greasy end and let the decode panel fill in. Point the cursor at the two mean-similarity figures at the bottom of the neighbour panel.",
        say:
          "Every dot here is one real molecule, placed by its measured properties and its structure. Molecules that sit near each other really are alike — and you can check that, because the lab shows you the similarity scores rather than asking you to believe it. That single property is what turns 'invent a molecule' into 'move to a promising coordinate'.",
      },
      {
        at: 54,
        label: "Lab 3 — designing to a specification",
        shot:
          "Open Lab 3, click the 'Oral drug-like' preset, press Generate. Hold on the sampled-versus-accepted counts, then click one candidate so the 5/5 tick list is visible. Switch the mode to 'Encourage it', generate again, and hold on a candidate with a red cross.",
        say:
          "Instead of drawing a structure, you describe one: this heavy, this greasy, at least one ring. Hundreds of candidates get built and measured in a tenth of a second, and most are thrown away. Switch the constraint from enforced to merely encouraged — which is how a real generative model behaves — and some of what comes back breaks the spec. Checking is not optional.",
      },
      {
        at: 68,
        label: "Exp 1 — where the chemistry breaks down",
        shot:
          "Open Exp 1 with aspirin and caffeine loaded. Step through two or three steps of the map route, then switch to 'Through the text' and hold on the column of red 'no' badges with their reasons.",
        say:
          "Travel between two drugs two different ways. Through the map, every step is a real molecule. Blend the two text strings directly and almost nothing survives — unclosed rings, impossible valences. Chemical space is continuous; chemistry is not. This is why generated molecules always go through a validity filter first.",
      },
      {
        at: 80,
        label: "Exp 2 — you cannot win on everything",
        shot:
          "Open Exp 2, run with the two default objectives, and hold on the rising progress curve. Then drag Lipophilicity to ×3, drop the others to zero, run again, and hold on the champion's collapsed drug-likeness bar.",
        say:
          "Finally, optimise. Ask for two sensible goals and the search improves both. Push one goal as hard as it will go and watch everything else fall over. Nothing malfunctioned — you asked for exactly that. This is why most drug candidates fail late.",
      },
      {
        at: 90,
        label: "Where to start",
        shot: "Return to Home. Rest on the 'Start here' card pointing at Lab 1.",
        say: "Start at Lab 1. It takes ten minutes and needs nothing but a browser.",
      },
    ],
  },

  prerequisites: [
    "No chemistry beyond school level — the lab introduces what it needs, when it needs it",
    "A desktop browser with WebGL for the 3D views (everything else works without it)",
    "About 70 minutes for all five exercises, or 10–15 minutes for any one of them on its own",
  ],

  steps: [
    {
      title: "Get your bearings on the home page",
      goal: "See the five exercises, and why they are in that order.",
      actions: [
        "Sign in and land on **Home**.",
        "Read the **Start here** card at the top — it tells you which exercise to open, and updates as you finish them.",
        "Skim the five exercise cards. Each says what you will do and what you should leave with.",
        "If you want the background first, open **About this lab** — it lists what the lab computes exactly, what it estimates, and what stands in for something bigger.",
      ],
      expect:
        "A page headed \"Designing molecules with AI\", a highlighted card pointing at Lab 1, and five numbered exercises below it with time estimates.",
      why: "The numbering is not decoration. Lab 2 assumes you can read a SMILES string, and Exp 2 assumes you know what the map in Lab 2 is doing. The sidebar ticks each exercise off as you complete it, so you can stop and come back.",
      minutes: 3,
    },

    {
      title: "Lab 1 — write a molecule as text",
      goal: "Turn a line of text into a molecule, and see how the hydrogens and the shape are worked out from it.",
      actions: [
        "Open **Lab 1: Chemical language**. Aspirin is already loaded.",
        "Clear the box and type `CCO`. That is ethanol — the alcohol in a drink.",
        "Look at the readout: the formula reads **C2H6O** and the weight **46.07 g/mol**. You never typed a hydrogen; six of them were worked out from the bonds each atom had spare.",
        "Now type `c1ccccc1` — benzene, six carbons in a ring. The lower case says the ring is aromatic.",
        "Spin the 3D view until you are looking at the ring edge-on. It is genuinely flat, because the geometry was solved rather than drawn.",
        "Hover any of the coloured token chips to read what that single character does in the string.",
      ],
      expect:
        "Every keystroke updates the structure, the token list and the properties immediately — there is no button to press and nothing to wait for.",
      why: "SMILES exists so that chemistry can be handed to models built for language. That one decision is what made generative chemistry possible, and it is also the source of the problem you will meet in Exp 1.",
      minutes: 10,
    },

    {
      title: "Lab 1 — now break it on purpose",
      goal: "Meet the two different ways a molecule can be wrong.",
      actions: [
        "Click the red chip labelled **unclosed ring**, which loads `C1CCC`.",
        "Read the error. A caret sits under the character that caused it, and the message explains that a ring was opened and never closed.",
        "Click **five bonds on carbon** (`C(C)(C)(C)(C)C`). The brackets are all balanced and there are no stray characters — this string is perfectly well formed.",
        "Read that error too: it is about valence, not spelling. Carbon makes four bonds, and this string asks for five.",
      ],
      expect:
        "Two different explanations. The first is a grammar problem; the second is a chemistry problem in a string that a spellchecker would happily pass.",
      why: "A model writing SMILES one character at a time can produce either kind of failure, and only the first is obvious from looking at the text. This is why every generated molecule goes through a validity check before anyone spends money on it.",
      minutes: 5,
    },

    {
      title: "Lab 2 — explore the map of chemical space",
      goal: "See what it means for molecules to be laid out so that near means similar.",
      actions: [
        "Open **Lab 2: Chemical space map**. Each dot is one real compound — 116 of them.",
        "Drag to rotate and scroll to zoom. The colour is cLogP, or greasiness: notice it shades across the map instead of being scattered at random.",
        "Click a dot. The panel on the right decodes it: name, structure, properties, and the molecules nearest to it.",
        "Compare the two averages at the bottom of that panel — mean similarity to the five nearest molecules against the five furthest. The first is normally the larger.",
        "Change the colour dropdown to **Molecular weight**, then to **Therapeutic class**, and look for the pattern each time.",
        "Paste a molecule of your own into the box at the bottom to see where it lands.",
      ],
      expect:
        "Sugars and amino acids clustered at one end of the map, greasy aromatics at the other, and near neighbours that score measurably higher on similarity than distant ones.",
      why: "That property — near meaning similar — is the entire reason this architecture is used. It turns \"invent a molecule\" into \"move to a promising coordinate\", which is a problem an optimiser can actually solve.",
      minutes: 12,
    },

    {
      title: "Lab 2 — steer into an empty region",
      goal: "Find out what a decoder does when you ask it about a coordinate where nothing lives.",
      actions: [
        "Click **Switch the probe on**. The probe is a coordinate you choose, rather than a molecule that exists.",
        "Drag the three sliders and watch the decoded molecule change as you move.",
        "Click **Jump somewhere empty**.",
        "Read the warning that appears, and the **distance reached** figure — how far the decoder had to look to find anything at all.",
      ],
      expect:
        "A panel telling you plainly that nothing sits near this coordinate, with the distance to the closest real molecule shown.",
      why: "This lab decodes by finding the nearest real molecule, so it can admit when a region is empty. A trained generative model cannot: it returns a confident-looking structure wherever you point it, and the empty parts of its space are exactly where impossible molecules come from.",
      minutes: 5,
    },

    {
      title: "Lab 3 — design to a specification",
      goal: "Ask for a property profile rather than a structure, then check what you actually got.",
      actions: [
        "Open **Lab 3: Design to a spec** and click the **Oral drug-like** preset.",
        "Press **Generate 12 candidates**. It takes about a tenth of a second.",
        "Look at **What the search did**: how many molecules were sampled, and how many survived. Most of what the generator produced was thrown away.",
        "Click a candidate. Its structure appears in 3D, with a tick or a cross against every constraint you set.",
        "Now click the **Brain-penetrant** preset — small, greasy and barely polar all at once — and generate again. Watch the acceptance rate fall.",
        "Switch the mode from **Enforce it** to **Encourage it** and generate once more.",
      ],
      expect:
        "In enforced mode every candidate scores 5/5 against your constraints. In encouraged mode some come back with a red cross beside a constraint they failed.",
      why: "That difference is the whole point. A conditional generative model encourages a constraint — it pulls the sampling in the right direction — and non-compliant molecules still come through. Treating generative output as guaranteed-compliant is the most expensive routine mistake in this field.",
      minutes: 14,
    },

    {
      title: "Exp 1 — travel between two molecules, two ways",
      goal: "Watch chemistry break, and understand why a latent space is worth having.",
      actions: [
        "Open **Exp 1: Morph two molecules**. Aspirin and caffeine are loaded as the two ends.",
        "Leave the route on **Through the map** and step along the path. Every intermediate is a real molecule; the chart shows resemblance to the start falling as resemblance to the target grows.",
        "Now switch to **Through the text**, which blends the two SMILES strings character by character — roughly what a sequence model with no latent space does.",
        "Count the red steps, and read the reason given for each one.",
      ],
      expect:
        "The map route stays valid the whole way. The text route usually produces only two or three strings that parse at all — the rest have unclosed rings or impossible valences, each named specifically.",
      why: "Text and coordinates are continuous; chemistry is not. Valence rules are all-or-nothing, so a model moving smoothly through its representation can walk straight out of the set of real molecules with no internal signal that it has done so.",
      minutes: 12,
    },

    {
      title: "Exp 2 — optimise, then look at what it cost",
      goal: "Experience the trade-off that defines real drug design.",
      actions: [
        "Open **Exp 2: Optimise, and trade off**. Two objectives are set: drug-likeness, and staying small.",
        "Press **Run**. A genetic algorithm evaluates several hundred molecules in well under a second.",
        "Read the progress chart: best and average score per generation, with your starting molecule as a dashed baseline.",
        "Look at the **Pareto front** table underneath. Nothing on it is beaten by anything else on every objective at once.",
        "Now set **Lipophilicity** to ×3 and everything else to 0, and run again.",
        "Compare the champion's properties to the previous run's.",
      ],
      expect:
        "Push greasiness alone and the winner comes back large and greasy with its drug-likeness collapsed. Nothing malfunctioned — you asked for exactly that.",
      why: "Every property you leave out of the objective is a property you have implicitly agreed to sacrifice. Potency on its own is comparatively easy to optimise; potency together with solubility, safety, metabolic stability and something a chemist can actually build is a different problem, and that is why most candidates fail late.",
      minutes: 14,
    },

    {
      title: "Consolidate, then check yourself",
      goal: "Close any gaps and confirm what stuck.",
      actions: [
        "Open **Reference** and read **Where the numbers come from** — it labels every figure in the lab as exact, published, an estimate or a stand-in.",
        "Ask the **AI tutor** about anything that did not land. It knows how this lab computes what it computes.",
        "Take **Check your understanding**: ten questions, each explained as soon as you answer it.",
      ],
      expect:
        "A score with an explanation for every question, and a note of which exercise the ones you missed came from.",
      why: "The distinction the Reference section labours — measured, calculated, predicted — is the habit the subject actually requires. Confusing a prediction for a measurement is how programmes spend years on molecules that were never going to work.",
      minutes: 10,
    },
  ],

  troubleshooting: [
    {
      problem: "A SMILES string I know is correct will not parse.",
      fix: "Read the message: it names the character that broke and puts a caret under it. Usual causes are an unpaired ring digit, or an aromatic ring typed in capitals (benzene is `c1ccccc1`, not `C1CCCCC1`). Copying out of a PDF often brings invisible characters with it — the lab will say so, but retyping by hand is quicker.",
    },
    {
      problem: "The 3D view is blank, or says WebGL would not start.",
      fix: "The viewer needs WebGL. Turn on hardware acceleration, or use a desktop browser. Everything else — parsing, properties, generation, optimisation — works without it.",
    },
    {
      problem: "The morphing intermediates in Exp 1 are nonsense. Is the lab broken?",
      fix: "No, that is the result. Exp 1 exists to show that blending two SMILES strings mostly produces text that is not chemistry. Compare it with the map route beside it — that is the comparison the exercise is built on.",
    },
    {
      problem: "cLogP does not match the value I looked up.",
      fix: "It will not always. cLogP here is a fitted estimate, typically within about half a log unit of a measured value. Molecular weight, ring counts and polar surface area will match published values exactly; those are computed rather than predicted. The Reference section lists which is which.",
    },
    {
      problem: "Lab 3 returned fewer candidates than I asked for.",
      fix: "In enforced mode it only returns molecules that satisfy every constraint, and a tight specification can use up the sample budget first. Widen a range, or switch to encouraged mode to see the near misses.",
    },
    {
      problem: "The AI tutor says it is unavailable.",
      fix: "The tutor is the one part that needs an API key, configured per deployment. Nothing else depends on it: the five exercises run entirely in your browser. The Reference section covers the same material in writing.",
    },
    {
      problem: "My progress ticks disappeared.",
      fix: "Progress is kept in your browser only. Private browsing or clearing site data resets it. It is a convenience for finding your place, not a record of anything.",
    },
  ],

  furtherReading: [
    { label: "Daylight — the SMILES specification", href: "https://www.daylight.com/dayhtml/doc/theory/theory.smiles.html" },
    { label: "RDKit — the open-source cheminformatics toolkit", href: "https://www.rdkit.org/" },
    { label: "Gómez-Bombarelli et al. — molecules in a continuous latent space", href: "https://pubs.acs.org/doi/10.1021/acscentsci.7b00572" },
    { label: "Ertl, Rohde & Selzer — the polar surface area method this lab uses", href: "https://pubs.acs.org/doi/10.1021/jm000942e" },
    { label: "Bickerton et al. — quantifying drug-likeness", href: "https://www.nature.com/articles/nchem.1243" },
  ],
};

export default guide;

/**
 * The homepage lab gallery: one card per laboratory, each with a short
 * description and a recorded clip of the lab actually running.
 *
 * `blurb` is the lab's own `summary.tagline`, copied verbatim from its guide
 * module rather than rewritten here. If a tagline changes there, change it
 * here too — a second, drifting description of the same lab is worse than no
 * description.
 *
 * `media` names a file in `public/labs/`. It is null until someone records
 * that lab, and a null card renders a plain frame saying so instead of a
 * stand-in picture: the one thing this page must not do is imply a lab looks
 * like something it does not.
 *
 * On format — `.mp4` and `.webm` are preferred over `.gif` and the component
 * handles all three. A 10-second screen capture is roughly 400 kB as H.264
 * and 6-12 MB as a GIF, because GIF has no interframe compression and caps at
 * 256 colours, which wrecks a screen recording of a chart. Thirteen GIFs on
 * one page is on the order of 100 MB; the same thirteen as MP4 is about 5 MB.
 */
export type LabPreview = {
  /** Must match `Lab.slug`, so the card links to the right guide. */
  slug: string;
  name: string;
  /** Verbatim `summary.tagline` from `src/content/labs/<slug>.ts`. */
  blurb: string;
  /** Filename in `public/labs/`, e.g. "micro-ai.mp4". Null until recorded. */
  media: string | null;
  /** Poster frame for a video, e.g. "micro-ai.jpg". Optional. */
  poster?: string;
};

export const LAB_PREVIEWS: LabPreview[] = [
  {
    slug: "metamaterials",
    name: "Pioneering Acoustic Metamaterials",
    blurb:
      "Design a lattice that blocks sound by its shape rather than its thickness — and check a printer could actually make it.",
    media: "metamaterials.mp4",
    poster: "metamaterials.jpg",
  },
  {
    slug: "micro-ai",
    name: "MicrobeAI BioLab",
    blurb:
      "Read the DNA of a whole microbial community, then run the digester those microbes live in and watch what makes it fail.",
    media: "micro-ai.mp4",
    poster: "micro-ai.jpg",
  },
  {
    slug: "drugdiscovery-ai",
    name: "RepurposeAI: Drug Discovery Lab",
    blurb: "Explore how existing medicines can be studied for new therapeutic uses.",
    media: "drugdiscovery-ai.mp4",
    poster: "drugdiscovery-ai.jpg",
  },
  {
    slug: "virtual-ai",
    name: "XRD Virtual Laboratory",
    blurb:
      "Run a full diffraction experiment end to end: prepare a specimen, acquire a pattern point by point, analyse it, then defend your conclusion against the hidden truth.",
    media: null,
  },
  {
    slug: "omicslab",
    name: "OmicsLab Pro",
    blurb:
      "Analyse real single-cell and spatial transcriptomics data the way a lab does: a versioned pipeline, your own interpretation, and a report that shows its working.",
    media: null,
  },
  {
    slug: "logiclab",
    name: "LogicLab AI",
    blurb:
      "Describe a chip in plain English, get working Verilog back, and learn to read what it produced.",
    media: null,
  },
  {
    slug: "fraudshield",
    name: "FraudShield AI Lab",
    blurb:
      "Score live transactions for fraud, tune the threshold, then attack your own detector to see how it breaks.",
    media: "fraudshield.mp4",
    poster: "fraudshield.jpg",
  },
  {
    slug: "smartfactory-ai",
    name: "SmartFactory AI",
    blurb:
      "Find the bottleneck on a production line, predict a breakdown before it happens, and work out what the fix is worth.",
    media: "smartfactory-ai.mp4",
    poster: "smartfactory-ai.jpg",
  },
  {
    slug: "denovo-genai-lab",
    name: "Denovo GenAI Lab",
    blurb:
      "Design a molecule that has never existed — and find out exactly where the AI stops being trustworthy.",
    media: "denovo-genai-lab.mp4",
    poster: "denovo-genai-lab.jpg",
  },
  {
    slug: "battery-ai",
    name: "Battery Circularity AI",
    blurb:
      "Decide what happens to a retired EV battery: a second life powering something else, or the shredder.",
    media: "battery-ai.mp4",
    poster: "battery-ai.jpg",
  },
  {
    slug: "ai-6g",
    name: "AI for 6G",
    blurb:
      "The three ideas behind 6G — smart surfaces, sending meaning instead of bits — each with a simulator you can push until it fails.",
    media: "ai-6g.mp4",
    poster: "ai-6g.jpg",
  },
  {
    slug: "cognicore-ai",
    name: "Cognicore AI",
    blurb:
      "Summarise a contract, compare two drafts, and search a whole pile of documents by meaning rather than keyword.",
    media: "cognicore-ai.mp4",
    poster: "cognicore-ai.jpg",
  },
  {
    slug: "ai-program-navigator",
    name: "AI Program Navigator",
    blurb:
      "Not sure where to start? Describe your background and get a route through the catalogue built for you.",
    media: null,
  },
];

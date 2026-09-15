/**
 * Suggested search keywords for each lab, offered as one-click chips in the
 * blog editor and used for the per-lab coverage table on /admin/blog.
 *
 * They are derived from what each lab's guide in `src/content/labs` says it
 * teaches — not from search-volume data, which this repository has no source
 * for. Treat them as a starting list: check real query volume and competition
 * in Google Search Console or a keyword tool before building a series around
 * one, and edit this file when the data says otherwise.
 *
 * Every phrase belongs to exactly one lab. Two labs' posts chasing the same
 * phrase would compete with each other instead of with other sites.
 */
export type LabKeywords = {
  /** The broad topic a pillar post for this lab should target. */
  pillar: string;
  /** Narrower, longer phrases — each one a candidate for a post of its own. */
  related: string[];
};

export const LAB_KEYWORDS: Record<string, LabKeywords> = {
  "ai-6g": {
    pillar: "AI in 6G networks",
    related: [
      "intelligent reflecting surface",
      "reconfigurable intelligent surface simulation",
      "semantic communication",
      "joint source-channel coding",
      "6G wireless technology explained",
      "6G projects for engineering students",
    ],
  },
  "ai-program-navigator": {
    pillar: "AI learning path",
    related: [
      "AI career roadmap",
      "resume skill gap analysis",
      "how to choose an AI course",
      "personalised learning path",
      "AI skills for career switchers",
    ],
  },
  "battery-ai": {
    pillar: "EV battery second life",
    related: [
      "EV battery recycling",
      "battery state of health estimation",
      "lithium-ion battery circular economy",
      "capacity fade and internal resistance",
      "second-life battery energy storage",
      "battery recycling process simulation",
    ],
  },
  "cognicore-ai": {
    pillar: "AI document analysis",
    related: [
      "AI contract summarisation",
      "semantic search for documents",
      "AI document comparison",
      "legal document AI",
      "financial report analysis with AI",
      "LLM hallucinations in document review",
    ],
  },
  "denovo-genai-lab": {
    pillar: "generative AI drug design",
    related: [
      "de novo molecule generation",
      "SMILES notation explained",
      "chemical space visualisation",
      "AI in drug discovery for beginners",
      "molecular property trade-offs",
      "validating AI-generated molecules",
    ],
  },
  "drugdiscovery-ai": {
    pillar: "drug repurposing with AI",
    related: [
      "biomedical knowledge graph",
      "knowledge graph embeddings",
      "link prediction for drug discovery",
      "Hetionet",
      "network medicine",
      "repurposing hypothesis generation",
    ],
  },
  fraudshield: {
    pillar: "AI fraud detection",
    related: [
      "transaction anomaly detection",
      "phishing email detection",
      "fraud detection threshold tuning",
      "adversarial attacks on fraud models",
      "deepfake identity verification",
      "voice verification spoofing",
    ],
  },
  logiclab: {
    pillar: "learn Verilog",
    related: [
      "Verilog testbench generation",
      "VHDL for beginners",
      "AI for hardware description languages",
      "blocking vs non-blocking assignment",
      "FPGA design for beginners",
      "clock domain crossing",
    ],
  },
  metamaterials: {
    pillar: "acoustic metamaterials",
    related: [
      "sound absorbing lattice design",
      "acoustic bandgap",
      "Bragg vs resonance bandgap",
      "3D printed acoustic metamaterial",
      "lightweight noise control materials",
      "absorption spectrum analysis",
    ],
  },
  "micro-ai": {
    pillar: "metagenomics analysis",
    related: [
      "microbial community profiling",
      "sequencing read quality control",
      "anaerobic digestion microbiology",
      "biogas digester simulation",
      "relative abundance in metagenomics",
      "mock community benchmarking",
    ],
  },
  omicslab: {
    pillar: "single-cell RNA-seq analysis",
    related: [
      "spatial transcriptomics",
      "scRNA-seq quality control",
      "cell clustering and annotation",
      "differential expression analysis",
      "batch effect in single-cell data",
      "reproducible bioinformatics pipeline",
    ],
  },
  "smartfactory-ai": {
    pillar: "predictive maintenance",
    related: [
      "digital twin manufacturing",
      "production line bottleneck analysis",
      "vibration analysis for failure prediction",
      "preventive vs predictive maintenance",
      "G-code explained",
      "CNC machining simulation",
    ],
  },
  "virtual-ai": {
    pillar: "X-ray diffraction analysis",
    related: [
      "virtual XRD lab",
      "Scherrer equation crystallite size",
      "Williamson-Hall plot",
      "Bragg's law explained",
      "powder XRD pattern interpretation",
      "XRD background subtraction",
    ],
  },
};

export function labKeywords(slug: string | null | undefined): LabKeywords | null {
  if (!slug) return null;
  return LAB_KEYWORDS[slug] ?? null;
}

import InteractiveLabGallery, { type ShowcaseLab } from "@/components/interactive-lab-gallery";

/**
 * Public homepage projects, mirroring the current active catalogue entries.
 *
 * Order, names, subjects and `/labs/<slug>` routes are the catalogue's own and
 * are not restated or rewritten here.
 */
const LABS: ShowcaseLab[] = [
  { slug: "metamaterials", name: "Pioneering Acoustic Metamaterials", subject: "Materials", kind: "lattice", src: "/labs/metamaterials.8c99e225.jpg" },
  { slug: "micro-ai", name: "MicrobeAI Lab", subject: "Biology", kind: "microbes", src: "/labs/micro-ai.0ec11f8b.jpg" },
  { slug: "drugdiscovery-ai", name: "RepurposeAI: Drug Discovery Lab", subject: "Biology", kind: "molecule", src: "/labs/drugdiscovery-ai.5f1f39da.jpg" },
  { slug: "virtual-ai", name: "XRD Virtual Laboratory", subject: "Physics", kind: "diffraction", src: "/labs/virtual-ai.82c2a62d.jpg" },
  { slug: "omicslab", name: "OmicsLab Pro", subject: "Biology", kind: "omics", src: "/labs/omicslab.9a645e33.jpg" },
  { slug: "logiclab", name: "LogicLab AI", subject: "Electronics", kind: "logic", src: "/labs/logiclab.32701fc0.jpg" },
  { slug: "fraudshield", name: "FraudShield AI Lab", subject: "Security", kind: "fraud", src: "/labs/fraudshield.ee467982.jpg" },
  { slug: "smartfactory-ai", name: "SmartFactory AI", subject: "Engineering", kind: "factory", src: "/demos/smartfactory-ai.jpg" },
  { slug: "denovo-genai-lab", name: "Denovo GenAI Lab", subject: "Computer Science", kind: "genai", src: "/labs/denovo-genai-lab.9d533526.jpg" },
  { slug: "battery-ai", name: "Battery Circularity AI", subject: "Engineering", kind: "battery", src: "/labs/battery-ai.1f25baae.jpg" },
  { slug: "ai-6g", name: "AI For 6G Experimental Learning", subject: "Electronics", kind: "sixg", src: "/labs/ai-6g.41186ec2.jpg" },
  { slug: "cognicore-ai", name: "Cognicore AI", subject: "Computer Science", kind: "cognicore", src: "/labs/cognicore-ai.986765af.jpg" },
  { slug: "ai-program-navigator", name: "Live-Lab Learning: AI Program Navigator", subject: "Computer Science", kind: "navigator", src: "/demos/ai-program-navigator.jpg" },
];

export default function LabCatalogGallery() {
  return <InteractiveLabGallery labs={LABS} />;
}

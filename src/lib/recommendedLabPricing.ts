/** Recommended prices from the Live Labs pricing brief, stored in minor units. */
export const RECOMMENDED_LAB_PRICING: Record<string, { priceMinor: number; currency: "USD" }> = {
  "ai-6g": { priceMinor: 14900, currency: "USD" },
  logiclab: { priceMinor: 9900, currency: "USD" },
  "cognicore-ai": { priceMinor: 9900, currency: "USD" },
  "micro-ai": { priceMinor: 29900, currency: "USD" },
  "denovo-genai-lab": { priceMinor: 39900, currency: "USD" },
  "drugdiscovery-ai": { priceMinor: 49900, currency: "USD" },
  "battery-ai": { priceMinor: 29900, currency: "USD" },
  "virtual-ai": { priceMinor: 29900, currency: "USD" },
  omicslab: { priceMinor: 49900, currency: "USD" },
  metamaterials: { priceMinor: 39900, currency: "USD" },
  fraudshield: { priceMinor: 19900, currency: "USD" },
};

export const DEFAULT_LAB_PRICING = { priceMinor: 49900, currency: "INR" } as const;

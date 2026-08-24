/**
 * Shape shared by every legal document on the platform.
 *
 * The documents are data rather than markup so that a reviewer — ours or a
 * payment gateway's — can diff them against the operator's published source
 * without reading through JSX, and so that all four render identically.
 */
export type LegalSection = {
  heading: string;
  /** Rendered in order, before any bullets. */
  paragraphs?: string[];
  bullets?: string[];
  /** Rendered after the bullets, for a clause that closes a list. */
  closing?: string[];
};

export type LegalDocument = {
  title: string;
  /** Shown under the title. A constant per document — never `new Date()`. */
  lastUpdated: string;
  intro: string[];
  sections: LegalSection[];
  /** Optional version marker where the operator publishes one. */
  version?: string;
};

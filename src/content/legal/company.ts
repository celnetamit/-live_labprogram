/**
 * Who operates this platform, in the words the operator publishes elsewhere.
 *
 * A payment gateway reconciles three things before it will settle: the name on
 * the merchant registration, the name in the policies, and the contact a
 * customer can actually reach. These constants exist so those three never drift
 * apart across pages — every legal document on the hub reads from here.
 *
 * Taken from nanoschool.in, which the same company operates.
 */
export const COMPANY = {
  /** The merchant of record. NSTC is the academic partner, not the merchant. */
  legalName: "IT Break Com Private Limited",
  shortName: "IT Break Com Pvt Ltd",
  academicPartner: "NSTC (Nano Science & Technology Consortium)",
  email: "info@nstc.in",
  phones: ["+91-9958161117", "+91-120-4781217", "+91-120-4781213"],
  /** Start of the copyright range shown on the operator's own site. */
  copyrightFrom: 2005,
} as const;

/**
 * The date this text was last edited — deliberately a constant.
 *
 * Rendering `new Date()` here would make the document claim a revision on every
 * page load, which is worse than no date at all: it tells a reader the policy
 * changed when it did not. Update this line when you update the policy, and
 * only then.
 */
export const LEGAL_LAST_UPDATED = "24 August 2026";

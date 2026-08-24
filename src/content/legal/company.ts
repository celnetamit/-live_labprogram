/**
 * Who operates this platform, in the words and figures the operator publishes.
 *
 * A payment gateway reconciles several things before it will settle: the name
 * on the merchant registration, the name in the policies, the registered
 * address, the statutory identifiers, and a contact a customer can actually
 * reach. These constants exist so those never drift apart across pages — every
 * legal document on the hub reads from here.
 *
 * Transcribed from nanoschool.in, which the same company operates:
 * nanoschool.in/contact-us/ for the registered address and identifiers,
 * nanoschool.in/disclaimer/ for the operational address.
 */
export const COMPANY = {
  /** The merchant of record. NSTC is the academic partner, not the merchant. */
  legalName: "IT Break Com Private Limited",
  shortName: "IT Break Com Pvt Ltd",
  academicPartner: "NSTC (Nano Science & Technology Consortium)",

  /** As published on the operator's Contact Us page. */
  registeredAddress: "LGF, 40 National Park, Lajpat Nagar IV, New Delhi – 110024",
  /** As published on the operator's Disclaimer page. */
  operationalAddress: "A 118, Level I, Sector 63, Noida, Uttar Pradesh – 201301, India",

  /* Statutory identifiers. A gateway checks these against the merchant's
   * registration; they are already public on the operator's own site. */
  cin: "U74899DL2001PTC109327",
  gstin: "09AAACI8666D2ZD",
  pan: "AAACI8666D",

  email: "info@nstc.in",
  enrolmentEmail: "trainings@nstc.in",
  phones: ["+91-9958161117", "+91-120-4781217", "+91-120-4781213"],
  primaryPhone: "+91-9958161117",
  /* The operator's Contact Us page states Monday to Saturday for enrolment
   * enquiries; its Disclaimer footer says Mon–Sun. The dedicated contact page
   * is taken as authoritative here. */
  supportHours: "Monday to Saturday, 9:00 AM to 5:30 PM IST",

  /** Start of the copyright range shown on the operator's own site. */
  copyrightFrom: 2005,
} as const;

/**
 * The date each document was last edited here — deliberately a constant.
 *
 * Rendering `new Date()` would make a document claim a revision on every page
 * load, which is worse than no date: it tells a reader the policy changed when
 * it did not. Update this when you update the text, and only then.
 */
export const LEGAL_LAST_UPDATED = "24 August 2026";

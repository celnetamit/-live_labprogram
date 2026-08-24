import { COMPANY } from "./company";

/**
 * The operator's published privacy policy, reproduced from nanoschool.in.
 *
 * This is a transcription, not a composition. The gateway that clears payments
 * on this platform compares the policy against the merchant's registration, so
 * the wording, the section order and the named contact all have to match what
 * the company already publishes. The only edits are to the site name — a policy
 * that names the wrong website is precisely what fails that comparison — and a
 * closing section describing what this platform in particular stores, which the
 * generic text could not cover.
 *
 * The same document is served inside MicrobeAI BioLab and the other labs, so a
 * learner sees one policy wherever they happen to be standing.
 */
export type LegalSection = {
  heading: string;
  /** Rendered as paragraphs, in order, before any bullets. */
  paragraphs?: string[];
  bullets?: string[];
};

export const PRIVACY_INTRO = `live-labs.org is owned by ${COMPANY.legalName} with ${COMPANY.academicPartner} as an academic knowledge partner. We are committed to protecting your privacy and keeping your personal information secure. This Privacy Policy explains how we collect, use, and disclose information about you when you visit our website or use our services, including the laboratories reached from your account.`;

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "Information We Collect",
    paragraphs: [
      "We collect information from you when you register on our website, place an order, subscribe to our course, training program, workshop or any virtual or physical event, respond to a survey or fill out a form. When ordering or registering on our site, as appropriate, you may be asked to enter your name, email address, mailing address, phone number information.",
    ],
  },
  {
    heading: "How We Use Your Information",
    paragraphs: ["We use the information we collect from you in the following ways:"],
    bullets: [
      "To personalize your experience",
      "To improve our website",
      "To improve customer service",
      "To process transactions",
      "To administer a contest, promotion, survey or other site feature",
      "To send periodic emails regarding your order or other products and services",
    ],
  },
  {
    heading: "How We Protect Your Information",
    paragraphs: [
      "We take the security of your personal information seriously and use a variety of security technologies and procedures to help protect your personal information from unauthorized access, use or disclosure. We also use secure encryption technology (SSL) to protect your credit card information during transmission.",
    ],
  },
  {
    heading: "Disclosure of Your Information",
    paragraphs: [
      "We may disclose your personal information to third-party service providers who perform services on our behalf, such as payment processing, email marketing, and website analytics. We may also disclose your information in response to a court order or other legal obligation, or to protect our rights, property, or safety, or the rights, property, or safety of others.",
    ],
  },
  {
    heading: "Your Choices",
    paragraphs: [
      "You may opt-out of receiving marketing emails from us at any time by clicking the “unsubscribe” link at the bottom of any email. Please note that even if you opt-out of receiving marketing emails, we may still send you emails regarding your order or other products and services.",
    ],
  },
  {
    heading: "Updates to This Privacy Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect changes to our information practices. We encourage you to review this page periodically for the latest information on our privacy practices.",
    ],
  },
  {
    heading: "Contact Us",
    paragraphs: [
      `If you have any questions or concerns about this Privacy Policy, please contact us at ${COMPANY.email}, or by telephone on ${COMPANY.phones.join(", ")}.`,
    ],
  },
  {
    /*
     * Not part of the transcribed text. It is here because this platform holds
     * something nanoschool.in does not — saved laboratory work — and a reader
     * is entitled to know that before they start, not after.
     */
    heading: "What the Laboratories Store",
    paragraphs: [
      "The laboratories you open from your dashboard save your work against your account, so that a project started on one device is there when you sign in from another. A saved project holds the sample names you chose, the parameters you set and the results the laboratory computed. You can delete any saved project from within the laboratory that created it, and deleting it removes it from our servers.",
      "Data files you load into a laboratory — sequence files, measurement tables and the like — are read inside your browser and are not uploaded to us. Preferences such as your chosen mode, tutorial progress and interface settings are held in your browser’s own storage, kept separately for each account signed in on that browser, and can be erased from the laboratory’s settings screen.",
    ],
  },
];

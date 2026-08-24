import { COMPANY, LEGAL_LAST_UPDATED } from "./company";
import type { LegalDocument } from "./types";

/**
 * The operator's Disclaimer, transcribed from nanoschool.in/disclaimer/.
 *
 * Reproduced in the operator's wording. "this website" is read as live-labs.org
 * and the laboratories reached from it. The operator's own AI-content clause is
 * kept and extended to cover the laboratories' generated commentary, which is
 * the same concern applied to this platform's actual output.
 */
export const DISCLAIMER: LegalDocument = {
  title: "Disclaimer",
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: [
    `The information contained in this website is for general information purposes only. The information is provided by Live Labs (owned and managed by ${COMPANY.legalName}) hereby referred as “Company” and while we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is therefore strictly at your own risk.`,
  ],
  sections: [
    {
      heading: "Liability",
      paragraphs: [
        "In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arise out of, or in connection with, the use of this website.",
      ],
    },
    {
      heading: "External Links",
      paragraphs: [
        "Through this website you are able to link to other websites which are not under the control of Company. We have no control over the nature, content and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.",
      ],
    },
    {
      heading: "Availability",
      paragraphs: [
        "Every effort is made to keep the website up and running smoothly. However, Company takes no responsibility for, and will not be liable for, the website being temporarily unavailable due to technical issues beyond our control.",
      ],
    },
    {
      heading: "Use of AI Tools in Content",
      paragraphs: [
        "Some of the content published on this website is created with the assistance of Artificial Intelligence (AI) tools. While efforts are made to review and edit the content for accuracy and appropriateness, there may still be instances where unintended, unnecessary, or unverified information or claims appear.",
        "Readers are advised to use their discretion while interpreting the content. The primary purpose of using AI-generated content is to provide our audience with the most recent, diverse, and wide-ranging information on various topics. The content is intended to inform and engage, not to mislead.",
        "All external links included are intended to guide users to real and authentic workshops, programs, or resources. The information presented through those links is curated and verified to the best of our knowledge.",
        "This disclaimer is meant to inform visitors about the use of AI in content creation, acknowledge potential limitations in content accuracy, and encourage informed and responsible reading.",
      ],
    },
    {
      /*
       * Specific to this platform rather than transcribed. A learner reading a
       * confident paragraph next to a number needs to know which of the two the
       * platform stands behind.
       */
      heading: "Simulated Results and Generated Commentary",
      paragraphs: [
        "The laboratories on this platform compute their results from published models and stated assumptions. A computed value is the output of a model, not a measurement, and it carries the error of that model. Figures, predictions, scores and reports produced in a laboratory are teaching material and must not be relied upon for scientific, medical, safety, financial or commercial decisions.",
        "Where a laboratory uses an AI model to explain a result in words, that explanation is generated text and may be incomplete or wrong. It never determines the numbers. Where the two disagree, the computed result and the method that produced it are authoritative, and the explanation should be disregarded.",
      ],
    },
  ],
};

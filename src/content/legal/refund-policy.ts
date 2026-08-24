import { COMPANY, LEGAL_LAST_UPDATED } from "./company";
import type { LegalDocument } from "./types";

/**
 * The operator's Refund, Cancellation, Rescheduling & Grievance Policy,
 * transcribed from nanoschool.in/return-refund-cancellation/ (Policy Version
 * 3.0). This is the document a payment gateway scrutinises hardest, and the one
 * a customer is quoted back during a chargeback, so every commitment in it —
 * the 72-hour window, the five business days, the seven business days to
 * initiate, the 48-hour acknowledgement, the twelve-month credit — is the
 * operator's own figure and is reproduced unchanged.
 *
 * One adaptation, and it is substantive. The source policy hinges on "once the
 * first live session begins", which is the right trigger for a mentor-led
 * workshop and never occurs for a laboratory subscription bought on this
 * platform. The platform sells both, so the live-session clauses are kept
 * verbatim for programs and workshops, and the equivalent trigger for
 * laboratory access — opening the purchased laboratory — is stated alongside
 * them. Leaving that unstated would have produced a policy whose central
 * condition could never be met, which helps neither a reviewer nor a customer.
 */
export const REFUND_POLICY: LegalDocument = {
  title: "Refund, Cancellation, Rescheduling & Grievance Policy",
  lastUpdated: LEGAL_LAST_UPDATED,
  version: "Policy Version 3.0",
  intro: [
    `Live Labs — operated by ${COMPANY.legalName}. Applicable to Indian and International Participants.`,
    "Live Labs provides access to simulation laboratories, together with virtual workshops, courses, certification programs and mentor-led learning experiences delivered by industry experts and subject matter specialists.",
    "Depending on the selected purchase, registration may include laboratory access, live sessions, hands-on activities, recorded lectures, study materials, practical resources, mentor guidance and certification.",
    "Please review the following policy carefully before completing your registration and payment.",
  ],
  sections: [
    {
      heading: "1. Cancellation Before Access Begins",
      paragraphs: ["A full change-of-mind refund may be requested if the written request is received:"],
      bullets: [
        "Within 72 hours of successful payment, OR",
        "At least 5 full Business Days before the scheduled start date.",
      ],
      closing: [
        "Provided that, for a program or workshop, the first live session has not started, and paid recordings or restricted digital content have not been accessed.",
        "For a laboratory subscription, provided that the purchased laboratory has not been opened and no paid laboratory feature has been used.",
      ],
    },
    {
      heading: "2. Once Access Has Begun",
      paragraphs: [
        "Once the first live session begins — or, for a laboratory subscription, once the purchased laboratory has been opened — a change-of-mind refund is not available.",
        "This includes:",
      ],
      bullets: [
        "Attending only Day 1 or part of a session.",
        "Joining late.",
        "Missing later sessions.",
        "Personal or professional scheduling conflicts.",
        "Participant-side internet or device issues.",
        "Deciding not to continue.",
      ],
      closing: [
        "Once the first session begins, or the purchased laboratory is opened, delivery of the purchased educational service has commenced.",
      ],
    },
    {
      heading: "3. Access to Digital Content",
      paragraphs: [
        "Accessing paid recordings, presentations, study materials, notebooks, datasets, laboratory modes or other restricted digital resources constitutes use of the purchased learning content.",
        "After such access, a normal change-of-mind refund may no longer be available.",
      ],
    },
    {
      heading: "4. If the Refund Window Has Closed but Access Has Not Begun",
      paragraphs: ["The following remedies remain available:"],
      bullets: [
        "One-time transfer to the next available batch.",
        "Transfer to another suitable program or laboratory.",
        "Live Labs learning credit valid for 12 months.",
      ],
    },
    {
      heading: "5. Rescheduling by Live Labs",
      paragraphs: [
        "Minor timetable or operational changes do not automatically create a refund entitlement.",
        "Refund requests may be considered before attending the revised program if Live Labs makes a material change such as:",
      ],
      bullets: [
        "Start date moved by more than 7 calendar days.",
        "Start time changed by more than 4 hours.",
        "Live delivery converted to recorded-only delivery.",
        "Material removal of a core advertised module.",
        "Reduction of committed duration by more than 20%.",
      ],
    },
    {
      heading: "6. If Live Labs Cancels the Program",
      paragraphs: ["Where Live Labs cancels, the participant may choose:"],
      bullets: [
        "Full refund.",
        "Transfer to a rescheduled or comparable program.",
        "Learning credit of equal value.",
      ],
    },
    {
      heading: "7. Hands-On Workshops and Laboratories",
      paragraphs: ["Hands-on workshops and laboratory access may include:"],
      bullets: [
        "Mentor demonstrations",
        "Guided practical exercises",
        "Software and tool execution",
        "Code notebooks",
        "Datasets",
        "Precomputed examples",
        "Result analysis and interpretation",
      ],
      closing: [
        "Conceptual instruction may also be provided where required to support practical learning outcomes.",
      ],
    },
    {
      heading: "8. Service-Quality Complaints",
      paragraphs: [
        "Service-quality complaints are reviewed separately from change-of-mind refund requests.",
        "Examples include:",
      ],
      bullets: [
        "Core advertised topics materially omitted.",
        "Promised hands-on components omitted.",
        "Failure to provide joining credentials or laboratory access.",
        "Materially shorter delivery than committed.",
        "Missing recordings or materials.",
        "Repeated Live Labs-side technical failures.",
        "Program or laboratory materially different from the published description.",
      ],
      closing: [
        "Live Labs may review attendance records, access logs, recordings, curriculum, mentor materials and communication history before determining an appropriate resolution.",
      ],
    },
    {
      heading: "9. Teaching Style & Participant Preference",
      paragraphs: [
        "Differences in teaching style, mentor accent, pace, difficulty level, depth of explanation or participant preference do not automatically establish non-delivery when the program has been substantially delivered as advertised.",
      ],
    },
    {
      heading: "10. Recordings & Learning Materials",
      paragraphs: [
        "Where included in the purchased program, participants receive access to recordings and learning materials according to the program terms.",
        "All recordings and materials are for personal learning use only and must not be shared, redistributed, resold or published.",
      ],
    },
    {
      heading: "11. Refund Processing",
      bullets: [
        "Refunds are returned to the original payment method.",
        "Processed in the original transaction currency where possible.",
        "Initiated within 7 Business Days after approval.",
      ],
      closing: [
        "Final credit timing depends on the participant’s bank, card issuer or payment provider.",
      ],
    },
    {
      heading: "12. International Participants",
      paragraphs: [
        "The same complaint and grievance process is available to participants worldwide.",
        "International participants do not need an Indian bank account, address or mobile number to submit a complaint.",
      ],
    },
    {
      heading: "13. Submit a Request",
      paragraphs: [
        `Email: ${COMPANY.email}`,
        "Subject: Refund / Cancellation / Service Complaint — [Order ID]",
        "Please include:",
      ],
      bullets: [
        "Full Name",
        "Registered Email",
        "Program or Laboratory Name",
        "Order / Payment ID",
        "Payment Date",
        "Reason for Request",
        "Requested Resolution",
        "Supporting Evidence",
      ],
      closing: ["Requests are normally acknowledged within 48 hours."],
    },
    {
      heading: "Important — Please Read Before Payment",
      paragraphs: ["Please verify the following before registering:"],
      bullets: [
        "Workshop / Course / Laboratory Title",
        "Dates & Time Zone",
        "Duration",
        "Curriculum",
        "Hands-On Scope",
        "Prerequisites",
        "Software & Tools",
        "Recordings & Materials Included",
        "Certificate Conditions",
        "Refund & Cancellation Terms",
      ],
      closing: [
        "Once the first live session begins, or the purchased laboratory is opened, or paid digital content is accessed, a normal change-of-mind refund will no longer be available, subject to applicable service-quality and mandatory consumer rights.",
      ],
    },
  ],
};

/**
 * Shown at checkout as well as on the policy page. The operator publishes this
 * as a mandatory confirmation, so it belongs in front of the customer before
 * the payment, not only in the archive afterwards.
 */
export const CHECKOUT_CONFIRMATION =
  "I confirm that I have reviewed the program schedule, curriculum, delivery format, hands-on scope and Refund & Cancellation Policy. I understand that once the first live session begins, or I open the purchased laboratory, or I access paid digital content, a normal change-of-mind refund will no longer be available, subject to applicable service-quality and mandatory consumer rights.";

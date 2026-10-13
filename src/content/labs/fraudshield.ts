import type { LabGuide } from "./types";

/**
 * FraudShield AI Lab — https://fraudshield.live-labs.org/
 *
 * Navigation is a six-item sidebar (Curriculum, AI Labs, Assessments,
 * Intelligence, Resources, Lab Info); the hands-on work sits behind AI Labs as
 * eight tabs. The tutorial walks those tabs in the order they build on each
 * other, ending on the adversarial lab because it reframes everything before it.
 */
const guide: LabGuide = {
  slug: "fraudshield",

  summary: {
    tagline:
      "Score live transactions for fraud, tune the threshold, then attack your own detector to see how it breaks.",
    what: "Banks and payment networks cannot review every transaction by hand — there are billions of them — so they train models to flag the suspicious ones. This lab is a working fraud-detection bench: you score live transactions for anomalies, classify phishing emails, verify identity documents, match voices against enrolled samples, tune a model's decision threshold, and then attack your own detector to see how easily it breaks.",
    why: [
      "Fraud patterns change over time. A model that works well today may perform differently when customer behaviour or fraud methods change.",
      "Lowering a decision threshold may detect more fraud, but it can also create more false alerts for genuine customers — raising the threshold may reduce false alerts but allow more fraud to pass.",
      "This lab provides a safe setting in which to study these trade-offs without affecting a real payment system.",
    ],
    whoFor:
      "This advanced lab is suitable for data scientists, security analysts, fintech engineers, students, researchers, and risk teams. Learners should understand the basic purpose of a classifier and be familiar with precision and recall — previous experience in fraud detection is not required.",
    outcomes: [
      "Score transactions and identify the factors linked to each risk score.",
      "Read a confusion matrix and consider the financial cost of each type of error.",
      "Select a decision threshold based on fraud risk, customer impact, and review cost.",
      "Explain why model performance may change over time and how it can be monitored.",
      "Recognise common limitations of identity-image and voice checks.",
      "Test how a detector responds when transaction details change.",
    ],
  },

  /*
   * No designer's page for this lab: the showcase template, with copy drawn
   * only from this guide and checked against the app (Anomaly Detector,
   * phishing, identity and voice verification, threshold tuning and
   * `components/lab/AdversarialLab.tsx` all exist). Palette from the cover
   * of engraved wooden discs: the wood, the blue-grey slate beneath them, a
   * coral for the warning, and the cream of the grain, over charcoal.
   *
   * Rewritten again against the third "Live lab Profile content" brief (29
   * September 2026) — same family as MicrobeAI's and RepurposeAI's — carrying
   * its tutorial, outcomes, "why it matters", "who it is for", demo-chapter
   * labels and "What's Included in the Lab" list in verbatim. `intro` is the
   * brief's full top paragraph rather than a shortened one: the brief marks
   * it "[do not cut any words/sentences]", so it stays complete even though
   * it runs longer than this hero's usual one sentence.
   */
  showcase: {
    overline: "Fraud detection & security",
    title: [
      { text: "Fraud" },
      { text: "Shield", accent: "primary" },
      { text: "AI Lab", accent: "secondary", subtitle: true },
    ],
    headline: "Score it, tune it, then attack your own detector.",
    intro:
      "Explore how fraud-detection models assess transactions, respond to decision thresholds, and perform as fraud patterns change. Using prepared datasets and case examples, investigate transaction risk, phishing, identity-image consistency, voice signals, model performance, and transaction networks.",
    about: [
      "Banks and payment networks process more transactions than analysts can review manually. Fraud-detection models help identify cases that may require investigation.",
      "In this lab, you will score transactions, classify phishing emails, examine identity documents and voice samples, adjust decision thresholds, and test how the model responds when inputs change.",
    ],
    tags: ["Anomaly detection", "Phishing", "Biometrics", "Adversarial ML"],
    walkthroughTitle: "From a scored transaction to a hardened detector",
    journey: "FraudShield",
    card: {
      badge: "Interactive lab",
      icon: "analysis",
      description: "Score transactions for fraud, tune the threshold, then attack your own detector to see how it breaks.",
    },
    palette: {
      primary: { onDark: "#e6b57f", ink: "#975d1e" },
      secondary: { onDark: "#9fb6cf", ink: "#4a6e95" },
      action: { onDark: "#e8876a", ink: "#bd421d" },
      quiet: { onDark: "#e8dcc8", ink: "#846737" },
      cta: { onDark: "#e6b57f", ink: "#975d1e", text: "#1a1108" },
      level: "#e8876a",
      features: [
        { onDark: "#e6b57f", ink: "#975d1e" },
        { onDark: "#e8876a", ink: "#bd421d" },
        { onDark: "#9fb6cf", ink: "#4a6e95" },
        { onDark: "#e8dcc8", ink: "#846737" },
      ],
    },
    ground: {
      page: "#0c0e10",
      sidebar: "#0d0f11",
      surface: ["#181b1f", "#101215"],
      hero: "#14171a",
      scrim: "#0a0c0e",
      text: "#f4f2ee",
      muted: "#a5a8ad",
      copy: "#b4b6ba",
      soft: "#868a90",
    },
    features: [
      {
        icon: "analysis",
        title: "Anomaly scoring",
        body: "Score transactions and examine the factors associated with each risk score.",
      },
      {
        icon: "simulation",
        title: "Cost-aware thresholds",
        body: "Use a confusion matrix to select a threshold that reflects the cost of missed fraud and false alerts.",
      },
      {
        icon: "graph",
        title: "Identity and voice analysis",
        body: "Examine how image and voice manipulations affect the results of identity and biometric checks.",
      },
      {
        icon: "insight",
        title: "Robustness testing",
        body: "Test the model under changed conditions and identify areas where it may need improvement.",
      },
    ],
  },

  video: {
    url: "/demos/fraudshield.mp4",
    poster: "/demos/fraudshield.jpg",
    durationSec: 42,
    chapters: [
      { at: 0, label: "Curriculum and workshop structure" },
      { at: 4, label: "AI Labs: eight hands-on activities" },
      { at: 9, label: "Transaction Anomaly Detector" },
      { at: 17, label: "Phishing Email Classifier" },
      { at: 22, label: "Model Tuning Workbench: threshold trade-offs" },
      { at: 27, label: "Intelligence: trends and network graphs" },
      { at: 36, label: "Assessment and certification" },
    ],
  },

  prerequisites: [
    "**Transaction Scoring:** Score transactions and review the factors associated with each risk score.",
    "**Phishing Classification:** Compare malicious and legitimate messages and examine the evidence behind each result.",
    "**Identity Analysis:** Compare document and capture images for visual consistency and possible manipulation.",
    "**Voice Biometrics:** Compare voice samples and examine indicators of genuine, replayed, or synthetic audio.",
    "**Model Workbench (Intermediate):** Compare models, adjust decision thresholds, and observe changes in performance.",
    "**Typology Stress Test (Intermediate):** Replay six attack patterns against the detector and find which it handles worst.",
    "**Fraud Intelligence (Intermediate):** Review fraud trends, network relationships, and model health.",
    "**Assessment:** Complete knowledge questions and practical decision-making exercises.",
  ],

  steps: [
    {
      title: "Read the Curriculum",
      goal: "Understand how the workshop is organised before starting the hands-on work.",
      actions: [
        "Open Curriculum from the sidebar.",
        "Review the list of modules.",
        "Read the key terms before starting the practical work.",
      ],
      expect:
        "A clear outline of the workshop and its activities. Note the mode selector in the lab: steps 1 to 4 work in Basic, while steps 5, 6 and 7 use the Model Workbench, the Typology Stress Test and Fraud Intelligence, which are Intermediate surfaces.",
      why: "The curriculum explains how the different parts of the lab are connected. One ordering detail is worth knowing before you start: Intermediate unlocks after you have scored a batch of transactions (step 2) and completed the assessment (step 8), and then chosen to switch. Working strictly top to bottom therefore meets a locked panel at step 5, so take the assessment straight after step 2 if you want to continue without interruption.",
      minutes: 6,
    },
    {
      title: "Score Transactions",
      goal: "Score transactions and see how the model separates fraud from legitimate activity.",
      actions: [
        "Open AI Labs and select Transaction Anomaly Detector.",
        "Run the prepared transaction dataset.",
        "Select a transaction with a high risk score.",
        "Review its amount, location, device, and recent activity.",
        "Find one incorrect prediction and consider why it occurred.",
      ],
      expect: "Most transactions should have a low risk score. A smaller number should be marked for review.",
      why: "Fraud cases are less common than legitimate transactions. Accuracy alone may therefore give a misleading result.",
      minutes: 12,
    },
    {
      title: "Classify Phishing Messages",
      goal: "See how a text classifier separates malicious messages from legitimate ones.",
      actions: [
        "Open Phishing Email Classifier.",
        "Test the supplied malicious and legitimate messages.",
        "Review the wording, the links and the request in each message. The classifier reads the message body only — it has no sender, no Reply-To and no SPF, DKIM or DMARC result — so note what a header check would have told you that the text cannot.",
        "Edit one message and run the classifier again.",
      ],
      expect: "Small changes in the message may change its risk score.",
      why: "A text classifier looks for patterns in the message. It may make mistakes when legitimate and malicious messages contain similar language.",
      minutes: 10,
    },
    {
      title: "Examine Identity and Voice Samples",
      goal: "Test identity and voice verification against supplied samples.",
      actions: [
        "Open Identity Verification.",
        "Compare the supplied document and capture images.",
        "Note which changes are detected and which are missed.",
        "Open Voice Biometrics and test the supplied voice samples.",
        "Record your own sample only if you wish to do so.",
      ],
      expect: "The modules should show similarities, differences, and possible signs of manipulation.",
      why: "Image and voice checks can support an investigation, but they cannot prove a person's identity by themselves.",
      minutes: 14,
    },
    {
      /*
       * Mode requirement, stated where it bites.
       *
       * A reviewer following the steps in order was blocked here: the Model
       * Workbench and the stress test are Intermediate surfaces, and Intermediate
       * unlocks after a guided investigation (step 2) *and* an assessment (step
       * 8). Working through the list in order therefore walks into a locked door
       * at step 5. The fix is to say so before it happens rather than to leave
       * someone wondering whether the lab is broken.
       */
      title: "Adjust the Decision Threshold (needs Intermediate mode)",
      goal: "See how moving the decision threshold trades fraud detection against false alerts.",
      actions: [
        "Open Model Tuning Workbench.",
        "Lower the threshold and review the results.",
        "Raise the threshold and compare the results.",
        "Note the number of detected fraud cases, missed cases, and false alerts.",
        "Choose a threshold and explain your choice.",
      ],
      expect: "A lower threshold usually detects more fraud but creates more false alerts. A higher threshold usually reduces false alerts but misses more fraud.",
      why: "The threshold should reflect fraud risk, customer inconvenience, investigation work, and cost.",
      minutes: 15,
    },
    {
      title: "Test the Detector Against Attack Typologies (needs Intermediate mode)",
      goal: "Find which kinds of fraud the detector handles worst, and say what you would do about it.",
      actions: [
        "Open Typology Stress Test. It replays six attack patterns generated with a different seed from the training data.",
        "Read the per-typology detection rates — they are ordered worst-first.",
        "Expand the weakest typology and read its lowest-scoring case.",
        "Change the alert threshold and watch which typologies cross it; note that comparing two models at one threshold is not like-for-like, because each model's scores sit on its own scale.",
        "Decide what you would add to close the worst gap — a feature, a rule, or a review step.",
      ],
      expect:
        "Detection varies sharply by typology: account takeover is caught far more often than synthetic-identity bust-out, which looks like ordinary account growth until the final draw-down.",
      why: "An overall detection rate hides the typology an attacker will actually choose. This is a coverage test rather than an adversarial one — nothing here optimises against the model — so read it as what the detector has not been taught, not as what a motivated attacker would achieve.",
      minutes: 15,
    },
    {
      title: "Review Fraud Patterns (needs Intermediate mode)",
      goal: "Review fraud trends and the transaction network alongside individual scores.",
      actions: [
        "Open Intelligence from the sidebar.",
        "Review the fraud trend chart.",
        "Examine the transaction network.",
        "Look for accounts linked through shared devices, addresses, or merchants.",
        "Review the model-health information.",
      ],
      expect: "Some related activities may be easier to see in the network than in individual transactions.",
      why: "Transaction scores describe individual cases. Trends and networks provide additional information. A connection does not prove fraud.",
      minutes: 10,
    },
    {
      title: "Complete the Assessment",
      goal: "Check your understanding of the tools, results, and decision trade-offs.",
      actions: [
        "Open Assessments.",
        "Complete the questions and practical tasks.",
        "Use Resources if you need help with a topic.",
        "Try the assessment again if required.",
      ],
      expect: "The assessment checks your understanding of the tools, results, and decision trade-offs. Learners who meet the required score may receive a completion certificate.",
      minutes: 12,
    },
  ],

  troubleshooting: [
    {
      problem: "Voice Biometrics cannot hear anything.",
      fix: "Grant the browser microphone permission when prompted, then reload. If you declined earlier, clear the site permission in your browser's address-bar settings. The lab also ships sample recordings if no microphone is available.",
    },
    {
      problem: "The network graph or 3D model comparison is blank.",
      fix: "Both need WebGL. Enable hardware acceleration and use a desktop browser; the graph is also unusable on a narrow phone screen even when it renders.",
    },
    {
      problem: "An AI-backed lab returns an error instead of a result.",
      fix: "Those panels render in 3D and need WebGL, which some remote-desktop and locked-down browser configurations disable. Check that hardware acceleration is enabled, then reload. Nothing on those panels calls a language model — every figure in the labs is computed in your browser — so a missing AI provider is never the cause.",
    },
    {
      problem: "My tuned threshold looks perfect on the test data.",
      fix: "A threshold chosen by sweeping the split you then report from is the best of ninety-nine tries on those rows, not an estimate of what the next transaction will do. Choose it on the validation split and measure it once on test — the Model Workbench does this for you and shows the same threshold's validation and test figures side by side, so you can see what the discipline costs. Two further checks on any threshold that looks too good: the held-out split holds about a hundred fraud cases, so read the bootstrap interval under each figure before believing a difference, and the Typology Stress Test will show you which attack patterns that threshold still misses.",
    },
  ],

  furtherReading: [
    { label: "ACFE — Report to the Nations on occupational fraud", href: "https://www.acfe.com/" },
    { label: "NIST FRVT — face recognition vendor test results", href: "https://www.nist.gov/programs-projects/face-recognition-vendor-test-frvt" },
    { label: "OWASP Machine Learning Security Top 10", href: "https://owasp.org/www-project-machine-learning-security-top-10/" },
  ],
};

export default guide;

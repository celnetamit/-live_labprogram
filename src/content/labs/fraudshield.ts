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
    why: "Fraud detection is the rare machine-learning problem where the data actively fights back. Fraudsters adapt to your model within days, genuine customers get locked out of their own accounts when you tighten thresholds, and the cost of a false negative is nothing like the cost of a false positive. Learning to hold that trade-off deliberately — rather than optimising accuracy and hoping — is the actual professional skill, and it is very hard to practise on real production systems.",
    whoFor: "Data scientists, security analysts, fintech engineers and risk teams. It is the most advanced lab in the catalogue: you should already know what a classifier is, and be comfortable reading a precision/recall trade-off. No fraud-domain background is assumed.",
    outcomes: [
      "Score transactions for anomalies and explain which features drove each score",
      "Read a confusion matrix in money rather than percentages, and set a threshold that reflects real cost",
      "Explain why fraud models degrade in production and what monitoring catches it",
      "Identify the manipulations that defeat identity and voice verification",
      "Attack a detector you built and harden it against what you find",
    ],
  },

  video: {
    url: "/demos/fraudshield.mp4",
    poster: "/demos/fraudshield.jpg",
    durationSec: 42,
    chapters: [
      { at: 0, label: "Curriculum — how the workshop is laid out" },
      { at: 4, label: "AI Labs — the eight hands-on exercises" },
      { at: 9, label: "Transaction Anomaly Detector" },
      { at: 17, label: "Phishing Email Classifier" },
      { at: 22, label: "Model Tuning Workbench — the threshold trade-off" },
      { at: 27, label: "Intelligence — trends and network graphs" },
      { at: 36, label: "Assessments and certification" },
    ],
  },

  prerequisites: [
    "Familiarity with basic classification metrics — precision, recall, false positive rate",
    "A desktop browser; the network graph and 3D model comparison views need room and WebGL",
    "A microphone if you want to enrol your own voice in the Voice Biometrics lab (optional — sample recordings are provided)",
    "About 90 minutes for the full sequence, or 30 for the transaction lab alone",
  ],

  steps: [
    {
      title: "Read the curriculum before opening any lab",
      goal: "Understand the arc of the workshop so each exercise has somewhere to sit.",
      actions: [
        "Open **Curriculum** in the sidebar — it is the course outline plus an AI tutor.",
        "Skim the module list to see how the eight labs relate.",
        "Ask the tutor one question you already have, so you know how it behaves before you need it under time pressure.",
      ],
      expect: "A structured outline of the workshop and a responsive tutor panel.",
      why: "The labs are individually usable but deliberately sequenced: the tuning workbench only makes sense once you have felt a detector produce too many false positives, and the adversarial lab only lands once you have a model you feel ownership of.",
      minutes: 6,
    },
    {
      title: "Score transactions in the Anomaly Detector",
      goal: "Meet the core problem — separating rare fraud from overwhelming legitimate volume.",
      actions: [
        "Open **AI Labs** in the sidebar. It opens on the **Transaction Anomaly Detector** tab.",
        "Run the provided transaction stream and watch the risk scores populate.",
        "Pick one high-scoring transaction and read the contributing factors — amount, velocity, location mismatch, device novelty.",
        "Find a transaction with a high score that you judge to be genuine, and write down why the model got it wrong.",
      ],
      expect: "A scored transaction feed with a small number of high-risk items, each with an explanation of what drove the score.",
      why: "Fraud is heavily imbalanced — typically well under 1% of transactions. A model that predicts \"not fraud\" for everything is over 99% accurate and completely worthless, which is why accuracy is never the metric anyone uses here.",
      minutes: 12,
    },
    {
      title: "Classify phishing emails",
      goal: "See the same detection problem in text, where the adversary writes the input.",
      actions: [
        "Switch to the **Phishing Email Classifier** tab.",
        "Run the supplied examples and note which signals the classifier weights — sender mismatch, urgency language, link domains, credential requests.",
        "Edit a flagged email to make it read as legitimate while keeping its malicious intent, and re-run it.",
      ],
      expect: "Confident classifications on the obvious examples, and a measurable drop in confidence once you soften the urgency cues — often enough to slip below the threshold.",
      why: "Text classifiers key on surface signals that an attacker controls completely and can iterate against for free. This is your first direct experience of the adversarial dynamic the last lab formalises.",
      minutes: 10,
    },
    {
      title: "Work through Identity Verification and Voice Biometrics",
      goal: "Extend detection to documents and audio, where failure modes are physical rather than statistical.",
      actions: [
        "Open the **Identity Verification** tab and run the provided document checks.",
        "Note which manipulations the check catches and which it misses.",
        "Open **Voice Biometrics**, enrol a sample, then test matching and non-matching voices.",
      ],
      expect: "Verification decisions with confidence scores, and at least one manipulation that passes when you expected it to fail.",
      why: "Biometrics feel authoritative and are treated as such by users, but they are probabilistic like everything else — with the added problem that a compromised biometric cannot be reissued the way a password can.",
      minutes: 14,
    },
    {
      title: "Move the threshold in the Model Tuning Workbench",
      goal: "Turn an abstract trade-off into a number with a currency symbol in front of it.",
      actions: [
        "Open the **Model Tuning Workbench** tab.",
        "Set the decision threshold as low as it goes and read the confusion matrix: nearly all fraud caught, and a large block of genuine customers blocked.",
        "Raise it to the maximum and read it again: almost no false alarms, and most fraud through.",
        "Settle on the threshold you would actually deploy, and write down the assumed cost of a missed fraud versus a blocked genuine customer that justifies it.",
      ],
      expect: "A confusion matrix that moves continuously as you drag the threshold, with no setting that is good on both axes at once.",
      why: "There is no threshold that optimises both error types — moving one always worsens the other. The choice is a business decision about relative cost, not a technical one, and this is the step where that stops being a slogan.",
      minutes: 15,
    },
    {
      title: "Attack your own detector in the Adversarial Stress Lab",
      goal: "Find out how much effort it takes an adversary to defeat what you just tuned.",
      actions: [
        "Open the **Adversarial Stress Lab** tab.",
        "Take a transaction your model flags confidently and perturb it — split the amount, change the timing, route through a different device — until the score drops below your threshold.",
        "Count how many attempts it took.",
        "Return to the workbench and adjust your model in light of what you found.",
      ],
      expect: "You get a flagged transaction past your own detector, usually in a handful of attempts. That result is the intended one.",
      why: "Fraud models operate against an opponent who gets unlimited free tries and immediate feedback on whether an attempt worked. A model evaluated only on a static historical test set has never been tested against the thing it will actually face.",
      minutes: 15,
    },
    {
      title: "Review the Intelligence dashboards",
      goal: "See what the detector looks like from the operations side, over time.",
      actions: [
        "Open **Intelligence** in the sidebar.",
        "Work through the fraud trend chart, the transaction network graph and the model health monitor.",
        "On the network graph, look for accounts that connect to each other through shared devices or addresses.",
      ],
      expect: "Rings become visible as clusters in the network graph that were invisible when transactions were scored one at a time.",
      why: "Per-transaction scoring is blind to coordination. Organised fraud shows up in the relationships between accounts, which is why graph analysis sits alongside classification in every serious fraud stack.",
      minutes: 10,
    },
    {
      title: "Take the assessment",
      goal: "Confirm the trade-off reasoning has stuck, not just the tool operation.",
      actions: [
        "Open **Assessments** in the sidebar.",
        "Complete the quiz and the practical challenges.",
        "Use **Resources** to look up any concept you stumble on, then retry.",
      ],
      expect: "A completed assessment and, on a pass, a workshop certificate.",
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
      fix: "Those tabs call a language model through a gateway. Wait a moment and retry — transient upstream errors are the common cause. If it persists across labs, the workshop's provider key or gateway needs attention from the organiser.",
    },
    {
      problem: "My tuned threshold looks perfect on the test data.",
      fix: "That is a warning sign, not a result. Take it to the Adversarial Stress Lab — a threshold that looks perfect on a static set has usually been fitted to that set.",
    },
  ],

  furtherReading: [
    { label: "ACFE — Report to the Nations on occupational fraud", href: "https://www.acfe.com/" },
    { label: "NIST FRVT — face recognition vendor test results", href: "https://www.nist.gov/programs-projects/face-recognition-vendor-test-frvt" },
    { label: "OWASP Machine Learning Security Top 10", href: "https://owasp.org/www-project-machine-learning-security-top-10/" },
  ],
};

export default guide;

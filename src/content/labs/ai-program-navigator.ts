import type { LabGuide } from "./types";

/**
 * Live-Lab Learning: AI Program Navigator — https://aiprogram.live-labs.org/
 *
 * Views are CATALOG → DETAIL → LAB, with the Navigator as a modal and Profile,
 * Leaderboard and career tooling alongside. This is the meta-lab: it is the
 * tool for choosing which of the other labs to take, so the tutorial ends by
 * sending the learner into one.
 */
const guide: LabGuide = {
  slug: "ai-program-navigator",


  showcase: {
    overline: "Start here",
    title: [{ text: "Live-Lab Learning" }, { text: "Program Navigator", accent: "primary", subtitle: true }],
    headline: "The lab that helps you choose the other labs.",
    intro:
      "Describe your background and what you want to be able to do, and the navigator recommends a route through the catalogue — then shows the gap between your résumé and a target role before you commit to anything.",
    about: [
      "Rather than scrolling a catalogue and guessing, you say where you are starting from and what you want to be able to do, and the navigator proposes an order to work through.",
      "The commonest way technical training is wasted is starting in the wrong place — a workshop too advanced to follow, or one teaching what you already know. Choosing well needs an honest picture of what you can currently do and what the role you want actually demands. Making that assessment explicit is the point of this tool.",
    ],
    tags: ["Learning route", "Résumé gap analysis", "Career report", "Workshop comparison"],
    walkthroughTitle: "From where you are to which workshop comes first",
    journey: "Program Navigator",
    stats: [
      { kind: "steps", label: "Guided steps" },
      { kind: "walkthrough", label: "Walkthrough" },
      { kind: "handsOn", label: "Hands-on time" },
    ],
    card: {
      badge: "Start here",
      icon: "sequence",
      description:
        "Not sure where to start? Describe your background and get a route through the catalogue built for you.",
    },
    /* Sampled from the cover: the interface's own blue (#23477b, #4c80aa)
       carries it, with the warm brown of the desk and figure (#875b42) and the
       amber of the lit workshop behind (#98794f) as accents. `onDark` lifts
       each for the hero; `ink` darkens each to clear 4.5:1 on white. */
    palette: {
      primary: { onDark: "#5e9ad8", ink: "#1c4f8a" },
      secondary: { onDark: "#cf9469", ink: "#7a4a2c" },
      action: { onDark: "#d7dde3", ink: "#5c5a52" },
      quiet: { onDark: "#7fa8c4", ink: "#3a6480" },
      cta: { onDark: "#5e9ad8", ink: "#1c4f8a", text: "#04101c" },
      level: "#cf9469",
      features: [
        { onDark: "#5e9ad8", ink: "#1c4f8a" },
        { onDark: "#cf9469", ink: "#7a4a2c" },
        { onDark: "#7fa8c4", ink: "#3a6480" },
        { onDark: "#d7dde3", ink: "#5c5a52" },
      ],
    },
    ground: {
      page: "#0e1116",
      sidebar: "#0a0d11",
      surface: ["#181d25", "#0f1319"],
      hero: "#121820",
      scrim: "#080b0f",
      scrimStops: [97, 90, 46, 16, 84],
      text: "#f5f6f8",
      muted: "#a7adb6",
      copy: "#adb3bc",
      soft: "#7f858e",
    },
    /*
      Four claims, each one the guide already makes and each one checkable in
      the tutorial below: the route it builds, the gap it measures, the basis
      it compares workshops on, and the fact that it hands you off rather than
      being somewhere you stay.
    */
    features: [
      {
        icon: "sequence",
        title: "A route, not a list",
        body: "You describe your background and your goal, and the catalogue comes back ordered — with the reasoning for that order rather than a ranking.",
      },
      {
        icon: "analysis",
        title: "The gap, measured",
        body: "A résumé is compared against a target role so the missing skills are named, instead of being inferred from a course title.",
      },
      {
        icon: "insight",
        title: "Prerequisites, not titles",
        body: "Workshops are set side by side on what they assume and what they leave you able to do, which is where a title is least reliable.",
      },
      {
        icon: "graph",
        title: "It hands you off",
        body: "This is the meta-lab: once you have chosen, it launches the workshop directly. It is the starting point, not the destination.",
      },
    ],
  },

  summary: {
    tagline:
      "Not sure where to start? Describe your background and get a route through the catalogue built for you.",
    what: "This is the lab that helps you choose the other labs. Rather than scrolling a catalogue and guessing, you describe your background and what you want to be able to do, and the navigator recommends a route through the available workshops. It also analyses a résumé against a target role to find the gaps, produces a career report, and lets you launch any workshop directly once you have decided.",
    why: [
      "The commonest way technical training is wasted is starting in the wrong place — a course too advanced to follow, or one that teaches what you already know.",
      "Choosing well requires an honest picture of what you can currently do and what the role you want actually demands, and most people have neither to hand.",
      "Making that assessment explicit is the point of this tool.",
    ],
    whoFor: "Anyone approaching the Live Labs catalogue for the first time, students planning a specialisation, and professionals mapping a career move. It is the recommended starting point and assumes no technical background at all.",
    outcomes: [
      "Describe your current skills and goals precisely enough to get a useful recommendation",
      "Read a recommended learning path and understand why it is ordered that way",
      "Identify the gap between your current skills and a target role",
      "Compare workshops on prerequisites and outcomes rather than on title",
      "Launch a workshop and track what you have completed",
    ],
  },

  video: {
    url: "/demos/ai-program-navigator.mp4",
    poster: "/demos/ai-program-navigator.jpg",
    durationSec: 63,
    chapters: [
      { at: 0, label: "Choosing where to start in the catalogue" },
      { at: 5, label: "Browsing the workshop catalogue" },
      { at: 15, label: "Filtering by subject and level" },
      { at: 37, label: "Opening a workshop" },
      { at: 56, label: "Profile, history and leaderboard" },
    ],
  },

  prerequisites: [
    "An honest account of what you can currently do — this is the input that determines the output quality",
    "A target role or goal in mind, even a vague one",
    "A résumé file if you want the résumé analysis (optional)",
    "About 35 minutes",
  ],

  steps: [
    {
      title: "Browse the catalogue before asking for advice",
      goal: "Know what is on offer, so you can judge the recommendation you get.",
      actions: [
        "Sign in and land on the workshop **Catalog**.",
        "Scan the cards to see the range of subjects and difficulty levels.",
        "Do not decide anything yet.",
      ],
      expect: "A grid of workshop cards with subject, difficulty and a short synopsis on each.",
      why: "A recommendation you cannot evaluate is just an instruction. Five minutes of browsing first means you can tell whether the navigator understood you.",
      minutes: 5,
    },
    {
      title: "Read one workshop detail page in full",
      goal: "Learn what information is available per workshop.",
      actions: [
        "Open any workshop that interests you.",
        "Read the summary, the prerequisites and the outcomes.",
        "Note what it assumes you already know.",
      ],
      expect: "A detail page with a plain-language summary, listed prerequisites, and concrete outcomes.",
      why: "Prerequisites are the field people skip and then regret. A workshop marked Advanced is not harder in the sense of requiring more effort; it assumes knowledge, and starting without it wastes the time you were trying to save.",
      minutes: 6,
    },
    {
      title: "Run the Program Navigator with the guided form",
      goal: "Get a recommendation grounded in your actual position.",
      actions: [
        "Open the **Program Navigator**.",
        "Use the **guided form** rather than free text for your first run — its fields prompt you for things you would otherwise omit.",
        "Fill in Highest Qualification, Field of Study, Years of Experience and Primary Industry/Role honestly.",
        "In **Current Skills**, add each skill individually — press Enter or comma between them — and be specific. \"Python\" is not usable; \"Python scripting\", \"pandas\" and \"no ML training experience\" together are.",
        "Tick the **Interests** that apply and add your own for anything not listed.",
        "Submit.",
      ],
      expect: "A set of recommended workshops with reasoning for each and a suggested order.",
      why: "The recommendation is only as good as the self-assessment behind it. Overstate your level and you get a path that loses you at step one; understate it and you spend hours on material you know. The guided form exists because free text tends to produce vague self-descriptions.",
      minutes: 10,
    },
    {
      title: "Interrogate the recommendation",
      goal: "Make sure the ordering is right for you, not just plausible.",
      actions: [
        "Read the reasoning attached to each recommendation, not just the list.",
        "Open the detail page of the first suggestion and check its prerequisites against what you said.",
        "If something looks wrong, re-run the navigator with a more precise description rather than accepting it.",
        "Try free-form input as well and see whether the answer changes.",
      ],
      expect: "A path whose ordering you can justify. If you cannot, your input needs sharpening.",
      why: "Ordering is where these recommendations are most often wrong, because it depends on knowledge you may have from elsewhere and did not mention. You are the only one who can check it.",
      minutes: 8,
    },
    {
      title: "Analyse a résumé against a target role",
      goal: "Turn a vague sense of a gap into a specific list.",
      actions: [
        "Open the résumé analysis and upload your CV.",
        "Name the role you are targeting.",
        "Read the analysis and the visualisation of where you stand.",
        "Note which gaps the catalogue can close and which it cannot.",
      ],
      expect: "A structured comparison of your current profile against the role's requirements, with gaps identified.",
      why: "Some gaps are training gaps and some are experience gaps. No workshop substitutes for having shipped something, and knowing which of your gaps is which changes what you should do next.",
      minutes: 10,
    },
    {
      title: "Generate the career report and commit to a first workshop",
      goal: "Leave with a plan and actually start.",
      actions: [
        "Generate the **career report** for your target role.",
        "Read it alongside your navigator recommendations and reconcile the two.",
        "Open your chosen first workshop and launch it.",
        "Check **Profile** and **Leaderboard** to see how progress is tracked.",
      ],
      expect: "A career report, a chosen starting workshop, and a launched lab environment.",
      why: "The tool's value is realised at launch, not at recommendation. Use **History** to revisit any analysis later rather than re-running it from scratch.",
      minutes: 10,
    },
  ],

  troubleshooting: [
    {
      problem: "The recommendations are generic.",
      fix: "Your input was generic. Replace \"I want to learn AI\" with the specific capability you want and the specific things you can already do — the output tracks the input closely.",
    },
    {
      problem: "My résumé uploads but the analysis is empty or wrong.",
      fix: "Scanned PDFs are images with no extractable text. Export a text-based PDF or paste the content directly.",
    },
    {
      problem: "A recommended workshop is locked.",
      fix: "Recommendations cover the whole catalogue, not only what you own. Purchase it from its detail page, or ask your organiser for access.",
    },
    {
      problem: "An AI feature returns an error.",
      fix: "The navigator, résumé analysis and career report all call a language model. Retry once; if all of them fail, the provider key needs attention from the organiser.",
    },
  ],

  furtherReading: [
    { label: "Live Labs — the full workshop catalogue", href: "/dashboard/labs" },
    { label: "SFIA — the Skills Framework for the Information Age", href: "https://sfia-online.org/en" },
    { label: "O*NET — occupational skill requirements by role", href: "https://www.onetonline.org/" },
  ],
};

export default guide;

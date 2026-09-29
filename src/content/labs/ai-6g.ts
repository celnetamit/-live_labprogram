import type { LabGuide } from "./types";

/**
 * AI for 6G — Experiential Learning Platform — https://ai6g.live-labs.org/
 *
 * Three lesson modules (IRS, Semantic Communication, JSCC) each pair with a
 * simulator on the Tools page. The tutorial alternates lesson → simulator,
 * because the simulators are where the ideas become falsifiable.
 */
const guide: LabGuide = {
  slug: "ai-6g",

  summary: {
    tagline:
      "The three ideas behind 6G — smart surfaces, sending meaning instead of bits — each with a simulator you can push until it fails.",
    what: "Every generation of mobile network so far has worked the same way: transmit bits faithfully and let the application worry about what they mean. 6G research questions that. This lab covers three ideas that break the old assumption — smart surfaces that reflect radio waves where you want them, systems that transmit *meaning* rather than bits, and codecs that stop treating compression and error protection as separate problems. Each comes with a browser simulator you can push until it fails.",
    why: [
      "Wireless capacity is running into physics — you cannot keep adding spectrum and power indefinitely, so the next gains have to come from being cleverer about what gets sent and how it propagates.",
      "These three techniques are the leading candidates in current 6G standardisation research.",
      "They all depend on machine learning in ways that earlier generations did not, which means the people who build them need both radio and ML fluency.",
    ],
    whoFor: "Electronics, telecommunications and computer engineering students, plus practising RF engineers who want a working intuition for what 6G research is actually proposing. You should be comfortable with the idea of signal-to-noise ratio; the lab supplies the rest.",
    outcomes: [
      "Explain how an intelligent reflecting surface improves a link without amplifying anything",
      "Predict how SNR responds to element count, distance and transmit power, and check yourself against the simulator",
      "State what semantic communication sends instead of bits, and when that is a win",
      "Describe how a learned autoencoder extracts transmissible meaning from a source",
      "Explain why joint source-channel coding degrades gracefully where separated designs fall off a cliff",
    ],
  },

  /*
   * No designer's page for this lab: the showcase template, with copy drawn
   * only from this guide and checked against the app (the IRS, semantic,
   * autoencoder and JSCC simulators and the capstone all exist). Palette from
   * the cover: the gold of the "6G" hologram and its network arcs, a warmer
   * orange from the arcs' ends, the sand of the table light, and a cool steel
   * to balance them, over charcoal.
   */
  showcase: {
    overline: "Next-generation wireless",
    title: [
      { text: "AI For " },
      { text: "6G", accent: "primary" },
      { text: "Experimental Learning", accent: "secondary", subtitle: true },
    ],
    headline: "The three ideas behind 6G, each with a simulator.",
    intro:
      "Smart surfaces, sending meaning instead of bits, and joint source-channel coding — each with a browser simulator you can push until it fails.",
    about: [
      "Every generation of mobile network so far has worked the same way: transmit bits faithfully and let the application worry about what they mean. 6G research questions that.",
      "This lab covers three ideas that break the old assumption — smart surfaces that reflect radio waves where you want them, systems that transmit meaning rather than bits, and codecs that stop treating compression and error protection as separate problems.",
    ],
    tags: ["Reflecting surfaces", "Semantic communication", "Autoencoders", "JSCC"],
    walkthroughTitle: "From a reflecting surface to a codec that degrades gracefully",
    journey: "AI for 6G",
    photo: { position: "50% 55%" },
    card: {
      badge: "Interactive lab",
      icon: "simulation",
      description:
        "The three ideas behind 6G — smart surfaces, sending meaning instead of bits — each with a simulator you can push until it fails.",
    },
    palette: {
      primary: { onDark: "#f2bd62", ink: "#93610c" },
      secondary: { onDark: "#f08a4b", ink: "#b24d0f" },
      action: { onDark: "#ead3a8", ink: "#896521" },
      quiet: { onDark: "#9fb4c8", ink: "#516f8d" },
      cta: { onDark: "#f2bd62", ink: "#93610c", text: "#1a1206" },
      level: "#f08a4b",
      features: [
        { onDark: "#f2bd62", ink: "#93610c" },
        { onDark: "#f08a4b", ink: "#b24d0f" },
        { onDark: "#ead3a8", ink: "#896521" },
        { onDark: "#9fb4c8", ink: "#516f8d" },
      ],
    },
    ground: {
      page: "#0b0b0e",
      sidebar: "#0c0c0f",
      surface: ["#18181c", "#101013"],
      hero: "#121215",
      scrim: "#0a0a0c",
      text: "#f5f3ef",
      muted: "#a9a8ae",
      copy: "#b6b4bb",
      soft: "#86858d",
    },
    features: [
      {
        icon: "simulation",
        title: "Intelligent reflecting surfaces",
        body: "See how a smart surface improves a link without amplifying anything, then test the claim.",
      },
      {
        icon: "analysis",
        title: "Predict, then check",
        body: "Predict how SNR responds to element count, distance and power, and check yourself against the simulator.",
      },
      {
        icon: "graph",
        title: "Meaning, not bits",
        body: "Find out what semantic communication sends instead of bits, and when that is a win.",
      },
      {
        icon: "insight",
        title: "Find the cliff",
        body: "Watch joint source-channel coding degrade gracefully where a separated design falls off a cliff.",
      },
    ],
  },

  video: {
    url: "/demos/ai-6g.mp4",
    poster: "/demos/ai-6g.jpg",
    durationSec: 66,
    chapters: [
      { at: 0, label: "Why 6G needs new ideas, not more spectrum" },
      { at: 10, label: "The three modules" },
      { at: 18, label: "Module 1 — Intelligent Reflecting Surfaces" },
      { at: 38, label: "Tools — the IRS SNR simulator" },
      { at: 51, label: "Semantic communication and JSCC simulators" },
      { at: 60, label: "Capstone project" },
    ],
  },

  prerequisites: [
    "A working idea of signal-to-noise ratio and what decibels are",
    "A desktop browser with WebGL for the 3D visualisations",
    "About 80 minutes for all three modules; each module stands alone in roughly 25",
    "Progress is saved in your browser's local storage — finish on the machine you started on",
  ],

  steps: [
    {
      title: "Orient yourself on the dashboard",
      goal: "See the three modules and how far you have got.",
      actions: [
        "Sign in and land on the dashboard.",
        "Open **Lessons** to see Module 1 (Intelligent Reflecting Surfaces), Module 2 (Semantic Communication) and Module 3 (Joint Source-Channel Coding).",
        "Note that **Tools** holds the simulators separately from the lessons.",
      ],
      expect: "Three modules listed with progress indicators, and a Tools entry in the navigation.",
      why: "Progress is tracked locally per browser. If you switch machines you start from zero, so pick one and stay on it.",
      minutes: 4,
    },
    {
      title: "Module 1 — Intelligent Reflecting Surfaces",
      goal: "Understand how a passive surface improves a radio link.",
      actions: [
        "Open **Lessons → Module 1** and read \"Introduction to Intelligent Reflecting Surfaces\".",
        "Focus on one point: each element re-radiates the incoming wave with a controllable phase shift.",
        "Continue to \"Deep Reinforcement Learning for IRS Beamforming\" and note why the phase configuration is learned rather than computed.",
      ],
      expect: "You can state what an IRS does without using the word 'amplify' — it does not add energy, it aligns phases so existing energy arrives coherently.",
      why: "That distinction matters commercially: an IRS is passive, so it needs almost no power and no licence, which is why it is attractive for filling coverage holes in buildings where a relay would be expensive.",
      minutes: 12,
    },
    {
      title: "Test the IRS claims in the simulator",
      goal: "Turn the lesson's claims into a curve you can check.",
      actions: [
        "Open **Tools** and select the **IRS SNR Simulator**.",
        "Set **Number of IRS Elements** to its minimum of 4 and read the SNR.",
        "Raise it towards 256 and watch the curve. Note that the gain is not linear.",
        "Now hold elements fixed and vary **Distance** from 10 to 200 metres, then **Transmit Power** from 0 to 30 dBm.",
        "Answer this before moving on: to recover the SNR lost by doubling the distance, is it cheaper to add elements or add power?",
      ],
      expect: "SNR rises steeply with the first elements added and flattens as you approach 256; it falls sharply with distance and rises linearly in dB with transmit power.",
      why: "The array gain grows with the number of elements while path loss grows with distance squared or worse. Understanding which knob buys you the most is the whole design problem, and dragging the sliders builds that intuition far faster than the closed-form expression does.",
      minutes: 12,
    },
    {
      title: "Module 2 — Semantic Communication",
      goal: "Grasp the shift from transmitting bits to transmitting meaning.",
      actions: [
        "Open **Lessons → Module 2**, starting with \"Beyond Bits: Introduction to Semantic Communication\".",
        "Read \"Autoencoders for Semantic Feature Extraction\".",
        "Hold a concrete example in mind: to convey \"the road ahead is clear\", a classical system sends a compressed image; a semantic system sends the conclusion.",
      ],
      expect: "You can name a case where a bit-perfect transmission is wasteful and one where semantic transmission would be dangerous.",
      why: "Semantic communication only pays off when the receiver's purpose is known in advance. For a self-driving car receiving road state it is a large win; for a medical image where the radiologist may look for something nobody anticipated, discarding detail is exactly the wrong move.",
      minutes: 12,
    },
    {
      title: "Run the Semantic and Autoencoder simulators",
      goal: "Watch a learned representation compress a source and survive a noisy channel.",
      actions: [
        "In **Tools**, open the **Semantic Communication Simulator**.",
        "Push the channel noise up and watch how the reconstruction degrades.",
        "Switch to the **Autoencoder Visualizer** and follow the input through encoder, bottleneck and decoder.",
        "Narrow the bottleneck and note what information disappears first.",
      ],
      expect: "As noise increases the reconstruction gets vaguer rather than corrupt; as the bottleneck narrows, fine detail goes before overall structure.",
      why: "The autoencoder learns which parts of the source matter for the reconstruction objective. What survives the bottleneck is the model's answer to \"what is this signal about\", and it is worth noticing that the answer depends entirely on what it was trained to preserve.",
      minutes: 12,
    },
    {
      title: "Module 3 and the JSCC simulator — find the cliff",
      goal: "See the failure mode that joint coding exists to prevent.",
      actions: [
        "Read **Lessons → Module 3**, \"Introduction to Joint Source-Channel Coding\".",
        "Open the **JSCC Simulator** in **Tools**.",
        "Start at high SNR and lower it in small steps, watching reconstruction quality.",
        "Find the point where a classical separated scheme collapses, and compare it with the JSCC curve at the same SNR.",
      ],
      expect: "The separated scheme holds up well and then fails abruptly below a threshold. The JSCC scheme degrades smoothly instead.",
      why: "Classical design compresses first, then protects — and once channel errors exceed what the error-correcting code can fix, the decompressor gets garbage and output quality falls off a cliff. Learning both jobs together removes the cliff, which matters enormously for mobile receivers whose channel quality changes second by second.",
      minutes: 14,
    },
    {
      title: "Complete the capstone and assessments",
      goal: "Combine the three techniques in one design problem.",
      actions: [
        "Open **Capstone Project** and work through the combined scenario.",
        "Take the assessment for each module.",
        "Use the **Knowledge Bank** to look up any term that blocks you.",
      ],
      expect: "A completed capstone and three module assessments.",
      minutes: 14,
    },
  ],

  troubleshooting: [
    {
      problem: "My progress disappeared.",
      fix: "Progress lives in browser local storage, not on a server. Private/incognito windows, clearing site data, or switching browser or machine all reset it.",
    },
    {
      problem: "The 3D visualisations do not render.",
      fix: "They require WebGL. Enable hardware acceleration and use a desktop browser.",
    },
    {
      problem: "The IRS simulator curve looks flat.",
      fix: "You are probably at the high end of the element slider already, where gains have saturated. Drag it back to 4 and increase from there to see the shape.",
    },
    {
      problem: "A simulator control does nothing.",
      fix: "Some simulators only recompute on release rather than during the drag. Let go of the slider and give it a moment.",
    },
  ],

  furtherReading: [
    { label: "ITU-R — IMT-2030 (6G) framework recommendation", href: "https://www.itu.int/en/ITU-R/study-groups/rsg5/rwp5d/imt-2030/Pages/default.aspx" },
    { label: "3GPP — specifications and release timeline", href: "https://www.3gpp.org/specifications" },
    { label: "Shannon, \"A Mathematical Theory of Communication\" — the separation theorem this lab departs from", href: "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf" },
  ],
};

export default guide;

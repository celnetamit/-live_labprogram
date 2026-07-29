import type { LabGuide } from "./types";

/**
 * Battery Circularity AI — https://battery.live-labs.org/
 *
 * Seven sidebar views; the hands-on work is the Simulation Lab's three tools
 * (Second-Life Feasibility Analyzer, Recycling Process Simulator, Safety
 * Compliance Checker), which the tutorial takes in decision order.
 */
const guide: LabGuide = {
  slug: "battery-ai",

  summary: {
    what: "An electric-vehicle battery is retired when it can no longer hold about 80% of its original charge — but at that point it is still a large, expensive, perfectly functional energy store. This lab is about what happens next. You assess a used pack's health, decide whether it should get a second life in a less demanding application or go straight to material recovery, simulate the recycling process, and check the whole plan against safety and compliance standards.",
    why: "The first big wave of EV batteries is reaching end of life now, and the decision made about each pack has consequences measured in both money and lithium. Sending a healthy pack to a shredder destroys value; putting a degraded one into a building's energy storage creates a fire risk. Getting this right is a live commercial problem with no settled answer, and it is where circular-economy thinking meets hard electrochemical limits.",
    whoFor: "Engineering, sustainability, materials and energy-systems students, and professionals in EV or energy-storage supply chains. It is an advanced lab: you should be comfortable with the idea of battery capacity and internal resistance, and willing to reason about cost as well as chemistry.",
    outcomes: [
      "Read a state-of-health report and judge whether a pack is a second-life candidate",
      "Explain what capacity fade and rising internal resistance each tell you about how a cell aged",
      "Match a retired pack to applications whose duty cycle it can still meet",
      "Compare recycling routes on recovery rate, environmental impact and economic viability",
      "Identify the safety and compliance obligations that constrain any reuse decision",
    ],
  },

  video: {
    url: "/demos/battery-ai.mp4",
    poster: "/demos/battery-ai.jpg",
    durationSec: 39,
    chapters: [
      { at: 0, label: "Second life or recycling: the decision" },
      { at: 5, label: "Learning Hub — how batteries degrade" },
      { at: 15, label: "Simulation Lab — feasibility, recycling, safety" },
      { at: 25, label: "Lifecycle Tracker" },
      { at: 32, label: "Visual Glossary and Assessment Centre" },
    ],
  },

  prerequisites: [
    "Basic electrical concepts — capacity, voltage, resistance",
    "A desktop browser; the visual glossary uses 3D models",
    "About 65 minutes for the full sequence",
  ],

  steps: [
    {
      title: "Start with the Learning Hub, not the simulators",
      goal: "Get the degradation vocabulary before you are asked to judge a pack on it.",
      actions: [
        "Sign in and open **Dashboard** to see the layout.",
        "Go to **Learning Hub** and work through the material on degradation mechanisms.",
        "Make sure you can distinguish capacity fade from power fade, and calendar ageing from cycle ageing.",
      ],
      expect: "You can explain why a battery at 80% state of health is called end-of-life for automotive use but not end-of-life outright.",
      why: "That 80% threshold is about the vehicle, not the cell: below it the range loss becomes unacceptable to a driver. A stationary storage system that never needs peak power has no such objection, and that gap is precisely where the second-life market lives.",
      minutes: 12,
    },
    {
      title: "Follow a pack through the Lifecycle Tracker",
      goal: "See the full chain a battery moves through before any decision is made.",
      actions: [
        "Open **Lifecycle Tracker** in the sidebar.",
        "Trace a pack from manufacture through first use, retirement, assessment and its onward route.",
        "Note where data about the pack is captured, and where it is typically lost.",
      ],
      expect: "A traced lifecycle with visible decision points.",
      why: "The main practical obstacle to second-life reuse is not technical, it is informational: if nobody recorded how a pack was charged and how hot it ran, its remaining life has to be measured from scratch, and that testing can cost more than the pack is worth.",
      minutes: 8,
    },
    {
      title: "Assess a pack in the Second-Life Feasibility Analyzer",
      goal: "Turn health data into a reuse decision.",
      actions: [
        "Open **Simulation Lab** in the sidebar. It opens on **Second-Life Feasibility Analyzer**.",
        "Enter a pack with healthy figures first — a state of health near 85%, a moderate cycle count, low capacity fade, low internal resistance.",
        "Run the analysis and read the whole report: feasibility score, projected lifespan, potential revenue, suitable applications and safety considerations.",
        "Now run a degraded pack — state of health near 65%, high cycle count, high internal resistance — and compare.",
      ],
      expect: "The healthy pack scores well with several suitable applications; the degraded pack scores poorly and the suitable-application list shrinks or empties.",
      why: "Notice that internal resistance drives the outcome more than capacity does. High resistance means more heat at the same current, which limits the power the pack can safely deliver and accelerates further ageing — so it disqualifies a pack from demanding applications even when capacity still looks acceptable.",
      minutes: 15,
    },
    {
      title: "Match packs to applications deliberately",
      goal: "Understand why the same pack suits one use and not another.",
      actions: [
        "For your healthy pack, read the viability rating of each suggested application.",
        "Identify which applications need high power versus high energy.",
        "Re-run with only the internal resistance raised, holding everything else constant, and see which applications drop out first.",
      ],
      expect: "Power-hungry applications lose viability first when resistance rises; energy-only applications tolerate it far longer.",
      why: "Energy and power are different requirements. A home storage system discharges slowly over hours and cares about capacity; grid frequency regulation demands large currents in seconds and cares about resistance. This is the single most useful matching heuristic in the field.",
      minutes: 10,
    },
    {
      title: "Simulate the recycling route",
      goal: "Evaluate the alternative to reuse on its own terms.",
      actions: [
        "Switch to the **Recycling Process Simulator** tab.",
        "Run a recovery simulation and read the recovery rates per material.",
        "Read the environmental impact metrics and the economic viability assessment.",
        "Compare the recovered value against the second-life revenue estimate for the same pack.",
      ],
      expect: "High recovery rates for some materials and markedly lower ones for others, with an economic assessment that depends heavily on which materials the chemistry contains.",
      why: "Recycling economics are driven by cobalt and nickel. Chemistries that reduce or remove them — LFP especially — are cheaper and safer but leave much less worth recovering, which is why the industry's move away from cobalt has made recycling harder to fund even as it makes batteries better.",
      minutes: 12,
    },
    {
      title: "Run the Safety Compliance Checker",
      goal: "Test your plan against the constraints that can veto it outright.",
      actions: [
        "Switch to the **Safety Compliance Checker** tab.",
        "Submit your second-life plan for the healthy pack.",
        "Read the status, the identified risks, the recommendations and the standards referenced.",
        "Now submit the degraded pack's plan and compare.",
      ],
      expect: "A Pass, Warning or Fail with specific risks, recommendations and standard references.",
      why: "Repurposing a battery makes you its manufacturer for regulatory purposes. Certification, transport classification and installation requirements apply to the new product, and this compliance cost is what most often makes a technically sound second-life plan commercially unviable.",
      minutes: 10,
    },
    {
      title: "Consolidate and assess",
      goal: "Fix the terminology and test the reasoning.",
      actions: [
        "Open **Visual Glossary** for the 3D cell and pack models.",
        "Use **Community Forum** to compare your reuse decisions with other learners'.",
        "Complete the **Assessment Center**.",
      ],
      expect: "A completed assessment and a defensible decision for each pack you evaluated.",
      minutes: 10,
    },
  ],

  troubleshooting: [
    {
      problem: "The feasibility analysis returns an error.",
      fix: "The analyser calls a language model through a gateway. Retry once; if every AI feature fails, the workshop's provider key needs attention from the organiser.",
    },
    {
      problem: "Every pack I enter scores as unsuitable.",
      fix: "Check your inputs are in the expected ranges — state of health as a percentage, not a fraction. A state of health of 0.85 will be read as 0.85%.",
    },
    {
      problem: "The 3D models in the Visual Glossary do not load.",
      fix: "They need WebGL. Enable hardware acceleration and use a desktop browser.",
    },
    {
      problem: "Recycling looks better than second life for every pack I try.",
      fix: "Check the chemistry you selected. Cobalt-rich chemistries strongly favour recovery; try an LFP pack and the balance usually reverses.",
    },
  ],

  furtherReading: [
    { label: "IEA — Global EV Outlook, battery demand and end-of-life projections", href: "https://www.iea.org/reports/global-ev-outlook-2024" },
    { label: "EU Batteries Regulation 2023/1542 — recycled content and recovery targets", href: "https://eur-lex.europa.eu/eli/reg/2023/1542/oj" },
    { label: "UL 1974 — Standard for Evaluation for Repurposing Batteries", href: "https://www.ul.com/services/battery-repurposing-ul-1974" },
  ],
};

export default guide;

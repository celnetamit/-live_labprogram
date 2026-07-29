import type { LabGuide } from "./types";

/**
 * SmartFactory AI — https://smartfactory.live-labs.org/
 *
 * Fourteen participant tabs. The tutorial deliberately does not walk all of
 * them: it takes the four that carry the actual manufacturing arguments
 * (Optimizer, Digital Twin, Maintenance, Maintenance Strategy) plus the Data
 * Lab, then points at the machine simulators and the Final Project.
 */
const guide: LabGuide = {
  slug: "smartfactory-ai",

  summary: {
    what: "A factory is a chain of machines where one slow station sets the pace for everything behind it, and one unplanned breakdown stops the lot. This lab is a simulated production facility where you can find that bottleneck, run a digital twin of the line, predict failures from sensor data before they happen, and argue — with numbers — about how much maintenance is worth doing. It also carries three machine simulators: a robotic arm, a 3D printer and a CNC mill.",
    why: "Unplanned downtime is the most expensive thing that happens in manufacturing, and the traditional answer — service everything on a fixed schedule — wastes an enormous amount of perfectly good component life. Sensor data plus prediction offers a third option, but only if someone can tell the difference between a model that is genuinely predictive and one that is expensively re-describing the schedule you already had. That judgement is what this lab trains.",
    whoFor: "Mechanical, industrial and manufacturing engineering students, plus operations and maintenance staff moving into data-driven work. It is advanced in scope rather than in mathematics — you should be comfortable reading throughput and utilisation figures and thinking about cost.",
    outcomes: [
      "Find the bottleneck in a production line and predict what improving it will and will not do",
      "Use a digital twin to test a change before committing to it",
      "Interpret vibration and temperature signatures as early failure indicators",
      "Compare reactive, preventive and predictive maintenance strategies on total cost, not downtime alone",
      "Read a G-code toolpath and relate it to what the machine physically does",
    ],
  },

  video: {
    url: "/demos/smartfactory-ai.mp4",
    poster: "/demos/smartfactory-ai.jpg",
    durationSec: 77,
    chapters: [
      { at: 0, label: "A simulated production facility" },
      { at: 5, label: "Entering the participant workspace" },
      { at: 42, label: "Production Line Optimizer — finding the constraint" },
      { at: 53, label: "Digital Twin" },
      { at: 62, label: "Predictive maintenance and strategy" },
      { at: 70, label: "Robotic Arm and CNC simulators" },
    ],
  },

  prerequisites: [
    "Basic manufacturing vocabulary — throughput, cycle time, utilisation",
    "A desktop browser with WebGL; every simulator in this lab is 3D",
    "About 90 minutes for the core sequence, more if you explore all fourteen tabs",
    "Note that roles and progress are stored in your browser, not on a server",
  ],

  steps: [
    {
      title: "Sign in and understand what the roles mean",
      goal: "Get into the participant workspace and know what you are looking at.",
      actions: [
        "Sign in with the demo credentials shown on the login screen.",
        "Choose the **participant** role — mentor and admin add oversight tabs but no extra lab content.",
        "Look over the tab strip: Learning Path, Optimizer, Digital Twin, Maintenance, Maintenance Strategy, Data Lab, Biomedical Lab, Final Project, Robotic Arm, 3D Printer, CNC Sim, Knowledge Hub and AI Assistant.",
      ],
      expect: "The participant workspace with the full tab strip.",
      why: "Worth knowing: the role system is a workshop device, not a security boundary. Accounts and roles live in browser storage that you control, so the different dashboards exist to shape the exercise rather than to protect anything. Real access control happens upstream in the portal you launched from.",
      minutes: 5,
    },
    {
      title: "Follow the Learning Path first",
      goal: "Get the concepts before the simulators assume them.",
      actions: [
        "Open the **Learning Path** tab and work through it in order.",
        "Keep the **Knowledge Hub** tab in mind as your reference for anything unfamiliar.",
      ],
      expect: "A structured sequence of concepts covering line balancing, condition monitoring and maintenance strategy.",
      minutes: 10,
    },
    {
      title: "Find the bottleneck in the Production Line Optimizer",
      goal: "Locate the one station that governs the whole line's output.",
      actions: [
        "Open the **Optimizer** tab.",
        "Enter the line's KPIs and run the optimisation.",
        "Read the report and identify the constraining station.",
        "Now improve a station that is *not* the bottleneck and re-run. Note how little total throughput changes.",
        "Improve the actual bottleneck by the same amount and compare.",
      ],
      expect: "Improving a non-bottleneck station barely moves total output; improving the bottleneck moves it substantially — and usually creates a new bottleneck somewhere else.",
      why: "This is the theory of constraints in one experiment. A chain's throughput is set by its weakest link, so effort spent anywhere else buys inventory rather than output. The follow-on lesson matters just as much: fixing a bottleneck does not eliminate bottlenecks, it relocates them, so optimisation is iterative rather than one-shot.",
      minutes: 15,
    },
    {
      title: "Test your change in the Digital Twin",
      goal: "Validate a proposed change against a running model before committing to it.",
      actions: [
        "Open the **Digital Twin** tab and let the 3D line load.",
        "Watch material flow through the line and see where it queues.",
        "Apply the change you decided on in the Optimizer.",
        "Watch what happens to the queues downstream.",
      ],
      expect: "Visible work-in-progress piling up in front of the constraining station, and that pile moving elsewhere after your change.",
      why: "A twin is worth building precisely because a change that looks good on a spreadsheet can starve a downstream station or overflow a buffer — effects that only appear when you simulate the dynamics rather than the averages.",
      minutes: 12,
    },
    {
      title: "Predict a failure in the Maintenance Analyzer",
      goal: "Read sensor data as an early warning rather than a post-mortem.",
      actions: [
        "Open the **Maintenance** tab.",
        "Enter or load machine sensor data — vibration, temperature, operating hours.",
        "Run the analysis and read the maintenance report.",
        "Change one signal at a time and watch which one moves the predicted remaining life most.",
      ],
      expect: "A remaining-useful-life estimate with the contributing indicators broken out.",
      why: "Vibration usually leads temperature. A developing bearing fault shows up as a change in vibration signature well before the friction it causes raises the measured temperature, which is why vibration monitoring buys more warning time than thermal monitoring alone.",
      minutes: 12,
    },
    {
      title: "Compare maintenance strategies on total cost",
      goal: "Decide how much prediction is actually worth.",
      actions: [
        "Open the **Maintenance Strategy** tab.",
        "Simulate a reactive strategy — repair only after failure — and record total cost and downtime.",
        "Simulate a preventive schedule and record the same.",
        "Simulate a predictive strategy and compare all three.",
        "Then find a machine where predictive maintenance is *not* worth it.",
      ],
      expect: "Reactive is cheap until a failure, then very expensive. Preventive is steady but wastes component life. Predictive wins on total cost for critical machines — and loses on cheap, quickly replaced ones.",
      why: "The instinct that predictive maintenance is always better is wrong, and expensively so. Instrumenting a machine costs money; if the machine is cheap, spare, and fast to swap, running it to failure is the rational strategy. The decision depends on failure consequence, not on the technology available.",
      minutes: 15,
    },
    {
      title: "Explore the machine simulators",
      goal: "Connect the abstractions to physical machines.",
      actions: [
        "Open **Robotic Arm** and drive the joints; watch how joint angles produce end-effector position.",
        "Open **3D Printer** and watch a part build layer by layer.",
        "Open **CNC Sim**, load a G-code program and follow the toolpath.",
        "In the CNC tab, read a few lines of G-code alongside the motion they produce.",
      ],
      expect: "Three 3D simulators responding to your inputs, with the CNC toolpath traced as the program runs.",
      why: "G-code is nothing more than a list of coordinates and feed rates. Watching a line of text move a tool is the fastest way to stop finding CNC programs intimidating.",
      minutes: 15,
    },
    {
      title: "Complete the Data Lab and Final Project",
      goal: "Put the pieces together on an open-ended problem.",
      actions: [
        "Work through the **Data Lab** tab to practise exploring production data directly.",
        "Open **Final Project** and work the combined scenario end to end.",
        "Use the **AI Assistant** tab when you get stuck rather than guessing.",
      ],
      expect: "A completed final project drawing on the optimiser, the twin and the maintenance analysis together.",
      minutes: 20,
    },
  ],

  troubleshooting: [
    {
      problem: "A 3D simulator shows a black or empty panel.",
      fix: "Every simulator here needs WebGL. Enable hardware acceleration, use a desktop browser, and give the scene a few seconds to load on a slower machine.",
    },
    {
      problem: "My progress or role reset.",
      fix: "Both live in browser local storage. Private windows, cleared site data, or a different browser all start you fresh.",
    },
    {
      problem: "The AI Assistant or an analysis returns an error.",
      fix: "Those features call a language model through a gateway. Retry once; if all of them fail, the workshop's provider key needs attention from the organiser.",
    },
    {
      problem: "Optimising the line makes almost no difference.",
      fix: "You are improving a station that is not the constraint. Re-read the optimiser report to find the actual bottleneck — that is the intended lesson of step 3.",
    },
  ],

  furtherReading: [
    { label: "Goldratt, The Goal — the theory of constraints, in narrative form", href: "https://www.tocinstitute.org/theory-of-constraints.html" },
    { label: "ISO 13374 — condition monitoring and diagnostics of machines", href: "https://www.iso.org/standard/54933.html" },
    { label: "NIST — Smart Manufacturing Systems programme", href: "https://www.nist.gov/programs-projects/smart-manufacturing-systems-design-and-analysis" },
  ],
};

export default guide;

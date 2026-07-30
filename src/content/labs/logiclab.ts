import type { LabGuide } from "./types";

/**
 * LogicLab AI — https://logic.live-labs.org/
 *
 * Sidebar: Dashboard, Learn Concepts, Code Generator, Code Explainer,
 * Assessment, AI Lab Assistant, Snippet Library, Knowledge Bank. The tutorial
 * runs Explainer before Generator on purpose — reading HDL you did not write is
 * the safer way in than generating HDL you cannot yet check.
 */
const guide: LabGuide = {
  slug: "logiclab",

  summary: {
    tagline:
      "Describe a chip in plain English, get working Verilog back, and learn to read what it produced.",
    what: "Chips are not drawn, they are described. Engineers write hardware description languages — Verilog and VHDL — that specify what a circuit does, and tools turn that description into actual gates on silicon. This lab is where you learn to read and write that description with an AI assistant alongside you: describe a module in plain English and get HDL back, paste unfamiliar HDL and get it explained line by line, generate a testbench to verify it, and keep the good results in a snippet library.",
    why: "HDL trips up almost everyone at first, because it looks like software and is not. Two lines that appear to do the same thing produce completely different hardware, and the mistake usually surfaces days later as a timing failure nobody can localise. Having a tool that explains what a block of HDL actually synthesises to — and that generates a testbench so you can check — shortens that learning curve dramatically.",
    whoFor: "Electronics and computer engineering students meeting digital design for the first time, and software engineers moving toward FPGA work. This is the most beginner-friendly lab in the catalogue: it assumes you know what a logic gate is and builds from there.",
    outcomes: [
      "Read a Verilog or VHDL module and describe the hardware it produces",
      "Explain the difference between blocking and non-blocking assignment, and why it decides whether your design works",
      "Generate a working module from a plain-English requirement and review it critically",
      "Generate a testbench and say what it does and does not prove",
      "Recognise the classic hazards: clock domain crossing, metastability, and where pipelining helps",
    ],
  },

  video: {
    url: "/demos/logiclab.mp4",
    poster: "/demos/logiclab.jpg",
    durationSec: 38,
    chapters: [
      { at: 0, label: "The dashboard: what LogicLab does" },
      { at: 4, label: "Learn Concepts — blocking vs non-blocking" },
      { at: 12, label: "Code Generator — HDL from a plain-English prompt" },
      { at: 22, label: "Code Explainer — reading HDL you did not write" },
      { at: 32, label: "Snippet Library and Knowledge Bank" },
    ],
  },

  prerequisites: [
    "Knowing what a logic gate and a flip-flop are — nothing more",
    "No toolchain, no simulator, no FPGA board: everything runs in the browser",
    "About 60 minutes",
  ],

  steps: [
    {
      title: "Work through Learn Concepts first",
      goal: "Get the four ideas that every later step depends on.",
      actions: [
        "Sign in and open **Learn Concepts** in the sidebar.",
        "Read **HDL Basics** — blocking (`=`) versus non-blocking (`<=`) assignment.",
        "Read **State Machines** — Moore versus Mealy.",
        "Read **CDC (Clock Domain Crossing)** and **Pipelining**, marked Advanced. Skim them now; they will make more sense after you have read some real HDL.",
      ],
      expect: "You can state the rule: non-blocking (`<=`) for sequential logic, blocking (`=`) for combinational.",
      why: "That one rule prevents most beginner HDL bugs. Blocking assignments take effect immediately in source order; non-blocking ones all take effect at the end of the time step. Use blocking in a clocked block and you create a race between statements that simulates one way and synthesises another — the worst possible failure mode, because the simulation passes.",
      minutes: 12,
    },
    {
      title: "Explain code you did not write",
      goal: "Learn to read HDL before you try to produce it.",
      actions: [
        "Open **Code Explainer** in the sidebar.",
        "Paste in a module — use one from **Snippet Library** if you have no HDL of your own.",
        "Read the explanation: the summary first, then the state machine logic breakdown.",
        "Cross-check one claim yourself against the source. Do not accept the explanation on trust.",
      ],
      expect: "A structured explanation with a summary and a walkthrough of the sequential logic.",
      why: "Reading is the faster skill to acquire and the more useful one — you will read far more HDL than you write. Cross-checking is not optional: the explanation comes from a language model, and treating its output as authoritative rather than as a strong first draft is the main way these tools cause harm.",
      minutes: 12,
    },
    {
      title: "Generate your first module",
      goal: "Turn a plain-English requirement into synthesisable HDL.",
      actions: [
        "Open **Code Generator**.",
        "Set **Target Language** to Verilog.",
        "In **Requirement Prompt**, be specific. Something like: \"Create a Verilog UART transmitter with a configurable clock frequency and baud rate, an 8-bit data input, a start signal, and a ready output indicating it can accept new data.\"",
        "Generate, and read the result on the **Design** tab.",
      ],
      expect: "A complete module with parameters, a state machine (IDLE / START / DATA / STOP), a clock divider and the requested ports.",
      why: "Notice how much of the quality came from the prompt. \"Make a UART\" leaves the clock frequency, baud rate, data width and handshaking to the model's guess; naming them gets you a module you can actually integrate.",
      minutes: 12,
    },
    {
      title: "Review the generated design critically",
      goal: "Practise the review that makes generated HDL safe to use.",
      actions: [
        "Check every port in the module against your requirement — is anything missing or extra?",
        "Find the clocked `always` block and confirm it uses non-blocking assignment.",
        "Find the combinational block and confirm every output is assigned on every path, so no latch is inferred.",
        "Check the reset: is it synchronous or asynchronous, and is that what you wanted?",
      ],
      expect: "You find at least one thing worth questioning. That is a normal outcome, not a sign the tool failed.",
      why: "An incompletely assigned combinational block infers a latch — storage you did not ask for, which breaks static timing analysis and is one of the most common synthesis warnings junior engineers learn to ignore and should not.",
      minutes: 12,
    },
    {
      title: "Generate a testbench and understand its limits",
      goal: "Get a way to exercise the design, and be clear about what it proves.",
      actions: [
        "With the design still open, generate the testbench and switch to the **Testbench** tab.",
        "Read what stimulus it applies and what it checks.",
        "Write down one behaviour of your module the testbench does *not* cover.",
      ],
      expect: "A testbench that drives the clock and reset, applies input data and observes the output.",
      why: "A generated testbench covers the path the module is expected to take. It rarely covers back-to-back transmissions, reset asserted mid-transmission, or a start signal arriving while busy — and those are exactly where real bugs live. Knowing what your verification does not reach is more valuable than the pass result.",
      minutes: 10,
    },
    {
      title: "Save your work and use the assistant",
      goal: "Build a personal reference and get unstuck efficiently.",
      actions: [
        "Save the module and its testbench to the **Snippet Library**.",
        "Open **AI Lab Assistant** and ask about something the concepts modules left unclear — metastability, or why a two-flop synchroniser is enough.",
        "Use **Knowledge Bank** for reference material.",
      ],
      expect: "A saved, retrievable snippet and answers to your questions.",
      minutes: 8,
    },
    {
      title: "Take the assessment",
      goal: "Confirm the concepts stuck.",
      actions: [
        "Open **Assessment**.",
        "Set the quiz topic — start with Finite State Machines — and generate the quiz.",
        "Answer, submit, and read the explanation for anything you missed.",
        "Repeat with a topic you feel weakest on.",
      ],
      expect: "A scored quiz with per-question explanations.",
      minutes: 10,
    },
  ],

  troubleshooting: [
    {
      problem: "Generation returns nothing or an error.",
      fix: "The generator calls a language model through a gateway. Retry once; if every AI feature in the app fails, the workshop's provider key needs attention from the organiser.",
    },
    {
      problem: "The generated code does not do what I asked.",
      fix: "Almost always the prompt. Name the interface explicitly: port widths, reset polarity, whether reset is synchronous, and the handshake. Vague prompts produce plausible but unusable modules.",
    },
    {
      problem: "The Explainer produces a generic description.",
      fix: "Paste a complete module, including the `module`/`endmodule` boundaries. Fragments lack the context needed to say anything specific.",
    },
    {
      problem: "Can I synthesise this on a real FPGA?",
      fix: "The generated HDL is a starting point for a real toolchain, not verified silicon-ready code. Simulate and run static timing analysis in your vendor tools before trusting it on hardware.",
    },
  ],

  furtherReading: [
    { label: "IEEE 1364 — the Verilog standard", href: "https://standards.ieee.org/ieee/1364/2052/" },
    { label: "Cummings, \"Nonblocking Assignments in Verilog Synthesis\" — the definitive paper on step 1's rule", href: "http://www.sunburst-design.com/papers/CummingsSNUG2000SJ_NBA.pdf" },
    { label: "ASIC World — Verilog tutorials", href: "https://www.asic-world.com/verilog/" },
  ],
};

export default guide;

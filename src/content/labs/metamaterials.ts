import type { LabGuide } from "./types";

/**
 * Pioneering Acoustic Metamaterials — https://metamaterial.live-labs.org/
 *
 * A single design workbench: control panel on one side, 3D unit cell and
 * spectrum on the other, generate to run the physics engine. The tutorial
 * separates the acoustic targets from the geometry controls, because learners
 * who move both at once cannot attribute any result.
 */
const guide: LabGuide = {
  slug: "metamaterials",

  summary: {
    what: "Ordinary sound absorbers work by being thick — the low notes need a lot of material. Acoustic metamaterials cheat that by getting their properties from geometry rather than from the substance they are made of, so a carefully shaped lattice a few centimetres thick can stop frequencies that would otherwise demand a wall. This lab is a design workbench for those structures: you set an acoustic target, choose a lattice topology, and the physics engine returns an absorption spectrum, a bandgap analysis, and a verdict on whether the thing could actually be printed.",
    why: "Noise is a serious engineering constraint — in aircraft cabins, in vehicles, in buildings near infrastructure — and the conventional answer of adding mass conflicts with every other requirement, especially in aerospace. Metamaterials offer targeted attenuation at a fraction of the weight. The catch is that they are inseparable from additive manufacturing: these lattices cannot be made any other way, and a design that ignores printability is not a design.",
    whoFor: "Materials science, mechanical and acoustical engineering students, and product designers working with additive manufacturing. It is an advanced lab. Familiarity with frequency and wavelength is assumed; the lab explains the metamaterial-specific physics.",
    outcomes: [
      "Explain how a bandgap arises and what distinguishes a Bragg gap from a resonance gap",
      "Predict which lattice topologies suit which acoustic targets",
      "Trade porosity and wall thickness against structural integrity and printability",
      "Read an absorption spectrum and identify where a design does and does not work",
      "Recognise when a numerically excellent design cannot be manufactured",
    ],
  },

  video: {
    url: "/demos/metamaterials.mp4",
    poster: "/demos/metamaterials.jpg",
    durationSec: 36,
    chapters: [
      { at: 0, label: "Geometry instead of mass: acoustic metamaterials" },
      { at: 5, label: "Acoustic targets — frequency, absorption, angle" },
      { at: 10, label: "Advanced — lattice topology, porosity, wall thickness" },
      { at: 19, label: "Unit cell preview and cross-section" },
      { at: 29, label: "Design library and knowledge bank" },
    ],
  },

  prerequisites: [
    "Comfort with frequency, wavelength and decibels",
    "A desktop browser with WebGL — the unit cell and cross-section previews are 3D",
    "Headphones if you want to use the audio preview",
    "About 70 minutes",
  ],

  steps: [
    {
      title: "Learn the physics before touching the sliders",
      goal: "Understand what a bandgap is, since it is the quantity everything else serves.",
      actions: [
        "Open the **Knowledge Bank** from the navigation.",
        "Read the sections on bandgaps, effective density and effective modulus.",
        "Make sure you can distinguish a Bragg bandgap from a resonance bandgap before continuing.",
      ],
      expect: "You can say what each mechanism depends on: a Bragg gap on the lattice spacing relative to the wavelength, a resonance gap on the local resonators regardless of spacing.",
      why: "This distinction governs everything downstream. Bragg gaps need features comparable in size to the wavelength, so low frequencies mean large cells — which is precisely the thickness problem metamaterials exist to solve. Resonance gaps sidestep it, and are the reason sub-wavelength absorbers are possible at all.",
      minutes: 12,
    },
    {
      title: "Open the workbench and pick a mission scenario",
      goal: "Start from a realistic target rather than arbitrary numbers.",
      actions: [
        "Open the design workbench from the home page.",
        "Choose a **Mission Scenario** from the dropdown — it presets the acoustic targets for a real application.",
        "Note where the panels sit: controls on one side, unit cell and spectrum on the other.",
      ],
      expect: "The control panel populates with target values appropriate to the scenario.",
      why: "Scenarios keep you honest. Left to invent targets, most learners pick round numbers that no application requires and then optimise against them.",
      minutes: 5,
    },
    {
      title: "Set the acoustic targets — and only those",
      goal: "Establish what you want before deciding how to get it.",
      actions: [
        "Set **Target Frequency** to the frequency you need attenuated, anywhere from 100 Hz to 8 kHz.",
        "Set **Desired Absorption** — try 90% before reaching for 99%.",
        "Set **Incident Angle**. Leave it at 0° for now; you will raise it later.",
        "Choose a **Material**: PLA, ABS, Titanium or Resin.",
        "Generate, and keep this as your baseline.",
      ],
      expect: "A generated design with an absorption spectrum, a bandgap verdict, a specific stiffness figure, and structural integrity and manufacturability assessments.",
      why: "Material choice sets stiffness and density, which set the speed of sound in the structure, which shifts every resonance. Titanium and PLA with identical geometry are acoustically different objects — so changing material is not a late-stage decision.",
      minutes: 12,
    },
    {
      title: "Compare lattice topologies at fixed targets",
      goal: "Isolate the effect of geometry alone.",
      actions: [
        "Leave every acoustic target exactly as it is.",
        "Step through **Lattice Topology**: Gyroid, Schwarz P, Schwarz D, Neovius, Lidinoid, FCC and BCC. Regenerate each time.",
        "Record the bandgap type and range for each.",
        "Rotate the unit cell preview for each and connect what you see to what the spectrum did.",
      ],
      expect: "The triply periodic minimal surfaces — Gyroid, Schwarz, Neovius, Lidinoid — behave differently from the simple FCC and BCC lattices, and Gyroid usually gives the broadest usable response.",
      why: "Gyroid's advantage is that it is fully connected in every direction with no straight-through paths and no flat internal faces. Sound entering it is scattered continuously rather than at discrete interfaces, which widens the gap — and the same property makes it self-supporting when printed.",
      minutes: 15,
    },
    {
      title: "Trade porosity against wall thickness",
      goal: "Find the boundary where acoustic performance meets structural reality.",
      actions: [
        "Fix your chosen topology. Raise **Target Porosity** towards 0.9 and regenerate.",
        "Read the structural integrity assessment, not just the spectrum.",
        "Now drop **Min Wall Thickness** towards 0.4 mm and regenerate.",
        "Read the manufacturability assessment.",
        "Find the combination that keeps both assessments acceptable while still meeting your acoustic target.",
      ],
      expect: "High porosity with thin walls gives excellent absorption and an unbuildable, structurally weak part. Every improvement on one axis costs you on another.",
      why: "0.4 mm is around the practical floor for most polymer printers — below it walls do not form reliably. A design the physics engine likes but a printer cannot produce is not a result, and the manufacturability check is there to stop you reporting one.",
      minutes: 15,
    },
    {
      title: "Test off-axis performance",
      goal: "Check whether your design survives sound arriving from a realistic direction.",
      actions: [
        "Take your best design and raise **Incident Angle** from 0° towards 89°, regenerating as you go.",
        "Watch what happens to absorption at your target frequency.",
        "Find the angle at which the design stops meeting its target.",
      ],
      expect: "Performance holds over a range of angles and then falls away, often sharply.",
      why: "Normal incidence is the easy case and almost never the real one. In a cabin or a room, sound arrives from everywhere, so a design optimised at 0° can underperform badly in service. This step is what separates a plausible design from a deployable one.",
      minutes: 10,
    },
    {
      title: "Inspect the internal structure and use the design assistant",
      goal: "Understand the geometry you have produced rather than treating it as a black box.",
      actions: [
        "Use the **Z-Axis Slice Position** control to cut through the structure and watch the cross-section change.",
        "Open the geometry explainer for the mathematical description of your chosen lattice.",
        "Ask the design assistant why your design behaves as it does.",
      ],
      expect: "Cross-sections showing how the channels connect through the cell, and an explanation tying the topology's equation to its acoustic behaviour.",
      why: "Slicing is how you develop intuition for why some topologies are printable and others need support material that cannot be removed from a closed internal cavity.",
      minutes: 10,
    },
    {
      title: "Save, compare and export",
      goal: "Turn exploration into a defended recommendation.",
      actions: [
        "Save your best design to the **Design Library**.",
        "Save a deliberately different one — different topology, similar target.",
        "Open the comparison view and put them side by side.",
        "Export your chosen design and write two sentences on why you chose it over the alternative.",
      ],
      expect: "Two saved designs compared across bandgap, specific stiffness, structural integrity and manufacturability, with no design winning on all four.",
      why: "The comparison is the deliverable. A single design with good numbers proves nothing; a design chosen over a documented alternative, for stated reasons, is engineering.",
      minutes: 12,
    },
  ],

  troubleshooting: [
    {
      problem: "The unit cell preview is blank.",
      fix: "It needs WebGL. Enable hardware acceleration and use a desktop browser.",
    },
    {
      problem: "The bandgap reports as non-existent whatever I do.",
      fix: "Your target frequency is probably far from what the geometry can address. Very low frequencies need large cells or resonant features; try raising the target frequency to confirm the design responds at all, then work back down.",
    },
    {
      problem: "Every design fails manufacturability.",
      fix: "Wall thickness is below what a printer can produce. Raise Min Wall Thickness above 0.4 mm and reduce porosity to compensate.",
    },
    {
      problem: "The design assistant returns an error.",
      fix: "It calls a language model through a gateway. The physics engine runs locally and is unaffected — you can keep designing while the assistant is unavailable.",
    },
    {
      problem: "My saved designs are gone.",
      fix: "The design library is stored in your browser. Clearing site data or switching browser removes it — export anything you want to keep.",
    },
  ],

  furtherReading: [
    { label: "Cummer, Christensen & Alù, \"Controlling sound with acoustic metamaterials\"", href: "https://www.nature.com/articles/natrevmats201601" },
    { label: "Al-Ketan & Abu Al-Rub — TPMS lattices for additive manufacturing", href: "https://onlinelibrary.wiley.com/doi/10.1002/adem.201900524" },
    { label: "ISO 10534 — determination of sound absorption coefficient in impedance tubes", href: "https://www.iso.org/standard/22851.html" },
  ],
};

export default guide;

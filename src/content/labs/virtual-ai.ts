import type { LabGuide } from "./types";

/**
 * XRD Virtual Laboratory — https://virtual.live-labs.org/
 *
 * Steps follow the app's own five-stage stepper (Sample prep → Instrument setup
 * → Data collection → Data processing → Analysis), because the lab enforces
 * that order: processing is inert without a collected pattern, and the Kα2
 * strip is disabled until the background has been subtracted.
 */
const guide: LabGuide = {
  slug: "virtual-ai",

  summary: {
    tagline:
      "Run a real X-ray diffraction experiment: mount a powder, scan it, and measure how big its crystals are.",
    what: "X-ray diffraction is how scientists find out what a powder actually is, and how big its crystal grains are, without dissolving or destroying it. You shine X-rays at the sample, and the regular rows of atoms inside scatter them into a pattern of sharp peaks — a fingerprint of the material. This lab is a complete diffractometer in your browser: you mount a specimen, choose the X-ray tube, run the scan, clean up the raw data and measure the result, with the real physics running underneath rather than a canned animation.",
    why: "Almost every manufactured solid is checked this way — battery cathodes, pharmaceutical tablets, cement, steel, semiconductor films. A real diffractometer costs upwards of a quarter of a million dollars and beam time is rationed, so most learners never get to make the mistakes that teach the technique: scanning too narrow a range, forgetting to strip the Kα2 satellite, or trusting a crystallite size that strain has quietly ruined. Here those mistakes are free and immediately visible.",
    whoFor: "Materials science, chemistry, physics and engineering students meeting diffraction for the first time, and lab staff who want a safe place to rehearse before touching the instrument. You need no prior XRD experience. School-level trigonometry is enough — the lab explains Bragg's law where you first need it.",
    outcomes: [
      "Read a diffraction pattern and say which peak came from which family of atomic planes",
      "Choose an X-ray tube and a 2θ range that will actually capture the reflections you need",
      "Subtract a background and strip the Kα2 satellite in the correct order, and explain why the order matters",
      "Measure crystallite size from peak width with the Scherrer equation, and state its assumptions",
      "Use a Williamson–Hall plot to separate size broadening from strain broadening, and recognise when Scherrer alone has misled you",
    ],
  },

  /*
   * A silent screen capture of the real lab, recorded by driving the app end to
   * end. Chapter marks were read off the finished cut frame by frame rather
   * than from the recorder's wall clock — the two disagree, because frame
   * delivery slows while the 3D viewer loads.
   */
  video: {
    url: "/demos/virtual-ai.mp4",
    poster: "/demos/virtual-ai.jpg",
    durationSec: 54,
    chapters: [
      { at: 0, label: "The lab: what X-ray diffraction measures" },
      { at: 5, label: "Loading Silicon Powder from the Sample Library" },
      { at: 11, label: "Step 1 — the unit cell in 3D" },
      { at: 20, label: "Step 2 — tube, scan range, crystallite size" },
      { at: 26, label: "Step 3 — running the 2θ scan" },
      { at: 34, label: "Step 4 — background subtraction and Kα2 stripping" },
      { at: 41, label: "Step 5 — peaks, Scherrer and Williamson–Hall" },
    ],
  },

  prerequisites: [
    "A desktop or laptop browser — the 3D unit-cell viewer needs WebGL, and the pattern chart is cramped on a phone",
    "About 40 minutes of uninterrupted time; the five steps build on each other and the lab does not save progress between sessions",
    "Nothing to install, and no data to download",
  ],

  steps: [
    {
      title: "Get your bearings in XRD Basics",
      goal: "Learn the one equation the whole lab rests on before you touch an instrument control.",
      actions: [
        "Open the lab and choose **XRD Basics** in the left sidebar.",
        "Read the derivation of Bragg's law, nλ = 2d·sinθ, and note what each symbol means: λ is the X-ray wavelength, d the spacing between planes of atoms, θ half the angle you will see plotted.",
        "Open **Glossary** in the sidebar and skim the entries for *2θ*, *d-spacing*, *Miller indices* and *FWHM*. These four terms appear in every later step.",
      ],
      expect:
        "You can answer one question in your own words: if the spacing between atomic planes gets smaller, does its peak move to a higher or a lower angle? (Smaller d means larger sinθ, so the peak moves to higher 2θ.)",
      why: "Every result later in the lab is Bragg's law rearranged. Learners who skip this step can still click through the experiment, but they cannot tell a real peak from an artefact, because they have no expectation of where peaks should be.",
      minutes: 6,
    },
    {
      title: "Load a specimen from the Sample Library",
      goal: "Give the instrument something to measure. Nothing else in the lab works until you do.",
      actions: [
        "Click **Sample Library** in the sidebar.",
        "Choose **Silicon Powder** for your first run. It is cubic, space group Fd-3m, and it is the standard the whole field calibrates against — which means you can check your answers against published values.",
        "Note the lattice parameter shown on the card. You will use it to sanity-check your peak positions.",
      ],
      expect:
        "The Virtual Lab becomes available. If you open **Virtual Lab** without loading a sample first, you get the card \"No specimen loaded\" instead of the experiment — that is the lab telling you this step was skipped, not a bug.",
      why: "Silicon is the reference material for a reason: its five reflections between 20° and 80°, their Miller indices and their d-spacings are published to many decimal places, so it is the only sample where you can verify that you did the analysis correctly rather than merely plausibly.",
      minutes: 3,
    },
    {
      title: "Step 1 of the experiment — inspect the unit cell",
      goal: "See the atomic arrangement that is about to produce your pattern.",
      actions: [
        "Click **Virtual Lab** in the sidebar. The five-step stepper appears on the left on a wide screen, or as a row of numbered chips above the work area on a narrow one.",
        "You start on **Sample prep**. Wait a moment for the 3D viewer to load — it is fetched only when this step opens.",
        "Drag to rotate the unit cell. Look along an edge, then along a face diagonal, and notice that the atoms line up into flat sheets from some directions and not others.",
      ],
      expect:
        "A rotating unit cell labelled with the sample name, its crystal system and space group — for silicon, \"Silicon Powder — Cubic, Fd-3m\".",
      why: "Those flat sheets are the diffracting planes. A peak in your pattern is one family of sheets, and the angle it appears at is set by how far apart they are. Rotating the cell until you can see the sheets is the fastest way to make Miller indices stop feeling arbitrary.",
      minutes: 4,
    },
    {
      title: "Step 2 — configure the instrument",
      goal: "Choose the X-ray tube and scan window, and prepare a specimen whose true crystallite size you know.",
      actions: [
        "Click **Instrument setup**.",
        "Leave **X-ray tube** on the copper anode for your first run. Copper Kα is the workhorse of powder diffraction.",
        "Set **Start angle** to 20° and **End angle** to 90°. That window contains all five silicon reflections you are going to look for.",
        "Set **Specimen crystallite size** to 35 nm and write the number down. The analysis step will try to recover it from the peak widths alone, and comparing the two is the point of the experiment.",
        "Leave **Microstrain** at 0 for now. You will come back and raise it deliberately in the last step.",
      ],
      expect:
        "Four controls showing live values in their labels — the tube name, both angles in degrees, the size in nanometres, and the strain in scientific notation.",
      why: "Change the tube and every reflection moves, because λ changes while d does not; pick a long enough wavelength and the closest planes go beyond reach entirely, since sinθ cannot exceed 1. This is the single most common way a real scan comes back missing peaks that the operator expected to see.",
      minutes: 5,
    },
    {
      title: "Step 3 — collect the pattern",
      goal: "Run the scan and get raw data with all its real-world imperfections.",
      actions: [
        "Click **Data collection**, then the **Run scan** button.",
        "Read the status line that appears: \"Scan complete. Continue to Data processing.\"",
        "Look at the raw trace. Note three things: the sharp peaks, the sloping background they sit on, and the scatter on every point.",
      ],
      expect:
        "A diffraction pattern across your chosen 2θ range with the strongest silicon peak near 28.4°, sitting on a visible background. Running the same setup again reproduces the same pattern exactly — the generator is seeded from your settings, so a difference in the result always means a difference in the setup.",
      why: "That background is not a defect to be ignored. It comes from air scatter, sample fluorescence and the sample holder, and it is what makes automated peak finding hard. The scatter is counting statistics: X-ray detection is a Poisson process, so the noise on a channel grows as the square root of its intensity.",
      minutes: 4,
    },
    {
      title: "Step 4 — process the raw data, in the right order",
      goal: "Turn a raw trace into something measurable, and see what happens when you get the order wrong.",
      actions: [
        "Click **Data processing**.",
        "Tick **Subtract background** first. Watch the baseline flatten onto zero and the trace change colour to mark it as processed.",
        "Now tick **Strip Kα2 (Rachinger)**. Watch the small shoulder on the high-angle side of each peak disappear.",
        "Untick **Subtract background** and notice that the Kα2 option is disabled and clears itself. Try to do it in the wrong order and the lab will not let you.",
      ],
      expect:
        "After both corrections: a flat zero baseline and single, clean, symmetric peaks. The Kα2 shoulders are most obvious on the high-angle peaks, so look there rather than at the big peak near 28°.",
      why: "A laboratory X-ray tube emits two closely spaced wavelengths, Kα1 and Kα2, so every reflection arrives twice, slightly apart — and the split widens with angle. The Rachinger correction subtracts the weaker copy. It has no concept of a baseline, so run on raw data it strips half the background at every channel as well, which is why the lab requires the background subtraction first.",
      minutes: 6,
    },
    {
      title: "Step 5 — find the peaks and measure crystallite size",
      goal: "Recover a physical property of the specimen from the shape of its peaks.",
      actions: [
        "Click **Analysis**, then **Find peaks**.",
        "Check the peak table against the published silicon reflections: (111) near 28.4°, (220) near 47.3°, (311) near 56.1°, (400) near 69.1° and (331) near 76.4°.",
        "In **Crystallite size (Scherrer)**, choose a peak from the dropdown — pick one at high angle rather than the first one — and click through to the calculation.",
        "Compare the number the lab reports with the 35 nm you set in step 2.",
      ],
      expect:
        "An indexed peak table and an estimated crystallite size near, but not exactly, 35 nm. The lab prints the comparison for you and explains the gap: Scherrer attributes every bit of broadening to size and ignores strain.",
      why: "Small crystals broaden peaks because there are too few parallel planes to cancel out scattering away from the exact Bragg angle. The Scherrer equation inverts that relationship. The lab removes instrumental broadening in quadrature first — without that correction, you measure the diffractometer instead of the sample. If your chosen peak is too sharp to distinguish from the instrument, the lab tells you the result is a lower bound only and asks you to pick a peak at higher angle.",
      minutes: 7,
    },
    {
      title: "Break Scherrer on purpose, then fix it with Williamson–Hall",
      goal: "Understand the limitation that makes single-peak sizing untrustworthy in real work.",
      actions: [
        "Go back to **Instrument setup** and raise **Microstrain** to around 3 × 10⁻³, leaving crystallite size at 35 nm.",
        "Re-run **Data collection**, redo both corrections in **Data processing**, then **Find peaks** again.",
        "Run **Crystallite size (Scherrer)** on the same peak as before and note how much smaller the reported size now is.",
        "Now run **Size and strain (Williamson–Hall)**, which fits all the peaks at once, and compare both numbers against what you actually set.",
      ],
      expect:
        "Scherrer reports a crystallite far smaller than the 35 nm you prepared — the strain broadening has been misread as size. Williamson–Hall returns a size close to 35 nm *and* a strain close to the value you dialled in.",
      why: "This is the payoff of the whole lab. Size broadening and strain broadening have different angular dependence: size broadening scales as 1/cosθ, strain broadening as tanθ. A single peak cannot separate two effects from one measurement, but plotting all the peaks against sinθ turns them into a straight line whose intercept is size and whose slope is strain. Published crystallite sizes derived from one peak, with no strain analysis, should always be read with this in mind.",
      minutes: 8,
    },
    {
      title: "Consolidate with the Case Explorer and the assessment",
      goal: "Apply the workflow to a material you have not seen, without the training wheels.",
      actions: [
        "Load **Calcite** or **Sodium Chloride** from the Sample Library and run the full five steps again from memory.",
        "Open **Case Explorer** and work through a real-world scenario end to end.",
        "If your account has it, open **Assessment** and take the quiz.",
      ],
      expect:
        "You complete the whole sequence without referring back to this page. Calcite is trigonal rather than cubic, so its pattern is denser and less obviously indexed — that difficulty is the lesson.",
      why: "Cubic materials are the easy case; their peak positions follow a simple integer relationship that makes indexing almost automatic. Lower-symmetry crystals do not, which is why real phase identification leans on reference databases rather than arithmetic.",
      minutes: 8,
    },
  ],

  troubleshooting: [
    {
      problem: "The Virtual Lab shows \"No specimen loaded\" instead of the experiment.",
      fix: "Open Sample Library in the sidebar and click a material first. The lab deliberately refuses to run an instrument with nothing mounted.",
    },
    {
      problem: "The 3D unit cell never appears on the Sample prep step.",
      fix: "The viewer needs WebGL. Check that hardware acceleration is enabled in your browser settings, and try a desktop browser — some mobile browsers and remote-desktop sessions disable WebGL entirely.",
    },
    {
      problem: "The Strip Kα2 checkbox is greyed out and will not tick.",
      fix: "Working as intended. Tick Subtract background first — the Rachinger correction would otherwise remove half your baseline as well.",
    },
    {
      problem: "Find peaks returns nothing, or far fewer peaks than expected.",
      fix: "Two usual causes. Either you have not collected a pattern yet, or your scan range excludes the reflections: widen the window to 20–90° and re-run the scan.",
    },
    {
      problem: "Scherrer reports a size wildly different from what I set.",
      fix: "If it is much smaller, you almost certainly have microstrain dialled in — that is the intended lesson of step 8, so switch to Williamson–Hall. If the lab flags the result as a lower bound, your chosen peak is too narrow relative to instrumental broadening; pick a peak at higher 2θ.",
    },
    {
      problem: "My pattern looks different from a classmate's with the same sample.",
      fix: "Compare your Instrument setup settings. The pattern is generated deterministically from the tube, angles, size and strain, so identical settings always give an identical pattern and any difference means a setting differs.",
    },
  ],

  furtherReading: [
    { label: "IUCr — International Tables for Crystallography (space groups, Miller indices)", href: "https://it.iucr.org/" },
    { label: "Crystallography Open Database — free reference patterns", href: "https://www.crystallography.net/cod/" },
    { label: "NIST SRM 640 — the silicon powder line-position standard", href: "https://www.nist.gov/srm" },
    { label: "GROMACS-style tutorial conventions used by these guides", href: "https://tutorials.gromacs.org/" },
  ],
};

export default guide;

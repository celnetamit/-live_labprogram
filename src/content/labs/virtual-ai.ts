import type { LabGuide } from "./types";

/**
 * XRD Virtual Laboratory — https://virtual.live-labs.org/
 *
 * Rewritten for the server-backed lab (v2.0.0). The previous guide described an
 * app that no longer exists: a five-stage stepper, a "Sample Library" sidebar
 * and a "Run scan" button. The lab is now a 13-step project workflow at three
 * levels, the specimen's true microstructure is held server-side until the
 * learner submits a conclusion, and projects are saved against the account.
 *
 * Steps below follow the lab's own stepper one for one, so the "Steps" figure in
 * the hero matches what the learner actually sees and the tutorial can be
 * followed with the lab open beside it.
 */
const guide: LabGuide = {
  slug: "virtual-ai",

  summary: {
    tagline:
      "Run a full diffraction experiment end to end: prepare a specimen, acquire a pattern point by point, analyse it, then defend your conclusion against the hidden truth.",
    what: "X-ray diffraction identifies what a powder is, and how big its crystal grains are, without dissolving or destroying it. You shine X-rays at the specimen and the regular rows of atoms scatter them into a pattern of sharp peaks — a fingerprint of the material. This lab is a complete diffractometer in your browser, and it is run as a project rather than a demonstration: you read a brief, prepare the specimen, configure the instrument against a finite time budget, acquire the pattern point by point, process and fit it, and commit to a conclusion. Only then does the lab reveal what the specimen actually was, and score how close you came.",
    why: "Almost every manufactured solid is checked this way — battery cathodes, pharmaceutical tablets, cement, steel, semiconductor films. A real diffractometer costs upwards of a quarter of a million dollars and beam time is rationed, so most learners never get to make the mistakes that teach the technique: scanning too narrow a range, counting for too short a time, processing in the wrong order, or trusting a crystallite size that strain has quietly ruined. Here those mistakes are free, immediately visible in the pattern, and scored against the truth afterwards.",
    whoFor: "Materials science, chemistry, physics and engineering students meeting diffraction for the first time, and lab staff rehearsing before they touch the instrument. Start at Basic: it assumes no prior XRD and school-level trigonometry, and explains Bragg's law where you first need it. Moderate and Expert assume you have worked through the level below.",
    outcomes: [
      "Prepare a powder specimen and predict how grinding, packing and height errors will distort the pattern",
      "Design a scan — source, 2θ range, step size and counting time — and justify it against a finite instrument-time budget",
      "Subtract a background and strip the Kα2 satellite in the correct order, and explain why the order is not interchangeable",
      "Fit peaks with pseudo-Voigt profiles and read the diagnostics that decide whether a fit may be used at all",
      "Assign reflections to a reference phase and state what that evidence does and does not establish",
      "Measure crystallite size with the Scherrer equation, correct for instrumental broadening, and say when the lab should refuse to give a number",
      "Commit to a conclusion with a stated confidence, then compare it with the hidden ground truth and redesign the experiment that fell short",
    ],
  },

  /*
   * Recorded from the running lab with scripts/record-demo.mjs — the Basic
   * calcite project, driven end to end through the real interface. Silent
   * screen capture with a caption bar; no narration.
   *
   * Chapter marks are the recorder's, rescaled to the finished cut, then
   * checked frame by frame — two labels were wrong against the footage and are
   * corrected here rather than in the shot list. The walkthrough stops at the
   * conclusion instead of submitting one, so nothing claims to show the
   * validation screen.
   */
  video: {
    url: "/demos/virtual-ai.mp4",
    poster: "/demos/virtual-ai.jpg",
    durationSec: 181,
    chapters: [
      { at: 0, label: "What the lab is" },
      { at: 10, label: "Choose a level and meet the sample" },
      { at: 32, label: "Prepare the specimen" },
      { at: 58, label: "Configure the instrument" },
      { at: 71, label: "Start the virtual scan" },
      { at: 109, label: "Process the raw pattern" },
      { at: 135, label: "Assign reflections and analyse" },
      { at: 162, label: "Commit to a conclusion" },
      { at: 176, label: "Where to get help" },
    ],
  },

  prerequisites: [
    "A desktop or laptop browser. The crystal-structure viewer needs WebGL, and the pattern chart wants width — the lab works on a phone but the charts are cramped",
    "Around an hour for the Basic project following this tutorial. The lab itself estimates 45 minutes of workflow; the rest is reading the explanations here. Your work is saved against your Live Labs account as you go, so you can stop and resume at the step you left",
    "Nothing to install and no data to download. Basic and Moderate are included with the lab; Expert is a separate paid tier, and is open to platform admins and invited expert reviewers without purchase",
  ],

  steps: [
    {
      title: "Read the project brief and answer the pre-lab diagnostic",
      goal: "Find out what you are being asked to determine, and what the lab already knows that you do not.",
      actions: [
        "Launch the lab, choose **Basic — Learn XRD**, and read the brief for **CALCITE-BEG-001**.",
        "Note the research question and the **Sample visibility** panel: calcite's identity is given to you, its crystallite size is not.",
        "Note the budget — 150 minutes of instrument time and up to 6 runs — then answer the short pre-lab questions.",
        "Click **Start this project**.",
      ],
      expect:
        "The 13-step workflow opens with the stepper on the left, a project header showing your instrument-time budget, and every step after the brief locked until the diagnostic is done.",
      why: "The diagnostic is asked before you see any data on purpose. Predicting what a choice will do, and then watching it happen, is what separates running an instrument from understanding one — and the lab scores the prediction, not just the result.",
      minutes: 5,
    },
    {
      title: "Inspect the specimen",
      goal: "See the crystal structure that is about to produce your pattern.",
      actions: [
        "Open **Sample**. Wait for the structure viewer to load — it is fetched only when this step opens.",
        "Drag to rotate the calcite unit cell. Look along an edge, then along a face diagonal, and notice the atoms line up into flat sheets from some directions and not others.",
        "Read what is disclosed: trigonal, space group R-3c, with its published lattice parameters.",
      ],
      expect:
        "A rotating unit cell labelled with the phase, its crystal system and space group, alongside the specimen's declared form — loose powder.",
      why: "Those flat sheets are the diffracting planes. Each peak in your pattern is one family of sheets, and the angle it appears at is set by how far apart they are. Rotating the cell until you can see the sheets is the fastest way to make Miller indices stop feeling arbitrary.",
      minutes: 4,
    },
    {
      title: "Prepare the specimen",
      goal: "Make the physical choices that decide whether your pattern is worth analysing.",
      actions: [
        "Open **Prepare specimen** and work through the loose-powder route in order: grind, fill, pack, level, mount.",
        "Read the **Why** under each choice before you make it — each names the physical effect it controls.",
        "Check the **Named effects on the pattern** panel on the right, then click **Save changes to preparation**.",
      ],
      expect:
        "\"No adverse effects — this specimen should give a representative pattern\", plus a summary of surface height, particle statistics, roughness and orientation tendency.",
      why: "Preparation is where most real diffraction data is lost. Too coarse a grind and too few crystallites diffract, so relative intensities stop meaning anything; pack a plate-like crystal hard and it lies down, exaggerating one reflection; sit the surface proud of the reference plane and every peak shifts. The lab models each of these separately so you can see them one at a time.",
      minutes: 5,
    },
    {
      title: "Configure the instrument",
      goal: "Design a scan, and see what it costs before you spend anything.",
      actions: [
        "Open **Configure instrument**. In Basic the recommended Cu Kα setup is fixed, so read the controls rather than change them.",
        "Check **What this scan will be**: point count, counting time, physical scan time and the sampling figure in points per FWHM.",
        "Check **Reflection coverage** — how many calcite reflections fall inside 20–80°, and how many fall outside it.",
        "Click **Create run and go to the scan**.",
      ],
      expect:
        "About 3,001 points, roughly 53 minutes of instrument time against your 150-minute budget, sampling near 3 points per FWHM marked \"adequate\", and 11 reflections inside the range.",
      why: "Step size, counting time and range trade against each other and against the clock. Too coarse a step and a peak is defined by two points, so its width — and therefore your crystallite size — is guesswork. Too short a dwell and the counting noise swamps the weak reflections you need for a lattice refinement. The derived figures exist so the trade is visible before you commit, rather than obvious afterwards.",
      minutes: 5,
    },
    {
      title: "Acquire the pattern",
      goal: "Watch a diffraction pattern being measured, one point at a time.",
      actions: [
        "On **Virtual scan**, click **Start virtual XRD scan**.",
        "Watch the goniometer sweep and the counts arrive. Change **Playback speed** — it changes only how fast points are shown, never the counts.",
        "Let it finish, then read the three tiles: points acquired, elapsed virtual time and physical scan time.",
      ],
      expect:
        "A pattern building left to right, the strongest calcite reflection near 29.4° 2θ, and a completed run listed in **Runs in this project** with its seed.",
      why: "The scan is progressive because a real one is: the detector is at exactly one angle at a time, and a pattern is a record of where it has already been. That is also why stopping early is a real decision with a real consequence — the points beyond where you stopped do not exist, and no amount of processing will invent them.",
      minutes: 5,
    },
    {
      title: "Process the raw pattern, in the right order",
      goal: "Turn raw counts into something measurable, without destroying the evidence.",
      actions: [
        "Open **Process**. Note the existing history: background subtraction (SNIP) first, then Kα2 removal.",
        "Use the **Both / Raw / Processed** control to overlay the raw trace against the processed one.",
        "Try reordering or disabling a step and watch the analysis recompute from the raw counts every time.",
      ],
      expect:
        "A flat baseline and single, clean peaks. The Kα2 shoulders are most obvious on the high-angle reflections, so look above 45° rather than at the tallest peak.",
      why: "A laboratory tube emits two close wavelengths, so every reflection arrives twice, slightly apart, and the split widens with angle. The Rachinger correction subtracts the weaker copy — but it has no concept of a baseline, so run on raw data it strips part of the background at every channel too. That is why the order is enforced rather than suggested. The raw counts are never overwritten: processing is a reversible history, so a wrong choice costs nothing but a click.",
      minutes: 5,
    },
    {
      title: "Detect and fit the peaks",
      goal: "Get peak positions and widths with uncertainties, and learn which fits may be used.",
      actions: [
        "Open **Detect & fit peaks**. Peaks above the counting noise are found automatically at the recommended settings.",
        "Click the tallest peak on the chart and read its **Fit diagnostics**: converged, FWHM uncertainty, signal-to-noise, reduced χ², Durbin–Watson, clipping, saturation and overlap.",
        "Scan the **Peak table** for rows the lab rejected, and read the reason given for each.",
      ],
      expect:
        "Around 18 fitted peaks with roughly 12 accepted, and an **Accepted** verdict on the strongest. Rejected rows name their cause — usually a signal-to-noise below 5.",
      why: "A peak that looks fine can still be unusable. The diagnostics are the conditions under which a pseudo-Voigt width means what you are about to assume it means, and the lab refuses a measurement whose conditions are not met rather than quietly returning a number. Getting used to reading them here is the habit that stops a plausible-looking crystallite size being published later.",
      minutes: 6,
    },
    {
      title: "Assign the reflections",
      goal: "Connect your measured peaks to the reference structure, and see what that does and does not prove.",
      actions: [
        "Open **Assign reflections**. Reference markers show where calcite diffracts; triangles are your fitted peaks.",
        "Work down the assignment table comparing 2θ observed against 2θ reference, and watch the Δ2θ column for an outlier.",
        "Click a peak to open its evidence, then complete the scored task: record its 2θ, d-spacing and (hkl).",
      ],
      expect:
        "Most peaks assigned with Δ2θ within about 0.02°, observed d-spacings matching the reference to three or four decimals, and observed intensities tracking the reference ones.",
      why: "Matching peaks to a known structure is not the same as indexing an unknown one — inferring a unit cell from peak positions alone is a harder, separate problem. Reference matching gives evidence for a phase identification, never proof, and never a phase percentage. The lab is deliberate about that distinction because published work often is not.",
      minutes: 6,
    },
    {
      title: "Analyse: lattice, size and strain",
      goal: "Turn positions and widths into physical quantities, with their uncertainties.",
      actions: [
        "Open **Analyse**. On **d-spacing & lattice**, read the refined lattice parameters against the published values, with the zero-shift term the refinement absorbed.",
        "Switch to **Scherrer size**. Pick a high-angle reflection rather than the first one, and read the instrument-corrected breadth and the confidence class.",
        "Note where the lab refuses: a peak too narrow relative to instrumental broadening gives a lower bound, not a size.",
      ],
      expect:
        "Lattice parameters within a fraction of a percent of the reference, and a crystallite size with an uncertainty and a High / Moderate / Low / Not Reliably Estimable class attached.",
      why: "Small crystals broaden peaks because there are too few parallel planes to cancel scattering away from the exact Bragg angle, and Scherrer inverts that relationship. But it attributes every bit of broadening to size, so microstrain is read as smaller crystals. Williamson–Hall separates the two using their different angular dependence — size as 1/cos θ, strain as tan θ — and you will use it at Moderate.",
      minutes: 7,
    },
    {
      title: "Commit to a conclusion",
      goal: "State what you found and how confident you are, before you are allowed to see the answer.",
      actions: [
        "Open **Interpret & submit**. Write your conclusion, give a crystallite size with its uncertainty, and choose a confidence level.",
        "Say what most limits that confidence, in your own words.",
        "Submit. The submission locks your answer.",
      ],
      expect:
        "A confirmation that the project is submitted, the truth revealed, and your conclusion locked against further editing.",
      why: "The ground truth is held on the server and never sent to the browser until this moment — you cannot read it out of the page source, because it is not in the page. Committing first is what makes the comparison afterwards worth anything: a confidence stated before the reveal is a measurement of your judgement, and one stated after is not.",
      minutes: 5,
    },
    {
      title: "See the validation",
      goal: "Compare what you concluded with what was actually there.",
      actions: [
        "Open **Validation**. Read your value against the hidden truth and the validated acceptance interval.",
        "Read which of your claims were accepted, and which fell outside tolerance.",
        "Where you missed, note what the lab says would have closed the gap — usually a longer dwell, a wider range or a different peak.",
      ],
      expect:
        "A side-by-side comparison with the true crystallite size, marked against an acceptance interval derived from the validation pack rather than from your own run.",
      why: "The intervals are not arbitrary tolerances. They come from the same reference calculation the engine is checked against, so falling inside one means your measurement agrees with an independently computed answer — and falling outside it points at a specific decision you made earlier, which is the part worth redesigning.",
      minutes: 5,
    },
    {
      title: "Take the assessment",
      goal: "Check that the concepts transferred, not just the clicks.",
      actions: [
        "Open **Assessment** and answer the concept questions.",
        "Review how the practical tasks you completed during the workflow were scored.",
        "Revisit any Knowledge Bank module the feedback links to, then re-read the question.",
      ],
      expect:
        "A score combining the concept quiz, the pre-lab diagnostic and the practical tasks recorded from what you actually did in the workflow.",
      why: "Part of the score comes from the work itself — stopping a trial scan where you were asked to, linking a peak to its evidence — so it measures the experiment you ran rather than only what you can recall afterwards.",
      minutes: 6,
    },
    {
      title: "Export the report",
      goal: "Leave with something you could hand to a supervisor.",
      actions: [
        "Open **Report & export** and read the full project record: settings, preparation, processing history, fits, analysis and your conclusion.",
        "Export the pattern data, the structure and the project record.",
        "Check the provenance block — engine versions, instrument profile and the seed that reproduces your run exactly.",
      ],
      expect:
        "A complete report, and exports that carry enough provenance for someone else to reproduce the run point for point.",
      why: "A result without its method is not reproducible, and the seed is the part people forget. Because the counting noise is seeded from your settings, a replay reproduces the same counts exactly — so a difference in someone else's result always means a difference in their setup, which is the only way a disagreement can be settled.",
      minutes: 5,
    },
  ],

  troubleshooting: [
    {
      problem: "The Virtual scan step says \"No run configured yet\".",
      fix: "Go back to Configure instrument and click **Create run and go to the scan**. The Next button at the top and bottom of the page only navigates — it does not create the run.",
    },
    {
      problem: "A step in the stepper is greyed out with a padlock.",
      fix: "Working as intended: the workflow is ordered. Hover the step to see what it is waiting for — usually the pre-lab diagnostic, a saved preparation, or acquired data. Validation stays locked until you submit a conclusion.",
    },
    {
      problem: "The Kα2 removal step is unavailable in Process.",
      fix: "Either the background has not been subtracted yet, or your source has no Kα2 to remove — a monochromated or synchrotron-style preset emits a single wavelength, so the correction has nothing to do.",
    },
    {
      problem: "Scherrer returns \"Not Reliably Estimable\" instead of a size.",
      fix: "The peak you chose is too narrow relative to the instrument, so the sample's own contribution cannot be separated from the instrumental width. Pick a reflection at higher 2θ, or acquire with a longer dwell so the weaker high-angle peaks are fitted at all.",
    },
    {
      problem: "The detector saturated during the scan.",
      fix: "Reduce tube power or dwell time and run a new replicate. Saturated points are clipped, so the peak top is flat and its width is meaningless — the lab will refuse to use it for breadth analysis.",
    },
    {
      problem: "I have run out of instrument time or runs.",
      fix: "Both are finite by design — 150 minutes and 6 runs at Basic. Use **Replay** to re-watch a run you already paid for without spending more, and **Extend** to add angles to an existing run rather than re-scanning the whole range.",
    },
    {
      problem: "Expert is shown as a paid tier and will not start.",
      fix: "Basic and Moderate come with the lab; the Expert tier is purchased separately. Platform admins and invited expert reviewers get it without purchase. If the page says access could not be confirmed, that is a service problem rather than a refusal — try again shortly.",
    },
    {
      problem: "I was asked to sign a reviewer agreement before the lab would open.",
      fix: "Your account has been given expert-reviewer access to this pre-release lab. Read and sign the confidentiality undertaking and the lab opens immediately; you will not be asked again unless the wording changes.",
    },
    {
      problem: "My results differ from a classmate's on the same sample.",
      fix: "Compare settings and seeds in the report's provenance block. The counts are generated deterministically, so identical settings and the same seed give an identical pattern — any difference means a decision differed, and the report says which.",
    },
  ],

  furtherReading: [
    { label: "IUCr — International Tables for Crystallography (space groups, Miller indices)", href: "https://it.iucr.org/" },
    { label: "Crystallography Open Database — the source of this lab's reference structures", href: "https://www.crystallography.net/cod/" },
    { label: "NIST Standard Reference Materials — line-position and line-profile standards", href: "https://www.nist.gov/srm" },
    { label: "pymatgen — the independent implementation this lab's engine is checked against", href: "https://pymatgen.org/" },
  ],
};

export default guide;

# Demo video shot list — `virtual-ai`

Target runtime **00:54**. Generated from `src/content/labs/virtual-ai.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- A desktop or laptop browser — the 3D unit-cell viewer needs WebGL, and the pattern chart is cramped on a phone
- About 40 minutes of uninterrupted time; the five steps build on each other and the lab does not save progress between sessions
- Nothing to install, and no data to download

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:05 | The lab: what X-ray diffraction measures | _fill in during storyboard_ |
| 00:05 | 00:11 | Loading Silicon Powder from the Sample Library | _fill in during storyboard_ |
| 00:11 | 00:20 | Step 1 — the unit cell in 3D | _fill in during storyboard_ |
| 00:20 | 00:26 | Step 2 — tube, scan range, crystallite size | _fill in during storyboard_ |
| 00:26 | 00:34 | Step 3 — running the 2θ scan | _fill in during storyboard_ |
| 00:34 | 00:41 | Step 4 — background subtraction and Kα2 stripping | _fill in during storyboard_ |
| 00:41 | 00:54 | Step 5 — peaks, Scherrer and Williamson–Hall | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> X-ray diffraction is how scientists find out what a powder actually is, and how big its crystal grains are, without dissolving or destroying it. You shine X-rays at the sample, and the regular rows of atoms inside scatter them into a pattern of sharp peaks — a fingerprint of the material. This lab is a complete diffractometer in your browser: you mount a specimen, choose the X-ray tube, run the scan, clean up the raw data and measure the result, with the real physics running underneath rather than a canned animation.

**Then work the 9 tutorial steps** (51 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Get your bearings in XRD Basics

_Learn the one equation the whole lab rests on before you touch an instrument control._

Show, in order:

- Open the lab and choose XRD Basics in the left sidebar.
- Read the derivation of Bragg's law, nλ = 2d·sinθ, and note what each symbol means: λ is the X-ray wavelength, d the spacing between planes of atoms, θ half the angle you will see plotted.
- Open Glossary in the sidebar and skim the entries for *2θ*, *d-spacing*, *Miller indices* and *FWHM*. These four terms appear in every later step.

**Hold the shot on:** You can answer one question in your own words: if the spacing between atomic planes gets smaller, does its peak move to a higher or a lower angle? (Smaller d means larger sinθ, so the peak moves to higher 2θ.)

**Say over it:** Every result later in the lab is Bragg's law rearranged. Learners who skip this step can still click through the experiment, but they cannot tell a real peak from an artefact, because they have no expectation of where peaks should be.

### 2. Load a specimen from the Sample Library

_Give the instrument something to measure. Nothing else in the lab works until you do._

Show, in order:

- Click Sample Library in the sidebar.
- Choose Silicon Powder for your first run. It is cubic, space group Fd-3m, and it is the standard the whole field calibrates against — which means you can check your answers against published values.
- Note the lattice parameter shown on the card. You will use it to sanity-check your peak positions.

**Hold the shot on:** The Virtual Lab becomes available. If you open Virtual Lab without loading a sample first, you get the card "No specimen loaded" instead of the experiment — that is the lab telling you this step was skipped, not a bug.

**Say over it:** Silicon is the reference material for a reason: its five reflections between 20° and 80°, their Miller indices and their d-spacings are published to many decimal places, so it is the only sample where you can verify that you did the analysis correctly rather than merely plausibly.

### 3. Step 1 of the experiment — inspect the unit cell

_See the atomic arrangement that is about to produce your pattern._

Show, in order:

- Click Virtual Lab in the sidebar. The five-step stepper appears on the left on a wide screen, or as a row of numbered chips above the work area on a narrow one.
- You start on Sample prep. Wait a moment for the 3D viewer to load — it is fetched only when this step opens.
- Drag to rotate the unit cell. Look along an edge, then along a face diagonal, and notice that the atoms line up into flat sheets from some directions and not others.

**Hold the shot on:** A rotating unit cell labelled with the sample name, its crystal system and space group — for silicon, "Silicon Powder — Cubic, Fd-3m".

**Say over it:** Those flat sheets are the diffracting planes. A peak in your pattern is one family of sheets, and the angle it appears at is set by how far apart they are. Rotating the cell until you can see the sheets is the fastest way to make Miller indices stop feeling arbitrary.

### 4. Step 2 — configure the instrument

_Choose the X-ray tube and scan window, and prepare a specimen whose true crystallite size you know._

Show, in order:

- Click Instrument setup.
- Leave X-ray tube on the copper anode for your first run. Copper Kα is the workhorse of powder diffraction.
- Set Start angle to 20° and End angle to 90°. That window contains all five silicon reflections you are going to look for.
- Set Specimen crystallite size to 35 nm and write the number down. The analysis step will try to recover it from the peak widths alone, and comparing the two is the point of the experiment.
- Leave Microstrain at 0 for now. You will come back and raise it deliberately in the last step.

**Hold the shot on:** Four controls showing live values in their labels — the tube name, both angles in degrees, the size in nanometres, and the strain in scientific notation.

**Say over it:** Change the tube and every reflection moves, because λ changes while d does not; pick a long enough wavelength and the closest planes go beyond reach entirely, since sinθ cannot exceed 1. This is the single most common way a real scan comes back missing peaks that the operator expected to see.

### 5. Step 3 — collect the pattern

_Run the scan and get raw data with all its real-world imperfections._

Show, in order:

- Click Data collection, then the Run scan button.
- Read the status line that appears: "Scan complete. Continue to Data processing."
- Look at the raw trace. Note three things: the sharp peaks, the sloping background they sit on, and the scatter on every point.

**Hold the shot on:** A diffraction pattern across your chosen 2θ range with the strongest silicon peak near 28.4°, sitting on a visible background. Running the same setup again reproduces the same pattern exactly — the generator is seeded from your settings, so a difference in the result always means a difference in the setup.

**Say over it:** That background is not a defect to be ignored. It comes from air scatter, sample fluorescence and the sample holder, and it is what makes automated peak finding hard. The scatter is counting statistics: X-ray detection is a Poisson process, so the noise on a channel grows as the square root of its intensity.

### 6. Step 4 — process the raw data, in the right order

_Turn a raw trace into something measurable, and see what happens when you get the order wrong._

Show, in order:

- Click Data processing.
- Tick Subtract background first. Watch the baseline flatten onto zero and the trace change colour to mark it as processed.
- Now tick Strip Kα2 (Rachinger). Watch the small shoulder on the high-angle side of each peak disappear.
- Untick Subtract background and notice that the Kα2 option is disabled and clears itself. Try to do it in the wrong order and the lab will not let you.

**Hold the shot on:** After both corrections: a flat zero baseline and single, clean, symmetric peaks. The Kα2 shoulders are most obvious on the high-angle peaks, so look there rather than at the big peak near 28°.

**Say over it:** A laboratory X-ray tube emits two closely spaced wavelengths, Kα1 and Kα2, so every reflection arrives twice, slightly apart — and the split widens with angle. The Rachinger correction subtracts the weaker copy. It has no concept of a baseline, so run on raw data it strips half the background at every channel as well, which is why the lab requires the background subtraction first.

### 7. Step 5 — find the peaks and measure crystallite size

_Recover a physical property of the specimen from the shape of its peaks._

Show, in order:

- Click Analysis, then Find peaks.
- Check the peak table against the published silicon reflections: (111) near 28.4°, (220) near 47.3°, (311) near 56.1°, (400) near 69.1° and (331) near 76.4°.
- In Crystallite size (Scherrer), choose a peak from the dropdown — pick one at high angle rather than the first one — and click through to the calculation.
- Compare the number the lab reports with the 35 nm you set in step 2.

**Hold the shot on:** An indexed peak table and an estimated crystallite size near, but not exactly, 35 nm. The lab prints the comparison for you and explains the gap: Scherrer attributes every bit of broadening to size and ignores strain.

**Say over it:** Small crystals broaden peaks because there are too few parallel planes to cancel out scattering away from the exact Bragg angle. The Scherrer equation inverts that relationship. The lab removes instrumental broadening in quadrature first — without that correction, you measure the diffractometer instead of the sample. If your chosen peak is too sharp to distinguish from the instrument, the lab tells you the result is a lower bound only and asks you to pick a peak at higher angle.

### 8. Break Scherrer on purpose, then fix it with Williamson–Hall

_Understand the limitation that makes single-peak sizing untrustworthy in real work._

Show, in order:

- Go back to Instrument setup and raise Microstrain to around 3 × 10⁻³, leaving crystallite size at 35 nm.
- Re-run Data collection, redo both corrections in Data processing, then Find peaks again.
- Run Crystallite size (Scherrer) on the same peak as before and note how much smaller the reported size now is.
- Now run Size and strain (Williamson–Hall), which fits all the peaks at once, and compare both numbers against what you actually set.

**Hold the shot on:** Scherrer reports a crystallite far smaller than the 35 nm you prepared — the strain broadening has been misread as size. Williamson–Hall returns a size close to 35 nm *and* a strain close to the value you dialled in.

**Say over it:** This is the payoff of the whole lab. Size broadening and strain broadening have different angular dependence: size broadening scales as 1/cosθ, strain broadening as tanθ. A single peak cannot separate two effects from one measurement, but plotting all the peaks against sinθ turns them into a straight line whose intercept is size and whose slope is strain. Published crystallite sizes derived from one peak, with no strain analysis, should always be read with this in mind.

### 9. Consolidate with the Case Explorer and the assessment

_Apply the workflow to a material you have not seen, without the training wheels._

Show, in order:

- Load Calcite or Sodium Chloride from the Sample Library and run the full five steps again from memory.
- Open Case Explorer and work through a real-world scenario end to end.
- If your account has it, open Assessment and take the quiz.

**Hold the shot on:** You complete the whole sequence without referring back to this page. Calcite is trigonal rather than cubic, so its pattern is denser and less obviously indexed — that difficulty is the lesson.

**Say over it:** Cubic materials are the easy case; their peak positions follow a simple integer relationship that makes indexing almost automatic. Lower-symmetry crystals do not, which is why real phase identification leans on reference databases rather than arithmetic.

## Close with

- Read a diffraction pattern and say which peak came from which family of atomic planes
- Choose an X-ray tube and a 2θ range that will actually capture the reflections you need
- Subtract a background and strip the Kα2 satellite in the correct order, and explain why the order matters
- Measure crystallite size from peak width with the Scherrer equation, and state its assumptions
- Use a Williamson–Hall plot to separate size broadening from strain broadening, and recognise when Scherrer alone has misled you

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `virtual-ai.mp4` and `virtual-ai.jpg`.
3. In `src/content/labs/virtual-ai.ts`, set `video.url` to `"/demos/virtual-ai.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

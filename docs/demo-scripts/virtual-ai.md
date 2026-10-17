# Demo video shot list — `virtual-ai`

Target runtime **03:00**. Generated from `src/content/labs/virtual-ai.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- A desktop or laptop browser. The crystal-structure viewer needs WebGL, and the pattern chart wants width — the lab works on a phone but the charts are cramped
- Around an hour for the Basic project following this tutorial. The lab itself estimates 45 minutes of workflow; the rest is reading the explanations here. Your work is saved against your Live Labs account as you go, so you can stop and resume at the step you left
- Nothing to install and no data to download. Basic and Moderate are included with the lab; Expert is a separate paid tier, and is open to platform admins and invited expert reviewers without purchase

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:10 | What the lab is | _fill in during storyboard_ |
| 00:10 | 00:32 | Choose a level and meet the sample | _fill in during storyboard_ |
| 00:32 | 00:57 | Prepare the specimen | _fill in during storyboard_ |
| 00:57 | 01:10 | Configure the instrument | _fill in during storyboard_ |
| 01:10 | 01:48 | Start the virtual scan | _fill in during storyboard_ |
| 01:48 | 02:14 | Process the raw pattern | _fill in during storyboard_ |
| 02:14 | 02:41 | Assign reflections and analyse | _fill in during storyboard_ |
| 02:41 | 02:55 | Commit to a conclusion | _fill in during storyboard_ |
| 02:55 | 03:00 | Where to get help | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> X-ray diffraction identifies what a powder is, and how big its crystal grains are, without dissolving or destroying it. You shine X-rays at the specimen and the regular rows of atoms scatter them into a pattern of sharp peaks — a fingerprint of the material. This lab is a complete diffractometer in your browser, and it is run as a project rather than a demonstration: you read a brief, prepare the specimen, configure the instrument against a finite time budget, acquire the pattern point by point, process and fit it, and commit to a conclusion. Only then does the lab reveal what the specimen actually was, and score how close you came.

**Then work the 13 tutorial steps** (69 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Read the project brief and answer the pre-lab diagnostic

_Find out what you are being asked to determine, and what the lab already knows that you do not._

Show, in order:

- Press Start lab, choose Basic — Learn XRD, and read the brief for CALCITE-BEG-001.
- Note the research question and the Sample visibility panel: calcite's identity is given to you, its crystallite size is not.
- Note the budget — 150 minutes of instrument time and up to 6 runs — then answer the short pre-lab questions.
- Click Start this project.

**Hold the shot on:** The 13-step workflow opens with the stepper on the left, a project header showing your instrument-time budget, and every step after the brief locked until the diagnostic is done.

**Say over it:** The diagnostic is asked before you see any data on purpose. Predicting what a choice will do, and then watching it happen, is what separates running an instrument from understanding one — and the lab scores the prediction, not just the result.

### 2. Inspect the specimen

_See the crystal structure that is about to produce your pattern._

Show, in order:

- Open Sample. Wait for the structure viewer to load — it is fetched only when this step opens.
- Drag to rotate the calcite unit cell. Look along an edge, then along a face diagonal, and notice the atoms line up into flat sheets from some directions and not others.
- Read what is disclosed: trigonal, space group R-3c, with its published lattice parameters.

**Hold the shot on:** A rotating unit cell labelled with the phase, its crystal system and space group, alongside the specimen's declared form — loose powder.

**Say over it:** Those flat sheets are the diffracting planes. Each peak in your pattern is one family of sheets, and the angle it appears at is set by how far apart they are. Rotating the cell until you can see the sheets is the fastest way to make Miller indices stop feeling arbitrary.

### 3. Prepare the specimen

_Make the physical choices that decide whether your pattern is worth analysing._

Show, in order:

- Open Prepare specimen and work through the loose-powder route in order: grind, fill, pack, level, mount.
- Read the Why under each choice before you make it — each names the physical effect it controls.
- Check the Named effects on the pattern panel on the right, then click Save changes to preparation.

**Hold the shot on:** "No adverse effects — this specimen should give a representative pattern", plus a summary of surface height, particle statistics, roughness and orientation tendency.

**Say over it:** Preparation is where most real diffraction data is lost. Too coarse a grind and too few crystallites diffract, so relative intensities stop meaning anything; pack a plate-like crystal hard and it lies down, exaggerating one reflection; sit the surface proud of the reference plane and every peak shifts. The lab models each of these separately so you can see them one at a time.

### 4. Configure the instrument

_Design a scan, and see what it costs before you spend anything._

Show, in order:

- Open Configure instrument. In Basic the recommended Cu Kα setup is fixed, so read the controls rather than change them.
- Check What this scan will be: point count, counting time, physical scan time and the sampling figure in points per FWHM.
- Check Reflection coverage — how many calcite reflections fall inside 20–80°, and how many fall outside it.
- Click Create run and go to the scan.

**Hold the shot on:** About 3,001 points, roughly 53 minutes of instrument time against your 150-minute budget, sampling near 3 points per FWHM marked "adequate", and 11 reflections inside the range.

**Say over it:** Step size, counting time and range trade against each other and against the clock. Too coarse a step and a peak is defined by two points, so its width — and therefore your crystallite size — is guesswork. Too short a dwell and the counting noise swamps the weak reflections you need for a lattice refinement. The derived figures exist so the trade is visible before you commit, rather than obvious afterwards.

### 5. Acquire the pattern

_Watch a diffraction pattern being measured, one point at a time._

Show, in order:

- On Virtual scan, click Start virtual XRD scan.
- Watch the goniometer sweep and the counts arrive. Change Playback speed — it changes only how fast points are shown, never the counts.
- Let it finish, then read the three tiles: points acquired, elapsed virtual time and physical scan time.

**Hold the shot on:** A pattern building left to right, the strongest calcite reflection near 29.4° 2θ, and a completed run listed in Runs in this project with its seed.

**Say over it:** The scan is progressive because a real one is: the detector is at exactly one angle at a time, and a pattern is a record of where it has already been. That is also why stopping early is a real decision with a real consequence — the points beyond where you stopped do not exist, and no amount of processing will invent them.

### 6. Process the raw pattern, in the right order

_Turn raw counts into something measurable, without destroying the evidence._

Show, in order:

- Open Process. Note the existing history: background subtraction (SNIP) first, then Kα2 removal.
- Use the Both / Raw / Processed control to overlay the raw trace against the processed one.
- Try reordering or disabling a step and watch the analysis recompute from the raw counts every time.

**Hold the shot on:** A flat baseline and single, clean peaks. The Kα2 shoulders are most obvious on the high-angle reflections, so look above 45° rather than at the tallest peak.

**Say over it:** A laboratory tube emits two close wavelengths, so every reflection arrives twice, slightly apart, and the split widens with angle. The Rachinger correction subtracts the weaker copy — but it has no concept of a baseline, so run on raw data it strips part of the background at every channel too. That is why the order is enforced rather than suggested. The raw counts are never overwritten: processing is a reversible history, so a wrong choice costs nothing but a click.

### 7. Detect and fit the peaks

_Get peak positions and widths with uncertainties, and learn which fits may be used._

Show, in order:

- Open Detect & fit peaks. Peaks above the counting noise are found automatically at the recommended settings.
- Click the tallest peak on the chart and read its Fit diagnostics: converged, FWHM uncertainty, signal-to-noise, reduced χ², Durbin–Watson, clipping, saturation and overlap.
- Scan the Peak table for rows the lab rejected, and read the reason given for each.

**Hold the shot on:** Around 18 fitted peaks with roughly 12 accepted, and an Accepted verdict on the strongest. Rejected rows name their cause — usually a signal-to-noise below 5.

**Say over it:** A peak that looks fine can still be unusable. The diagnostics are the conditions under which a pseudo-Voigt width means what you are about to assume it means, and the lab refuses a measurement whose conditions are not met rather than quietly returning a number. Getting used to reading them here is the habit that stops a plausible-looking crystallite size being published later.

### 8. Assign the reflections

_Connect your measured peaks to the reference structure, and see what that does and does not prove._

Show, in order:

- Open Assign reflections. Reference markers show where calcite diffracts; triangles are your fitted peaks.
- Work down the assignment table comparing 2θ observed against 2θ reference, and watch the Δ2θ column for an outlier.
- Click a peak to open its evidence, then complete the scored task: record its 2θ, d-spacing and (hkl).

**Hold the shot on:** Most peaks assigned with Δ2θ within about 0.02°, observed d-spacings matching the reference to three or four decimals, and observed intensities tracking the reference ones.

**Say over it:** Matching peaks to a known structure is not the same as indexing an unknown one — inferring a unit cell from peak positions alone is a harder, separate problem. Reference matching gives evidence for a phase identification, never proof, and never a phase percentage. The lab is deliberate about that distinction because published work often is not.

### 9. Analyse: lattice, size and strain

_Turn positions and widths into physical quantities, with their uncertainties._

Show, in order:

- Open Analyse. On d-spacing & lattice, read the refined lattice parameters against the published values, with the zero-shift term the refinement absorbed.
- Switch to Scherrer size. Pick a high-angle reflection rather than the first one, and read the instrument-corrected breadth and the confidence class.
- Note where the lab refuses: a peak too narrow relative to instrumental broadening gives a lower bound, not a size.

**Hold the shot on:** Lattice parameters within a fraction of a percent of the reference, and a crystallite size with an uncertainty and a High / Moderate / Low / Not Reliably Estimable class attached.

**Say over it:** Small crystals broaden peaks because there are too few parallel planes to cancel scattering away from the exact Bragg angle, and Scherrer inverts that relationship. But it attributes every bit of broadening to size, so microstrain is read as smaller crystals. Williamson–Hall separates the two using their different angular dependence — size as 1/cos θ, strain as tan θ — and you will use it at Moderate.

### 10. Commit to a conclusion

_State what you found and how confident you are, before you are allowed to see the answer._

Show, in order:

- Open Interpret & submit. Write your conclusion, give a crystallite size with its uncertainty, and choose a confidence level.
- Say what most limits that confidence, in your own words.
- Submit. The submission locks your answer.

**Hold the shot on:** A confirmation that the project is submitted, the truth revealed, and your conclusion locked against further editing.

**Say over it:** The ground truth is held on the server and never sent to the browser until this moment — you cannot read it out of the page source, because it is not in the page. Committing first is what makes the comparison afterwards worth anything: a confidence stated before the reveal is a measurement of your judgement, and one stated after is not.

### 11. See the validation

_Compare what you concluded with what was actually there._

Show, in order:

- Open Validation. Read your value against the hidden truth and the validated acceptance interval.
- Read which of your claims were accepted, and which fell outside tolerance.
- Where you missed, note what the lab says would have closed the gap — usually a longer dwell, a wider range or a different peak.

**Hold the shot on:** A side-by-side comparison with the true crystallite size, marked against an acceptance interval derived from the validation pack rather than from your own run.

**Say over it:** The intervals are not arbitrary tolerances. They come from the same reference calculation the engine is checked against, so falling inside one means your measurement agrees with an independently computed answer — and falling outside it points at a specific decision you made earlier, which is the part worth redesigning.

### 12. Take the assessment

_Check that the concepts transferred, not just the clicks._

Show, in order:

- Open Assessment and answer the concept questions.
- Review how the practical tasks you completed during the workflow were scored.
- Revisit any Knowledge Bank module the feedback links to, then re-read the question.

**Hold the shot on:** A score combining the concept quiz, the pre-lab diagnostic and the practical tasks recorded from what you actually did in the workflow.

**Say over it:** Part of the score comes from the work itself — stopping a trial scan where you were asked to, linking a peak to its evidence — so it measures the experiment you ran rather than only what you can recall afterwards.

### 13. Export the report

_Leave with something you could hand to a supervisor._

Show, in order:

- Open Report & export and read the full project record: settings, preparation, processing history, fits, analysis and your conclusion.
- Export the pattern data, the structure and the project record.
- Check the provenance block — engine versions, instrument profile and the seed that reproduces your run exactly.

**Hold the shot on:** A complete report, and exports that carry enough provenance for someone else to reproduce the run point for point.

**Say over it:** A result without its method is not reproducible, and the seed is the part people forget. Because the counting noise is seeded from your settings, a replay reproduces the same counts exactly — so a difference in someone else's result always means a difference in their setup, which is the only way a disagreement can be settled.

## Close with

- Prepare a powder specimen and predict how grinding, packing and height errors will distort the pattern
- Design a scan — source, 2θ range, step size and counting time — and justify it against a finite instrument-time budget
- Subtract a background and strip the Kα2 satellite in the correct order, and explain why the order is not interchangeable
- Fit peaks with pseudo-Voigt profiles and read the diagnostics that decide whether a fit may be used at all
- Assign reflections to a reference phase and state what that evidence does and does not establish
- Measure crystallite size with the Scherrer equation, correct for instrumental broadening, and say when the lab should refuse to give a number
- Commit to a conclusion with a stated confidence, then compare it with the hidden ground truth and redesign the experiment that fell short

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `virtual-ai.mp4` and `virtual-ai.jpg`.
3. In `src/content/labs/virtual-ai.ts`, set `video.url` to `"/demos/virtual-ai.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

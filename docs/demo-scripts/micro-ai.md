# Demo video shot list — `micro-ai`

Target runtime **00:47**. Generated from `src/content/labs/micro-ai.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- Introductory biology — what DNA is, and roughly what a species is
- A desktop browser for the 3D visualiser
- About 55 minutes for both halves of the Virtual Lab
- Nothing to upload: the lab ships demo sequencing data, though you may supply your own file

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:04 | Sequencing a community you cannot culture | _fill in during storyboard_ |
| 00:04 | 00:12 | Knowledge Bank — the concepts first | _fill in during storyboard_ |
| 00:12 | 00:19 | Visualizer — 3D models and data | _fill in during storyboard_ |
| 00:19 | 00:32 | Virtual Lab — the Metagenomic Profiler | _fill in during storyboard_ |
| 00:32 | 00:41 | Bioreactor Simulator — temperature, pH, substrate | _fill in during storyboard_ |
| 00:41 | 00:47 | Assessment | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> A spoonful of soil or a sample of sludge contains thousands of microbial species, almost none of which will grow in a petri dish. Modern microbiology sequences all of their DNA at once instead, then uses computation to work out who is present and what they are doing. This lab runs that whole workflow: you take raw sequencing reads through a metagenomics pipeline to a species breakdown, then use a bioreactor simulator to tune the conditions those microbes live in and see what it does to biogas yield.

**Then work the 8 tutorial steps** (73 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Build vocabulary in the Knowledge Bank

_Learn the six or seven terms the rest of the lab uses without explanation._

Show, in order:

- Open Knowledge Bank in the sidebar.
- Read the entries on metagenomics, taxonomic ranks, anaerobic digestion and the 16S rRNA gene.
- Make sure you can order the taxonomic ranks from Kingdom down to Species.

**Hold the shot on:** You can say what distinguishes a genus from a species, and what a metagenome is as opposed to a genome.

**Say over it:** The profiler reports results at several taxonomic levels at once. Without the hierarchy in mind, a composition chart is just coloured bars.

### 2. Open the Metagenomic Profiler and load data

_Get sequencing reads into the pipeline._

Show, in order:

- Open Virtual Lab in the sidebar. It opens on the Profiler tab.
- Use the demo dataset rather than your own file for the first run, so you have a known result to compare against.
- Start the pipeline.

**Hold the shot on:** The pipeline visualiser lights up and begins advancing through its stages.

**Say over it:** Real metagenomics starts with a FASTQ file of millions of short reads, each a fragment of some organism's genome, with no label saying which. Everything the pipeline does is an attempt to put those fragments back together and attribute them.

### 3. Follow all six pipeline stages

_Understand what each stage contributes, rather than watching an animation._

Show, in order:

- Watch the stage indicator move through Data Ingestion, QC & Trimming, Assembly, Binning, Taxonomy and Analysis.
- Pause on each and write one sentence on what it does.
- Pay particular attention to Binning — it is the step most people cannot explain afterwards.

**Hold the shot on:** Six stages complete in order, each marked done before the next begins.

**Say over it:** In brief: ingestion reads the file; QC discards low-quality bases and adapter sequence; assembly stitches overlapping reads into longer contigs; binning groups those contigs by which organism they probably came from, using composition and coverage; taxonomy assigns names to the bins; analysis summarises. Skip QC and every later stage inherits the errors.

### 4. Read the taxonomic result properly

_Turn a composition chart into a statement about the community._

Show, in order:

- Read the composition breakdown and identify the dominant groups.
- Look at the top species list and their abundances.
- Read the interpretation the lab provides, then check it against the chart yourself.
- Open the Krona plot link to explore the hierarchy interactively.

**Hold the shot on:** A composition chart, a ranked species list with abundances, and a written interpretation.

**Say over it:** Abundance is relative, not absolute — it tells you the proportions in your sample, not how many cells are in the reactor. Two samples with identical composition can differ by orders of magnitude in total biomass, and conflating the two is a common misreading.

### 5. Switch to the Bioreactor Simulator and establish a baseline

_Get one reference run before you start changing things._

Show, in order:

- Click the Simulator tab inside the Virtual Lab.
- Leave the defaults: temperature 37 °C, pH 7.0, substrate glucose, hydraulic retention time 20 days.
- Run it and watch the five stages — Initialize, Thermodynamics, Kinetics, Mass Balance, Yield Calc.
- Write down the total yield and the methane percentage.

**Hold the shot on:** A biogas production curve over time, a total yield figure, a methane percentage and a written suggestion.

**Say over it:** 37 °C and pH 7 are the mesophilic optimum — the conditions most anaerobic digesters actually run at, and close to human body temperature for the same underlying reason. Starting anywhere else makes your later comparisons meaningless.

### 6. Change one parameter at a time

_Attribute each change in yield to a specific cause._

Show, in order:

- Drop the pH to around 5.5, leaving everything else alone. Run and compare against your baseline.
- Restore pH 7.0, then raise the temperature towards the thermophilic range. Run and compare.
- Restore the temperature, then switch the substrate from glucose to cellulose. Run and compare.
- Finally, shorten the retention time substantially and see what happens to yield.

**Hold the shot on:** Acidic pH cuts yield sharply. Higher temperature speeds the reaction but is less forgiving. Cellulose yields more slowly than glucose. Short retention times cut yield because the process is stopped before it finishes.

**Say over it:** Methanogens — the archaea that make the methane — are the most fragile organisms in the reactor and the first to fail outside pH 6.8–7.2. Acidification is the classic digester failure: acid-producing bacteria run faster than methanogens can consume their output, pH drops, methanogens die, pH drops further. Cellulose is slower simply because it must be hydrolysed to sugars before anything can ferment it.

### 7. Optimise deliberately, then check the visualiser

_Combine what you learned into a best run and confirm your model of it._

Show, in order:

- Choose parameters you predict will maximise yield, and write the prediction down before running.
- Run and compare with the lab's own suggestion.
- Open Visualizer in the sidebar to explore the 3D models and supporting data.

**Hold the shot on:** Your best run beats the baseline, and the lab's suggestion is close to what you reasoned your way to.

### 8. Take the assessment

_Confirm the mechanisms stuck, not just the settings._

Show, in order:

- Open Assessment in the sidebar and complete it.
- For anything you get wrong, return to the relevant module rather than guessing again.

**Hold the shot on:** A completed assessment with explanations for incorrect answers.

## Close with

- Name the stages of a metagenomics pipeline and say what each one does to the data
- Read a taxonomic composition result and identify which organisms dominate a community
- Predict how temperature, pH, substrate and retention time affect anaerobic digestion
- Find operating conditions that raise biogas yield, and explain the mechanism rather than just the number
- Explain why culture-based microbiology misses the great majority of species present

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `micro-ai.mp4` and `micro-ai.jpg`.
3. In `src/content/labs/micro-ai.ts`, set `video.url` to `"/demos/micro-ai.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

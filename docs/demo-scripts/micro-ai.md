# Demo video shot list — `micro-ai`

Target runtime **01:33**. Generated from `src/content/labs/micro-ai.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- School-level biology — what DNA is, and roughly what a species is
- A desktop browser for the 3D visualiser
- Nothing to download. The eight demo datasets run offline, instantly

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:09 | Why this lab exists | _fill in during storyboard_ |
| 00:09 | 00:14 | Knowledge Bank — the words you need first | _fill in during storyboard_ |
| 00:14 | 00:24 | Experiment 1 — the Metagenomic Profiler | _fill in during storyboard_ |
| 00:24 | 00:28 | Pick a demo dataset and run it | _fill in during storyboard_ |
| 00:28 | 00:40 | Reading a healthy gut profile | _fill in during storyboard_ |
| 00:40 | 00:53 | Compare it with an acid mine drainage site | _fill in during storyboard_ |
| 00:53 | 00:57 | Experiment 2 — the Bioreactor Simulator | _fill in during storyboard_ |
| 00:57 | 01:09 | A baseline at 37 °C and pH 7 | _fill in during storyboard_ |
| 01:09 | 01:28 | Drop pH to 5.5 and watch it sour | _fill in during storyboard_ |
| 01:28 | 01:33 | What to do next | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> Most microbes refuse to grow in a dish, so scientists read their DNA instead. This lab lets you do both halves of that job: first find out who lives in a sample of gut, sludge or soil, then run a digester and watch how temperature, pH and feed change the amount of biogas those microbes produce.

**Then work the 8 tutorial steps** (73 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Learn the words first

_Pick up the handful of terms the experiments use without explaining._

Show, in order:

- Open Knowledge Bank in the sidebar.
- Read the entries on metagenomics, taxonomic ranks, anaerobic digestion and the 16S rRNA gene.
- Check you can order the ranks from Kingdom down to Species.

**Hold the shot on:** You can say how a genus differs from a species, and how a metagenome differs from a genome.

**Say over it:** Results come back at several taxonomic levels at once. Without the hierarchy in your head, a composition chart is just coloured bars.

### 2. Run your first sample

_Get a community profile out of the machine._

Show, in order:

- Open Virtual Lab. It opens on the Metagenomic Profiler tab.
- Under Or select example data, choose Demo Data: Healthy Gut Microbiome.
- Click Run Analysis.

**Hold the shot on:** A composition chart, a ranked species list and a short written interpretation. Bacteroidetes and Firmicutes together take about 80% of a healthy gut.

**Say over it:** The demo datasets are computed on your own machine, so they are instant, work offline, and give the same answer every time. That matters: you need a fixed reference before you can tell whether anything you change later made a difference.

### 3. Read the result, don't just look at it

_Turn the chart into a sentence about the sample._

Show, in order:

- Find the two phyla that dominate, and note roughly what share they hold.
- Look down the species list — several are butyrate producers, which feed the cells lining your colon.
- Read the lab's interpretation, then check it against the chart yourself.

**Hold the shot on:** You can describe the sample in one sentence, and point to the numbers that back it up.

**Say over it:** These percentages are relative, not absolute. They tell you the proportions in the sample, never how many cells there are. Two samples with identical charts can differ enormously in total biomass — mixing those up is the most common beginner error.

### 4. Compare two very different worlds

_See how much the shape of a profile tells you on its own._

Show, in order:

- Run Demo Data: Acid Mine Drainage and look at how few groups there are.
- Now run Demo Data: Bioreactor Sludge and notice the archaea — nearly a third of it.
- Compare both against the gut sample you started with.

**Hold the shot on:** Acid mine drainage is dominated by one genus. Sludge is rich in methanogens. The gut sits in between.

**Say over it:** A flat, even profile means many niches and a stable habitat. A spiky one means harsh conditions where only a few organisms cope. You can read that off the shape before you know a single species name.

### 5. Set a bioreactor baseline

_Get one reference run before changing anything._

Show, in order:

- Click the Bioreactor Simulator tab.
- Leave the defaults: 37 °C, pH 7.0, glucose, HRT 20 days.
- Click Start Simulation and write down the total yield and methane percentage.

**Hold the shot on:** About 0.78 m³/kg of biogas at roughly 55% methane, with a curve that rises steeply then flattens.

**Say over it:** 37 °C and pH 7 are where most real digesters run. Starting anywhere else makes every later comparison meaningless.

### 6. Sour the digester on purpose

_See the failure that ruins real plants, safely._

Show, in order:

- Change pH to 5.5 and leave everything else alone. Run it.
- Compare the yield against your baseline, and read the suggestion.
- Put pH back to 7.0 and confirm it recovers.

**Hold the shot on:** Yield collapses from about 0.78 to about 0.13 — roughly a sixth — and the methane percentage drops too.

**Say over it:** Methanogens are the fussiest organisms in the tank and fail outside about pH 6.8–7.2. This is how digesters die: acid-forming bacteria outrun the methanogens, pH falls, more methanogens die, pH falls further. Notice the methane share drops as well — a struggling reactor vents proportionally more CO₂.

### 7. Change the feed and the clock

_Learn why the same reactor gives different answers._

Show, in order:

- Back at pH 7.0, switch the substrate to cellulose and run. Compare with glucose.
- Now raise HRT to 60 days and run again.
- Try 15 °C at 20 days, then the same 15 °C at a much longer HRT.

**Hold the shot on:** Cellulose gives less than glucose in 20 days (~0.66 vs ~0.78) but catches up by 60. Cold is slow rather than hopeless — hold it longer and it recovers.

**Say over it:** Cellulose has to be broken down into sugars before anything can ferment it, and that hydrolysis step is the slow one. Temperature and pH set the *rate*; how much gas a kilogram can ever give is fixed by the feed. So a cold reactor is not broken, just slow — which is exactly why retention time is a design decision.

### 8. Find your best settings, then test yourself

_Put it together and check it stuck._

Show, in order:

- Predict the settings that maximise yield, write the prediction down, then run it.
- Open Visualizer for the 3D models and supporting data.
- Open Assessment and complete it.

**Hold the shot on:** Your best run beats the baseline, and you can explain why rather than having found it by trial and error.

## Close with

- Say what each stage of a metagenomics pipeline does to the data
- Read a community profile and name the organisms that dominate it
- Predict how temperature, pH, feed and retention time change biogas yield
- Explain why a digester goes sour, and how to spot it in the numbers
- Explain why growing microbes in a dish misses almost all of them

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `micro-ai.mp4` and `micro-ai.jpg`.
3. In `src/content/labs/micro-ai.ts`, set `video.url` to `"/demos/micro-ai.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

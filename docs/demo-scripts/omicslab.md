# Demo video shot list — `omicslab`

Target runtime **02:53**. Generated from `src/content/labs/omicslab.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- Undergraduate biology: genes, cell types, tissue, and what a control is
- A desktop browser — the workspace is a multi-panel layout and the spatial views need room
- No installation and no programming: the pipeline runs on the lab's own server
- About 90 minutes for the first full pass; a Core run takes several minutes of that on its own

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:06 | OmicsLab Pro — the Live Lab for the eight-week single-cell and spatial programme | _fill in during storyboard_ |
| 00:06 | 00:15 | Lab Home: your week, and which analysis tracks your access opens | _fill in during storyboard_ |
| 00:15 | 00:21 | Step 1 — read the method before you run it | _fill in during storyboard_ |
| 00:21 | 00:28 | Clusters are a model output, not a discovery — the reference says so plainly | _fill in during storyboard_ |
| 00:28 | 00:37 | Step 2 — the Pre-Lab Assessment finds the gaps while they are cheap to fix | _fill in during storyboard_ |
| 00:37 | 00:50 | Step 3 — plan the comparison before a run answers a different question | _fill in during storyboard_ |
| 00:50 | 00:57 | Step 4 — every dataset names its source, accession, licence and limits | _fill in during storyboard_ |
| 00:57 | 01:04 | The teaching datasets say so until their files are ingested and validated | _fill in during storyboard_ |
| 01:04 | 01:14 | The inspector lists what this dataset supports — and what it does not | _fill in during storyboard_ |
| 01:14 | 01:22 | Step 5 — the run queues on the server, so you can close the tab | _fill in during storyboard_ |
| 01:22 | 01:32 | An earlier run of the same pipeline has finished | _fill in during storyboard_ |
| 01:32 | 01:40 | Step 6 — ten steps, each with its figure and the parameters that produced it | _fill in during storyboard_ |
| 01:40 | 01:49 | Quality control: what was excluded, and on which thresholds | _fill in during storyboard_ |
| 01:49 | 01:56 | Clustering at the resolution this run recorded | _fill in during storyboard_ |
| 01:56 | 02:03 | Marker genes — the evidence behind any label you give a cluster | _fill in during storyboard_ |
| 02:03 | 02:10 | Step 7 — the Copilot speaks only about numbers this run produced | _fill in during storyboard_ |
| 02:10 | 02:22 | And you write the interpretation; it is saved against the run | _fill in during storyboard_ |
| 02:22 | 02:31 | The same data at two clustering resolutions — and which conclusions moved | _fill in during storyboard_ |
| 02:31 | 02:40 | Step 8 — the capstone will not submit without the runs it rests on | _fill in during storyboard_ |
| 02:40 | 02:48 | Export a report that carries the parameters and the caveats with the figures | _fill in during storyboard_ |
| 02:48 | 02:53 | OmicsLab Pro — a NanoSchool Live Lab | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> Every cell in your body carries the same genome and uses a different part of it. Single-cell RNA sequencing measures which genes each individual cell is using, and spatial transcriptomics does it without losing track of where the cell sat in the tissue. This lab is the working bench for that data: you pick a dataset, run quality control, clustering, annotation and differential expression through a pipeline whose method versions are locked, write down what you think it means, and produce a report that carries the parameters and the caveats alongside the figures.

**Then work the 8 tutorial steps** (100 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Start at Lab Home and find your week

_See the shape of the programme before opening any data._

Show, in order:

- Open the lab from your NanoSchool dashboard — that launch is what signs you in; there is no separate password.
- Read Programme progress to see which week you are in.
- Read Analysis tracks open to you: Foundation, Core and Advanced are different tracks, not difficulty settings.

**Hold the shot on:** Lab Home naming your week, and a tracks panel that says plainly which tracks your access includes and which it does not.

**Say over it:** The tracks correspond to real method families — bulk-style analysis, single-cell, and spatial. A locked track is a real boundary, not a teaser: the server checks it again on every request.

### 2. Read the Knowledge Bank entry for the method you are about to run

_Know what the step is for before you see its output._

Show, in order:

- Open Program → Knowledge Bank.
- Find quality control and clustering, and read both.
- Use the glossary for any term you would not be able to define out loud.

**Hold the shot on:** Short reference entries with the vocabulary used by the workspace panels.

**Say over it:** The workspace labels its panels with the real method names. Reading them here first means the run is teaching you results rather than vocabulary.

### 3. Take the Pre-Lab Assessment

_Find the gaps while they are cheap to fix._

Show, in order:

- Open Program → Pre-Lab Assessment and answer the questions.
- Press Submit answers and read the explanation on anything you got wrong.

**Hold the shot on:** A score with an explanation per question, not just a mark.

**Say over it:** Almost every bad single-cell conclusion traces back to one misunderstanding upstream — usually about what filtering removed. This is the cheapest place to catch yours.

### 4. Plan the comparison in the Experimental Design Studio

_Decide what question the run is answering, before it answers something else._

Show, in order:

- Open Program → Experimental Design Studio.
- State the comparison you want: which condition against which control, and how many replicates.
- Press Save the plan so the capstone can refer to it later.

**Hold the shot on:** A saved plan, with the studio flagging a design that cannot support the comparison you asked for.

**Say over it:** A single-cell experiment with one sample per condition cannot separate biological difference from donor difference, no matter how many cells it contains. The studio says so now rather than after the run.

### 5. Choose a dataset, and read what it cannot tell you

_Treat provenance as part of the analysis._

Show, in order:

- Open Analysis → Dataset Selector.
- Pick a dataset and read its source, accession, citation and licence.
- Read the limitations listed on the card — they are specific to that dataset.
- Press Inspect and analyse.

**Hold the shot on:** A dataset inspector listing the analyses this dataset supports and, separately, the ones it does not, each with the reason.

**Say over it:** Every guided dataset here is real published data with real terms of use, so it names its accession and its licence. The 'not supported' list exists because the commonest way to get a confident wrong answer is to run a method the data cannot support.

### 6. Run the pipeline and watch the steps, not just the end

_See each step's figure next to the parameters that produced it._

Show, in order:

- Press Start the guided analysis. The run queues on the server — you can close the tab.
- Open the run from Analysis → Analysis Workspace once it is running.
- Step through Pipeline steps and, at each one, expand the parameters.
- At the quality-control step, note how many cells were excluded and on which thresholds.

**Hold the shot on:** A run that progresses through named steps, each with its own figure and the exact parameter values used, and a pipeline version stamped on the run.

**Say over it:** The method versions are locked and checked against the installed libraries: a run cannot silently substitute a different implementation, because the version stamped on your report has to be true.

### 7. Interrogate the result with the Copilot, then change one parameter

_Separate what the data shows from what the settings decided._

Show, in order:

- Open Copilot and what-if in the workspace.
- Ask what drove the clustering at this resolution.
- Use Run this alternate analysis to change one threshold — the QC minimum, or the clustering resolution — and start a second run.
- Compare the two in Analysis → Compare Runs.

**Hold the shot on:** Copilot answers that quote numbers from your run, and a second run that differs from the first in a way you can point at.

**Say over it:** The Copilot is grounded: it can only speak about values this run produced, so it cannot invent a plausible cell type that is not in your data. Doing the what-if is how you find out which conclusions were robust and which were artefacts of a setting.

### 8. Write the interpretation, then submit the capstone

_Make a claim and attach the evidence to it._

Show, in order:

- In the workspace, write what you think the result means and press Save my interpretation.
- Open Record → Capstone Workspace and write it up; the runs this rests on list ties each claim to a run.
- Press Submit the capstone, then export from Record → Report and Portfolio.

**Hold the shot on:** A capstone that will not submit without runs behind it, and an exported report carrying the parameters and the caveats alongside the figures.

**Say over it:** The report is the deliverable, and it is built to be checkable: someone reading it can see which parameters produced each figure and what the dataset could not support. That is the difference between a result and a screenshot.

## Close with

- Judge whether a single-cell dataset passed quality control, and say what the thresholds excluded
- Cluster and annotate cells, and distinguish a real population from a batch effect
- Read a differential expression result with its multiple-testing correction rather than its top gene list
- Design a comparison that can actually answer a question, including its controls and replicates
- Defend an interpretation in a capstone that links every claim to the run that supports it

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `omicslab.mp4` and `omicslab.jpg`.
3. In `src/content/labs/omicslab.ts`, set `video.url` to `"/demos/omicslab.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

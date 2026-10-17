# Demo video shot list — `spatial-ai`

Target runtime **TBD**. Generated from `src/content/labs/spatial-ai.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- Undergraduate biology: genes, cell types, tissue, and what an untreated control is
- A desktop browser — the workspace is a multi-panel layout and the tissue map needs room
- No installation and no programming: the whole workflow runs from the interface
- About 90 minutes for a first full pass through all twelve workflow steps

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:08 | Spatial Omics Virtual LiveLab — spatial perturbation propagation and therapeutic rescue | _fill in during storyboard_ |
| 00:08 | 00:20 | Step 1 — the research-use boundary, and starting a new project | _fill in during storyboard_ |
| 00:20 | 00:34 | Step 2 — Data & QC: structural checks, data-driven checks, and prediction eligibility | _fill in during storyboard_ |
| 00:34 | 00:48 | Step 3 — Baseline tissue: the spatial map, markers, pathway activity, the spatial graph | _fill in during storyboard_ |
| 00:48 | 01:02 | Step 4 — Experiment: defining a genetic knockout and a real-compound perturbation | _fill in during storyboard_ |
| 01:02 | 01:18 | Step 5 — Propagation and Predicted tissue: direct response versus the spread, and the uncertainty panel | _fill in during storyboard_ |
| 01:18 | 01:30 | Step 6 — Rescue candidates: every eligible candidate simulated separately first | _fill in during storyboard_ |
| 01:30 | 01:42 | Step 7 — Compare candidates: the endpoint table and the Pareto front, and why there is no single score | _fill in during storyboard_ |
| 01:42 | 01:52 | Step 8 — Interpretation, Validate and Report: AI prose grounded in the run, and the assembled report | _fill in during storyboard_ |
| 01:52 | 01:58 | Methods & model card, and the parameter registry | _fill in during storyboard_ |
| 01:58 | 01:58 | Spatial Omics Virtual LiveLab — a Live Labs laboratory | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> A tumour is not a dish of identical cells; it is tissue, and what happens to one cell depends on what is next to it. This lab makes that spatial structure the subject: you open a spatial transcriptomics section, knock out or overexpress a gene — or dose it with a real compound at a real concentration — and a mechanistic tissue solver and a trained graph neural network show how that change spreads outward through the section's own cell neighbourhood, not just in the cells it touched directly. From there you retrieve candidate rescue therapies, simulate every eligible one separately against the same altered tissue, and compare them on an endpoint table and a Pareto front rather than a single invented score.

**Then work the 8 tutorial steps** (101 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Read the research-use boundary, then start a project

_Know what the lab will and will not claim before running anything._

Show, in order:

- Open the lab from your Live Labs dashboard — that launch is what signs you in; there is no separate password.
- Read the Research-use boundary panel on the Project screen in full.
- Give the project a title and a study question, choose the bundled dataset, and pick a mode — Beginner, Intermediate or Advanced.
- Press Create project.

**Hold the shot on:** A boundary statement that says plainly this is not a clinical treatment recommendation system, and a new project showing the selected dataset's cell and feature counts.

**Say over it:** The three modes differ only in which controls, diagnostics and exports are available — for the same dataset, parameters, model version and seed, all three return the same result. Reading the boundary first is what makes every later number legible as a measurement rather than a claim.

### 2. Run Data & QC, and read what each check actually is

_See the difference between a structural check, a data-driven threshold, and an engineering guardrail._

Show, in order:

- Open Data & QC and press Run analysis.
- Read the QC dashboard's verdict and, separately, the prediction eligible readout.
- Expand a few checks and read their kind label — structural, data-driven, or engineering guardrail.

**Hold the shot on:** A table of checks each carrying a pass/fail and a stated reason, and a QC verdict that is a different thing from whether prediction is allowed to run at all.

**Say over it:** There is no universal hard-coded biological threshold across tissues here — a data-driven check is computed from this dataset's own distribution, not a constant borrowed from a different assay. The analysis also produces the baseline annotation and spatial graph every later screen depends on.

### 3. Explore the Baseline tissue

_Read the unperturbed section before changing anything in it._

Show, in order:

- Open Baseline tissue and pan and zoom the tissue map.
- Switch the layer selector between cell type, a marker gene and a pathway activity score.
- Open Reference comparison, if a comparable section is available, and read the comparability note.

**Hold the shot on:** A spatial map coloured by whichever layer is selected, with a marker table and a pathway-activity chart computed from this section's own cell groups.

**Say over it:** A pathway score here is the between-group share of variance in a z-scored quantity, not the section mean — the mean of a z-scored quantity is zero by construction, so reporting it would just be reporting zero every time. Reading the baseline carefully is what makes a later propagation map legible as a *change*.

### 4. Define a perturbation in the Experiment screen

_State what is being changed, and on what cells, before simulating anything._

Show, in order:

- Open Experiment and choose the genetic branch: a target gene, an operator (knockout or overexpression) and a cell-type or region selection.
- Switch to the drug branch and choose a compound; read its evidence record, including whether its potency value was retrieved or curated.
- Press Save perturbation.

**Hold the shot on:** A saved perturbation with its eligibility decision, and — on the drug branch — a compound whose concentration defaults to a real retrieved potency measurement rather than an assumed one.

**Say over it:** A handful of compounds in the catalogue have no usable potency measurement and are excluded from simulation rather than given an invented concentration; the evidence record says which fields were retrieved from the source database and which were curated by hand, because those are different kinds of claim.

### 5. Run the prediction, and read propagation before the predicted tissue

_See the direct effect and the spread as two separate things before reading the combined result._

Show, in order:

- Press Run prediction from the Experiment screen.
- Open Propagation and step through the stages, watching how far the effect reaches from the perturbed cells.
- Open Predicted tissue and read the confidence label and the uncertainty panel, including whether the run sits inside the model's validated domain.

**Hold the shot on:** A propagation view that visibly decays with distance from the perturbed cells, and a predicted-tissue screen that states its confidence rather than presenting every run as equally trustworthy.

**Say over it:** Direct response and spatial propagation are computed and stored as separate artefacts — a merged number could not answer whether an effect spread or only acted where it landed. A run outside the model's training domain is marked out-of-domain rather than shown with an unqualified number.

### 6. Simulate rescue candidates — every eligible one, separately

_See the §2 workflow rule in practice: nothing is ranked before it has been simulated._

Show, in order:

- Open Rescue candidates and press Simulate candidates.
- Read the eligible and excluded lists, and the stated reason for each exclusion.
- Watch the per-candidate simulations complete one at a time against the same altered tissue state.

**Hold the shot on:** A list of candidates, each simulated separately against the identical altered-tissue starting point, with excluded candidates naming a specific reason rather than being silently dropped.

**Say over it:** Ranking candidates before simulating them would rank a heuristic, not a result. Simulating every eligible one against the same state is slower, and that is deliberate — it is the only way the comparison that follows is actually comparing like with like.

### 7. Compare candidates, and read why there may be no single ranking

_Use the endpoint table and the Pareto front the way the lab intends them to be read._

Show, in order:

- Open Compare candidates and sort the endpoint table by a column that matters to your question.
- Find the Pareto front and read which candidates are on it.
- If a no clear winner message appears, read the stated reason — it may name a component that is not actually separating the candidates.

**Hold the shot on:** A sortable table of outcomes, a Pareto front of candidates nothing else beats on every axis at once, and — without a frozen, reviewer-approved weight set — no single composite score pretending to summarise them.

**Say over it:** A composite score here is only produced with weights that are frozen, justified, benchmarked and reviewer-approved; otherwise the comparison stays as components and a Pareto front. The lab also detects when apparent separation between candidates is an artefact of how a component happens to be scaled, and says so rather than letting a scaling choice masquerade as a finding.

### 8. Read the Interpretation, Validate and Report screens, then check the model card

_See the §1.4 rule — no LLM-generated numerical biology — enforced rather than merely stated._

Show, in order:

- Open Interpretation and request a summary; read its citations back against the evidence panel.
- Open Validate to see the suggested wet-lab or imaging experiment the predicted changes imply.
- Open Report to see the full document assembled across every run in the project.
- Open Methods & model card in the reference section and find the baseline comparison table, including the graph-shuffled control.

**Hold the shot on:** AI prose that cites numbers already on screen and nothing it did not receive as evidence, a report whose sections are present or explicitly absent with a reason, and a model card reporting the trained model against seven baselines rather than a single accuracy figure.

**Say over it:** The AI layer's one job is explaining structured results; a gate parses its draft and rejects an unattributable number, an uncited claim, a certainty claim or clinical-advice language outright, with no softened retry. The baseline table exists so a reader can judge whether the model is using the tissue's spatial structure at all, not just whether it scores well — a graph-shuffled control that scored the same as the real model would mean it was not.

## Close with

- Read a spatial QC report and say which checks are structural, which are data-driven, and which are engineering guardrails rather than biology
- Define a perturbation — genetic or a real compound at a real concentration — and read the evidence behind it, including what was retrieved versus curated
- Distinguish a direct effect from a propagated one, and recognise when a result sits outside a model's validated domain
- Compare rescue candidates on an endpoint table and a Pareto front, and explain why no single ranking is shown without frozen, reviewer-approved weights
- Judge a trained model by its baseline table — including a graph-shuffled control — rather than by a single headline accuracy figure

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `spatial-ai.mp4` and `spatial-ai.jpg`.
3. In `src/content/labs/spatial-ai.ts`, set `video.url` to `"/demos/spatial-ai.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

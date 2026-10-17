# Demo video shot list — `drugdiscovery-ai`

Target runtime **01:01**. Generated from `src/content/labs/drugdiscovery-ai.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- Guided Workflow: Follow one research project step by step, from the input data to the report.
- Interactive Knowledge Graph: Explore links between drugs, genes, diseases, and side effects.
- Graph Embedding Models: See how graph relationships are represented as numbers, and compare TransE with other models in Advanced mode.
- Link Prediction Experiment: Rank possible drug disease links for further study.
- Supporting Graph Paths: Follow the connections behind a predicted link.
- Testable Hypothesis: Use the result to develop a clear drug repurposing research hypothesis.

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:06 | Drugs that found their real purpose late | _fill in during storyboard_ |
| 00:06 | 00:16 | Entering the laboratory | _fill in during storyboard_ |
| 00:16 | 00:28 | Graphs, embeddings and link prediction | _fill in during storyboard_ |
| 00:28 | 00:39 | An interactive knowledge graph | _fill in during storyboard_ |
| 00:39 | 00:53 | Adding a drug and predicting links | _fill in during storyboard_ |
| 00:53 | 01:01 | Knowledge Bank and assessment | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> Repurpose is an experimental approach to identifying new therapeutic applications for existing drugs by investigating their molecular targets, biological pathways, and disease associations. In this interactive Live Lab, explore a biomedical knowledge graph to integrate drugs, genes, diseases, and adverse drug effects.

**Then work the 8 tutorial steps** (77 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Start the Lab

_Explore the Repurpose Drug Discovery Lab and understand the computational drug repurposing workflow._

Show, in order:

- Open the Repurpose: Drug Discovery Lab and select Mode.
- Review the research objectives and eight stage analysis pipeline.
- Explore how existing drugs can be investigated for new therapeutic applications.

**Hold the shot on:** An interactive drug repurposing workflow connecting biomedical data, network analysis, and AI assisted predictions.

### 2. Set Up Your Research Project

_Create a research project to investigate potential drug and disease associations._

Show, in order:

- Select a research case or disease of interest.
- Enter the project name and define the therapeutic research objective.
- Review the selected disease and candidate drugs for computational analysis.

**Hold the shot on:** A structured research project with selected drug candidates and a defined disease target.

### 3. Enter Drug and Disease Data

_Prepare the biomedical inputs required for drug repurposing analysis._

Show, in order:

- Enter or review the selected disease and existing drugs.
- Identify relevant drug names and disease information.
- Prepare the input data for biomedical database validation.

**Hold the shot on:** A structured drug and disease dataset ready for validation and further analysis.

### 4. Validate Biomedical Data

_Explore how reliable biomedical databases support evidence based drug discovery._

Show, in order:

- Validate drug and disease entries against open biomedical databases.
- Retrieve available information on drug targets and disease associated genes.
- Review the validated records and supporting biological evidence.

**Hold the shot on:** Validated biomedical information linking candidate drugs, molecular targets, and disease biology.

### 5. Explore the Biomedical Knowledge Graph

_Visualize molecular relationships through network pharmacology and knowledge graph analysis._

Show, in order:

- Generate a biomedical knowledge graph connecting drugs, genes, diseases, pathways, and side effects.
- Examine relationships between drug targets and disease associated genes.
- Explore network connections that may support potential drug repurposing hypotheses.

**Hold the shot on:** An interactive molecular network highlighting biologically relevant drug target disease relationships.

### 6. Analyze Drug Disease Relationships

_Investigate how network based computational methods identify promising therapeutic connections._

Show, in order:

- Analyze drug target interactions and their relevance to disease biology.
- Explore how graph embeddings and link prediction can represent and evaluate drug disease relationships.
- Review available network based evidence supporting potential therapeutic associations.

**Hold the shot on:** Computational analysis results highlighting potential drug disease associations and supporting network evidence.

### 7. Predict and Rank Drug Candidates

_Explore AI assisted drug repurposing and evidence based candidate prioritization._

Show, in order:

- Evaluate potential drug disease links using the available prediction and scoring methods.
- Compare candidate drugs based on network relationships and supporting biomedical evidence.
- Rank promising candidates for further investigation and experimental validation.

**Hold the shot on:** A ranked list of potential drug repurposing candidates with prediction scores and supporting evidence.

### 8. Interpret Results and Generate a Research Report

_Translate computational predictions into scientifically testable drug repurposing hypotheses._

Show, in order:

- Review the ranked candidates, biological relationships, and supporting evidence.
- Identify promising drug disease associations and evaluate their scientific relevance.
- Generate a research report summarizing the findings and proposed experimental validation steps.

**Hold the shot on:** A structured drug repurposing research report containing prioritized drug candidates, supporting biomedical evidence, and testable therapeutic hypotheses.

## Close with

- Understand how drugs, genes, diseases, and molecular targets are connected through biomedical knowledge graphs.
- Explore graph embeddings and network based methods for representing drug disease relationships.
- Apply link prediction concepts to identify potential drug repurposing opportunities.
- Analyze drug target interactions and interpret computational prediction scores.
- Prioritize promising drug candidates using network pharmacology and biomedical evidence.
- Develop evidence based drug repurposing hypotheses for further experimental validation.

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `drugdiscovery-ai.mp4` and `drugdiscovery-ai.jpg`.
3. In `src/content/labs/drugdiscovery-ai.ts`, set `video.url` to `"/demos/drugdiscovery-ai.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

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
- Link Prediction Experiment: Rank possible drug-disease links for further study.
- Supporting Graph Paths: Follow the connections behind a predicted link.
- Testable Hypothesis: Use the result to develop a clear drug-repurposing research hypothesis.

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

> RepurposeAI is an experimental approach to identifying new therapeutic applications for existing drugs by investigating their molecular targets, biological pathways, and disease associations. In this interactive Live Lab, explore a biomedical knowledge graph to integrate drugs, genes, diseases, and adverse drug effects.

**Then work the 9 tutorial steps** (89 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Start the Lab

_Get familiar with the lab and see how your progress is tracked._

Show, in order:

- Open the lab and read the aims and objectives on Start the Lab.
- Find the sections in the sidebar: Research Project, Knowledge Bank, and Assessment.
- Look at the Analysis Pipeline above the page: eight numbered steps, each one ticked when it is done.

**Hold the shot on:** The Analysis Pipeline, with Start the Lab as step 1.

### 2. Create a Project

_Set up an experiment you can come back to._

Show, in order:

- Click Run New Experiment.
- Give the project a name and create it.
- Use My Experiments to reopen a saved project later.

**Hold the shot on:** Your project open, with its name shown above the steps.

### 3. Enter the Input Data

_Choose the disease, the drugs, and the genes they act on._

Show, in order:

- In Beginner mode, choose one of the checked example cases and one or more of its drugs.
- In Intermediate and Advanced mode, search for a disease, add your drugs, and retrieve each drug’s gene targets from ChEMBL.
- Check the action of each drug on each target, and add extra genes of interest if you have them.

**Hold the shot on:** A disease, at least one drug, and the targets each drug acts on.

**Say over it:** The results depend on the information and relationships in the graph. Reliable input is important for meaningful results.

### 4. Validate the Inputs and Retrieve the Data

_Check every entry against open databases and collect the evidence._

Show, in order:

- Click Validate and run analysis (in Beginner mode the case is already checked).
- Read the validation report and correct anything it flags.
- Watch each analysis step finish. The data comes from ChEMBL, Open Targets, STRING, Reactome, and PubMed.

**Hold the shot on:** Validated inputs and a finished analysis.

**Say over it:** Each entry is matched to a standard identifier, so the graph joins the right drug, gene, and disease records.

### 5. Explore the Knowledge Graph

_See how drugs, genes, diseases, and side effects are connected in a knowledge graph._

Show, in order:

- Identify the node types: Drug, Gene, Pathway, Disease, and Side Effect.
- Look at the relationship types: targets, associated with, and participates in. The link being predicted is treats, from a drug to a disease.
- Follow one path: a drug targets a gene, and the gene is associated with a disease.
- Download the graph as an image for your notes.

**Hold the shot on:** A drug-gene-disease path and what each relationship means.

**Say over it:** The relationship type tells you how two nodes are connected and gives the link its meaning.

### 6. Read the Analysis

_See how each drug’s targets relate to the biology of the disease._

Show, in order:

- Compare the targets of your drugs and the pathways they share with the disease.
- Check how close each target sits to the disease genes in the protein network.
- Read whether each drug acts on its target in the direction the disease needs.

**Hold the shot on:** The shared targets, pathways, and direction of action for each drug.

**Say over it:** Not every drug-gene relationship has the same effect, so the direction of action matters as much as the connection.

### 7. Check the Prediction and Ranking

_Learn how the model ranks possible missing links._

Show, in order:

- Look at the ranked list of drug-disease candidates and the score of each one.
- In Advanced mode, compare TransE (head + relation ≈ tail) with the other models and the simple baselines.
- Check what the model score means and what it does not mean.

**Hold the shot on:** A ranked list of possible drug-disease links with their scores.

**Say over it:** The score shows how well a link fits the patterns learned from the graph. It does not prove that the biological relationship is real.

### 8. Form a Hypothesis and Download the Report

_Use the prediction to develop a testable research hypothesis._

Show, in order:

- Open Results & Report and read the result, its evidence level, and its limitations.
- Follow the related graph path and note the target and disease association.
- Read the hypothesis and how it could be tested.
- Download the report as a PDF, with the knowledge graph included.

**Hold the shot on:** A predicted drug-disease link, its score, and the related graph connections.

**Say over it:** A model score is not biological proof. The graph provides useful context, but the predicted relationship still needs further evidence and testing.

### 9. Review and Assess

_Review the main concepts and check your understanding._

Show, in order:

- Use the AI Chat if you need help with a concept.
- Review the Knowledge Bank sections on drug repurposing, network medicine, and TransE.
- Complete the Assessment.

**Hold the shot on:** A completed assessment and a drug-repurposing hypothesis based on the lab results.

## Close with

- Explain how drugs, genes, diseases, and side effects can be represented in a knowledge graph.
- Explain how graph embeddings represent these relationships in numerical form.
- Use link prediction and interpret the model score correctly.
- Develop a drug-repurposing hypothesis from a predicted drug-disease link.
- Identify the evidence needed to test the hypothesis.
- Explain why a predicted link needs further research and validation.

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `drugdiscovery-ai.mp4` and `drugdiscovery-ai.jpg`.
3. In `src/content/labs/drugdiscovery-ai.ts`, set `video.url` to `"/demos/drugdiscovery-ai.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

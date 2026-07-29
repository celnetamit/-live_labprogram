# Demo video shot list — `drugdiscovery-ai`

Target runtime **01:01**. Generated from `src/content/labs/drugdiscovery-ai.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- Introductory biology — genes, proteins, what a drug target is
- A desktop browser with WebGL for the interactive graph
- About 75 minutes for the three learning labs plus the experiment

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:06 | Drugs that found their real purpose late | _fill in during storyboard_ |
| 00:06 | 00:16 | Entering the laboratory | _fill in during storyboard_ |
| 00:16 | 00:28 | Learning Lab — graphs, embeddings, link prediction | _fill in during storyboard_ |
| 00:28 | 00:39 | The Experiment — an interactive knowledge graph | _fill in during storyboard_ |
| 00:39 | 00:53 | Adding a drug and predicting links | _fill in during storyboard_ |
| 00:53 | 01:01 | Knowledge Bank and assessment | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> Some of the most important drugs in use today were developed for something else entirely and found their real purpose later. Drug repurposing tries to make that happen deliberately instead of by accident. This lab teaches the network approach: represent drugs, genes, diseases and side effects as a connected graph, learn a numerical embedding of that graph, and then predict the connections that ought to exist but have not been recorded yet — each one a repurposing hypothesis.

**Then work the 8 tutorial steps** (96 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Take the dashboard tour

_See the structure and how progress is tracked._

Show, in order:

- Sign in and land on Dashboard.
- Note the five sections: Dashboard, Learning Lab, Experiment, Knowledge Bank, Assessment.
- Note the XP counter — the app awards points for completing labs and running tools, which is how it tracks what you have done.

**Hold the shot on:** A dashboard with progress indicators and clear entry points.

### 2. Learning Lab 1 — knowledge graph integration

_Understand how biomedical knowledge becomes a graph._

Show, in order:

- Open Learning Lab and start Lab 1: Knowledge Graph Integration.
- Note the four node types: Drug, Disease, Gene and Side Effect.
- Note that edges are typed too — 'treats', 'targets', 'associated_with' — not just connections.
- Trace one path in your head: a drug targets a gene, that gene is associated with a disease.

**Hold the shot on:** You can describe a drug-target-disease path and say what each edge type means.

**Say over it:** Typed edges are what make this more than a diagram. 'Drug A treats Disease B' and 'Drug A causes Disease B' connect the same two nodes and mean opposite things, so the relation type carries as much information as the link itself.

### 3. Learning Lab 2 — graph embeddings

_See how a graph becomes numbers a model can work with._

Show, in order:

- Start Lab 2: Graph Embeddings.
- Follow how each entity is assigned a position in a vector space.
- Note the property that matters: entities playing similar roles end up close together.
- Look at how a relation becomes a translation between positions rather than a point.

**Hold the shot on:** You can explain why two drugs that treat the same diseases through the same targets end up near each other in the embedding.

**Say over it:** The embedding is a lossy compression of the graph that preserves relational structure. That compression is the point — it lets you ask about connections that were never recorded, because the geometry generalises beyond the specific edges it was trained on.

### 4. Learning Lab 3 — link prediction

_Understand the algorithm that turns geometry into a hypothesis._

Show, in order:

- Start Lab 3: Link Prediction.
- Read how TransE works: it trains so that the embedding of the head entity plus the embedding of the relation lands near the tail entity.
- Understand the inference step: given a head and a relation, the nearest entities are the most likely tails.
- Note that every prediction comes with a score, and what that score does and does not mean.

**Hold the shot on:** You can state the TransE relationship — head + relation ≈ tail — and explain how it produces ranked candidates.

**Say over it:** The score measures geometric consistency with the training graph, nothing more. It is not a probability that the biology is real, and reading it as one is the central mistake this field makes.

### 5. Open the Experiment and take the guided tour

_Get oriented on the interactive graph before manipulating it._

Show, in order:

- Open Experiment in the sidebar.
- Start the guided tour and follow all four steps: Welcome to the Lab, Drug-Target Interaction, Target-Disease Association, and Repurposing Hypothesis.
- Then explore freely — drag nodes, click them for details, and see how the graph responds.

**Hold the shot on:** An interactive graph, colour-coded by node type, with a four-step tour that walks a complete repurposing argument.

**Say over it:** The tour is the argument in miniature: drug to target, target to disease, therefore drug to disease as a hypothesis. Everything you do afterwards is a variation on that chain.

### 6. Add your own drug candidate

_Extend the graph and see how new knowledge propagates._

Show, in order:

- Click Add Drug.
- Give it a name, list the gene targets you want it to act on, and list its side effects.
- Submit it and find your node in the graph.
- Look at what it is now connected to, and through which paths.

**Hold the shot on:** Your drug appears as a new node, linked through the targets you specified, and reachable from diseases associated with those genes.

**Say over it:** Adding a node with no edges tells you nothing. The value came entirely from the relationships you declared — which is exactly why building these graphs from literature is slow, expensive work, and why the graph's quality caps the quality of every prediction made on it.

### 7. Run link prediction and form a hypothesis

_Generate a candidate and turn it into something testable._

Show, in order:

- Click AI Link Prediction.
- Read the result: which drug is predicted to treat which disease, and with what score.
- Trace the path through the graph that supports it — which target, which association.
- Write the hypothesis in one sentence, and then write down the experiment that would falsify it.

**Hold the shot on:** A predicted drug-disease link with a confidence score, and a traceable path through the graph explaining it.

**Say over it:** The traceable path is what makes a prediction usable. A high score with no mechanistic path is unpublishable and unfundable; a moderate score with a clear target-disease mechanism is a research proposal. Always look for the path before looking at the number.

### 8. Consolidate and assess

_Fill gaps and check understanding._

Show, in order:

- Use the AI Chat sidebar for anything unclear.
- Read the Knowledge Bank sections on drug repurposing, network medicine and the TransE algorithm.
- Take the Assessment.

**Hold the shot on:** A completed assessment and a repurposing hypothesis you could defend.

## Close with

- Model biomedical knowledge as a graph of typed entities and typed relationships
- Explain what a graph embedding is and why proximity in that space is meaningful
- Run link prediction and read the confidence score for what it is
- Generate a repurposing hypothesis and articulate what evidence would test it
- Explain why a predicted link is a starting point for experiments, not a conclusion

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `drugdiscovery-ai.mp4` and `drugdiscovery-ai.jpg`.
3. In `src/content/labs/drugdiscovery-ai.ts`, set `video.url` to `"/demos/drugdiscovery-ai.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

# Demo video shot list — `denovo-genai-lab`

Target runtime **00:46**. Generated from `src/content/labs/denovo-genai-lab.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- No chemistry beyond school level — the lab introduces what it needs
- A browser with WebGL for the 3D molecule viewer
- About 70 minutes for all five labs; each is self-contained if you have less

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:05 | De novo design: searching chemical space | _fill in during storyboard_ |
| 00:05 | 00:12 | Entering the lab | _fill in during storyboard_ |
| 00:12 | 00:24 | Lab 1 — molecules as SMILES strings | _fill in during storyboard_ |
| 00:24 | 00:32 | Lab 2 — the VAE latent space | _fill in during storyboard_ |
| 00:32 | 00:39 | Lab 3 — generating under constraints | _fill in during storyboard_ |
| 00:39 | 00:46 | Exp 1 — morphing, and Exp 2 — optimisation | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> Designing a new drug molecule from scratch is a search problem: there are more possible small molecules than there are atoms in the solar system, and almost all of them are useless. This lab teaches the generative-AI approach to that search. You learn how a molecule is written down as text a model can read, how a neural network compresses millions of molecules into a smooth map you can navigate, and then how to generate genuinely new candidates that satisfy the constraints a chemist actually cares about.

**Then work the 7 tutorial steps** (75 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Start at the dashboard

_See the five labs and the order they are meant to be taken in._

Show, in order:

- Sign in and land on Home.
- Read the lab cards — the sidebar numbers them Lab 1 to Lab 3, then Exp 1 and Exp 2.
- Open About Platform if you want the background before starting.

**Hold the shot on:** A dashboard listing five numbered exercises plus a Knowledge Bank, an AI Research Tutor and a final assessment.

**Say over it:** The numbering is not decorative. Lab 2 assumes you can read a SMILES string; Exp 2 assumes you understand what the latent space is doing.

### 2. Lab 1 — the chemical language

_Learn how a molecule becomes a string, which is the precondition for everything else._

Show, in order:

- Open Lab 1: Chemical Language.
- Work through the tokenizer: enter a simple SMILES string such as `CCO` (ethanol) and watch it split into tokens.
- Try `c1ccccc1` (benzene) and note how the ring closure digit and the lower-case aromatic atoms work.
- Deliberately enter something invalid — an unclosed ring, say `C1CCC` — and see what the parser does.

**Hold the shot on:** Valid strings tokenize cleanly and render as a structure; the unclosed ring fails to parse.

**Say over it:** SMILES exists so that chemistry can be fed to models built for language. That choice has a consequence you will meet in Exp 1: most random strings are not valid molecules, so a model generating character by character can easily produce nonsense.

### 3. Lab 2 — see inside the latent space

_Understand what the model actually learns: a compressed map of chemical space._

Show, in order:

- Open Lab 2: Latent Space.
- Study the VAE architecture diagram — encoder, bottleneck, decoder.
- Move through the latent space visualisation and watch the decoded molecule change as you move.
- Find two points close together and confirm the molecules they decode to are chemically similar.

**Hold the shot on:** Nearby points decode to similar molecules; distant points to very different ones.

**Say over it:** That property — nearness in the latent space meaning similarity in chemistry — is the entire reason this architecture is used. It turns "design a molecule" into "move to a promising coordinate", which is a problem optimisation can solve.

### 4. Lab 3 — generate under constraints

_Produce new molecules that satisfy properties you specify, and verify the model obeyed._

Show, in order:

- Open Lab 3: Constrained Gen.
- Choose a preset to see the format, then set your own constraints — molecular weight range, solubility, ring count.
- Generate a batch of candidates.
- Check each result against the constraints you set, rather than assuming compliance.

**Hold the shot on:** A set of generated structures, most of which satisfy the constraints and some of which do not.

**Say over it:** Constraints in these systems are a soft pull on the sampling, not a hard filter. Treating generative output as guaranteed-valid is the most common and most expensive mistake in applied de novo design — every candidate needs checking downstream.

### 5. Exp 1 — morph one molecule into another

_Walk a straight line through latent space and watch chemistry break in the middle._

Show, in order:

- Open Exp 1: Morphing.
- Pick a start and end molecule.
- Step through the interpolation slowly and inspect the intermediates.
- Note where the intermediates stop being plausible molecules.

**Hold the shot on:** Smooth structural change near both ends, and a middle region containing strained or chemically implausible structures.

**Say over it:** The latent space is continuous but chemistry is not — valence rules are discrete. A straight line between two valid points passes through regions the model has never seen and cannot decode sensibly. This is exactly why generated candidates go to a validity filter before anyone considers synthesising them.

### 6. Exp 2 — optimise against several objectives at once

_Experience the trade-off that defines real drug design._

Show, in order:

- Open Exp 2: Optimization.
- Set at least two competing objectives — for example maximise binding affinity while keeping the molecule small and soluble.
- Run the optimisation and watch the population evolve.
- Try weighting one objective much more heavily and observe what happens to the others.

**Hold the shot on:** No single molecule wins on every objective. Push affinity hard and solubility or size degrades.

**Say over it:** This is why drug discovery is hard and why most candidates fail late. Potency is comparatively easy to optimise in isolation; potency together with solubility, safety, metabolic stability and synthetic accessibility is a different problem, and molecules that ace one axis routinely fail on another.

### 7. Consolidate with the tutor and the assessment

_Close gaps and check your understanding._

Show, in order:

- Open AI Research Tutor and ask about anything that did not land — the reparameterisation trick, why validity filters are needed, what a Pareto front is.
- Browse the Knowledge Bank for reference material.
- Take the Final Assessment.

**Hold the shot on:** A completed assessment with explanations for anything you got wrong.

## Close with

- Read and write SMILES strings, and explain why molecules are represented as text for these models
- Describe what an autoencoder's latent space is and why a smooth one matters for molecule design
- Generate molecules under explicit constraints and check whether the model respected them
- Interpolate between two molecules and interpret the chemically nonsensical results along the way
- Run a multi-objective optimisation and articulate why properties trade off against each other

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `denovo-genai-lab.mp4` and `denovo-genai-lab.jpg`.
3. In `src/content/labs/denovo-genai-lab.ts`, set `video.url` to `"/demos/denovo-genai-lab.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

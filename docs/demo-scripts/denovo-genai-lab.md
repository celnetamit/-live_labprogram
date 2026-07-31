# Demo video shot list — `denovo-genai-lab`

Target runtime **01:35**. Generated from `src/content/labs/denovo-genai-lab.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- No chemistry beyond school level — the lab introduces what it needs, when it needs it
- A desktop browser with WebGL for the 3D views (everything else works without it)
- About 70 minutes for all five exercises, or 10–15 minutes for any one of them on its own

## Shots

| In | Out | Chapter | On screen | Say over it |
| --- | --- | --- | --- | --- |
| 00:00 | 00:10 | The problem: too many possible molecules | Landing page, full screen. Cycle the hero molecule through Aspirin → Caffeine → Ibuprofen so a real structure is turning from the first frame. Do not scroll yet. | Every medicine you have ever taken started as a molecule somebody had to think of. There are more possible ones than there are atoms in the solar system, and almost all of them are useless. This lab is about how AI searches that space — and where it goes wrong. |
| 00:10 | 00:26 | Lab 1 — a molecule as a line of text | Open Lab 1. Clear the box and type CCO slowly, letter by letter. Let the 3D structure and the C2H6O readout settle. Then type c1ccccc1 and rotate the benzene ring until it is edge-on and visibly flat. | A molecule can be written as one line of text. Type it, and the lab works out the hydrogens from the bonds each atom has spare, then solves for a real three-dimensional shape. Nothing is looked up and nothing is guessed — benzene comes out flat because the geometry says so. |
| 00:26 | 00:38 | Lab 1 — breaking it on purpose | Click the red 'unclosed ring' chip. Hold on the caret sitting under the offending character. Then click 'five bonds on carbon' and hold on the second, different error. | Now break it deliberately. The first string opens a ring and never closes it — a grammar mistake. The second is perfectly well formed and still impossible, because it asks carbon for five bonds. A model writing text one character at a time makes both kinds of mistake, and only the first one looks wrong. |
| 00:38 | 00:54 | Lab 2 — the map of chemical space | Open Lab 2. Rotate the map for two seconds, then click a dot near the greasy end and let the decode panel fill in. Point the cursor at the two mean-similarity figures at the bottom of the neighbour panel. | Every dot here is one real molecule, placed by its measured properties and its structure. Molecules that sit near each other really are alike — and you can check that, because the lab shows you the similarity scores rather than asking you to believe it. That single property is what turns 'invent a molecule' into 'move to a promising coordinate'. |
| 00:54 | 01:08 | Lab 3 — designing to a specification | Open Lab 3, click the 'Oral drug-like' preset, press Generate. Hold on the sampled-versus-accepted counts, then click one candidate so the 5/5 tick list is visible. Switch the mode to 'Encourage it', generate again, and hold on a candidate with a red cross. | Instead of drawing a structure, you describe one: this heavy, this greasy, at least one ring. Hundreds of candidates get built and measured in a tenth of a second, and most are thrown away. Switch the constraint from enforced to merely encouraged — which is how a real generative model behaves — and some of what comes back breaks the spec. Checking is not optional. |
| 01:08 | 01:20 | Exp 1 — where the chemistry breaks down | Open Exp 1 with aspirin and caffeine loaded. Step through two or three steps of the map route, then switch to 'Through the text' and hold on the column of red 'no' badges with their reasons. | Travel between two drugs two different ways. Through the map, every step is a real molecule. Blend the two text strings directly and almost nothing survives — unclosed rings, impossible valences. Chemical space is continuous; chemistry is not. This is why generated molecules always go through a validity filter first. |
| 01:20 | 01:30 | Exp 2 — you cannot win on everything | Open Exp 2, run with the two default objectives, and hold on the rising progress curve. Then drag Lipophilicity to ×3, drop the others to zero, run again, and hold on the champion's collapsed drug-likeness bar. | Finally, optimise. Ask for two sensible goals and the search improves both. Push one goal as hard as it will go and watch everything else fall over. Nothing malfunctioned — you asked for exactly that. This is why most drug candidates fail late. |
| 01:30 | 01:35 | Where to start | Return to Home. Rest on the 'Start here' card pointing at Lab 1. | Start at Lab 1. It takes ten minutes and needs nothing but a browser. |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> Every new medicine starts as a molecule somebody had to think of. This lab shows you how AI does that thinking. You write a molecule down as a line of text, watch it turn into a 3D structure, explore a map where similar molecules sit near each other, and then ask the computer to invent new ones that match a specification you set. It takes about seventy minutes and needs nothing but a browser.

**Then work the 9 tutorial steps** (85 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Get your bearings on the home page

_See the five exercises, and why they are in that order._

Show, in order:

- Sign in and land on Home.
- Read the Start here card at the top — it tells you which exercise to open, and updates as you finish them.
- Skim the five exercise cards. Each says what you will do and what you should leave with.
- If you want the background first, open About this lab — it lists what the lab computes exactly, what it estimates, and what stands in for something bigger.

**Hold the shot on:** A page headed "Designing molecules with AI", a highlighted card pointing at Lab 1, and five numbered exercises below it with time estimates.

**Say over it:** The numbering is not decoration. Lab 2 assumes you can read a SMILES string, and Exp 2 assumes you know what the map in Lab 2 is doing. The sidebar ticks each exercise off as you complete it, so you can stop and come back.

### 2. Lab 1 — write a molecule as text

_Turn a line of text into a molecule, and see how the hydrogens and the shape are worked out from it._

Show, in order:

- Open Lab 1: Chemical language. Aspirin is already loaded.
- Clear the box and type `CCO`. That is ethanol — the alcohol in a drink.
- Look at the readout: the formula reads C2H6O and the weight 46.07 g/mol. You never typed a hydrogen; six of them were worked out from the bonds each atom had spare.
- Now type `c1ccccc1` — benzene, six carbons in a ring. The lower case says the ring is aromatic.
- Spin the 3D view until you are looking at the ring edge-on. It is genuinely flat, because the geometry was solved rather than drawn.
- Hover any of the coloured token chips to read what that single character does in the string.

**Hold the shot on:** Every keystroke updates the structure, the token list and the properties immediately — there is no button to press and nothing to wait for.

**Say over it:** SMILES exists so that chemistry can be handed to models built for language. That one decision is what made generative chemistry possible, and it is also the source of the problem you will meet in Exp 1.

### 3. Lab 1 — now break it on purpose

_Meet the two different ways a molecule can be wrong._

Show, in order:

- Click the red chip labelled unclosed ring, which loads `C1CCC`.
- Read the error. A caret sits under the character that caused it, and the message explains that a ring was opened and never closed.
- Click five bonds on carbon (`C(C)(C)(C)(C)C`). The brackets are all balanced and there are no stray characters — this string is perfectly well formed.
- Read that error too: it is about valence, not spelling. Carbon makes four bonds, and this string asks for five.

**Hold the shot on:** Two different explanations. The first is a grammar problem; the second is a chemistry problem in a string that a spellchecker would happily pass.

**Say over it:** A model writing SMILES one character at a time can produce either kind of failure, and only the first is obvious from looking at the text. This is why every generated molecule goes through a validity check before anyone spends money on it.

### 4. Lab 2 — explore the map of chemical space

_See what it means for molecules to be laid out so that near means similar._

Show, in order:

- Open Lab 2: Chemical space map. Each dot is one real compound — 116 of them.
- Drag to rotate and scroll to zoom. The colour is cLogP, or greasiness: notice it shades across the map instead of being scattered at random.
- Click a dot. The panel on the right decodes it: name, structure, properties, and the molecules nearest to it.
- Compare the two averages at the bottom of that panel — mean similarity to the five nearest molecules against the five furthest. The first is normally the larger.
- Change the colour dropdown to Molecular weight, then to Therapeutic class, and look for the pattern each time.
- Paste a molecule of your own into the box at the bottom to see where it lands.

**Hold the shot on:** Sugars and amino acids clustered at one end of the map, greasy aromatics at the other, and near neighbours that score measurably higher on similarity than distant ones.

**Say over it:** That property — near meaning similar — is the entire reason this architecture is used. It turns "invent a molecule" into "move to a promising coordinate", which is a problem an optimiser can actually solve.

### 5. Lab 2 — steer into an empty region

_Find out what a decoder does when you ask it about a coordinate where nothing lives._

Show, in order:

- Click Switch the probe on. The probe is a coordinate you choose, rather than a molecule that exists.
- Drag the three sliders and watch the decoded molecule change as you move.
- Click Jump somewhere empty.
- Read the warning that appears, and the distance reached figure — how far the decoder had to look to find anything at all.

**Hold the shot on:** A panel telling you plainly that nothing sits near this coordinate, with the distance to the closest real molecule shown.

**Say over it:** This lab decodes by finding the nearest real molecule, so it can admit when a region is empty. A trained generative model cannot: it returns a confident-looking structure wherever you point it, and the empty parts of its space are exactly where impossible molecules come from.

### 6. Lab 3 — design to a specification

_Ask for a property profile rather than a structure, then check what you actually got._

Show, in order:

- Open Lab 3: Design to a spec and click the Oral drug-like preset.
- Press Generate 12 candidates. It takes about a tenth of a second.
- Look at What the search did: how many molecules were sampled, and how many survived. Most of what the generator produced was thrown away.
- Click a candidate. Its structure appears in 3D, with a tick or a cross against every constraint you set.
- Now click the Brain-penetrant preset — small, greasy and barely polar all at once — and generate again. Watch the acceptance rate fall.
- Switch the mode from Enforce it to Encourage it and generate once more.

**Hold the shot on:** In enforced mode every candidate scores 5/5 against your constraints. In encouraged mode some come back with a red cross beside a constraint they failed.

**Say over it:** That difference is the whole point. A conditional generative model encourages a constraint — it pulls the sampling in the right direction — and non-compliant molecules still come through. Treating generative output as guaranteed-compliant is the most expensive routine mistake in this field.

### 7. Exp 1 — travel between two molecules, two ways

_Watch chemistry break, and understand why a latent space is worth having._

Show, in order:

- Open Exp 1: Morph two molecules. Aspirin and caffeine are loaded as the two ends.
- Leave the route on Through the map and step along the path. Every intermediate is a real molecule; the chart shows resemblance to the start falling as resemblance to the target grows.
- Now switch to Through the text, which blends the two SMILES strings character by character — roughly what a sequence model with no latent space does.
- Count the red steps, and read the reason given for each one.

**Hold the shot on:** The map route stays valid the whole way. The text route usually produces only two or three strings that parse at all — the rest have unclosed rings or impossible valences, each named specifically.

**Say over it:** Text and coordinates are continuous; chemistry is not. Valence rules are all-or-nothing, so a model moving smoothly through its representation can walk straight out of the set of real molecules with no internal signal that it has done so.

### 8. Exp 2 — optimise, then look at what it cost

_Experience the trade-off that defines real drug design._

Show, in order:

- Open Exp 2: Optimise, and trade off. Two objectives are set: drug-likeness, and staying small.
- Press Run. A genetic algorithm evaluates several hundred molecules in well under a second.
- Read the progress chart: best and average score per generation, with your starting molecule as a dashed baseline.
- Look at the Pareto front table underneath. Nothing on it is beaten by anything else on every objective at once.
- Now set Lipophilicity to ×3 and everything else to 0, and run again.
- Compare the champion's properties to the previous run's.

**Hold the shot on:** Push greasiness alone and the winner comes back large and greasy with its drug-likeness collapsed. Nothing malfunctioned — you asked for exactly that.

**Say over it:** Every property you leave out of the objective is a property you have implicitly agreed to sacrifice. Potency on its own is comparatively easy to optimise; potency together with solubility, safety, metabolic stability and something a chemist can actually build is a different problem, and that is why most candidates fail late.

### 9. Consolidate, then check yourself

_Close any gaps and confirm what stuck._

Show, in order:

- Open Reference and read Where the numbers come from — it labels every figure in the lab as exact, published, an estimate or a stand-in.
- Ask the AI tutor about anything that did not land. It knows how this lab computes what it computes.
- Take Check your understanding: ten questions, each explained as soon as you answer it.

**Hold the shot on:** A score with an explanation for every question, and a note of which exercise the ones you missed came from.

**Say over it:** The distinction the Reference section labours — measured, calculated, predicted — is the habit the subject actually requires. Confusing a prediction for a measurement is how programmes spend years on molecules that were never going to work.

## Close with

- Read and write a molecule as a SMILES string, and explain why models are given chemistry as text
- Recognise the two different ways a generated molecule can be wrong: broken notation, and impossible chemistry
- Navigate a map of chemical space, and say what it means when a region of it is empty
- Generate molecules to a specification and check, rather than assume, that the constraints were met
- Explain from your own results why improving one property usually costs you another
- Tell which numbers in a computational result are measured, which are calculated, and which are predicted

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `denovo-genai-lab.mp4` and `denovo-genai-lab.jpg`.
3. In `src/content/labs/denovo-genai-lab.ts`, set `video.url` to `"/demos/denovo-genai-lab.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

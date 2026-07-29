# Demo video shot list — `battery-ai`

Target runtime **00:39**. Generated from `src/content/labs/battery-ai.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- Basic electrical concepts — capacity, voltage, resistance
- A desktop browser; the visual glossary uses 3D models
- About 65 minutes for the full sequence

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:05 | Second life or recycling: the decision | _fill in during storyboard_ |
| 00:05 | 00:15 | Learning Hub — how batteries degrade | _fill in during storyboard_ |
| 00:15 | 00:25 | Simulation Lab — feasibility, recycling, safety | _fill in during storyboard_ |
| 00:25 | 00:32 | Lifecycle Tracker | _fill in during storyboard_ |
| 00:32 | 00:39 | Visual Glossary and Assessment Centre | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> An electric-vehicle battery is retired when it can no longer hold about 80% of its original charge — but at that point it is still a large, expensive, perfectly functional energy store. This lab is about what happens next. You assess a used pack's health, decide whether it should get a second life in a less demanding application or go straight to material recovery, simulate the recycling process, and check the whole plan against safety and compliance standards.

**Then work the 7 tutorial steps** (77 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Start with the Learning Hub, not the simulators

_Get the degradation vocabulary before you are asked to judge a pack on it._

Show, in order:

- Sign in and open Dashboard to see the layout.
- Go to Learning Hub and work through the material on degradation mechanisms.
- Make sure you can distinguish capacity fade from power fade, and calendar ageing from cycle ageing.

**Hold the shot on:** You can explain why a battery at 80% state of health is called end-of-life for automotive use but not end-of-life outright.

**Say over it:** That 80% threshold is about the vehicle, not the cell: below it the range loss becomes unacceptable to a driver. A stationary storage system that never needs peak power has no such objection, and that gap is precisely where the second-life market lives.

### 2. Follow a pack through the Lifecycle Tracker

_See the full chain a battery moves through before any decision is made._

Show, in order:

- Open Lifecycle Tracker in the sidebar.
- Trace a pack from manufacture through first use, retirement, assessment and its onward route.
- Note where data about the pack is captured, and where it is typically lost.

**Hold the shot on:** A traced lifecycle with visible decision points.

**Say over it:** The main practical obstacle to second-life reuse is not technical, it is informational: if nobody recorded how a pack was charged and how hot it ran, its remaining life has to be measured from scratch, and that testing can cost more than the pack is worth.

### 3. Assess a pack in the Second-Life Feasibility Analyzer

_Turn health data into a reuse decision._

Show, in order:

- Open Simulation Lab in the sidebar. It opens on Second-Life Feasibility Analyzer.
- Enter a pack with healthy figures first — a state of health near 85%, a moderate cycle count, low capacity fade, low internal resistance.
- Run the analysis and read the whole report: feasibility score, projected lifespan, potential revenue, suitable applications and safety considerations.
- Now run a degraded pack — state of health near 65%, high cycle count, high internal resistance — and compare.

**Hold the shot on:** The healthy pack scores well with several suitable applications; the degraded pack scores poorly and the suitable-application list shrinks or empties.

**Say over it:** Notice that internal resistance drives the outcome more than capacity does. High resistance means more heat at the same current, which limits the power the pack can safely deliver and accelerates further ageing — so it disqualifies a pack from demanding applications even when capacity still looks acceptable.

### 4. Match packs to applications deliberately

_Understand why the same pack suits one use and not another._

Show, in order:

- For your healthy pack, read the viability rating of each suggested application.
- Identify which applications need high power versus high energy.
- Re-run with only the internal resistance raised, holding everything else constant, and see which applications drop out first.

**Hold the shot on:** Power-hungry applications lose viability first when resistance rises; energy-only applications tolerate it far longer.

**Say over it:** Energy and power are different requirements. A home storage system discharges slowly over hours and cares about capacity; grid frequency regulation demands large currents in seconds and cares about resistance. This is the single most useful matching heuristic in the field.

### 5. Simulate the recycling route

_Evaluate the alternative to reuse on its own terms._

Show, in order:

- Switch to the Recycling Process Simulator tab.
- Run a recovery simulation and read the recovery rates per material.
- Read the environmental impact metrics and the economic viability assessment.
- Compare the recovered value against the second-life revenue estimate for the same pack.

**Hold the shot on:** High recovery rates for some materials and markedly lower ones for others, with an economic assessment that depends heavily on which materials the chemistry contains.

**Say over it:** Recycling economics are driven by cobalt and nickel. Chemistries that reduce or remove them — LFP especially — are cheaper and safer but leave much less worth recovering, which is why the industry's move away from cobalt has made recycling harder to fund even as it makes batteries better.

### 6. Run the Safety Compliance Checker

_Test your plan against the constraints that can veto it outright._

Show, in order:

- Switch to the Safety Compliance Checker tab.
- Submit your second-life plan for the healthy pack.
- Read the status, the identified risks, the recommendations and the standards referenced.
- Now submit the degraded pack's plan and compare.

**Hold the shot on:** A Pass, Warning or Fail with specific risks, recommendations and standard references.

**Say over it:** Repurposing a battery makes you its manufacturer for regulatory purposes. Certification, transport classification and installation requirements apply to the new product, and this compliance cost is what most often makes a technically sound second-life plan commercially unviable.

### 7. Consolidate and assess

_Fix the terminology and test the reasoning._

Show, in order:

- Open Visual Glossary for the 3D cell and pack models.
- Use Community Forum to compare your reuse decisions with other learners'.
- Complete the Assessment Center.

**Hold the shot on:** A completed assessment and a defensible decision for each pack you evaluated.

## Close with

- Read a state-of-health report and judge whether a pack is a second-life candidate
- Explain what capacity fade and rising internal resistance each tell you about how a cell aged
- Match a retired pack to applications whose duty cycle it can still meet
- Compare recycling routes on recovery rate, environmental impact and economic viability
- Identify the safety and compliance obligations that constrain any reuse decision

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `battery-ai.mp4` and `battery-ai.jpg`.
3. In `src/content/labs/battery-ai.ts`, set `video.url` to `"/demos/battery-ai.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

# Demo video shot list — `metamaterials`

Target runtime **00:36**. Generated from `src/content/labs/metamaterials.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- Comfort with frequency, wavelength and decibels
- A desktop browser with WebGL — the unit cell and cross-section previews are 3D
- Headphones if you want to use the audio preview
- About 70 minutes

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:05 | Geometry instead of mass: acoustic metamaterials | _fill in during storyboard_ |
| 00:05 | 00:10 | Acoustic targets — frequency, absorption, angle | _fill in during storyboard_ |
| 00:10 | 00:19 | Advanced — lattice topology, porosity, wall thickness | _fill in during storyboard_ |
| 00:19 | 00:29 | Unit cell preview and cross-section | _fill in during storyboard_ |
| 00:29 | 00:36 | Design library and knowledge bank | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> Ordinary sound absorbers work by being thick — the low notes need a lot of material. Acoustic metamaterials cheat that by getting their properties from geometry rather than from the substance they are made of, so a carefully shaped lattice a few centimetres thick can stop frequencies that would otherwise demand a wall. This lab is a design workbench for those structures: you set an acoustic target, choose a lattice topology, and the physics engine returns an absorption spectrum, a bandgap analysis, and a verdict on whether the thing could actually be printed.

**Then work the 8 tutorial steps** (91 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Learn the physics before touching the sliders

_Understand what a bandgap is, since it is the quantity everything else serves._

Show, in order:

- Open the Knowledge Bank from the navigation.
- Read the sections on bandgaps, effective density and effective modulus.
- Make sure you can distinguish a Bragg bandgap from a resonance bandgap before continuing.

**Hold the shot on:** You can say what each mechanism depends on: a Bragg gap on the lattice spacing relative to the wavelength, a resonance gap on the local resonators regardless of spacing.

**Say over it:** This distinction governs everything downstream. Bragg gaps need features comparable in size to the wavelength, so low frequencies mean large cells — which is precisely the thickness problem metamaterials exist to solve. Resonance gaps sidestep it, and are the reason sub-wavelength absorbers are possible at all.

### 2. Open the workbench and pick a mission scenario

_Start from a realistic target rather than arbitrary numbers._

Show, in order:

- Open the design workbench from the home page.
- Choose a Mission Scenario from the dropdown — it presets the acoustic targets for a real application.
- Note where the panels sit: controls on one side, unit cell and spectrum on the other.

**Hold the shot on:** The control panel populates with target values appropriate to the scenario.

**Say over it:** Scenarios keep you honest. Left to invent targets, most learners pick round numbers that no application requires and then optimise against them.

### 3. Set the acoustic targets — and only those

_Establish what you want before deciding how to get it._

Show, in order:

- Set Target Frequency to the frequency you need attenuated, anywhere from 100 Hz to 8 kHz.
- Set Desired Absorption — try 90% before reaching for 99%.
- Set Incident Angle. Leave it at 0° for now; you will raise it later.
- Choose a Material: PLA, ABS, Titanium or Resin.
- Generate, and keep this as your baseline.

**Hold the shot on:** A generated design with an absorption spectrum, a bandgap verdict, a specific stiffness figure, and structural integrity and manufacturability assessments.

**Say over it:** Material choice sets stiffness and density, which set the speed of sound in the structure, which shifts every resonance. Titanium and PLA with identical geometry are acoustically different objects — so changing material is not a late-stage decision.

### 4. Compare lattice topologies at fixed targets

_Isolate the effect of geometry alone._

Show, in order:

- Leave every acoustic target exactly as it is.
- Step through Lattice Topology: Gyroid, Schwarz P, Schwarz D, Neovius, Lidinoid, FCC and BCC. Regenerate each time.
- Record the bandgap type and range for each.
- Rotate the unit cell preview for each and connect what you see to what the spectrum did.

**Hold the shot on:** The triply periodic minimal surfaces — Gyroid, Schwarz, Neovius, Lidinoid — behave differently from the simple FCC and BCC lattices, and Gyroid usually gives the broadest usable response.

**Say over it:** Gyroid's advantage is that it is fully connected in every direction with no straight-through paths and no flat internal faces. Sound entering it is scattered continuously rather than at discrete interfaces, which widens the gap — and the same property makes it self-supporting when printed.

### 5. Trade porosity against wall thickness

_Find the boundary where acoustic performance meets structural reality._

Show, in order:

- Fix your chosen topology. Raise Target Porosity towards 0.9 and regenerate.
- Read the structural integrity assessment, not just the spectrum.
- Now drop Min Wall Thickness towards 0.4 mm and regenerate.
- Read the manufacturability assessment.
- Find the combination that keeps both assessments acceptable while still meeting your acoustic target.

**Hold the shot on:** High porosity with thin walls gives excellent absorption and an unbuildable, structurally weak part. Every improvement on one axis costs you on another.

**Say over it:** 0.4 mm is around the practical floor for most polymer printers — below it walls do not form reliably. A design the physics engine likes but a printer cannot produce is not a result, and the manufacturability check is there to stop you reporting one.

### 6. Test off-axis performance

_Check whether your design survives sound arriving from a realistic direction._

Show, in order:

- Take your best design and raise Incident Angle from 0° towards 89°, regenerating as you go.
- Watch what happens to absorption at your target frequency.
- Find the angle at which the design stops meeting its target.

**Hold the shot on:** Performance holds over a range of angles and then falls away, often sharply.

**Say over it:** Normal incidence is the easy case and almost never the real one. In a cabin or a room, sound arrives from everywhere, so a design optimised at 0° can underperform badly in service. This step is what separates a plausible design from a deployable one.

### 7. Inspect the internal structure and use the design assistant

_Understand the geometry you have produced rather than treating it as a black box._

Show, in order:

- Use the Z-Axis Slice Position control to cut through the structure and watch the cross-section change.
- Open the geometry explainer for the mathematical description of your chosen lattice.
- Ask the design assistant why your design behaves as it does.

**Hold the shot on:** Cross-sections showing how the channels connect through the cell, and an explanation tying the topology's equation to its acoustic behaviour.

**Say over it:** Slicing is how you develop intuition for why some topologies are printable and others need support material that cannot be removed from a closed internal cavity.

### 8. Save, compare and export

_Turn exploration into a defended recommendation._

Show, in order:

- Save your best design to the Design Library.
- Save a deliberately different one — different topology, similar target.
- Open the comparison view and put them side by side.
- Export your chosen design and write two sentences on why you chose it over the alternative.

**Hold the shot on:** Two saved designs compared across bandgap, specific stiffness, structural integrity and manufacturability, with no design winning on all four.

**Say over it:** The comparison is the deliverable. A single design with good numbers proves nothing; a design chosen over a documented alternative, for stated reasons, is engineering.

## Close with

- Explain how a bandgap arises and what distinguishes a Bragg gap from a resonance gap
- Predict which lattice topologies suit which acoustic targets
- Trade porosity and wall thickness against structural integrity and printability
- Read an absorption spectrum and identify where a design does and does not work
- Recognise when a numerically excellent design cannot be manufactured

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `metamaterials.mp4` and `metamaterials.jpg`.
3. In `src/content/labs/metamaterials.ts`, set `video.url` to `"/demos/metamaterials.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

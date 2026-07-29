# Demo video shot list — `smartfactory-ai`

Target runtime **01:17**. Generated from `src/content/labs/smartfactory-ai.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- Basic manufacturing vocabulary — throughput, cycle time, utilisation
- A desktop browser with WebGL; every simulator in this lab is 3D
- About 90 minutes for the core sequence, more if you explore all fourteen tabs
- Note that roles and progress are stored in your browser, not on a server

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:05 | A simulated production facility | _fill in during storyboard_ |
| 00:05 | 00:42 | Entering the participant workspace | _fill in during storyboard_ |
| 00:42 | 00:53 | Production Line Optimizer — finding the constraint | _fill in during storyboard_ |
| 00:53 | 01:02 | Digital Twin | _fill in during storyboard_ |
| 01:02 | 01:10 | Predictive maintenance and strategy | _fill in during storyboard_ |
| 01:10 | 01:17 | Robotic Arm and CNC simulators | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> A factory is a chain of machines where one slow station sets the pace for everything behind it, and one unplanned breakdown stops the lot. This lab is a simulated production facility where you can find that bottleneck, run a digital twin of the line, predict failures from sensor data before they happen, and argue — with numbers — about how much maintenance is worth doing. It also carries three machine simulators: a robotic arm, a 3D printer and a CNC mill.

**Then work the 8 tutorial steps** (104 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Sign in and understand what the roles mean

_Get into the participant workspace and know what you are looking at._

Show, in order:

- Sign in with the demo credentials shown on the login screen.
- Choose the participant role — mentor and admin add oversight tabs but no extra lab content.
- Look over the tab strip: Learning Path, Optimizer, Digital Twin, Maintenance, Maintenance Strategy, Data Lab, Biomedical Lab, Final Project, Robotic Arm, 3D Printer, CNC Sim, Knowledge Hub and AI Assistant.

**Hold the shot on:** The participant workspace with the full tab strip.

**Say over it:** Worth knowing: the role system is a workshop device, not a security boundary. Accounts and roles live in browser storage that you control, so the different dashboards exist to shape the exercise rather than to protect anything. Real access control happens upstream in the portal you launched from.

### 2. Follow the Learning Path first

_Get the concepts before the simulators assume them._

Show, in order:

- Open the Learning Path tab and work through it in order.
- Keep the Knowledge Hub tab in mind as your reference for anything unfamiliar.

**Hold the shot on:** A structured sequence of concepts covering line balancing, condition monitoring and maintenance strategy.

### 3. Find the bottleneck in the Production Line Optimizer

_Locate the one station that governs the whole line's output._

Show, in order:

- Open the Optimizer tab.
- Enter the line's KPIs and run the optimisation.
- Read the report and identify the constraining station.
- Now improve a station that is *not* the bottleneck and re-run. Note how little total throughput changes.
- Improve the actual bottleneck by the same amount and compare.

**Hold the shot on:** Improving a non-bottleneck station barely moves total output; improving the bottleneck moves it substantially — and usually creates a new bottleneck somewhere else.

**Say over it:** This is the theory of constraints in one experiment. A chain's throughput is set by its weakest link, so effort spent anywhere else buys inventory rather than output. The follow-on lesson matters just as much: fixing a bottleneck does not eliminate bottlenecks, it relocates them, so optimisation is iterative rather than one-shot.

### 4. Test your change in the Digital Twin

_Validate a proposed change against a running model before committing to it._

Show, in order:

- Open the Digital Twin tab and let the 3D line load.
- Watch material flow through the line and see where it queues.
- Apply the change you decided on in the Optimizer.
- Watch what happens to the queues downstream.

**Hold the shot on:** Visible work-in-progress piling up in front of the constraining station, and that pile moving elsewhere after your change.

**Say over it:** A twin is worth building precisely because a change that looks good on a spreadsheet can starve a downstream station or overflow a buffer — effects that only appear when you simulate the dynamics rather than the averages.

### 5. Predict a failure in the Maintenance Analyzer

_Read sensor data as an early warning rather than a post-mortem._

Show, in order:

- Open the Maintenance tab.
- Enter or load machine sensor data — vibration, temperature, operating hours.
- Run the analysis and read the maintenance report.
- Change one signal at a time and watch which one moves the predicted remaining life most.

**Hold the shot on:** A remaining-useful-life estimate with the contributing indicators broken out.

**Say over it:** Vibration usually leads temperature. A developing bearing fault shows up as a change in vibration signature well before the friction it causes raises the measured temperature, which is why vibration monitoring buys more warning time than thermal monitoring alone.

### 6. Compare maintenance strategies on total cost

_Decide how much prediction is actually worth._

Show, in order:

- Open the Maintenance Strategy tab.
- Simulate a reactive strategy — repair only after failure — and record total cost and downtime.
- Simulate a preventive schedule and record the same.
- Simulate a predictive strategy and compare all three.
- Then find a machine where predictive maintenance is *not* worth it.

**Hold the shot on:** Reactive is cheap until a failure, then very expensive. Preventive is steady but wastes component life. Predictive wins on total cost for critical machines — and loses on cheap, quickly replaced ones.

**Say over it:** The instinct that predictive maintenance is always better is wrong, and expensively so. Instrumenting a machine costs money; if the machine is cheap, spare, and fast to swap, running it to failure is the rational strategy. The decision depends on failure consequence, not on the technology available.

### 7. Explore the machine simulators

_Connect the abstractions to physical machines._

Show, in order:

- Open Robotic Arm and drive the joints; watch how joint angles produce end-effector position.
- Open 3D Printer and watch a part build layer by layer.
- Open CNC Sim, load a G-code program and follow the toolpath.
- In the CNC tab, read a few lines of G-code alongside the motion they produce.

**Hold the shot on:** Three 3D simulators responding to your inputs, with the CNC toolpath traced as the program runs.

**Say over it:** G-code is nothing more than a list of coordinates and feed rates. Watching a line of text move a tool is the fastest way to stop finding CNC programs intimidating.

### 8. Complete the Data Lab and Final Project

_Put the pieces together on an open-ended problem._

Show, in order:

- Work through the Data Lab tab to practise exploring production data directly.
- Open Final Project and work the combined scenario end to end.
- Use the AI Assistant tab when you get stuck rather than guessing.

**Hold the shot on:** A completed final project drawing on the optimiser, the twin and the maintenance analysis together.

## Close with

- Find the bottleneck in a production line and predict what improving it will and will not do
- Use a digital twin to test a change before committing to it
- Interpret vibration and temperature signatures as early failure indicators
- Compare reactive, preventive and predictive maintenance strategies on total cost, not downtime alone
- Read a G-code toolpath and relate it to what the machine physically does

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `smartfactory-ai.mp4` and `smartfactory-ai.jpg`.
3. In `src/content/labs/smartfactory-ai.ts`, set `video.url` to `"/demos/smartfactory-ai.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

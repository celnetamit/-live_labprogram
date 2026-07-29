# Demo video shot list — `logiclab`

Target runtime **00:38**. Generated from `src/content/labs/logiclab.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- Knowing what a logic gate and a flip-flop are — nothing more
- No toolchain, no simulator, no FPGA board: everything runs in the browser
- About 60 minutes

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:04 | The dashboard: what LogicLab does | _fill in during storyboard_ |
| 00:04 | 00:12 | Learn Concepts — blocking vs non-blocking | _fill in during storyboard_ |
| 00:12 | 00:22 | Code Generator — HDL from a plain-English prompt | _fill in during storyboard_ |
| 00:22 | 00:32 | Code Explainer — reading HDL you did not write | _fill in during storyboard_ |
| 00:32 | 00:38 | Snippet Library and Knowledge Bank | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> Chips are not drawn, they are described. Engineers write hardware description languages — Verilog and VHDL — that specify what a circuit does, and tools turn that description into actual gates on silicon. This lab is where you learn to read and write that description with an AI assistant alongside you: describe a module in plain English and get HDL back, paste unfamiliar HDL and get it explained line by line, generate a testbench to verify it, and keep the good results in a snippet library.

**Then work the 7 tutorial steps** (76 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Work through Learn Concepts first

_Get the four ideas that every later step depends on._

Show, in order:

- Sign in and open Learn Concepts in the sidebar.
- Read HDL Basics — blocking (`=`) versus non-blocking (`<=`) assignment.
- Read State Machines — Moore versus Mealy.
- Read CDC (Clock Domain Crossing) and Pipelining, marked Advanced. Skim them now; they will make more sense after you have read some real HDL.

**Hold the shot on:** You can state the rule: non-blocking (`<=`) for sequential logic, blocking (`=`) for combinational.

**Say over it:** That one rule prevents most beginner HDL bugs. Blocking assignments take effect immediately in source order; non-blocking ones all take effect at the end of the time step. Use blocking in a clocked block and you create a race between statements that simulates one way and synthesises another — the worst possible failure mode, because the simulation passes.

### 2. Explain code you did not write

_Learn to read HDL before you try to produce it._

Show, in order:

- Open Code Explainer in the sidebar.
- Paste in a module — use one from Snippet Library if you have no HDL of your own.
- Read the explanation: the summary first, then the state machine logic breakdown.
- Cross-check one claim yourself against the source. Do not accept the explanation on trust.

**Hold the shot on:** A structured explanation with a summary and a walkthrough of the sequential logic.

**Say over it:** Reading is the faster skill to acquire and the more useful one — you will read far more HDL than you write. Cross-checking is not optional: the explanation comes from a language model, and treating its output as authoritative rather than as a strong first draft is the main way these tools cause harm.

### 3. Generate your first module

_Turn a plain-English requirement into synthesisable HDL._

Show, in order:

- Open Code Generator.
- Set Target Language to Verilog.
- In Requirement Prompt, be specific. Something like: "Create a Verilog UART transmitter with a configurable clock frequency and baud rate, an 8-bit data input, a start signal, and a ready output indicating it can accept new data."
- Generate, and read the result on the Design tab.

**Hold the shot on:** A complete module with parameters, a state machine (IDLE / START / DATA / STOP), a clock divider and the requested ports.

**Say over it:** Notice how much of the quality came from the prompt. "Make a UART" leaves the clock frequency, baud rate, data width and handshaking to the model's guess; naming them gets you a module you can actually integrate.

### 4. Review the generated design critically

_Practise the review that makes generated HDL safe to use._

Show, in order:

- Check every port in the module against your requirement — is anything missing or extra?
- Find the clocked `always` block and confirm it uses non-blocking assignment.
- Find the combinational block and confirm every output is assigned on every path, so no latch is inferred.
- Check the reset: is it synchronous or asynchronous, and is that what you wanted?

**Hold the shot on:** You find at least one thing worth questioning. That is a normal outcome, not a sign the tool failed.

**Say over it:** An incompletely assigned combinational block infers a latch — storage you did not ask for, which breaks static timing analysis and is one of the most common synthesis warnings junior engineers learn to ignore and should not.

### 5. Generate a testbench and understand its limits

_Get a way to exercise the design, and be clear about what it proves._

Show, in order:

- With the design still open, generate the testbench and switch to the Testbench tab.
- Read what stimulus it applies and what it checks.
- Write down one behaviour of your module the testbench does *not* cover.

**Hold the shot on:** A testbench that drives the clock and reset, applies input data and observes the output.

**Say over it:** A generated testbench covers the path the module is expected to take. It rarely covers back-to-back transmissions, reset asserted mid-transmission, or a start signal arriving while busy — and those are exactly where real bugs live. Knowing what your verification does not reach is more valuable than the pass result.

### 6. Save your work and use the assistant

_Build a personal reference and get unstuck efficiently._

Show, in order:

- Save the module and its testbench to the Snippet Library.
- Open AI Lab Assistant and ask about something the concepts modules left unclear — metastability, or why a two-flop synchroniser is enough.
- Use Knowledge Bank for reference material.

**Hold the shot on:** A saved, retrievable snippet and answers to your questions.

### 7. Take the assessment

_Confirm the concepts stuck._

Show, in order:

- Open Assessment.
- Set the quiz topic — start with Finite State Machines — and generate the quiz.
- Answer, submit, and read the explanation for anything you missed.
- Repeat with a topic you feel weakest on.

**Hold the shot on:** A scored quiz with per-question explanations.

## Close with

- Read a Verilog or VHDL module and describe the hardware it produces
- Explain the difference between blocking and non-blocking assignment, and why it decides whether your design works
- Generate a working module from a plain-English requirement and review it critically
- Generate a testbench and say what it does and does not prove
- Recognise the classic hazards: clock domain crossing, metastability, and where pipelining helps

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `logiclab.mp4` and `logiclab.jpg`.
3. In `src/content/labs/logiclab.ts`, set `video.url` to `"/demos/logiclab.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

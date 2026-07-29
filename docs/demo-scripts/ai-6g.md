# Demo video shot list — `ai-6g`

Target runtime **01:06**. Generated from `src/content/labs/ai-6g.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- A working idea of signal-to-noise ratio and what decibels are
- A desktop browser with WebGL for the 3D visualisations
- About 80 minutes for all three modules; each module stands alone in roughly 25
- Progress is saved in your browser's local storage — finish on the machine you started on

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:10 | Why 6G needs new ideas, not more spectrum | _fill in during storyboard_ |
| 00:10 | 00:18 | The three modules | _fill in during storyboard_ |
| 00:18 | 00:38 | Module 1 — Intelligent Reflecting Surfaces | _fill in during storyboard_ |
| 00:38 | 00:51 | Tools — the IRS SNR simulator | _fill in during storyboard_ |
| 00:51 | 01:00 | Semantic communication and JSCC simulators | _fill in during storyboard_ |
| 01:00 | 01:06 | Capstone project | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> Every generation of mobile network so far has worked the same way: transmit bits faithfully and let the application worry about what they mean. 6G research questions that. This lab covers three ideas that break the old assumption — smart surfaces that reflect radio waves where you want them, systems that transmit *meaning* rather than bits, and codecs that stop treating compression and error protection as separate problems. Each comes with a browser simulator you can push until it fails.

**Then work the 7 tutorial steps** (80 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Orient yourself on the dashboard

_See the three modules and how far you have got._

Show, in order:

- Sign in and land on the dashboard.
- Open Lessons to see Module 1 (Intelligent Reflecting Surfaces), Module 2 (Semantic Communication) and Module 3 (Joint Source-Channel Coding).
- Note that Tools holds the simulators separately from the lessons.

**Hold the shot on:** Three modules listed with progress indicators, and a Tools entry in the navigation.

**Say over it:** Progress is tracked locally per browser. If you switch machines you start from zero, so pick one and stay on it.

### 2. Module 1 — Intelligent Reflecting Surfaces

_Understand how a passive surface improves a radio link._

Show, in order:

- Open Lessons → Module 1 and read "Introduction to Intelligent Reflecting Surfaces".
- Focus on one point: each element re-radiates the incoming wave with a controllable phase shift.
- Continue to "Deep Reinforcement Learning for IRS Beamforming" and note why the phase configuration is learned rather than computed.

**Hold the shot on:** You can state what an IRS does without using the word 'amplify' — it does not add energy, it aligns phases so existing energy arrives coherently.

**Say over it:** That distinction matters commercially: an IRS is passive, so it needs almost no power and no licence, which is why it is attractive for filling coverage holes in buildings where a relay would be expensive.

### 3. Test the IRS claims in the simulator

_Turn the lesson's claims into a curve you can check._

Show, in order:

- Open Tools and select the IRS SNR Simulator.
- Set Number of IRS Elements to its minimum of 4 and read the SNR.
- Raise it towards 256 and watch the curve. Note that the gain is not linear.
- Now hold elements fixed and vary Distance from 10 to 200 metres, then Transmit Power from 0 to 30 dBm.
- Answer this before moving on: to recover the SNR lost by doubling the distance, is it cheaper to add elements or add power?

**Hold the shot on:** SNR rises steeply with the first elements added and flattens as you approach 256; it falls sharply with distance and rises linearly in dB with transmit power.

**Say over it:** The array gain grows with the number of elements while path loss grows with distance squared or worse. Understanding which knob buys you the most is the whole design problem, and dragging the sliders builds that intuition far faster than the closed-form expression does.

### 4. Module 2 — Semantic Communication

_Grasp the shift from transmitting bits to transmitting meaning._

Show, in order:

- Open Lessons → Module 2, starting with "Beyond Bits: Introduction to Semantic Communication".
- Read "Autoencoders for Semantic Feature Extraction".
- Hold a concrete example in mind: to convey "the road ahead is clear", a classical system sends a compressed image; a semantic system sends the conclusion.

**Hold the shot on:** You can name a case where a bit-perfect transmission is wasteful and one where semantic transmission would be dangerous.

**Say over it:** Semantic communication only pays off when the receiver's purpose is known in advance. For a self-driving car receiving road state it is a large win; for a medical image where the radiologist may look for something nobody anticipated, discarding detail is exactly the wrong move.

### 5. Run the Semantic and Autoencoder simulators

_Watch a learned representation compress a source and survive a noisy channel._

Show, in order:

- In Tools, open the Semantic Communication Simulator.
- Push the channel noise up and watch how the reconstruction degrades.
- Switch to the Autoencoder Visualizer and follow the input through encoder, bottleneck and decoder.
- Narrow the bottleneck and note what information disappears first.

**Hold the shot on:** As noise increases the reconstruction gets vaguer rather than corrupt; as the bottleneck narrows, fine detail goes before overall structure.

**Say over it:** The autoencoder learns which parts of the source matter for the reconstruction objective. What survives the bottleneck is the model's answer to "what is this signal about", and it is worth noticing that the answer depends entirely on what it was trained to preserve.

### 6. Module 3 and the JSCC simulator — find the cliff

_See the failure mode that joint coding exists to prevent._

Show, in order:

- Read Lessons → Module 3, "Introduction to Joint Source-Channel Coding".
- Open the JSCC Simulator in Tools.
- Start at high SNR and lower it in small steps, watching reconstruction quality.
- Find the point where a classical separated scheme collapses, and compare it with the JSCC curve at the same SNR.

**Hold the shot on:** The separated scheme holds up well and then fails abruptly below a threshold. The JSCC scheme degrades smoothly instead.

**Say over it:** Classical design compresses first, then protects — and once channel errors exceed what the error-correcting code can fix, the decompressor gets garbage and output quality falls off a cliff. Learning both jobs together removes the cliff, which matters enormously for mobile receivers whose channel quality changes second by second.

### 7. Complete the capstone and assessments

_Combine the three techniques in one design problem._

Show, in order:

- Open Capstone Project and work through the combined scenario.
- Take the assessment for each module.
- Use the Knowledge Bank to look up any term that blocks you.

**Hold the shot on:** A completed capstone and three module assessments.

## Close with

- Explain how an intelligent reflecting surface improves a link without amplifying anything
- Predict how SNR responds to element count, distance and transmit power, and check yourself against the simulator
- State what semantic communication sends instead of bits, and when that is a win
- Describe how a learned autoencoder extracts transmissible meaning from a source
- Explain why joint source-channel coding degrades gracefully where separated designs fall off a cliff

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `ai-6g.mp4` and `ai-6g.jpg`.
3. In `src/content/labs/ai-6g.ts`, set `video.url` to `"/demos/ai-6g.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

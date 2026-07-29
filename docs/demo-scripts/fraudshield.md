# Demo video shot list — `fraudshield`

Target runtime **00:42**. Generated from `src/content/labs/fraudshield.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- Familiarity with basic classification metrics — precision, recall, false positive rate
- A desktop browser; the network graph and 3D model comparison views need room and WebGL
- A microphone if you want to enrol your own voice in the Voice Biometrics lab (optional — sample recordings are provided)
- About 90 minutes for the full sequence, or 30 for the transaction lab alone

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:04 | Curriculum — how the workshop is laid out | _fill in during storyboard_ |
| 00:04 | 00:09 | AI Labs — the eight hands-on exercises | _fill in during storyboard_ |
| 00:09 | 00:17 | Transaction Anomaly Detector | _fill in during storyboard_ |
| 00:17 | 00:22 | Phishing Email Classifier | _fill in during storyboard_ |
| 00:22 | 00:27 | Model Tuning Workbench — the threshold trade-off | _fill in during storyboard_ |
| 00:27 | 00:36 | Intelligence — trends and network graphs | _fill in during storyboard_ |
| 00:36 | 00:42 | Assessments and certification | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> Banks and payment networks cannot review every transaction by hand — there are billions of them — so they train models to flag the suspicious ones. This lab is a working fraud-detection bench: you score live transactions for anomalies, classify phishing emails, verify identity documents, match voices against enrolled samples, tune a model's decision threshold, and then attack your own detector to see how easily it breaks.

**Then work the 8 tutorial steps** (94 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Read the curriculum before opening any lab

_Understand the arc of the workshop so each exercise has somewhere to sit._

Show, in order:

- Open Curriculum in the sidebar — it is the course outline plus an AI tutor.
- Skim the module list to see how the eight labs relate.
- Ask the tutor one question you already have, so you know how it behaves before you need it under time pressure.

**Hold the shot on:** A structured outline of the workshop and a responsive tutor panel.

**Say over it:** The labs are individually usable but deliberately sequenced: the tuning workbench only makes sense once you have felt a detector produce too many false positives, and the adversarial lab only lands once you have a model you feel ownership of.

### 2. Score transactions in the Anomaly Detector

_Meet the core problem — separating rare fraud from overwhelming legitimate volume._

Show, in order:

- Open AI Labs in the sidebar. It opens on the Transaction Anomaly Detector tab.
- Run the provided transaction stream and watch the risk scores populate.
- Pick one high-scoring transaction and read the contributing factors — amount, velocity, location mismatch, device novelty.
- Find a transaction with a high score that you judge to be genuine, and write down why the model got it wrong.

**Hold the shot on:** A scored transaction feed with a small number of high-risk items, each with an explanation of what drove the score.

**Say over it:** Fraud is heavily imbalanced — typically well under 1% of transactions. A model that predicts "not fraud" for everything is over 99% accurate and completely worthless, which is why accuracy is never the metric anyone uses here.

### 3. Classify phishing emails

_See the same detection problem in text, where the adversary writes the input._

Show, in order:

- Switch to the Phishing Email Classifier tab.
- Run the supplied examples and note which signals the classifier weights — sender mismatch, urgency language, link domains, credential requests.
- Edit a flagged email to make it read as legitimate while keeping its malicious intent, and re-run it.

**Hold the shot on:** Confident classifications on the obvious examples, and a measurable drop in confidence once you soften the urgency cues — often enough to slip below the threshold.

**Say over it:** Text classifiers key on surface signals that an attacker controls completely and can iterate against for free. This is your first direct experience of the adversarial dynamic the last lab formalises.

### 4. Work through Identity Verification and Voice Biometrics

_Extend detection to documents and audio, where failure modes are physical rather than statistical._

Show, in order:

- Open the Identity Verification tab and run the provided document checks.
- Note which manipulations the check catches and which it misses.
- Open Voice Biometrics, enrol a sample, then test matching and non-matching voices.

**Hold the shot on:** Verification decisions with confidence scores, and at least one manipulation that passes when you expected it to fail.

**Say over it:** Biometrics feel authoritative and are treated as such by users, but they are probabilistic like everything else — with the added problem that a compromised biometric cannot be reissued the way a password can.

### 5. Move the threshold in the Model Tuning Workbench

_Turn an abstract trade-off into a number with a currency symbol in front of it._

Show, in order:

- Open the Model Tuning Workbench tab.
- Set the decision threshold as low as it goes and read the confusion matrix: nearly all fraud caught, and a large block of genuine customers blocked.
- Raise it to the maximum and read it again: almost no false alarms, and most fraud through.
- Settle on the threshold you would actually deploy, and write down the assumed cost of a missed fraud versus a blocked genuine customer that justifies it.

**Hold the shot on:** A confusion matrix that moves continuously as you drag the threshold, with no setting that is good on both axes at once.

**Say over it:** There is no threshold that optimises both error types — moving one always worsens the other. The choice is a business decision about relative cost, not a technical one, and this is the step where that stops being a slogan.

### 6. Attack your own detector in the Adversarial Stress Lab

_Find out how much effort it takes an adversary to defeat what you just tuned._

Show, in order:

- Open the Adversarial Stress Lab tab.
- Take a transaction your model flags confidently and perturb it — split the amount, change the timing, route through a different device — until the score drops below your threshold.
- Count how many attempts it took.
- Return to the workbench and adjust your model in light of what you found.

**Hold the shot on:** You get a flagged transaction past your own detector, usually in a handful of attempts. That result is the intended one.

**Say over it:** Fraud models operate against an opponent who gets unlimited free tries and immediate feedback on whether an attempt worked. A model evaluated only on a static historical test set has never been tested against the thing it will actually face.

### 7. Review the Intelligence dashboards

_See what the detector looks like from the operations side, over time._

Show, in order:

- Open Intelligence in the sidebar.
- Work through the fraud trend chart, the transaction network graph and the model health monitor.
- On the network graph, look for accounts that connect to each other through shared devices or addresses.

**Hold the shot on:** Rings become visible as clusters in the network graph that were invisible when transactions were scored one at a time.

**Say over it:** Per-transaction scoring is blind to coordination. Organised fraud shows up in the relationships between accounts, which is why graph analysis sits alongside classification in every serious fraud stack.

### 8. Take the assessment

_Confirm the trade-off reasoning has stuck, not just the tool operation._

Show, in order:

- Open Assessments in the sidebar.
- Complete the quiz and the practical challenges.
- Use Resources to look up any concept you stumble on, then retry.

**Hold the shot on:** A completed assessment and, on a pass, a workshop certificate.

## Close with

- Score transactions for anomalies and explain which features drove each score
- Read a confusion matrix in money rather than percentages, and set a threshold that reflects real cost
- Explain why fraud models degrade in production and what monitoring catches it
- Identify the manipulations that defeat identity and voice verification
- Attack a detector you built and harden it against what you find

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `fraudshield.mp4` and `fraudshield.jpg`.
3. In `src/content/labs/fraudshield.ts`, set `video.url` to `"/demos/fraudshield.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

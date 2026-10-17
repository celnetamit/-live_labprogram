# Demo video shot list — `fraudshield`

Target runtime **00:42**. Generated from `src/content/labs/fraudshield.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- Transaction Scoring: Score transactions and review the factors associated with each risk score.
- Phishing Classification: Compare malicious and legitimate messages and examine the evidence behind each result.
- Identity Analysis: Compare document and capture images for visual consistency and possible manipulation.
- Voice Biometrics: Compare voice samples and examine indicators of genuine, replayed, or synthetic audio.
- Model Workbench (Intermediate): Compare models, adjust decision thresholds, and observe changes in performance.
- Typology Stress Test (Intermediate): Replay six attack patterns against the detector and find which it handles worst.
- Fraud Intelligence (Intermediate): Review fraud trends, network relationships, and model health.
- Assessment: Complete knowledge questions and practical decision-making exercises.

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:04 | Curriculum and workshop structure | _fill in during storyboard_ |
| 00:04 | 00:09 | AI Labs: eight hands-on activities | _fill in during storyboard_ |
| 00:09 | 00:17 | Transaction Anomaly Detector | _fill in during storyboard_ |
| 00:17 | 00:22 | Phishing Email Classifier | _fill in during storyboard_ |
| 00:22 | 00:27 | Model Tuning Workbench: threshold trade-offs | _fill in during storyboard_ |
| 00:27 | 00:36 | Intelligence: trends and network graphs | _fill in during storyboard_ |
| 00:36 | 00:42 | Assessment and certification | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> Banks and payment networks cannot review every transaction by hand — there are billions of them — so they train models to flag the suspicious ones. This lab is a working fraud-detection bench: you score live transactions for anomalies, classify phishing emails, verify identity documents, match voices against enrolled samples, tune a model's decision threshold, and then attack your own detector to see how easily it breaks.

**Then work the 8 tutorial steps** (94 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Read the Curriculum

_Understand how the workshop is organised before starting the hands-on work._

Show, in order:

- Open Curriculum from the sidebar.
- Review the list of modules.
- Read the key terms before starting the practical work.

**Hold the shot on:** A clear outline of the workshop and its activities. Note the mode selector in the lab: steps 1 to 4 work in Basic, while steps 5, 6 and 7 use the Model Workbench, the Typology Stress Test and Fraud Intelligence, which are Intermediate surfaces.

**Say over it:** The curriculum explains how the different parts of the lab are connected. One ordering detail is worth knowing before you start: Intermediate unlocks after you have scored a batch of transactions (step 2) and completed the assessment (step 8), and then chosen to switch. Working strictly top to bottom therefore meets a locked panel at step 5, so take the assessment straight after step 2 if you want to continue without interruption.

### 2. Score Transactions

_Score transactions and see how the model separates fraud from legitimate activity._

Show, in order:

- Open AI Labs and select Transaction Anomaly Detector.
- Run the prepared transaction dataset.
- Select a transaction with a high risk score.
- Review its amount, location, device, and recent activity.
- Find one incorrect prediction and consider why it occurred.

**Hold the shot on:** Most transactions should have a low risk score. A smaller number should be marked for review.

**Say over it:** Fraud cases are less common than legitimate transactions. Accuracy alone may therefore give a misleading result.

### 3. Classify Phishing Messages

_See how a text classifier separates malicious messages from legitimate ones._

Show, in order:

- Open Phishing Email Classifier.
- Test the supplied malicious and legitimate messages.
- Review the wording, the links and the request in each message. The classifier reads the message body only — it has no sender, no Reply-To and no SPF, DKIM or DMARC result — so note what a header check would have told you that the text cannot.
- Edit one message and run the classifier again.

**Hold the shot on:** Small changes in the message may change its risk score.

**Say over it:** A text classifier looks for patterns in the message. It may make mistakes when legitimate and malicious messages contain similar language.

### 4. Examine Identity and Voice Samples

_Test identity and voice verification against supplied samples._

Show, in order:

- Open Identity Verification.
- Compare the supplied document and capture images.
- Note which changes are detected and which are missed.
- Open Voice Biometrics and test the supplied voice samples.
- Record your own sample only if you wish to do so.

**Hold the shot on:** The modules should show similarities, differences, and possible signs of manipulation.

**Say over it:** Image and voice checks can support an investigation, but they cannot prove a person's identity by themselves.

### 5. Adjust the Decision Threshold (needs Intermediate mode)

_See how moving the decision threshold trades fraud detection against false alerts._

Show, in order:

- Open Model Tuning Workbench.
- Lower the threshold and review the results.
- Raise the threshold and compare the results.
- Note the number of detected fraud cases, missed cases, and false alerts.
- Choose a threshold and explain your choice.

**Hold the shot on:** A lower threshold usually detects more fraud but creates more false alerts. A higher threshold usually reduces false alerts but misses more fraud.

**Say over it:** The threshold should reflect fraud risk, customer inconvenience, investigation work, and cost.

### 6. Test the Detector Against Attack Typologies (needs Intermediate mode)

_Find which kinds of fraud the detector handles worst, and say what you would do about it._

Show, in order:

- Open Typology Stress Test. It replays six attack patterns generated with a different seed from the training data.
- Read the per-typology detection rates — they are ordered worst-first.
- Expand the weakest typology and read its lowest-scoring case.
- Change the alert threshold and watch which typologies cross it; note that comparing two models at one threshold is not like-for-like, because each model's scores sit on its own scale.
- Decide what you would add to close the worst gap — a feature, a rule, or a review step.

**Hold the shot on:** Detection varies sharply by typology: account takeover is caught far more often than synthetic-identity bust-out, which looks like ordinary account growth until the final draw-down.

**Say over it:** An overall detection rate hides the typology an attacker will actually choose. This is a coverage test rather than an adversarial one — nothing here optimises against the model — so read it as what the detector has not been taught, not as what a motivated attacker would achieve.

### 7. Review Fraud Patterns (needs Intermediate mode)

_Review fraud trends and the transaction network alongside individual scores._

Show, in order:

- Open Intelligence from the sidebar.
- Review the fraud trend chart.
- Examine the transaction network.
- Look for accounts linked through shared devices, addresses, or merchants.
- Review the model-health information.

**Hold the shot on:** Some related activities may be easier to see in the network than in individual transactions.

**Say over it:** Transaction scores describe individual cases. Trends and networks provide additional information. A connection does not prove fraud.

### 8. Complete the Assessment

_Check your understanding of the tools, results, and decision trade-offs._

Show, in order:

- Open Assessments.
- Complete the questions and practical tasks.
- Use Resources if you need help with a topic.
- Try the assessment again if required.

**Hold the shot on:** The assessment checks your understanding of the tools, results, and decision trade-offs. Learners who meet the required score may receive a completion certificate.

## Close with

- Score transactions and identify the factors linked to each risk score.
- Read a confusion matrix and consider the financial cost of each type of error.
- Select a decision threshold based on fraud risk, customer impact, and review cost.
- Explain why model performance may change over time and how it can be monitored.
- Recognise common limitations of identity-image and voice checks.
- Test how a detector responds when transaction details change.

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `fraudshield.mp4` and `fraudshield.jpg`.
3. In `src/content/labs/fraudshield.ts`, set `video.url` to `"/demos/fraudshield.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

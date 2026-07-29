# Demo video shot list — `ai-program-navigator`

Target runtime **01:03**. Generated from `src/content/labs/ai-program-navigator.ts` — edit the guide, not this file, then re-run `npm run demo:scripts`.

## Before recording

- Record at 1920×1080, 30fps, browser at 100% zoom, no bookmarks bar.
- Use a clean profile: no extensions, no notifications, no personal tabs.
- Rehearse each shot once. Cursor movement should be slow and deliberate.
- Pause 1s after each click so the viewer can see what changed.

Set up in advance so no shot is spent waiting:

- An honest account of what you can currently do — this is the input that determines the output quality
- A target role or goal in mind, even a vague one
- A résumé file if you want the résumé analysis (optional)
- About 35 minutes

## Shots

| In | Out | Chapter | On screen |
| --- | --- | --- | --- |
| 00:00 | 00:05 | Choosing where to start in the catalogue | _fill in during storyboard_ |
| 00:05 | 00:15 | Browsing the workshop catalogue | _fill in during storyboard_ |
| 00:15 | 00:37 | Filtering by subject and level | _fill in during storyboard_ |
| 00:37 | 00:56 | Opening a workshop | _fill in during storyboard_ |
| 00:56 | 01:03 | Profile, history and leaderboard | _fill in during storyboard_ |

## Narration source

The opening line comes from the guide summary; each subsequent beat mirrors a tutorial step, so the video and the written tutorial teach the same thing in the same order.

**Open with:**

> This is the lab that helps you choose the other labs. Rather than scrolling a catalogue and guessing, you describe your background and what you want to be able to do, and the navigator recommends a route through the available workshops. It also analyses a résumé against a target role to find the gaps, produces a career report, and lets you launch any workshop directly once you have decided.

**Then work the 6 tutorial steps** (49 min in written form, compressed to the runtime above — demonstrate, do not narrate every click):

### 1. Browse the catalogue before asking for advice

_Know what is on offer, so you can judge the recommendation you get._

Show, in order:

- Sign in and land on the workshop Catalog.
- Scan the cards to see the range of subjects and difficulty levels.
- Do not decide anything yet.

**Hold the shot on:** A grid of workshop cards with subject, difficulty and a short synopsis on each.

**Say over it:** A recommendation you cannot evaluate is just an instruction. Five minutes of browsing first means you can tell whether the navigator understood you.

### 2. Read one workshop detail page in full

_Learn what information is available per workshop._

Show, in order:

- Open any workshop that interests you.
- Read the summary, the prerequisites and the outcomes.
- Note what it assumes you already know.

**Hold the shot on:** A detail page with a plain-language summary, listed prerequisites, and concrete outcomes.

**Say over it:** Prerequisites are the field people skip and then regret. A workshop marked Advanced is not harder in the sense of requiring more effort; it assumes knowledge, and starting without it wastes the time you were trying to save.

### 3. Run the Program Navigator with the guided form

_Get a recommendation grounded in your actual position._

Show, in order:

- Open the Program Navigator.
- Use the guided form rather than free text for your first run — its fields prompt you for things you would otherwise omit.
- Fill in Highest Qualification, Field of Study, Years of Experience and Primary Industry/Role honestly.
- In Current Skills, add each skill individually — press Enter or comma between them — and be specific. "Python" is not usable; "Python scripting", "pandas" and "no ML training experience" together are.
- Tick the Interests that apply and add your own for anything not listed.
- Submit.

**Hold the shot on:** A set of recommended workshops with reasoning for each and a suggested order.

**Say over it:** The recommendation is only as good as the self-assessment behind it. Overstate your level and you get a path that loses you at step one; understate it and you spend hours on material you know. The guided form exists because free text tends to produce vague self-descriptions.

### 4. Interrogate the recommendation

_Make sure the ordering is right for you, not just plausible._

Show, in order:

- Read the reasoning attached to each recommendation, not just the list.
- Open the detail page of the first suggestion and check its prerequisites against what you said.
- If something looks wrong, re-run the navigator with a more precise description rather than accepting it.
- Try free-form input as well and see whether the answer changes.

**Hold the shot on:** A path whose ordering you can justify. If you cannot, your input needs sharpening.

**Say over it:** Ordering is where these recommendations are most often wrong, because it depends on knowledge you may have from elsewhere and did not mention. You are the only one who can check it.

### 5. Analyse a résumé against a target role

_Turn a vague sense of a gap into a specific list._

Show, in order:

- Open the résumé analysis and upload your CV.
- Name the role you are targeting.
- Read the analysis and the visualisation of where you stand.
- Note which gaps the catalogue can close and which it cannot.

**Hold the shot on:** A structured comparison of your current profile against the role's requirements, with gaps identified.

**Say over it:** Some gaps are training gaps and some are experience gaps. No workshop substitutes for having shipped something, and knowing which of your gaps is which changes what you should do next.

### 6. Generate the career report and commit to a first workshop

_Leave with a plan and actually start._

Show, in order:

- Generate the career report for your target role.
- Read it alongside your navigator recommendations and reconcile the two.
- Open your chosen first workshop and launch it.
- Check Profile and Leaderboard to see how progress is tracked.

**Hold the shot on:** A career report, a chosen starting workshop, and a launched lab environment.

**Say over it:** The tool's value is realised at launch, not at recommendation. Use History to revisit any analysis later rather than re-running it from scratch.

## Close with

- Describe your current skills and goals precisely enough to get a useful recommendation
- Read a recommended learning path and understand why it is ordered that way
- Identify the gap between your current skills and a target role
- Compare workshops on prerequisites and outcomes rather than on title
- Launch a workshop and track what you have completed

## Publishing

1. Export as MP4 (H.264, AAC) and a JPEG poster frame from around the 3-second mark.
2. Drop them in `public/demos/` as `ai-program-navigator.mp4` and `ai-program-navigator.jpg`.
3. In `src/content/labs/ai-program-navigator.ts`, set `video.url` to `"/demos/ai-program-navigator.mp4"`.
4. Confirm `video.durationSec` and every chapter mark match the final cut — chapter marks are clickable seek points on the self-hosted player.

To host on YouTube or Vimeo instead, set `video.url` to the watch or share URL; the player switches to a privacy-mode embed. Chapters then render as a static outline, because a cross-origin iframe cannot be seeked without loading the provider's SDK.

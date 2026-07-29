# Demo videos

Every lab detail page has a **Demo video** section. Until a file exists it shows
an "in production" placeholder plus the chapter list, so the section is useful
before anything has been recorded — a visitor can still see exactly what the lab
covers.

## Where the content comes from

`src/content/labs/<slug>.ts` is the single source of truth. It holds the lab
summary, the tutorial steps, and the video's chapter marks and runtime. The
per-lab shot lists in this directory are **generated** from it:

```bash
npm run demo:scripts
```

Edit the guide, re-run that, and the shot lists follow. Do not hand-edit the
generated `<slug>.md` files — the next run overwrites them. The one field left
for a human is the `On screen` column in the shot table, which you fill in while
storyboarding; copy it somewhere else before regenerating.

## Automated recording

`scripts/record-demo.mjs` drives a lab app in a real browser and produces
`public/demos/<slug>.mp4` plus a poster frame. It is a **silent screen capture**
— no narration, no titles — but it is real footage of the real app, and it is
what `virtual-ai` currently ships.

```bash
npm i -D puppeteer ffmpeg-static     # not portal dependencies; install to record
cd ../virtual-ai && npm run dev      # boot the lab on :3000
node scripts/record-demo.mjs virtual-ai http://localhost:3000/
```

It prints a `video: { … }` block to paste into the guide. **Spot-check the
chapter marks before publishing** — the script rescales wall-clock beats to the
finished duration, but the drift is not linear (frame delivery slows while 3D
viewers load), so a mark can land a few seconds early:

```bash
ffmpeg -ss 41 -i public/demos/virtual-ai.mp4 -vframes 1 /tmp/check.png
```

To add a lab, write a walkthrough in the `WALKTHROUGHS` map. Two things bite
every time and are already handled by the helpers: lab navigation is `<a>` not
`<button>`, and several labs render their stepper twice (mobile chips plus
desktop list, one always `display:none`) so clicks must target visible elements.

Labs whose interesting output comes from a language model need a working
provider key in that app's `.env.local`, or the recording will capture error
states.

## Recording by hand

Follow the shot list. The conventions it prints at the top matter more than they
look: 1920×1080 at 100% browser zoom keeps text legible after compression, and
the one-second pause after each click is the difference between a demo someone
can follow and one they have to scrub back through.

Each lab's shot list mirrors its written tutorial step for step, so the video and
the page teach the same thing in the same order. That is deliberate — a learner
who watches first and reads second should not have to re-orient.

## Publishing a recording

Self-hosted, which is the default:

1. Export MP4 (H.264 video, AAC audio) and a JPEG poster frame.
2. Put them in `public/demos/` as `<slug>.mp4` and `<slug>.jpg`.
3. In `src/content/labs/<slug>.ts`, set `video.url` to `"/demos/<slug>.mp4"`.
4. Set `video.durationSec` to the final runtime and check every chapter mark
   against the cut. On the self-hosted player the chapter list is clickable and
   seeks the video, so wrong marks are visibly wrong.
5. If you have captions, add `<slug>.vtt` alongside and set `video.captions`.

Hosted on YouTube or Vimeo instead: set `video.url` to the watch or share URL.
The player detects it and switches to a privacy-mode embed
(`youtube-nocookie.com` / `player.vimeo.com`). Chapters then render as a static
outline rather than seek buttons, because seeking a cross-origin iframe requires
loading the provider's SDK, which the embed deliberately avoids.

Only YouTube and Vimeo are recognised. Any other host falls through to the
`<video>` element, which will fail unless the URL is a direct media file — this
is intentional, so an arbitrary URL is never dropped into an iframe.

## Adding a lab

A lab with no module in `src/content/labs` renders exactly as it did before:
the seeded `instructions` column for owners, nothing extra for visitors. To add
one, copy the closest existing guide, keep `slug` matching the database `slug`,
and register it in `src/content/labs/index.ts`.

# Lab walkthrough clips

One short screen recording per laboratory, shown in the homepage gallery.

## Where they are wired up

`src/content/labs/previews.ts` — set each lab's `media` to the filename you
drop in this folder. Until it is set, that card shows a neutral "Walkthrough
being recorded" frame rather than a stand-in image.

```ts
{ slug: "micro-ai", name: "MicrobeAI BioLab", blurb: "…", media: "micro-ai.mp4" }
```

## Format

**Record MP4 (H.264), not GIF.** The gallery accepts `.mp4`, `.webm` and
`.gif`, but the difference is not small:

| Format | ~10 s of a 1280x720 screen capture |
| ------ | ---------------------------------- |
| MP4 (H.264, CRF 28) | ~0.3–0.6 MB |
| GIF                 | ~6–12 MB    |

GIF has no interframe compression and caps at 256 colours, which visibly
posterises charts and text. Thirteen GIFs is roughly 100 MB on the homepage;
thirteen MP4s is roughly 5 MB. A video is also pausable, so off-screen cards
cost nothing — a GIF loops from the moment it is fetched and cannot be stopped.

## Recipe

Record the lab doing one thing a visitor would recognise — a run completing, a
chart filling in, a parameter being changed. 8–12 seconds, no cursor hunting,
no sign-in screen.

Then convert:

```sh
# from any screen recording
ffmpeg -i raw.mov -vf "scale=1280:-2,fps=24" -c:v libx264 -crf 28 \
       -pix_fmt yuv420p -movflags +faststart -an micro-ai.mp4

# a poster frame, so the card is not blank before the clip plays
ffmpeg -i micro-ai.mp4 -vframes 1 -q:v 3 micro-ai.jpg
```

Set `media: "micro-ai.mp4"` and `poster: "micro-ai.jpg"` in `previews.ts`.

If you must use GIF:

```sh
ffmpeg -i raw.mov -vf "fps=12,scale=800:-1:flags=lanczos,split[a][b];\
[a]palettegen[p];[b][p]paletteuse" -loop 0 micro-ai.gif
```

## Naming

Use the lab's slug: `metamaterials.mp4`, `micro-ai.mp4`, `drugdiscovery-ai.mp4`,
`virtual-ai.mp4`, `omicslab.mp4`, `logiclab.mp4`, `fraudshield.mp4`,
`smartfactory-ai.mp4`, `denovo-genai-lab.mp4`, `battery-ai.mp4`, `ai-6g.mp4`,
`cognicore-ai.mp4`, `ai-program-navigator.mp4`.

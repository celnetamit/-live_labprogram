"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Clapperboard, ListVideo, Play, PlayCircle } from "lucide-react";
import type { LabVideo } from "@/content/labs";

/** `mm:ss`, or `h:mm:ss` past an hour. */
function timecode(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${minutes}:${String(secs).padStart(2, "0")}`;
}

/**
 * A YouTube or Vimeo embed URL, or `null` for anything else (a self-hosted
 * file, played with `<video>` instead). Only those two hosts are recognised
 * deliberately: an unrecognised URL must never be dropped into an iframe.
 */
function embedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url, "https://placeholder.invalid");
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1);
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const id = parsed.searchParams.get("v") ?? parsed.pathname.split("/embed/")[1];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = parsed.pathname.split("/").filter(Boolean).pop();
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}

/**
 * A designed cover for the player, shown until playback starts: a showcase
 * lab's cover photograph with the same frame, play button and caption as the
 * walkthrough card in its hero, so the card and the player it jumps to look
 * like one object. Without it the player opens on the poster frame, which is
 * a light screenshot of the lab.
 */
export type DemoCover = { image: string; title: string };

export default function DemoVideo({
  video,
  labName,
  cover,
}: {
  video: LabVideo;
  labName: string;
  cover?: DemoCover;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);

  const embed = video.url ? embedUrl(video.url) : null;
  const selfHosted = Boolean(video.url) && !embed;
  const chapters = video.chapters;

  /*
   * Chapter seeking only works on the self-hosted player. Seeking a
   * cross-origin iframe needs the provider's SDK, which the no-cookie embed
   * exists to avoid — so for embeds the chapters stay a readable outline.
   */
  const seek = useCallback((at: number) => {
    const el = ref.current;
    if (!el) return;
    el.currentTime = at;
    void el.play();
  }, []);

  /* Follow playback so the chapter list marks where the viewer actually is. */
  useEffect(() => {
    const el = ref.current;
    if (!el || chapters.length === 0) return;
    const onTime = () => {
      const t = el.currentTime;
      let index = 0;
      for (let i = 0; i < chapters.length; i += 1) {
        if (chapters[i].at <= t + 0.25) index = i;
      }
      setCurrent(index);
    };
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, [chapters]);

  const chapterList = (
    <ol className="space-y-0.5">
      {chapters.map((chapter, index) => {
        const active = selfHosted && started && index === current;
        const content = (
          <>
            <span
              className={`font-mono text-[11px] tabular-nums shrink-0 ${
                active ? "text-[color:var(--color-primary-ink)]" : "text-muted-foreground"
              }`}
            >
              {timecode(chapter.at)}
            </span>
            <span className="leading-snug">{chapter.label}</span>
          </>
        );

        if (!selfHosted) {
          return (
            <li
              key={chapter.at}
              className="flex items-baseline gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground"
            >
              {content}
            </li>
          );
        }
        return (
          <li key={chapter.at}>
            <button
              type="button"
              onClick={() => seek(chapter.at)}
              aria-current={active ? "true" : undefined}
              className={`flex w-full items-baseline gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors focus-ring ${
                active
                  ? "bg-primary/10 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {content}
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <section
      id="demo"
      className="panel scroll-mt-[8.5rem] overflow-hidden xl:scroll-mt-24"
      aria-labelledby="demo-video-heading"
    >
      {/* Above the panel's tint layers, so the blend colours the surface
          and never the text. */}
      <div className="relative z-10">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5 sm:px-6 sm:pt-6">
        <h2
          id="demo-video-heading"
          className="panel-heading flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <span aria-hidden className="panel-heading-icon">
            <Clapperboard className="h-[1.125rem] w-[1.125rem] shrink-0 text-primary" />
          </span>{" "}
          Demo video
        </h2>
        <div className="flex items-center gap-2">
          {video.url && (
            /*
              Driven by the field, not asserted. This read "Captioned · no
              sound needed" for every lab with a video, while no guide in
              `src/content/labs/` sets `captions` — so the `<track>` below
              never renders and the badge told a deaf learner the work was
              done. It turns itself on when a track is finally authored.
            */
            <span className="text-xs text-muted-foreground">
              {video.captions ? "Captions available" : "No narration — on-screen text only"}
            </span>
          )}
          {video.durationSec ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {timecode(video.durationSec)}
            </span>
          ) : null}
        </div>
      </div>

      {/*
        Side by side only from `2xl`. At `lg` this split left a 317x178px
        video with a 320px chapter list beside it — the table of contents was
        physically larger than the film — because the page's own rail takes
        16rem at `xl` and the shell's sidebar another 16rem at `lg`.

        A real divider rather than `gap-px` over `bg-border/60`: that trick
        needs opaque cells to read as a hairline, and neither cell has a
        background, so the border colour was painting the entire grid area
        and taking the chapter list's `muted-foreground` to 4.34:1.
      */}
      <div className="mt-4 grid divide-y divide-border 2xl:grid-cols-[minmax(0,1fr)_18rem] 2xl:divide-x 2xl:divide-y-0">
        <div className="p-4 sm:p-5">
          {video.url && embed ? (
            <div className="relative w-full overflow-hidden rounded-xl border border-border bg-black aspect-video">
              <iframe
                src={embed}
                title={`${labName} — demo video`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : video.url ? (
            <div className="relative">
              <video
                ref={ref}
                controls
                playsInline
                preload="metadata"
                poster={cover?.image ?? video.poster}
                onPlay={() => setStarted(true)}
                className="w-full rounded-xl border border-border bg-black aspect-video"
              >
                <source src={video.url} />
                {video.captions ? (
                  <track kind="captions" src={video.captions} srcLang="en" label="English" default />
                ) : null}
                Your browser cannot play this video.
              </video>

              {/*
                The cover, while nothing has played. Any way of starting —
                this button, a chapter, the native controls — fires `play`,
                which sets `started` and takes the cover away.
              */}
              {!started && cover && (
                <button
                  type="button"
                  onClick={() => {
                    void ref.current?.play();
                  }}
                  aria-label={`Play the ${labName} demo`}
                  className="sc-video sc-video-cover focus-ring"
                >
                  <Image src={cover.image} alt="" fill sizes="(max-width: 1536px) 100vw, 900px" className="object-cover" />
                  <span aria-hidden className="sc-play">
                    <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" strokeWidth={0} />
                  </span>
                  <span className="sc-video-foot">
                    <span>
                      <small>Lab walkthrough</small>
                      <strong>{cover.title}</strong>
                    </span>
                    {video.durationSec ? (
                      <span className="sc-duration">{timecode(video.durationSec)}</span>
                    ) : null}
                  </span>
                </button>
              )}

              {/* A real play affordance over the poster — the native control is
                  small and easy to miss on a dark first frame. */}
              {!started && !cover && (
                <button
                  type="button"
                  onClick={() => {
                    void ref.current?.play();
                  }}
                  aria-label={`Play the ${labName} demo`}
                  className="absolute inset-0 grid place-items-center rounded-xl bg-black/25 transition-colors hover:bg-black/10 focus-ring"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" />
                  </span>
                </button>
              )}
            </div>
          ) : (
            /* No file yet. The chapter list still tells a prospective learner
               exactly what the lab covers, so the section stays useful. */
            <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/50 px-6 text-center">
              <PlayCircle className="w-10 h-10 text-muted-foreground" />
              <p className="font-medium">Walkthrough in production</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Everything the demo will cover is listed here, and the written tutorial takes you
                through all of it today.
              </p>
            </div>
          )}
        </div>

        {chapters.length > 0 && (
          <div className="p-4 sm:p-5">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ListVideo className="w-4 h-4" /> Chapters
            </h3>
            {/* Capped and scrollable so a long chapter list cannot push the
                page layout around on desktop. */}
            <div className="2xl:max-h-[19.5rem] 2xl:overflow-y-auto 2xl:pr-1">{chapterList}</div>
            {selfHosted && (
              <p className="mt-2 px-2.5 text-[11px] text-muted-foreground">
                Select a chapter to jump there.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

export default function DemoVideo({ video, labName }: { video: LabVideo; labName: string }) {
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
                active ? "text-primary" : "text-muted-foreground/70"
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
              className={`flex w-full items-baseline gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
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
      className="scroll-mt-24 glass rounded-2xl overflow-hidden"
      aria-labelledby="demo-video-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5 sm:px-6 sm:pt-6">
        <h2
          id="demo-video-heading"
          className="text-base sm:text-lg font-semibold flex items-center gap-2"
        >
          <Clapperboard className="w-5 h-5 text-primary shrink-0" /> Demo video
        </h2>
        <div className="flex items-center gap-2">
          {video.url && (
            /* No audio track, but the guidance is burned into the picture — so
               say it plays fine without sound rather than just "silent". */
            <span className="pill border-border text-muted-foreground">
              Captioned · no sound needed
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
        Side-by-side on a wide screen so the chapter list is usable while the
        video plays; stacked below `lg`, where a 320px rail would squeeze the
        video to an unwatchable size.
      */}
      <div className="mt-4 grid gap-px bg-border/60 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="bg-card/40 p-4 sm:p-5">
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
                poster={video.poster}
                onPlay={() => setStarted(true)}
                className="w-full rounded-xl border border-border bg-black aspect-video"
              >
                <source src={video.url} />
                {video.captions ? (
                  <track kind="captions" src={video.captions} srcLang="en" label="English" default />
                ) : null}
                Your browser cannot play this video.
              </video>

              {/* A real play affordance over the poster — the native control is
                  small and easy to miss on a dark first frame. */}
              {!started && (
                <button
                  type="button"
                  onClick={() => {
                    void ref.current?.play();
                  }}
                  aria-label={`Play the ${labName} demo`}
                  className="absolute inset-0 grid place-items-center rounded-xl bg-black/25 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full btn-brand shadow-lg">
                    <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" />
                  </span>
                </button>
              )}
            </div>
          ) : (
            /* No file yet. The chapter list still tells a prospective learner
               exactly what the lab covers, so the section stays useful. */
            <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/40 px-6 text-center">
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
          <div className="bg-card/40 p-4 sm:p-5">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ListVideo className="w-4 h-4" /> Chapters
            </h3>
            {/* Capped and scrollable so a long chapter list cannot push the
                page layout around on desktop. */}
            <div className="lg:max-h-[19.5rem] lg:overflow-y-auto lg:pr-1">{chapterList}</div>
            {selfHosted && (
              <p className="mt-2 px-2.5 text-[11px] text-muted-foreground/80">
                Select a chapter to jump there.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

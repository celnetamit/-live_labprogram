"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

/*
  The rotating hero, built to the reference site's behaviour.

  What it does, and why each part is there:

  * Slides advance on their own every SLIDE_MS, and the active dot fills over
    that interval so the bar is a progress indicator rather than decoration.
  * A pause control sits top-left, the dots and the two arrows top-right.
  * Anything other than the timer taking a turn — an arrow, a dot, hovering,
    tabbing into the region — stops the rotation. A carousel that moves out
    from under the pointer while someone is reading it is the single thing
    people hate most about carousels, and the pause has to be sticky once
    pressed rather than resuming after the next tick.
  * `prefers-reduced-motion` means it never starts. The controls still work,
    so the content is all reachable; it simply does not move by itself.
  * Only the active slide is in the accessibility tree and only its links are
    focusable, so tabbing does not walk through three hidden headlines.

  The images are the laboratories' own cover photographs, the same ones the
  catalogue cards use.
*/

export type HeroSlide = {
  id: string;
  /** Small caps line above the headline. */
  eyebrow: string;
  /** Headline, split so one phrase can be set in italic as the reference does. */
  title: [string, string, string?];
  /* Optional: the lead slide carries the headline alone, while the lab
     slides each carry that laboratory's own tagline. */
  sub?: string;
  cta: { label: string; href: string };
  /** The laboratory photograph behind this slide. */
  image: string;
};

const SLIDE_MS = 7000;

export default function HeroCarousel({
  slides,
  footer,
}: {
  slides: HeroSlide[];
  /*
    Rendered at the foot of the hero, inside its shell. The quick-link strip
    goes here rather than being a sibling pulled up by a negative margin: as
    the hero's last child it sits on the hero's bottom edge whatever height
    it happens to be, so the band fills exactly one screen at any width. The
    margin version assumed a 62px strip and broke below 1280, where the tab
    labels wrap to two lines.
  */
  footer?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  /* Separate from `playing`: hovering suspends the timer, but it must not
     clear a pause the visitor actually pressed. */
  const [suspended, setSuspended] = useState(false);
  const [reduced, setReduced] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(mq.matches);
      if (mq.matches) setPlaying(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  /* Any deliberate move stops the rotation for good. */
  const take = useCallback((next: number) => {
    setPlaying(false);
    go(next);
  }, [go]);

  const running = playing && !suspended && !reduced && slides.length > 1;

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => go(index + 1), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [running, index, go]);

  const active = slides[index];

  return (
    <section
      ref={regionRef}
      className="els-hero"
      aria-roledescription="carousel"
      aria-label="Featured laboratories"
      /*
        Deliberately no pointer-enter pause.

        The hero fills most of the first screen, so a mouse left anywhere over
        it held the timer indefinitely and the carousel simply never advanced.
        The reference does not pause on hover either — it gives you the pause
        button instead, which is right there. Focus still suspends, because a
        carousel that moves while someone is tabbing through it takes the
        control out from under them (WCAG 2.2.2).
      */
      onFocusCapture={() => setSuspended(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSuspended(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); take(index + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); take(index - 1); }
      }}
    >
      {/* Every slide's photography stays mounted and crossfades. Swapping the
          `src` instead made each change a white flash while the next file
          decoded. */}
      <div className="els-hero-media" aria-hidden="true">
        {slides.map((s, i) => (
          <div key={s.id} className="els-hero-frame" data-on={i === index ? "true" : undefined}>
            <Image
              src={s.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="els-hero-photo"
            />
            {/* One photograph per slide, and it is that laboratory's own.
                Nothing is laid over it: the collage carried a second lab's
                picture (so the XRD slide showed a tray of logic chips) and
                then a solid block of the brand colour, and both are gone. */}
          </div>
        ))}
      </div>
      <div className="els-hero-scrim" aria-hidden="true" />

      <div className="els-shell">
        <div className="els-hero-controls">
          {slides.length > 1 && (
            <button
              type="button"
              className="els-hero-play"
              onClick={() => setPlaying((v) => !v)}
              aria-label={playing ? "Pause the carousel" : "Play the carousel"}
            >
              {playing && !reduced ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </button>
          )}

          {slides.length > 1 && (
            <div className="els-hero-nav">
              <button type="button" onClick={() => take(index - 1)} aria-label="Previous slide">
                <ChevronLeft aria-hidden="true" />
              </button>
              <div className="els-hero-dots" role="tablist" aria-label="Choose a slide">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Slide ${i + 1} of ${slides.length}`}
                    className="els-hero-dot"
                    data-on={i === index ? "true" : undefined}
                    data-filling={i === index && running ? "true" : undefined}
                    onClick={() => take(i)}
                  >
                    <span />
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => take(index + 1)} aria-label="Next slide">
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div className="els-hero-inner">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className="els-hero-copy"
              data-on={i === index ? "true" : undefined}
              aria-hidden={i === index ? undefined : true}
              /* Keeps the hidden slides' links out of the tab order. React 19
                 takes `inert` as a real boolean prop; passing it as `""` the
                 way React 18 needed logs "Received an empty string for a
                 boolean attribute" and applies nothing. */
              inert={i !== index}
            >
              <p className="els-meta els-hero-eyebrow">{s.eyebrow}</p>
              <h1 className="els-display" style={{ marginTop: "1rem" }}>
                {s.title[0]}
                {s.title[1] && <em>{s.title[1]}</em>}
                {s.title[2]}
              </h1>
              {s.sub && <p className="els-lead">{s.sub}</p>}
              <div className="els-hero-actions">
                <Link href={s.cta.href} className="els-pill">
                  {s.cta.label} <ArrowUpRight aria-hidden="true" />
                </Link>
                {i === 0 && (
                  <Link href="#how-it-works" className="els-pill els-pill-glass">
                    See how it works <ArrowRight aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {footer}
      </div>

      {/* Announces the change without the timer spamming a screen reader: the
          region is polite and only carries the slide's name. */}
      <p className="sr-only" aria-live="polite">
        {active ? `Slide ${index + 1} of ${slides.length}: ${active.title.join("")}` : ""}
      </p>
    </section>
  );
}

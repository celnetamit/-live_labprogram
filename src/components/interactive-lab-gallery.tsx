"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Lab3DPreview, { type LabPreviewKind } from "@/components/lab-3d-preview";

/*
  The laboratory showcase: a horizontal scroller of cards, each carrying a
  live WebGL preview of what that lab actually draws.

  The box this turns inside is in `globals.css` under "The laboratory
  showcase"; everything here is what the stylesheet says is JS's job — the
  per-frame turn, which card is the active one, and which cards are allowed
  to hold a WebGL context.

  Two budgets govern the whole file:

  * A document gets on the order of sixteen WebGL contexts before the browser
    starts dropping the oldest. Thirteen previews would sit on that limit, so
    only the cards within `LIVE_RADIUS` of the active one are `live`; the rest
    render their poster frame and nothing else. `Lab3DPreview` tears its
    context down when `live` goes false and builds a fresh one when it
    returns, so the window can slide as you scroll.

  * Only the active card is `interactive`. A preview that captures the
    pointer is a preview you cannot swipe past, and with four across a row
    there would be nowhere left to swipe.
*/

export type ShowcaseLab = {
  /** Must match `Lab.slug`, so the card links to the lab's own guide. */
  slug: string;
  name: string;
  subject: string;
  /** Which model `Lab3DPreview` draws. */
  kind: LabPreviewKind;
  /** Poster frame, shown behind the canvas and alone when it is not live. */
  src: string;
};

/** Cards either side of the active one that keep a WebGL context. */
const LIVE_RADIUS = 2;

/** Degrees of turn a card has reached by the time it leaves the viewport. */
const MAX_TURN = 17;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function InteractiveLabGallery({ labs }: { labs: ShowcaseLab[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLLIElement | null)[]>([]);
  const frameRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /*
    One pass over the row: turn each card by how far it sits from the middle
    of the viewport, and record which card is nearest it.

    Under `prefers-reduced-motion` this still runs — the active card and the
    context budget both depend on it — but it writes no transform and clears
    any it left behind, which is the `settle()` the stylesheet refers to.
  */
  const settle = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const box = viewport.getBoundingClientRect();
    const middle = box.left + box.width / 2;

    let nearest = 0;
    let nearestDistance = Infinity;

    slotRefs.current.forEach((slot, index) => {
      if (!slot) return;
      const rect = slot.getBoundingClientRect();
      const distance = rect.left + rect.width / 2 - middle;

      if (Math.abs(distance) < nearestDistance) {
        nearestDistance = Math.abs(distance);
        nearest = index;
      }

      if (reduced) {
        slot.style.transform = "";
        slot.style.opacity = "";
        return;
      }

      /*
        `offset` is in viewport-widths, so the turn is the same gesture
        whether the row is showing one card or five.

        The `perspective()` function goes in the transform rather than on the
        parent: a `perspective` property on the track would share one vanishing
        point across every card, so the cards at the ends would skew instead of
        turn. Per element, each card turns about its own centre.
      */
      const offset = clamp((distance / box.width) * 2, -1, 1);
      slot.style.transform = `perspective(1400px) rotateY(${(offset * MAX_TURN).toFixed(2)}deg)`;
      slot.style.opacity = (1 - Math.abs(offset) * 0.28).toFixed(3);
    });

    setActive(nearest);

    /*
      The ends are read off the first and last card, not off `scrollLeft`.

      `scroll-snap-type: proximity` parks the row a few pixels off zero — it
      rests at 11px at 1920 — so `scrollLeft <= 1` was never true and the
      previous button never greyed out, even sitting at the start. Where the
      cards actually are is the thing being asked about anyway.
    */
    const first = slotRefs.current[0]?.getBoundingClientRect();
    const last = slotRefs.current[slotRefs.current.length - 1]?.getBoundingClientRect();
    setAtStart(!first || first.left >= box.left - 1);
    setAtEnd(!last || last.right <= box.right + 1);
  }, []);

  /* Scroll fires far more often than the screen refreshes, so the work is
     coalesced onto one frame rather than run per event. */
  const schedule = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      settle();
    });
  }, [settle]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    settle();
    viewport.addEventListener("scroll", schedule, { passive: true });

    /* A resize changes `--lab-cards`, so every card's width and its place in
       the row change with it. */
    const observer = new ResizeObserver(schedule);
    observer.observe(viewport);

    /* Turning reduced motion on or off has to repaint the row, because the
       transforms are inline styles that CSS cannot reach. */
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener("change", settle);

    return () => {
      viewport.removeEventListener("scroll", schedule);
      observer.disconnect();
      motion.removeEventListener("change", settle);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [schedule, settle]);

  /** Move the row by exactly one card, gap included. */
  const step = (direction: 1 | -1) => {
    const viewport = viewportRef.current;
    const slot = slotRefs.current[active] ?? slotRefs.current[0];
    if (!viewport || !slot) return;
    const track = slot.parentElement;
    const gap = track ? parseFloat(getComputedStyle(track).columnGap || "0") || 0 : 0;
    viewport.scrollBy({
      left: direction * (slot.getBoundingClientRect().width + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  return (
    <div className="lab-carousel">
      <div className="lab-carousel-bar">
        <p className="lab-carousel-count">
          <span className="lab-carousel-index">
            <strong>{active + 1}</strong> / {labs.length}
          </span>
          <span className="lab-carousel-sep" aria-hidden="true" />
          <span className="lab-carousel-now">{labs[active]?.name}</span>
        </p>
        <div className="lab-carousel-nav">
          <button type="button" onClick={() => step(-1)} disabled={atStart} aria-label="Previous lab">
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" onClick={() => step(1)} disabled={atEnd} aria-label="Next lab">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* `tabIndex` because this scrolls: without it a keyboard user can reach
          the links inside but cannot scroll the row itself (WCAG 2.1.1). */}
      <div
        ref={viewportRef}
        className="lab-carousel-viewport"
        tabIndex={0}
        role="group"
        aria-label="Laboratories and projects"
      >
        <ul className="lab-carousel-track">
          {labs.map((lab, index) => {
            const distance = Math.abs(index - active);
            return (
              <li
                key={lab.slug}
                ref={(node) => { slotRefs.current[index] = node; }}
                className={`lab-carousel-slot ${index === active ? "is-active" : ""}`}
              >
                <article className="lab-showcase-card">
                  <Lab3DPreview
                    kind={lab.kind}
                    name={lab.name}
                    fallbackSrc={lab.src}
                    live={distance <= LIVE_RADIUS}
                    interactive={index === active}
                  />
                  <div className="lab-showcase-copy">
                    <span className="lab-showcase-subject">{lab.subject}</span>
                    <h3 className="lab-showcase-title">
                      <Link href={`/labs/${lab.slug}`} className="lab-showcase-link">
                        {lab.name}
                      </Link>
                    </h3>
                    {/* Not a link: the title's link already covers the copy
                        through its `::after`, and a second control over the
                        same target would be a second tab stop to the same
                        page. */}
                    <span className="lab-showcase-action" aria-hidden="true">
                      Explore lab <ArrowRight aria-hidden="true" />
                    </span>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

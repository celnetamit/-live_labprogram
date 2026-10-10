"use client";

import { useEffect, useRef } from "react";

/*
  A figure that counts to its value when it first scrolls into view.

  Two rules this follows, because a counting number is exactly the kind of
  flourish that quietly tells a lie:

  1. It always lands on `value`, exactly. The final frame is assigned rather
     than interpolated, so rounding can never leave 103 on screen where the
     guides contain 104.
  2. The real number is in the DOM from the first server render, inside the
     element. If JavaScript never runs, or the observer never fires, the
     reader still sees 104 — the animation replaces a correct number with
     itself, it does not supply one.

  `prefers-reduced-motion` skips straight to the value. It runs once; a stat
  that re-counts every time it scrolls past is a toy.
*/
export default function CountUp({
  value,
  className = "",
  duration = 1100,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let done = false;

    const run = (start: number) => {
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        /* Ease out: fast first, settling at the end — a counter that decelerates
           reads as arriving at a number rather than stopping at one. */
        const eased = 1 - Math.pow(1 - t, 3);
        if (t >= 1) {
          el.textContent = String(value); // exact, not rounded
          done = true;
          return;
        }
        el.textContent = String(Math.round(value * eased));
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || done) return;
        io.disconnect();
        el.textContent = "0";
        run(performance.now());
      },
      { threshold: 0.5 },
    );
    io.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [value, duration]);

  /* The true value is the server-rendered content. */
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}

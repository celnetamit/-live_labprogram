"use client";

import { useEffect, useRef } from "react";

/*
  How far through the page you are, as a hairline under the header.

  Written against a ref and a scroll listener rather than React state on
  purpose: this updates on every scroll frame, and putting that through a
  re-render would reconcile the whole header sixty times a second to move one
  CSS transform. The element is written to directly and React never sees it.

  `scaleX` on a pre-sized bar, not a width — width is a layout property and
  animating it would reflow the header on every frame; a transform is handled
  by the compositor.

  Decorative and derivable from the scrollbar, so `aria-hidden`.
*/
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      /* The scrollable distance, not the document height. On a page shorter
         than the viewport this is 0, and dividing by it would give NaN and a
         bar stuck at full. */
      const travel = doc.scrollHeight - doc.clientHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, doc.scrollTop / travel)) : 0;
      el.style.transform = `scaleX(${p})`;
    };

    /* Coalesce to one write per frame. A trackpad can fire scroll far faster
       than the display refreshes. */
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] overflow-hidden">
      <div
        ref={ref}
        className="h-full w-full origin-left scale-x-0"
        style={{ backgroundImage: "linear-gradient(90deg, var(--viv-a), var(--viv-b))" }}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export type TocItem = { id: string; text: string };

/**
 * The article's contents, marking the section being read.
 *
 * `rail` is the sticky list in the left column on a wide screen; `inline` is
 * a collapsed disclosure above the body on a narrow one, where there is no
 * column to put it in. The active section is the last heading that has
 * scrolled past the fixed header, so the mark moves as a heading reaches the
 * top rather than when it first appears at the bottom.
 */
export default function ArticleToc({ items, variant }: { items: TocItem[]; variant: "rail" | "inline" }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (variant !== "rail") return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = items[0]?.id ?? "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 140) current = item.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items, variant]);

  if (variant === "inline") {
    return (
      <details className="blog-toc-inline">
        <summary className="focus-ring">
          <span>On this page</span>
          <ChevronDown aria-hidden className="h-4 w-4" />
        </summary>
        <ol>
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.text}</a>
            </li>
          ))}
        </ol>
      </details>
    );
  }

  return (
    <nav aria-label="On this page" className="blog-toc">
      <p className="blog-side-label">On this page</p>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className="focus-ring"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

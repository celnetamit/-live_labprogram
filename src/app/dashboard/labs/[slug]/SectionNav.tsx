"use client";

import { useEffect, useState } from "react";
import { DocGlyph, SECTION_GLYPHS } from "@/components/showcase-icons";

export type Section = { id: string; label: string };

/**
 * In-page navigation with scroll-spy.
 *
 * These pages run several screens deep once the tutorial is unlocked, so
 * "where am I and what else is here" needs answering without scrolling. Two
 * presentations of the same list: a sticky rail beside the content on a wide
 * screen, and a sticky chip strip under the header on a narrow one, where a
 * vertical rail would cost a whole viewport.
 */
export default function SectionNav({
  sections,
  variant,
  appearance = "default",
  lead,
}: {
  sections: Section[];
  variant: "rail" | "strip";
  /** "showcase" draws the rail with an icon per section, in the lab's palette. */
  appearance?: "default" | "showcase";
  /** Rendered above "On this page". The showcase rail uses it for the launch
   *  control, so the first thing in the rail is the way into the lab rather
   *  than a table of contents. */
  lead?: React.ReactNode;
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (nodes.length === 0) return;

    /*
     * The top band only. A section counts as current once its heading reaches
     * the area just under the sticky header — matching what the reader is
     * actually looking at, rather than whichever section happens to occupy the
     * most pixels.
     */
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      /* The sticky stack below `xl` is 119px tall: a section becomes current
         once its heading clears the strip, not before. */
      { rootMargin: "-128px 0px -65% 0px", threshold: 0 },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  if (variant === "strip") {
    return (
      <nav
        aria-label="Sections"
        /* Opaque and tinted like every panel, rather than a neutral grey bar
           pinned across a coloured page. The blur bought nothing: there is
           only a flat background behind it. */
        className="lab-tinted sticky top-16 z-20 -mx-4 mb-4 border-b border-border bg-background px-4 py-2 sm:-mx-6 sm:px-6 xl:hidden"
      >
        <ul className="relative z-10 flex snap-x gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s) => (
            <li key={s.id} className="snap-start">
              <a
                href={`#${s.id}`}
                /* "location" rather than "true": this marks where the
                   reader is within the page, and it is announced as
                   "current location" instead of the bare "current". */
                aria-current={active === s.id ? "location" : undefined}
                className={`focus-ring inline-flex h-9 items-center whitespace-nowrap rounded-full border px-3.5 text-sm transition-colors ${
                  active === s.id
                    ? "border-primary bg-primary font-medium text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  if (appearance === "showcase") {
    return (
      <nav aria-label="Sections" className="sc-toc">
        {lead && <div className="mb-3">{lead}</div>}
        <p className="sc-toc-label">On this page</p>
        <ul>
          {sections.map((s) => {
            /* The designer's own glyphs, keyed by section id. */
            const Icon = SECTION_GLYPHS[s.id] ?? DocGlyph;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "location" : undefined}
                  className="sc-toc-link focus-ring"
                >
                  <Icon />
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Sections">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-0.5">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "location" : undefined}
              className={`focus-ring relative flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                active === s.id
                  ? "bg-primary/10 font-semibold text-[color:var(--color-primary-ink)] before:absolute before:left-0 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

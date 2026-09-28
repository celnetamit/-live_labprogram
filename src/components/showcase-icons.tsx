import type { ReactNode, SVGProps } from "react";

/**
 * The showcase designs' own icons, drawn from the designer's source
 * (`microbeai.html`, `drugdiscovery.html`) path for path rather than
 * approximated from an icon set.
 *
 * Stroke icons take `currentColor`, 1.8px, on a 24px box, as in the source.
 * No hooks and no server-only imports, so both the server-rendered page and
 * the client catalogue card can use them.
 */
function Glyph({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

export const FlaskGlyph = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M9 3h6M10 3v5l-5 8a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 16l-5-8V3" />
    <path d="M8 14h8" />
  </Glyph>
);
export const DnaGlyph = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M8 3c5 3 3 15 8 18M16 3C11 6 13 18 8 21" />
    <path d="M9 7h6M8.5 12h7M9 17h6" />
  </Glyph>
);
export const BarsGlyph = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M4 19V10M10 19V5M16 19v-7M22 19H2" />
  </Glyph>
);
export const CrosshairGlyph = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
  </Glyph>
);
export const BulbGlyph = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M9 18h6M10 21h4" />
    <path d="M8.5 15.5A6 6 0 1 1 15.5 15.5C14.7 16.2 14 17 14 18h-4c0-1-.7-1.8-1.5-2.5Z" />
  </Glyph>
);
export const GraphGlyph = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="5" r="2" />
    <circle cx="19" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
    <path d="M6.5 10.5 10.5 6.5M13.5 6.5l4 4M17.5 13.5l-4 4M10.5 17.5l-4-4" />
  </Glyph>
);

/* Contents rail. */
export const DocGlyph = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M6 3h9l3 3v15H6z" />
    <path d="M14 3v4h4M9 12h6M9 16h6" />
  </Glyph>
);
export const PlayCircleGlyph = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m10 8 6 4-6 4z" />
  </Glyph>
);
export const ListGlyph = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M7 7h13M7 12h13M7 17h13" />
    <circle cx="3" cy="7" r=".7" />
    <circle cx="3" cy="12" r=".7" />
    <circle cx="3" cy="17" r=".7" />
  </Glyph>
);
export const BookGlyph = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M4 5a3 3 0 0 1 3-2h5v18H7a3 3 0 0 0-3 2z" />
    <path d="M20 5a3 3 0 0 0-3-2h-5v18h5a3 3 0 0 1 3 2z" />
  </Glyph>
);
export const TargetGlyph = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
  </Glyph>
);
export const HelpGlyph = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.8 9a2.4 2.4 0 0 1 4.6 1c0 2-2.4 2-2.4 4M12 17h.01" />
  </Glyph>
);

/* Buttons. */
export const ArrowGlyph = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Glyph>
);
export const PlayGlyph = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...p}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

/** Feature-card and catalogue-card icons, by the key a guide names. */
export const SHOWCASE_ICONS = {
  sequence: DnaGlyph,
  analysis: BarsGlyph,
  simulation: CrosshairGlyph,
  insight: BulbGlyph,
  graph: GraphGlyph,
} as const;

/** Contents-rail icons, by section id. */
export const SECTION_GLYPHS: Record<string, (p: IconProps) => ReactNode> = {
  overview: DocGlyph,
  demo: PlayCircleGlyph,
  prepare: ListGlyph,
  tutorial: BookGlyph,
  outcomes: TargetGlyph,
  troubleshooting: HelpGlyph,
};

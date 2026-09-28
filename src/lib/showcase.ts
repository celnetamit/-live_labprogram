import type { CSSProperties } from "react";
import { DM_Sans, Manrope } from "next/font/google";
import type { LabShowcase } from "@/content/labs";

/**
 * Shared by the showcase lab page and the showcase catalogue card, which is a
 * client component — so nothing here may import server-only code.
 */

/*
  The showcase design's two faces: Manrope for the wordmark and panel
  headings, DM Sans for the page's running text. Loaded here rather than in
  the root layout so only a showcase page downloads them; the shell around
  the page keeps Inter.
*/
const display = Manrope({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-sc-display" });
const body = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sc-body" });

/** The two font variables, for any element that uses the showcase faces. */
export const showcaseFontClass = `${display.variable} ${body.variable}`;

/** Classes for the page root of a showcase lab: the fonts and the scope. */
export const showcaseRootClass = `${showcaseFontClass} showcase-scope`;

/**
 * The showcase palette as custom properties, for the page root (or a card).
 *
 * Set once so the hero, the overview's feature cards and the rail all read
 * the same accents without a prop each. `globals.css` resolves each pair to
 * `--sc-*-fg` per theme: the photograph's own colour on dark surfaces, the
 * darkened `ink` partner on light ones. The ground neutrals are `--sc-g-*`,
 * named apart from the card's own theme variables so neither shadows the
 * other.
 */
export function showcaseVars(showcase: Pick<LabShowcase, "palette" | "ground">): CSSProperties {
  const { primary, secondary, action, quiet, cta, level, features } = showcase.palette;
  const g = showcase.ground;
  const vars: Record<string, string> = {
    "--sc-primary": primary.onDark,
    "--sc-primary-ink": primary.ink,
    "--sc-secondary": secondary.onDark,
    "--sc-secondary-ink": secondary.ink,
    "--sc-action": action.onDark,
    "--sc-action-ink": action.ink,
    "--sc-quiet": quiet.onDark,
    "--sc-quiet-ink": quiet.ink,
    "--sc-cta": cta.onDark,
    "--sc-cta-ink": cta.ink,
    "--sc-cta-text": cta.text,
    "--sc-level": level,
    "--sc-g-page": g.page,
    "--sc-g-surface-a": g.surface[0],
    "--sc-g-surface-b": g.surface[1],
    "--sc-g-hero": g.hero,
    "--sc-g-scrim": g.scrim,
    "--sc-g-text": g.text,
    "--sc-g-muted": g.muted,
    "--sc-g-copy": g.copy,
    "--sc-g-soft": g.soft,
  };
  g.scrimStops?.forEach((stop, i) => {
    vars[`--sc-s${i + 1}`] = `${stop}%`;
  });
  features.forEach((f, i) => {
    vars[`--sc-f${i + 1}`] = f.onDark;
    vars[`--sc-f${i + 1}-ink`] = f.ink;
  });
  return vars as CSSProperties;
}

const HEX = /^#[0-9a-f]{3,8}$/i;

/**
 * The hub chrome around a showcase page, in dark mode: the design's ground
 * behind the whole dashboard, its sidebar, and its accent on the active nav.
 *
 * The shell sits outside the page root, so the inline custom properties there
 * never reach it, and a violet nav item and blue-black sidebar beside a page
 * built in the photograph's own colours looked like two products. Hex values
 * only — anything else drops the whole rule, so a typo in a guide cannot
 * inject CSS.
 */
export function showcaseChromeCss(showcase: LabShowcase): string {
  const accent = showcase.palette.primary.onDark;
  const glow = showcase.palette.action.onDark;
  const { page, sidebar, text, muted } = showcase.ground;
  if (![accent, glow, page, sidebar, text, muted].every((c) => HEX.test(c))) return "";
  return (
    `.dark body:has(.showcase-scope){` +
    `--primary:${accent};--primary-foreground:#0b1416;--ring:${accent};` +
    `--sidebar-primary:${accent};--sidebar-ring:${accent};` +
    `--background:${page};--sidebar:${sidebar};--foreground:${text};--sidebar-foreground:${text};--muted-foreground:${muted};` +
    `background:radial-gradient(circle at 84% 10%,color-mix(in srgb,${accent} 7%,transparent),transparent 28%),` +
    `radial-gradient(circle at 18% 0%,color-mix(in srgb,${glow} 5%,transparent),transparent 24%),${page}}`
  );
}

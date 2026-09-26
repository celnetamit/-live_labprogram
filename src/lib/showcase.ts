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
 * The showcase palette as custom properties, for the page root.
 *
 * Set once so the hero, the overview's feature cards and the rail all read
 * the same accents without a prop each. `globals.css` resolves each pair to
 * `--sc-*-fg` per theme: the photograph's own colour on dark surfaces, the
 * darkened `ink` partner on light ones.
 */
export function showcaseVars(showcase: Pick<LabShowcase, "palette">): CSSProperties {
  const { primary, secondary, action, quiet } = showcase.palette;
  return {
    "--sc-primary": primary.onDark,
    "--sc-primary-ink": primary.ink,
    "--sc-secondary": secondary.onDark,
    "--sc-secondary-ink": secondary.ink,
    "--sc-action": action.onDark,
    "--sc-action-ink": action.ink,
    "--sc-action-text": action.text,
    "--sc-quiet": quiet.onDark,
    "--sc-quiet-ink": quiet.ink,
  } as CSSProperties;
}

/**
 * The accent for the hub chrome around a showcase page, in dark mode.
 *
 * The shell's sidebar and header sit outside the page root, so the inline
 * custom properties there never reach them, and a violet active nav item
 * beside a page built in the photograph's blue looked like two products. The
 * neutral ground is in `globals.css`; only the accent varies per lab, so only
 * it is emitted here. Hex values only — anything else is dropped, so a typo
 * in a guide cannot inject CSS.
 */
export function showcaseChromeCss(showcase: LabShowcase): string {
  const accent = showcase.palette.primary.onDark;
  if (!/^#[0-9a-f]{3,8}$/i.test(accent)) return "";
  return `.dark body:has(.showcase-scope){--primary:${accent};--primary-foreground:#0b1416;--ring:${accent};--sidebar-primary:${accent};--sidebar-ring:${accent}}`;
}

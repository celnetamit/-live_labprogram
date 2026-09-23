"use client";

import { MotionConfig } from "framer-motion";

/**
 * Honours the viewer's "reduce motion" system setting for every Framer
 * animation in the app.
 *
 * `globals.css` already neutralises CSS animations and transitions under
 * `prefers-reduced-motion`, but that rule cannot touch Framer: it animates by
 * writing inline transform and opacity values frame by frame, not through CSS
 * transitions, so every scroll-reveal and page-entrance still ran at full
 * amplitude for someone who had asked the OS for less. `reducedMotion="user"`
 * makes Framer skip transform and layout animations for exactly those viewers
 * while leaving opacity — content still appears, it just does not fly.
 *
 * Mounted at the root because `navbar` and `app-shell` between them put Framer
 * on nearly every route already, so this costs no extra bundle on the pages
 * that matter and cannot be forgotten on a new one.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

export const THEME_KEY = "panoptical-theme";

/**
 * Runs before first paint, inlined in the document head.
 *
 * It has to be synchronous and blocking: if the class were applied after
 * hydration the page would paint in the default theme first and then snap to
 * the stored one — the flash every theme switcher is judged by.
 *
 * Dark is the default. The product has always been dark, so an existing
 * visitor with no stored preference sees no change; light is opt-in.
 */
export const themeInitScript = `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_KEY}');
    var dark = stored ? stored === 'dark' : true;
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

/*
 * The theme lives on <html>, which React does not own, so it is read through
 * useSyncExternalStore rather than an effect. That keeps the server render and
 * hydration consistent and picks up a change made in another tab.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): "dark" | "light" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/* Matches the default the init script applies, so hydration lines up. */
function getServerSnapshot(): "dark" | "light" {
  return "dark";
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === "dark";

  const toggle = useCallback(() => {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* Private mode — the choice just will not survive a reload. */
    }
    listeners.forEach((l) => l());
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      {/* Both icons render; only one is visible. Swapping the element on
          toggle would drop focus, and this keeps the button width stable. */}
      <Sun className={`h-4 w-4 ${isDark ? "block" : "hidden"}`} aria-hidden />
      <Moon className={`h-4 w-4 ${isDark ? "hidden" : "block"}`} aria-hidden />
    </button>
  );
}

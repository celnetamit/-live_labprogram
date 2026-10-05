"use client";

import { useEffect } from "react";
import { THEME_KEY } from "./theme-toggle";

/**
 * The Admin Center defaults to dark; the rest of the platform defaults to light.
 *
 * Light became the platform default because the public and learner surfaces are
 * asked to read as an instrument, and the reference set for that is light. The
 * admin is a different room with a different audience: operators working long
 * sessions in a dense table-heavy console, and it was designed and used dark.
 * Changing the platform default quietly changed this too, which was never the
 * intention of that change.
 *
 * A stored preference still wins, in both directions. This only decides what an
 * admin sees before they have expressed a preference, so the toggle in the
 * header keeps full control and keeps persisting the choice — an admin who
 * prefers light gets light, here and everywhere.
 *
 * The class goes on <html> rather than a wrapper on purpose. The theme toggle
 * reads its state from `document.documentElement`, so scoping dark to a div
 * would show a dark console with a toggle insisting it was light.
 */
export const adminThemeInitScript = `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_KEY}');
    if (stored !== 'light') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }
})();
`;

/**
 * Puts the default back when the admin is left.
 *
 * Without this, a client-side navigation out of /admin would carry the dark
 * class with it — the document head script only runs on a full load — and the
 * public site would stay dark for someone who never chose it. Only ever undoes
 * what this component applied: if a preference is stored, it is left alone.
 */
export default function AdminThemeDefault() {
  useEffect(() => {
    return () => {
      try {
        if (localStorage.getItem(THEME_KEY) === null) {
          document.documentElement.classList.remove("dark");
          document.documentElement.style.colorScheme = "light";
        }
      } catch {
        /* Private mode: nothing was stored, so nothing to reconcile. */
      }
    };
  }, []);

  return null;
}

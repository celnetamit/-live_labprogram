"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` only after it has stopped changing for `delayMs`.
 *
 * The header search fires a database query per keystroke without this. Typing
 * "fraudshield" is twelve requests, of which eleven describe a prefix the user
 * never meant to search for — and because they race, the reply for "fr" can land
 * after the reply for "fraud" and overwrite a correct suggestion list with a
 * stale one.
 *
 * Debouncing collapses that burst into a single request for the term the user
 * actually paused on. It is deliberately *not* a throttle: a throttle would still
 * fire mid-word at a fixed rate, whereas here nothing should be searched until
 * typing settles.
 */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);
    // Clearing on every change is what makes this a debounce rather than a
    // delay: each new keystroke cancels the pending update and restarts the
    // clock, so only the final pause survives.
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return settled;
}

export default useDebouncedValue;

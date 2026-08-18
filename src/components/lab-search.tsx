"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, CornerDownLeft } from "lucide-react";
import useDebouncedValue from "@/hooks/useDebouncedValue";

/**
 * Header search with debounced typeahead.
 *
 * The header previously took a term and did nothing with it until Enter, which
 * meant a visitor had to know a lab's name before the search was any use. Now a
 * shortlist appears as soon as typing settles, and Enter still falls through to
 * the full catalogue — the dropdown is a shortcut, never the only way through.
 *
 * Shared by the desktop bar and the mobile menu so the two cannot drift; the only
 * difference between them is layout, passed in as `variant`.
 */

export interface LabSuggestion {
  id: string;
  slug: string;
  name: string;
  subject: string;
  difficulty: string;
  status: string;
}

/** Suggestions start at one character, matching the endpoint's own floor. */
const MIN_CHARS = 1;
/**
 * Long enough to collapse a burst of typing into one request, short enough that
 * the list feels attached to the keyboard. At 250ms an average typist gets one
 * request per word rather than one per letter.
 */
const DEBOUNCE_MS = 250;

export default function LabSearch({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const listId = useId();

  const [term, setTerm] = useState("");
  /**
   * Results together with the query they belong to.
   *
   * Storing the two as one value is what lets "is a search in flight" be derived
   * rather than tracked: if `answered` is not the term we are debouncing toward,
   * a reply is still outstanding. A separate `loading` flag would have to be set
   * synchronously inside the effect, which triggers a cascading render — the
   * lint rule that caught this is right, and deriving is the better fix than
   * silencing it.
   */
  const [answered, setAnswered] = useState<{ query: string; results: LabSuggestion[] }>({
    query: "",
    results: [],
  });
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const debounced = useDebouncedValue(term, DEBOUNCE_MS);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = debounced.trim();
  const shouldSearch = trimmed.length >= MIN_CHARS;

  // Previous results stay on screen while the next reply is in flight, so the
  // list does not blank out between keystrokes.
  const results = shouldSearch ? answered.results : [];
  const loading = shouldSearch && answered.query !== trimmed;

  useEffect(() => {
    if (!shouldSearch) return;

    const controller = new AbortController();
    // React runs the previous cleanup before this effect, so an earlier reply is
    // both aborted and flagged — a slow response for "fr" can no longer land
    // after "fraud" and overwrite it.
    let cancelled = false;

    fetch(`/api/labs/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { results: [] }))
      .then((data: { results?: LabSuggestion[] }) => {
        if (cancelled) return;
        setAnswered({ query: trimmed, results: Array.isArray(data.results) ? data.results : [] });
        setHighlighted(-1);
      })
      .catch(() => {
        // AbortError on unmount or a superseded request is expected; a real
        // failure degrades to "no suggestions" rather than breaking the header.
        if (!cancelled) setAnswered({ query: trimmed, results: [] });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [trimmed, shouldSearch]);

  // Close on an outside click. Without this the dropdown survives a click on the
  // page behind it and covers the content the user was reaching for.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const goToCatalogue = () => {
    const q = term.trim();
    router.push(q ? `/labs?q=${encodeURIComponent(q)}` : "/labs");
    setOpen(false);
    onNavigate?.();
  };

  const goToLab = (lab: LabSuggestion) => {
    router.push(`/dashboard/labs/${lab.slug}`);
    setOpen(false);
    setTerm("");
    onNavigate?.();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === "Enter" && highlighted >= 0) {
      // Only intercept Enter when a suggestion is actually highlighted, so the
      // default behaviour — submit to the catalogue — stays reachable.
      event.preventDefault();
      goToLab(results[highlighted]!);
    }
  };

  const showDropdown = open && shouldSearch;
  const emptyAfterSearch = useMemo(
    () => shouldSearch && !loading && results.length === 0,
    [shouldSearch, loading, results.length],
  );

  const isMobile = variant === "mobile";

  return (
    <div ref={containerRef} className={`relative ${isMobile ? "w-full" : "w-full"}`}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          goToCatalogue();
        }}
        role="search"
      >
        <label htmlFor={`lab-search-${variant}`} className="sr-only">
          Search labs
        </label>
        <div
          className={`flex w-full items-center border border-border bg-muted/60 px-3 transition-colors focus-within:border-primary/40 focus-within:bg-background focus-within:ring-2 focus-within:ring-ring ${
            isMobile ? "rounded-xl" : "rounded-full"
          }`}
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            id={`lab-search-${variant}`}
            type="search"
            value={term}
            onChange={(event) => {
              setTerm(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search labs"
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              highlighted >= 0 ? `${listId}-option-${highlighted}` : undefined
            }
            className={`w-full bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/70 [&::-webkit-search-cancel-button]:hidden ${
              isMobile ? "h-11" : "h-9"
            }`}
          />
          {loading && (
            <Loader2
              className="h-4 w-4 shrink-0 animate-spin text-muted-foreground"
              aria-hidden
            />
          )}
        </div>
      </form>

      {showDropdown && (
        <div
          // Only the option list scrolls. Putting the overflow on the panel
          // pushed the "See all results" row below the fold, so the one control
          // that guarantees the dropdown is never a dead end became unreachable
          // without scrolling to it.
          className="absolute left-0 right-0 z-50 mt-2 flex flex-col overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
        >
          {/*
            The live region announces result counts to screen readers, which
            otherwise get no signal that the list under the box has changed.
          */}
          <p className="sr-only" role="status" aria-live="polite">
            {loading
              ? "Searching labs"
              : `${results.length} ${results.length === 1 ? "suggestion" : "suggestions"}`}
          </p>

          {results.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              aria-label="Lab suggestions"
              className="max-h-[18rem] overflow-y-auto py-1"
            >
              {results.map((lab, index) => (
                <li key={lab.id} role="none">
                  <button
                    type="button"
                    id={`${listId}-option-${index}`}
                    role="option"
                    aria-selected={index === highlighted}
                    onMouseEnter={() => setHighlighted(index)}
                    onClick={() => goToLab(lab)}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors ${
                      index === highlighted ? "bg-accent" : "hover:bg-accent/60"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {lab.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {[lab.subject, lab.difficulty].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    {lab.status !== "ACTIVE" && (
                      <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                        {lab.status === "UPCOMING" ? "Soon" : "Down"}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {emptyAfterSearch && (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              No labs match “{trimmed}”.
            </p>
          )}

          {/* Always reachable, so the dropdown never becomes a dead end. */}
          <button
            type="button"
            onClick={goToCatalogue}
            className="flex w-full shrink-0 items-center justify-between gap-2 border-t border-border bg-popover px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <span>
              See all results{trimmed ? <> for “{trimmed}”</> : null}
            </span>
            <CornerDownLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

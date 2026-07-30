"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { Check, Eye, Lightbulb, ListChecks, Lock, RotateCcw } from "lucide-react";
import type { LabGuide } from "@/content/labs";
import { RichText } from "@/components/rich-text";

/*
 * localStorage is an external store, so it is read through
 * `useSyncExternalStore` rather than an effect: that keeps the server render
 * consistent with hydration, and picks up writes from another tab for free.
 */
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // Private mode, or storage disabled entirely.
  }
}

function parseDone(raw: string | null): Set<number> {
  if (!raw) return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? new Set(parsed.filter((n): n is number => typeof n === "number"))
      : new Set();
  } catch {
    return new Set(); // Corrupt value is not worth failing the page over.
  }
}

/**
 * The step-by-step tutorial, with per-step completion.
 *
 * A tutorial is longer than one sitting, so progress is kept in localStorage
 * per lab and a learner can close the tab and come back to where they were.
 * There is no server-side progress model to hang it on, and inventing one is
 * out of scope for a content page.
 *
 * When `locked`, step titles and goals still render, but the actions, expected
 * results and explanations are not emitted at all. Gating by omission rather
 * than by CSS: content that ships to the browser is not gated.
 */
export default function TutorialSteps({ guide, locked }: { guide: LabGuide; locked: boolean }) {
  const storageKey = `lab-progress:${guide.slug}`;

  const getSnapshot = useCallback(() => readRaw(storageKey), [storageKey]);
  /* The server has no storage, so it renders the empty state and hydration
     matches; the real value arrives on the first client render. */
  const getServerSnapshot = useCallback(() => null, []);
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const done = useMemo(() => parseDone(raw), [raw]);

  const persist = useCallback(
    (next: Set<number>) => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        /* Private mode or a full quota — nothing to do but carry on. */
      }
      notify();
    },
    [storageKey],
  );

  /*
   * Reads the store at click time rather than closing over the rendered value.
   * Two toggles inside one frame would otherwise both start from the same
   * snapshot and the second would discard the first.
   */
  const toggle = useCallback(
    (index: number) => {
      const next = parseDone(readRaw(storageKey));
      if (next.has(index)) next.delete(index);
      else next.add(index);
      persist(next);
    },
    [storageKey, persist],
  );

  const completed = done.size;
  const pct = guide.steps.length ? Math.round((completed / guide.steps.length) * 100) : 0;

  return (
    <section
      id="tutorial"
      className="scroll-mt-24 glass rounded-2xl p-5 sm:p-6"
      aria-labelledby="tutorial-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h2
          id="tutorial-heading"
          className="text-base sm:text-lg font-semibold flex items-center gap-2"
        >
          <ListChecks className="w-5 h-5 text-primary shrink-0" /> Step-by-step tutorial
        </h2>
        <span className="text-xs text-muted-foreground">
          {guide.steps.length} steps
        </span>
      </div>

      <p className="mt-1.5 text-sm text-muted-foreground">
        {locked
          ? "Every step gives the exact controls to use, the result you should see, and why the lab behaves that way."
          : "Work through these in order — later steps build on earlier ones. Each step tells you what you should see, so you can check you are on track before moving on."}
      </p>

      {/* Progress. Renders empty on the server and fills in on the first client
          render — one frame, and hydration stays consistent. */}
      {!locked && (
        <div className="mt-4 rounded-xl border border-border bg-background/40 p-3.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">
              {completed === guide.steps.length && guide.steps.length > 0 ? (
                <span className="text-[color:var(--color-success)]">Tutorial complete</span>
              ) : (
                <>
                  {completed} of {guide.steps.length} steps done
                </>
              )}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tutorial progress"
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary"
          >
            <div
              className="h-full rounded-full btn-brand transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {completed > 0 && (
            <button
              type="button"
              onClick={() => persist(new Set())}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset progress
            </button>
          )}
        </div>
      )}

      <ol className="mt-5 space-y-3">
        {guide.steps.map((step, index) => {
          const isDone = !locked && done.has(index);
          return (
            <li
              key={step.title}
              className={`relative rounded-xl border p-4 transition-colors sm:p-5 ${
                isDone
                  ? "border-[color:color-mix(in_oklch,var(--color-success)_35%,transparent)] bg-[color:color-mix(in_oklch,var(--color-success)_7%,transparent)]"
                  : "border-border bg-background/40"
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* The number doubles as the completion control, so there is one
                    obvious target rather than a number plus a stray checkbox. */}
                {locked ? (
                  <span
                    aria-hidden
                    className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 text-sm font-semibold text-primary"
                  >
                    {index + 1}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-pressed={isDone}
                    aria-label={
                      isDone
                        ? `Mark step ${index + 1} as not done`
                        : `Mark step ${index + 1} as done`
                    }
                    className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isDone
                        ? "border-transparent bg-[color:var(--color-success)] text-white"
                        : "border-primary/40 bg-primary/10 text-primary hover:border-primary hover:bg-primary/20"
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
                  </button>
                )}

                <div className="min-w-0 flex-1">
                  <h3
                    className={`font-semibold leading-snug ${isDone ? "text-muted-foreground line-through decoration-1" : ""}`}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    <RichText>{step.goal}</RichText>
                  </p>

                  {locked ? (
                    <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                      <Lock className="h-3.5 w-3.5 shrink-0" />
                      Instructions, expected result and explanation unlock with the lab
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <ol className="space-y-2">
                        {step.actions.map((action, actionIndex) => (
                          <li key={action} className="flex gap-3 text-sm">
                            <span className="mt-px font-mono text-[11px] tabular-nums text-primary">
                              {index + 1}.{actionIndex + 1}
                            </span>
                            <span className="leading-relaxed text-muted-foreground">
                              <RichText>{action}</RichText>
                            </span>
                          </li>
                        ))}
                      </ol>

                      <div className="rounded-lg border border-[color:color-mix(in_oklch,var(--color-success)_30%,transparent)] bg-[color:color-mix(in_oklch,var(--color-success)_8%,transparent)] px-3 py-2.5">
                        <p className="flex gap-2 text-sm">
                          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-success)]" />
                          <span className="leading-relaxed text-muted-foreground">
                            <span className="font-semibold text-[color:var(--color-success)]">
                              You should see:{" "}
                            </span>
                            <RichText>{step.expect}</RichText>
                          </span>
                        </p>
                      </div>

                      {step.why && (
                        <div className="rounded-lg border border-[color:color-mix(in_oklch,var(--color-warning)_28%,transparent)] bg-[color:color-mix(in_oklch,var(--color-warning)_7%,transparent)] px-3 py-2.5">
                          <p className="flex gap-2 text-sm">
                            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-warning)]" />
                            <span className="leading-relaxed text-muted-foreground">
                              <span className="font-semibold text-[color:var(--color-warning)]">
                                Why:{" "}
                              </span>
                              <RichText>{step.why}</RichText>
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

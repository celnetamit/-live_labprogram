"use client";

import { useMemo, useState } from "react";

/*
  The decision-threshold trade-off, on real numbers.

  The counts below are not illustrative. They are derived from the calibration
  curve in the predictive-maintenance model that SmartFactory AI actually
  ships — `ml/modelCard.ts`, `risk.calibration.curve` — which records, for
  85,087 held-out test windows, how many fell in each predicted-risk bin and
  what fraction of those were genuinely about to fail.

  For a threshold t:
      flagged = the windows in bins above t
      missed  = the 1,577 true positives, less those captured above t

  Scores inside a bin are assumed uniform, which is the one approximation
  here. It is checkable, because the same model card states a full operating
  point independently:

      modelCard.risk.atThreshold = { threshold: 0.18, tp: 1368, fp: 719, fn: 209 }

  That is 2,087 flagged and 209 missed. Interpolating this table at 0.18 gives
  2,098 and 207 — 0.5% and 1.0% out. The slider therefore stops at 0.10 rather
  than 0: 82,488 of the 85,087 windows sit in the lowest bin, so below that
  edge the uniform assumption stops being a rounding error and starts being
  fiction.
*/

/** [binLow, binHigh, windows, observed failure rate] — modelCard.risk.calibration.curve */
const BINS: readonly (readonly [number, number, number, number])[] = [
  [0.0, 0.08333333, 82488, 0.0014911259819610125],
  [0.08333333, 0.16666667, 458, 0.15502183406113537],
  [0.16666667, 0.25, 270, 0.3],
  [0.25, 0.33333333, 197, 0.3604060913705584],
  [0.33333333, 0.41666667, 169, 0.39644970414201186],
  [0.41666667, 0.5, 156, 0.5705128205128205],
  [0.5, 0.58333333, 156, 0.6089743589743589],
  [0.58333333, 0.66666667, 152, 0.5921052631578947],
  [0.66666667, 0.75, 137, 0.708029197080292],
  [0.75, 0.83333333, 160, 0.73125],
  [0.83333333, 0.91666667, 220, 0.8272727272727273],
  [0.91666667, 1.0, 524, 0.9427480916030534],
];

const TOTAL_POSITIVES = BINS.reduce((a, b) => a + b[2] * b[3], 0); // 1577
/** The threshold this model is actually deployed at, per the model card. */
const OPERATING = 0.18;
const MIN = 0.1;
const MAX = 0.9;

function evaluate(t: number) {
  let flagged = 0, caught = 0;
  for (const [lo, hi, count, rate] of BINS) {
    if (hi <= t) continue;
    const frac = t <= lo ? 1 : (hi - t) / (hi - lo);
    flagged += count * frac;
    caught += count * frac * rate;
  }
  return { flagged: Math.round(flagged), missed: Math.round(TOTAL_POSITIVES - caught) };
}

export default function ThresholdExample() {
  const [t, setT] = useState(OPERATING);
  const { flagged, missed } = useMemo(() => evaluate(t), [t]);

  const explanation =
    t < OPERATING - 0.02
      ? "A lower threshold flags more cases, increasing review work and reducing the chance of missed cases."
      : t > OPERATING + 0.02
        ? "A higher threshold flags fewer cases, but more relevant cases may be missed."
        : "At this setting, the model sends a moderate number of cases for human review.";

  return (
    <figure className="m-0">
      <div className="overflow-hidden rounded-2xl border border-border bg-card elev-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border px-5 py-4 sm:px-7">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-ink">
            Worked example
          </span>
          <span className="shrink-0 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            Adjust the value
          </span>
        </div>

        <div className="px-5 py-6 sm:px-7">
          <h3 className="text-xl font-semibold tracking-tight">Change the decision threshold</h3>
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
            Move the threshold and observe how the balance between flagged cases and missed
            cases changes.
          </p>

          <div className="mt-7">
            <label htmlFor="threshold" className="sr-only">
              Decision threshold
            </label>
            <input
              id="threshold"
              type="range"
              min={MIN}
              max={MAX}
              step={0.01}
              value={t}
              onChange={(e) => setT(Number(e.target.value))}
              aria-valuetext={`Threshold ${t.toFixed(2)}. ${flagged.toLocaleString()} cases flagged for review, ${missed.toLocaleString()} missed.`}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[color:var(--primary)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--card)]"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>More sensitive</span>
              <span className="tabular-nums">{t.toFixed(2)}</span>
              <span>More selective</span>
            </div>
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
            <div className="bg-card px-5 py-4">
              <dt className="text-xs text-muted-foreground">Cases flagged for review</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums tracking-[-0.03em]">
                {flagged.toLocaleString()}
              </dd>
            </div>
            <div className="bg-card px-5 py-4">
              <dt className="text-xs text-muted-foreground">Genuine cases missed</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums tracking-[-0.03em]">
                {missed.toLocaleString()}
              </dd>
            </div>
          </dl>

          {/* aria-live so a screen-reader user hears the consequence of the
              move, which is the entire point of the control. */}
          <p aria-live="polite" className="mt-4 min-h-[2.75rem] max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
            {explanation}
          </p>
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        Counts derived from the calibration curve of the predictive-maintenance model shipped in
        SmartFactory AI, over 85,087 held-out test windows containing 1,577 genuine events.
        Interpolating this table at the model&rsquo;s deployed threshold of 0.18 reproduces its
        stated operating point to within 1%.
      </figcaption>
    </figure>
  );
}

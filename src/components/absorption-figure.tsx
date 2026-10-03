"use client";

/*
  The hero figure: a real absorption spectrum, not an illustration of one.

  Every point on this curve was computed by the Acoustic Metamaterials lab's
  own solver — `physics/solver.ts` in that repository, the JCA equivalent-fluid
  model through a transfer-matrix stack — for the design named in the caption.
  It was produced by running:

    npx tsx emit.ts   // solve({ latticeType:'Gyroid', cellSizeMm:3,
                      //          porosity:0.6, coreThicknessMm:80,
                      //          airGapMm:20, material:'PLA' },
                      //       { resolution: 4 })

  93 points, 50 Hz to 10 kHz, normal incidence. The summary figures below the
  chart are that run's own `summary` object. If the solver changes, re-run it
  and paste the new path — do not nudge the curve by hand.
*/
export default function AbsorptionFigure() {
  return (
    <figure className="m-0">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 elev-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-1">
          <h3 className="text-sm font-semibold tracking-tight">Sound absorption of a gyroid lattice</h3>
          <span className="shrink-0 text-[11px] text-muted-foreground">normal incidence</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          3 mm cell · 60% porosity · 80 mm core · 20 mm air gap · PLA
        </p>

        <svg viewBox="0 0 560 260" className="w-full h-auto" role="img"
             aria-label="Absorption coefficient against frequency, rising from near zero at 50 hertz to a peak of 0.985 at 5.3 kilohertz.">
          <defs>
            <linearGradient id="absFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

        <g>
          <line x1={44} y1={230} x2={546} y2={230} stroke="var(--border)" strokeWidth="1" />
          <text x={36} y={233} textAnchor="end" className="fill-[color:var(--muted-foreground)] text-[10px]">0</text>
        </g>
        <g>
          <line x1={44} y1={123.0} x2={546} y2={123.0} stroke="var(--border)" strokeWidth="1" />
          <text x={36} y={126.0} textAnchor="end" className="fill-[color:var(--muted-foreground)] text-[10px]">0.5</text>
        </g>
        <g>
          <line x1={44} y1={16} x2={546} y2={16} stroke="var(--border)" strokeWidth="1" />
          <text x={36} y={19} textAnchor="end" className="fill-[color:var(--muted-foreground)] text-[10px]">1.0</text>
        </g>
        <g>
          <line x1={109.7} y1={16} x2={109.7} y2={230} stroke="var(--border)" strokeWidth="1" />
          <text x={109.7} y={246} textAnchor="middle" className="fill-[color:var(--muted-foreground)] text-[10px]">100 Hz</text>
        </g>
        <g>
          <line x1={327.8} y1={16} x2={327.8} y2={230} stroke="var(--border)" strokeWidth="1" />
          <text x={327.8} y={246} textAnchor="middle" className="fill-[color:var(--muted-foreground)] text-[10px]">1k Hz</text>
        </g>
        <g>
          <line x1={546.0} y1={16} x2={546.0} y2={230} stroke="var(--border)" strokeWidth="1" />
          <text x={546.0} y={246} textAnchor="middle" className="fill-[color:var(--muted-foreground)] text-[10px]">10k Hz</text>
        </g>
          <path d="M44.0 223.3 L49.5 222.8 L54.9 222.3 L60.5 221.8 L65.9 221.3 L71.6 220.8 L77.2 220.2 L82.9 219.6 L88.5 219.0 L93.8 218.4 L99.1 217.8 L104.4 217.2 L109.7 216.6 L114.9 215.9 L120.2 215.1 L125.5 214.4 L130.8 213.5 L136.7 212.5 L142.5 211.4 L148.3 210.2 L154.2 208.9 L159.5 207.5 L164.8 206.0 L170.0 204.3 L175.3 202.4 L180.6 200.3 L185.9 197.9 L191.2 195.2 L196.5 192.1 L202.0 188.4 L207.4 184.2 L212.9 179.4 L218.4 173.8 L224.0 167.1 L229.7 159.4 L235.4 150.4 L241.0 140.2 L246.3 129.6 L251.6 117.8 L256.9 105.3 L262.2 92.5 L267.6 79.7 L273.1 68.4 L278.6 59.9 L284.1 55.2 L289.7 55.1 L295.4 59.6 L301.0 67.9 L306.7 78.8 L312.0 90.1 L317.3 101.5 L322.5 112.4 L327.8 122.2 L333.1 130.7 L338.4 137.6 L343.7 142.9 L349.0 146.3 L354.8 147.5 L360.7 145.4 L366.5 139.0 L372.4 126.6 L377.7 108.8 L382.9 84.2 L388.2 56.4 L393.5 36.2 L398.8 36.1 L404.1 55.7 L409.4 82.1 L414.7 105.0 L420.1 120.9 L425.6 127.8 L431.1 124.3 L436.5 107.3 L442.2 71.7 L447.9 30.9 L453.5 31.7 L459.2 71.8 L464.5 102.9 L469.8 114.0 L475.0 101.3 L480.3 58.8 L485.8 19.2 L491.3 57.3 L496.7 98.8 L502.2 96.3 L507.9 37.8 L513.5 38.1 L519.2 94.3 L524.9 58.1 L530.1 31.0 L535.4 88.3 L540.7 31.2 L546.0 55.6 L546.0 230.0 L44.0 230.0 Z" fill="url(#absFill)" />
          <path d="M44.0 223.3 L49.5 222.8 L54.9 222.3 L60.5 221.8 L65.9 221.3 L71.6 220.8 L77.2 220.2 L82.9 219.6 L88.5 219.0 L93.8 218.4 L99.1 217.8 L104.4 217.2 L109.7 216.6 L114.9 215.9 L120.2 215.1 L125.5 214.4 L130.8 213.5 L136.7 212.5 L142.5 211.4 L148.3 210.2 L154.2 208.9 L159.5 207.5 L164.8 206.0 L170.0 204.3 L175.3 202.4 L180.6 200.3 L185.9 197.9 L191.2 195.2 L196.5 192.1 L202.0 188.4 L207.4 184.2 L212.9 179.4 L218.4 173.8 L224.0 167.1 L229.7 159.4 L235.4 150.4 L241.0 140.2 L246.3 129.6 L251.6 117.8 L256.9 105.3 L262.2 92.5 L267.6 79.7 L273.1 68.4 L278.6 59.9 L284.1 55.2 L289.7 55.1 L295.4 59.6 L301.0 67.9 L306.7 78.8 L312.0 90.1 L317.3 101.5 L322.5 112.4 L327.8 122.2 L333.1 130.7 L338.4 137.6 L343.7 142.9 L349.0 146.3 L354.8 147.5 L360.7 145.4 L366.5 139.0 L372.4 126.6 L377.7 108.8 L382.9 84.2 L388.2 56.4 L393.5 36.2 L398.8 36.1 L404.1 55.7 L409.4 82.1 L414.7 105.0 L420.1 120.9 L425.6 127.8 L431.1 124.3 L436.5 107.3 L442.2 71.7 L447.9 30.9 L453.5 31.7 L459.2 71.8 L464.5 102.9 L469.8 114.0 L475.0 101.3 L480.3 58.8 L485.8 19.2 L491.3 57.3 L496.7 98.8 L502.2 96.3 L507.9 37.8 L513.5 38.1 L519.2 94.3 L524.9 58.1 L530.1 31.0 L535.4 88.3 L540.7 31.2 L546.0 55.6" fill="none" stroke="var(--primary)" strokeWidth="2"
                strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={485.9} cy={19.2} r="3.5" fill="var(--primary)" />
          <text x={477.9} y={33.2} textAnchor="end"
                className="fill-[color:var(--foreground)] text-[10px] font-semibold">
            α 0.985 at 5300 Hz
          </text>
          <text x={10} y={20} className="fill-[color:var(--muted-foreground)] text-[10px]">α</text>
        </svg>

        <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
          {[
            { k: "NRC", v: "0.55" },
            { k: "SAA", v: "0.5" },
            { k: "Total depth", v: "100 mm" },
          ].map((f) => (
            <div key={f.k} className="bg-card px-3 py-2.5">
              <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{f.k}</dt>
              <dd className="text-sm font-semibold tabular-nums">{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        Computed by the Acoustic Metamaterials lab&apos;s solver, not drawn. Change the lattice
        in the lab and this curve moves.
      </figcaption>
    </figure>
  );
}

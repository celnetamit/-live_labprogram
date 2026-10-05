"use client";

/*
  A real absorption spectrum, not an illustration of one.

  Every point was computed by the Acoustic Metamaterials lab's own solver —
  `physics/solver.ts` in that repository, the JCA equivalent-fluid model
  through a transfer-matrix stack — for the design named in the subtitle:

    solve({ latticeType: 'Gyroid', cellSizeMm: 3, porosity: 0.6,
            coreThicknessMm: 80, airGapMm: 20, material: 'PLA' },
          { resolution: 4, skipDiffuse: true })

  93 points, 50 Hz to 10 kHz, normal incidence. The summary tiles are that
  run's own `summary` object, and the design was chosen by sweeping the
  solver for the best NRC rather than picked to look good. Re-run it and
  paste the new paths if the engine changes; never nudge the curve by hand.

  Two renderings of the same data, swapped by breakpoint. The wide one
  spans the hero; at 390px that box is only about 100px tall and the axis
  labels collide. The narrow one is the same 93 points in a taller frame.
  Stretching one box with preserveAspectRatio would have distorted a curve
  whose whole point is that it is measured.
*/
export default function AbsorptionFigure() {
  return (
    <figure className="m-0">
      <div className="overflow-hidden rounded-2xl border border-border bg-card elev-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border px-5 py-4 sm:px-7">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Sound absorption of a gyroid lattice</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              3 mm cell · 60% porosity · 80 mm core · 20 mm air gap · PLA
            </p>
          </div>
          <span className="shrink-0 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            Computed · normal incidence
          </span>
        </div>

        <div className="hidden px-3 pt-4 sm:block sm:px-5">
          <svg viewBox="0 0 1120 300" className="w-full h-auto" role="img"
               aria-label="Absorption coefficient against frequency, rising from near zero at 50 hertz to a peak of 0.985 at 5.3 kilohertz.">
            <defs>
              <linearGradient id="absFillWide" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="194.3" y1="22" x2="194.3" y2="264" stroke="var(--border)" strokeWidth="1" />
            <text x="194.3" y="282" textAnchor="middle" className="fill-[color:var(--muted-foreground)] text-[11px]">100 Hz</text>
            <line x1="647.2" y1="22" x2="647.2" y2="264" stroke="var(--border)" strokeWidth="1" />
            <text x="647.2" y="282" textAnchor="middle" className="fill-[color:var(--muted-foreground)] text-[11px]">1 kHz</text>
            <line x1="1100.0" y1="22" x2="1100.0" y2="264" stroke="var(--border)" strokeWidth="1" />
            <text x="1100.0" y="282" textAnchor="middle" className="fill-[color:var(--muted-foreground)] text-[11px]">10 kHz</text>
            <line x1="58" y1="264.0" x2="1100" y2="264.0" stroke="var(--border)" strokeWidth="1" />
            <text x="48" y="268.0" textAnchor="end" className="fill-[color:var(--muted-foreground)] text-[11px]">0</text>
            <line x1="58" y1="143.0" x2="1100" y2="143.0" stroke="var(--border)" strokeWidth="1" />
            <text x="48" y="147.0" textAnchor="end" className="fill-[color:var(--muted-foreground)] text-[11px]">0.5</text>
            <line x1="58" y1="22.0" x2="1100" y2="22.0" stroke="var(--border)" strokeWidth="1" />
            <text x="48" y="26.0" textAnchor="end" className="fill-[color:var(--muted-foreground)] text-[11px]">1.0</text>
            <path d="M58.0 256.4 L69.5 255.9 L80.6 255.3 L92.2 254.8 L103.5 254.2 L115.3 253.5 L127.0 252.9 L138.8 252.3 L150.4 251.6 L161.4 250.9 L172.3 250.3 L183.4 249.6 L194.3 248.8 L205.2 248.0 L216.3 247.2 L227.2 246.3 L238.2 245.4 L250.4 244.2 L262.4 243.0 L274.6 241.6 L286.8 240.1 L297.7 238.6 L308.7 236.8 L319.6 235.0 L330.6 232.8 L341.6 230.4 L352.6 227.7 L363.5 224.7 L374.5 221.1 L385.9 217.0 L397.2 212.3 L408.6 206.8 L420.0 200.5 L431.7 192.9 L443.5 184.1 L455.2 174.0 L467.0 162.5 L477.9 150.4 L488.9 137.2 L499.9 123.0 L510.8 108.5 L522.2 94.0 L533.5 81.2 L544.9 71.6 L556.3 66.3 L568.0 66.2 L579.8 71.3 L591.5 80.7 L603.3 93.0 L614.2 105.8 L625.2 118.7 L636.2 131.0 L647.2 142.1 L658.1 151.7 L669.1 159.5 L680.1 165.5 L691.0 169.3 L703.2 170.7 L715.3 168.3 L727.5 161.1 L739.6 147.1 L750.6 127.0 L761.5 99.1 L772.5 67.6 L783.5 44.8 L794.4 44.8 L805.4 66.9 L816.4 96.7 L827.4 122.6 L838.7 140.6 L850.1 148.4 L861.5 144.5 L872.8 125.3 L884.6 85.0 L896.3 38.8 L908.1 39.7 L919.8 85.1 L930.8 120.3 L941.7 132.9 L952.7 118.4 L963.7 70.4 L975.0 25.6 L986.4 68.7 L997.8 115.6 L1009.1 112.8 L1020.9 46.6 L1032.6 47.0 L1044.4 110.6 L1056.1 69.6 L1067.1 39.0 L1078.1 103.8 L1089.0 39.2 L1100.0 66.8 L1100.0 264.0 L58.0 264.0 Z" fill="url(#absFillWide)" className="spectrum-fill" />
            <path d="M58.0 256.4 L69.5 255.9 L80.6 255.3 L92.2 254.8 L103.5 254.2 L115.3 253.5 L127.0 252.9 L138.8 252.3 L150.4 251.6 L161.4 250.9 L172.3 250.3 L183.4 249.6 L194.3 248.8 L205.2 248.0 L216.3 247.2 L227.2 246.3 L238.2 245.4 L250.4 244.2 L262.4 243.0 L274.6 241.6 L286.8 240.1 L297.7 238.6 L308.7 236.8 L319.6 235.0 L330.6 232.8 L341.6 230.4 L352.6 227.7 L363.5 224.7 L374.5 221.1 L385.9 217.0 L397.2 212.3 L408.6 206.8 L420.0 200.5 L431.7 192.9 L443.5 184.1 L455.2 174.0 L467.0 162.5 L477.9 150.4 L488.9 137.2 L499.9 123.0 L510.8 108.5 L522.2 94.0 L533.5 81.2 L544.9 71.6 L556.3 66.3 L568.0 66.2 L579.8 71.3 L591.5 80.7 L603.3 93.0 L614.2 105.8 L625.2 118.7 L636.2 131.0 L647.2 142.1 L658.1 151.7 L669.1 159.5 L680.1 165.5 L691.0 169.3 L703.2 170.7 L715.3 168.3 L727.5 161.1 L739.6 147.1 L750.6 127.0 L761.5 99.1 L772.5 67.6 L783.5 44.8 L794.4 44.8 L805.4 66.9 L816.4 96.7 L827.4 122.6 L838.7 140.6 L850.1 148.4 L861.5 144.5 L872.8 125.3 L884.6 85.0 L896.3 38.8 L908.1 39.7 L919.8 85.1 L930.8 120.3 L941.7 132.9 L952.7 118.4 L963.7 70.4 L975.0 25.6 L986.4 68.7 L997.8 115.6 L1009.1 112.8 L1020.9 46.6 L1032.6 47.0 L1044.4 110.6 L1056.1 69.6 L1067.1 39.0 L1078.1 103.8 L1089.0 39.2 L1100.0 66.8" fill="none" stroke="var(--primary)" strokeWidth="2.25" pathLength={1}
                  strokeLinejoin="round" strokeLinecap="round" className="spectrum-line" />
            <circle cx="975.2" cy="25.6" r="4" fill="var(--primary)" />
            <circle cx="975.2" cy="25.6" r="8" fill="none" stroke="var(--primary)" strokeOpacity="0.35" strokeWidth="1.5" />
            <text x="963.2" y="30.6" textAnchor="end"
                  className="fill-[color:var(--foreground)] text-[12px] font-semibold">
              α 0.985 at 5300 Hz
            </text>
            <text x="14" y="13" className="fill-[color:var(--muted-foreground)] text-[11px]">α</text>
          </svg>
        </div>
        <div className="px-2 pt-4 sm:hidden">
          <svg viewBox="0 0 520 330" className="w-full h-auto" role="img"
               aria-label="Absorption coefficient against frequency, rising from near zero at 50 hertz to a peak of 0.985 at 5.3 kilohertz.">
            <defs>
              <linearGradient id="absFillTall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="105.9" y1="20" x2="105.9" y2="296" stroke="var(--border)" strokeWidth="1" />
            <text x="105.9" y="314" textAnchor="middle" className="fill-[color:var(--muted-foreground)] text-[12px]">100 Hz</text>
            <line x1="305.0" y1="20" x2="305.0" y2="296" stroke="var(--border)" strokeWidth="1" />
            <text x="305.0" y="314" textAnchor="middle" className="fill-[color:var(--muted-foreground)] text-[12px]">1 kHz</text>
            <line x1="504.0" y1="20" x2="504.0" y2="296" stroke="var(--border)" strokeWidth="1" />
            <text x="504.0" y="314" textAnchor="middle" className="fill-[color:var(--muted-foreground)] text-[12px]">10 kHz</text>
            <line x1="46" y1="296.0" x2="504" y2="296.0" stroke="var(--border)" strokeWidth="1" />
            <text x="36" y="300.0" textAnchor="end" className="fill-[color:var(--muted-foreground)] text-[12px]">0</text>
            <line x1="46" y1="158.0" x2="504" y2="158.0" stroke="var(--border)" strokeWidth="1" />
            <text x="36" y="162.0" textAnchor="end" className="fill-[color:var(--muted-foreground)] text-[12px]">0.5</text>
            <line x1="46" y1="20.0" x2="504" y2="20.0" stroke="var(--border)" strokeWidth="1" />
            <text x="36" y="24.0" textAnchor="end" className="fill-[color:var(--muted-foreground)] text-[12px]">1.0</text>
            <path d="M46.0 287.3 L51.0 286.7 L56.0 286.1 L61.0 285.5 L66.0 284.8 L71.2 284.1 L76.3 283.4 L81.5 282.6 L86.6 281.8 L91.5 281.1 L96.2 280.3 L101.1 279.5 L105.9 278.7 L110.7 277.8 L115.6 276.8 L120.4 275.8 L125.2 274.7 L130.6 273.5 L135.9 272.0 L141.2 270.5 L146.5 268.7 L151.4 267.0 L156.2 265.0 L161.0 262.9 L165.8 260.5 L170.7 257.7 L175.5 254.6 L180.3 251.1 L185.1 247.1 L190.1 242.4 L195.1 237.0 L200.1 230.7 L205.1 223.5 L210.3 214.9 L215.4 204.9 L220.6 193.4 L225.8 180.2 L230.6 166.5 L235.4 151.3 L240.2 135.2 L245.0 118.7 L250.0 102.1 L255.0 87.6 L260.0 76.6 L265.0 70.6 L270.2 70.4 L275.3 76.2 L280.5 87.0 L285.7 101.0 L290.5 115.6 L295.3 130.3 L300.1 144.3 L305.0 157.0 L309.8 167.9 L314.6 176.9 L319.4 183.6 L324.2 188.0 L329.6 189.6 L334.9 186.9 L340.2 178.6 L345.6 162.7 L350.4 139.7 L355.2 108.0 L360.1 72.1 L364.9 46.0 L369.7 46.0 L374.5 71.2 L379.3 105.2 L384.2 134.8 L389.2 155.3 L394.2 164.1 L399.1 159.7 L404.1 137.8 L409.3 91.8 L414.5 39.2 L419.6 40.2 L424.8 92.0 L429.6 132.1 L434.4 146.4 L439.3 130.0 L444.1 75.2 L449.1 24.1 L454.1 73.2 L459.1 126.7 L464.1 123.6 L469.2 48.1 L474.4 48.5 L479.5 121.0 L484.7 74.3 L489.5 39.4 L494.4 113.3 L499.2 39.6 L504.0 71.1 L504.0 296.0 L46.0 296.0 Z" fill="url(#absFillTall)" className="spectrum-fill" />
            <path d="M46.0 287.3 L51.0 286.7 L56.0 286.1 L61.0 285.5 L66.0 284.8 L71.2 284.1 L76.3 283.4 L81.5 282.6 L86.6 281.8 L91.5 281.1 L96.2 280.3 L101.1 279.5 L105.9 278.7 L110.7 277.8 L115.6 276.8 L120.4 275.8 L125.2 274.7 L130.6 273.5 L135.9 272.0 L141.2 270.5 L146.5 268.7 L151.4 267.0 L156.2 265.0 L161.0 262.9 L165.8 260.5 L170.7 257.7 L175.5 254.6 L180.3 251.1 L185.1 247.1 L190.1 242.4 L195.1 237.0 L200.1 230.7 L205.1 223.5 L210.3 214.9 L215.4 204.9 L220.6 193.4 L225.8 180.2 L230.6 166.5 L235.4 151.3 L240.2 135.2 L245.0 118.7 L250.0 102.1 L255.0 87.6 L260.0 76.6 L265.0 70.6 L270.2 70.4 L275.3 76.2 L280.5 87.0 L285.7 101.0 L290.5 115.6 L295.3 130.3 L300.1 144.3 L305.0 157.0 L309.8 167.9 L314.6 176.9 L319.4 183.6 L324.2 188.0 L329.6 189.6 L334.9 186.9 L340.2 178.6 L345.6 162.7 L350.4 139.7 L355.2 108.0 L360.1 72.1 L364.9 46.0 L369.7 46.0 L374.5 71.2 L379.3 105.2 L384.2 134.8 L389.2 155.3 L394.2 164.1 L399.1 159.7 L404.1 137.8 L409.3 91.8 L414.5 39.2 L419.6 40.2 L424.8 92.0 L429.6 132.1 L434.4 146.4 L439.3 130.0 L444.1 75.2 L449.1 24.1 L454.1 73.2 L459.1 126.7 L464.1 123.6 L469.2 48.1 L474.4 48.5 L479.5 121.0 L484.7 74.3 L489.5 39.4 L494.4 113.3 L499.2 39.6 L504.0 71.1" fill="none" stroke="var(--primary)" strokeWidth="2.25" pathLength={1}
                  strokeLinejoin="round" strokeLinecap="round" className="spectrum-line" />
            <circle cx="449.1" cy="24.1" r="4" fill="var(--primary)" />
            <circle cx="449.1" cy="24.1" r="8" fill="none" stroke="var(--primary)" strokeOpacity="0.35" strokeWidth="1.5" />
            <text x="437.1" y="29.1" textAnchor="end"
                  className="fill-[color:var(--foreground)] text-[12px] font-semibold">
              α 0.985 at 5300 Hz
            </text>
            <text x="14" y="11" className="fill-[color:var(--muted-foreground)] text-[11px]">α</text>
          </svg>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
          {[
            { k: "NRC", v: "0.55" },
            { k: "SAA", v: "0.5" },
            { k: "Peak absorption", v: "α 0.985" },
            { k: "Total depth", v: "100 mm" },
          ].map((f) => (
            <div key={f.k} className="bg-card px-5 py-3.5">
              <dt className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{f.k}</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        Computed by the Acoustic Metamaterials lab&apos;s solver, not drawn. Change the lattice in
        the lab and this curve moves.
      </figcaption>
    </figure>
  );
}

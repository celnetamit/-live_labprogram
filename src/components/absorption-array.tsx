"use client";

import { useState } from "react";

/*
  A programmable absorber array, drawn from a real parameter sweep.

  Each pillar is one (frequency, porosity) pair, and its height and colour are
  the absorption coefficient the Acoustic Metamaterials lab's own solver
  computed for that combination — 12 solver runs over porosity, each read off
  at the same 16 log-spaced frequencies:

    solve({ latticeType: 'Gyroid', cellSizeMm: 3, porosity: phi,
            coreThicknessMm: 80, airGapMm: 20, facing: { enabled: false },
            material: 'PLA', panelWidthMm: 600, panelHeightMm: 600 },
          { resolution: 4, skipDiffuse: true })

  So the ridge running across the array is the quarter-wave peak moving with
  porosity, not a shape chosen to look good. The row at phi = 0.60 is the
  design the block above is rendered at.

  Colour is viridis, which is perceptually uniform and colourblind-safe, and
  it carries the same number as the height — the redundancy is deliberate, so
  the array still reads correctly in greyscale or at a glance.
*/

const FREQS = [125, 165, 218, 287, 379, 500, 660, 871, 1149, 1516, 2000, 2639, 3482, 4595, 6063, 8000] as const;
const POROSITIES = [0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90] as const;
const ALPHA: number[][] = [
  [0.104, 0.172, 0.291, 0.467, 0.828, 0.912, 0.564, 0.344, 0.328, 0.772, 0.543, 0.474, 0.523, 0.801, 0.764, 0.540], // phi 0.35
  [0.094, 0.149, 0.243, 0.387, 0.734, 0.997, 0.684, 0.395, 0.333, 0.657, 0.693, 0.438, 0.678, 0.703, 0.663, 0.693], // phi 0.40
  [0.088, 0.133, 0.208, 0.323, 0.618, 0.971, 0.786, 0.451, 0.349, 0.557, 0.841, 0.432, 0.848, 0.606, 0.586, 0.888], // phi 0.45
  [0.083, 0.121, 0.183, 0.276, 0.516, 0.873, 0.847, 0.508, 0.373, 0.490, 0.941, 0.446, 0.967, 0.553, 0.562, 0.975], // phi 0.50
  [0.080, 0.112, 0.164, 0.241, 0.434, 0.754, 0.855, 0.560, 0.402, 0.449, 0.959, 0.473, 0.989, 0.536, 0.576, 0.911], // phi 0.55
  [0.077, 0.105, 0.150, 0.214, 0.372, 0.642, 0.817, 0.600, 0.432, 0.425, 0.906, 0.510, 0.930, 0.542, 0.613, 0.803], // phi 0.60
  [0.075, 0.100, 0.139, 0.193, 0.323, 0.547, 0.750, 0.623, 0.460, 0.414, 0.819, 0.550, 0.840, 0.562, 0.663, 0.724], // phi 0.65
  [0.072, 0.095, 0.129, 0.176, 0.285, 0.469, 0.671, 0.626, 0.484, 0.412, 0.728, 0.588, 0.753, 0.590, 0.712, 0.682], // phi 0.70
  [0.071, 0.091, 0.122, 0.163, 0.254, 0.406, 0.592, 0.610, 0.501, 0.415, 0.648, 0.618, 0.681, 0.619, 0.750, 0.670], // phi 0.75
  [0.069, 0.088, 0.116, 0.151, 0.229, 0.355, 0.518, 0.578, 0.509, 0.422, 0.584, 0.634, 0.628, 0.643, 0.767, 0.678], // phi 0.80
  [0.067, 0.085, 0.110, 0.142, 0.208, 0.313, 0.454, 0.537, 0.506, 0.430, 0.535, 0.634, 0.590, 0.656, 0.761, 0.696], // phi 0.85
  [0.066, 0.082, 0.105, 0.133, 0.191, 0.278, 0.398, 0.492, 0.494, 0.439, 0.497, 0.616, 0.565, 0.655, 0.734, 0.712], // phi 0.90
];

/** Viridis control points, interpolated in sRGB — close enough at this size. */
const VIRIDIS: [number, number, number][] = [
  [68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37],
];
function viridis(t: number): string {
  const x = Math.max(0, Math.min(1, t)) * (VIRIDIS.length - 1);
  const i = Math.min(Math.floor(x), VIRIDIS.length - 2);
  const f = x - i;
  const c = VIRIDIS[i].map((v, k) => Math.round(v + (VIRIDIS[i + 1][k] - v) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
const shade = (rgb: string, k: number) =>
  rgb.replace(/[\d]+/g, (m) => String(Math.round(Number(m) * k)));

// Isometric tile geometry.
const SX = 30;          // horizontal half-step between neighbours
const SY = 15;          // vertical half-step — SX/2 gives the 2:1 isometric
const R = 11;           // pillar radius
const RY = R * 0.5;     // its ellipse in projection
const HMAX = 104;       // height of alpha = 1

const COLS = FREQS.length;
const ROWS = POROSITIES.length;

/*
  Projection: screenX = OX + (c - r)*SX, screenY = OY + (c + r)*SY.

  Increasing c goes right-and-down, increasing r goes left-and-down, so the
  rhombus has two front edges: r = ROWS-1 with c varying (down-left, the
  frequency axis) and c = COLS-1 with r varying (down-right, the porosity
  axis). Labels sit one tile beyond those edges. Placing them on the back
  edges instead is what had them sitting on top of the pillars.
*/
const OX = ROWS * SX + 45;
const OY = HMAX + 14;
const W = OX + (COLS + 1) * SX + 46;
const H = OY + (COLS + ROWS) * SY + 46;

const hz = (f: number) => (f >= 1000 ? `${(f / 1000).toFixed(f >= 10000 ? 0 : 1)}k` : String(f));

export default function AbsorptionArray() {
  const [hover, setHover] = useState<{ c: number; r: number } | null>(null);

  /* Painter's algorithm: a pillar hides the ones behind it, and "behind"
     in this projection is simply a smaller col + row. */
  const cells: { c: number; r: number; depth: number }[] = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) cells.push({ c, r, depth: c + r });
  cells.sort((a, b) => a.depth - b.depth);

  const active = hover ? ALPHA[hover.r][hover.c] : null;

  return (
    <figure className="m-0">
      {/* The array keeps its own width on a narrow screen and pans. Scaled to
          fit 358px the 11px axis labels land at about 4px, which is not a
          smaller chart so much as an unreadable one. */}
      <div className="overflow-x-auto overscroll-x-contain">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full min-w-[640px]"
        role="img"
        aria-label="An isometric array of 192 pillars. Each is one frequency and porosity combination, its height and colour the absorption coefficient computed for that pair."
        onPointerLeave={() => setHover(null)}
      >
        {cells.map(({ c, r }) => {
          const a = ALPHA[r][c];
          const x = OX + (c - r) * SX;
          const yBase = OY + (c + r) * SY;
          const h = Math.max(2, a * HMAX);
          const top = yBase - h;
          const fill = viridis(a);
          const dim = hover && !(hover.c === c && hover.r === r) ? 0.45 : 1;
          return (
            <g
              key={`${c}-${r}`}
              opacity={dim}
              onPointerEnter={() => setHover({ c, r })}
              style={{ transition: "opacity 120ms" }}
            >
              {/* body: two straight sides closed by the bottom ellipse arc */}
              <path
                d={`M${x - R} ${top} L${x - R} ${yBase} A${R} ${RY} 0 0 0 ${x + R} ${yBase} L${x + R} ${top} Z`}
                fill={shade(fill, 0.62)}
              />
              <ellipse cx={x} cy={top} rx={R} ry={RY} fill={fill} />
            </g>
          );
        })}

        {/* axes, labelled on the two leading edges of the rhombus */}
        {/* frequency runs along the front-left edge (r one past the last row) */}
        {FREQS.map((f, c) =>
          c % 2 === 0 ? (
            <text
              key={`f${c}`}
              x={OX + (c - ROWS) * SX - 7}
              y={OY + (c + ROWS) * SY + 4}
              className="fill-[color:var(--muted-foreground)]"
              style={{ fontSize: 11 }}
              textAnchor="end"
            >
              {hz(f)}
            </text>
          ) : null,
        )}
        {/* porosity runs along the front-right edge (c one past the last column) */}
        {POROSITIES.map((p, r) =>
          r % 2 === 0 ? (
            <text
              key={`p${r}`}
              x={OX + (COLS - r) * SX + 7}
              y={OY + (COLS + r) * SY + 4}
              className="fill-[color:var(--muted-foreground)]"
              style={{ fontSize: 11 }}
              textAnchor="start"
            >
              {p.toFixed(2)}
            </text>
          ) : null,
        )}
      </svg>
      </div>

      <figcaption className="mt-1 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-xs text-muted-foreground">
        <span className="inline-flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            <span className="font-semibold text-foreground">Frequency</span> left edge
          </span>
          <span>
            <span className="font-semibold text-foreground">Porosity</span> right edge
          </span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span>&alpha; 0</span>
          <span
            className="h-2 w-24 rounded-full"
            style={{ background: `linear-gradient(90deg, ${[0, 0.25, 0.5, 0.75, 1].map(viridis).join(", ")})` }}
          />
          <span>1</span>
        </span>
        <span className="tabular-nums">
          {hover
            ? `${hz(FREQS[hover.c])}Hz · φ ${POROSITIES[hover.r].toFixed(2)} · α ${active!.toFixed(3)}`
            : "192 solver runs · point at a pillar for its value"}
        </span>
      </figcaption>
    </figure>
  );
}

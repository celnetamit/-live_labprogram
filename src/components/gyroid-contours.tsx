"use client";

import { useEffect, useRef } from "react";

/*
  A living backdrop made of the lab's own mathematics.

  This draws iso-contours of the gyroid level-set field

      F(x, y, z) = sin x·cos y + sin y·cos z + sin z·cos x

  on a plane of constant z, and sweeps z forward in time. That is the same
  field `physics/tpms.ts` in the Acoustic Metamaterials lab uses to build its
  specimen, and the same one the removed 3D block was ray-marching. Slicing a
  triply-periodic surface and moving the slice is what makes the contours
  breathe: nothing here is a random noise field dressed up as science, and
  nothing is a looping video.

  Why contours of a real field rather than a particle system or a mesh
  gradient: the page's argument is that its figures are computed, not drawn.
  A backdrop that is also computed costs about 1,400 field evaluations and a
  marching-squares pass per frame — cheaper than almost any particle toy —
  and it is the one decoration on the page that could be checked against the
  lab.

  Everything about it is defensive:
    - the loop only runs while the canvas is on screen (IntersectionObserver),
    - `prefers-reduced-motion` gets a single static frame and no loop,
    - it is `aria-hidden` and never hit-tested,
    - and it degrades to nothing at all if 2D canvas is unavailable.
*/

/* Field period is 2π. Showing a little over two cells across the width keeps
   the pattern legible as structure rather than as texture. */
const SPAN_X = Math.PI * 5.2;
const SPAN_Y = Math.PI * 3.0;

/* Grid density. The contours are smoothed by the marching-squares
   interpolation, so a coarse grid still reads as curves, and the cost is
   quadratic — 56×30 is where it stops looking faceted. */
const NX = 56;
const NY = 30;

/*
  Which iso-levels to draw.

  0.615975 is the tabulated isovalue for 60% porosity — the surface the lab
  actually solves on, and the one the page quotes. It is drawn brightest. The
  others are evenly spaced either side so the band reads as a family of
  shells rather than one lonely curve.
*/
const LEVELS = [
  { v: -1.25, a: 0.25 },
  { v: -0.615975, a: 0.5 },
  { v: 0, a: 0.75 },
  { v: 0.615975, a: 1 },
  { v: 1.25, a: 0.25 },
];

const TAU = Math.PI * 2;

export default function GyroidContours({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let running = false;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* Scratch grid, allocated once. Re-allocating (NX+1)(NY+1) floats every
       frame is the kind of thing that shows up as jank only on the devices
       least able to afford it. */
    const field = new Float32Array((NX + 1) * (NY + 1));

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      /* Cap the device pixel ratio. A 3× phone would otherwise paint nine
         times the pixels for a backdrop nobody is meant to look at. */
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* Read the two brand hues off the element, so the backdrop follows the
       theme and the `.band-ink` scope exactly as the rest of the page does
       rather than hard-coding a second opinion about the palette. */
    function hues() {
      const cs = getComputedStyle(canvas!);
      return {
        a: cs.getPropertyValue("--viv-a").trim() || "#5aa2ff",
        b: cs.getPropertyValue("--viv-b").trim() || "#b97df7",
      };
    }

    function draw(z: number) {
      ctx!.clearRect(0, 0, width, height);

      const dx = width / NX;
      const dy = height / NY;

      /* 1. Sample the field once over the grid. */
      const cosZ = Math.cos(z);
      const sinZ = Math.sin(z);
      for (let j = 0; j <= NY; j++) {
        const y = (j / NY) * SPAN_Y;
        const sy = Math.sin(y);
        const cy = Math.cos(y);
        for (let i = 0; i <= NX; i++) {
          const x = (i / NX) * SPAN_X;
          /* sin x·cos y + sin y·cos z + sin z·cos x */
          field[j * (NX + 1) + i] = Math.sin(x) * cy + sy * cosZ + sinZ * Math.cos(x);
        }
      }

      const { a, b } = hues();
      const grad = ctx!.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, a);
      grad.addColorStop(1, b);
      ctx!.strokeStyle = grad;
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";

      /* 2. Marching squares per level. Only the two line-segment cases are
         needed — the backdrop does not care about saddle disambiguation, and
         resolving it would add branches for a difference nobody can see at
         6% opacity. */
      for (const { v, a: alpha } of LEVELS) {
        ctx!.globalAlpha = alpha * 0.26;
        ctx!.lineWidth = v === 0.615975 ? 2 : 1.25;
        ctx!.beginPath();

        for (let j = 0; j < NY; j++) {
          for (let i = 0; i < NX; i++) {
            const i0 = j * (NX + 1) + i;
            const tl = field[i0];
            const tr = field[i0 + 1];
            const bl = field[i0 + NX + 1];
            const br = field[i0 + NX + 2];

            let code = 0;
            if (tl > v) code |= 8;
            if (tr > v) code |= 4;
            if (br > v) code |= 2;
            if (bl > v) code |= 1;
            if (code === 0 || code === 15) continue;

            const x0 = i * dx;
            const y0 = j * dy;
            const lerp = (va: number, vb: number) => (v - va) / (vb - va || 1e-6);

            const top = () => [x0 + lerp(tl, tr) * dx, y0] as const;
            const right = () => [x0 + dx, y0 + lerp(tr, br) * dy] as const;
            const bottom = () => [x0 + lerp(bl, br) * dx, y0 + dy] as const;
            const left = () => [x0, y0 + lerp(tl, bl) * dy] as const;

            const seg = (p: readonly [number, number], q: readonly [number, number]) => {
              ctx!.moveTo(p[0], p[1]);
              ctx!.lineTo(q[0], q[1]);
            };

            switch (code) {
              case 1: case 14: seg(left(), bottom()); break;
              case 2: case 13: seg(bottom(), right()); break;
              case 3: case 12: seg(left(), right()); break;
              case 4: case 11: seg(top(), right()); break;
              case 6: case 9: seg(top(), bottom()); break;
              case 7: case 8: seg(left(), top()); break;
              /* The two ambiguous saddles: draw both branches. */
              case 5: seg(left(), top()); seg(bottom(), right()); break;
              case 10: seg(top(), right()); seg(left(), bottom()); break;
            }
          }
        }
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;
    }

    /* One full period of z is 2π. Ninety seconds for a whole sweep is slow
       enough that the motion is felt rather than watched, which is the only
       speed a backdrop behind a headline is allowed to move at. */
    const PERIOD_MS = 90_000;
    let start = 0;

    function frame(now: number) {
      if (!start) start = now;
      draw(((now - start) % PERIOD_MS) / PERIOD_MS * TAU);
      raf = requestAnimationFrame(frame);
    }

    function startLoop() {
      if (running || reduced.matches) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stopLoop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    draw(0);

    /* Off-screen, this stops entirely. A hero backdrop that keeps compositing
       while the reader is at the footer is pure battery cost. */
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? startLoop() : stopLoop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(0);
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const onReduced = () => {
      stopLoop();
      draw(0);
      if (!reduced.matches) startLoop();
    };
    reduced.addEventListener("change", onReduced);

    return () => {
      stopLoop();
      io.disconnect();
      ro.disconnect();
      reduced.removeEventListener("change", onReduced);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}

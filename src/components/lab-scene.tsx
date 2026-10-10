"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Beaker, Microscope, Network, ScanLine } from "lucide-react";

type Hotspot = "experiments" | "data" | "science";
type Instrument = "microscope" | "flask" | "graph";

const hotspotCopy: Record<Hotspot, { label: string; title: string; detail: string; href: string; icon: typeof Beaker }> = {
  experiments: {
    label: "Explore experiments",
    title: "A bench built for repeatable work",
    detail: "Change conditions, run a lab, and keep the method visible while you learn.",
    href: "/labs",
    icon: Beaker,
  },
  data: {
    label: "Analyze data",
    title: "Evidence stays in the room",
    detail: "Read plots, tables, signals, and model outputs produced by your choices.",
    href: "/#evidence",
    icon: ScanLine,
  },
  science: {
    label: "Discover science",
    title: "Connect the model to the mechanism",
    detail: "Move from an observation to the structure or principle that explains it.",
    href: "/#how-it-works",
    icon: Network,
  },
};

const instrumentCopy: Record<Instrument, { label: string; title: string; detail: string; icon: typeof Beaker }> = {
  microscope: {
    label: "Explore experiments / Interface preview",
    title: "A bench built for repeatable work",
    detail: "Change conditions, run a lab, and keep the method visible while you learn.",
    icon: Microscope,
  },
  flask: {
    label: "Discover science / Instrument model",
    title: "Observe a system, then explain it",
    detail: "Follow a method from setup to evidence and connect the result to the science behind it.",
    icon: Beaker,
  },
  graph: {
    label: "Analyze data / Measurement view",
    title: "Evidence stays visible as you work",
    detail: "Read plots, tables, signals, and model outputs produced by your experimental choices.",
    icon: ScanLine,
  },
};

export default function LabScene() {
  const [active, setActive] = useState<Hotspot>("experiments");
  const [instrument, setInstrument] = useState<Instrument>("microscope");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const copy = hotspotCopy[active];
  const instrumentDetails = instrumentCopy[instrument];
  const ActiveIcon = instrumentDetails.icon;

  const activateHotspot = (key: Hotspot) => {
    setActive(key);
    setInstrument(key === "data" ? "graph" : key === "science" ? "flask" : "microscope");
  };

  return (
    <div
      className="lab-scene"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setTilt({
          x: ((event.clientY - rect.top) / rect.height - 0.5) * -5,
          y: ((event.clientX - rect.left) / rect.width - 0.5) * 7,
        });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      aria-label="Interactive illustration of a scientific laboratory bench"
    >
      <div className="lab-scene-grid" aria-hidden="true" />
      <div className="lab-scene-glow lab-scene-glow-a" aria-hidden="true" />
      <div className="lab-scene-glow lab-scene-glow-b" aria-hidden="true" />

      {/*
        The stage is the drawing's own box, not the column's.

        It used to be `inset: 3% 0 22%` of a column that is far wider than the
        artwork is, and the SVG letterboxes inside it (xMidYMid meet). So the
        hotspots and the hint, which are positioned as a percentage of the
        stage, drifted away from the instruments they point at — at 1920 the
        "Discover science" hotspot sat outside the panel entirely, a lit dot
        floating in the hero background. The stage now carries the drawing's
        aspect ratio, so a percentage of the stage IS a percentage of the art.
      */}
      <div className="lab-scene-stage" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
        <svg className="lab-scene-art" viewBox="0 0 900 560" role="img" aria-labelledby="lab-scene-title lab-scene-desc">
          <title id="lab-scene-title">Interactive scientific laboratory bench</title>
          <desc id="lab-scene-desc">A microscope, glassware, pipette, molecular structure, and data display arranged on a research bench.</desc>
          <defs>
            <linearGradient id="scene-wall" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#172b45" /><stop offset="1" stopColor="#07111f" /></linearGradient>
            <linearGradient id="scene-bench" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#253d55" /><stop offset="1" stopColor="#101b2c" /></linearGradient>
            <linearGradient id="scene-glass" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#a6dcff" stopOpacity=".5" /><stop offset=".55" stopColor="#5e91bc" stopOpacity=".12" /><stop offset="1" stopColor="#d7a7ff" stopOpacity=".42" /></linearGradient>
            <linearGradient id="scene-violet" x1="0" x2="1"><stop stopColor="#6faaff" /><stop offset="1" stopColor="#c58bff" /></linearGradient>
            <filter id="scene-shadow"><feGaussianBlur stdDeviation="12" /></filter>
          </defs>

          {/*
            The room. Widened from a 720-unit box to 900 so the bench runs the
            width of a hero column on a large display instead of leaving the
            right third of it empty; the bench and its legs keep the same
            vanishing point, so the perspective is the one that was drawn.
          */}
          <rect x="28" y="34" width="844" height="458" rx="28" fill="url(#scene-wall)" stroke="#4c6d92" strokeOpacity=".35" />
          <path d="M50 344 850 223v192L50 520Z" fill="#0a1524" opacity=".55" />
          <path d="M50 388 850 267v76L50 466Z" fill="url(#scene-bench)" stroke="#6284a5" strokeOpacity=".35" />
          <path d="M87 466v45M807 352v71" stroke="#13253a" strokeWidth="18" />
          <ellipse cx="455" cy="428" rx="350" ry="44" fill="#020711" opacity=".8" filter="url(#scene-shadow)" />

          {/* data display */}
          <g transform="translate(642 76)">
            <rect width="154" height="108" rx="9" fill="#091421" stroke="#6e9ec4" strokeOpacity=".7" />
            <rect x="10" y="11" width="134" height="76" rx="4" fill="#10253a" />
            <path d="M16 71 37 58l16 8 19-28 19 14 17-20 24 10" fill="none" stroke="#70d7ff" strokeWidth="2.5" />
            <path d="M16 73h120M16 53h120M16 33h120" stroke="#6e9ec4" strokeOpacity=".14" />
            <circle cx="32" cy="23" r="3" fill="#c58bff" /><circle cx="43" cy="23" r="3" fill="#70d7ff" />
            <text x="16" y="101" fill="#8fb0ca" fontSize="9" fontFamily="sans-serif" letterSpacing="1.5">ABSORPTION / RUN 04</text>
          </g>
          <path d="M719 186v36" stroke="#7397b9" strokeWidth="5" /><path d="M703 223h33" stroke="#7397b9" strokeWidth="5" />

          {/* microscope */}
          <g transform="translate(110 130) rotate(-7 120 150)">
            <path d="m83 35 54-20 17 22-56 21Z" fill="#7899b5" stroke="#b4d4ea" strokeOpacity=".6" />
            <path d="m139 39 44 30-13 17-46-30Z" fill="#2a4e6c" stroke="#a7cff0" strokeOpacity=".55" />
            <path d="M155 77 126 139" stroke="#92b7d3" strokeWidth="24" strokeLinecap="round" />
            <path d="M154 81 125 140" stroke="#d4eaff" strokeOpacity=".18" strokeWidth="7" strokeLinecap="round" />
            <path d="m117 137-17 33 32 12 18-36Z" fill="#416884" />
            <path d="M95 170c-18 38-18 55 4 70h108c5-13-4-23-26-28l-28-33Z" fill="#27445e" stroke="#88acc9" strokeOpacity=".5" />
            <path d="M56 245h143" stroke="#b0cee4" strokeWidth="10" strokeLinecap="round" /><path d="M76 245h101" stroke="#142d47" strokeWidth="4" />
            <circle cx="119" cy="153" r="17" fill="#132a40" stroke="#8bcaff" strokeWidth="3" /><circle cx="119" cy="153" r="6" fill="#d8aeff" />
          </g>

          {/* flask and liquid */}
          <g transform="translate(352 286)">
            <path d="M36 0h42v53l40 85c10 21-7 39-30 39H26c-23 0-40-18-30-39l40-85Z" fill="url(#scene-glass)" stroke="#a7d9f7" strokeOpacity=".8" strokeWidth="2" />
            <path d="M8 118c23-11 56 9 94-4l16 28c10 21-7 35-30 35H26c-23 0-40-14-30-35Z" fill="#56c8e8" fillOpacity=".55" />
            <path d="M14 116c26-11 55 9 91-3" fill="none" stroke="#9ff2ff" strokeWidth="3" strokeOpacity=".7" />
            <path d="M43 18h28" stroke="#d8efff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="29" cy="143" r="4" fill="#d5b1ff" /><circle cx="55" cy="151" r="3" fill="#b1f4ff" />
          </g>

          {/* pipette */}
          <g transform="translate(254 288) rotate(19)">
            <path d="M0 21 13 8l112 112-13 13Z" fill="#dceeff" fillOpacity=".7" stroke="#94c8e9" />
            <path d="m121 120 12 12-12 32-9-9Z" fill="#7fd9ff" /><path d="M2 20-8 11 3 0l10 9Z" fill="#c690ff" />
            <path d="M34 35 45 24M54 55 65 44M74 75 85 64" stroke="#476d8c" strokeWidth="3" />
          </g>

          {/*
            The molecule sits in a plain wrapper that carries its position,
            and the float animation runs on the child.

            `.scene-molecule` animates the CSS `transform`, and a CSS transform
            REPLACES the `transform` presentation attribute rather than
            composing with it — so with the two on one element the translate
            was discarded the moment the animation applied and the molecule
            drew itself at the origin of the viewBox, hanging outside the room
            at the top-left corner with "MOLECULAR MODEL" labelling empty
            bench. Splitting them keeps the placement in the attribute, where
            the animation cannot reach it.
          */}
          <g transform="translate(628 258)">
            <g className="scene-molecule">
              <g stroke="#72d7ff" strokeOpacity=".7" strokeWidth="3"><path d="M0 44 50 0l54 31-23 62-61 9Z" /><path d="m50 0 21 56M104 31 51 54M51 54l-31 48" /></g>
              <g fill="url(#scene-violet)" stroke="#d3b1ff" strokeOpacity=".7"><circle cx="0" cy="44" r="11" /><circle cx="50" cy="0" r="13" /><circle cx="104" cy="31" r="12" /><circle cx="81" cy="93" r="14" /><circle cx="20" cy="102" r="10" /><circle cx="51" cy="54" r="15" /></g>
            </g>
          </g>

          <text x="72" y="78" fill="#a6c2dc" fontSize="11" fontFamily="sans-serif" letterSpacing="2">LIVE LABS / INSTRUMENT VIEW</text>
          <text x="628" y="398" fill="#8db0ca" fontSize="10" fontFamily="sans-serif" letterSpacing="1.5">MOLECULAR MODEL</text>
        </svg>

        {Object.entries(hotspotCopy).map(([key, value]) => (
          <button
            key={key}
            className={`lab-hotspot lab-hotspot-${key} ${active === key ? "is-active" : ""}`}
            onClick={() => activateHotspot(key as Hotspot)}
            aria-label={value.label}
            aria-pressed={active === key}
          ><span /></button>
        ))}

        <div className="lab-scene-hint"><Microscope aria-hidden="true" /> Move across the bench to inspect the setup</div>
      </div>

      <div className="lab-scene-caption glassmorphism">
        <div className="lab-instrument-tabs" role="tablist" aria-label="Instrument preview">
          {(Object.keys(instrumentCopy) as Instrument[]).map((key) => {
            const TabIcon = instrumentCopy[key].icon;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={instrument === key}
                tabIndex={instrument === key ? 0 : -1}
                onClick={() => setInstrument(key)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    event.preventDefault();
                    const next = key === "microscope" ? "flask" : key === "flask" ? "graph" : "microscope";
                    setInstrument(next);
                  }
                  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                    event.preventDefault();
                    const previous = key === "microscope" ? "graph" : key === "flask" ? "microscope" : "flask";
                    setInstrument(previous);
                  }
                }}
              >
                <TabIcon aria-hidden="true" />
                <span>{key[0].toUpperCase() + key.slice(1)}</span>
              </button>
            );
          })}
        </div>
        <div className="lab-instrument-details" role="tabpanel">
          <div className="flex items-start gap-3">
            <span className="lab-caption-icon"><ActiveIcon aria-hidden="true" /></span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200/70">{instrumentDetails.label}</p>
              <p className="mt-1 text-sm font-semibold text-white">{instrumentDetails.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">{instrumentDetails.detail}</p>
            </div>
            <Link href={copy.href} className="lab-caption-link" aria-label={`Open ${copy.label}`}><ArrowUpRight aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

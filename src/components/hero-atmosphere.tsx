"use client";

/*
  The hero's atmosphere.

  Rather than a generic gradient blob, the glow behind the headline is the
  same curve the figure plots — the 93-point absorption spectrum from the
  Acoustic Metamaterials solver, stretched across the band, blurred hard and
  dropped to a few percent opacity. The decoration is the data.

  `preserveAspectRatio="none"` is deliberate: the shape is being used as a
  light source, not read as a chart, and it needs to span whatever width the
  band happens to be. The figure below states the real axes.

  Purely decorative, so `aria-hidden`, and it holds still for anyone who has
  asked for reduced motion.
*/
export default function HeroAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Two soft lights, well apart, so the band is not evenly lit. */}
      <div
        className="absolute -top-40 left-[-10%] h-[42rem] w-[42rem] rounded-full opacity-[0.22] blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--primary), transparent 65%)" }}
      />
      <div
        className="absolute -top-24 right-[-6%] h-[34rem] w-[34rem] rounded-full opacity-[0.16] blur-[120px]"
        style={{ background: "radial-gradient(circle, oklch(0.7 0.13 200), transparent 65%)" }}
      />

      {/* The spectrum itself, as light. */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[72%] w-full opacity-[0.16]"
        viewBox="0 0 1120 300"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="atmFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
          <filter id="atmBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <g filter="url(#atmBlur)">
          <path d="M58.0 256.4 L69.5 255.9 L80.6 255.3 L92.2 254.8 L103.5 254.2 L115.3 253.5 L127.0 252.9 L138.8 252.3 L150.4 251.6 L161.4 250.9 L172.3 250.3 L183.4 249.6 L194.3 248.8 L205.2 248.0 L216.3 247.2 L227.2 246.3 L238.2 245.4 L250.4 244.2 L262.4 243.0 L274.6 241.6 L286.8 240.1 L297.7 238.6 L308.7 236.8 L319.6 235.0 L330.6 232.8 L341.6 230.4 L352.6 227.7 L363.5 224.7 L374.5 221.1 L385.9 217.0 L397.2 212.3 L408.6 206.8 L420.0 200.5 L431.7 192.9 L443.5 184.1 L455.2 174.0 L467.0 162.5 L477.9 150.4 L488.9 137.2 L499.9 123.0 L510.8 108.5 L522.2 94.0 L533.5 81.2 L544.9 71.6 L556.3 66.3 L568.0 66.2 L579.8 71.3 L591.5 80.7 L603.3 93.0 L614.2 105.8 L625.2 118.7 L636.2 131.0 L647.2 142.1 L658.1 151.7 L669.1 159.5 L680.1 165.5 L691.0 169.3 L703.2 170.7 L715.3 168.3 L727.5 161.1 L739.6 147.1 L750.6 127.0 L761.5 99.1 L772.5 67.6 L783.5 44.8 L794.4 44.8 L805.4 66.9 L816.4 96.7 L827.4 122.6 L838.7 140.6 L850.1 148.4 L861.5 144.5 L872.8 125.3 L884.6 85.0 L896.3 38.8 L908.1 39.7 L919.8 85.1 L930.8 120.3 L941.7 132.9 L952.7 118.4 L963.7 70.4 L975.0 25.6 L986.4 68.7 L997.8 115.6 L1009.1 112.8 L1020.9 46.6 L1032.6 47.0 L1044.4 110.6 L1056.1 69.6 L1067.1 39.0 L1078.1 103.8 L1089.0 39.2 L1100.0 66.8 L1120 300 L0 300 Z" fill="url(#atmFill)" />
          <path
            d="M58.0 256.4 L69.5 255.9 L80.6 255.3 L92.2 254.8 L103.5 254.2 L115.3 253.5 L127.0 252.9 L138.8 252.3 L150.4 251.6 L161.4 250.9 L172.3 250.3 L183.4 249.6 L194.3 248.8 L205.2 248.0 L216.3 247.2 L227.2 246.3 L238.2 245.4 L250.4 244.2 L262.4 243.0 L274.6 241.6 L286.8 240.1 L297.7 238.6 L308.7 236.8 L319.6 235.0 L330.6 232.8 L341.6 230.4 L352.6 227.7 L363.5 224.7 L374.5 221.1 L385.9 217.0 L397.2 212.3 L408.6 206.8 L420.0 200.5 L431.7 192.9 L443.5 184.1 L455.2 174.0 L467.0 162.5 L477.9 150.4 L488.9 137.2 L499.9 123.0 L510.8 108.5 L522.2 94.0 L533.5 81.2 L544.9 71.6 L556.3 66.3 L568.0 66.2 L579.8 71.3 L591.5 80.7 L603.3 93.0 L614.2 105.8 L625.2 118.7 L636.2 131.0 L647.2 142.1 L658.1 151.7 L669.1 159.5 L680.1 165.5 L691.0 169.3 L703.2 170.7 L715.3 168.3 L727.5 161.1 L739.6 147.1 L750.6 127.0 L761.5 99.1 L772.5 67.6 L783.5 44.8 L794.4 44.8 L805.4 66.9 L816.4 96.7 L827.4 122.6 L838.7 140.6 L850.1 148.4 L861.5 144.5 L872.8 125.3 L884.6 85.0 L896.3 38.8 L908.1 39.7 L919.8 85.1 L930.8 120.3 L941.7 132.9 L952.7 118.4 L963.7 70.4 L975.0 25.6 L986.4 68.7 L997.8 115.6 L1009.1 112.8 L1020.9 46.6 L1032.6 47.0 L1044.4 110.6 L1056.1 69.6 L1067.1 39.0 L1078.1 103.8 L1089.0 39.2 L1100.0 66.8"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeOpacity="0.9"
          />
        </g>
      </svg>

      {/*
        A faint engineering grid, for depth. It is masked to a soft ellipse so
        it never reaches the edges of the band: a grid that runs to the corners
        reads as a background texture, while one that fades out reads as space
        the headline is standing in. 72px cells, at 3% — any stronger and it
        starts competing with the spectrum behind it.
      */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 85% 70% at 50% 42%, #000 20%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 70% at 50% 42%, #000 20%, transparent 78%)",
        }}
      />

      {/* A vignette, so the corners sit back and the centre comes forward. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 85% at 50% 38%, transparent 42%, rgb(0 0 0 / 0.30) 100%)",
        }}
      />

      {/* A hairline horizon so the band ends on a line rather than a fade. */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-[color:var(--border)]" />
    </div>
  );
}

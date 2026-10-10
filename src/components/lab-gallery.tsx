"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LAB_PREVIEWS, type LabPreview } from "@/content/labs/previews";

/*
  One card per laboratory: a recorded clip of the lab running, its own
  tagline, and a link into the guide.

  Thirteen autoplaying clips on one page is the obvious way to make a homepage
  unusable, so none of them are loaded until they are near the viewport and
  none of them play while off screen. A video carries `preload="none"`, which
  means an off-screen card costs one HTTP request for its poster and nothing
  else; it is only told to play once it actually scrolls in.

  A GIF cannot be controlled that way — the browser decodes and loops it from
  the moment it is fetched, with no API to pause it — so GIF cards get
  `loading="lazy"` and nothing more. That asymmetry is the practical reason to
  record MP4 rather than GIF, quite apart from the file being ~20x smaller.
*/

const isVideo = (file: string) => /\.(mp4|webm|mov)$/i.test(file);

function PreviewMedia({ lab }: { lab: LabPreview }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Honour a reduced-motion preference: load the poster, never autoplay.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void el.play().catch(() => { /* autoplay blocked; poster stands */ });
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!lab.media) {
    /* No recording yet. A neutral frame, not a stock photograph of a
       laboratory — the whole point of this gallery is that each clip is the
       lab itself, and a stand-in would quietly break that. */
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
        <span className="px-4 text-center text-xs text-muted-foreground">
          Walkthrough being recorded
        </span>
      </div>
    );
  }

  if (isVideo(lab.media)) {
    return (
      <video
        ref={ref}
        className="aspect-video w-full rounded-lg border border-border bg-muted/30 object-cover"
        src={`/labs/${lab.media}`}
        poster={lab.poster ? `/labs/${lab.poster}` : undefined}
        muted
        loop
        playsInline
        preload="none"
        aria-label={`${lab.name} walkthrough`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- an animated GIF
    // must not go through the image optimiser, which returns a still frame.
    <img
      className="aspect-video w-full rounded-lg border border-border bg-muted/30 object-cover"
      src={`/labs/${lab.media}`}
      alt={`${lab.name} walkthrough`}
      loading="lazy"
      decoding="async"
    />
  );
}

export default function LabGallery() {
  return (
    <ul className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {LAB_PREVIEWS.map((lab, i) => (
        <motion.li
          key={lab.slug}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: Math.min(i, 5) * 0.05 }}
        >
          <Link href={`/labs/${lab.slug}`} className="group block outline-none">
            <PreviewMedia lab={lab} />
            <h3 className="mt-3.5 text-base font-semibold tracking-tight group-hover:text-primary-ink group-focus-visible:text-primary-ink">
              {lab.name}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{lab.blurb}</p>
            <span className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium text-primary-ink">
              Read the guide
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}

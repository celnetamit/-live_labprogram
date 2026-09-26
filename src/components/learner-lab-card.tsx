"use client";

import Image from "next/image";
import Link from "next/link";
import type { ImageCredit } from "@/lib/learnerLabs";
import { ArrowRight, CheckCircle2, Clock, Lock } from "lucide-react";

/**
 * One lab, as a learner sees it, on both the dashboard and My Labs.
 *
 * It exists so the two cannot drift: the review that prompted this listed
 * "Launch", "Open", "Open the lab" and "Details" as four names for two actions,
 * and card heights that did not line up. The action vocabulary is fixed here —
 *
 *   primary    Resume lab | Start lab | Review lab   (what the learner does next)
 *   secondary  View details                          (the guide page)
 *
 * — and every card is `h-full` inside a stretch grid, so a row is level
 * whatever the synopsis length.
 */

export type LearnerCardLab = {
  slug: string;
  title: string;
  subject: string;
  difficulty: string;
  synopsis: string;
  image: string | null;
  /** Source line for a cover photograph that is not ours, with its colours. */
  imageCredit?: ImageCredit | null;
  status: "not-started" | "in-progress" | "completed";
  totalSteps: number;
  completedSteps: number;
  percent: number;
  nextStep: string | null;
  minutesLeft: number;
};

function formatLeft(mins: number): string | null {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m} min left`;
  return m ? `${h} h ${m} min left` : `${h} h left`;
}

/**
 * The status chip. Colours come from semantic tokens rather than raw palette
 * classes, which flip with the theme on their own — a hard-coded light tint
 * reads as an invisible smudge on the light card background.
 */
function StatusChip({ status }: { status: LearnerCardLab["status"] }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--color-success)]">
        <CheckCircle2 className="h-3.5 w-3.5" /> Completed
      </span>
    );
  }
  if (status === "in-progress") {
    return <span className="text-xs font-medium text-primary">In progress</span>;
  }
  return <span className="text-xs text-muted-foreground">Not started</span>;
}

export function ProgressBar({ percent, className = "" }: { percent: number; className?: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-muted ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

/** A lettered tile for a lab with no poster, so a missing file is not a broken image. */
function Fallback({ title }: { title: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <span className="text-3xl font-semibold text-muted-foreground">{title.charAt(0)}</span>
    </div>
  );
}

export default function LearnerLabCard({
  lab,
  locked = false,
  meta = null,
}: {
  lab: LearnerCardLab;
  /** A catalogue lab this learner cannot open yet. */
  locked?: boolean;
  /**
   * A short factual line for a lab with no progress to show — "8 steps · ~90
   * min". Locked cards would otherwise have an empty band where the progress
   * bar sits, and the row would stop lining up.
   */
  meta?: string | null;
}) {
  const href = `/dashboard/labs/${lab.slug}`;
  const primaryLabel =
    lab.status === "completed" ? "Review lab" : lab.status === "in-progress" ? "Resume lab" : "Start lab";
  const left = formatLeft(lab.minutesLeft);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-colors hover:border-foreground/20">
      <Link href={href} className="relative block aspect-[16/9] overflow-hidden bg-muted">
        {lab.image ? (
          /*
            `next/image`, not a plain <img>. The posters are 1280x720 and this
            slot is ~400px on a desktop grid and ~350px on a phone, so a raw
            <img> shipped roughly 935 KB of JPEG across a full catalogue to
            paint a fraction of it. The optimiser serves AVIF/WebP at the size
            actually needed, and `fill` + a known aspect ratio reserves the box
            so the card does not shift as each image lands.
          */
          <Image
            src={lab.image}
            alt={`${lab.title} screenshot`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <Fallback title={lab.title} />
        )}
        {locked && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-background/85 px-2 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Lock className="h-3 w-3" /> Locked
          </span>
        )}
        {/*
            Photo credit, over a scrim so it stays readable whatever the image
            beneath it. The card is the only place these photographs appear, so
            this is the only place the source can be shown. `title` carries the
            full line for the cases where the card is narrow enough to truncate.
        */}
        {lab.imageCredit && (
          <span
            title={lab.imageCredit.text}
            style={{
              /*
                A pale wash of the photograph's own hue — 38% of the measured
                colour over white — rather than a dark bar.

                Two earlier attempts were worse. A black gradient fought every
                picture. Painting the measured colour itself was no better: the
                average of a photograph of pink, teal and red bacteria is mud
                dark enough to look like the same black bar. Keeping the hue
                and lightening it hard gives a strip that reads as part of the
                image and still holds 10px type, which is why the ink is dark
                here regardless of the photograph.
              */
              backgroundColor: `color-mix(in srgb, ${lab.imageCredit.tint} 38%, white)`,
            }}
            className="absolute inset-x-0 bottom-0 line-clamp-2 px-2 py-1 text-[10px] font-medium leading-tight text-black/75 backdrop-blur-[3px]"
          >
            {lab.imageCredit.text}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {lab.subject}
          </span>
          {!locked && <StatusChip status={lab.status} />}
        </div>

        <h3 className="mb-1 line-clamp-2 font-semibold leading-snug">
          <Link href={href} className="hover:underline">
            {lab.title}
          </Link>
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{lab.synopsis}</p>

        {/* Everything below is pinned to the bottom so a row of cards lines up. */}
        <div className="mt-auto space-y-3">
          {locked && meta && (
            <p className="text-xs text-muted-foreground">{meta}</p>
          )}
          {!locked && lab.totalSteps > 0 && (
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {lab.completedSteps} of {lab.totalSteps} steps
                </span>
                {left && lab.status !== "completed" && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {left}
                  </span>
                )}
              </div>
              <ProgressBar percent={lab.percent} />
              {lab.nextStep && lab.status !== "completed" && (
                <p className="mt-1.5 truncate text-xs text-muted-foreground">
                  Next: <span className="text-foreground">{lab.nextStep}</span>
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            {locked ? (
              <Link
                href={href}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-medium transition-colors hover:bg-accent"
              >
                View details <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href={href}
                  className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {primaryLabel}
                </Link>
                <Link
                  href={href}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Details
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

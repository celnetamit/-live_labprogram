"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Dna, Lock } from "lucide-react";
import type { CardShowcase } from "@/lib/learnerLabs";
import { showcaseFontClass, showcaseVars } from "@/lib/showcase";
import type { LearnerCardLab } from "./learner-lab-card";

/** "1h 18m" — the lab page's hero writes the hands-on time the same way. */
function duration(mins: number): string | null {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

const STATUS: Record<LearnerCardLab["status"], string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
};

/**
 * The catalogue card for a lab with a showcase design, drawn to match its
 * lab page: the cover photograph with the lab's badge and source line, the
 * split-colour wordmark, three figures and the two actions. The progress
 * figure is the whole of the progress story here; the lab page carries the
 * bar and the next step.
 *
 * Same contract as `LearnerLabCard`, which hands over to this — same actions
 * (Start | Resume | Review lab, then Details), both linking to the guide page,
 * and `h-full` with the actions pinned to the bottom so a row lines up.
 *
 * The photograph is dark in both themes; the body below it follows the
 * theme, as the lab page does, so the card is not a black slab in a light
 * catalogue.
 */
export default function ShowcaseLabCard({
  lab,
  showcase,
  locked,
}: {
  lab: LearnerCardLab;
  showcase: CardShowcase;
  locked: boolean;
}) {
  const href = `/dashboard/labs/${lab.slug}`;
  const primaryLabel =
    lab.status === "completed" ? "Review lab" : lab.status === "in-progress" ? "Resume lab" : "Start lab";
  const total = duration(lab.minutesTotal ?? 0);
  /* A locked visitor has no progress to report, so the figure becomes the
     size of the lab instead of "0 of 8". */
  const figures = [
    locked
      ? { label: "Steps", value: `${lab.totalSteps} steps` }
      : { label: "Progress", value: `${lab.completedSteps} of ${lab.totalSteps} steps` },
    ...(total ? [{ label: "Duration", value: total }] : []),
    { label: "Level", value: lab.difficulty },
  ];

  return (
    <article
      className={`sc-card ${showcaseFontClass} flex h-full flex-col`}
      style={showcaseVars(showcase)}
    >
      {/* Not a link of its own: the title's link is stretched over the whole
          card (`.sc-card-title a::after`), so the photograph is still a way
          in, without a second, unnamed link in the tab order. */}
      <div className="sc-card-photo">
        {lab.image && (
          <Image
            src={lab.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        )}
        <span className="sc-card-badge">
          <span className="sc-card-badge-dot" />
          {showcase.badge}
        </span>
        <span className="sc-card-category-row">
          <span className="sc-card-category">{lab.subject}</span>
          <span className="sc-card-status">
            {locked ? (
              <>
                <Lock className="h-3 w-3" /> Locked
              </>
            ) : lab.status === "completed" ? (
              <>
                <CheckCircle2 className="h-3 w-3" /> Completed
              </>
            ) : (
              STATUS[lab.status]
            )}
          </span>
        </span>
        {/* The micrograph is published work; its source goes where it is shown. */}
        {lab.imageCredit && (
          <span className="sc-card-citation" title={lab.imageCredit.text}>
            {lab.imageCredit.text}
          </span>
        )}
      </div>

      <div className="sc-card-body flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3.5">
          <h3 className="sc-card-title">
            <Link href={href} className="focus-ring rounded-sm">
              {showcase.title
                ? showcase.title.map((s, i) => (
                    <span key={i} className={s.accent ? `sc-card-title-${s.accent}` : undefined}>
                      {s.text}
                    </span>
                  ))
                : lab.title}
            </Link>
          </h3>
          <span aria-hidden className="sc-card-icon">
            <Dna />
          </span>
        </div>

        <p className="sc-card-description">{showcase.description}</p>

        <dl className="sc-card-figures">
          {figures.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>

        {/* Pinned to the bottom, so a row of cards lines up. */}
        <div className="sc-card-actions mt-auto">
          {locked ? (
            <Link href={href} className="sc-card-primary focus-ring">
              View details <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link href={href} className="sc-card-primary focus-ring">
                {primaryLabel}
              </Link>
              <Link href={href} className="sc-card-secondary focus-ring">
                Details
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

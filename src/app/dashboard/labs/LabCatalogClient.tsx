"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, FlaskConical, CalendarClock, Wrench } from "lucide-react";
import type { LabPreview } from "@/lib/labPreview";
import LearnerLabCard from "@/components/learner-lab-card";
import type { CardShowcase, CoverEdge, ImageCredit } from "@/lib/learnerLabs";
import CustomLabRequestPanel, { type MyLabRequest } from "./CustomLabRequestPanel";

export type CatalogLab = {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  subject: string;
  difficulty: string;
  points: number;
  keySkills: string[];
  owned: boolean;
  /** A real screenshot of the lab, or null when it has no authored guide. */
  image: string | null;
  /** Source line for a cover photograph that is not ours, with its colours. */
  imageCredit: ImageCredit | null;
  /** The colour the cover ends in, carried into the card body. */
  imageEdge: CoverEdge | null;
  /** This learner's progress. "not-started" for labs they cannot open yet. */
  progress: "not-started" | "in-progress" | "completed";
  totalSteps: number;
  completedSteps: number;
  percent: number;
  nextStep: string | null;
  minutesLeft: number;
  /** Authored time for the whole tutorial, in minutes. */
  minutesTotal: number;
  /** Set for a lab drawn with its showcase design. */
  showcase: CardShowcase | null;
  /** ACTIVE (open now), UPCOMING (announced) or MAINTENANCE (temporarily down). */
  status: string;
  /** Pre-formatted launch date for upcoming labs; null when none is set. */
  launchLabel: string | null;
  /** What's inside the lab, revealed on hover. Active labs only. */
  preview?: LabPreview | null;
};

/*
  Difficulty chips. Token `-ink` colours, not raw palette classes: a fixed
  `text-[color:var(--color-warning-ink)]` does not flip with the theme, and on the light catalogue it
  measured 2.00:1 as 12px text against a 4.5 minimum. The fill and border stay
  on the untuned tokens, which only have to clear 3:1 as non-text.
*/
const difficultyColor: Record<string, string> = {
  Beginner:
    "text-[color:var(--color-success-ink)] bg-[color:color-mix(in_oklch,var(--color-success)_10%,transparent)] border-[color:color-mix(in_oklch,var(--color-success)_25%,transparent)]",
  Intermediate:
    "text-[color:var(--color-warning-ink)] bg-[color:color-mix(in_oklch,var(--color-warning)_10%,transparent)] border-[color:color-mix(in_oklch,var(--color-warning)_25%,transparent)]",
  Advanced:
    "text-[color:var(--color-destructive-ink)] bg-[color:color-mix(in_oklch,var(--color-destructive)_10%,transparent)] border-[color:color-mix(in_oklch,var(--color-destructive)_25%,transparent)]",
};

export default function LabCatalogClient({
  labs,
  isAdmin,
  publicMode = false,
  signedIn = false,
  initialQuery = "",
  myRequests = [],
}: {
  labs: CatalogLab[];
  isAdmin: boolean;
  publicMode?: boolean;
  /** Whether the visitor has a session — Explore is reachable both ways. */
  signedIn?: boolean;
  /** Seeds the search box, so the header search can deep-link filtered results. */
  initialQuery?: string;
  /** The signed-in learner's own custom lab requests. Empty in public mode. */
  myRequests?: MyLabRequest[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [subject, setSubject] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  /* Progress filter. Only meaningful where the learner owns the labs, so it is
     rendered on My Labs and not on the public Explore page. */
  const [progress, setProgress] = useState<"All" | "in-progress" | "not-started" | "completed">(
    "All",
  );

  const subjects = useMemo(
    () => ["All", ...Array.from(new Set(labs.map((l) => l.subject))).sort()],
    [labs]
  );
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  /** Search + subject + level. Ownership is applied separately, since it only
      constrains the labs that are already live. */
  const matchesFilters = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (l: CatalogLab) => {
      if (subject !== "All" && l.subject !== subject) return false;
      if (difficulty !== "All" && l.difficulty !== difficulty) return false;
      if (q && !(`${l.title} ${l.synopsis} ${l.keySkills.join(" ")}`.toLowerCase().includes(q)))
        return false;
      if (!publicMode && progress !== "All" && l.progress !== progress) return false;
      return true;
    };
  }, [query, subject, difficulty, progress, publicMode]);

  const filtered = useMemo(
    () =>
      labs.filter((l) => {
        if (l.status !== "ACTIVE") return false;
        // On the 'My Labs' dashboard a non-admin only sees the labs they own.
        if (!publicMode && !isAdmin && !l.owned) return false;
        return matchesFilters(l);
      }),
    [labs, matchesFilters, publicMode, isAdmin]
  );

  /** Announced but not yet open — shown to everyone, owned or not. */
  const upcoming = useMemo(
    () => labs.filter((l) => l.status === "UPCOMING" && matchesFilters(l)),
    [labs, matchesFilters]
  );

  /** Temporarily down. Only Explore loads these; "My Labs" never receives them. */
  const maintenance = useMemo(
    () => labs.filter((l) => l.status === "MAINTENANCE" && matchesFilters(l)),
    [labs, matchesFilters]
  );

  const activeCount = labs.filter((l) => l.status === "ACTIVE").length;
  const ownedCount = labs.filter((l) => l.owned && l.status === "ACTIVE").length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {publicMode ? "Explore Labs" : "My Labs"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {publicMode && signedIn ? (
              <>{activeCount} premium workshop labs. You own <span className="text-primary font-medium">{ownedCount}</span> — open {ownedCount === 1 ? 'it' : 'them'} from <Link href="/dashboard/labs" className="text-primary font-medium hover:underline cursor-pointer">My Labs</Link>.</>
            ) : publicMode ? (
              <>{activeCount} premium workshop labs. Browse everything free — <Link href="/login" className="text-primary font-medium hover:underline cursor-pointer">sign in</Link> to open a lab and unlock its resources.</>
            ) : isAdmin ? (
              <span className="text-primary font-medium">Admin — full access to all {activeCount} labs.</span>
            ) : (
              <>
                You own <span className="text-primary font-medium">{ownedCount}</span> {ownedCount === 1 ? 'lab' : 'labs'}.
              </>
            )}
          </p>
        </div>
        {!publicMode && (
          <Link href="/labs" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6 py-2 shrink-0 group">
            Explore more labs
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search labs, skills…"
            className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All subjects" : s}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {difficulties.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All levels" : d}
            </option>
          ))}
        </select>
      </div>

      {/* Progress filter. Counts are shown on the chip so an empty result is
          predictable before it is clicked. */}
      {!publicMode && (
        <div className="mb-5 flex flex-wrap gap-2">
          {(
            [
              ["All", "All"],
              ["in-progress", "In progress"],
              ["not-started", "Not started"],
              ["completed", "Completed"],
            ] as const
          ).map(([value, label]) => {
            const count =
              value === "All"
                ? labs.filter((l) => l.status === "ACTIVE" && (isAdmin || l.owned)).length
                : labs.filter(
                    (l) => l.status === "ACTIVE" && (isAdmin || l.owned) && l.progress === value,
                  ).length;
            const active = progress === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setProgress(value)}
                aria-pressed={active}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-accent"
                }`}
              >
                {label}
                <span className={active ? "opacity-80" : "text-muted-foreground"}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* On Explore the grid is one of three status sections, so it gets a name
          of its own. "My Labs" keeps the plain count it always had. */}
      {publicMode ? (
        <div className="mb-4 flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-[color:var(--color-success-ink)]" />
          <h2 className="text-xl font-bold tracking-tight">Active labs</h2>
          <span className="pill text-[color:var(--color-success-ink)]">{filtered.length}</span>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filtered.length} {filtered.length === 1 ? 'lab' : 'labs'}
        </p>
      )}

      {/*
          Grid. The card is `@/components/learner-lab-card`, shared with the
          dashboard, so both surfaces show the same statuses, the same progress
          bar and the same two action names.

          The hover-reveal panel that used to sit over each card is gone: the
          card now carries a screenshot, and an overlay covering it defeats the
          point of having one. What the reveal was for — how many steps, how
          long, how long the demo runs — is on the card itself, as progress for
          a lab the learner owns and as a plain meta line for one they do not.
      */}
      <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((lab) => (
          <LearnerLabCard
            key={lab.id}
            lab={{ ...lab, status: lab.progress }}
            locked={!lab.owned}
            meta={
              lab.preview
                ? [
                    `${lab.preview.stepCount} steps`,
                    `~${lab.preview.minutes} min`,
                    lab.preview.videoLabel ? `${lab.preview.videoLabel} demo` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : null
            }
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
          <p className="font-medium">No labs match these filters</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {progress !== "All"
              ? `Nothing is marked "${progress === "in-progress" ? "In progress" : progress === "completed" ? "Completed" : "Not started"}" yet.`
              : "Try a different subject or level, or clear the search."}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSubject("All");
              setDifficulty("All");
              setProgress("All");
            }}
            className="mt-4 inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Coming soon. Admins schedule these from Lab Management; they are
          visible to everyone but can't be opened or bought yet. */}
      {upcoming.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-[color:var(--color-info-ink)]" />
            <h2 className="text-xl font-bold tracking-tight">Upcoming labs</h2>
            <span className="pill text-[color:var(--color-info-ink)]">{upcoming.length}</span>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            In the works — announced here before they open.
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((lab) => (
              <div
                key={lab.id}
                className="hairline-top flex flex-col overflow-hidden rounded-2xl border border-dashed border-border bg-card/60"
              >
                <div className="flex-1 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <FlaskConical className="h-3.5 w-3.5" />
                      {lab.subject}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--color-info-ink)]">
                      <CalendarClock className="h-3.5 w-3.5" /> Coming soon
                    </span>
                  </div>
                  <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug">{lab.title}</h3>
                  <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{lab.synopsis}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {lab.keySkills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border px-5 py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      difficultyColor[lab.difficulty] ?? "text-muted-foreground border-border"
                    }`}
                  >
                    {lab.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lab.launchLabel ? `Expected ${lab.launchLabel}` : "Date to be announced"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Temporarily unavailable. Same treatment as upcoming — visible, but not
          openable or buyable while the status holds. */}
      {maintenance.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[color:var(--color-warning-ink)]" />
            <h2 className="text-xl font-bold tracking-tight">Under maintenance</h2>
            <span className="pill text-[color:var(--color-warning-ink)]">{maintenance.length}</span>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Temporarily offline while we work on them — back shortly.
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {maintenance.map((lab) => (
              <div
                key={lab.id}
                className="hairline-top flex flex-col overflow-hidden rounded-2xl border border-dashed border-border bg-card/60"
              >
                <div className="flex-1 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <FlaskConical className="h-3.5 w-3.5" />
                      {lab.subject}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--color-warning-ink)]">
                      <Wrench className="h-3.5 w-3.5" /> Maintenance
                    </span>
                  </div>
                  <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug">{lab.title}</h3>
                  <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{lab.synopsis}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {lab.keySkills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border px-5 py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      difficultyColor[lab.difficulty] ?? "text-muted-foreground border-border"
                    }`}
                  >
                    {lab.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground">Temporarily unavailable</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Explore is reachable while signed in, so the request form works there
          too — only a true anonymous visitor gets pointed at sign-in. */}
      <CustomLabRequestPanel publicMode={publicMode && !signedIn} initialRequests={myRequests} />
    </div>
  );
}

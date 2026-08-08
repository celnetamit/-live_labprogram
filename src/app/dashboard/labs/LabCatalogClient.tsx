"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Lock, CheckCircle2, Award, ArrowRight, FlaskConical, CalendarClock, Wrench, ListChecks, Clapperboard, Clock } from "lucide-react";
import { formatPrice } from "@/lib/access";
import type { LabPreview } from "@/lib/labPreview";
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
  priceMinor: number;
  currency: string;
  owned: boolean;
  /** ACTIVE (open now), UPCOMING (announced) or MAINTENANCE (temporarily down). */
  status: string;
  /** Pre-formatted launch date for upcoming labs; null when none is set. */
  launchLabel: string | null;
  /** What's inside the lab, revealed on hover. Active labs only. */
  preview?: LabPreview | null;
};

const difficultyColor: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Advanced: "text-rose-400 bg-rose-500/10 border-rose-500/20",
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
      return true;
    };
  }, [query, subject, difficulty]);

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
      <div className="glass rounded-xl p-3 sm:p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search labs, skills…"
            className="h-10 w-full rounded-lg border border-input bg-background/50 pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          className="h-10 rounded-lg border border-input bg-background/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {difficulties.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All levels" : d}
            </option>
          ))}
        </select>
      </div>

      {/* On Explore the grid is one of three status sections, so it gets a name
          of its own. "My Labs" keeps the plain count it always had. */}
      {publicMode ? (
        <div className="mb-4 flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-emerald-400" />
          <h2 className="text-xl font-bold tracking-tight">Active labs</h2>
          <span className="pill text-emerald-400">{filtered.length}</span>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filtered.length} {filtered.length === 1 ? 'lab' : 'labs'}
        </p>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((lab) => (
          <Link
            key={lab.id}
            href={`/dashboard/labs/${lab.slug}`}
            className="card-glow hairline-top group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden"
          >
            {/*
              What's actually inside the lab, revealed on hover (and on keyboard
              focus, so it isn't mouse-only). Built from the authored guide, so
              it shows the real tutorial rather than a second lot of blurb.
            */}
            {lab.preview && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10 flex flex-col gap-3 overflow-hidden bg-card/97 p-5 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <ListChecks className="h-3.5 w-3.5" />
                  Inside this lab
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <ListChecks className="h-3 w-3" /> {lab.preview.stepCount} steps
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> ~{lab.preview.minutes} min
                  </span>
                  {lab.preview.videoLabel && (
                    <span className="inline-flex items-center gap-1">
                      <Clapperboard className="h-3 w-3" /> {lab.preview.videoLabel} demo
                    </span>
                  )}
                </div>

                {/* The card already shows the synopsis, so the reveal spends its
                    space on what the synopsis can't say: the actual outcomes and
                    the opening moves of the tutorial. */}
                <div className="min-h-0 flex-1 overflow-hidden">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                    You&apos;ll be able to
                  </p>
                  <ul className="mb-2 space-y-0.5">
                    {lab.preview.outcomes.map((o) => (
                      <li key={o} className="flex gap-1.5 text-xs leading-tight text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                        <span className="line-clamp-1">{o}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                    Starts with
                  </p>
                  <ol className="space-y-0.5">
                    {lab.preview.steps.map((s, i) => (
                      <li key={s} className="flex gap-1.5 text-xs leading-tight text-muted-foreground">
                        <span className="shrink-0 tabular-nums text-primary">{i + 1}.</span>
                        <span className="line-clamp-1">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  {lab.owned ? "Open the lab" : "See the full tutorial"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            )}

            <div className="p-5 flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  <FlaskConical className="w-3.5 h-3.5" />
                  {lab.subject}
                </span>
                {lab.owned ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Owned
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Lock className="w-3.5 h-3.5" /> Locked
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {lab.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{lab.synopsis}</p>
              <div className="flex flex-wrap gap-1.5">
                {lab.keySkills.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-5 py-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    difficultyColor[lab.difficulty] ?? "text-muted-foreground border-border"
                  }`}
                >
                  {lab.difficulty}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Award className="w-3.5 h-3.5" /> {lab.points} pts
                </span>
              </div>
              {lab.owned ? (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Open <ArrowRight className="w-4 h-4" />
                </span>
              ) : (
                <span className="text-sm font-bold text-foreground">
                  {formatPrice(lab.priceMinor, lab.currency)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          No labs match your filters.
        </div>
      )}

      {/* Coming soon. Admins schedule these from Lab Management; they are
          visible to everyone but can't be opened or bought yet. */}
      {upcoming.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-sky-400" />
            <h2 className="text-xl font-bold tracking-tight">Upcoming labs</h2>
            <span className="pill text-sky-400">{upcoming.length}</span>
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
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-400">
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
            <Wrench className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight">Under maintenance</h2>
            <span className="pill text-amber-400">{maintenance.length}</span>
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
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400">
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

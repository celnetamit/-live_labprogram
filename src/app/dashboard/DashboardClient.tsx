"use client";

import { useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, ExternalLink, Play, Wifi, WifiOff } from "lucide-react";
import LearnerLabCard, { ProgressBar, type LearnerCardLab } from "@/components/learner-lab-card";

export type ActivityItem = {
  kind: "launch" | "progress" | "completed";
  slug: string;
  title: string;
  /** ISO timestamp. Formatted on the client so it lands in the viewer's zone. */
  at: string;
  detail: string | null;
};

export type Suggestion = {
  slug: string;
  title: string;
  subject: string;
  difficulty: string;
  image: string;
  matchesSubject: boolean;
};

type DashboardLab = LearnerCardLab & { sourceUrl: string | null; lastActiveAt: string | null };

/**
 * The learner's home.
 *
 * Deliberately plain: subtle borders, small shadows, one accent colour. The
 * review this rewrite answers asked for something that looks designed by a
 * person rather than generated — so no gradient tiles, no glass, no decorative
 * sparkle, and the only large graphics are real screenshots of the labs.
 *
 * Nothing here is invented. Progress comes from the account's `LabProgress`
 * rows, activity from real launches and real progress writes. There is no
 * points figure, because nothing in the platform awards points; no certificate
 * count, because nothing issues one; and no mentor panel, because there is no
 * mentor record to drive it. An empty section is honest — a filled one built
 * from placeholders is not.
 */

/*
 * The clock and the connection are both external stores, so they are read with
 * `useSyncExternalStore` rather than an effect that calls setState on mount.
 * That keeps the server render and hydration consistent — neither value exists
 * on the server — and avoids the cascading re-render an effect would cause.
 *
 * The snapshot is a number, not a Date, because `useSyncExternalStore` compares
 * snapshots by identity: a fresh Date every read would never compare equal and
 * would re-render forever.
 */
let clockNow = 0;
const clockListeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | null = null;

function clockSubscribe(onChange: () => void): () => void {
  clockListeners.add(onChange);
  clockNow = Date.now();
  if (!clockTimer) {
    // Every 30s: the display has no seconds, so a per-second tick would
    // re-render the page for nothing.
    clockTimer = setInterval(() => {
      clockNow = Date.now();
      clockListeners.forEach((l) => l());
    }, 30_000);
  }
  return () => {
    clockListeners.delete(onChange);
    if (clockListeners.size === 0 && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  };
}

/** Local time, or null before mount — the server has no clock for this viewer. */
function useLocalTime(): Date | null {
  const ms = useSyncExternalStore(
    clockSubscribe,
    useCallback(() => clockNow, []),
    useCallback(() => 0, []),
  );
  return ms ? new Date(ms) : null;
}

function onlineSubscribe(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function useOnline(): boolean {
  return useSyncExternalStore(
    onlineSubscribe,
    useCallback(() => navigator.onLine, []),
    // Assumed online on the server, so the first paint never accuses a working
    // connection of being down.
    useCallback(() => true, []),
  );
}

function greet(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function relativeTime(iso: string, now: Date | null): string {
  if (!now) return "";
  const diff = now.getTime() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

const ACTIVITY_VERB: Record<ActivityItem["kind"], string> = {
  launch: "Opened",
  progress: "Worked through",
  completed: "Finished",
};

function SectionHeading({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export default function DashboardClient({
  userName,
  isAdmin,
  labs,
  catalogSize,
  upcomingCount,
  activity,
  suggestions,
  weekly,
}: {
  userName: string;
  isAdmin: boolean;
  labs: DashboardLab[];
  catalogSize: number;
  upcomingCount: number;
  activity: ActivityItem[];
  suggestions: Suggestion[];
  /** Counted from the launch log over the last seven days. */
  weekly: { activeDays: number; labsOpened: number };
}) {
  const now = useLocalTime();
  const online = useOnline();

  const inProgress = labs.filter((l) => l.status === "in-progress");
  const completed = labs.filter((l) => l.status === "completed");

  /*
    What to continue: the lab worked on most recently that is not finished. Falls
    back to an untouched lab so a learner who has enrolled but never started
    still gets a single obvious action instead of an empty panel.
  */
  const resume =
    [...inProgress].sort((a, b) => (b.lastActiveAt ?? "").localeCompare(a.lastActiveAt ?? ""))[0] ??
    labs.find((l) => l.status === "not-started") ??
    null;

  const stats = [
    { label: isAdmin ? "Labs available" : "Enrolled labs", value: labs.length },
    { label: "In progress", value: inProgress.length },
    { label: "Completed", value: completed.length },
  ];

  return (
    <div className="mx-auto max-w-6xl pb-12">
      {/* Header: greeting, date and local time, connection. Kept to one row so
          the first lab card is visible without scrolling on a laptop. */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {now ? `${greet(now.getHours())}, ${userName}` : `Welcome back, ${userName}`}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isAdmin
              ? "Admin access — every lab in the catalogue is open to you."
              : labs.length > 0
                ? "Pick up where you left off."
                : "Your labs will appear here once you have access to one."}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {/* `suppressHydrationWarning`: the server cannot know the viewer's zone,
              so this text legitimately differs between the two renders. */}
          <span suppressHydrationWarning>
            {now
              ? now.toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                }) +
                " · " +
                now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
              : " "}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 ${online ? "" : "text-[color:var(--color-warning)]"}`}
            title={online ? "Connected" : "You are offline — progress is saved on this device"}
          >
            {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="hidden sm:inline">{online ? "Online" : "Offline"}</span>
          </span>
        </div>
      </header>

      {!online && (
        <p className="mb-5 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
          You are offline. Steps you tick are kept on this device and sync when the connection
          returns; labs themselves need a connection to open.
        </p>
      )}

      {/* Continue learning — the one action the dashboard exists to offer. */}
      {resume && (
        <section className="mb-8">
          <SectionHeading title="Continue learning" />
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col sm:flex-row">
              <Link
                href={`/dashboard/labs/${resume.slug}`}
                className="relative block shrink-0 bg-muted sm:w-64"
              >
                {resume.image ? (
                  /* Sized for the two layouts this panel has: full width stacked
                     on a phone, a 16rem column from `sm` up. */
                  <Image
                    src={resume.image}
                    alt={`${resume.title} screenshot`}
                    width={640}
                    height={360}
                    priority
                    sizes="(max-width: 640px) 100vw, 256px"
                    className="h-40 w-full object-cover sm:h-full"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center sm:h-full">
                    <span className="text-4xl font-semibold text-muted-foreground">
                      {resume.title.charAt(0)}
                    </span>
                  </div>
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {resume.subject}
                </span>
                <h3 className="mt-0.5 truncate text-lg font-semibold">{resume.title}</h3>

                {resume.nextStep ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Next up:{" "}
                    <span className="text-foreground">{resume.nextStep}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Every step is ticked off — reopen it whenever you want to go back over it.
                  </p>
                )}

                {resume.totalSteps > 0 && (
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {resume.completedSteps} of {resume.totalSteps} steps · {resume.percent}%
                      </span>
                      {resume.minutesLeft > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.floor(resume.minutesLeft / 60) > 0
                            ? `${Math.floor(resume.minutesLeft / 60)} h ${resume.minutesLeft % 60} min left`
                            : `${resume.minutesLeft} min left`}
                        </span>
                      )}
                    </div>
                    <ProgressBar percent={resume.percent} />
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/labs/${resume.slug}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Play className="h-4 w-4" />
                    {resume.status === "not-started" ? "Start lab" : "Resume lab"}
                  </Link>
                  {resume.sourceUrl && (
                    <a
                      href={`/api/labs/${resume.slug}/launch`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      Open the lab <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {resume.lastActiveAt && (
                    <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                      Last worked on {relativeTime(resume.lastActiveAt, now)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Counts, named for what they are. There is no points figure: nothing in
          the platform awards points, so "Points unlocked" measured nothing. */}
      <section className="mb-8">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="text-2xl font-semibold tabular-nums">{s.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
        {/*
            This week, stated as a fact rather than a target. The review asked
            for a weekly goal or a streak but warned against turning the work
            into a game — a streak rewards opening a lab daily, which is not the
            same as learning anything, so this counts days and stops there.
        */}
        {weekly.labsOpened > 0 && (
          <p className="mt-2.5 text-xs text-muted-foreground">
            This week: opened {weekly.labsOpened} {weekly.labsOpened === 1 ? "lab" : "labs"} across{" "}
            {weekly.activeDays} {weekly.activeDays === 1 ? "day" : "days"}.
          </p>
        )}
      </section>

      {/* Labs */}
      <section className="mb-8">
        <SectionHeading
          title={isAdmin ? "All labs" : "Your labs"}
          href="/dashboard/labs"
          linkLabel="View all"
        />
        {labs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
            <h3 className="font-semibold">No labs yet</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {catalogSize} labs are open to browse right now
              {upcomingCount > 0 ? `, with ${upcomingCount} more announced` : ""}. Every lab&apos;s
              overview, demo and step titles are free to read before you decide.
            </p>
            <Link
              href="/dashboard/labs"
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Browse labs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {labs.slice(0, 6).map((lab) => (
              <LearnerLabCard key={lab.slug} lab={lab} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent activity — real launches and real progress writes, nothing else. */}
        <section>
          <SectionHeading title="Recent activity" />
          {activity.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
              Nothing yet. Opening a lab or ticking off a tutorial step will show up here.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {activity.map((a) => (
                <li key={`${a.kind}-${a.slug}-${a.at}`}>
                  <Link
                    href={`/dashboard/labs/${a.slug}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm">
                        <span className="text-muted-foreground">{ACTIVITY_VERB[a.kind]} </span>
                        <span className="font-medium">{a.title}</span>
                      </span>
                      {a.detail && (
                        <span className="block text-xs text-muted-foreground">{a.detail}</span>
                      )}
                    </span>
                    <span
                      className="shrink-0 text-xs text-muted-foreground"
                      suppressHydrationWarning
                    >
                      {relativeTime(a.at, now)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recommended — a stated rule, not a model, so it says why. */}
        {suggestions.length > 0 && (
          <section>
            <SectionHeading title="Recommended for you" href="/dashboard/labs" linkLabel="See all" />
            <ul className="space-y-3">
              {suggestions.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/dashboard/labs/${s.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 shadow-sm transition-colors hover:border-foreground/20"
                  >
                    <Image
                      src={s.image}
                      alt=""
                      width={128}
                      height={96}
                      sizes="64px"
                      className="h-12 w-16 shrink-0 rounded-md object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{s.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {s.matchesSubject ? `More ${s.subject}` : s.subject} · {s.difficulty}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

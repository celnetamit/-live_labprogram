"use client";

import { useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  FlaskConical,
  History,
  ListChecks,
  Play,
  WifiOff,
} from "lucide-react";
import LearnerLabCard, { ProgressBar, type LearnerCardLab } from "@/components/learner-lab-card";
import { IconTile, LearnerPage, PageHeader, SectionTitle, StatTile } from "@/components/learner-page";
import { wordmark } from "@/components/showcase-wordmark";
import { showcaseVars } from "@/lib/showcase";

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
 * Drawn in the learner section's shared design (`components/learner-page`):
 * the backdrop and display-face header, rounded panels, and figures with an
 * icon each. The only large graphics are the labs' own cover pictures.
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

const ACTIVITY_ICON: Record<ActivityItem["kind"], typeof Play> = {
  launch: Play,
  progress: ListChecks,
  completed: CheckCircle2,
};

const ACTIVITY_TONE: Record<ActivityItem["kind"], "primary" | "info" | "success"> = {
  launch: "primary",
  progress: "info",
  completed: "success",
};

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
    { label: isAdmin ? "Labs available" : "Enrolled labs", value: labs.length, icon: FlaskConical, tone: "primary" as const },
    { label: "In progress", value: inProgress.length, icon: Clock, tone: "warning" as const },
    { label: "Completed", value: completed.length, icon: CheckCircle2, tone: "success" as const },
  ];

  const dateLine = now
    ? now.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) +
      " · " +
      now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <LearnerPage>
      <div className="mx-auto max-w-6xl pb-12">
        {/* Header on the section's backdrop. The chip carries the date, the
            local time and the connection — facts about this viewer, read on
            the client, which is why it is blank for one frame. */}
        <PageHeader
          eyebrowTone={online ? "live" : "warn"}
          eyebrow={
            <span suppressHydrationWarning>
              {online ? "Online" : "Offline"}
              {dateLine ? ` · ${dateLine}` : ""}
            </span>
          }
          title={now ? `${greet(now.getHours())}, ${userName}` : `Welcome back, ${userName}`}
          subtitle={
            isAdmin
              ? "Admin access — every lab in the catalogue is open to you."
              : labs.length > 0
                ? "Pick up where you left off."
                : "Your labs will appear here once you have access to one."
          }
          aside={
            <Link href="/labs" className="ui-btn ui-btn-primary focus-ring">
              Explore labs <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        {!online && (
          <p className="ui-note ui-tone-warning mb-6">
            <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-warning-ink)]" />
            You are offline. Steps you tick are kept on this device and sync when the connection
            returns; labs themselves need a connection to open.
          </p>
        )}

        {/* Continue learning — the one action the dashboard exists to offer.
            Drawn in the lab's own colours, as its catalogue card is. */}
        {resume && (
          <section className="mb-8">
            <SectionTitle icon={Play} title="Continue learning" />
            <div
              className="ui-card ui-resume overflow-hidden"
              style={resume.showcase ? showcaseVars(resume.showcase) : undefined}
            >
              <div className="grid sm:grid-cols-[minmax(0,340px)_1fr]">
                <Link
                  href={`/dashboard/labs/${resume.slug}`}
                  tabIndex={-1}
                  aria-hidden
                  className="ui-resume-photo relative block min-h-[190px] bg-muted"
                >
                  {resume.image ? (
                    <Image
                      src={resume.image}
                      alt=""
                      fill
                      loading="eager"
                      sizes="(max-width: 640px) 100vw, 340px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-4xl font-semibold text-muted-foreground">
                      {resume.title.charAt(0)}
                    </span>
                  )}
                </Link>

                <div className="flex min-w-0 flex-col p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {resume.subject} · {resume.difficulty}
                  </p>
                  <h3 className="ui-resume-title mt-1.5">
                    <Link href={`/dashboard/labs/${resume.slug}`} className="focus-ring rounded-sm">
                      {resume.showcase ? wordmark(resume.showcase, resume.title, "sc-card-title") : resume.title}
                    </Link>
                  </h3>

                  {resume.nextStep ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Next up: <span className="font-medium text-foreground">{resume.nextStep}</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Every step is ticked off — reopen it whenever you want to go back over it.
                    </p>
                  )}

                  {resume.totalSteps > 0 && (
                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          <span className="font-semibold text-foreground">
                            {resume.completedSteps} of {resume.totalSteps}
                          </span>{" "}
                          steps · {resume.percent}%
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
                      <ProgressBar percent={resume.percent} className="h-2" />
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-5">
                    <Link
                      href={`/dashboard/labs/${resume.slug}`}
                      className={`${resume.showcase ? "sc-card-primary" : "ui-btn ui-btn-primary"} focus-ring`}
                    >
                      <Play className="h-4 w-4" />
                      {resume.status === "not-started" ? "Start lab" : "Resume lab"}
                    </Link>
                    {resume.sourceUrl && (
                      <a
                        href={`/api/labs/${resume.slug}/launch`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ui-btn ui-btn-ghost focus-ring"
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
        <section className="mb-9">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {stats.map((s) => (
              <StatTile key={s.label} icon={s.icon} tone={s.tone} value={s.value} label={s.label} />
            ))}
          </div>
          {/*
              This week, stated as a fact rather than a target. The review asked
              for a weekly goal or a streak but warned against turning the work
              into a game — a streak rewards opening a lab daily, which is not the
              same as learning anything, so this counts days and stops there.
          */}
          {weekly.labsOpened > 0 && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              This week: opened {weekly.labsOpened} {weekly.labsOpened === 1 ? "lab" : "labs"} across{" "}
              {weekly.activeDays} {weekly.activeDays === 1 ? "day" : "days"}.
            </p>
          )}
        </section>

        {/* Labs */}
        <section className="mb-9">
          <SectionTitle
            icon={FlaskConical}
            title={isAdmin ? "All labs" : "Your labs"}
            count={labs.length}
            href="/dashboard/labs"
            linkLabel="View all"
          />
          {labs.length === 0 ? (
            <div className="ui-card flex flex-col items-center px-6 py-12 text-center">
              <IconTile icon={FlaskConical} />
              <h3 className="ui-h2 mt-4 text-lg">No labs yet</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                {catalogSize} labs are open to browse right now
                {upcomingCount > 0 ? `, with ${upcomingCount} more announced` : ""}. Every lab&apos;s
                overview, demo and step titles are free to read before you decide.
              </p>
              <Link href="/dashboard/labs" className="ui-btn ui-btn-primary focus-ring mt-5">
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
            <SectionTitle icon={History} tone="info" title="Recent activity" />
            {activity.length === 0 ? (
              <p className="ui-card p-6 text-sm text-muted-foreground">
                Nothing yet. Opening a lab or ticking off a tutorial step will show up here.
              </p>
            ) : (
              <ul className="ui-card ui-divide overflow-hidden">
                {activity.map((a) => (
                  <li key={`${a.kind}-${a.slug}-${a.at}`}>
                    <Link
                      href={`/dashboard/labs/${a.slug}`}
                      className="ui-row flex items-center gap-3 px-4 py-3.5"
                    >
                      <IconTile icon={ACTIVITY_ICON[a.kind]} tone={ACTIVITY_TONE[a.kind]} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">
                          <span className="text-muted-foreground">{ACTIVITY_VERB[a.kind]} </span>
                          <span className="font-semibold">{a.title}</span>
                        </span>
                        {a.detail && (
                          <span className="block truncate text-xs text-muted-foreground">{a.detail}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground" suppressHydrationWarning>
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
              <SectionTitle
                icon={Compass}
                tone="success"
                title="Recommended for you"
                href="/dashboard/labs"
                linkLabel="See all"
              />
              <ul className="ui-card ui-divide overflow-hidden">
                {suggestions.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/dashboard/labs/${s.slug}`} className="ui-row flex items-center gap-3 p-3">
                      <Image
                        src={s.image}
                        alt=""
                        width={144}
                        height={96}
                        sizes="72px"
                        className="h-12 w-[72px] shrink-0 rounded-lg object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{s.title}</span>
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
    </LearnerPage>
  );
}

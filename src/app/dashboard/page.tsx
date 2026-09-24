import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EXPLORE_STATUSES } from "@/lib/labStatus";
import { buildLearnerLab, labImage, type LearnerLab } from "@/lib/learnerLabs";
import DashboardClient, { type ActivityItem, type Suggestion } from "./DashboardClient";

// Reads the session and this learner's own rows on every request.
export const dynamic = "force-dynamic";

/** Recent activity is a short list, not a log viewer. */
const ACTIVITY_LIMIT = 6;

/**
 * The start of the trailing seven-day window.
 *
 * In its own async function rather than inline in the component: reading the
 * clock is impure, and calling it directly in a render body is an error under
 * the React compiler lint even in a server component that legitimately needs a
 * per-request value.
 */
async function weekWindowStart(): Promise<Date> {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; name?: string; role?: string } | undefined;
  if (!user?.id) redirect("/login");
  const userId = user.id;

  const isAdmin = user.role === "SUPER_ADMIN";

  /*
    "This week" is counted from the authorisation log, which keeps every launch,
    rather than from progress rows, which keep only the last touch per lab and
    would silently undercount. Seven days back from now, not "since Monday", so
    the figure never resets to zero mid-session.
  */
  const weekStart = await weekWindowStart();

  const [allActive, accessRows, progressRows, launches, weekLaunches] = await Promise.all([
    prisma.lab.findMany({
      where: { enabled: true, status: "ACTIVE" },
      orderBy: [{ points: "desc" }, { name: "asc" }],
    }),
    prisma.labAccess.findMany({ where: { userId }, select: { labId: true } }),
    prisma.labProgress.findMany({ where: { userId } }),
    /*
      Launches are the one record of activity that exists whether or not the
      learner ticked anything, so the feed is built from them as well as from
      progress. SUCCESS only: a failed authorisation is an admin concern, not
      something to show a learner as their own history.
    */
    prisma.authorizationLog.findMany({
      where: { userId, status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: { labSlug: true, createdAt: true },
    }),
    prisma.authorizationLog.findMany({
      where: { userId, status: "SUCCESS", createdAt: { gte: weekStart } },
      select: { labSlug: true, createdAt: true },
    }),
  ]);

  /* Distinct calendar days, computed server-side in UTC. It is a count of days,
     not a streak: a streak would reward consecutive-day habit over actually
     finishing anything, which the review explicitly warned against. */
  const weekly = {
    activeDays: new Set(weekLaunches.map((l) => l.createdAt.toISOString().slice(0, 10))).size,
    labsOpened: new Set(weekLaunches.map((l) => l.labSlug).filter(Boolean)).size,
  };

  const ownedIds = new Set(accessRows.map((r) => r.labId));
  // An admin can open everything, so their dashboard treats the catalogue as enrolled.
  const enrolledRows = isAdmin ? allActive : allActive.filter((l) => ownedIds.has(l.id));

  const progressBySlug = new Map(progressRows.map((p) => [p.labSlug, p]));
  const labs: LearnerLab[] = enrolledRows.map((lab) =>
    buildLearnerLab(lab, progressBySlug.get(lab.slug ?? lab.id)),
  );

  const titleBySlug = new Map(allActive.map((l) => [l.slug ?? l.id, l.name]));

  /*
    One entry per lab rather than one per launch. Opening the same lab six times
    in an afternoon is normal and would otherwise crowd out everything else.
  */
  const lastLaunchBySlug = new Map<string, Date>();
  for (const l of launches) {
    if (!l.labSlug) continue;
    if (!lastLaunchBySlug.has(l.labSlug)) lastLaunchBySlug.set(l.labSlug, l.createdAt);
  }

  const activity: ActivityItem[] = [
    ...[...lastLaunchBySlug.entries()].map(([slug, at]) => ({
      kind: "launch" as const,
      slug,
      title: titleBySlug.get(slug) ?? slug,
      at: at.toISOString(),
      detail: null,
    })),
    ...progressRows.map((p) => ({
      kind: (p.completedAt ? "completed" : "progress") as ActivityItem["kind"],
      slug: p.labSlug,
      title: titleBySlug.get(p.labSlug) ?? p.labSlug,
      at: p.lastActiveAt.toISOString(),
      detail:
        p.totalSteps > 0 && !p.completedAt
          ? `${p.completedSteps.length} of ${p.totalSteps} steps`
          : null,
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, ACTIVITY_LIMIT);

  /*
    "Recommended for you" is a stated heuristic, not a model: labs this learner
    cannot already open, preferring subjects they have already bought into, then
    the catalogue's own ordering. The UI says which subject earned the slot, so
    the suggestion can be judged rather than just accepted.
  */
  const enrolledSubjects = new Set(labs.map((l) => l.subject));
  const suggestions: Suggestion[] = allActive
    .filter((l) => !isAdmin && !ownedIds.has(l.id))
    .map((lab) => {
      const slug = lab.slug ?? lab.id;
      const subject = lab.subject ?? "General";
      return {
        slug,
        title: lab.name,
        subject,
        difficulty: lab.difficulty ?? "Beginner",
        // Same source as the cards, so a cover photo is not missed here.
        image: labImage(slug, true) ?? `/demos/${slug}.jpg`,
        matchesSubject: enrolledSubjects.has(subject),
      };
    })
    .sort((a, b) => Number(b.matchesSubject) - Number(a.matchesSubject))
    .slice(0, 3);

  const upcomingCount = await prisma.lab.count({
    where: { enabled: true, status: { in: [...EXPLORE_STATUSES] }, NOT: { status: "ACTIVE" } },
  });

  return (
    <DashboardClient
      userName={user.name || "there"}
      isAdmin={isAdmin}
      labs={labs}
      catalogSize={allActive.length}
      upcomingCount={upcomingCount}
      activity={activity}
      suggestions={suggestions}
      weekly={weekly}
    />
  );
}

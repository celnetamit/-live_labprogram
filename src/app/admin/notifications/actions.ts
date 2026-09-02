"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * Admin notifications.
 *
 * The feed is *derived* from the underlying tables against a per-admin "last
 * opened" timestamp, rather than being written into a notifications table when
 * something happens. That choice is deliberate: a derived feed cannot drift
 * from reality. It cannot miss an event because a write failed, cannot show a
 * notification for a row that was since deleted, and needs no backfill for
 * anything that existed before it shipped.
 *
 * Two sources now — new signups from User, and new lab feedback from
 * LabFeedback — merged and sorted by time. Both are real rows with a
 * `createdAt`, which is what makes deriving them possible. If notifications
 * later need to cover something with no row of its own, this wants to become a
 * real table.
 *
 * One seen-timestamp covers both, so opening the tray clears everything in it.
 * Separate timestamps per kind would let one sit unread behind the other's
 * cleared badge, which is a worse failure than reading something twice.
 */

/** How many signups the tray lists, however many are unread. */
const FEED_LIMIT = 12;
/** Guard against a badge reading "1247" after a quiet month. */
const COUNT_CAP = 99;

export type NotificationKind = "SIGNUP" | "FEEDBACK";

export interface AdminNotification {
  id: string;
  kind: NotificationKind;
  name: string | null;
  email: string | null;
  createdAt: string;
  unread: boolean;
  /** Feedback only: the one-line preview and where to send the reader. */
  detail?: string;
  category?: string;
  labName?: string | null;
}

/** Kept as an alias so existing imports do not break. */
export type SignupNotification = AdminNotification;

export interface NotificationFeed {
  unreadCount: number;
  /** True when the real count exceeded the cap, so the UI can render "99+". */
  capped: boolean;
  items: AdminNotification[];
  /** Split of the unread total, so the tray can say what is actually new. */
  unreadSignups: number;
  unreadFeedback: number;
}

const EMPTY: NotificationFeed = {
  unreadCount: 0, capped: false, items: [], unreadSignups: 0, unreadFeedback: 0,
};

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== "SUPER_ADMIN") return null;
  return user as { id: string; role: string };
}

/**
 * Recent signups plus how many the current admin has not seen.
 *
 * Returns an empty feed rather than throwing for a non-admin: this is polled
 * from a header component, and an unhandled rejection every 60s is a worse
 * failure mode than showing nothing.
 */
export async function getSignupNotifications(): Promise<NotificationFeed> {
  const admin = await requireAdmin();
  if (!admin) return EMPTY;

  const me = await prisma.user.findUnique({
    where: { id: admin.id },
    select: { notificationsSeenAt: true },
  });
  if (!me) return EMPTY;

  const seenAt = me.notificationsSeenAt;

  const [unreadSignups, recentSignups, unreadFeedback, recentFeedback] = await Promise.all([
    prisma.user.count({
      where: { createdAt: { gt: seenAt }, id: { not: admin.id } },
    }),
    prisma.user.findMany({
      where: { id: { not: admin.id } },
      orderBy: { createdAt: "desc" },
      take: FEED_LIMIT,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.labFeedback.count({ where: { createdAt: { gt: seenAt } } }),
    prisma.labFeedback.findMany({
      orderBy: { createdAt: "desc" },
      take: FEED_LIMIT,
      select: {
        id: true, name: true, email: true, createdAt: true, message: true,
        category: true, lab: { select: { name: true } },
      },
    }),
  ]);

  const items: AdminNotification[] = [
    ...recentSignups.map((u) => ({
      id: `signup:${u.id}`,
      kind: "SIGNUP" as const,
      name: u.name,
      email: u.email,
      // Serialised: a Date crossing the server-action boundary arrives as a
      // string anyway, so being explicit keeps the client type honest.
      createdAt: u.createdAt.toISOString(),
      unread: u.createdAt > seenAt,
    })),
    ...recentFeedback.map((f) => ({
      id: `feedback:${f.id}`,
      kind: "FEEDBACK" as const,
      name: f.name,
      email: f.email,
      createdAt: f.createdAt.toISOString(),
      unread: f.createdAt > seenAt,
      /*
       * A preview rather than the whole message. The tray is a prompt to go and
       * read something, not the place to read it — and a four-thousand
       * character report would push everything else out of the panel.
       */
      detail: f.message.length > 110 ? `${f.message.slice(0, 110)}…` : f.message,
      category: f.category,
      labName: f.lab?.name ?? null,
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, FEED_LIMIT);

  const unreadCount = unreadSignups + unreadFeedback;

  return {
    unreadCount: Math.min(unreadCount, COUNT_CAP),
    capped: unreadCount > COUNT_CAP,
    items,
    unreadSignups,
    unreadFeedback,
  };
}

/**
 * Marks everything up to now as seen.
 *
 * Stamped server-side rather than from a client-supplied time — a clock-skewed
 * browser could otherwise mark future signups as already read.
 */
export async function markNotificationsSeen(): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  await prisma.user.update({
    where: { id: admin.id },
    data: { notificationsSeenAt: new Date() },
  });
}

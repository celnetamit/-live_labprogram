"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * Admin notifications.
 *
 * Signups are *derived* from the User table against a per-admin "last opened"
 * timestamp rather than being written into a notifications table at signup
 * time. That choice is deliberate: a derived feed cannot drift from reality. It
 * cannot miss an event because a write failed, cannot show a notification for a
 * user who was since deleted, and needs no backfill for the accounts that
 * already existed when this shipped.
 *
 * The trade-off is that it only answers questions the User table can answer. If
 * notifications later need to cover things with no row of their own, this wants
 * to become a real table.
 */

/** How many signups the tray lists, however many are unread. */
const FEED_LIMIT = 12;
/** Guard against a badge reading "1247" after a quiet month. */
const COUNT_CAP = 99;

export interface SignupNotification {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  unread: boolean;
}

export interface NotificationFeed {
  unreadCount: number;
  /** True when the real count exceeded the cap, so the UI can render "99+". */
  capped: boolean;
  items: SignupNotification[];
}

const EMPTY: NotificationFeed = { unreadCount: 0, capped: false, items: [] };

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

  const [unreadCount, recent] = await Promise.all([
    prisma.user.count({
      where: { createdAt: { gt: seenAt }, id: { not: admin.id } },
    }),
    prisma.user.findMany({
      where: { id: { not: admin.id } },
      orderBy: { createdAt: "desc" },
      take: FEED_LIMIT,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ]);

  return {
    unreadCount: Math.min(unreadCount, COUNT_CAP),
    capped: unreadCount > COUNT_CAP,
    items: recent.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      // Serialised: a Date crossing the server-action boundary arrives as a
      // string anyway, so being explicit keeps the client type honest.
      createdAt: u.createdAt.toISOString(),
      unread: u.createdAt > seenAt,
    })),
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

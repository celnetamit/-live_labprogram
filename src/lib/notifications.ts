import prisma from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

/**
 * Notification kinds and the single place that decides whether to send one.
 *
 * Every outbound product email should go through `notifyUser`, so a learner's
 * choice on the Notifications page is honoured no matter which part of the app
 * triggers the message.
 */

export type NotificationKind =
  | "accessDecisions"
  | "orderReceipts"
  | "labRequestUpdates"
  | "labLaunches"
  | "productNews";

/** Matches the column defaults; used when a user has never saved preferences. */
export const NOTIFICATION_DEFAULTS: Record<NotificationKind, boolean> = {
  accessDecisions: true,
  orderReceipts: true,
  labRequestUpdates: true,
  labLaunches: true,
  productNews: false,
};

export async function wantsNotification(
  userId: string,
  kind: NotificationKind
): Promise<boolean> {
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (!prefs) return NOTIFICATION_DEFAULTS[kind];
  return prefs[kind];
}

/**
 * Send a product email if the user opted in. Failures are swallowed on purpose:
 * a notification that cannot be delivered must never fail the action that
 * triggered it — approving lab access should still succeed if mail is down.
 */
export async function notifyUser(
  userId: string,
  kind: NotificationKind,
  message: { subject: string; html: string; text: string }
): Promise<void> {
  try {
    if (!(await wantsNotification(userId, kind))) return;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user?.email) return;

    await sendMail({ to: user.email, ...message });
  } catch (err) {
    console.error(`[notify] ${kind} failed for ${userId}:`, err);
  }
}

/** Plain wrapper so every notification email looks the same. */
export function simpleEmail(heading: string, body: string, cta?: { label: string; href: string }) {
  const text = `${heading}\n\n${body}\n${cta ? `\n${cta.label}: ${cta.href}\n` : ""}`;
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
      <h2 style="margin:0 0 16px">${heading}</h2>
      <p style="margin:0 0 20px;line-height:1.5">${body}</p>
      ${
        cta
          ? `<p style="margin:0 0 24px"><a href="${cta.href}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">${cta.label}</a></p>`
          : ""
      }
      <p style="margin:0;color:#666;font-size:13px">
        You can change which emails you receive in Account Settings → Notifications.
      </p>
    </div>`;
  return { subject: heading, html, text };
}

import { createHmac, randomBytes } from "node:crypto";
import prisma from "@/lib/prisma";

/**
 * Outbound webhooks.
 *
 * Each delivery carries an HMAC-SHA256 signature over the exact request body,
 * so a receiver can prove the call came from us and was not tampered with. The
 * timestamp is signed too, which lets receivers reject replayed deliveries.
 */

export const WEBHOOK_EVENTS = [
  "order.paid",
  "access.approved",
  "access.rejected",
  "lab.published",
  "user.registered",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export function newWebhookSecret(): string {
  return `whsec_${randomBytes(24).toString("hex")}`;
}

export function signPayload(secret: string, timestamp: number, body: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

export function parseEvents(value: string): string[] {
  try {
    const list = JSON.parse(value);
    return Array.isArray(list) ? list.map(String) : [];
  } catch {
    return [];
  }
}

/**
 * Deliver an event to every endpoint subscribed to it.
 *
 * Failures are recorded against the endpoint and swallowed: a webhook receiver
 * being down must never break the action that produced the event — a paid
 * order still has to be fulfilled.
 */
export async function dispatchWebhook(
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  let targets;
  try {
    targets = await prisma.webhook.findMany({ where: { enabled: true } });
  } catch (err) {
    console.error("[webhook] could not load endpoints:", err);
    return;
  }

  const subscribed = targets.filter((w) => parseEvents(w.events).includes(event));
  if (subscribed.length === 0) return;

  const timestamp = Math.floor(Date.now() / 1000);
  const body = JSON.stringify({ event, createdAt: new Date().toISOString(), data });

  await Promise.all(
    subscribed.map(async (hook) => {
      let status: number | null = null;
      let error: string | null = null;
      try {
        const res = await fetch(hook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Panoptical-Event": event,
            "X-Panoptical-Timestamp": String(timestamp),
            "X-Panoptical-Signature": `sha256=${signPayload(hook.secret, timestamp, body)}`,
          },
          body,
          signal: AbortSignal.timeout(8000),
        });
        status = res.status;
        if (!res.ok) error = `HTTP ${res.status}`;
      } catch (err) {
        error = err instanceof Error ? err.message : "delivery failed";
      }

      await prisma.webhook
        .update({
          where: { id: hook.id },
          data: { lastStatus: status, lastAttemptAt: new Date(), lastError: error },
        })
        .catch(() => {});
    })
  );
}

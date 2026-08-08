import prisma from "@/lib/prisma";
import { parseEvents, WEBHOOK_EVENTS } from "@/lib/webhooks";
import WebhooksClient from "./WebhooksClient";

export const dynamic = "force-dynamic";

export default async function AdminWebhookSettings() {
  const rows = await prisma.webhook.findMany({ orderBy: { createdAt: "desc" } });

  const hooks = rows.map((w) => ({
    id: w.id,
    url: w.url,
    secret: w.secret,
    events: parseEvents(w.events),
    enabled: w.enabled,
    lastStatus: w.lastStatus,
    lastAttemptAt: w.lastAttemptAt,
    lastError: w.lastError,
  }));

  return <WebhooksClient hooks={hooks} events={[...WEBHOOK_EVENTS]} />;
}

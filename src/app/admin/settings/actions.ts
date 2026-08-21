"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { clampSecurity, getSettings, saveSettings } from "@/lib/platformSettings";
import { generateApiKey } from "@/lib/apiKeys";
import { newWebhookSecret, parseEvents, signPayload, WEBHOOK_EVENTS } from "@/lib/webhooks";
import { sendMail } from "@/lib/mailer";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");
  return user;
}

function str(formData: FormData, name: string, limit: number): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim().slice(0, limit) : "";
}
function bool(formData: FormData, name: string): boolean {
  const v = formData.get(name);
  return v === "on" || v === "true";
}

/** Everything on the settings pages revalidates the whole admin area. */
function revalidateSettings() {
  revalidatePath("/admin/settings", "layout");
}

// ---------------------------------------------------------------- General

export async function saveGeneralSettings(formData: FormData) {
  const admin = await requireAdmin();

  const platformName = str(formData, "platformName", 80);
  const supportEmail = str(formData, "supportEmail", 120);
  if (platformName.length < 2) {
    return { success: false as const, message: "Platform name is required" };
  }
  if (!supportEmail.includes("@")) {
    return { success: false as const, message: "Enter a valid support email address" };
  }

  await saveSettings(
    {
      platformName,
      supportEmail,
      allowPublicRegistration: bool(formData, "allowPublicRegistration"),
      requireAdminApproval: bool(formData, "requireAdminApproval"),
      maintenanceMode: bool(formData, "maintenanceMode"),
      maintenanceMessage: str(formData, "maintenanceMessage", 300) || null,
    },
    admin.email
  );

  revalidateSettings();
  revalidatePath("/", "layout");
  return { success: true as const, message: "General settings saved." };
}

// --------------------------------------------------------------- Security

export async function saveSecuritySettings(formData: FormData) {
  const admin = await requireAdmin();

  const { minPasswordLength, sessionDays } = clampSecurity(
    Number(formData.get("minPasswordLength")),
    Number(formData.get("sessionDays"))
  );

  const allowSso = bool(formData, "allowSso");

  await saveSettings({ minPasswordLength, sessionDays, allowSso }, admin.email);

  revalidateSettings();
  return {
    success: true as const,
    message: `Saved. Minimum password ${minPasswordLength} characters, sessions last ${sessionDays} days.`,
  };
}

// ------------------------------------------------------------------ Email

export async function saveEmailSettings(formData: FormData) {
  const admin = await requireAdmin();

  const mailFromName = str(formData, "mailFromName", 80);
  const mailReplyTo = str(formData, "mailReplyTo", 120);
  if (mailReplyTo && !mailReplyTo.includes("@")) {
    return { success: false as const, message: "Enter a valid reply-to address" };
  }

  await saveSettings({ mailFromName: mailFromName || "Panoptical Labs", mailReplyTo: mailReplyTo || null }, admin.email);

  revalidateSettings();
  return { success: true as const, message: "Email settings saved." };
}

/** Prove the mail path end to end, rather than trusting the configuration. */
export async function sendTestEmail(to: string) {
  await requireAdmin();
  const settings = await getSettings();

  const address = to.trim();
  if (!address.includes("@")) {
    return { success: false as const, message: "Enter a valid address to test" };
  }

  const delivered = await sendMail({
    to: address,
    subject: `${settings.platformName} — test email`,
    text: `This is a test message from ${settings.platformName}. If you received it, outbound email is working.`,
    html: `<p>This is a test message from <strong>${settings.platformName}</strong>.</p><p>If you received it, outbound email is working.</p>`,
  });

  return delivered
    ? { success: true as const, message: `Sent to ${address}.` }
    : {
        success: false as const,
        message:
          "No email provider is configured (RESEND_API_KEY is unset), so the message was written to the server log instead.",
      };
}

// --------------------------------------------------------------- API keys

export async function createApiKey(name: string) {
  const admin = await requireAdmin();

  const label = name.trim().slice(0, 60);
  if (label.length < 2) return { success: false as const, message: "Give the key a name" };

  const { key, prefix, keyHash } = generateApiKey();
  await prisma.apiKey.create({
    data: { name: label, prefix, keyHash, createdBy: admin.email ?? null },
  });

  revalidateSettings();
  // The only time the full key is ever available.
  return { success: true as const, message: "Key created.", key };
}

export async function revokeApiKey(id: string) {
  await requireAdmin();
  await prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
  revalidateSettings();
  return { success: true as const, message: "Key revoked." };
}

export async function deleteApiKey(id: string) {
  await requireAdmin();
  await prisma.apiKey.delete({ where: { id } });
  revalidateSettings();
  return { success: true as const, message: "Key deleted." };
}

// --------------------------------------------------------------- Webhooks

export async function createWebhook(formData: FormData) {
  await requireAdmin();

  const url = str(formData, "url", 400);
  if (!/^https?:\/\/.+/i.test(url)) {
    return { success: false as const, message: "Enter a full URL starting with http:// or https://" };
  }

  const events = WEBHOOK_EVENTS.filter((e) => formData.get(`event:${e}`) === "on");
  if (events.length === 0) {
    return { success: false as const, message: "Choose at least one event to send" };
  }

  await prisma.webhook.create({
    data: { url, secret: newWebhookSecret(), events: JSON.stringify(events) },
  });

  revalidateSettings();
  return { success: true as const, message: "Endpoint added." };
}

export async function toggleWebhook(id: string, enabled: boolean) {
  await requireAdmin();
  await prisma.webhook.update({ where: { id }, data: { enabled } });
  revalidateSettings();
  return { success: true as const, message: enabled ? "Endpoint enabled." : "Endpoint paused." };
}

export async function deleteWebhook(id: string) {
  await requireAdmin();
  await prisma.webhook.delete({ where: { id } });
  revalidateSettings();
  return { success: true as const, message: "Endpoint removed." };
}

/** Fire a signed ping so an integrator can verify their signature check. */
export async function pingWebhook(id: string) {
  await requireAdmin();

  const hook = await prisma.webhook.findUnique({ where: { id } });
  if (!hook) return { success: false as const, message: "Endpoint not found" };

  const timestamp = Math.floor(Date.now() / 1000);
  const body = JSON.stringify({
    event: "ping",
    createdAt: new Date().toISOString(),
    data: { message: "Test delivery from Panoptical Labs" },
  });

  let status: number | null = null;
  let error: string | null = null;
  try {
    const res = await fetch(hook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Panoptical-Event": "ping",
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

  await prisma.webhook.update({
    where: { id },
    data: { lastStatus: status, lastAttemptAt: new Date(), lastError: error },
  });

  revalidateSettings();
  return error
    ? { success: false as const, message: `Ping failed: ${error}` }
    : { success: true as const, message: `Ping delivered (HTTP ${status}).` };
}

/** Re-export for the client component's checkbox list. */
export async function listWebhookEvents() {
  return [...WEBHOOK_EVENTS];
}

export async function webhookEventsOf(value: string) {
  return parseEvents(value);
}

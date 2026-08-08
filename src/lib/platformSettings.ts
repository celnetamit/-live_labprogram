import prisma from "@/lib/prisma";

/**
 * Platform-wide configuration, read from the single PlatformSetting row.
 *
 * Everything here is enforced at a specific place in the app; the comments on
 * each field in schema.prisma say where. Call `getSettings()` rather than
 * reading the table directly so the row is created on first use.
 */

export type PlatformSettings = {
  platformName: string;
  supportEmail: string;
  allowPublicRegistration: boolean;
  requireAdminApproval: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  minPasswordLength: number;
  sessionDays: number;
  allowSso: boolean;
  allowBiometrics: boolean;
  mailFromName: string;
  mailReplyTo: string | null;
};

const SINGLETON_ID = "singleton";

export const SETTING_DEFAULTS: PlatformSettings = {
  platformName: "Panoptical Labs Ecosystem",
  supportEmail: "support@panoptical.ai",
  allowPublicRegistration: true,
  requireAdminApproval: false,
  maintenanceMode: false,
  maintenanceMessage: null,
  minPasswordLength: 8,
  sessionDays: 30,
  allowSso: true,
  allowBiometrics: true,
  mailFromName: "Panoptical Labs",
  mailReplyTo: null,
};

/**
 * Current configuration. Falls back to the defaults if the table cannot be
 * reached — a settings lookup must never be the reason a page fails to render.
 */
export async function getSettings(): Promise<PlatformSettings> {
  try {
    const row = await prisma.platformSetting.upsert({
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID },
      update: {},
    });
    return {
      platformName: row.platformName,
      supportEmail: row.supportEmail,
      allowPublicRegistration: row.allowPublicRegistration,
      requireAdminApproval: row.requireAdminApproval,
      maintenanceMode: row.maintenanceMode,
      maintenanceMessage: row.maintenanceMessage,
      minPasswordLength: row.minPasswordLength,
      sessionDays: row.sessionDays,
      allowSso: row.allowSso,
      allowBiometrics: row.allowBiometrics,
      mailFromName: row.mailFromName,
      mailReplyTo: row.mailReplyTo,
    };
  } catch (err) {
    console.error("[settings] falling back to defaults:", err);
    return SETTING_DEFAULTS;
  }
}

export async function saveSettings(
  patch: Partial<PlatformSettings>,
  updatedBy?: string | null
): Promise<void> {
  await prisma.platformSetting.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...patch, updatedBy: updatedBy ?? null },
    update: { ...patch, updatedBy: updatedBy ?? null },
  });
}

/** Clamp admin input to values the app can actually honour. */
export function clampSecurity(minPasswordLength: number, sessionDays: number) {
  return {
    minPasswordLength: Math.min(64, Math.max(6, Math.round(minPasswordLength) || 8)),
    sessionDays: Math.min(365, Math.max(1, Math.round(sessionDays) || 30)),
  };
}

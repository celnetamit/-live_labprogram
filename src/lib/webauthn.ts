import prisma from "@/lib/prisma";

/**
 * WebAuthn ("passkey") configuration.
 *
 * The Relying Party ID must be the site's registered domain — a credential
 * created for `labs.example.com` cannot be used anywhere else, which is what
 * makes passkeys phishing-proof. It is derived from NEXTAUTH_URL so local,
 * staging and production each get the right value with no extra config.
 */

const FALLBACK_ORIGIN = "http://localhost:3000";

export function expectedOrigin(): string {
  return (process.env.NEXTAUTH_URL || FALLBACK_ORIGIN).replace(/\/$/, "");
}

export function rpID(): string {
  try {
    return new URL(expectedOrigin()).hostname;
  } catch {
    return "localhost";
  }
}

export const RP_NAME = "Panoptical Labs";

/** Challenges are short-lived; a passkey prompt that sits unanswered expires. */
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

export async function storeChallenge(
  challenge: string,
  owner: { userId?: string; email?: string }
): Promise<void> {
  await prisma.webAuthnChallenge.create({
    data: {
      challenge,
      userId: owner.userId ?? null,
      email: owner.email ?? null,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    },
  });
}

/**
 * Fetch and immediately consume a challenge. Deleting on read is what stops a
 * captured assertion from being replayed, so every caller must go through here.
 */
export async function consumeChallenge(
  challenge: string
): Promise<{ userId: string | null; email: string | null } | null> {
  const row = await prisma.webAuthnChallenge.findUnique({ where: { challenge } });
  if (!row) return null;

  await prisma.webAuthnChallenge.delete({ where: { id: row.id } }).catch(() => {});

  // Opportunistic cleanup — this table would otherwise grow forever.
  await prisma.webAuthnChallenge
    .deleteMany({ where: { expiresAt: { lt: new Date() } } })
    .catch(() => {});

  if (row.expiresAt.getTime() < Date.now()) return null;
  return { userId: row.userId, email: row.email };
}

/**
 * Pull the challenge out of the authenticator's own signed `clientDataJSON`,
 * rather than trusting a separate field supplied by the caller. This is the
 * value the device actually signed over.
 */
export function challengeFromClientData(clientDataJSON: unknown): string | null {
  if (typeof clientDataJSON !== "string") return null;
  try {
    const json = JSON.parse(Buffer.from(clientDataJSON, "base64url").toString("utf8"));
    return typeof json?.challenge === "string" ? json.challenge : null;
  } catch {
    return null;
  }
}

/** Parse the JSON-encoded transports column back into the SimpleWebAuthn shape. */
export function parseTransports(value: string | null): string[] | undefined {
  if (!value) return undefined;
  try {
    const list = JSON.parse(value);
    return Array.isArray(list) ? list.map(String) : undefined;
  } catch {
    return undefined;
  }
}

/** A readable default name for a freshly enrolled device. */
export function deviceLabelFrom(userAgent: string | null): string {
  const ua = userAgent ?? "";
  if (/iPhone|iPad/i.test(ua)) return "iPhone / iPad";
  if (/Macintosh/i.test(ua)) return "Mac — Touch ID";
  if (/Android/i.test(ua)) return "Android device";
  if (/Windows/i.test(ua)) return "Windows Hello";
  return "Security key";
}

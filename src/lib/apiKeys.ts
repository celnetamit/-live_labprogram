import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import prisma from "@/lib/prisma";

/**
 * Keys for machine access to the read-only admin API.
 *
 * The full key is returned once at creation and never stored — only its
 * SHA-256 hash is kept, so a database leak yields nothing that can call the
 * API. Lookup is by hash, which is why the hash column is unique.
 */

const PREFIX = "pk_live_";

export function generateApiKey(): { key: string; prefix: string; keyHash: string } {
  const secret = randomBytes(24).toString("hex");
  const key = `${PREFIX}${secret}`;
  return {
    key,
    // Enough to recognise a key in a list without revealing it.
    prefix: key.slice(0, PREFIX.length + 6),
    keyHash: hashKey(key),
  };
}

export function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Resolve a presented key. Returns the key's id when valid and not revoked,
 * and records the use. Comparison is constant-time to avoid leaking, through
 * timing, how much of a guessed key was correct.
 */
export async function verifyApiKey(presented: string | null): Promise<string | null> {
  if (!presented || !presented.startsWith(PREFIX)) return null;

  const hash = hashKey(presented);
  const candidate = await prisma.apiKey.findUnique({ where: { keyHash: hash } });
  if (!candidate || candidate.revokedAt) return null;

  const a = Buffer.from(hash);
  const b = Buffer.from(candidate.keyHash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  await prisma.apiKey
    .update({ where: { id: candidate.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return candidate.id;
}

/** Guard for the admin API routes: reads `Authorization: Bearer` or `x-api-key`. */
export async function requireApiKey(req: Request): Promise<boolean> {
  const header = req.headers.get("authorization");
  const bearer = header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
  const presented = bearer ?? req.headers.get("x-api-key");
  return (await verifyApiKey(presented)) !== null;
}

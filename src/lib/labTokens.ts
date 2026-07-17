import crypto from "node:crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev_only";

export type LabTokenPayload = {
  userId: string;
  email?: string | null;
  role: string;
  labId?: string | null;
  exp: number; // Unix timestamp in seconds
};

/**
 * Generate a signed HMAC-SHA256 launch token for cross-domain lab access.
 */
export function generateLabToken(payload: Omit<LabTokenPayload, "exp">, ttlSeconds = 300): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const fullPayload: LabTokenPayload = { ...payload, exp };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload), "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

/**
 * Verify and decode a signed HMAC-SHA256 launch token.
 * Returns payload if valid and unexpired, otherwise null.
 */
export function verifyLabToken(tokenString: string): LabTokenPayload | null {
  if (!tokenString || typeof tokenString !== "string") return null;
  const parts = tokenString.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  try {
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(encodedPayload)
      .digest("base64url");

    if (signature.length !== expectedSig.length) return null;
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSig, "utf8")
    );
    if (!isValid) return null;

    const decodedJSON = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const payload = JSON.parse(decodedJSON) as LabTokenPayload;
    if (!payload.userId || !payload.exp) return null;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

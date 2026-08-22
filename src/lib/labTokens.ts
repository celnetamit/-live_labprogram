import crypto from "node:crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev_only";

export type LabTokenKind = "launch" | "session";

export type LabTokenPayload = {
  userId: string;
  email?: string | null;
  role: string;
  labId?: string | null;
  exp: number; // Unix timestamp in seconds
  /**
   * What the token is for. Absent means "launch" — tokens issued before this
   * field existed are launch tokens, and treating them as anything else would
   * silently widen what an old link can do.
   *
   * The distinction matters because the two have very different lifetimes and
   * exposure. A launch token rides in a URL, so it lives five minutes and is
   * replay-checked. A session token is returned in a response body, never
   * appears in a URL or a Referer header, and lives long enough to back a
   * working session's API calls.
   */
  kind?: LabTokenKind;
};

/**
 * Generate a signed HMAC-SHA256 launch token for cross-domain lab access.
 */
export function generateLabToken(payload: Omit<LabTokenPayload, "exp">, ttlSeconds = 300): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const fullPayload: LabTokenPayload = { kind: "launch", ...payload, exp };
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
    // A token with no kind predates the field and is a launch token.
    return { ...payload, kind: payload.kind ?? "launch" };
  } catch {
    return null;
  }
}

/**
 * A longer-lived token for a lab that has already been authorised, so it can
 * call back to the hub for the rest of the working session.
 *
 * This exists because the launch token cannot do the job. It lives five minutes
 * by design — it travels in a URL, where it lands in history, Referer headers
 * and screenshots — and it is replay-checked on the authorize endpoint. A lab
 * that tried to use it as an API credential would stop working part-way through
 * the learner's first project.
 *
 * The session token is issued only after `authorize-lab` has verified the
 * launch token, confirmed the account is active and confirmed the user has
 * access to that lab. It is returned in a JSON body, never put in a URL, and
 * carries `kind: "session"` so it cannot be replayed as a launch link.
 *
 * Twelve hours: long enough that nobody is interrupted mid-session, short
 * enough that a token copied off a shared machine stops working the same day.
 */
export function generateLabSessionToken(
  payload: Omit<LabTokenPayload, "exp" | "kind">,
  ttlSeconds = 12 * 60 * 60
): string {
  return generateLabTokenOfKind({ ...payload, kind: "session" }, ttlSeconds);
}

function generateLabTokenOfKind(
  payload: Omit<LabTokenPayload, "exp"> & { kind: LabTokenKind },
  ttlSeconds: number
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const fullPayload: LabTokenPayload = { ...payload, exp };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload), "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

/**
 * Verify a token and require that it is a session token.
 *
 * The kind check is the point. Without it a five-minute launch token — which
 * has been in a URL, and may sit in browser history or a proxy log — would be
 * accepted as an API credential for as long as it had left to run. Rejecting it
 * here keeps the two kinds of token doing only their own job.
 */
export function verifyLabSessionToken(tokenString: string): LabTokenPayload | null {
  const payload = verifyLabToken(tokenString);
  if (!payload || payload.kind !== "session") return null;
  return payload;
}

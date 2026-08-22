import prisma from "@/lib/prisma";
import { verifyLabSessionToken } from "@/lib/labTokens";
import { hasLabAccess } from "@/lib/access";
import type { Lab, User } from "@prisma/client";

/**
 * Authentication for the lab-facing API.
 *
 * A lab runs on its own origin and holds no session cookie for the hub, so it
 * authenticates with the session token `authorize-lab` handed it. Every route
 * a lab can call goes through this function, which re-checks the whole chain
 * rather than trusting the token's contents:
 *
 *   1. the signature and expiry are valid, and it is a *session* token;
 *   2. the account still exists and is still ACTIVE;
 *   3. the lab still exists and is still enabled;
 *   4. the account still has access to that lab.
 *
 * Steps 2 to 4 matter because a token is a snapshot. Access revoked, an account
 * suspended, or a lab disabled must take effect on the next request — not
 * whenever the token happens to expire. The token says who is asking; the
 * database says what they may still do.
 */

export const labCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export type LabApiSession = {
  user: User;
  lab: Lab;
  /** True when the platform role carries access to everything. */
  isAdmin: boolean;
};

export type LabApiFailure = {
  status: 401 | 403 | 404;
  code: string;
  message: string;
};

/*
 * Only SUPER_ADMIN. `hasLabAccess` short-circuits on that role and no other, so
 * including ADMIN here would have made this route disagree with the rest of the
 * platform about what an administrator is.
 */
const ADMIN_ROLES = new Set(["SUPER_ADMIN"]);

/** Pull the token from an Authorization header, falling back to the body. */
export function readLabToken(req: Request, body?: Record<string, unknown>): string | null {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    const value = header.slice(7).trim();
    if (value) return value;
  }
  const fromBody = body?.token;
  return typeof fromBody === "string" && fromBody.trim() !== "" ? fromBody.trim() : null;
}

export async function resolveLabApiSession(
  token: string | null,
  labHint?: { labId?: string | null; labSlug?: string | null; domainUrl?: string | null }
): Promise<{ session: LabApiSession; failure?: never } | { session?: never; failure: LabApiFailure }> {
  if (!token) {
    return {
      failure: {
        status: 401,
        code: "NO_TOKEN",
        message: "No lab session token was supplied. Relaunch the lab from your dashboard.",
      },
    };
  }

  const payload = verifyLabSessionToken(token);
  if (!payload) {
    return {
      failure: {
        status: 401,
        code: "INVALID_SESSION",
        message: "This lab session has expired or is not valid. Relaunch the lab from your dashboard.",
      },
    };
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.status !== "ACTIVE") {
    return {
      failure: { status: 403, code: "INACTIVE_USER", message: "This account is inactive or has been revoked." },
    };
  }

  /*
   * Which lab. The token names one, and a caller may name one too; they have to
   * agree. Letting a caller override the token's lab would turn a session for
   * one lab into a session for any lab.
   */
  const conditions: Record<string, string>[] = [];
  if (payload.labId) conditions.push({ id: payload.labId });
  if (conditions.length === 0) {
    if (labHint?.labId) conditions.push({ id: labHint.labId });
    if (labHint?.labSlug) conditions.push({ slug: labHint.labSlug });
    if (labHint?.domainUrl) conditions.push({ domainUrl: labHint.domainUrl });
  }
  if (conditions.length === 0) {
    return { failure: { status: 404, code: "NO_LAB", message: "No target lab identified for this session." } };
  }

  const lab = await prisma.lab.findFirst({ where: { OR: conditions, enabled: true } });
  if (!lab) {
    return { failure: { status: 404, code: "LAB_NOT_FOUND", message: "The lab was not found or is disabled." } };
  }

  const isAdmin = ADMIN_ROLES.has((user.role || "USER").toUpperCase());

  // Re-checked against the database on every call, not read off the token.
  const authorized = await hasLabAccess(user.id, user.role, lab.id);
  if (!authorized) {
    return {
      failure: {
        status: 403,
        code: "NOT_AUTHORIZED",
        message: "This account is not authorised for this lab.",
      },
    };
  }

  return { session: { user, lab, isAdmin } };
}

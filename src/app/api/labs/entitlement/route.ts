import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { labCorsHeaders, readLabToken, resolveLabApiSession } from "@/lib/labSession";

/**
 * Paid-access check for a lab's premium tier.
 *
 * MicrobeAI's Advanced Mode is paid-only and its launch document requires the
 * authorisation to be "validated ... on backend/API, not just frontend lock".
 * This is that backend. The lab asks on every load and never stores the answer,
 * because anything a browser stores, a browser can be edited to hold.
 *
 *   POST { token, product, entitlement }
 *     → { entitled: true,  plan, expiresAt }
 *     → { entitled: false, reason }
 *
 * The contract is deliberately narrow: the lab treats a literal `entitled: true`
 * as the only grant, and every other outcome — including this route being
 * unreachable — as a refusal. So a bug here fails closed.
 *
 * Two things grant it, and both are facts already in the database rather than
 * anything the lab could assert:
 *
 *   - the SUPER_ADMIN platform role, which the hub's own `hasLabAccess`
 *     already short-circuits on;
 *   - a current, non-expired LabAccess row *at the ADVANCED tier*.
 *
 * That last qualifier is the whole point, and getting it wrong once already
 * handed the premium tier to every learner who had merely bought the lab. A
 * LabAccess row means "may open this lab", which is what a standard purchase
 * writes; the premium tier is a separate thing sold on top, and it is the
 * `tier` column that says so.
 */

/** Grants that cover a lab's premium tier. */
const PREMIUM_TIERS = new Set(["ADVANCED"]);

export async function OPTIONS() {
  return NextResponse.json({}, { headers: labCorsHeaders });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const { session, failure } = await resolveLabApiSession(readLabToken(req, body));

  if (failure) {
    /*
     * A failure is answered as "not entitled" with the reason, not as an HTTP
     * error. The lab reads any non-200 as UNAVAILABLE and shows a service
     * problem; an expired session or a revoked account is not a service
     * problem, it is a real answer, and the learner should be told which.
     */
    return NextResponse.json(
      { entitled: false, reason: failure.message, code: failure.code },
      { status: 200, headers: labCorsHeaders }
    );
  }

  if (session.isAdmin) {
    return NextResponse.json(
      {
        entitled: true,
        plan: `platform-${session.user.role.toLowerCase()}`,
        expiresAt: null,
        reason: `Granted by the platform role ${session.user.role}.`,
      },
      { headers: labCorsHeaders }
    );
  }

  const access = await prisma.labAccess.findUnique({
    where: { userId_labId: { userId: session.user.id, labId: session.lab.id } },
  });

  if (!access) {
    return NextResponse.json(
      { entitled: false, reason: "This account does not hold access to this lab." },
      { headers: labCorsHeaders }
    );
  }

  if (access.expiresAt && access.expiresAt.getTime() < Date.now()) {
    return NextResponse.json(
      {
        entitled: false,
        reason: `Access to this lab expired on ${access.expiresAt.toISOString().slice(0, 10)}.`,
        expiresAt: access.expiresAt.toISOString(),
      },
      { headers: labCorsHeaders }
    );
  }

  if (!PREMIUM_TIERS.has((access.tier || "STANDARD").toUpperCase())) {
    /*
     * Has the lab, has not bought the tier. Said in those terms rather than as
     * a flat refusal, because the learner *is* a paying customer and being told
     * "you have not paid" would be both wrong and insulting.
     */
    return NextResponse.json(
      {
        entitled: false,
        reason:
          "This account has access to the lab but not to its Advanced tier, which is purchased separately.",
      },
      { headers: labCorsHeaders }
    );
  }

  return NextResponse.json(
    {
      entitled: true,
      plan: access.source === "PURCHASE" ? "advanced-purchased" : "advanced-granted",
      expiresAt: access.expiresAt ? access.expiresAt.toISOString() : null,
    },
    { headers: labCorsHeaders }
  );
}

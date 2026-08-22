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
 * Two things grant access, and both are facts already in the database rather
 * than anything the lab could assert:
 *
 *   - a platform administration role, which the hub's own `hasLabAccess`
 *     already short-circuits on;
 *   - a current, non-expired LabAccess row, which is what a purchase writes.
 */

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
      { entitled: false, reason: "This account does not hold paid access to this lab's premium tier." },
      { headers: labCorsHeaders }
    );
  }

  if (access.expiresAt && access.expiresAt.getTime() < Date.now()) {
    return NextResponse.json(
      {
        entitled: false,
        reason: `Paid access to this lab expired on ${access.expiresAt.toISOString().slice(0, 10)}.`,
        expiresAt: access.expiresAt.toISOString(),
      },
      { headers: labCorsHeaders }
    );
  }

  return NextResponse.json(
    {
      entitled: true,
      plan: access.source === "PURCHASE" ? "purchased" : "granted",
      expiresAt: access.expiresAt ? access.expiresAt.toISOString() : null,
    },
    { headers: labCorsHeaders }
  );
}

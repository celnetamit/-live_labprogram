import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { labCorsHeaders, readLabToken, resolveLabApiSession } from "@/lib/labSession";

/**
 * The Expert Reviewer Agreement & Confidentiality Undertaking.
 *
 *   GET   -> has this reviewer signed the current version for this lab?
 *   POST  -> record a signature
 *
 * Reviewer-only, re-checked from the database on every call. The agreement is
 * what gates the review form, so the check that decides whether it has been
 * signed cannot be something the browser tells us.
 *
 * A signature is never overwritten. A reviewer signing a new version creates a
 * new row, so what they agreed to and when stays readable afterwards -- which
 * is the entire point of taking an undertaking in the first place.
 */

const MAX_SHORT = 300;
const VALID_ROLES = new Set([
  "SCIENTIFIC",
  "TECHNICAL",
  "AI_COMPUTATIONAL",
  "DATA_METHODOLOGY",
  "EDUCATIONAL_UX",
  "SECURITY_PRIVACY",
  "COMPLETE",
]);

export async function OPTIONS() {
  return NextResponse.json({}, { headers: labCorsHeaders });
}

function fail(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, code, message }, { status, headers: labCorsHeaders });
}

async function isReviewer(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isReviewer: true } });
  return user?.isReviewer === true;
}

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(req: Request) {
  const { session, failure } = await resolveLabApiSession(readLabToken(req));
  if (failure) return fail(failure.status, failure.code, failure.message);
  if (!(await isReviewer(session.user.id))) {
    return fail(403, "NOT_A_REVIEWER", "This account is not registered as an expert reviewer.");
  }

  const url = new URL(req.url);
  const version = url.searchParams.get("version") ?? "";

  /*
   * Scoped to the version asked for. A signature on an older wording does not
   * answer the question "has this reviewer accepted what we are showing them
   * now", and treating it as though it did would be the one mistake this
   * endpoint exists to prevent.
   */
  const signed = version
    ? await prisma.reviewerAgreement.findFirst({
        where: {
          userId: session.user.id,
          labId: session.lab.id,
          agreementVersion: version,
          revokedAt: null,
        },
      })
    : null;

  const anyPrevious = await prisma.reviewerAgreement.findFirst({
    where: { userId: session.user.id, labId: session.lab.id, revokedAt: null },
    orderBy: { acknowledgedAt: "desc" },
    select: { agreementVersion: true, acknowledgedAt: true },
  });

  return NextResponse.json(
    {
      ok: true,
      signed: signed
        ? {
            id: signed.id,
            acknowledgedAt: signed.acknowledgedAt.toISOString(),
            agreementVersion: signed.agreementVersion,
            agreementFingerprint: signed.agreementFingerprint,
            reviewerName: signed.reviewerName,
            designation: signed.designation,
            institution: signed.institution,
            email: signed.email,
            domain: signed.domain,
            reviewRoles: signed.reviewRoles,
          }
        : null,
      /*
       * Reported so the lab can tell a reviewer that the agreement has changed
       * since they last signed, rather than presenting a fresh form with no
       * explanation of why they are being asked again.
       */
      previouslySignedVersion: anyPrevious?.agreementVersion ?? null,
      previouslySignedAt: anyPrevious?.acknowledgedAt.toISOString() ?? null,
    },
    { headers: labCorsHeaders }
  );
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return fail(400, "BAD_JSON", "The request body was not valid JSON.");
  }

  const { session, failure } = await resolveLabApiSession(readLabToken(req, body));
  if (failure) return fail(failure.status, failure.code, failure.message);
  if (!(await isReviewer(session.user.id))) {
    return fail(403, "NOT_A_REVIEWER", "This account is not registered as an expert reviewer.");
  }

  const agreementVersion = str(body.agreementVersion, MAX_SHORT);
  const agreementFingerprint = str(body.agreementFingerprint, MAX_SHORT);
  if (!agreementVersion || !agreementFingerprint) {
    return fail(
      400,
      "NO_AGREEMENT_IDENTITY",
      "The signature did not say which agreement text it applies to, so it cannot be recorded."
    );
  }

  /*
   * The tick is required at the server too. It is the sentence the reviewer is
   * agreeing to, and a request without it is not an acknowledgement whatever
   * the interface did or did not enforce.
   */
  if (body.confirmed !== true) {
    return fail(
      400,
      "NOT_CONFIRMED",
      "The confirmation that you have read and understood the agreement was not given."
    );
  }

  const roles = Array.isArray(body.reviewRoles)
    ? body.reviewRoles.filter((r): r is string => typeof r === "string" && VALID_ROLES.has(r))
    : [];

  const fields = {
    labTitle: str(body.labTitle, MAX_SHORT),
    domain: str(body.domain, MAX_SHORT),
    reviewBuild: str(body.reviewBuild, MAX_SHORT) || null,
    reviewerName: str(body.reviewerName, MAX_SHORT),
    designation: str(body.designation, MAX_SHORT),
    institution: str(body.institution, MAX_SHORT),
    email: str(body.email, MAX_SHORT),
    dateAccessProvided: str(body.dateAccessProvided, 40) || null,
    expectedCompletion: str(body.expectedCompletion, 40) || null,
    signature: str(body.signature, MAX_SHORT),
    signedDate: str(body.signedDate, 40) || null,
  };

  const missing = [
    !fields.reviewerName && "reviewer name",
    !fields.designation && "designation",
    !fields.institution && "institution",
    !fields.email && "email",
    !fields.domain && "domain",
    !fields.signature && "signature",
    roles.length === 0 && "at least one review role",
  ].filter(Boolean);
  if (missing.length > 0) {
    return fail(400, "INCOMPLETE", `The acknowledgement is missing: ${missing.join(", ")}.`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return fail(400, "BAD_EMAIL", "That does not look like an email address.");
  }

  /*
   * Upsert on (user, lab, version) so a double submit is idempotent rather than
   * producing two signatures for one undertaking. `update` deliberately touches
   * only the form fields: acknowledgedAt keeps the moment the reviewer first
   * agreed to this version, which is the fact worth preserving.
   */
  const record = await prisma.reviewerAgreement.upsert({
    where: {
      userId_labId_agreementVersion: {
        userId: session.user.id,
        labId: session.lab.id,
        agreementVersion,
      },
    },
    create: {
      userId: session.user.id,
      labId: session.lab.id,
      labSlug: session.lab.slug,
      agreementVersion,
      agreementFingerprint,
      reviewRoles: roles as unknown as Prisma.InputJsonValue,
      ...fields,
    },
    update: {
      agreementFingerprint,
      reviewRoles: roles as unknown as Prisma.InputJsonValue,
      ...fields,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      id: record.id,
      acknowledgedAt: record.acknowledgedAt.toISOString(),
      note:
        "Recorded. This undertaking is kept as signed and is not edited afterwards; a change to the agreement " +
        "wording will ask you to sign again.",
    },
    { headers: labCorsHeaders }
  );
}

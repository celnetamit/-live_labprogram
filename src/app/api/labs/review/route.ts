import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { labCorsHeaders, readLabToken, resolveLabApiSession } from "@/lib/labSession";
import {
  REVIEW_AREAS, isRatingValue, isRecommendation, isSeverity, missingRequired,
  type DomainChecks, type ReviewIssue, type ReviewSubmission,
} from "@/lib/reviewForm";

/**
 * The expert review form, saved from inside a lab.
 *
 *   GET   → the reviewer's open draft for this lab, if any
 *   POST  → save a draft, or submit a completed review
 *
 * Reviewer-only, and checked here rather than only in the UI. A hidden nav item
 * is a presentation choice; this is the rule. Anyone can call the endpoint with
 * a valid lab token, so the flag has to be re-read from the database on every
 * request — the same reasoning that makes resolveLabApiSession re-check access
 * rather than trusting the token's contents.
 */

const MAX_TEXT = 5000;
const MAX_SHORT = 300;
/** Enough for a thorough review; a cap so one request cannot fill the table. */
const MAX_ISSUES = 60;

export async function OPTIONS() {
  return NextResponse.json({}, { headers: labCorsHeaders });
}

function fail(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, code, message }, { status, headers: labCorsHeaders });
}

/** The reviewer flag, read fresh. */
async function reviewerOrFail(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isReviewer: true } });
  return user?.isReviewer === true;
}

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Sanitise the submitted form.
 *
 * Unknown rating areas, severities and recommendation ids are dropped rather
 * than stored. A value the form does not define cannot have come from a
 * reviewer using the form, and keeping it would mean the admin screen renders
 * something nobody chose.
 */
function readForm(body: Record<string, unknown>): ReviewSubmission {
  const ratingsIn = (body.ratings ?? {}) as Record<string, unknown>;
  const ratings: ReviewSubmission["ratings"] = {};
  for (const area of REVIEW_AREAS) {
    const value = ratingsIn[area.id];
    if (isRatingValue(value)) ratings[area.id] = value;
  }

  const issuesIn = Array.isArray(body.issues) ? body.issues.slice(0, MAX_ISSUES) : [];
  const issues: ReviewIssue[] = issuesIn
    .map((raw) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      const severity = item.severity;
      return {
        module: str(item.module, MAX_SHORT),
        severity: isSeverity(severity) ? severity : ("" as const),
        observation: str(item.observation, MAX_TEXT),
        recommendation: str(item.recommendation, MAX_TEXT),
      };
    })
    // A row with nothing in it is an artefact of the editor, not an observation.
    .filter((i) => i.module || i.observation || i.recommendation || i.severity);

  const checksIn = (body.domainChecks ?? {}) as Record<string, unknown>;
  const domainChecks: DomainChecks = {};
  for (const [domain, value] of Object.entries(checksIn)) {
    if (Array.isArray(value)) {
      domainChecks[domain as keyof DomainChecks] = value
        .filter((v): v is string => typeof v === "string")
        .slice(0, 40);
    }
  }

  const recommendation = body.finalRecommendation;

  return {
    reviewerName: str(body.reviewerName, MAX_SHORT),
    areaOfExpertise: str(body.areaOfExpertise, MAX_SHORT),
    versionBuild: str(body.versionBuild, MAX_SHORT),
    reviewDate: str(body.reviewDate, 40),
    ratings,
    issues,
    domainChecks,
    finalRecommendation: isRecommendation(recommendation) ? recommendation : "",
    mostImportantCorrection: str(body.mostImportantCorrection, MAX_TEXT),
    optionalSuggestions: str(body.optionalSuggestions, MAX_TEXT),
    reviewerComments: str(body.reviewerComments, MAX_TEXT),
  };
}

export async function GET(req: Request) {
  const { session, failure } = await resolveLabApiSession(readLabToken(req));
  if (failure) return fail(failure.status, failure.code, failure.message);
  if (!(await reviewerOrFail(session.user.id))) {
    return fail(403, "NOT_A_REVIEWER", "This account is not registered as an expert reviewer.");
  }

  const draft = await prisma.labReview.findFirst({
    where: { userId: session.user.id, labId: session.lab.id, status: "DRAFT" },
    orderBy: { updatedAt: "desc" },
  });

  const submitted = await prisma.labReview.count({
    where: { userId: session.user.id, labId: session.lab.id, status: "SUBMITTED" },
  });

  return NextResponse.json(
    { ok: true, draft, submittedCount: submitted },
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
  if (failure) {
    return fail(
      failure.status,
      failure.code,
      `${failure.message} Nothing was saved — your review is still on screen.`
    );
  }
  if (!(await reviewerOrFail(session.user.id))) {
    return fail(403, "NOT_A_REVIEWER", "This account is not registered as an expert reviewer.");
  }

  const submitting = body.submit === true;
  const form = readForm(body);

  /*
   * Completeness is enforced on submit and not on save. A draft is for work in
   * progress by definition, and a validator that blocked saving a half-finished
   * review would guarantee reviewers lose work.
   */
  if (submitting) {
    const missing = missingRequired(form);
    if (missing.length > 0) {
      return fail(
        400,
        "INCOMPLETE",
        `The form is not complete: ${missing.join("; ")}. It has been kept as a draft.`
      );
    }
  }

  const data = {
    userId: session.user.id,
    labId: session.lab.id,
    labSlug: session.lab.slug,
    reviewerName: form.reviewerName,
    areaOfExpertise: form.areaOfExpertise,
    versionBuild: form.versionBuild || null,
    /*
     * Cast at the boundary. These are typed structures on our side and opaque
     * JSON to Prisma; the cast is where that changes, and doing it here rather
     * than typing the fields loosely keeps readForm's return type meaningful.
     */
    ratings: form.ratings as unknown as Prisma.InputJsonValue,
    issues: form.issues as unknown as Prisma.InputJsonValue,
    domainChecks: form.domainChecks as unknown as Prisma.InputJsonValue,
    finalRecommendation: form.finalRecommendation || null,
    mostImportantCorrection: form.mostImportantCorrection || null,
    optionalSuggestions: form.optionalSuggestions || null,
    reviewerComments: form.reviewerComments || null,
    reviewDate: form.reviewDate || null,
    status: submitting ? "SUBMITTED" : "DRAFT",
    submittedAt: submitting ? new Date() : null,
  };

  /*
   * One open draft per reviewer per lab, reused. A submitted review is never
   * overwritten: the form's own outcomes include a re-review after corrections,
   * so a second review of the same lab is a new record and both stay readable.
   */
  const existingDraft = await prisma.labReview.findFirst({
    where: { userId: session.user.id, labId: session.lab.id, status: "DRAFT" },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  const saved = existingDraft
    ? await prisma.labReview.update({ where: { id: existingDraft.id }, data })
    : await prisma.labReview.create({ data });

  return NextResponse.json(
    {
      ok: true,
      id: saved.id,
      status: saved.status,
      savedAt: saved.updatedAt.toISOString(),
      note: submitting
        ? "Review submitted. It is now visible to the team; no automatic reply is sent."
        : "Draft saved. It stays private to you until you submit it.",
    },
    { headers: labCorsHeaders }
  );
}

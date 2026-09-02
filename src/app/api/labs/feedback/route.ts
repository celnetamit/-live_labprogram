import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { labCorsHeaders, readLabToken, resolveLabApiSession } from "@/lib/labSession";

/**
 * Feedback sent from inside a lab.
 *
 *   POST { name, email, designation, message, rating?, category?, screen? }
 *
 * Authenticated by the lab session token, like every other lab-facing route.
 * That is a deliberate choice with a cost: someone whose session has expired
 * cannot send feedback, which is a moment they may particularly want to. The
 * alternative is an unauthenticated public POST that writes rows to the
 * database, and this endpoint would be found and filled with rubbish within a
 * week of the domain being crawled. Requiring the token also means every row
 * has a real account behind it, so feedback can be replied to and a pattern of
 * abuse can be stopped at the account.
 *
 * The identity handling is the part worth reading. The token establishes WHO IS
 * SIGNED IN; the form fields record WHAT THE SENDER SAID ABOUT THEMSELVES. Both
 * are stored, neither is overwritten by the other. Labs run on shared machines
 * and in taught sessions, so the person at the keyboard is not reliably the
 * account holder, and a reply address may legitimately differ from the one the
 * account was registered with. Silently replacing the typed email with the
 * account's would throw away the only evidence that they differed.
 */

/** Long enough for a considered report, short enough not to be a file upload. */
const MAX_MESSAGE = 4000;
const MAX_SHORT_FIELD = 200;

/**
 * Per-account rate limit. Feedback is a considered act, not a stream, and an
 * account sending more than this in an hour is either a loop or a nuisance.
 */
const MAX_PER_HOUR = 10;

const CATEGORIES = new Set(["GENERAL", "BUG", "SCIENCE", "USABILITY", "FEATURE"]);

export async function OPTIONS() {
  return NextResponse.json({}, { headers: labCorsHeaders });
}

function fail(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, code, message }, { status, headers: labCorsHeaders });
}

/**
 * Deliberately permissive, and only a shape check.
 *
 * Address syntax is a poor proxy for deliverability — a perfectly formed
 * address can bounce and an unusual one can be fine — so this rejects what is
 * obviously not an address and lets the rest through. Being strict here mostly
 * means turning away people with legitimate addresses, which is a worse outcome
 * than storing one that bounces.
 */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function readString(body: Record<string, unknown>, key: string, max: number): string {
  const raw = body[key];
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
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
      // Say what to do, not just what went wrong: this message is shown to
      // someone who has just typed out a piece of feedback.
      `${failure.message} Your feedback has not been sent — sign in again and resubmit, and your draft is kept.`
    );
  }

  const name = readString(body, "name", MAX_SHORT_FIELD);
  const email = readString(body, "email", MAX_SHORT_FIELD);
  const designation = readString(body, "designation", MAX_SHORT_FIELD);
  const message = readString(body, "message", MAX_MESSAGE);
  const screen = readString(body, "screen", MAX_SHORT_FIELD) || null;
  const appVersion = readString(body, "appVersion", MAX_SHORT_FIELD) || null;

  const missing = [
    !name && "name",
    !email && "email",
    !designation && "designation",
    !message && "message",
  ].filter(Boolean);
  if (missing.length > 0) {
    return fail(400, "MISSING_FIELDS", `These are required: ${missing.join(", ")}.`);
  }
  if (!looksLikeEmail(email)) {
    return fail(400, "BAD_EMAIL", "That does not look like an email address.");
  }

  const categoryRaw = readString(body, "category", 32).toUpperCase();
  const category = CATEGORIES.has(categoryRaw) ? categoryRaw : "GENERAL";

  /*
   * A rating is optional and only accepted as a whole number in range. A
   * malformed one is dropped rather than clamped: a 9 coerced to 5 would be an
   * invented score, and this table is meant to be read as what people said.
   */
  const ratingRaw = body.rating;
  const rating =
    typeof ratingRaw === "number" && Number.isInteger(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5
      ? ratingRaw
      : null;

  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.labFeedback.count({
    where: { userId: session.user.id, createdAt: { gte: since } },
  });
  if (recent >= MAX_PER_HOUR) {
    return fail(
      429,
      "RATE_LIMITED",
      `You have sent ${recent} pieces of feedback in the last hour, which is the limit. Your draft is kept — try again later.`
    );
  }

  const record = await prisma.labFeedback.create({
    data: {
      userId: session.user.id,
      labId: session.lab.id,
      labSlug: session.lab.slug,
      name,
      email,
      designation,
      rating,
      category,
      message,
      screen,
      appVersion,
    },
    select: { id: true, createdAt: true },
  });

  return NextResponse.json(
    {
      ok: true,
      id: record.id,
      receivedAt: record.createdAt.toISOString(),
      /*
       * Stated rather than implied. A "thanks, we'll get back to you" that
       * nobody is on the hook for is a promise the software cannot keep; this
       * says exactly what happened — the message is stored and a person will
       * read it — and nothing about when.
       */
      note: "Stored for the team to read. No automatic reply is sent, and no response time is promised.",
      /*
       * Echoed back so the lab can show the sender what was recorded against
       * their account, which is the only way they would notice that the address
       * they typed is not the one they are signed in with.
       */
      signedInAs: session.user.email,
    },
    { headers: labCorsHeaders }
  );
}

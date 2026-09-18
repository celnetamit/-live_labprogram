import { NextResponse } from "next/server";
import { labCorsHeaders, readLabToken, resolveLabApiSession } from "@/lib/labSession";
import { createRateLimit, generateText } from "@/lib/llm";

/**
 * Language-model relay for labs.
 *
 * Labs are static bundles served from their own origin, so a key given to a lab
 * is a key published to the internet: anything Vite inlines at build time is
 * readable by anyone who opens the served JavaScript, and billable to whoever
 * owns it. There is no build-time configuration that avoids this — the problem
 * is the browser, not the setting.
 *
 * So the key lives in this server's environment instead and never leaves it. A
 * lab sends the prompt; this route adds the credential and forwards it through
 * `src/lib/llm.ts`. The contract is the one labs already implement:
 *
 *   POST { prompt, temperature }  ->  { text }
 *
 * Every request is authenticated with the caller's lab session token. An
 * unauthenticated relay is an open language-model endpoint billed to the
 * platform owner, and it would be found.
 */

/** Refuse a prompt larger than any legitimate evidence bundle. */
const MAX_PROMPT_CHARS = 24_000;

/** Upstream deadline. The lab gives up at 30s, so finish before it does. */
const UPSTREAM_TIMEOUT_MS = 25_000;

/** A tutor explanation does not need more than this. */
const MAX_OUTPUT_TOKENS = 1024;

const overRateLimit = createRateLimit(5 * 60_000, 40);

export async function OPTIONS() {
  return NextResponse.json({}, { headers: labCorsHeaders });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const { session, failure } = await resolveLabApiSession(readLabToken(req, body));
  if (failure) {
    return NextResponse.json(
      { error: failure.code, message: failure.message },
      { status: failure.status, headers: labCorsHeaders },
    );
  }

  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  const temperature = typeof body.temperature === "number" ? body.temperature : 0.2;
  if (!prompt.trim()) {
    return NextResponse.json(
      { error: "NO_PROMPT", message: "A prompt is required." },
      { status: 400, headers: labCorsHeaders },
    );
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return NextResponse.json(
      { error: "PROMPT_TOO_LARGE", message: `Prompt exceeds ${MAX_PROMPT_CHARS} characters.` },
      { status: 413, headers: labCorsHeaders },
    );
  }
  if (overRateLimit(session.user.id)) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many requests. Wait a few minutes and try again." },
      { status: 429, headers: labCorsHeaders },
    );
  }

  const result = await generateText(prompt, {
    temperature,
    maxTokens: MAX_OUTPUT_TOKENS,
    timeoutMs: UPSTREAM_TIMEOUT_MS,
    logLabel: "labs/llm",
  });

  if (!result.ok) {
    /*
     * A non-200 here is correct behaviour on the lab's side — it falls back to
     * its deterministic template — but the operator deserves to see why. The
     * commonest cause is NOT_CONFIGURED: no LLM_API_KEY in the environment.
     */
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: result.status, headers: labCorsHeaders },
    );
  }

  return NextResponse.json({ text: result.text }, { headers: labCorsHeaders });
}

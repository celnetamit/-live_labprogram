import { NextResponse } from "next/server";
import { labCorsHeaders, readLabToken, resolveLabApiSession } from "@/lib/labSession";

/**
 * Language-model relay for labs.
 *
 * Labs are static bundles served from their own origin, so a key given to a lab
 * is a key published to the internet: anything Vite inlines at build time is
 * readable by anyone who opens the served JavaScript, and billable to whoever
 * owns it. There is no build-time configuration that avoids this — the problem
 * is the browser, not the setting.
 *
 * So the key lives here instead, in this server's environment, and never leaves
 * it. A lab sends the prompt; this route adds the credential and forwards it.
 * The contract is the one labs already implement:
 *
 *   POST { prompt, temperature }  ->  { text }
 *
 * Note the environment variable names: LLM_API_KEY, not NEXT_PUBLIC_LLM_API_KEY.
 * The NEXT_PUBLIC_ prefix is Next's equivalent of Vite's VITE_ and would inline
 * the key into the client bundle, reintroducing exactly the problem this route
 * exists to solve.
 *
 * Every request is authenticated with the caller's lab session token. An
 * unauthenticated relay is an open language-model endpoint billed to the
 * platform owner, and it would be found.
 */

/** Refuse a prompt larger than any legitimate evidence bundle. */
const MAX_PROMPT_CHARS = 24_000;

/** Upstream deadline. The lab gives up at 30s, so finish before it does. */
const UPSTREAM_TIMEOUT_MS = 25_000;

/**
 * A modest per-account budget.
 *
 * In memory, so it resets on deploy and is per instance rather than per
 * cluster. That is a real limitation and it is stated rather than hidden: this
 * is a guard against a runaway loop or one learner hammering the endpoint, not
 * a billing control. A hard budget belongs at the provider.
 */
const RATE_LIMIT = { windowMs: 5 * 60_000, max: 40 };
const hits = new Map<string, number[]>();

function overRateLimit(userId: string): boolean {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(userId, recent);
  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5_000) for (const [k, v] of hits) if (v.every((t) => now - t > RATE_LIMIT.windowMs)) hits.delete(k);
  return recent.length > RATE_LIMIT.max;
}

type Provider = "openrouter" | "openai-compatible" | "google" | "anthropic";

const DEFAULTS: Record<Provider, { baseUrl: string; model: string }> = {
  openrouter: { baseUrl: "https://openrouter.ai/api/v1", model: "google/gemini-2.0-flash-001" },
  "openai-compatible": { baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  google: { baseUrl: "https://generativelanguage.googleapis.com/v1beta", model: "gemini-flash-latest" },
  anthropic: { baseUrl: "https://api.anthropic.com", model: "claude-sonnet-4-5" },
};

/**
 * Work out the vendor from the key's own prefix, mirroring what the labs do.
 * Asking an operator to name the provider *and* paste the key invites a
 * mismatch that surfaces as an opaque 401.
 */
function detectProvider(apiKey: string): Provider | null {
  const key = apiKey.trim();
  if (!key) return null;
  if (key.startsWith("sk-or-")) return "openrouter";
  if (key.startsWith("sk-ant-")) return "anthropic";
  if (key.startsWith("AIza") || key.startsWith("AQ.")) return "google";
  // Groq keys (gsk_) speak the OpenAI wire format but live elsewhere, so they
  // need LLM_BASE_URL set alongside.
  if (key.startsWith("sk-") || key.startsWith("gsk_")) return "openai-compatible";
  return null;
}

function serverConfig() {
  const apiKey = process.env.LLM_API_KEY?.trim();
  if (!apiKey) return null;

  const declared = process.env.LLM_PROVIDER?.trim() as Provider | undefined;
  const provider = declared && declared in DEFAULTS ? declared : detectProvider(apiKey);
  if (!provider) return null;

  return {
    provider,
    apiKey,
    model: process.env.LLM_MODEL?.trim() || DEFAULTS[provider].model,
    baseUrl: (process.env.LLM_BASE_URL?.trim() || DEFAULTS[provider].baseUrl).replace(/\/+$/, ""),
  };
}

type Wire = { url: string; headers: Record<string, string>; body: string };

function buildUpstream(
  cfg: NonNullable<ReturnType<typeof serverConfig>>,
  prompt: string,
  temperature: number,
): Wire {
  const json = { "Content-Type": "application/json" };
  switch (cfg.provider) {
    case "google":
      return {
        url: `${cfg.baseUrl}/models/${cfg.model}:generateContent`,
        headers: { ...json, "x-goog-api-key": cfg.apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature } }),
      };
    case "anthropic":
      return {
        url: `${cfg.baseUrl}/v1/messages`,
        headers: { ...json, "x-api-key": cfg.apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: cfg.model, max_tokens: 1024, temperature,
          messages: [{ role: "user", content: prompt }],
        }),
      };
    default:
      return {
        url: `${cfg.baseUrl}/chat/completions`,
        headers: { ...json, Authorization: `Bearer ${cfg.apiKey}` },
        body: JSON.stringify({
          model: cfg.model, temperature, messages: [{ role: "user", content: prompt }],
        }),
      };
  }
}

function extractText(provider: Provider, payload: unknown): string {
  const data = payload as Record<string, any>;
  if (!data || typeof data !== "object") return "";
  if (provider === "google") {
    return (data.candidates?.[0]?.content?.parts ?? [])
      .map((p: { text?: string }) => p?.text ?? "").join("");
  }
  if (provider === "anthropic") {
    return (data.content ?? []).map((c: { text?: string }) => c?.text ?? "").join("");
  }
  return data.choices?.[0]?.message?.content ?? "";
}

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

  const cfg = serverConfig();
  if (!cfg) {
    /*
     * 503 rather than a silent empty answer. The lab treats any non-200 as a
     * provider failure and falls back to its deterministic template, which is
     * the correct behaviour — but the operator deserves to see why in a log.
     */
    return NextResponse.json(
      {
        error: "NOT_CONFIGURED",
        message:
          "No language model is configured on this platform. Set LLM_API_KEY in the server environment (never NEXT_PUBLIC_LLM_API_KEY, which would publish it).",
      },
      { status: 503, headers: labCorsHeaders },
    );
  }

  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  const temperature = typeof body.temperature === "number" ? body.temperature : 0.2;
  if (!prompt.trim()) {
    return NextResponse.json({ error: "NO_PROMPT", message: "A prompt is required." },
      { status: 400, headers: labCorsHeaders });
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

  const wire = buildUpstream(cfg, prompt, temperature);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(wire.url, {
      method: "POST", headers: wire.headers, body: wire.body, signal: controller.signal,
    });

    if (!upstream.ok) {
      /*
       * The upstream body can echo the key back in an error message, so it is
       * logged server-side and never returned. The lab gets the status and a
       * sentence it can show.
       */
      const detail = await upstream.text().catch(() => "");
      console.error(`[labs/llm] ${cfg.provider} responded ${upstream.status}: ${detail.slice(0, 400)}`);
      return NextResponse.json(
        { error: "UPSTREAM_ERROR", message: `The language model service answered ${upstream.status}.` },
        { status: 502, headers: labCorsHeaders },
      );
    }

    const text = extractText(cfg.provider, await upstream.json());
    return NextResponse.json({ text }, { headers: labCorsHeaders });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    console.error(`[labs/llm] ${aborted ? "timed out" : "failed"}:`, err instanceof Error ? err.message : err);
    return NextResponse.json(
      {
        error: aborted ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNREACHABLE",
        message: aborted
          ? `The language model did not respond within ${UPSTREAM_TIMEOUT_MS / 1000} seconds.`
          : "The language model service could not be reached.",
      },
      { status: 504, headers: labCorsHeaders },
    );
  } finally {
    clearTimeout(timer);
  }
}

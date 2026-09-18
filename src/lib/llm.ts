/**
 * The platform's language-model client.
 *
 * The key lives in this server's environment and never leaves it. Note the
 * variable names below: `LLM_API_KEY`, not `NEXT_PUBLIC_LLM_API_KEY` — the
 * `NEXT_PUBLIC_` prefix inlines a value into the client bundle, which for a
 * credential means publishing it to anyone who opens the served JavaScript.
 *
 * Two callers share this module: `/api/labs/llm`, the relay a lab's browser
 * bundle calls with its lab session token, and the `assist` server action in
 * `src/app/admin/blog`, the writing assistant in the blog editor. Both
 * authenticate their own caller before they get here; this module only knows
 * how to talk to a provider.
 */

export type Provider = "openrouter" | "openai-compatible" | "google" | "anthropic";

const DEFAULTS: Record<Provider, { baseUrl: string; model: string }> = {
  // Checked against OpenRouter's live model list. The previous default,
  // google/gemini-2.0-flash-001, has been withdrawn and now 404s, so any
  // operator who set a key but no model got a failure they could not explain.
  openrouter: { baseUrl: "https://openrouter.ai/api/v1", model: "openai/gpt-4o-mini" },
  "openai-compatible": { baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  google: { baseUrl: "https://generativelanguage.googleapis.com/v1beta", model: "gemini-flash-latest" },
  anthropic: { baseUrl: "https://api.anthropic.com", model: "claude-sonnet-4-5" },
};

/**
 * Work out the vendor from the key's own prefix, mirroring what the labs do.
 * Asking an operator to name the provider *and* paste the key invites a
 * mismatch that surfaces as an opaque 401.
 */
export function detectProvider(apiKey: string): Provider | null {
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

export type LlmConfig = { provider: Provider; apiKey: string; model: string; baseUrl: string };

/** The configured provider, or null when this deployment has no key. */
export function llmConfig(): LlmConfig | null {
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

function buildUpstream(cfg: LlmConfig, prompt: string, temperature: number, maxTokens: number): Wire {
  const json = { "Content-Type": "application/json" };
  switch (cfg.provider) {
    case "google":
      return {
        url: `${cfg.baseUrl}/models/${cfg.model}:generateContent`,
        headers: { ...json, "x-goog-api-key": cfg.apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        }),
      };
    case "anthropic":
      return {
        url: `${cfg.baseUrl}/v1/messages`,
        headers: { ...json, "x-api-key": cfg.apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: cfg.model,
          max_tokens: maxTokens,
          temperature,
          messages: [{ role: "user", content: prompt }],
        }),
      };
    default:
      return {
        url: `${cfg.baseUrl}/chat/completions`,
        headers: { ...json, Authorization: `Bearer ${cfg.apiKey}` },
        body: JSON.stringify({
          model: cfg.model,
          temperature,
          max_tokens: maxTokens,
          messages: [{ role: "user", content: prompt }],
        }),
      };
  }
}

function extractText(provider: Provider, payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const data = payload as Record<string, unknown>;

  if (provider === "google") {
    const candidates = data.candidates as { content?: { parts?: { text?: string }[] } }[] | undefined;
    return (candidates?.[0]?.content?.parts ?? []).map((part) => part?.text ?? "").join("");
  }
  if (provider === "anthropic") {
    const content = data.content as { text?: string }[] | undefined;
    return (content ?? []).map((chunk) => chunk?.text ?? "").join("");
  }
  const choices = data.choices as { message?: { content?: string } }[] | undefined;
  return choices?.[0]?.message?.content ?? "";
}

export type LlmResult =
  | { ok: true; text: string }
  | { ok: false; status: number; error: string; message: string };

export type GenerateOptions = {
  temperature?: number;
  /**
   * Cap on generated tokens. Without one a reasoning model has no reason to
   * stop: reasoning tokens count as output, and a long prompt can keep one
   * generating well past the timeout. That failed as `timed out: This operation
   * was aborted`, which reads like a network fault and is not one — the request
   * was fine, the answer simply never finished.
   */
  maxTokens?: number;
  timeoutMs?: number;
  /** Prefixes provider failures in the server log, so two callers stay apart. */
  logLabel?: string;
};

/**
 * Send one prompt and return the text.
 *
 * Failures come back as values rather than exceptions, because every one of
 * them is something a caller has to turn into a status a browser can read.
 * The upstream error body is logged and never returned: it can echo the key
 * back in its message.
 */
export async function generateText(prompt: string, options: GenerateOptions = {}): Promise<LlmResult> {
  const { temperature = 0.2, maxTokens = 1024, timeoutMs = 25_000, logLabel = "llm" } = options;

  const cfg = llmConfig();
  if (!cfg) {
    return {
      ok: false,
      status: 503,
      error: "NOT_CONFIGURED",
      message:
        "No language model is configured on this platform. Set LLM_API_KEY in the server environment (never NEXT_PUBLIC_LLM_API_KEY, which would publish it).",
    };
  }

  const wire = buildUpstream(cfg, prompt, temperature, maxTokens);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const upstream = await fetch(wire.url, {
      method: "POST",
      headers: wire.headers,
      body: wire.body,
      signal: controller.signal,
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      console.error(`[${logLabel}] ${cfg.provider} responded ${upstream.status}: ${detail.slice(0, 400)}`);
      return {
        ok: false,
        status: 502,
        error: "UPSTREAM_ERROR",
        message: `The language model service answered ${upstream.status}.`,
      };
    }

    return { ok: true, text: extractText(cfg.provider, await upstream.json()) };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    console.error(`[${logLabel}] ${aborted ? "timed out" : "failed"}:`, err instanceof Error ? err.message : err);
    return {
      ok: false,
      status: 504,
      error: aborted ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNREACHABLE",
      message: aborted
        ? `The language model did not respond within ${timeoutMs / 1000} seconds. If LLM_MODEL names a reasoning model, it may simply be slower than that on a long prompt — try a non-reasoning model.`
        : "The language model service could not be reached.",
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * A modest per-account budget, shared by both callers.
 *
 * In memory, so it resets on deploy and is per instance rather than per
 * cluster. That is a real limitation and it is stated rather than hidden: this
 * is a guard against a runaway loop or one user hammering the endpoint, not a
 * billing control. A hard budget belongs at the provider.
 */
export function createRateLimit(windowMs: number, max: number) {
  const hits = new Map<string, number[]>();
  return function overRateLimit(key: string): boolean {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
    recent.push(now);
    hits.set(key, recent);
    // Keep the map from growing without bound on a long-lived instance.
    if (hits.size > 5_000) {
      for (const [id, times] of hits) if (times.every((at) => now - at > windowMs)) hits.delete(id);
    }
    return recent.length > max;
  };
}

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SITE_NAME } from "@/lib/site";
import { createRateLimit, generateText, llmConfig } from "@/lib/llm";

/**
 * The editor's writing assistant.
 *
 * It suggests words: titles, a meta description, a section outline, related
 * phrases, a rewrite of a paragraph you selected. It never supplies a number.
 * Every measurement in the analysis panel — word counts, keyword density,
 * reading ease, the optimization grade — is computed locally in
 * `src/lib/blogAnalysis.ts` from the text itself, so nothing shown as a
 * measurement can be something a model made up.
 *
 * The prompt is assembled here, on the server, from named fields. The editor
 * chooses a task and sends the post it is editing; it cannot send a prompt of
 * its own, so this is not a general-purpose model endpoint wearing an admin
 * login.
 */

export type AssistTask = "titles" | "description" | "outline" | "keywords" | "rewrite";

export type AssistInput = {
  task: AssistTask;
  title: string;
  focusKeyword: string;
  keywords: string[];
  description: string;
  body: string;
  /** The text highlighted in the editor. Required by "rewrite", ignored otherwise. */
  selection: string;
  labName: string;
};

export type AssistResult =
  | { ok: true; items: string[]; text: string }
  | { ok: false; error: string };

/** Enough of the draft for context without paying to send the whole article every time. */
const MAX_BODY_CHARS = 9_000;
const MAX_SELECTION_CHARS = 3_000;

const overRateLimit = createRateLimit(5 * 60_000, 30);

const HOUSE_STYLE = [
  `You are helping an editor at ${SITE_NAME}, which publishes worked explanations of the science and engineering behind its online laboratories.`,
  "House style: plain British English, specific rather than promotional, no exclamation marks, no clichés such as “delve”, “unlock”, “game-changer” or “in today's world”.",
  "Never invent a fact, a number, a citation or a result. If the draft does not say something, do not supply it.",
].join(" ");

function contextBlock(input: AssistInput): string {
  const parts = [
    `Headline: ${input.title || "(not written yet)"}`,
    `Focus keyword: ${input.focusKeyword || "(not chosen yet)"}`,
    input.keywords.length ? `Related keywords already chosen: ${input.keywords.join(", ")}` : "",
    input.labName ? `The post is about the ${input.labName} lab.` : "",
    input.description ? `Current meta description: ${input.description}` : "",
  ].filter(Boolean);
  return parts.join("\n");
}

function draftBlock(body: string): string {
  const draft = body.trim();
  if (!draft) return "The draft is still empty.";
  const clipped = draft.length > MAX_BODY_CHARS ? `${draft.slice(0, MAX_BODY_CHARS)}\n[…draft truncated]` : draft;
  return `The draft so far, in Markdown:\n---\n${clipped}\n---`;
}

function buildPrompt(input: AssistInput): { prompt: string; temperature: number } | { error: string } {
  const context = contextBlock(input);

  switch (input.task) {
    case "titles":
      if (!input.title.trim() && !input.body.trim()) {
        return { error: "Write a headline or a first paragraph before asking for title ideas." };
      }
      return {
        temperature: 0.7,
        prompt: [
          HOUSE_STYLE,
          context,
          draftBlock(input.body),
          "",
          "Suggest 5 alternative headlines for this post. Each must contain the focus keyword, read as a promise the article actually keeps, and be at most 55 characters so it survives truncation in a search result.",
          "Reply with the 5 headlines, one per line, and nothing else — no numbering, no commentary.",
        ].join("\n"),
      };

    case "description":
      if (!input.body.trim()) return { error: "Write some of the body first — the description has to describe it." };
      return {
        temperature: 0.4,
        prompt: [
          HOUSE_STYLE,
          context,
          draftBlock(input.body),
          "",
          "Write 3 candidate meta descriptions for this post. Each must be between 120 and 160 characters, contain the focus keyword, describe what the reader will actually learn, and end without an ellipsis.",
          "Reply with the 3 descriptions, one per line, and nothing else.",
        ].join("\n"),
      };

    case "outline":
      return {
        temperature: 0.6,
        prompt: [
          HOUSE_STYLE,
          context,
          draftBlock(input.body),
          "",
          input.body.trim()
            ? "Read the draft and suggest the section headings it is missing — points a reader would expect that it does not yet cover. Do not repeat headings it already has."
            : "Suggest the section headings this article should have, in reading order.",
          "Give 5 to 8 headings. Each should be a specific claim or question, not a one-word label such as “Introduction”.",
          "Reply with the headings, one per line, with no ## marks, no numbering and no commentary.",
        ].join("\n"),
      };

    case "keywords":
      if (!input.focusKeyword.trim()) {
        return { error: "Choose a focus keyword first — related phrases are relative to it." };
      }
      return {
        temperature: 0.5,
        prompt: [
          HOUSE_STYLE,
          context,
          draftBlock(input.body),
          "",
          `Suggest 8 phrases related to the focus keyword “${input.focusKeyword}” that someone searching for this topic might type.`,
          "Prefer longer, more specific phrases over one-word topics. Do not repeat the focus keyword itself or any related keyword already chosen.",
          "These are editorial suggestions only: you have no search-volume data, so do not claim any phrase is popular, low-competition or high-traffic.",
          "Reply with the 8 phrases, one per line, and nothing else.",
        ].join("\n"),
      };

    case "rewrite": {
      const selection = input.selection.trim();
      if (!selection) return { error: "Select the passage you want rewritten, then run this again." };
      return {
        temperature: 0.4,
        prompt: [
          HOUSE_STYLE,
          context,
          "",
          "Rewrite the passage below so it is clearer: shorter sentences, active voice where it suits, no jargon that the passage does not itself explain.",
          "Keep every fact, number and claim exactly as it is — do not add, remove or soften any of them. Keep any Markdown marks, links and headings intact.",
          "Reply with the rewritten passage only, with no preamble and no explanation of the changes.",
          "",
          "---",
          selection.slice(0, MAX_SELECTION_CHARS),
          "---",
        ].join("\n"),
      };
    }
  }
}

/** Strip a bullet, a number or surrounding quotes from a suggestion line. */
function cleanLine(line: string): string {
  return line
    .trim()
    .replace(/^[-*•]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .replace(/^#{1,6}\s+/, "")
    .replace(/^["'“]|["'”]$/g, "")
    .trim();
}

export async function assist(input: AssistInput): Promise<AssistResult> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user || user.role !== "SUPER_ADMIN") return { ok: false, error: "Unauthorized." };

  if (!llmConfig()) {
    return {
      ok: false,
      error:
        "No language model is configured on this platform, so the assistant is off. Set LLM_API_KEY in the server environment — never NEXT_PUBLIC_LLM_API_KEY, which would publish the key in the browser bundle. Everything else in this panel is measured locally and works without it.",
    };
  }
  if (overRateLimit(user.id ?? "admin")) {
    return { ok: false, error: "Too many requests. Wait a few minutes and try again." };
  }

  const built = buildPrompt(input);
  if ("error" in built) return { ok: false, error: built.error };

  const result = await generateText(built.prompt, {
    temperature: built.temperature,
    maxTokens: 900,
    logLabel: "admin/blog/assist",
  });
  if (!result.ok) return { ok: false, error: result.message };

  const text = result.text.trim();
  if (!text) return { ok: false, error: "The model returned nothing. Try again." };

  // A rewrite is one passage; everything else is a list of candidates.
  const items =
    input.task === "rewrite"
      ? [text]
      : text
          .split("\n")
          .map(cleanLine)
          // Drop a stray "Here are five headlines:" preamble.
          .filter((line) => line.length > 0 && !line.endsWith(":"));

  return { ok: true, items, text };
}

import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Blog vocabulary, the Markdown subset posts are written in, and the on-page
 * SEO checklist.
 *
 * Nothing here touches the database, so the admin editor runs in the browser
 * exactly the parser and checks the public pages use on the server — the
 * preview and the checklist cannot disagree with what gets published.
 */

export const BLOG_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export function isBlogStatus(value: string): value is BlogStatus {
  return (BLOG_STATUSES as readonly string[]).includes(value);
}

export const BLOG_DESCRIPTION =
  "Guides and worked explanations of the science and engineering behind every Live Lab — from single-cell biology and drug repurposing to Verilog, 6G and X-ray diffraction.";

/**
 * Appended to every post's `<title>`. The title-length check counts it, because
 * a search result truncates the whole string, not just the part the author typed.
 */
export const TITLE_SUFFIX = ` — ${SITE_NAME}`;

export function searchTitle(post: { title: string; metaTitle?: string | null }): string {
  return `${(post.metaTitle || post.title).trim()}${TITLE_SUFFIX}`;
}

/** "Scherrer's Equation, Explained" → "scherrers-equation-explained". */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

export function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

/** "a, b,\nB , c" → ["a", "b", "c"]: trimmed, de-duplicated ignoring case, at most 15. */
export function parseKeywordInput(text: string): string[] {
  const seen = new Set<string>();
  const keywords: string[] = [];
  for (const raw of text.split(/[,\n]/)) {
    const keyword = raw.trim().replace(/\s+/g, " ");
    const key = keyword.toLowerCase();
    if (keyword && !seen.has(key)) {
      seen.add(key);
      keywords.push(keyword);
    }
  }
  return keywords.slice(0, 15);
}

/* ------------------------------------------------------------------------ */
/* Markdown subset                                                          */
/* ------------------------------------------------------------------------ */

export type Block =
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; text: string }
  | { type: "image"; alt: string; src: string }
  | { type: "rule" };

type HeadingBlock = Extract<Block, { type: "heading" }>;
type ParagraphBlock = Extract<Block, { type: "paragraph" }>;

const FENCE = /^```/;
const HEADING = /^(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/;
const RULE = /^(?:-{3,}|\*{3,}|_{3,})$/;
const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
const QUOTE = /^>/;
const BULLET = /^[-*+]\s+/;
const NUMBERED = /^\d+[.)]\s+/;

function startsBlock(line: string): boolean {
  return [FENCE, HEADING, RULE, IMAGE, QUOTE, BULLET, NUMBERED].some((re) => re.test(line));
}

/**
 * Parse a post body into blocks.
 *
 * Supported: `##` and `###` headings, paragraphs, `-` and `1.` lists, `>`
 * quotes, fenced code, a standalone `![alt](src)` image line and `---`. Inline
 * marks — bold, italic, code and `[links](/path)` — stay in the text for the
 * renderer. A `#` heading becomes a section heading, because the post title is
 * the page's only `<h1>`; `####` and deeper collapse to level 3.
 */
export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  const seenIds = new Map<string, number>();
  const idFor = (text: string) => {
    const base = slugify(plainText(text)) || "section";
    const count = (seenIds.get(base) ?? 0) + 1;
    seenIds.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }

    if (FENCE.test(line)) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !FENCE.test(lines[i].trim())) code.push(lines[i++]);
      i++; // the closing fence; an unclosed fence runs to the end of the post
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const level = heading[1].length <= 2 ? 2 : 3;
      blocks.push({ type: "heading", level, text: heading[2], id: idFor(heading[2]) });
      i++;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ type: "rule" });
      i++;
      continue;
    }

    const image = IMAGE.exec(line);
    if (image) {
      blocks.push({ type: "image", alt: image[1], src: image[2] });
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      const parts: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i].trim())) {
        parts.push(lines[i++].trim().replace(/^>\s?/, ""));
      }
      blocks.push({ type: "quote", text: parts.join(" ") });
      continue;
    }

    if (BULLET.test(line) || NUMBERED.test(line)) {
      const ordered = NUMBERED.test(line);
      const marker = ordered ? NUMBERED : BULLET;
      const items: string[] = [];
      while (i < lines.length) {
        const raw = lines[i];
        const trimmed = raw.trim();
        if (marker.test(trimmed)) items.push(trimmed.replace(marker, ""));
        // An indented line that does not start a new block continues the item above.
        else if (trimmed && /^\s/.test(raw) && !startsBlock(trimmed)) items[items.length - 1] += ` ${trimmed}`;
        else break;
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // A paragraph always consumes its first line, so the loop cannot stall on a
    // line that no rule above claimed.
    const parts = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i].trim())) {
      parts.push(lines[i++].trim());
    }
    blocks.push({ type: "paragraph", text: parts.join(" ") });
  }

  return blocks;
}

/** Inline marks removed: `[text](url)` → text, and bold, italic and code markers dropped. */
export function plainText(inline: string): string {
  return inline
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\s][^*]*)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

/** The readable prose of a block. Code, images and rules are not prose. */
function blockText(block: Block): string {
  switch (block.type) {
    case "heading":
    case "paragraph":
    case "quote":
      return plainText(block.text);
    case "list":
      return block.items.map(plainText).join(" ");
    default:
      return "";
  }
}

function countWords(text: string): number {
  return (text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;
}

export function wordCount(blocks: Block[]): number {
  return countWords(blocks.map(blockText).join(" "));
}

export function readingMinutes(blocks: Block[]): number {
  return Math.max(1, Math.round(wordCount(blocks) / 220));
}

/* ------------------------------------------------------------------------ */
/* SEO checklist                                                            */
/* ------------------------------------------------------------------------ */

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-phrase, case-insensitive matches, treating a space and a hyphen as the same. */
function countPhrase(text: string, phrase: string): number {
  const words = phrase.trim().toLowerCase().split(/[\s-]+/).filter(Boolean).map(escapeRegExp);
  if (!words.length) return 0;
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${words.join("[\\s-]+")}(?![\\p{L}\\p{N}])`, "giu");
  return (text.match(pattern) ?? []).length;
}

const SITE_HOST = new URL(SITE_URL).host.replace(/^www\./, "");

/** A Markdown link to a site path, or to an absolute URL on this site's own host. */
const INTERNAL_LINK = new RegExp(`\\]\\((?:/(?!/)|https?://(?:www\\.)?${escapeRegExp(SITE_HOST)}[/)#?])`, "i");

export type SeoInput = {
  title: string;
  metaTitle: string;
  slug: string;
  description: string;
  body: string;
  focusKeyword: string;
  keywords: string[];
  hasLab: boolean;
  coverImage: string;
  coverAlt: string;
};

export type SeoCheck = { id: string; ok: boolean; label: string; hint: string };

/**
 * The on-page checklist shown beside the editor.
 *
 * These are the conventional on-page signals — keyword placement, length,
 * structure, internal links — and nothing more. Passing all of them makes a
 * post easy for a search engine to understand; it does not make it rank.
 * Ranking also depends on whether the article is genuinely the best answer to
 * the query and on links from other sites, neither of which can be read from
 * the text.
 *
 * `focusKeywordsInUse` holds every other post's focus keyword, for the
 * cannibalisation check.
 */
export function seoChecks(input: SeoInput, focusKeywordsInUse: string[]): SeoCheck[] {
  const blocks = parseMarkdown(input.body);
  const prose = blocks.map(blockText).join(" ");
  const words = countWords(prose);
  const subheadings = blocks.filter((b): b is HeadingBlock => b.type === "heading");
  const firstParagraph = blocks.find((b): b is ParagraphBlock => b.type === "paragraph");
  const titleLength = searchTitle(input).length;
  const descriptionLength = input.description.trim().length;
  const keyword = input.focusKeyword.trim();
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  const checks: SeoCheck[] = [
    {
      id: "title-length",
      ok: titleLength >= 30 && titleLength <= 60,
      label: `Search title is ${titleLength} characters`,
      hint: `Aim for 30–60, counting the "${TITLE_SUFFIX.trim()}" suffix — longer titles are cut off in results. The SEO title field shortens it without changing the headline.`,
    },
    {
      id: "description-length",
      ok: descriptionLength >= 120 && descriptionLength <= 160,
      label: `Meta description is ${descriptionLength} characters`,
      hint: "Aim for 120–160. It is the snippet under the title in search results, so write it to earn the click.",
    },
    {
      id: "length",
      ok: words >= 600,
      label: plural(words, "word"),
      hint: "Aim for 600 or more. A short post rarely covers a topic well enough to be the best result for it.",
    },
    {
      id: "structure",
      ok: subheadings.length >= 2,
      label: plural(subheadings.length, "subheading"),
      hint: "Break the article into at least two ## sections, so readers can scan it and search engines can see its structure.",
    },
    {
      id: "internal-link",
      ok: INTERNAL_LINK.test(input.body),
      label: "Links to another page on the site",
      hint: "Link to a related post or to the catalogue, e.g. [explore the labs](/labs). Internal links spread ranking between pages and keep readers on the site.",
    },
    {
      id: "lab",
      ok: input.hasLab,
      label: "Linked to a lab",
      hint: "Choose the lab this post is about. The post then ends with a card linking to it, and appears on that lab's topic page.",
    },
    {
      id: "keywords-count",
      ok: input.keywords.length >= 3 && input.keywords.length <= 10,
      label: plural(input.keywords.length, "related keyword"),
      hint: "Add 3–10 related phrases. They describe the post in structured data, and remind you what else it should cover.",
    },
  ];

  if (input.coverImage.trim()) {
    checks.push({
      id: "cover-alt",
      ok: Boolean(input.coverAlt.trim()),
      label: "Cover image has alt text",
      hint: "Describe the image for screen readers and image search.",
    });
  }

  if (!keyword) {
    checks.unshift({
      id: "keyword-set",
      ok: false,
      label: "Focus keyword chosen",
      hint: "Pick the one search phrase this post should rank for. The keyword checks appear once it is set.",
    });
    return checks;
  }

  const mentions = countPhrase(prose, keyword);
  const density = words ? (mentions * countWords(keyword)) / words : 0;
  const keywordSlug = slugify(keyword);

  checks.unshift(
    {
      id: "keyword-unique",
      ok: !focusKeywordsInUse.some((k) => k.trim().toLowerCase() === keyword.toLowerCase()),
      label: "No other post targets this keyword",
      hint: "Another post already has this focus keyword. Two pages competing for one query split its ranking — give this post a different angle.",
    },
    {
      id: "keyword-title",
      ok: countPhrase(input.metaTitle || input.title, keyword) > 0,
      label: "Keyword in the search title",
      hint: "Put the focus keyword in the title, ideally near the start.",
    },
    {
      id: "keyword-description",
      ok: countPhrase(input.description, keyword) > 0,
      label: "Keyword in the meta description",
      hint: "Search engines bold the searched phrase in the snippet, which draws the eye to your result.",
    },
    {
      id: "keyword-slug",
      ok: Boolean(keywordSlug) && input.slug.includes(keywordSlug),
      label: "Keyword in the URL",
      hint: `Include "${keywordSlug}" in the URL slug.`,
    },
    {
      id: "keyword-intro",
      ok: Boolean(firstParagraph) && countPhrase(plainText(firstParagraph?.text ?? ""), keyword) > 0,
      label: "Keyword in the first paragraph",
      hint: "Use the keyword early, so readers and search engines both know at once what the post is about.",
    },
    {
      id: "keyword-subheading",
      ok: subheadings.some((h) => countPhrase(plainText(h.text), keyword) > 0),
      label: "Keyword in a subheading",
      hint: "Use the keyword, or a close variant of it, in at least one ## heading.",
    },
    {
      id: "keyword-frequency",
      ok: mentions >= 2 && density <= 0.03,
      label: `Keyword appears ${plural(mentions, "time")} in the text`,
      hint:
        density > 0.03
          ? "That reads as keyword stuffing, which search engines penalise. Use synonyms and natural phrasing."
          : "Use the keyword naturally at least twice in the article.",
    },
  );

  return checks;
}

import {
  type Block,
  type SeoCheck,
  type SeoInput,
  SITE_HOST,
  blockText,
  countPhrase,
  countWords,
  parseMarkdown,
  plainText,
  slugify,
} from "@/lib/blog";

/**
 * Readability and content analysis for the blog editor.
 *
 * Like `src/lib/blog.ts` this touches nothing but text, so the browser runs the
 * same code the server would — a number shown beside the editor is computed
 * from the same body that gets published.
 *
 * Every measure here is a heuristic over English prose, not a fact about the
 * article. Sentence splitting guesses at abbreviations, the syllable counter is
 * a rule of thumb, and the passive-voice detector matches a grammatical shape
 * rather than understanding the sentence — it will call "the result was
 * surprising" passive and miss "the sample got contaminated". They are worth
 * having as a nudge to reread a paragraph. They are not a score to optimise,
 * and no search engine reads any of them.
 */

/* ------------------------------------------------------------------------ */
/* Sentences                                                                */
/* ------------------------------------------------------------------------ */

/**
 * Abbreviations whose full stop does not end a sentence. Without this list,
 * "measured at 40 kV, i.e. the standard setting" counts as two sentences and
 * drags the average sentence length down.
 */
const ABBREVIATION =
  /\b(?:e\.g|i\.e|etc|vs|approx|cf|al|Dr|Mr|Mrs|Ms|Prof|Fig|Eq|Ref|No|St|Jr|Sr|Inc|Ltd|Co|Vol|pp|Ch)\.(?=\s)/gi;

/**
 * Stands in for a masked full stop while splitting, restored immediately after.
 * Built at runtime rather than written as a literal: a NUL byte in a source file
 * makes every text tool treat it as binary.
 */
const MASK = String.fromCharCode(0);

/** Split prose into sentences. Decimals are safe: the split needs whitespace after the stop. */
export function splitSentences(prose: string): string[] {
  return prose
    // Every stop in the match, not just the first: "i.e." carries two, and the
    // trailing one is the one that would otherwise end the sentence.
    .replace(ABBREVIATION, (match) => match.split(".").join(MASK))
    .split(/(?<=[.!?…])["'”’)\]]*\s+/)
    .map((sentence) => sentence.split(MASK).join(".").trim())
    .filter(Boolean);
}

function wordsOf(text: string): string[] {
  return text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? [];
}

/* ------------------------------------------------------------------------ */
/* Readability                                                              */
/* ------------------------------------------------------------------------ */

/**
 * Vowel-group syllable estimate. Wrong on plenty of words — "diffraction" and
 * "crystallite" both come out short — but wrong consistently, which is what a
 * comparison between two drafts needs.
 */
export function syllablesIn(word: string): number {
  const letters = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!letters) return 0;
  if (letters.length <= 3) return 1;
  const trimmed = letters.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  return (trimmed.match(/[aeiouy]{1,2}/g) ?? []).length || 1;
}

const BANDS: { min: number; label: string; audience: string }[] = [
  { min: 90, label: "Very easy", audience: "around age 11" },
  { min: 80, label: "Easy", audience: "around age 12" },
  { min: 70, label: "Fairly easy", audience: "around age 13" },
  { min: 60, label: "Plain English", audience: "13–15 year olds" },
  { min: 50, label: "Fairly difficult", audience: "16–18 year olds" },
  { min: 30, label: "Difficult", audience: "undergraduates" },
  { min: 0, label: "Very difficult", audience: "graduates" },
];

export type Readability = {
  /** Flesch Reading Ease, clamped to 0–100. Higher is easier. */
  ease: number;
  band: string;
  audience: string;
  /** Flesch–Kincaid grade level, in US school years. */
  grade: number;
  words: number;
  sentences: number;
  syllables: number;
  avgSentenceWords: number;
  avgSyllablesPerWord: number;
};

export function readability(prose: string): Readability {
  const sentences = splitSentences(prose);
  const words = wordsOf(prose);
  const syllables = words.reduce((total, word) => total + syllablesIn(word), 0);

  if (!words.length || !sentences.length) {
    return {
      ease: 0,
      band: "—",
      audience: "—",
      grade: 0,
      words: words.length,
      sentences: sentences.length,
      syllables,
      avgSentenceWords: 0,
      avgSyllablesPerWord: 0,
    };
  }

  const perSentence = words.length / sentences.length;
  const perWord = syllables / words.length;
  const ease = Math.max(0, Math.min(100, 206.835 - 1.015 * perSentence - 84.6 * perWord));
  const band = BANDS.find((entry) => ease >= entry.min) ?? BANDS[BANDS.length - 1];

  return {
    ease: Math.round(ease),
    band: band.label,
    audience: band.audience,
    grade: Math.max(0, Math.round((0.39 * perSentence + 11.8 * perWord - 15.59) * 10) / 10),
    words: words.length,
    sentences: sentences.length,
    syllables,
    avgSentenceWords: Math.round(perSentence * 10) / 10,
    avgSyllablesPerWord: Math.round(perWord * 100) / 100,
  };
}

/* ------------------------------------------------------------------------ */
/* Passive voice                                                            */
/* ------------------------------------------------------------------------ */

/** Past participles that do not end in -ed or -en, so the shape below can spot them. */
const IRREGULAR_PARTICIPLES = new Set(
  (
    "been born brought bought built burnt caught chosen cut dealt done drawn drunk dug fed felt" +
    " flown forbidden found frozen given gone grown heard held hidden hit hung hurt kept known laid" +
    " led left lent let lit lost made meant met paid put read run said seen sent set shaken shot" +
    " shown shut slept slid sold sought spent split spoken spread stolen stood struck sung sunk" +
    " swept sworn swum taken taught thought thrown told torn understood withdrawn woken won worn" +
    " written"
  ).split(" "),
);

/**
 * `was measured`, `is being written`, `have been shown` — a form of *to be*
 * followed by a past participle, with adverbs or negation allowed between.
 *
 * This matches a shape; it does not understand the sentence. "The result was
 * surprising" is not passive and this counts it, and "the sample got
 * contaminated" is passive and this misses it. Read the flagged sentences
 * rather than trusting the percentage.
 */
const PASSIVE_SHAPE =
  /\b(?:am|is|are|was|were|be|been|being)\b(?:\s+(?:not|never|also|already|now|then|still|only|just|being|been))*(?:\s+[a-z]+ly)?\s+([a-z]+)/gi;

function isParticiple(word: string): boolean {
  const lower = word.toLowerCase();
  if (IRREGULAR_PARTICIPLES.has(lower)) return true;
  return lower.length > 3 && (lower.endsWith("ed") || lower.endsWith("en"));
}

export function isPassive(sentence: string): boolean {
  PASSIVE_SHAPE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = PASSIVE_SHAPE.exec(sentence)) !== null) {
    if (isParticiple(match[1])) return true;
  }
  return false;
}

/* ------------------------------------------------------------------------ */
/* Transition words                                                         */
/* ------------------------------------------------------------------------ */

/**
 * Words that signal how one sentence follows from the last. A run of sentences
 * with none of them tends to read as a list of facts rather than an argument.
 */
const TRANSITIONS = [
  "accordingly", "additionally", "after", "afterwards", "also", "alternatively", "although",
  "as a result", "at the same time", "because", "before", "besides", "but", "by contrast",
  "consequently", "conversely", "crucially", "despite", "earlier", "equally", "especially",
  "even so", "finally", "first", "firstly", "for example", "for instance", "further",
  "furthermore", "hence", "however", "in addition", "in contrast", "in fact", "in other words",
  "in particular", "in practice", "in short", "in summary", "in turn", "indeed", "instead",
  "later", "likewise", "meanwhile", "moreover", "nevertheless", "next", "nonetheless",
  "notably", "on the other hand", "once", "otherwise", "overall", "rather", "second",
  "secondly", "similarly", "since", "so", "specifically", "still", "that is", "then",
  "therefore", "though", "thus", "to summarise", "to summarize", "unless", "until",
  "what is more", "whereas", "while", "yet",
];

const TRANSITION_PATTERN = new RegExp(
  `(?<![\\p{L}\\p{N}])(?:${TRANSITIONS.map((word) => word.split(" ").join("\\s+")).join("|")})(?![\\p{L}\\p{N}])`,
  "iu",
);

export function hasTransition(sentence: string): boolean {
  return TRANSITION_PATTERN.test(sentence);
}

/* ------------------------------------------------------------------------ */
/* Keyword usage                                                            */
/* ------------------------------------------------------------------------ */

export type KeywordUse = {
  keyword: string;
  focus: boolean;
  count: number;
  /** Share of the body's words taken up by this phrase. 0.012 is 1.2%. */
  density: number;
  inTitle: boolean;
  inDescription: boolean;
  inSlug: boolean;
  inIntro: boolean;
  inHeading: boolean;
  inAlt: boolean;
};

/* ------------------------------------------------------------------------ */
/* Links and images                                                         */
/* ------------------------------------------------------------------------ */

export type LinkKind = "internal" | "external" | "anchor" | "mail" | "unsafe";
export type LinkUse = { text: string; href: string; kind: LinkKind };

const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function linkKind(href: string): LinkKind {
  if (href.startsWith("#")) return "anchor";
  if (href.startsWith("/") && !href.startsWith("//")) return "internal";
  if (href.startsWith("mailto:")) return "mail";
  try {
    const url = new URL(href);
    if (!["http:", "https:"].includes(url.protocol)) return "unsafe";
    return url.host.replace(/^www\./, "") === SITE_HOST ? "internal" : "external";
  } catch {
    // Neither a path nor a URL, so the renderer prints it as plain text.
    return "unsafe";
  }
}

export function collectLinks(body: string): LinkUse[] {
  const links: LinkUse[] = [];
  MARKDOWN_LINK.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = MARKDOWN_LINK.exec(body)) !== null) {
    // `![alt](src)` is an image, not a link.
    if (match.index > 0 && body[match.index - 1] === "!") continue;
    links.push({ text: plainText(match[1]), href: match[2], kind: linkKind(match[2]) });
  }
  return links;
}

/* ------------------------------------------------------------------------ */
/* Phrase mining                                                            */
/* ------------------------------------------------------------------------ */

const STOPWORDS = new Set(
  (
    "a an the and or but if then than that this these those of in on at to for from by with without" +
    " as is are was were be been being it its his her their our your my we you they he she i not no" +
    " do does did can could should would will shall may might must have has had how what when where" +
    " which who whom why into over under about after before between during more most much many some" +
    " any each every both all one two also so such only just very there here them us"
  ).split(" "),
);

export type Phrase = { phrase: string; count: number };

/**
 * Two- and three-word phrases the article repeats.
 *
 * These are the post's own vocabulary, offered as candidates for the related
 * keyword list: they say what this draft talks about most, which is a different
 * question from what anyone searches for. There is no search-volume data behind
 * them and none is implied.
 */
export function minePhrases(prose: string, limit = 10): Phrase[] {
  const tokens = wordsOf(prose.toLowerCase());
  const counts = new Map<string, number>();

  for (const size of [2, 3]) {
    for (let i = 0; i + size <= tokens.length; i++) {
      const window = tokens.slice(i, i + size);
      // A phrase that opens or closes on a stopword is a fragment, not a topic.
      if (STOPWORDS.has(window[0]) || STOPWORDS.has(window[window.length - 1])) continue;
      if (window.some((token) => token.length < 3 || /^\d+$/.test(token))) continue;
      const phrase = window.join(" ");
      counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
    }
  }

  const byWeight = [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count * b.phrase.split(" ").length - a.count * a.phrase.split(" ").length);

  // "crystallite size broadening" and "crystallite size" counted the same number
  // of times are one phrase, not two — keep the longer one.
  const kept: Phrase[] = [];
  for (const candidate of byWeight) {
    const swallowed = kept.some(
      (other) => other.phrase.includes(candidate.phrase) && other.count >= candidate.count,
    );
    if (!swallowed) kept.push(candidate);
    if (kept.length >= limit) break;
  }
  return kept;
}

/* ------------------------------------------------------------------------ */
/* The whole analysis                                                       */
/* ------------------------------------------------------------------------ */

export type ContentAnalysis = {
  blocks: Block[];
  words: number;
  characters: number;
  readingMinutes: number;
  readability: Readability;
  sentences: string[];
  longSentences: { count: number; share: number; examples: string[] };
  paragraphs: { count: number; longest: number; long: number };
  passive: { count: number; share: number; examples: string[] };
  transitions: { count: number; share: number };
  /** Runs of three or more consecutive sentences opening on the same word. */
  repeatedOpeners: { word: string; run: number }[];
  /** The longest stretch of words with no `##` or `###` heading in it. */
  longestSectionWords: number;
  headings: { level: 2 | 3; text: string; id: string }[];
  keywordUse: KeywordUse[];
  links: LinkUse[];
  images: { src: string; alt: string }[];
  phrases: Phrase[];
  checks: SeoCheck[];
};

export const LONG_SENTENCE_WORDS = 25;
export const LONG_PARAGRAPH_WORDS = 150;
export const SECTION_WORDS = 300;

function example(sentence: string): string {
  return sentence.length <= 110 ? sentence : `${sentence.slice(0, 109).trimEnd()}…`;
}

export function analyseContent(input: SeoInput): ContentAnalysis {
  const blocks = parseMarkdown(input.body);
  const prose = blocks.map(blockText).join(" ");
  const words = countWords(prose);
  const sentences = splitSentences(prose);

  const long = sentences.filter((sentence) => countWords(sentence) > LONG_SENTENCE_WORDS);
  const passiveSentences = sentences.filter(isPassive);
  const withTransition = sentences.filter(hasTransition);

  const paragraphs = blocks.filter(
    (block): block is Extract<Block, { type: "paragraph" }> => block.type === "paragraph",
  );
  const paragraphWords = paragraphs.map((block) => countWords(plainText(block.text)));

  const headings = blocks.filter(
    (block): block is Extract<Block, { type: "heading" }> => block.type === "heading",
  );

  // How far the reader goes without a signpost: the words between one heading
  // and the next, and the run from the last heading to the end.
  let longestSectionWords = 0;
  let run = 0;
  for (const block of blocks) {
    if (block.type === "heading") {
      longestSectionWords = Math.max(longestSectionWords, run);
      run = 0;
    } else {
      run += countWords(blockText(block));
    }
  }
  longestSectionWords = Math.max(longestSectionWords, run);

  const repeatedOpeners: { word: string; run: number }[] = [];
  let openerRun = 1;
  for (let i = 1; i <= sentences.length; i++) {
    const previous = wordsOf(sentences[i - 1])[0]?.toLowerCase() ?? "";
    const current = i < sentences.length ? (wordsOf(sentences[i])[0]?.toLowerCase() ?? "") : "";
    if (current && current === previous) {
      openerRun++;
    } else {
      if (openerRun >= 3 && previous) repeatedOpeners.push({ word: previous, run: openerRun });
      openerRun = 1;
    }
  }

  const images = blocks
    .filter((block): block is Extract<Block, { type: "image" }> => block.type === "image")
    .map((block) => ({ src: block.src, alt: block.alt }));

  const intro = paragraphs[0];
  const introText = intro ? plainText(intro.text) : "";
  const headingText = headings.map((heading) => plainText(heading.text)).join(" ");
  const altText = [...images.map((image) => image.alt), input.coverAlt].join(" ");
  const searchTitleText = input.metaTitle || input.title;

  const focus = input.focusKeyword.trim();
  const toCheck = [
    ...(focus ? [{ keyword: focus, focus: true }] : []),
    ...input.keywords
      .filter((keyword) => keyword.trim() && keyword.trim().toLowerCase() !== focus.toLowerCase())
      .map((keyword) => ({ keyword: keyword.trim(), focus: false })),
  ];

  const keywordUse: KeywordUse[] = toCheck.map(({ keyword, focus: isFocus }) => {
    const count = countPhrase(prose, keyword);
    const keywordSlug = slugify(keyword);
    return {
      keyword,
      focus: isFocus,
      count,
      density: words ? (count * countWords(keyword)) / words : 0,
      inTitle: countPhrase(searchTitleText, keyword) > 0,
      inDescription: countPhrase(input.description, keyword) > 0,
      inSlug: Boolean(keywordSlug) && input.slug.includes(keywordSlug),
      inIntro: countPhrase(introText, keyword) > 0,
      inHeading: countPhrase(headingText, keyword) > 0,
      inAlt: countPhrase(altText, keyword) > 0,
    };
  });

  const analysis: Omit<ContentAnalysis, "checks"> = {
    blocks,
    words,
    characters: input.body.length,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    readability: readability(prose),
    sentences,
    longSentences: {
      count: long.length,
      share: sentences.length ? long.length / sentences.length : 0,
      examples: long.slice(0, 3).map(example),
    },
    paragraphs: {
      count: paragraphs.length,
      longest: paragraphWords.length ? Math.max(...paragraphWords) : 0,
      long: paragraphWords.filter((count) => count > LONG_PARAGRAPH_WORDS).length,
    },
    passive: {
      count: passiveSentences.length,
      share: sentences.length ? passiveSentences.length / sentences.length : 0,
      examples: passiveSentences.slice(0, 3).map(example),
    },
    transitions: {
      count: withTransition.length,
      share: sentences.length ? withTransition.length / sentences.length : 0,
    },
    repeatedOpeners,
    longestSectionWords,
    headings: headings.map((heading) => ({
      level: heading.level,
      text: plainText(heading.text),
      id: heading.id,
    })),
    keywordUse,
    links: collectLinks(input.body),
    images,
    phrases: minePhrases(prose),
  };

  return { ...analysis, checks: contentChecks(analysis) };
}

const percent = (share: number) => `${Math.round(share * 100)}%`;

/**
 * The readability half of the checklist.
 *
 * Deliberately separate from `seoChecks`: those describe how a search engine
 * reads the page, these describe how a person reads it. Neither is a ranking
 * formula — see the note at the top of this file.
 */
export function contentChecks(analysis: Omit<ContentAnalysis, "checks">): SeoCheck[] {
  const score = analysis.readability;
  // Percentages over three or four sentences say nothing, so the prose checks
  // stay unjudged until there is enough of it to measure.
  const enough = analysis.sentences.length >= 5;

  const checks: SeoCheck[] = [
    {
      id: "readability-ease",
      ok: enough && score.ease >= 50,
      label: enough ? `Reading ease ${score.ease} — ${score.band.toLowerCase()}` : "Reading ease",
      hint: enough
        ? "Below 50 the prose reads as heavy going. Shorten sentences, and prefer shorter words wherever the meaning survives — terms that carry real meaning should stay."
        : "Write a few more sentences before this means anything.",
    },
    {
      id: "sentence-length",
      ok: enough && analysis.longSentences.share <= 0.25,
      label: `${analysis.longSentences.count} sentences over ${LONG_SENTENCE_WORDS} words (${percent(analysis.longSentences.share)})`,
      hint: "Keep it under a quarter. A long sentence is where the reader loses the thread; most can be split at their “and” or their comma.",
    },
    {
      id: "paragraph-length",
      ok: analysis.paragraphs.long === 0,
      label:
        analysis.paragraphs.long === 0
          ? `Longest paragraph is ${analysis.paragraphs.longest} words`
          : `${analysis.paragraphs.long} paragraphs over ${LONG_PARAGRAPH_WORDS} words`,
      hint: `Break paragraphs longer than ${LONG_PARAGRAPH_WORDS} words. A wall of text on a phone screen gets skipped.`,
    },
    {
      id: "passive-voice",
      ok: enough && analysis.passive.share <= 0.12,
      label: `${percent(analysis.passive.share)} of sentences look passive`,
      hint: "Aim for 12% or less. Naming who did what is usually shorter and clearer. This matches sentence shape rather than meaning, so read the examples before rewriting.",
    },
    {
      id: "transitions",
      ok: enough && analysis.transitions.share >= 0.2,
      label: `${percent(analysis.transitions.share)} of sentences use a transition`,
      hint: "Aim for 20% or more. Words like “however”, “because” and “as a result” are what turn a list of facts into an argument.",
    },
    {
      id: "repeated-openers",
      ok: analysis.repeatedOpeners.length === 0,
      label:
        analysis.repeatedOpeners.length === 0
          ? "No repeated sentence openers"
          : `Sentences opening on “${analysis.repeatedOpeners[0].word}” ${analysis.repeatedOpeners[0].run} times in a row`,
      hint: "Three or more sentences starting on the same word reads as a drumbeat. Vary the opening.",
    },
    {
      id: "subheading-distribution",
      ok: analysis.longestSectionWords <= SECTION_WORDS,
      label: `Longest stretch without a subheading: ${analysis.longestSectionWords} words`,
      hint: `Add a ## heading wherever the argument turns, so no stretch runs past ${SECTION_WORDS} words. Readers scan headings before they read anything.`,
    },
  ];

  if (analysis.images.length) {
    const missing = analysis.images.filter((image) => !image.alt.trim()).length;
    checks.push({
      id: "body-image-alt",
      ok: missing === 0,
      label:
        missing === 0
          ? `All ${analysis.images.length} body images have alt text`
          : `${missing} body images have no alt text`,
      hint: "Describe each image in its ![alt](src) text — for screen readers, for image search, and for when the image fails to load.",
    });
  }

  return checks;
}

/* ------------------------------------------------------------------------ */
/* Optimization grade                                                       */
/* ------------------------------------------------------------------------ */

export type Grade = {
  score: number;
  passed: number;
  total: number;
  band: "Low" | "Medium" | "High";
};

/**
 * The gauge above the analysis panel: the share of checks that pass, with the
 * search checks and the readability checks weighted equally.
 *
 * It is a completeness meter for the on-page basics, not a prediction. A post
 * can pass every check and rank nowhere, and a post that ignores half of them
 * can rank first because it is the best answer anyone has written to the query.
 */
export function optimizationGrade(seo: SeoCheck[], content: SeoCheck[]): Grade {
  const all = [...seo, ...content];
  const passed = all.filter((check) => check.ok).length;
  const score = all.length ? Math.round((passed / all.length) * 100) : 0;
  return {
    score,
    passed,
    total: all.length,
    band: score >= 80 ? "High" : score >= 50 ? "Medium" : "Low",
  };
}

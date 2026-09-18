"use client";

import { useState } from "react";
import {
  CircleAlert,
  CircleCheck,
  ExternalLink,
  Hash,
  Image as ImageIcon,
  Link2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type { SeoCheck } from "@/lib/blog";
import type { ContentAnalysis, Grade, KeywordUse } from "@/lib/blogAnalysis";

export type TabId = "input" | "seo" | "ai" | "content" | "tools";

type Props = {
  grade: Grade;
  seo: SeoCheck[];
  analysis: ContentAnalysis;
  /** The Input and AI tabs hold editor state, so the editor renders them. */
  inputSlot: React.ReactNode;
  aiSlot: React.ReactNode;
  /** Scrolls the body textarea to a heading. */
  onJumpToHeading: (text: string) => void;
};

const HELP = "text-xs leading-relaxed text-muted-foreground";

/* ------------------------------------------------------------------------ */
/* Gauge                                                                    */
/* ------------------------------------------------------------------------ */

const BAND_TEXT = { Low: "text-rose-500", Medium: "text-amber-500", High: "text-emerald-500" } as const;
const BAND_STROKE = { Low: "stroke-rose-500", Medium: "stroke-amber-500", High: "stroke-emerald-500" } as const;
const BAND_BG = { Low: "bg-rose-500", Medium: "bg-amber-500", High: "bg-emerald-500" } as const;

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function Gauge({ grade }: { grade: Grade }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90" role="img" aria-label={`Optimization grade ${grade.score} out of 100`}>
          <circle cx="55" cy="55" r={RADIUS} fill="none" strokeWidth="8" className="stroke-muted" />
          <circle
            cx="55"
            cy="55"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - grade.score / 100)}
            className={`${BAND_STROKE[grade.band]} transition-[stroke-dashoffset] duration-500`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold tabular-nums ${BAND_TEXT[grade.band]}`}>{grade.score}</span>
          <span className="text-[0.6875rem] tabular-nums text-muted-foreground">
            {grade.passed}/{grade.total} checks
          </span>
        </div>
      </div>

      <p className="mt-2 text-sm font-semibold">Optimization grade</p>

      <div className="mt-2 grid w-full grid-cols-3 gap-1.5">
        {(["Low", "Medium", "High"] as const).map((band) => (
          <div key={band}>
            <div className={`h-1.5 rounded-full ${grade.band === band ? BAND_BG[band] : "bg-muted"}`} />
            <p
              className={`mt-1 text-center text-[0.6875rem] ${
                grade.band === band ? `font-semibold ${BAND_TEXT[band]}` : "text-muted-foreground"
              }`}
            >
              {band}
            </p>
          </div>
        ))}
      </div>

      <p className={`${HELP} mt-3 text-center`}>
        The share of on-page checks that pass, search and readability weighted equally. It measures whether the basics
        are in place — not whether the post will rank, which also depends on it being the best answer to the query and
        on links from other sites.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Shared pieces                                                            */
/* ------------------------------------------------------------------------ */

function CheckList({ checks }: { checks: SeoCheck[] }) {
  return (
    <ul className="space-y-3">
      {checks.map((check) => (
        <li key={check.id} className="flex gap-2.5 text-sm">
          {check.ok ? (
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-label="Passed" />
          ) : (
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-label="Needs work" />
          )}
          <div className="min-w-0">
            <p className={check.ok ? "text-muted-foreground" : "font-medium"}>{check.label}</p>
            {!check.ok ? <p className={`${HELP} mt-0.5`}>{check.hint}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <p className={`text-lg font-bold tabular-nums ${tone ?? ""}`}>{value}</p>
      <p className="text-[0.6875rem] leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Examples({ title, sentences }: { title: string; sentences: string[] }) {
  const [open, setOpen] = useState(false);
  if (!sentences.length) return null;
  return (
    <div className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setOpen((was) => !was)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium"
      >
        {title}
        <span className="text-muted-foreground">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? (
        <ul className="space-y-2 border-t border-border px-3 py-2">
          {sentences.map((sentence, index) => (
            <li key={index} className="text-xs leading-relaxed text-muted-foreground">
              “{sentence}”
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Keyword placement                                                        */
/* ------------------------------------------------------------------------ */

const PLACES: { key: keyof KeywordUse; label: string }[] = [
  { key: "inTitle", label: "Title" },
  { key: "inDescription", label: "Description" },
  { key: "inSlug", label: "URL" },
  { key: "inIntro", label: "Intro" },
  { key: "inHeading", label: "Heading" },
  { key: "inAlt", label: "Image alt" },
];

/** Density is only meaningful once there is prose to divide by. */
function densityTone(use: KeywordUse, words: number): string {
  if (words < 100) return "text-muted-foreground";
  if (use.density > 0.03) return "text-rose-500";
  if (use.count === 0) return "text-rose-500";
  if (use.focus && use.density < 0.005) return "text-amber-500";
  return "text-emerald-500";
}

function KeywordCard({ use, words }: { use: KeywordUse; words: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-medium">
          {use.keyword}
          {use.focus ? <span className="ml-1.5 text-[0.625rem] uppercase text-primary">focus</span> : null}
        </p>
        <span className={`shrink-0 text-xs tabular-nums ${densityTone(use, words)}`}>
          {use.count}× · {(use.density * 100).toFixed(2)}%
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {PLACES.map((place) => {
          const present = Boolean(use[place.key]);
          return (
            <span
              key={place.label}
              className={`rounded-full border px-1.5 py-0.5 text-[0.625rem] ${
                present
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-border text-muted-foreground"
              }`}
            >
              {place.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Tabs                                                                     */
/* ------------------------------------------------------------------------ */

function SeoTab({ seo, analysis }: { seo: SeoCheck[]; analysis: ContentAnalysis }) {
  return (
    <div className="space-y-5">
      <CheckList checks={seo} />

      {analysis.keywordUse.length ? (
        <Section title="Where each keyword appears">
          <div className="space-y-2">
            {analysis.keywordUse.map((use) => (
              <KeywordCard key={use.keyword} use={use} words={analysis.words} />
            ))}
          </div>
          <p className={`${HELP} mt-2`}>
            Counts are whole-phrase matches in the body, treating a space and a hyphen as the same. Density is the share
            of the body&rsquo;s words the phrase takes up; above 3% reads as keyword stuffing.
          </p>
        </Section>
      ) : null}
    </div>
  );
}

function ContentTab({ analysis }: { analysis: ContentAnalysis }) {
  const { readability: score } = analysis;
  const easeTone = score.ease >= 60 ? "text-emerald-500" : score.ease >= 50 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="space-y-5">
      <Section title="Readability">
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tabular-nums ${easeTone}`}>{score.ease}</span>
            <span className="text-sm font-medium">{score.band}</span>
          </div>
          <p className={`${HELP} mt-1`}>
            Flesch Reading Ease. Comfortable for readers {score.audience}; Flesch&ndash;Kincaid grade {score.grade}.
          </p>
        </div>
      </Section>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="words" value={String(analysis.words)} />
        <Stat label="sentences" value={String(analysis.readability.sentences)} />
        <Stat label="paragraphs" value={String(analysis.paragraphs.count)} />
        <Stat label="words per sentence" value={String(score.avgSentenceWords)} />
        <Stat label="syllables per word" value={String(score.avgSyllablesPerWord)} />
        <Stat label="min read" value={String(analysis.readingMinutes)} />
      </div>

      <Section title="Prose checks">
        <CheckList checks={analysis.checks} />
      </Section>

      {analysis.longSentences.examples.length || analysis.passive.examples.length ? (
        <Section title="Sentences to look at">
          <div className="space-y-2">
            <Examples title={`Longest sentences (${analysis.longSentences.count})`} sentences={analysis.longSentences.examples} />
            <Examples title={`Passive-looking sentences (${analysis.passive.count})`} sentences={analysis.passive.examples} />
          </div>
          <p className={`${HELP} mt-2`}>
            These are heuristics over English prose, not grammar. The passive detector matches sentence shape, so it
            flags “the result was surprising” and misses “the sample got contaminated”. Read them before you rewrite.
          </p>
        </Section>
      ) : null}
    </div>
  );
}

function ToolsTab({ analysis, onJumpToHeading }: { analysis: ContentAnalysis; onJumpToHeading: (text: string) => void }) {
  const internal = analysis.links.filter((link) => link.kind === "internal");
  const external = analysis.links.filter((link) => link.kind === "external");
  const broken = analysis.links.filter((link) => link.kind === "unsafe");

  return (
    <div className="space-y-5">
      <Section title="Outline">
        {analysis.headings.length ? (
          <ul className="space-y-1">
            {analysis.headings.map((heading, index) => (
              <li key={`${heading.id}-${index}`}>
                <button
                  type="button"
                  onClick={() => onJumpToHeading(heading.text)}
                  className={`w-full truncate rounded px-2 py-1 text-left text-sm transition-colors hover:bg-secondary ${
                    heading.level === 3 ? "pl-6 text-muted-foreground" : "font-medium"
                  }`}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={HELP}>No ## headings yet. They are what a reader scans before deciding to read.</p>
        )}
      </Section>

      <Section title="Links">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="internal" value={String(internal.length)} tone={internal.length ? "" : "text-amber-500"} />
          <Stat label="external" value={String(external.length)} />
          <Stat label="unusable" value={String(broken.length)} tone={broken.length ? "text-rose-500" : ""} />
        </div>
        {analysis.links.length ? (
          <ul className="mt-2 space-y-1.5">
            {analysis.links.map((link, index) => (
              <li key={index} className="flex items-start gap-2 text-xs">
                {link.kind === "unsafe" ? (
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                ) : link.kind === "external" ? (
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                ) : (
                  <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0">
                  <span className="block truncate">{link.text}</span>
                  <span className="block truncate text-muted-foreground">{link.href}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {broken.length ? (
          <p className={`${HELP} mt-2 text-rose-500`}>
            {broken.length} link{broken.length === 1 ? "" : "s"} point at neither a site path nor an http(s) URL. The
            renderer prints those as plain text rather than following them.
          </p>
        ) : null}
      </Section>

      <Section title="Images">
        {analysis.images.length ? (
          <ul className="space-y-1.5">
            {analysis.images.map((image, index) => (
              <li key={index} className="flex items-start gap-2 text-xs">
                <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate">{image.src}</span>
                  <span className={`block truncate ${image.alt.trim() ? "text-muted-foreground" : "text-amber-500"}`}>
                    {image.alt.trim() || "No alt text"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={HELP}>No images in the body.</p>
        )}
      </Section>

      <Section title="Phrases this draft repeats">
        {analysis.phrases.length ? (
          <div className="flex flex-wrap gap-1.5">
            {analysis.phrases.map((phrase) => (
              <span
                key={phrase.phrase}
                className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
              >
                <Hash className="h-3 w-3" />
                {phrase.phrase}
                <span className="tabular-nums">{phrase.count}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className={HELP}>Nothing repeats often enough yet.</p>
        )}
        <p className={`${HELP} mt-2`}>
          What this draft talks about most — useful as candidates for the related keyword list. It is not search-volume
          data; there is no such source in this application.
        </p>
      </Section>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* The panel                                                                */
/* ------------------------------------------------------------------------ */

const TABS: { id: TabId; label: string }[] = [
  { id: "input", label: "Input" },
  { id: "seo", label: "SEO" },
  { id: "ai", label: "AI" },
  { id: "content", label: "Content" },
  { id: "tools", label: "Tools" },
];

export default function AnalysisPanel({ grade, seo, analysis, inputSlot, aiSlot, onJumpToHeading }: Props) {
  const [tab, setTab] = useState<TabId>("input");

  const failing = (checks: SeoCheck[]) => checks.filter((check) => !check.ok).length;
  const badge: Partial<Record<TabId, number>> = { seo: failing(seo), content: failing(analysis.checks) };

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <Gauge grade={grade} />

      <div role="tablist" aria-label="Analysis" className="mt-5 flex gap-0.5 rounded-lg border border-border p-0.5">
        {TABS.map((entry) => {
          const active = tab === entry.id;
          const count = badge[entry.id];
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(entry.id)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium transition-colors ${
                active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {entry.id === "ai" ? <Sparkles className="h-3 w-3" /> : null}
              {entry.label}
              {count ? (
                <span className="rounded-full bg-amber-500/15 px-1 text-[0.625rem] tabular-nums text-amber-600 dark:text-amber-400">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {/* Hidden rather than unmounted: the Input tab holds form fields the
            server action reads, and an unmounted input submits nothing. */}
        <div hidden={tab !== "input"}>{inputSlot}</div>
        {tab === "seo" ? <SeoTab seo={seo} analysis={analysis} /> : null}
        {tab === "ai" ? aiSlot : null}
        {tab === "content" ? <ContentTab analysis={analysis} /> : null}
        {tab === "tools" ? <ToolsTab analysis={analysis} onJumpToHeading={onJumpToHeading} /> : null}
      </div>
    </section>
  );
}

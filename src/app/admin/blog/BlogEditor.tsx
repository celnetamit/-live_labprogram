"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck, ExternalLink, Eye, Loader2, Pencil, Plus, Save, Trash } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { labKeywords } from "@/content/blog/lab-keywords";
import {
  TITLE_SUFFIX,
  parseKeywordInput,
  parseMarkdown,
  readingMinutes,
  searchTitle,
  seoChecks,
  slugify,
  truncate,
  wordCount,
} from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { deletePost, savePost } from "./actions";

export type EditorLab = { id: string; slug: string | null; name: string; enabled: boolean };

export type EditorPost = {
  id: string;
  slug: string;
  title: string;
  metaTitle: string | null;
  description: string;
  body: string;
  focusKeyword: string;
  keywords: string[];
  coverImage: string | null;
  coverAlt: string | null;
  authorName: string;
  status: string;
  labId: string | null;
};

type Props = {
  post: EditorPost | null;
  labs: EditorLab[];
  otherFocusKeywords: { keyword: string; title: string }[];
  defaults: { labId: string; focusKeyword: string; authorName: string };
};

const FIELD =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const LABEL = "text-sm font-medium";
const HELP = "mt-1.5 text-xs leading-relaxed text-muted-foreground";

function Counter({ length, min, max }: { length: number; min: number; max: number }) {
  const tone = length >= min && length <= max ? "text-emerald-500" : length > max ? "text-rose-500" : "text-muted-foreground";
  return (
    <span className={`text-xs tabular-nums ${tone}`}>
      {length} / {min}–{max}
    </span>
  );
}

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="font-semibold">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Chip({
  label,
  selected,
  taken,
  title,
  onClick,
}: {
  label: string;
  selected: boolean;
  taken?: boolean;
  title?: string;
  onClick: () => void;
}) {
  const tone = selected
    ? "border-primary/40 bg-primary/10 text-primary"
    : taken
      ? "border-border text-muted-foreground/70 line-through hover:text-foreground"
      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={selected}
      title={title}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${tone}`}
    >
      {selected ? <CircleCheck className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      {label}
    </button>
  );
}

/**
 * The post editor. Every field is controlled so the SEO checklist and the search
 * preview can follow the author as they type; the form still submits through
 * FormData, so the server action sees exactly the named inputs.
 */
export default function BlogEditor({ post, labs, otherFocusKeywords, defaults }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slugInput, setSlugInput] = useState(post?.slug ?? "");
  // A new post's URL follows its headline until the author edits the URL.
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [description, setDescription] = useState(post?.description ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [focusKeyword, setFocusKeyword] = useState(post?.focusKeyword ?? defaults.focusKeyword);
  const [keywordText, setKeywordText] = useState((post?.keywords ?? []).join(", "));
  const [labId, setLabId] = useState(post?.labId ?? defaults.labId);
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [coverAlt, setCoverAlt] = useState(post?.coverAlt ?? "");
  const [authorName, setAuthorName] = useState(post?.authorName || defaults.authorName);
  const [status, setStatus] = useState(post?.status ?? "DRAFT");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const slug = slugify(slugEdited ? slugInput : title);
  const keywords = parseKeywordInput(keywordText);
  const lab = labs.find((l) => l.id === labId) ?? null;
  const suggestions = labKeywords(lab?.slug);
  const suggested = suggestions ? [suggestions.pillar, ...suggestions.related] : [];
  const blocks = parseMarkdown(body);
  const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  const usedBy = (keyword: string) => otherFocusKeywords.find((other) => same(other.keyword, keyword));
  const focusClash = focusKeyword.trim() ? usedBy(focusKeyword) : undefined;

  const checks = seoChecks(
    { title, metaTitle, slug, description, body, focusKeyword, keywords, hasLab: Boolean(lab), coverImage, coverAlt },
    otherFocusKeywords.map((other) => other.keyword),
  );
  const passed = checks.filter((check) => check.ok).length;
  const share = checks.length ? passed / checks.length : 0;
  const scoreTone = share >= 0.8 ? "emerald" : share >= 0.5 ? "amber" : "rose";

  const addKeyword = (keyword: string) => {
    if (!keywords.some((existing) => same(existing, keyword))) setKeywordText([...keywords, keyword].join(", "));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const result = await savePost(post?.id ?? null, new FormData(event.currentTarget));
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "ok", text: result.status === "PUBLISHED" ? "Saved — the post is live." : "Draft saved." });
      if (post) router.refresh();
      else router.replace(`/admin/blog/${result.id}`);
    } catch (error) {
      console.error(error);
      setMessage({ tone: "error", text: "The post could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!post || !confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deletePost(post.id);
      router.push("/admin/blog");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage({ tone: "error", text: "The post could not be deleted." });
      setDeleting(false);
    }
  }

  const tabClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
      active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-6">
        <Panel title="Article">
          <div>
            <label htmlFor="title" className={LABEL}>
              Headline
            </label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="The Scherrer equation: measuring crystallite size from XRD peaks"
              className={`${FIELD} mt-1.5 text-base font-semibold`}
            />
          </div>

          <div>
            <label htmlFor="slug" className={LABEL}>
              URL
            </label>
            <div className="mt-1.5 flex overflow-hidden rounded-md border border-input focus-within:ring-2 focus-within:ring-ring">
              <span className="flex items-center bg-muted px-3 text-sm text-muted-foreground">/blog/</span>
              <input
                id="slug"
                name="slug"
                value={slugEdited ? slugInput : slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlugInput(e.target.value);
                }}
                className="min-w-0 flex-1 bg-background px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            {post?.status === "PUBLISHED" && slug !== post.slug ? (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                This post is live at /blog/{post.slug}. Changing its URL breaks every existing link to it and starts its
                search ranking again from nothing.
              </p>
            ) : slugEdited && slugInput && slugInput !== slug ? (
              <p className={HELP}>Will be saved as /blog/{slug || "…"}</p>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="description" className={LABEL}>
                Meta description
              </label>
              <Counter length={description.trim().length} min={120} max={160} />
            </div>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${FIELD} mt-1.5 leading-relaxed`}
            />
            <p className={HELP}>Shown under the title in search results, on post cards and in the RSS feed.</p>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={LABEL}>Body</span>
              <div className="flex items-center gap-3">
                <span className="text-xs tabular-nums text-muted-foreground">
                  {wordCount(blocks)} words · {readingMinutes(blocks)} min read
                </span>
                <div role="tablist" aria-label="Body view" className="inline-flex rounded-lg border border-border p-0.5">
                  <button type="button" role="tab" aria-selected={tab === "write"} onClick={() => setTab("write")} className={tabClass(tab === "write")}>
                    <Pencil className="h-3.5 w-3.5" /> Write
                  </button>
                  <button type="button" role="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")} className={tabClass(tab === "preview")}>
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </button>
                </div>
              </div>
            </div>
            {/* Hidden rather than unmounted while previewing, so the body is still in the submitted form. */}
            <textarea
              name="body"
              aria-label="Body"
              hidden={tab !== "write"}
              rows={26}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={`${FIELD} mt-2 font-mono leading-relaxed`}
            />
            {tab === "preview" ? (
              <div className="mt-2 rounded-md border border-border bg-background p-5 sm:p-8">
                {blocks.length ? <Markdown blocks={blocks} /> : <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
              </div>
            ) : null}
            <p className={`${HELP} font-mono`}>
              ## Section · ### Subsection · **bold** · *italic* · [link](/labs) · - list · 1. list · &gt; quote · ![alt
              text](/image.jpg)
            </p>
          </div>
        </Panel>

        <Panel title="Lab & keywords" description="Tie the post to one lab and one search phrase.">
          <div>
            <label htmlFor="labId" className={LABEL}>
              Lab
            </label>
            <select id="labId" name="labId" value={labId} onChange={(e) => setLabId(e.target.value)} className={`${FIELD} mt-1.5`}>
              <option value="">Not about a specific lab</option>
              {labs.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                  {option.enabled ? "" : " (hidden)"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="focusKeyword" className={LABEL}>
              Focus keyword
            </label>
            <input
              id="focusKeyword"
              name="focusKeyword"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="e.g. Scherrer equation crystallite size"
              className={`${FIELD} mt-1.5`}
            />
            {focusClash ? (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                Already the focus keyword of “{focusClash.title}”. Two posts targeting one phrase compete with each other.
              </p>
            ) : (
              <p className={HELP}>The one phrase a searcher would type that this post should be the best answer to.</p>
            )}
            {suggested.length ? (
              <div className="mt-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  Suggested for {lab?.name}. These come from the lab guide, not from search data — check real volume in
                  Search Console before building a series on one.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggested.map((keyword) => {
                    const clash = usedBy(keyword);
                    return (
                      <Chip
                        key={keyword}
                        label={keyword}
                        selected={same(keyword, focusKeyword)}
                        taken={Boolean(clash)}
                        title={
                          clash
                            ? `Already the focus of “${clash.title}”`
                            : keyword === suggestions?.pillar
                              ? "Broad topic — suits a pillar post"
                              : "Use as the focus keyword"
                        }
                        onClick={() => setFocusKeyword(keyword)}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="keywords" className={LABEL}>
                Related keywords
              </label>
              <Counter length={keywords.length} min={3} max={10} />
            </div>
            <input
              id="keywords"
              name="keywords"
              value={keywordText}
              onChange={(e) => setKeywordText(e.target.value)}
              placeholder="Comma-separated"
              className={`${FIELD} mt-1.5`}
            />
            {suggested.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {suggested
                  .filter((keyword) => !same(keyword, focusKeyword))
                  .map((keyword) => (
                    <Chip
                      key={keyword}
                      label={keyword}
                      selected={keywords.some((existing) => same(existing, keyword))}
                      onClick={() => addKeyword(keyword)}
                    />
                  ))}
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel title="Search & sharing">
          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="metaTitle" className={LABEL}>
                SEO title <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Counter length={searchTitle({ title, metaTitle }).length} min={30} max={60} />
            </div>
            <input
              id="metaTitle"
              name="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder={title || "Defaults to the headline"}
              className={`${FIELD} mt-1.5`}
            />
            <p className={HELP}>
              A shorter title for search results when the headline is long. The count includes “{TITLE_SUFFIX.trim()}”.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="coverImage" className={LABEL}>
                Cover image
              </label>
              <input
                id="coverImage"
                name="coverImage"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="/showcase/virtual-ai.jpg"
                className={`${FIELD} mt-1.5`}
              />
              <p className={HELP}>Optional. Without one, a branded share card is generated.</p>
            </div>
            <div>
              <label htmlFor="coverAlt" className={LABEL}>
                Cover alt text
              </label>
              <input
                id="coverAlt"
                name="coverAlt"
                value={coverAlt}
                onChange={(e) => setCoverAlt(e.target.value)}
                className={`${FIELD} mt-1.5`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="authorName" className={LABEL}>
              Author
            </label>
            <input
              id="authorName"
              name="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className={`${FIELD} mt-1.5`}
            />
          </div>
        </Panel>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-20">
        <section className="rounded-2xl border border-border bg-card p-5">
          <label htmlFor="status" className={LABEL}>
            Visibility
          </label>
          <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)} className={`${FIELD} mt-1.5`}>
            <option value="DRAFT">Draft — only admins can see it</option>
            <option value="PUBLISHED">Published — public and in the sitemap</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="btn-brand mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {status === "PUBLISHED" ? (post?.status === "PUBLISHED" ? "Update post" : "Publish") : "Save draft"}
          </button>
          {message ? (
            <p role="status" className={`mt-3 text-sm ${message.tone === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {message.text}
            </p>
          ) : null}
          {post ? (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4 text-sm">
              <a
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                {post.status === "PUBLISHED" ? "View post" : "Preview draft"} <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 text-rose-600 transition-colors hover:text-rose-500 disabled:opacity-60 dark:text-rose-400"
              >
                <Trash className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Search result preview</h2>
          <div className="mt-3 rounded-xl border border-border bg-background p-4">
            <p className="truncate text-xs text-muted-foreground">
              {new URL(SITE_URL).host} › blog › {slug || "…"}
            </p>
            <p className="mt-1 text-lg leading-snug text-primary">
              {truncate(searchTitle({ title: title || "Post headline", metaTitle }), 60)}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {truncate(description || "Write a meta description to control this snippet.", 160)}
            </p>
          </div>
          <p className={HELP}>
            Approximate. Search engines rewrite titles and snippets when they judge another part of the page answers the
            query better.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">SEO checklist</h2>
            <span
              className={`text-sm font-bold tabular-nums ${
                scoreTone === "emerald" ? "text-emerald-500" : scoreTone === "amber" ? "text-amber-500" : "text-rose-500"
              }`}
            >
              {passed}/{checks.length}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                scoreTone === "emerald" ? "bg-emerald-500" : scoreTone === "amber" ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${Math.round(share * 100)}%` }}
            />
          </div>
          <ul className="mt-4 space-y-3">
            {checks.map((check) => (
              <li key={check.id} className="flex gap-2.5 text-sm">
                {check.ok ? (
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-label="Passed" />
                ) : (
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-label="Needs work" />
                )}
                <div>
                  <p className={check.ok ? "text-muted-foreground" : "font-medium"}>{check.label}</p>
                  {!check.ok ? <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{check.hint}</p> : null}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
            On-page basics only. Passing them makes a post easy for search engines to understand; ranking also depends
            on how genuinely useful it is and on links from other sites.
          </p>
        </section>
      </aside>
    </form>
  );
}

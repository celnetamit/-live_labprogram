"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, ExternalLink, Loader2, Plus, Save, Trash } from "lucide-react";
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
import { analyseContent, optimizationGrade } from "@/lib/blogAnalysis";
import {
  type EditorState,
  blockStyleAt,
  insertBlockText,
  insertLink,
  listStyleAt,
  replaceSelection,
  toggleMark,
} from "@/lib/markdownEdit";
import { SITE_URL } from "@/lib/site";
import AiAssistant from "./AiAssistant";
import AnalysisPanel from "./AnalysisPanel";
import EditorToolbar, { type View } from "./EditorToolbar";
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

/** How long a pause in typing starts a new undo step. */
const UNDO_COALESCE_MS = 700;

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

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] ?? char);
}

/**
 * The post editor.
 *
 * Every field is controlled so the analysis panel can follow the author as they
 * type; the form still submits through FormData, so the server action sees
 * exactly the named inputs. Nothing in the panel is unmounted when its tab is
 * hidden, because an unmounted input submits nothing.
 *
 * The body stays Markdown. The toolbar edits that Markdown rather than a
 * rich-text document, so the preview beside the editor is the public page's own
 * renderer reading the public page's own parser — the two cannot disagree.
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
  const [view, setView] = useState<View>("write");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  /* -------------------------------------------------------------------- */
  /* Undo history                                                         */
  /* -------------------------------------------------------------------- */

  /*
   * The browser's own undo stack is lost the moment a value is set from React
   * state, which every toolbar command does — so the editor keeps its own.
   * Snapshots are taken before a change, and consecutive keystrokes inside
   * UNDO_COALESCE_MS collapse into one step rather than one per character.
   */
  const history = useRef<{ past: EditorState[]; future: EditorState[] }>({ past: [], future: [] });
  const lastSnapshotAt = useRef(0);
  /** Mirrors the stacks' lengths into state, so the two toolbar buttons re-render. */
  const [undoable, setUndoable] = useState({ undo: false, redo: false });
  /**
    * Set by anything that moves the caret programmatically; applied after the
    * re-render. `scrollTop` is the textarea's scroll position to put back, or
    * null to let the browser scroll to the caret instead.
    */
  const pendingCaret = useRef<{ range: [number, number]; scrollTop: number | null } | null>(null);

  const syncUndoable = useCallback(() => {
    setUndoable({ undo: history.current.past.length > 0, redo: history.current.future.length > 0 });
  }, []);

  const snapshot = useCallback(
    (state: EditorState) => {
      const past = history.current.past;
      if (past[past.length - 1]?.value === state.value) return;
      past.push(state);
      if (past.length > 200) past.shift();
      history.current.future = [];
      syncUndoable();
    },
    [syncUndoable],
  );

  /** The textarea is the truth while it is mounted: it holds the live caret. */
  const currentState = useCallback((): EditorState => {
    const element = bodyRef.current;
    if (element && view !== "preview") {
      return { value: element.value, start: element.selectionStart, end: element.selectionEnd };
    }
    return { value: body, start: selection.start, end: selection.end };
  }, [body, selection.end, selection.start, view]);

  const applyState = useCallback((next: EditorState, reveal = false) => {
    // Read the scroll before React re-renders, while the old value is still laid out.
    pendingCaret.current = {
      range: [next.start, next.end],
      scrollTop: reveal ? null : (bodyRef.current?.scrollTop ?? null),
    };
    setBody(next.value);
    setSelection({ start: next.start, end: next.end });
  }, []);

  /**
   * Put the caret back after a programmatic change, without moving the view.
   *
   * Both halves matter. `preventScroll` stops the browser scrolling the page to
   * reveal the textarea — it is thirty rows tall, so focusing it scrolls the
   * admin page down. Restoring `scrollTop` stops `setSelectionRange` scrolling
   * the textarea's own content to the caret. Applying a heading should change
   * the line under the caret and nothing else about what you are looking at.
   *
   * Commands that add a block below the caret — a table, a code fence, a rule —
   * pass `reveal`, which leaves `scrollTop` null so the browser does scroll to
   * show what was just inserted.
   */
  const restoreCaret = useCallback(() => {
    const pending = pendingCaret.current;
    if (!pending) return;
    pendingCaret.current = null;
    const element = bodyRef.current;
    if (!element || element.hidden) return;
    element.focus({ preventScroll: true });
    element.setSelectionRange(pending.range[0], pending.range[1]);
    if (pending.scrollTop !== null) element.scrollTop = pending.scrollTop;
  }, []);

  useEffect(restoreCaret, [body, restoreCaret]);

  /** Run a toolbar transform against the live value and caret. */
  const apply = useCallback(
    (transform: (state: EditorState) => EditorState, options?: { reveal?: boolean }) => {
      // A command typed while the source is hidden has nowhere to land.
      if (view === "preview") setView("write");
      const current = currentState();
      snapshot(current);
      lastSnapshotAt.current = 0;
      applyState(transform(current), options?.reveal);
    },
    [applyState, currentState, snapshot, view],
  );

  const undo = useCallback(() => {
    const previous = history.current.past.pop();
    if (!previous) return;
    history.current.future.push(currentState());
    lastSnapshotAt.current = 0;
    syncUndoable();
    applyState(previous);
  }, [applyState, currentState, syncUndoable]);

  const redo = useCallback(() => {
    const next = history.current.future.pop();
    if (!next) return;
    history.current.past.push(currentState());
    lastSnapshotAt.current = 0;
    syncUndoable();
    applyState(next);
  }, [applyState, currentState, syncUndoable]);

  function handleBodyChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const now = Date.now();
    if (now - lastSnapshotAt.current > UNDO_COALESCE_MS) {
      snapshot({ value: body, start: selection.start, end: selection.end });
      lastSnapshotAt.current = now;
    }
    setBody(event.target.value);
    setSelection({ start: event.target.selectionStart, end: event.target.selectionEnd });
  }

  function handleBodyKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(event.metaKey || event.ctrlKey)) return;
    const key = event.key.toLowerCase();
    if (key === "b") {
      event.preventDefault();
      apply((state) => toggleMark(state, "bold"));
    } else if (key === "i") {
      event.preventDefault();
      apply((state) => toggleMark(state, "italic"));
    } else if (key === "k") {
      event.preventDefault();
      const href = window.prompt("Link to (a site path such as /labs, or a full URL)");
      if (href?.trim()) apply((state) => insertLink(state, href.trim()));
    } else if (key === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    } else if (key === "y") {
      event.preventDefault();
      redo();
    }
  }

  /* -------------------------------------------------------------------- */
  /* Derived values                                                       */
  /* -------------------------------------------------------------------- */

  const slug = slugify(slugEdited ? slugInput : title);
  const keywords = useMemo(() => parseKeywordInput(keywordText), [keywordText]);
  const lab = labs.find((option) => option.id === labId) ?? null;
  const suggestions = labKeywords(lab?.slug);
  const suggested = useMemo(
    () => (suggestions ? [suggestions.pillar, ...suggestions.related] : []),
    [suggestions],
  );
  const blocks = useMemo(() => parseMarkdown(body), [body]);
  const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  const usedBy = (keyword: string) => otherFocusKeywords.find((other) => same(other.keyword, keyword));
  const focusClash = focusKeyword.trim() ? usedBy(focusKeyword) : undefined;

  const seoInput = useMemo(
    () => ({
      title,
      metaTitle,
      slug,
      description,
      body,
      focusKeyword,
      keywords,
      hasLab: Boolean(lab),
      coverImage,
      coverAlt,
    }),
    [title, metaTitle, slug, description, body, focusKeyword, keywords, lab, coverImage, coverAlt],
  );

  const checks = useMemo(
    () => seoChecks(seoInput, otherFocusKeywords.map((other) => other.keyword)),
    [seoInput, otherFocusKeywords],
  );
  const analysis = useMemo(() => analyseContent(seoInput), [seoInput]);
  const grade = useMemo(() => optimizationGrade(checks, analysis.checks), [checks, analysis.checks]);

  const addKeyword = useCallback(
    (keyword: string) => {
      setKeywordText((text) => {
        const existing = parseKeywordInput(text);
        if (existing.some((item) => same(item, keyword))) return text;
        return [...existing, keyword].join(", ");
      });
    },
    [],
  );

  /* -------------------------------------------------------------------- */
  /* Toolbar commands that need the DOM                                   */
  /* -------------------------------------------------------------------- */

  const copyMarkdown = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setMessage({ tone: "error", text: "The browser refused clipboard access." });
    }
  }, [body]);

  /**
   * Print the rendered article rather than the admin screen.
   *
   * The preview stays mounted in every view (hidden, not unmounted) so its HTML
   * is here to hand to a print window. Only the structure travels — headings,
   * lists, tables, links — not the site's styles, which is what a proof read on
   * paper wants anyway.
   */
  const printPreview = useCallback(() => {
    const node = previewRef.current;
    if (!node) return;
    const win = window.open("", "_blank", "width=820,height=1000");
    if (!win) {
      setMessage({ tone: "error", text: "The browser blocked the print window." });
      return;
    }
    win.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title || "Untitled post")}</title>` +
        `<style>body{font:16px/1.7 Georgia,serif;max-width:40em;margin:3em auto;padding:0 1em;color:#111}` +
        `h1{font-size:1.9em;line-height:1.2}h2{margin-top:1.8em}img{max-width:100%}` +
        `table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:.4em .6em;text-align:left}` +
        `pre{background:#f4f4f4;padding:1em;overflow-x:auto}blockquote{border-left:3px solid #999;margin:0;padding-left:1em;color:#444}</style>` +
        `</head><body><h1>${escapeHtml(title || "Untitled post")}</h1>${node.innerHTML}</body></html>`,
    );
    win.document.close();
    win.focus();
    win.print();
  }, [title]);

  /** Put the caret on a heading in the source, from the outline in the Tools tab. */
  const jumpToHeading = useCallback(
    (text: string) => {
      const lines = body.split("\n");
      let offset = 0;
      for (const line of lines) {
        const heading = /^\s*#{1,6}\s+(.*)$/.exec(line);
        if (heading && heading[1].trim().startsWith(text.slice(0, 40))) {
          if (view === "preview") setView("split");
          setSelection({ start: offset, end: offset + line.length });
          // scrollTop null: jumping to a heading is meant to move the view.
          pendingCaret.current = { range: [offset, offset + line.length], scrollTop: null };
          // The body has not changed, so the effect above will not fire.
          requestAnimationFrame(restoreCaret);
          return;
        }
        offset += line.length + 1;
      }
    },
    [body, restoreCaret, view],
  );

  /* -------------------------------------------------------------------- */
  /* Saving                                                               */
  /* -------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------- */
  /* The Input tab                                                        */
  /* -------------------------------------------------------------------- */

  const inputSlot = (
    <div className="space-y-5">
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
            <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
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
        {analysis.phrases.length ? (
          <div className="mt-3">
            <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
              From this draft&rsquo;s own text — phrases it repeats. Editorial suggestions, not search volume.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.phrases.slice(0, 8).map((phrase) => (
                <Chip
                  key={phrase.phrase}
                  label={`${phrase.phrase} · ${phrase.count}`}
                  selected={keywords.some((existing) => same(existing, phrase.phrase))}
                  onClick={() => addKeyword(phrase.phrase)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Search result</h3>
        <div className="rounded-xl border border-border bg-background p-4">
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
      </div>

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
    </div>
  );

  const aiSlot = (
    <AiAssistant
      context={{
        title,
        focusKeyword,
        keywords,
        description,
        body,
        selection: body.slice(selection.start, selection.end),
        labName: lab?.name ?? "",
      }}
      onUseHeadline={setTitle}
      onUseSeoTitle={setMetaTitle}
      onUseDescription={setDescription}
      onAddKeyword={addKeyword}
      onInsertHeading={(text) => apply((state) => insertBlockText(state, `## ${text}`), { reveal: true })}
      onReplaceSelection={(text) => apply((state) => replaceSelection(state, text))}
    />
  );

  /* -------------------------------------------------------------------- */
  /* Render                                                               */
  /* -------------------------------------------------------------------- */

  const splitting = view === "split";

  return (
    <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
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
        </Panel>

        <section>
          <EditorToolbar
            apply={apply}
            style={blockStyleAt(body, selection.start)}
            list={listStyleAt(body, selection.start)}
            canUndo={undoable.undo}
            canRedo={undoable.redo}
            onUndo={undo}
            onRedo={redo}
            onPrint={printPreview}
            onCopy={copyMarkdown}
            copied={copied}
            labs={labs}
            view={view}
            onView={setView}
            words={wordCount(blocks)}
            minutes={readingMinutes(blocks)}
          />

          <div
            className={`rounded-b-xl border border-border bg-card ${
              splitting ? "grid divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0" : ""
            }`}
          >
            {/* Hidden rather than unmounted while previewing, so the body is still in the submitted form. */}
            <textarea
              ref={bodyRef}
              name="body"
              aria-label="Body"
              hidden={view === "preview"}
              rows={splitting ? 28 : 30}
              value={body}
              onChange={handleBodyChange}
              onKeyDown={handleBodyKeyDown}
              onSelect={(e) =>
                setSelection({ start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd })
              }
              spellCheck
              className="w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed focus:outline-none"
            />
            {/* Kept mounted in every view so "Print preview" always has it to read. */}
            <div
              ref={previewRef}
              hidden={view === "write"}
              className="overflow-x-auto p-5 sm:p-8"
              aria-label="Rendered preview"
            >
              {blocks.length ? (
                <Markdown blocks={blocks} />
              ) : (
                <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
              )}
            </div>
          </div>

          <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
            # Heading · ## Section · ### Subsection · **bold** · *italic* · [link](/labs) · - list · 1. list · &gt;
            quote · | table | · ![alt text](/image.jpg)
          </p>
        </section>
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

        <AnalysisPanel
          grade={grade}
          seo={checks}
          analysis={analysis}
          inputSlot={inputSlot}
          aiSlot={aiSlot}
          onJumpToHeading={jumpToHeading}
        />
      </aside>
    </form>
  );
}

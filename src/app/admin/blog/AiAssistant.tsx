"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import { type AssistInput, type AssistTask, assist } from "./assist";

type Props = {
  /** The post as it stands, for the prompt the server assembles. */
  context: Omit<AssistInput, "task">;
  onUseHeadline: (text: string) => void;
  onUseSeoTitle: (text: string) => void;
  onUseDescription: (text: string) => void;
  onAddKeyword: (text: string) => void;
  onInsertHeading: (text: string) => void;
  onReplaceSelection: (text: string) => void;
};

const TASKS: { id: AssistTask; label: string; description: string }[] = [
  { id: "titles", label: "Headline ideas", description: "Five alternatives that keep the focus keyword" },
  { id: "description", label: "Meta description", description: "Three, each 120–160 characters" },
  { id: "outline", label: "Section outline", description: "Headings the draft is missing" },
  { id: "keywords", label: "Related keywords", description: "Phrases near the focus keyword" },
  { id: "rewrite", label: "Rewrite selection", description: "Clearer wording, same facts" },
];

const HELP = "text-xs leading-relaxed text-muted-foreground";

function Apply({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-md border border-border px-2 py-0.5 text-[0.6875rem] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
    >
      {label}
    </button>
  );
}

export default function AiAssistant(props: Props) {
  const [task, setTask] = useState<AssistTask | null>(null);
  const [running, setRunning] = useState<AssistTask | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  async function run(next: AssistTask) {
    setRunning(next);
    setError(null);
    setItems([]);
    try {
      const result = await assist({ ...props.context, task: next });
      if (!result.ok) {
        setError(result.error);
        setTask(next);
        return;
      }
      setItems(result.items);
      setTask(next);
    } catch (failure) {
      console.error(failure);
      setError("The assistant could not be reached.");
    } finally {
      setRunning(null);
    }
  }

  const copy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(index);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("The browser refused clipboard access.");
    }
  };

  const applyFor = (text: string) => {
    switch (task) {
      case "titles":
        return (
          <>
            <Apply label="Headline" onClick={() => props.onUseHeadline(text)} />
            <Apply label="SEO title" onClick={() => props.onUseSeoTitle(text)} />
          </>
        );
      case "description":
        return <Apply label="Use" onClick={() => props.onUseDescription(text)} />;
      case "outline":
        return <Apply label="Insert" onClick={() => props.onInsertHeading(text)} />;
      case "keywords":
        return <Apply label="Add" onClick={() => props.onAddKeyword(text)} />;
      case "rewrite":
        return <Apply label="Replace" onClick={() => props.onReplaceSelection(text)} />;
      default:
        return null;
    }
  };

  const selectionWords = props.context.selection.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        {TASKS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            disabled={running !== null}
            onClick={() => run(entry.id)}
            className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors disabled:opacity-60 ${
              task === entry.id ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/40"
            }`}
          >
            {running === entry.id ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
            ) : (
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            )}
            <span className="min-w-0">
              <span className="block text-sm font-medium">{entry.label}</span>
              <span className="block text-xs text-muted-foreground">
                {entry.id === "rewrite" && selectionWords
                  ? `${selectionWords} words selected`
                  : entry.description}
              </span>
            </span>
          </button>
        ))}
      </div>

      {error ? (
        <p role="status" className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
          {error}
        </p>
      ) : null}

      {items.length ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="rounded-lg border border-border p-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{item}</p>
              <div className="mt-2 flex items-center gap-1.5">
                {applyFor(item)}
                <button
                  type="button"
                  onClick={() => copy(item, index)}
                  title="Copy"
                  className="shrink-0 rounded-md border border-border p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copied === index ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
                {task === "description" || task === "titles" ? (
                  <span className="ml-auto text-[0.6875rem] tabular-nums text-muted-foreground">
                    {item.length} chars
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <p className={`${HELP} border-t border-border pt-3`}>
        The assistant only ever suggests words — titles, a description, headings, phrasing. Every number in this panel
        is counted from your own text in the browser, so nothing shown as a measurement can be something a model made
        up. Read anything it writes before you publish it: it has not read the lab, and it does not know what is true.
      </p>
    </div>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Bold,
  ChevronDown,
  Code,
  Columns2,
  Copy,
  Eye,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Pencil,
  Printer,
  Redo2,
  SquareCode,
  Table as TableIcon,
  TextQuote,
  Undo2,
} from "lucide-react";
import { ImageButton } from "./ImagePicker";
import { Divider, Tool } from "./toolbarUi";
import {
  type BlockStyle,
  type EditorState,
  type InlineMark,
  insertCodeBlock,
  insertImage,
  insertLink,
  insertRule,
  insertTable,
  outdent,
  indent,
  removeLink,
  setBlockStyle,
  toggleList,
  toggleMark,
} from "@/lib/markdownEdit";

export type View = "write" | "split" | "preview";

type Props = {
  /**
   * Runs a transform against the textarea's current value and selection.
   * `reveal` lets the browser scroll to the caret afterwards — for commands that
   * add a block below it. Without it the view is left exactly where it was.
   */
  apply: (transform: (state: EditorState) => EditorState, options?: { reveal?: boolean }) => void;
  style: BlockStyle;
  list: "bullet" | "numbered" | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onPrint: () => void;
  onCopy: () => void;
  copied: boolean;
  labs: { slug: string | null; name: string }[];
  view: View;
  onView: (view: View) => void;
  words: number;
  minutes: number;
};

/* ------------------------------------------------------------------------ */
/* Small primitives                                                         */
/* ------------------------------------------------------------------------ */

/**
 * A dropdown that closes on an outside click or Escape.
 *
 * Hand-rolled rather than pulled from a component library because it is a
 * button and a panel, and because keeping the focus behaviour visible here is
 * worth more than the fifteen lines it saves.
 */
function Menu({ label, children }: { label: string; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((was) => !was)}
        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-sm transition-colors ${
          open ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        {label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open ? (
        <div
          id={id}
          role="menu"
          className="absolute left-0 top-full z-30 mt-1 min-w-52 rounded-xl border border-border bg-popover p-1 shadow-lg"
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  onClick,
  children,
  hint,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center justify-between gap-6 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-secondary disabled:opacity-40 disabled:hover:bg-transparent"
    >
      <span className="inline-flex items-center gap-2">{children}</span>
      {hint ? <span className="text-xs tabular-nums text-muted-foreground">{hint}</span> : null}
    </button>
  );
}

function MenuSeparator() {
  return <div className="my-1 border-t border-border" />;
}

/**
 * A little form anchored under its button — for the three commands that need a
 * value before they can run. A `window.prompt` would do, but it cannot show two
 * fields, and it cannot be styled to say which field is the URL.
 */
function Popover({
  label,
  icon,
  title,
  fields,
  submitLabel,
  onSubmit,
}: {
  label: string;
  icon: React.ReactNode;
  title: string;
  fields: { name: string; label: string; placeholder?: string; type?: "text" | "number"; value: string }[];
  submitLabel: string;
  onSubmit: (values: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.name, field.value])),
  );
  const box = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    first.current?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const submit = () => {
    onSubmit(values);
    setOpen(false);
  };

  return (
    <div ref={box} className="relative">
      <Tool title={title} active={open} onClick={() => setOpen((was) => !was)}>
        {icon}
      </Tool>
      {open ? (
        <div className="absolute left-0 top-full z-30 mt-1 w-72 rounded-xl border border-border bg-popover p-3 shadow-lg">
          <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <label key={field.name} className="block">
                <span className="text-xs text-muted-foreground">{field.label}</span>
                <input
                  ref={index === 0 ? first : undefined}
                  type={field.type ?? "text"}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
                  onKeyDown={(event) => {
                    // Enter submits; the surrounding post form must not.
                    if (event.key === "Enter") {
                      event.preventDefault();
                      submit();
                    }
                  }}
                  className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={submit}
            className="btn-brand mt-3 w-full rounded-lg px-3 py-1.5 text-sm font-semibold"
          >
            {submitLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* The toolbar                                                              */
/* ------------------------------------------------------------------------ */

const STYLE_LABEL: Record<BlockStyle, string> = {
  paragraph: "Paragraph",
  heading1: "Heading 1",
  heading2: "Heading 2",
  heading3: "Heading 3",
  quote: "Quote",
};

export default function EditorToolbar(props: Props) {
  const { apply, style, list, view, onView } = props;

  const mark = (name: InlineMark) => apply((state) => toggleMark(state, name));
  const block = (name: BlockStyle) => apply((state) => setBlockStyle(state, name));

  const viewButton = (value: View, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      role="tab"
      aria-selected={view === value}
      onClick={() => onView(value)}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
        view === value ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="rounded-t-xl border border-b-0 border-border bg-muted/30">
      {/* Menus */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1">
        <Menu label="Format">
          {(close) => (
            <>
              {(Object.keys(STYLE_LABEL) as BlockStyle[]).map((name) => (
                <MenuItem
                  key={name}
                  onClick={() => {
                    block(name);
                    close();
                  }}
                >
                  {STYLE_LABEL[name]}
                </MenuItem>
              ))}
              <MenuSeparator />
              <MenuItem
                onClick={() => {
                  mark("bold");
                  close();
                }}
                hint="Ctrl+B"
              >
                <Bold className="h-3.5 w-3.5" /> Bold
              </MenuItem>
              <MenuItem
                onClick={() => {
                  mark("italic");
                  close();
                }}
                hint="Ctrl+I"
              >
                <Italic className="h-3.5 w-3.5" /> Italic
              </MenuItem>
              <MenuItem
                onClick={() => {
                  mark("code");
                  close();
                }}
              >
                <Code className="h-3.5 w-3.5" /> Inline code
              </MenuItem>
            </>
          )}
        </Menu>

        <Menu label="Insert">
          {(close) => (
            <>
              <MenuItem
                onClick={() => {
                  apply((state) => insertCodeBlock(state), { reveal: true });
                  close();
                }}
              >
                <SquareCode className="h-3.5 w-3.5" /> Code block
              </MenuItem>
              <MenuItem
                onClick={() => {
                  apply((state) => insertRule(state), { reveal: true });
                  close();
                }}
              >
                <Minus className="h-3.5 w-3.5" /> Horizontal rule
              </MenuItem>
              <MenuSeparator />
              <p className="px-2.5 pb-1 pt-1.5 text-xs text-muted-foreground">Link to a lab&rsquo;s topic page</p>
              <div className="max-h-56 overflow-y-auto">
                {props.labs
                  .filter((lab) => lab.slug)
                  .map((lab) => (
                    <MenuItem
                      key={lab.slug}
                      onClick={() => {
                        apply((state) => insertLink(state, `/blog/lab/${lab.slug}`, lab.name));
                        close();
                      }}
                    >
                      {lab.name}
                    </MenuItem>
                  ))}
              </div>
            </>
          )}
        </Menu>

        <Menu label="Table">
          {(close) => (
            <>
              {[
                [2, 2],
                [3, 2],
                [3, 3],
                [5, 3],
              ].map(([rows, columns]) => (
                <MenuItem
                  key={`${rows}x${columns}`}
                  onClick={() => {
                    apply((state) => insertTable(state, rows, columns), { reveal: true });
                    close();
                  }}
                >
                  {rows} rows &times; {columns} columns
                </MenuItem>
              ))}
              <MenuSeparator />
              <p className="px-2.5 py-1.5 text-xs leading-relaxed text-muted-foreground">
                Add a row by typing another <code className="font-mono">|</code> line. A column is right-aligned with{" "}
                <code className="font-mono">---:</code> and centred with <code className="font-mono">:---:</code> in the
                divider row.
              </p>
            </>
          )}
        </Menu>

        <Menu label="Tools">
          {(close) => (
            <>
              <MenuItem
                onClick={() => {
                  props.onCopy();
                  close();
                }}
              >
                <Copy className="h-3.5 w-3.5" /> {props.copied ? "Copied" : "Copy Markdown"}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  props.onPrint();
                  close();
                }}
              >
                <Printer className="h-3.5 w-3.5" /> Print preview
              </MenuItem>
              <MenuSeparator />
              <p className="px-2.5 py-1.5 text-xs leading-relaxed text-muted-foreground">
                Word count, readability and keyword use are in the analysis panel beside the editor.
              </p>
            </>
          )}
        </Menu>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        <Tool title="Undo (Ctrl+Z)" onClick={props.onUndo} disabled={!props.canUndo}>
          <Undo2 className="h-4 w-4" />
        </Tool>
        <Tool title="Redo (Ctrl+Shift+Z)" onClick={props.onRedo} disabled={!props.canRedo}>
          <Redo2 className="h-4 w-4" />
        </Tool>
        <Divider />

        <label className="sr-only" htmlFor="block-style">
          Paragraph style
        </label>
        <select
          id="block-style"
          value={style}
          onChange={(event) => block(event.target.value as BlockStyle)}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {(Object.keys(STYLE_LABEL) as BlockStyle[]).map((name) => (
            <option key={name} value={name}>
              {STYLE_LABEL[name]}
            </option>
          ))}
        </select>
        <Divider />

        <Tool title="Bold (Ctrl+B)" onClick={() => mark("bold")}>
          <Bold className="h-4 w-4" />
        </Tool>
        <Tool title="Italic (Ctrl+I)" onClick={() => mark("italic")}>
          <Italic className="h-4 w-4" />
        </Tool>
        <Tool title="Inline code" onClick={() => mark("code")}>
          <Code className="h-4 w-4" />
        </Tool>
        <Tool title="Quote" active={style === "quote"} onClick={() => block(style === "quote" ? "paragraph" : "quote")}>
          <TextQuote className="h-4 w-4" />
        </Tool>
        <Divider />

        <Tool title="Bulleted list" active={list === "bullet"} onClick={() => apply((s) => toggleList(s, false))}>
          <List className="h-4 w-4" />
        </Tool>
        <Tool title="Numbered list" active={list === "numbered"} onClick={() => apply((s) => toggleList(s, true))}>
          <ListOrdered className="h-4 w-4" />
        </Tool>
        <Tool title="Decrease indent" onClick={() => apply(outdent)}>
          <IndentDecrease className="h-4 w-4" />
        </Tool>
        <Tool title="Increase indent" onClick={() => apply(indent)}>
          <IndentIncrease className="h-4 w-4" />
        </Tool>
        <Divider />

        <Popover
          title="Insert link (Ctrl+K)"
          icon={<Link2 className="h-4 w-4" />}
          label="Link the selected text"
          submitLabel="Insert link"
          fields={[{ name: "href", label: "URL or site path", placeholder: "/labs", value: "" }]}
          onSubmit={(values) => {
            const href = values.href.trim();
            if (href) apply((state) => insertLink(state, href));
          }}
        />
        <Tool title="Remove link" onClick={() => apply(removeLink)}>
          <Link2Off className="h-4 w-4" />
        </Tool>
        <ImageButton
          onInsert={(src, alt) => apply((state) => insertImage(state, src, alt), { reveal: true })}
        />
        <Popover
          title="Insert table"
          icon={<TableIcon className="h-4 w-4" />}
          label="Insert a table"
          submitLabel="Insert table"
          fields={[
            { name: "rows", label: "Body rows", type: "number", value: "3" },
            { name: "columns", label: "Columns", type: "number", value: "3" },
          ]}
          onSubmit={(values) => {
            const rows = Math.min(20, Math.max(1, Number(values.rows) || 3));
            const columns = Math.min(8, Math.max(1, Number(values.columns) || 3));
            apply((state) => insertTable(state, rows, columns), { reveal: true });
          }}
        />
        <Tool title="Horizontal rule" onClick={() => apply(insertRule, { reveal: true })}>
          <Minus className="h-4 w-4" />
        </Tool>

        <div className="ml-auto flex items-center gap-3 pl-2">
          <span className="hidden text-xs tabular-nums text-muted-foreground sm:inline">
            {props.words} words · {props.minutes} min read
          </span>
          <div role="tablist" aria-label="Editor view" className="inline-flex rounded-lg border border-border p-0.5">
            {viewButton("write", "Write", <Pencil className="h-3.5 w-3.5" />)}
            {viewButton("split", "Split", <Columns2 className="h-3.5 w-3.5" />)}
            {viewButton("preview", "Preview", <Eye className="h-3.5 w-3.5" />)}
          </div>
        </div>
      </div>
    </div>
  );
}

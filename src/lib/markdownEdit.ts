/**
 * The text transforms behind the editor's formatting toolbar.
 *
 * Posts are stored as Markdown and the same parser renders the admin preview
 * and the published page, so the toolbar edits the source rather than a
 * rich-text document: pressing **B** wraps the selection in asterisks. That is
 * the whole reason preview and published page cannot drift apart — there is no
 * second format and no HTML-to-Markdown round trip to lose anything in.
 *
 * Every function here is pure: it takes the textarea's value and selection and
 * returns the new ones, which is what makes them testable without a DOM and
 * what lets the editor push each result onto its own undo stack.
 */

export type EditorState = {
  value: string;
  start: number;
  end: number;
};

/** The marks the renderer understands. Nothing else is offered, so nothing typed goes nowhere. */
export type InlineMark = "bold" | "italic" | "code";

const MARKER: Record<InlineMark, string> = { bold: "**", italic: "*", code: "`" };

const PLACEHOLDER: Record<InlineMark, string> = { bold: "bold text", italic: "italic text", code: "code" };

function splice(state: EditorState, from: number, to: number, text: string, select?: [number, number]): EditorState {
  const value = state.value.slice(0, from) + text + state.value.slice(to);
  const [start, end] = select ?? [from + text.length, from + text.length];
  return { value, start, end };
}

/** The character offsets of the first and last line touched by the selection. */
export function lineBounds(value: string, start: number, end: number): [number, number] {
  const from = value.lastIndexOf("\n", start - 1) + 1;
  const next = value.indexOf("\n", end);
  return [from, next === -1 ? value.length : next];
}

/* ------------------------------------------------------------------------ */
/* Inline marks                                                             */
/* ------------------------------------------------------------------------ */

/**
 * Wrap the selection in a mark, or unwrap it if it already carries one.
 *
 * Both shapes count as already marked: the selection including its markers
 * (`**word**` selected) and the selection sitting between them (`word` selected
 * inside `**word**`), because which one a double-click produces depends on the
 * browser.
 */
export function toggleMark(state: EditorState, mark: InlineMark): EditorState {
  const marker = MARKER[mark];
  const { value, start, end } = state;
  const selected = value.slice(start, end);

  // `*italic*` inside `**bold**` — an asterisk that belongs to the bold marker
  // is not an italic marker, so leave it alone.
  const boldNeighbour =
    mark === "italic" && (value.slice(start - 2, start) === "**" || value.slice(end, end + 2) === "**");

  if (!boldNeighbour && selected.startsWith(marker) && selected.endsWith(marker) && selected.length > marker.length * 2) {
    const inner = selected.slice(marker.length, -marker.length);
    return splice(state, start, end, inner, [start, start + inner.length]);
  }

  if (
    !boldNeighbour &&
    value.slice(start - marker.length, start) === marker &&
    value.slice(end, end + marker.length) === marker
  ) {
    return splice(state, start - marker.length, end + marker.length, selected, [
      start - marker.length,
      end - marker.length,
    ]);
  }

  const text = selected || PLACEHOLDER[mark];
  return splice(state, start, end, `${marker}${text}${marker}`, [
    start + marker.length,
    start + marker.length + text.length,
  ]);
}

/* ------------------------------------------------------------------------ */
/* Block styles                                                             */
/* ------------------------------------------------------------------------ */

export type BlockStyle = "paragraph" | "heading2" | "heading3" | "quote";

const STYLE_PREFIX: Record<BlockStyle, string> = {
  paragraph: "",
  heading2: "## ",
  heading3: "### ",
  quote: "> ",
};

/** Whatever block marker a line already carries: a heading, a quote or nothing. */
const EXISTING_STYLE = /^(\s*)(?:(#{1,6})\s+|>\s?)?/;

/** The style of the line the caret sits on, for the toolbar's style dropdown. */
export function blockStyleAt(value: string, position: number): BlockStyle {
  const [from] = lineBounds(value, position, position);
  const line = value.slice(from, value.indexOf("\n", from) === -1 ? value.length : value.indexOf("\n", from));
  const heading = /^\s*(#{1,6})\s+/.exec(line);
  if (heading) return heading[1].length <= 2 ? "heading2" : "heading3";
  if (/^\s*>/.test(line)) return "quote";
  return "paragraph";
}

/**
 * Rewrite every line the selection touches.
 *
 * A collapsed caret stays collapsed, riding along with the text it sits in: it
 * shifts by however much the line's prefix grew or shrank. Turning it into a
 * selection of the whole line would be a surprise on its own, and it makes the
 * browser scroll to the end of that selection.
 */
function mapLines(state: EditorState, transform: (line: string, index: number) => string): EditorState {
  const [from, to] = lineBounds(state.value, state.start, state.end);
  const before = state.value.slice(from, to);
  const rewritten = before.split("\n").map(transform).join("\n");
  return splice(state, from, to, rewritten, caretAfter(state, from, before, rewritten));
}

/** Where the caret or selection lands once a line-level rewrite has been applied. */
function caretAfter(state: EditorState, from: number, before: string, after: string): [number, number] {
  if (state.start !== state.end) return [from, from + after.length];
  // One line, so the whole length change belongs to its prefix.
  const moved = state.start + (after.length - before.length);
  const caret = Math.min(Math.max(moved, from), from + after.length);
  return [caret, caret];
}

/** Apply a heading, quote or plain-paragraph style to every selected line. */
export function setBlockStyle(state: EditorState, style: BlockStyle): EditorState {
  return mapLines(state, (line) => {
    if (!line.trim()) return line;
    const stripped = line.replace(EXISTING_STYLE, "$1");
    const indent = /^\s*/.exec(stripped)?.[0] ?? "";
    return `${indent}${STYLE_PREFIX[style]}${stripped.slice(indent.length)}`;
  });
}

/* ------------------------------------------------------------------------ */
/* Lists                                                                    */
/* ------------------------------------------------------------------------ */

const BULLET = /^(\s*)[-*+]\s+/;
const NUMBERED = /^(\s*)\d+[.)]\s+/;

/** Turn the selected lines into a list, or back into plain lines if they already are one. */
export function toggleList(state: EditorState, ordered: boolean): EditorState {
  const [from, to] = lineBounds(state.value, state.start, state.end);
  const lines = state.value.slice(from, to).split("\n");
  const marker = ordered ? NUMBERED : BULLET;
  const filled = lines.filter((line) => line.trim());
  const already = filled.length > 0 && filled.every((line) => marker.test(line));

  let counter = 0;
  const rewritten = lines
    .map((line) => {
      if (!line.trim()) return line;
      const bare = line.replace(BULLET, "$1").replace(NUMBERED, "$1");
      if (already) return bare;
      counter++;
      const indent = /^\s*/.exec(bare)?.[0] ?? "";
      return `${indent}${ordered ? `${counter}. ` : "- "}${bare.slice(indent.length)}`;
    })
    .join("\n");

  return splice(state, from, to, rewritten, caretAfter(state, from, lines.join("\n"), rewritten));
}

/** The list style of the line the caret sits on, so the toolbar can show it pressed. */
export function listStyleAt(value: string, position: number): "bullet" | "numbered" | null {
  const [from] = lineBounds(value, position, position);
  const newline = value.indexOf("\n", from);
  const line = value.slice(from, newline === -1 ? value.length : newline);
  if (NUMBERED.test(line)) return "numbered";
  if (BULLET.test(line)) return "bullet";
  return null;
}

const INDENT = "  ";

/** Indent the selected lines. Two spaces: what the parser reads as a continuation. */
export function indent(state: EditorState): EditorState {
  return mapLines(state, (line) => (line.trim() ? INDENT + line : line));
}

export function outdent(state: EditorState): EditorState {
  return mapLines(state, (line) => line.replace(/^ {1,2}|^\t/, ""));
}

/* ------------------------------------------------------------------------ */
/* Links, images and blocks                                                 */
/* ------------------------------------------------------------------------ */

export function insertLink(state: EditorState, href: string, fallbackText = "link text"): EditorState {
  const text = state.value.slice(state.start, state.end) || fallbackText;
  const markdown = `[${text}](${href})`;
  // Select the label, so an author who took the default can type over it.
  return splice(state, state.start, state.end, markdown, [state.start + 1, state.start + 1 + text.length]);
}

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Unlink: `[text](href)` becomes `text`, across the selection or the caret's line. */
export function removeLink(state: EditorState): EditorState {
  const [from, to] =
    state.start === state.end ? lineBounds(state.value, state.start, state.end) : [state.start, state.end];
  const region = state.value.slice(from, to);
  const rewritten = region.replace(LINK, "$1");
  if (rewritten === region) return state;
  return splice(state, from, to, rewritten, [from, from + rewritten.length]);
}

/**
 * Put a block on lines of its own.
 *
 * The parser ends a paragraph at a blank line, so a table or a code fence
 * dropped straight after a sentence would be swallowed by it. This opens the
 * space first.
 */
export function insertBlockText(
  state: EditorState,
  markdown: string,
  caretOffset = markdown.length,
): EditorState {
  const [, lineEnd] = lineBounds(state.value, state.end, state.end);
  const before = state.value.slice(0, lineEnd);
  const lead = !before.trim() ? "" : before.endsWith("\n\n") ? "" : "\n\n";
  const after = state.value.slice(lineEnd);
  const trail = after.startsWith("\n\n") || !after.trim() ? "" : "\n\n";
  const text = `${lead}${markdown}${trail}`;
  const caret = lineEnd + lead.length + caretOffset;
  return splice(state, lineEnd, lineEnd, text, [caret, caret]);
}

export function insertImage(state: EditorState, src: string, alt: string): EditorState {
  return insertBlockText(state, `![${alt}](${src})`);
}

export function insertRule(state: EditorState): EditorState {
  return insertBlockText(state, "---");
}

export function insertCodeBlock(state: EditorState): EditorState {
  const selected = state.value.slice(state.start, state.end).trim();
  const body = selected || "code";
  // Caret lands at the start of the code, not after the closing fence.
  return insertBlockText(state, `\`\`\`\n${body}\n\`\`\``, 4);
}

/**
 * A GitHub-style table: a header row, the divider that makes it a table, and
 * empty body rows. `:---:` and `---:` in the divider centre and right-align a
 * column, which the renderer honours.
 */
export function insertTable(state: EditorState, rows: number, columns: number): EditorState {
  const header = Array.from({ length: columns }, (_, index) => `Column ${index + 1}`);
  const divider = Array.from({ length: columns }, () => "---");
  const body = Array.from({ length: Math.max(1, rows) }, () => Array.from({ length: columns }, () => "   "));
  const line = (cells: string[]) => `| ${cells.join(" | ")} |`;
  const markdown = [line(header), line(divider), ...body.map(line)].join("\n");
  // Caret on the first header cell.
  return insertBlockText(state, markdown, 2);
}

/** Insert plain text at the caret, replacing any selection. */
export function insertText(state: EditorState, text: string): EditorState {
  return splice(state, state.start, state.end, text);
}

/** Replace the selection, or the whole body when nothing is selected. */
export function replaceSelection(state: EditorState, text: string): EditorState {
  if (state.start === state.end) return { value: text, start: text.length, end: text.length };
  return splice(state, state.start, state.end, text, [state.start, state.start + text.length]);
}

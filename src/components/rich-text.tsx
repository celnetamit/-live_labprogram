import { Fragment, type ReactNode } from "react";

/**
 * Minimal inline formatter for authored guide copy: `**bold**`, `*italic*` and
 * `` `code` ``.
 *
 * Deliberately not a markdown library. The guides need exactly three inline
 * marks, a dependency-free tokenizer covers them in a few lines, and because it
 * builds React elements rather than an HTML string there is no
 * `dangerouslySetInnerHTML` and nothing to sanitise.
 *
 * Bold is listed first so `**x**` is never mis-tokenized as an empty italic.
 * Italic requires a non-space first character, so prose containing a lone
 * asterisk falls through and renders literally rather than swallowing the rest
 * of the sentence.
 */
const TOKEN = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`)/g;

export function RichText({ children }: { children: string }): ReactNode {
  const parts = children.split(TOKEN);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={index}
          className="rounded bg-secondary px-1 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

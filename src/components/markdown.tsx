import Link from "next/link";
import { Fragment } from "react";
import { RichText } from "@/components/rich-text";
import type { Block } from "@/lib/blog";

/**
 * Renders a blog post body parsed by `parseMarkdown` in `src/lib/blog.ts`.
 *
 * Like `RichText`, it builds React elements rather than an HTML string, so there
 * is no `dangerouslySetInnerHTML` and nothing to sanitise. The one thing an
 * author can smuggle in is a URL, and `safeHref` refuses anything that is not a
 * site path, an in-page anchor, http(s) or mailto — a `javascript:` link renders
 * as plain text.
 */

const LINK = /(\[[^\]]+\]\([^)\s]+\))/g;
const LINK_PARTS = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

function safeHref(href: string): string | null {
  if ((href.startsWith("/") && !href.startsWith("//")) || href.startsWith("#")) return href;
  try {
    return ["http:", "https:", "mailto:"].includes(new URL(href).protocol) ? href : null;
  } catch {
    return null;
  }
}

function imageSrc(src: string): string | null {
  const href = safeHref(src);
  return href && !href.startsWith("#") && !href.startsWith("mailto:") ? href : null;
}

const LINK_CLASS =
  "font-medium text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors";

function Inline({ text }: { text: string }) {
  return text.split(LINK).map((part, index) => {
    const link = LINK_PARTS.exec(part);
    const href = link ? safeHref(link[2]) : null;
    if (!link || !href) {
      return (
        <Fragment key={index}>
          <RichText>{part}</RichText>
        </Fragment>
      );
    }

    const label = <RichText>{link[1]}</RichText>;
    if (href.startsWith("/")) {
      return (
        <Link key={index} href={href} className={LINK_CLASS}>
          {label}
        </Link>
      );
    }
    const external = !href.startsWith("#");
    return (
      <a
        key={index}
        href={href}
        className={LINK_CLASS}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>
    );
  });
}

export function Markdown({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5 text-[1.0625rem] leading-8 text-foreground/90">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return block.level === 2 ? (
              <h2
                key={index}
                id={block.id}
                className="scroll-mt-24 pt-6 text-2xl font-bold tracking-tight text-foreground"
              >
                <Inline text={block.text} />
              </h2>
            ) : (
              <h3
                key={index}
                id={block.id}
                className="scroll-mt-24 pt-3 text-xl font-semibold tracking-tight text-foreground"
              >
                <Inline text={block.text} />
              </h3>
            );
          case "paragraph":
            return (
              <p key={index}>
                <Inline text={block.text} />
              </p>
            );
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return (
              <List
                key={index}
                className={`${block.ordered ? "list-decimal" : "list-disc"} space-y-2 pl-6 marker:text-muted-foreground`}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="pl-1">
                    <Inline text={item} />
                  </li>
                ))}
              </List>
            );
          }
          case "quote":
            return (
              <blockquote key={index} className="border-l-4 border-primary/40 pl-5 italic text-muted-foreground">
                <Inline text={block.text} />
              </blockquote>
            );
          case "code":
            return (
              <pre
                key={index}
                className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 font-mono text-sm leading-relaxed"
              >
                <code>{block.text}</code>
              </pre>
            );
          case "table": {
            const cell = (align: string) =>
              `border-b border-r border-border px-3 py-2 align-top last:border-r-0 ${
                align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"
              }`;
            return (
              // Wide tables scroll inside this box rather than widening the article.
              <div key={index} className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full border-collapse text-[0.9375rem] leading-7 [&>tbody>tr:last-child>td]:border-b-0">
                  <thead className="bg-muted/50">
                    <tr>
                      {block.header.map((heading, column) => (
                        <th key={column} scope="col" className={`${cell(block.align[column] ?? "left")} font-semibold`}>
                          <Inline text={heading} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((value, column) => (
                          <td key={column} className={cell(block.align[column] ?? "left")}>
                            <Inline text={value} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          case "image": {
            const src = imageSrc(block.src);
            if (!src) return null;
            return (
              // eslint-disable-next-line @next/next/no-img-element -- an author-supplied URL of unknown host and size; next/image would need every host allow-listed.
              <img
                key={index}
                src={src}
                alt={block.alt}
                loading="lazy"
                className="w-full rounded-xl border border-border"
              />
            );
          }
          case "rule":
            return <hr key={index} className="my-10 border-border" />;
        }
      })}
    </div>
  );
}

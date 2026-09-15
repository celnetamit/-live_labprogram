import { BLOG_DESCRIPTION } from "@/lib/blog";
import { listPublicPosts } from "@/lib/blogData";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const XML_ESCAPES: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" };

function escapeXml(text: string): string {
  return text.replace(/[<>&'"]/g, (char) => XML_ESCAPES[char]);
}

/** RSS 2.0 feed of the 50 newest posts, for feed readers and aggregators. */
export async function GET() {
  const posts = await listPublicPosts({ take: 50 });

  const items = posts.map((post) => {
    const link = absoluteUrl(`/blog/${post.slug}`);
    return [
      "<item>",
      `<title>${escapeXml(post.title)}</title>`,
      `<link>${link}</link>`,
      `<guid isPermaLink="true">${link}</guid>`,
      post.publishedAt ? `<pubDate>${post.publishedAt.toUTCString()}</pubDate>` : "",
      `<description>${escapeXml(post.description)}</description>`,
      post.lab?.enabled ? `<category>${escapeXml(post.lab.name)}</category>` : "",
      "</item>",
    ].join("");
  });

  const latest = posts[0]?.publishedAt;
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${escapeXml(`${SITE_NAME} Blog`)}</title>`,
    `<link>${absoluteUrl("/blog")}</link>`,
    `<description>${escapeXml(BLOG_DESCRIPTION)}</description>`,
    "<language>en</language>",
    `<atom:link href="${absoluteUrl("/blog/rss.xml")}" rel="self" type="application/rss+xml"/>`,
    latest ? `<lastBuildDate>${latest.toUTCString()}</lastBuildDate>` : "",
    ...items,
    "</channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}

import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Rss } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { BLOG_DESCRIPTION, TITLE_SUFFIX } from "@/lib/blog";
import { labsWithPosts, listPublicPosts } from "@/lib/blogData";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import PostCard from "./PostCard";

export const metadata: Metadata = {
  title: `Blog${TITLE_SUFFIX}`,
  description: BLOG_DESCRIPTION,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
  openGraph: {
    type: "website",
    url: "/blog",
    title: `${SITE_NAME} Blog`,
    description: BLOG_DESCRIPTION,
    siteName: SITE_NAME,
  },
};

// Posts are published from the admin without a deploy; never prerender at build time.
export const dynamic = "force-dynamic";

export default async function BlogIndex() {
  const [posts, labs] = await Promise.all([listPublicPosts(), labsWithPosts()]);

  return (
    <div className="mx-auto max-w-6xl">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${SITE_NAME} Blog`,
          description: BLOG_DESCRIPTION,
          url: absoluteUrl("/blog"),
          publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          blogPost: posts.slice(0, 20).map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            url: absoluteUrl(`/blog/${post.slug}`),
            datePublished: post.publishedAt?.toISOString(),
          })),
        }}
      />

      <header className="relative mb-10 overflow-hidden rounded-3xl border border-border bg-mesh p-8 sm:p-12">
        <div className="aurora-blob animate-aurora bg-brand-2 -right-10 -top-24 h-72 w-72 opacity-25" />
        <div className="relative max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Blog</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
            The science behind <span className="text-gradient-animated">every lab</span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{BLOG_DESCRIPTION}</p>
          <a
            href="/blog/rss.xml"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Rss className="h-4 w-4" /> RSS feed
          </a>
        </div>
      </header>

      {labs.length > 0 ? (
        <nav aria-label="Browse articles by lab" className="mb-10 flex flex-wrap gap-2">
          {labs.map((lab) => (
            <Link
              key={lab.slug}
              href={`/blog/lab/${lab.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm transition-colors hover:border-primary/40 hover:text-primary"
            >
              {lab.name}
              <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">{lab.posts}</span>
            </Link>
          ))}
        </nav>
      ) : null}

      {posts.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <Newspaper className="mx-auto mb-3 h-8 w-8 opacity-60" />
          No articles have been published yet.{" "}
          <Link href="/labs" className="font-medium text-primary hover:underline">
            Explore the labs
          </Link>{" "}
          in the meantime.
        </div>
      )}
    </div>
  );
}

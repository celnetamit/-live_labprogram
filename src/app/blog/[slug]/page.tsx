import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowRight, CalendarDays, ChevronRight, Clock, FlaskConical } from "lucide-react";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { JsonLd } from "@/components/json-ld";
import { Markdown } from "@/components/markdown";
import { getLabGuide } from "@/content/labs";
import { parseList } from "@/lib/access";
import { parseMarkdown, plainText, readingMinutes, searchTitle, truncate, wordCount, type Block } from "@/lib/blog";
import { listPublicPosts } from "@/lib/blogData";
import { formatLaunchDate } from "@/lib/labStatus";
import prisma from "@/lib/prisma";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import PostCard from "../PostCard";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

/** Shared by generateMetadata and the page, so a request reads the post once. */
const getPost = cache((slug: string) =>
  prisma.blogPost.findUnique({
    where: { slug },
    include: { lab: { select: { id: true, slug: true, name: true, enabled: true, synopsis: true } } },
  }),
);

/** Published posts are public. A draft is visible only to an administrator previewing it. */
async function canView(status: string): Promise<boolean> {
  if (status === "PUBLISHED") return true;
  const session = await getServerSession(authOptions);
  return (session?.user as { role?: string } | undefined)?.role === "SUPER_ADMIN";
}

type Post = NonNullable<Awaited<ReturnType<typeof getPost>>>;

/** The focus keyword first, then the related ones, without repeats. */
function allKeywords(post: Post): string[] {
  const seen = new Set<string>();
  return [post.focusKeyword, ...parseList(post.keywords)].filter((keyword) => {
    const key = keyword.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** The cover image when there is one, otherwise the generated share card. */
function shareImage(post: Post): string {
  return post.coverImage || `/blog/og/${post.slug}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !(await canView(post.status))) return {};

  const path = `/blog/${post.slug}`;
  const headline = post.metaTitle || post.title;
  const keywords = allKeywords(post);
  const image = post.coverImage
    ? { url: post.coverImage, alt: post.coverAlt ?? post.title }
    : { url: shareImage(post), width: 1200, height: 630, alt: post.title };

  return {
    title: searchTitle(post),
    description: post.description,
    keywords,
    authors: post.authorName ? [{ name: post.authorName }] : undefined,
    alternates: { canonical: path },
    // A draft preview must never be indexed, even if its URL gets out.
    robots: post.status === "PUBLISHED" ? undefined : { index: false, follow: false },
    openGraph: {
      type: "article",
      url: path,
      title: headline,
      description: post.description,
      siteName: SITE_NAME,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
      tags: keywords,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: headline,
      description: post.description,
      images: [image.url],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !(await canView(post.status))) notFound();

  const published = post.status === "PUBLISHED";
  const blocks = parseMarkdown(post.body);
  const contents = blocks.filter((b): b is Extract<Block, { type: "heading" }> => b.type === "heading" && b.level === 2);
  const lab = post.lab?.enabled && post.lab.slug ? { ...post.lab, slug: post.lab.slug } : null;
  const guide = lab ? getLabGuide(lab.slug) : null;
  const url = absoluteUrl(`/blog/${post.slug}`);

  // Keep reading: the same lab first, topped up with the newest posts.
  const sameLab = lab ? await listPublicPosts({ labId: lab.id, excludeId: post.id, take: 3 }) : [];
  const related =
    sameLab.length >= 3
      ? sameLab
      : [
          ...sameLab,
          ...(await listPublicPosts({ excludeId: post.id, take: 6 })).filter(
            (candidate) => !sameLab.some((s) => s.id === candidate.id),
          ),
        ].slice(0, 3);

  const breadcrumbs = [
    { name: "Home", item: SITE_URL },
    { name: "Blog", item: absoluteUrl("/blog") },
    ...(lab ? [{ name: lab.name, item: absoluteUrl(`/blog/lab/${lab.slug}`) }] : []),
    { name: post.title, item: url },
  ];

  return (
    <>
      {published ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BlogPosting",
                "@id": `${url}#article`,
                headline: truncate(post.title, 110),
                description: post.description,
                image: [absoluteUrl(shareImage(post))],
                datePublished: post.publishedAt?.toISOString(),
                dateModified: post.updatedAt.toISOString(),
                author: post.authorName
                  ? { "@type": "Person", name: post.authorName }
                  : { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
                publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
                mainEntityOfPage: url,
                url,
                keywords: allKeywords(post).join(", "),
                wordCount: wordCount(blocks),
                inLanguage: "en",
                ...(lab ? { about: { "@type": "Thing", name: lab.name } } : {}),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: breadcrumbs.map((crumb, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: crumb.name,
                  item: crumb.item,
                })),
              },
            ],
          }}
        />
      ) : null}

      <article className="mx-auto max-w-3xl">
        {!published ? (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            <strong className="font-semibold">Draft preview.</strong> Only administrators can open this page, and it
            is marked noindex.{" "}
            <Link href={`/admin/blog/${post.id}`} className="font-medium underline">
              Back to the editor
            </Link>
          </div>
        ) : null}

        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/blog" className="transition-colors hover:text-foreground">
            Blog
          </Link>
          {lab ? (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/blog/lab/${lab.slug}`} className="transition-colors hover:text-foreground">
                {lab.name}
              </Link>
            </>
          ) : null}
        </nav>

        <header>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{post.title}</h1>
          {post.description ? (
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{post.description}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {post.authorName ? <span className="font-medium text-foreground">{post.authorName}</span> : null}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {post.publishedAt ? (
                <time dateTime={post.publishedAt.toISOString()}>{formatLaunchDate(post.publishedAt)}</time>
              ) : (
                "Not yet published"
              )}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readingMinutes(blocks)} min read
            </span>
          </div>
        </header>

        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- an author-supplied URL of unknown host and size.
          <img
            src={post.coverImage}
            alt={post.coverAlt ?? ""}
            className="mt-8 aspect-[1200/630] w-full rounded-2xl border border-border object-cover"
          />
        ) : null}

        {contents.length >= 3 ? (
          <nav aria-label="In this article" className="mt-8 rounded-2xl border border-border bg-muted/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In this article</p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {contents.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`} className="text-muted-foreground transition-colors hover:text-foreground">
                    {plainText(heading.text)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="mt-10">
          <Markdown blocks={blocks} />
        </div>

        {lab ? (
          <aside className="glass brand-ring relative mt-14 overflow-hidden rounded-2xl p-6 sm:p-8">
            <div className="aurora-blob animate-aurora bg-brand-2 -right-10 -top-24 h-64 w-64 opacity-25" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl btn-brand text-primary-foreground">
                <FlaskConical className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Try it yourself</p>
                <p className="mt-1 text-lg font-semibold">{lab.name}</p>
                {guide?.summary.tagline || lab.synopsis ? (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {guide?.summary.tagline ?? lab.synopsis}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="relative mt-5 flex flex-wrap gap-3">
              <Link
                href={`/labs?q=${encodeURIComponent(lab.name)}`}
                className="btn-brand inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                Explore the lab <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/blog/lab/${lab.slug}`}
                className="glass inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
              >
                More on {lab.name}
              </Link>
            </div>
          </aside>
        ) : null}
      </article>

      {related.length ? (
        <section aria-labelledby="keep-reading" className="mx-auto mt-20 max-w-6xl">
          <h2 id="keep-reading" className="mb-6 text-2xl font-bold tracking-tight">
            Keep reading
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PostCard key={item.id} post={item} headingLevel="h3" />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

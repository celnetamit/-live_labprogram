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
import { labImage, labImageCredit, labImageEdge } from "@/lib/learnerLabs";
import { showcaseFontClass } from "@/lib/showcase";
import { IconTile } from "@/components/learner-page";
import prisma from "@/lib/prisma";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import PostCard from "../PostCard";
import ArticleToc from "./ArticleToc";

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

/** Up to two initials for the author mark: "Live Labs Team" -> "LL". */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 2)).toUpperCase();
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !(await canView(post.status))) notFound();

  const published = post.status === "PUBLISHED";
  const blocks = parseMarkdown(post.body);
  // Top-level sections only: `#` and `##`. A `###` is detail inside one of them.
  const contents = blocks.filter((b): b is Extract<Block, { type: "heading" }> => b.type === "heading" && b.level <= 2);
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

  /*
    The picture under the header: the post's own cover, else the cover
    photograph of the lab it is about, else none. The generated share card is
    not used here — it only repeats the title printed above it.
  */
  const labPhoto = lab && labImageEdge(lab.slug) ? labImage(lab.slug, true) : null;
  const labCredit = lab ? labImageCredit(lab.slug) : null;
  const heroImage = post.coverImage
    ? { src: post.coverImage, alt: post.coverAlt ?? "", caption: null as string | null }
    : labPhoto
      ? { src: labPhoto, alt: "", caption: labCredit ? labCredit.text : null }
      : null;
  const tocItems = contents.map((heading) => ({ id: heading.id, text: plainText(heading.text) }));

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

      {/*
        Editorial layout: a sticky left column (where you are, and the
        article's contents with the current section marked) beside one
        reading column of about 72 characters. A soft band sits behind the
        header only, so the body reads on the plain page.
      */}
      <div className={`blog-article ${showcaseFontClass}`}>
        <div aria-hidden className="blog-band" />
        <div className="relative mx-auto grid max-w-6xl gap-10 pt-6 sm:pt-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-7">
              <nav aria-label="Breadcrumb" className="blog-crumbs">
                <Link href="/">Home</Link>
                <ChevronRight aria-hidden className="h-3.5 w-3.5" />
                <Link href="/blog">Blog</Link>
                {lab ? (
                  <>
                    <ChevronRight aria-hidden className="h-3.5 w-3.5" />
                    <Link href={`/blog/lab/${lab.slug}`}>{lab.name}</Link>
                  </>
                ) : null}
              </nav>
              <p className="blog-side-label blog-side-brand">The {SITE_NAME} blog</p>
              {contents.length >= 2 ? <ArticleToc variant="rail" items={tocItems} /> : null}
            </div>
          </aside>

          <article className="min-w-0 max-w-[760px]">
            {!published ? (
              <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                <strong className="font-semibold">Draft preview.</strong> Only administrators can open this page, and
                it is marked noindex.{" "}
                <Link href={`/admin/blog/${post.id}`} className="font-medium underline">
                  Back to the editor
                </Link>
              </div>
            ) : null}

            {/* On a wrapper: `.blog-crumbs` sets `display`, which would beat
                `lg:hidden` on the same element. */}
            <div className="mb-5 lg:hidden">
              <nav aria-label="Breadcrumb" className="blog-crumbs">
                <Link href="/blog">Blog</Link>
                {lab ? (
                  <>
                    <ChevronRight aria-hidden className="h-3.5 w-3.5" />
                    <Link href={`/blog/lab/${lab.slug}`}>{lab.name}</Link>
                  </>
                ) : null}
              </nav>
            </div>

            <header>
              {lab ? (
                <Link href={`/blog/lab/${lab.slug}`} className="blog-chip focus-ring">
                  {lab.name}
                </Link>
              ) : (
                <span className="blog-chip">Article</span>
              )}
              <h1 className="blog-title">{post.title}</h1>
              {post.description ? <p className="blog-lede">{post.description}</p> : null}

              <div className="mt-7 flex items-center gap-3.5">
                <span aria-hidden className="blog-avatar">
                  {initials(post.authorName || SITE_NAME)}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{post.authorName || SITE_NAME}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays aria-hidden className="h-4 w-4" />
                      {post.publishedAt ? (
                        <time dateTime={post.publishedAt.toISOString()}>{formatLaunchDate(post.publishedAt)}</time>
                      ) : (
                        "Not yet published"
                      )}
                    </span>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock aria-hidden className="h-4 w-4" />
                      {readingMinutes(blocks)} min read
                    </span>
                  </p>
                </div>
              </div>
            </header>

            {heroImage ? (
              <figure className="blog-hero">
                {/* eslint-disable-next-line @next/next/no-img-element -- an author-supplied URL of unknown host and size. */}
                <img src={heroImage.src} alt={heroImage.alt} />
                {heroImage.caption ? <figcaption>{heroImage.caption}</figcaption> : null}
              </figure>
            ) : null}

            {contents.length >= 2 ? (
              <div className="mt-8 lg:hidden">
                <ArticleToc variant="inline" items={tocItems} />
              </div>
            ) : null}

            <div className="blog-body mt-10">
              <Markdown blocks={blocks} />
            </div>

            {lab ? (
              <aside className="ui-card mt-14 p-6 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <IconTile icon={FlaskConical} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-primary-ink)]">
                      Try it yourself
                    </p>
                    <p className="ui-h2 mt-1 text-xl">{lab.name}</p>
                    {guide?.summary.tagline || lab.synopsis ? (
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {guide?.summary.tagline ?? lab.synopsis}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/labs?q=${encodeURIComponent(lab.name)}`} className="ui-btn ui-btn-primary focus-ring">
                    Explore the lab <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href={`/blog/lab/${lab.slug}`} className="ui-btn ui-btn-ghost focus-ring">
                    More on {lab.name}
                  </Link>
                </div>
              </aside>
            ) : null}
          </article>
        </div>
      </div>

      {related.length ? (
        <section aria-labelledby="keep-reading" className={`mx-auto mt-20 max-w-6xl ${showcaseFontClass}`}>
          <h2 id="keep-reading" className="ui-h2 mb-6 text-2xl">
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

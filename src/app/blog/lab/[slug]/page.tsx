import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import { getLabGuide } from "@/content/labs";
import { TITLE_SUFFIX, truncate } from "@/lib/blog";
import { listPublicPosts } from "@/lib/blogData";
import prisma from "@/lib/prisma";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import PostCard from "../../PostCard";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

/**
 * A topic page per lab: every article about it, under the lab's own description.
 *
 * It exists for search as much as for readers. The lab's detail page sits
 * behind sign-in, so until now nothing public and crawlable said what any one
 * lab is about — this page is that, and every post about the lab links to it.
 */
const getLab = cache(async (slug: string) => {
  const lab = await prisma.lab.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, enabled: true, synopsis: true, description: true },
  });
  return lab?.enabled && lab.slug ? { ...lab, slug: lab.slug } : null;
});

const getPosts = cache((labId: string) => listPublicPosts({ labId }));

function summaryOf(lab: { name: string; synopsis: string | null; description: string | null }, slug: string): string {
  return (
    getLabGuide(slug)?.summary.tagline ?? lab.synopsis ?? lab.description ?? `Guides and articles about ${lab.name}.`
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lab = await getLab(slug);
  if (!lab) return {};

  const posts = await getPosts(lab.id);
  const title = `${lab.name}: guides and articles`;
  const description = truncate(summaryOf(lab, lab.slug), 160);
  const path = `/blog/lab/${lab.slug}`;

  return {
    title: `${title}${TITLE_SUFFIX}`,
    description,
    alternates: { canonical: path },
    // An empty topic page is thin content: keep it out of the index until it has a post.
    robots: posts.length ? undefined : { index: false, follow: true },
    openGraph: { type: "website", url: path, title, description, siteName: SITE_NAME },
  };
}

export default async function LabTopicPage({ params }: Props) {
  const { slug } = await params;
  const lab = await getLab(slug);
  if (!lab) notFound();

  const posts = await getPosts(lab.id);
  const guide = getLabGuide(lab.slug);

  return (
    <div className="mx-auto max-w-6xl">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
            { "@type": "ListItem", position: 3, name: lab.name, item: absoluteUrl(`/blog/lab/${lab.slug}`) },
          ],
        }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/blog" className="transition-colors hover:text-foreground">
          Blog
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{lab.name}</span>
      </nav>

      <header className="relative overflow-hidden rounded-3xl border border-border bg-mesh p-8 sm:p-12">
        <div className="aurora-blob animate-aurora bg-brand-3 -right-10 -top-24 h-72 w-72 opacity-25" />
        <div className="relative max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Guides &amp; articles</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">{lab.name}</h1>
          <p className="mt-4 text-lg leading-relaxed text-foreground/90">{summaryOf(lab, lab.slug)}</p>
          {guide?.summary.what ? (
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <RichText>{guide.summary.what}</RichText>
            </p>
          ) : null}
          <Link
            href={`/labs?q=${encodeURIComponent(lab.name)}`}
            className="btn-brand mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            Explore the lab <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section aria-labelledby="articles" className="mt-12">
        <h2 id="articles" className="mb-6 text-2xl font-bold tracking-tight">
          {posts.length ? `${posts.length} article${posts.length === 1 ? "" : "s"}` : "No articles yet"}
        </h2>
        {posts.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} headingLevel="h3" showLab={false} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Nothing has been published about {lab.name} yet.{" "}
            <Link href="/blog" className="font-medium text-primary hover:underline">
              Browse every article
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}

import type { MetadataRoute } from "next";
import { LEGAL_PAGES } from "@/content/legal/pages";
import prisma from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";

/*
 * Rendered per request: posts are published from the admin without a deploy,
 * and the Docker build has no database to read anyway.
 */
export const dynamic = "force-dynamic";

/**
 * Every public, indexable page. Signed-in areas (/dashboard, /admin) and the
 * auth screens are left out; robots.ts disallows the former.
 *
 * `lastModified` is given only where it is actually known. Stamping the static
 * pages with the request time would claim they change on every crawl, and
 * search engines stop trusting the dates of a sitemap whose dates are
 * visibly wrong.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, labs] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, updatedAt: true, coverImage: true },
    }),
    prisma.lab.findMany({
      where: { enabled: true, slug: { not: null }, blogPosts: { some: { status: "PUBLISHED" } } },
      select: {
        slug: true,
        blogPosts: {
          where: { status: "PUBLISHED" },
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: { updatedAt: true },
        },
      },
    }),
  ]);

  const newest = posts.reduce<Date | undefined>(
    (latest, post) => (!latest || post.updatedAt > latest ? post.updatedAt : latest),
    undefined,
  );

  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/labs"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/blog"), lastModified: newest, changeFrequency: "daily", priority: 0.8 },
    ...labs.map((lab) => ({
      url: absoluteUrl(`/blog/lab/${lab.slug}`),
      lastModified: lab.blogPosts[0]?.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      ...(post.coverImage ? { images: [absoluteUrl(post.coverImage)] } : {}),
    })),
    ...LEGAL_PAGES.map((page) => ({
      url: absoluteUrl(page.href),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}

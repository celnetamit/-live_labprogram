import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

/** What a post card needs. The body is left out: a listing never renders it. */
const CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  coverImage: true,
  coverAlt: true,
  publishedAt: true,
  updatedAt: true,
  lab: { select: { slug: true, name: true, enabled: true } },
} satisfies Prisma.BlogPostSelect;

/** Published posts, newest first. */
export function listPublicPosts({
  labId,
  excludeId,
  take,
}: { labId?: string; excludeId?: string; take?: number } = {}) {
  return prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      ...(labId ? { labId } : {}),
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: CARD_SELECT,
  });
}

export type PostCardData = Awaited<ReturnType<typeof listPublicPosts>>[number];

/** Enabled labs with at least one published post, and how many they have. */
export async function labsWithPosts() {
  const labs = await prisma.lab.findMany({
    where: { enabled: true, slug: { not: null }, blogPosts: { some: { status: "PUBLISHED" } } },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      _count: { select: { blogPosts: { where: { status: "PUBLISHED" } } } },
    },
  });
  return labs.map((lab) => ({ slug: lab.slug as string, name: lab.name, posts: lab._count.blogPosts }));
}

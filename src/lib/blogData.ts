import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

/**
 * What a post card needs.
 *
 * `body` is selected but never returned — see `toCard`. A card that wants to
 * show a picture has only `coverImage` to go on, and an author who illustrated
 * the post inside the body and left the cover field blank got a flask
 * placeholder on the listing while the post itself was clearly illustrated.
 * Reading the body here lets the card fall back to the post's own first image.
 * Bodies are a few kilobytes; if they ever stop being, this is the place to
 * store a derived thumbnail at save time instead.
 */
const CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  coverImage: true,
  coverAlt: true,
  body: true,
  publishedAt: true,
  updatedAt: true,
  lab: { select: { slug: true, name: true, enabled: true } },
} satisfies Prisma.BlogPostSelect;

/**
 * The first image in a post body, HTML or Markdown.
 *
 * Only used when the author set no cover image, so it never overrides a
 * deliberate choice — including the deliberate choice of no picture at all,
 * which stays a placeholder because the body has nothing to find.
 */
function firstBodyImage(body: string | null | undefined): string | null {
  if (!body) return null;
  const html = body.match(/<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
  if (html) return html.trim() || null;
  // Markdown: ![alt](src "title")
  const md = body.match(/!\[[^\]]*\]\(\s*<?([^)\s>]+)/)?.[1];
  return md ? md.trim() || null : null;
}

/**
 * Shape a row into card data: adds the resolved image and drops the body, so a
 * listing never carries a post's full text further than this function.
 */
function toCard<T extends { coverImage: string | null; body: string | null }>(row: T) {
  const { body, ...rest } = row;
  return { ...rest, cardImage: rest.coverImage ?? firstBodyImage(body) };
}

/** Published posts, newest first. */
export async function listPublicPosts({
  labId,
  excludeId,
  take,
}: { labId?: string; excludeId?: string; take?: number } = {}) {
  const rows = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      ...(labId ? { labId } : {}),
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: CARD_SELECT,
  });
  return rows.map(toCard);
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

"use server";

import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isBlogStatus, parseKeywordInput, slugify } from "@/lib/blog";
import prisma from "@/lib/prisma";

export type SavePostResult = { ok: true; id: string; status: string } | { ok: false; error: string };

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

/** Every surface that lists or renders a post. */
function revalidateBlogSurfaces() {
  revalidatePath("/admin/blog");
  revalidatePath("/blog", "layout");
  revalidatePath("/sitemap.xml");
}

/** A site path or an http(s) URL. Anything else — `javascript:` included — is refused. */
function isImageSource(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/**
 * Create (`id` null) or update a post.
 *
 * Validation problems come back as `{ ok: false }` rather than being thrown, so
 * the editor can show the reason — a taken URL is an ordinary outcome, not a
 * crash. A draft needs only a title; publishing needs everything a search
 * result and a reader will see.
 */
export async function savePost(id: string | null, formData: FormData): Promise<SavePostResult> {
  const session = await requireAdmin();
  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const title = text("title");
  const slug = slugify(text("slug") || title);
  const status = text("status");
  const coverImage = text("coverImage") || null;
  const labId = text("labId") || null;

  const data = {
    title,
    slug,
    metaTitle: text("metaTitle") || null,
    description: text("description"),
    body: String(formData.get("body") ?? "").replace(/\s+$/, ""),
    focusKeyword: text("focusKeyword"),
    keywords: JSON.stringify(parseKeywordInput(text("keywords"))),
    coverImage,
    coverAlt: text("coverAlt") || null,
    authorName: text("authorName"),
    status: isBlogStatus(status) ? status : "DRAFT",
    labId,
  };

  if (!title) return { ok: false, error: "A headline is required, even for a draft." };
  if (!slug) return { ok: false, error: "The URL is empty — it needs at least one letter or number." };
  if (coverImage && !isImageSource(coverImage)) {
    return { ok: false, error: "The cover image must be a site path such as /showcase/virtual-ai.jpg, or an http(s) URL." };
  }
  if (data.status === "PUBLISHED") {
    const missing = [
      !data.description && "a meta description",
      !data.body && "a body",
      !data.focusKeyword && "a focus keyword",
      !data.authorName && "an author",
    ].filter(Boolean);
    if (missing.length) {
      return { ok: false, error: `To publish, add ${missing.join(", ")}. Save it as a draft to keep working.` };
    }
  }
  if (labId && !(await prisma.lab.findUnique({ where: { id: labId }, select: { id: true } }))) {
    return { ok: false, error: "The selected lab no longer exists." };
  }

  const before = id ? await prisma.blogPost.findUnique({ where: { id }, select: { publishedAt: true } }) : null;
  if (id && !before) return { ok: false, error: "This post has been deleted." };

  const clash = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true, title: true } });
  if (clash && clash.id !== id) {
    return { ok: false, error: `The URL /blog/${slug} is already used by “${clash.title}”.` };
  }

  const publishedAt = before?.publishedAt ?? (data.status === "PUBLISHED" ? new Date() : null);

  try {
    const saved = id
      ? await prisma.blogPost.update({ where: { id }, data: { ...data, publishedAt } })
      : await prisma.blogPost.create({
          data: { ...data, publishedAt, createdBy: (session.user as { id?: string }).id ?? null },
        });
    revalidateBlogSurfaces();
    return { ok: true, id: saved.id, status: saved.status };
  } catch (error) {
    // Two admins saving the same URL at once: the unique index is the real guard.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: `The URL /blog/${slug} was just taken by another post.` };
    }
    throw error;
  }
}

export async function deletePost(id: string) {
  await requireAdmin();
  await prisma.blogPost.delete({ where: { id } });
  revalidateBlogSurfaces();
  return { ok: true };
}

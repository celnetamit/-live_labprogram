import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import type { EditorLab } from "./BlogEditor";

/**
 * What the editor needs besides the post itself: the labs to pick from, every
 * other post's focus keyword for the duplicate check, and a default author.
 */
export async function loadEditorContext(currentPostId: string | null) {
  const [labs, others, session] = await Promise.all([
    prisma.lab.findMany({
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, enabled: true },
    }),
    prisma.blogPost.findMany({
      where: currentPostId ? { id: { not: currentPostId } } : {},
      select: { title: true, focusKeyword: true },
    }),
    getServerSession(authOptions),
  ]);

  return {
    labs: labs satisfies EditorLab[],
    otherFocusKeywords: others
      .filter((post) => post.focusKeyword.trim())
      .map((post) => ({ keyword: post.focusKeyword, title: post.title })),
    authorName: session?.user?.name ?? "",
  };
}

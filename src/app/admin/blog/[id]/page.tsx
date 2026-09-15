import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { parseList } from "@/lib/access";
import prisma from "@/lib/prisma";
import BlogEditor from "../BlogEditor";
import { loadEditorContext } from "../editorContext";

export const dynamic = "force-dynamic";

export default async function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  const { labs, otherFocusKeywords, authorName } = await loadEditorContext(post.id);

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/admin/blog"
        className="-ml-2 mb-2 inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All posts
      </Link>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Edit post</h1>
      <BlogEditor
        // Remount on navigation between posts, so one post's typing never carries into another.
        key={post.id}
        post={{
          id: post.id,
          slug: post.slug,
          title: post.title,
          metaTitle: post.metaTitle,
          description: post.description,
          body: post.body,
          focusKeyword: post.focusKeyword,
          keywords: parseList(post.keywords),
          coverImage: post.coverImage,
          coverAlt: post.coverAlt,
          authorName: post.authorName,
          status: post.status,
          labId: post.labId,
        }}
        labs={labs}
        otherFocusKeywords={otherFocusKeywords}
        defaults={{ labId: "", focusKeyword: "", authorName }}
      />
    </div>
  );
}

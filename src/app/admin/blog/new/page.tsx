import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlogEditor from "../BlogEditor";
import { loadEditorContext } from "../editorContext";

export const dynamic = "force-dynamic";

export default async function NewBlogPost({
  searchParams,
}: {
  searchParams: Promise<{ lab?: string | string[]; keyword?: string | string[] }>;
}) {
  const { lab, keyword } = await searchParams;
  const { labs, otherFocusKeywords, authorName } = await loadEditorContext(null);

  // Prefilled from "Write post" on the coverage table.
  const labId = typeof lab === "string" && labs.some((option) => option.id === lab) ? lab : "";
  const focusKeyword = typeof keyword === "string" ? keyword.slice(0, 120) : "";

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/admin/blog"
        className="-ml-2 mb-2 inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All posts
      </Link>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">New post</h1>
      <BlogEditor
        post={null}
        labs={labs}
        otherFocusKeywords={otherFocusKeywords}
        defaults={{ labId, focusKeyword, authorName }}
      />
    </div>
  );
}

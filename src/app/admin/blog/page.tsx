import Link from "next/link";
import { ExternalLink, Newspaper, Plus } from "lucide-react";
import { labKeywords } from "@/content/blog/lab-keywords";
import { formatLaunchDate } from "@/lib/labStatus";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlogAdmin() {
  const [posts, labs] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        focusKeyword: true,
        updatedAt: true,
        labId: true,
        lab: { select: { name: true } },
      },
    }),
    prisma.lab.findMany({ where: { enabled: true }, orderBy: { name: "asc" }, select: { id: true, slug: true, name: true } }),
  ]);

  const published = posts.filter((post) => post.status === "PUBLISHED").length;
  const targeted = new Set(posts.map((post) => post.focusKeyword.trim().toLowerCase()).filter(Boolean));

  /*
   * Which labs have content and which do not, fewest published first — the
   * reach of the blog comes from covering every lab, not from ten posts on one.
   * "Next keyword" is the first suggestion no post has taken as its focus yet.
   */
  const coverage = labs
    .map((lab) => {
      const own = posts.filter((post) => post.labId === lab.id);
      const live = own.filter((post) => post.status === "PUBLISHED").length;
      const suggestions = labKeywords(lab.slug);
      const all = suggestions ? [suggestions.pillar, ...suggestions.related] : [];
      return {
        lab,
        live,
        drafts: own.length - live,
        covered: all.filter((keyword) => targeted.has(keyword.toLowerCase())).length,
        total: all.length,
        next: all.find((keyword) => !targeted.has(keyword.toLowerCase())) ?? null,
      };
    })
    .sort((a, b) => a.live - b.live || a.lab.name.localeCompare(b.lab.name));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-mesh p-6 sm:p-7">
        <div className="aurora-blob animate-aurora bg-brand-2 -right-10 -top-20 h-64 w-64 opacity-25" />
        <div className="relative flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Blog <span className="text-gradient-animated">&amp; SEO</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              {published} published · {posts.length - published} drafts · one focus keyword per post, one topic page per lab.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              View blog <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link href="/admin/blog/new" className="btn-brand inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold">
              <Plus className="h-4 w-4" /> New post
            </Link>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="font-semibold">Coverage by lab</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Labs with the fewest published posts first. Each suggested keyword is a candidate for its own post; “Write post”
            starts one on the next keyword nobody has targeted yet.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Lab</th>
                <th className="px-3 py-3 font-medium">Published</th>
                <th className="px-3 py-3 font-medium">Drafts</th>
                <th className="px-3 py-3 font-medium">Keywords targeted</th>
                <th className="px-3 py-3 font-medium">Next keyword</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coverage.map((row) => (
                <tr key={row.lab.id}>
                  <td className="px-5 py-3 font-medium">{row.lab.name}</td>
                  <td className={`px-3 py-3 tabular-nums ${row.live ? "" : "text-amber-600 dark:text-amber-400"}`}>{row.live}</td>
                  <td className="px-3 py-3 tabular-nums text-muted-foreground">{row.drafts}</td>
                  <td className="px-3 py-3 tabular-nums text-muted-foreground">{row.total ? `${row.covered} / ${row.total}` : "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.next ?? (row.total ? "All targeted" : "No suggestions")}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/blog/new?lab=${row.lab.id}${row.next ? `&keyword=${encodeURIComponent(row.next)}` : ""}`}
                      className="whitespace-nowrap font-medium text-primary hover:underline"
                    >
                      Write post
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="font-semibold">All posts</h2>
        </div>
        {posts.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <Newspaper className="mx-auto mb-3 h-8 w-8 opacity-60" />
            No posts yet. Pick a lab above to write the first one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-3 py-3 font-medium">Lab</th>
                  <th className="px-3 py-3 font-medium">Focus keyword</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="max-w-md px-5 py-3">
                      <Link href={`/admin/blog/${post.id}`} className="font-medium hover:text-primary">
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{post.lab?.name ?? "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{post.focusKeyword || "—"}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                          post.status === "PUBLISHED"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {post.status === "PUBLISHED" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{formatLaunchDate(post.updatedAt)}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-right">
                      <Link href={`/admin/blog/${post.id}`} className="font-medium text-primary hover:underline">
                        Edit
                      </Link>
                      {post.status === "PUBLISHED" ? (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 text-muted-foreground hover:text-foreground"
                        >
                          View
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

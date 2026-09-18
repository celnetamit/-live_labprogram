import Link from "next/link";
import { FlaskConical } from "lucide-react";
import type { PostCardData } from "@/lib/blogData";
import { formatLaunchDate } from "@/lib/labStatus";

export default function PostCard({
  post,
  headingLevel = "h2",
  showLab = true,
}: {
  post: PostCardData;
  headingLevel?: "h1" | "h2" | "h3";
  showLab?: boolean;
}) {
  const Heading = headingLevel;
  const href = `/blog/${post.slug}`;
  const lab = showLab && post.lab?.enabled && post.lab.slug ? post.lab : null;

  return (
    <article className="card-glow flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {/* The image repeats the title link, so it is skipped by keyboard and screen readers. */}
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- an author-supplied URL of unknown host and size.
          <img src={post.coverImage} alt="" loading="lazy" className="aspect-[1200/630] w-full object-cover" />
        ) : (
          <div className="grid aspect-[1200/630] place-items-center bg-mesh">
            <FlaskConical className="h-8 w-8 text-primary/60" />
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {lab ? (
          <Link
            href={`/blog/lab/${lab.slug}`}
            className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          >
            {lab.name}
          </Link>
        ) : null}
        <Heading className={`${lab ? "mt-3" : ""} text-lg font-semibold leading-snug`}>
          <Link href={href} className="transition-colors hover:text-primary">
            {post.title}
          </Link>
        </Heading>
        {post.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.description}</p>
        ) : null}
        {post.publishedAt ? (
          <time dateTime={post.publishedAt.toISOString()} className="mt-auto pt-4 text-xs text-muted-foreground">
            {formatLaunchDate(post.publishedAt)}
          </time>
        ) : null}
      </div>
    </article>
  );
}

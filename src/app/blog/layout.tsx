import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Navbar from "@/components/navbar";
import { LEGAL_PAGES } from "@/content/legal/pages";
import { SITE_NAME } from "@/lib/site";

/**
 * Shell for every page under /blog. All of it is public and outside the auth
 * matcher in `src/proxy.ts` — a crawler never has a session. The session is
 * read only so a signed-in learner sees their own header rather than "Sign In".
 */
export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { name?: string | null; email?: string | null } | undefined;

  return (
    <>
      <Navbar user={user ? { name: user.name, email: user.email } : null} />
      <main className="flex-grow px-4 pb-20 pt-24 sm:px-6 lg:px-8">{children}</main>
      <footer className="border-t border-border bg-muted/20 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <span>
            © {new Date().getFullYear()} {SITE_NAME}
          </span>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/labs" className="transition-colors hover:text-foreground">
              Labs
            </Link>
            <Link href="/blog" className="transition-colors hover:text-foreground">
              Blog
            </Link>
            <a href="/blog/rss.xml" className="transition-colors hover:text-foreground">
              RSS
            </a>
            {LEGAL_PAGES.map((page) => (
              <Link key={page.href} href={page.href} className="transition-colors hover:text-foreground">
                {page.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}

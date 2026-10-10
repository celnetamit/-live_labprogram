import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import EditorialHeader from "@/components/editorial-header";
import EditorialFooter from "@/components/editorial-footer";

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
      <EditorialHeader user={user ? { name: user.name, email: user.email } : null} />
      <main className="shell flex-grow pb-20 pt-10">{children}</main>
      <EditorialFooter />
    </>
  );
}

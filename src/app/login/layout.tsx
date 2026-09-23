import type { Metadata } from "next";

/**
 * The sign-in page is a client component, so it cannot export `metadata`
 * itself; without this it inherited the site-wide title and description and
 * every auth page shared one entry in search results and link previews.
 */
export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to open your labs and pick up where you left off.",
  // Nothing here should be indexed: it is a form, and the content behind it is
  // per-account.
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

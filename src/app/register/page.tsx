import type { Metadata } from "next";
import Link from "next/link";
import { UserX } from "lucide-react";
import { getSettings } from "@/lib/platformSettings";
import { SITE_NAME } from "@/lib/site";
import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

/**
 * Its own title and description. Without these the page inherited the root
 * layout's, so the sign-up screen was indexed under the home page's headline
 * and summary — two URLs describing themselves identically.
 */
export const metadata: Metadata = {
  title: `Create an account — ${SITE_NAME}`,
  description:
    "Create a Live Labs account to open a laboratory and record your work. Every lab's method, expected results and sources are free to read without one.",
  alternates: { canonical: "/register" },
};

/**
 * Registration is gated here as well as in the API. Closing sign-ups should
 * mean the page says so, not that the form fails after someone fills it in.
 */
export default async function RegisterPage() {
  const { allowPublicRegistration, supportEmail, platformName } = await getSettings();

  if (!allowPublicRegistration) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="glass brand-ring w-full max-w-md rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
            <UserX className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Registration is closed</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {platformName} isn&apos;t accepting new sign-ups right now. Ask your
            administrator for an invitation.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            <a href={`mailto:${supportEmail}`} className="font-medium text-primary hover:underline">
              {supportEmail}
            </a>
          </p>
          <Link
            href="/login"
            className="btn-brand mt-6 inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-semibold"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    );
  }

  return <RegisterForm />;
}

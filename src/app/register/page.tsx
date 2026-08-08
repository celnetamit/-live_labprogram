import Link from "next/link";
import { UserX } from "lucide-react";
import { getSettings } from "@/lib/platformSettings";
import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

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

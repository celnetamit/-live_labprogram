import Link from "next/link";
import { Wrench } from "lucide-react";

/** Shown to learners while an admin has maintenance mode switched on. */
export default function MaintenanceNotice({
  message,
  supportEmail,
  platformName,
}: {
  message: string | null;
  supportEmail: string;
  platformName: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass brand-ring w-full max-w-md rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-400">
          <Wrench className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Back shortly</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {message || `${platformName} is down for maintenance. Please try again soon.`}
        </p>
        <p className="mt-6 text-xs text-muted-foreground">
          Need help?{" "}
          <a href={`mailto:${supportEmail}`} className="font-medium text-primary hover:underline">
            {supportEmail}
          </a>
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg border border-input px-5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

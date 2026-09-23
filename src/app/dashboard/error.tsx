"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

/**
 * Error boundary for the dashboard segment.
 *
 * These pages query Postgres on every request, so a database that is briefly
 * unreachable previously surfaced as Next's generic error page with none of the
 * app's navigation — a learner had no way back other than the browser's back
 * button. This keeps them inside the shell and offers the one useful action.
 *
 * The message is deliberately vague about the cause: the real error can name
 * internals, and `digest` is the handle for matching it to the server log.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard segment error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="text-lg font-semibold">This page didn&apos;t load</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Something went wrong fetching your labs. Your progress is safe — it is stored against your
        account, not on this page.
      </p>
      <div className="mt-5 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
        <Link
          href="/dashboard/labs"
          className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-accent"
        >
          Go to your labs
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-muted-foreground">
          Reference: <code className="font-mono">{error.digest}</code>
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Loader2, KeyRound, XCircle } from "lucide-react";

/**
 * The learner's side of lab access.
 *
 * Opening a lab is granted by an admin, not bought: pressing the button files
 * an `AccessRequest`, which lands in Admin -> Access Requests. This component
 * is the whole of what the learner sees of that, across three placements on the
 * lab page (the paywall panel, the sticky rail and the mobile bar), so the
 * state is described once here rather than three times at each call site.
 *
 * Four states, and the button only exists in two of them:
 *
 *   none      never asked            -> "Request access"
 *   pending   waiting on an admin    -> no button; says where the request is
 *   rejected  an admin declined      -> "Request access again"
 *   approved  never rendered — the page treats the learner as an owner and
 *             shows the launch button instead
 *
 * A rejection is not a dead end on purpose: it is usually about timing or a
 * missing detail, so asking again has to be possible without leaving the page.
 */

export type AccessRequestState = "none" | "pending" | "rejected";

export default function AccessRequestPanel({
  labId,
  state,
  reviewedAt,
  note,
  compact = false,
  variant = "panel",
}: {
  labId: string;
  state: AccessRequestState;
  /** When an admin decided, for the rejected state. ISO string. */
  reviewedAt?: string | null;
  /** The admin's note on the decision, when they left one. */
  note?: string | null;
  /** Keep the button its intrinsic width and centre it, for standalone panels. */
  compact?: boolean;
  /** `bar` trims the explanatory copy for the fixed mobile action bar. */
  variant?: "panel" | "rail" | "bar";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  /*
    Set when this component files the request, so the confirmation is immediate.
    `router.refresh()` re-renders the server component behind it, but that is a
    round trip, and the learner needs to know the press registered at once.
  */
  const [justSent, setJustSent] = useState(false);

  const pending = state === "pending" || justSent;

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not send the request");
      setJustSent(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (pending) {
    return (
      <div className={compact ? "flex flex-col items-center gap-2" : "flex flex-col gap-2"}>
        <div
          className={`flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm ${
            compact ? "justify-center" : ""
          }`}
        >
          <Clock className="h-4 w-4 shrink-0 text-[color:var(--color-warning)]" />
          <span className="font-medium">Request sent — waiting for approval</span>
        </div>
        {variant !== "bar" && (
          <p className={`text-xs text-muted-foreground ${compact ? "text-center" : ""}`}>
            An administrator has your request for this lab. You will be emailed when it is decided,
            and the lab will open from here.
          </p>
        )}
      </div>
    );
  }

  const rejected = state === "rejected";

  return (
    <div className={compact ? "flex flex-col items-center gap-2" : "flex flex-col gap-2"}>
      {rejected && variant !== "bar" && (
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-left">
          <p className="flex items-center gap-2 text-sm font-medium">
            <XCircle className="h-4 w-4 shrink-0 text-[color:var(--color-destructive)]" />
            Not approved
          </p>
          {note ? (
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Your last request for this lab was declined
              {reviewedAt
                ? ` on ${new Date(reviewedAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}`
                : ""}
              . You can ask again.
            </p>
          )}
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60 ${
          compact ? "px-6" : "w-full px-4"
        }`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : rejected ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <KeyRound className="h-4 w-4" />
        )}
        <span className="truncate">
          {loading ? "Sending…" : rejected ? "Request access again" : "Request access"}
        </span>
      </button>

      {error && <p className="text-sm text-[color:var(--color-destructive)]">{error}</p>}

      {variant === "panel" && !rejected && (
        <p className="text-xs text-muted-foreground">
          An administrator reviews each request. You will be emailed with the decision.
        </p>
      )}
    </div>
  );
}

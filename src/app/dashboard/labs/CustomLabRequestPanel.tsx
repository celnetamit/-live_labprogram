"use client";

import { useState } from "react";
import Link from "next/link";
import { Lightbulb, Loader2, Plus, X, CheckCircle2 } from "lucide-react";
import { CUSTOM_REQUEST_LABEL, customRequestTone } from "@/lib/labStatus";

export type MyLabRequest = {
  id: string;
  title: string;
  description: string;
  subject: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

/**
 * "Can't find the lab you need?" — lets a signed-in learner pitch a lab that is
 * in neither the active nor the upcoming list, and track what the admin said
 * about the ones they already pitched.
 *
 * On the public catalogue there is no session, so the CTA points at sign-in.
 */
export default function CustomLabRequestPanel({
  publicMode = false,
  initialRequests = [],
}: {
  publicMode?: boolean;
  initialRequests?: MyLabRequest[];
}) {
  const [requests, setRequests] = useState<MyLabRequest[]>(initialRequests);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/custom-lab-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          subject: form.get("subject"),
          difficulty: form.get("difficulty"),
          audience: form.get("audience"),
          timeline: form.get("timeline"),
          description: form.get("description"),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Could not send your request. Please try again.");
        return;
      }

      setRequests((r) => [data.request as MyLabRequest, ...r]);
      setOpen(false);
      setSuccess("Request sent — you'll see the admin's reply here.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10">
      <div className="glass brand-ring relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="aurora-blob animate-aurora bg-brand-3 w-56 h-56 -top-20 -right-10 opacity-25" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
              <Lightbulb className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold sm:text-xl">Need a lab we don&apos;t have yet?</h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                If it isn&apos;t in the active or upcoming lists, tell us what you want to build.
                We review every request and the accepted ones show up here as upcoming labs.
              </p>
            </div>
          </div>

          {publicMode ? (
            <Link
              href="/login?callbackUrl=/dashboard/labs"
              className="btn-brand inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold"
            >
              Sign in to request
            </Link>
          ) : (
            <button
              onClick={() => {
                setSuccess("");
                setOpen(true);
              }}
              className="btn-brand inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" /> Request a custom lab
            </button>
          )}
        </div>

        {success && (
          <p className="relative mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
            <CheckCircle2 className="h-4 w-4" /> {success}
          </p>
        )}
      </div>

      {/* The learner's own pitches and where each one stands. */}
      {!publicMode && requests.length > 0 && (
        <div className="mt-5 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h3 className="font-semibold">Your lab requests ({requests.length})</h3>
          </div>
          <ul className="divide-y divide-border">
            {requests.map((r) => (
              <li key={r.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{r.title}</p>
                  <span className={`pill ${customRequestTone(r.status)}`}>
                    {CUSTOM_REQUEST_LABEL[r.status] ?? r.status}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                {r.adminNotes && (
                  <p className="mt-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Reply: </span>
                    {r.adminNotes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
              <h3 className="text-lg font-bold">Request a custom lab</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">What should the lab be called?</label>
                <input
                  name="title"
                  required
                  minLength={4}
                  maxLength={120}
                  placeholder="e.g. Federated learning on medical imaging"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject area</label>
                  <input
                    name="subject"
                    maxLength={120}
                    placeholder="e.g. Healthcare AI"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Level</label>
                  <select
                    name="difficulty"
                    defaultValue="Intermediate"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Who is it for?</label>
                  <input
                    name="audience"
                    maxLength={120}
                    placeholder="Me / my team of 8 / a cohort"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">When do you need it?</label>
                  <input
                    name="timeline"
                    maxLength={120}
                    placeholder="e.g. next quarter"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">What should it cover?</label>
                <textarea
                  name="description"
                  required
                  minLength={20}
                  maxLength={2000}
                  rows={5}
                  placeholder="Describe the workflow, datasets, tools and the outcome you want learners to reach…"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground">At least a couple of sentences.</p>
              </div>

              {error && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="mt-2 flex justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-brand flex items-center rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

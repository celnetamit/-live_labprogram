"use client";

import { useState, useTransition } from "react";
import { ClipboardCheck, AlertTriangle, ChevronDown, ChevronRight, FileSignature, Loader2, Trash2 } from "lucide-react";
import { archiveReview } from "./actions";
import {
  DOMAIN_CHECKS, RATING_LABELS, RECOMMENDATIONS, REVIEW_AREAS, SEVERITY_DEFINITIONS,
} from "@/lib/reviewForm";

export type AdminReview = {
  id: string;
  reviewerName: string;
  areaOfExpertise: string;
  versionBuild: string | null;
  ratings: Record<string, string>;
  issues: { module: string; severity: string; observation: string; recommendation: string }[];
  domainChecks: Record<string, string[]>;
  finalRecommendation: string | null;
  mostImportantCorrection: string | null;
  optionalSuggestions: string | null;
  reviewerComments: string | null;
  reviewDate: string | null;
  submittedAt: string | null;
  labSlug: string | null;
  user: { email: string | null; name: string | null; organization: string | null } | null;
  lab: { name: string; slug: string | null } | null;
};

/**
 * A fixed, locale-independent timestamp.
 *
 * `toLocaleString()` was here and produced a hydration mismatch: Node formatted
 * "05/09/2026, 17:07:58" and the browser "5/9/2026, 5:07:58 pm" for the same
 * instant, so React discarded the server-rendered markup. Any Intl-backed
 * formatter has this problem unless the server and the browser agree on locale
 * and timezone, which they do not. A review's submission time is an audit fact,
 * so an unambiguous format is the right answer anyway.
 */
function stamp(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

const RATING_TONE: Record<string, string> = {
  EXCELLENT: "text-emerald-400",
  GOOD: "text-sky-400",
  NEEDS_IMPROVEMENT: "text-amber-400",
  MAJOR_CONCERN: "text-rose-400",
  NA: "text-muted-foreground",
};

const SEVERITY_TONE: Record<string, string> = {
  CRITICAL: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  MAJOR: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  MINOR: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  SUGGESTION: "bg-muted text-muted-foreground border-border",
};

const RECOMMENDATION_TONE: Record<string, string> = {
  RELEASE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  MINOR_CORRECTIONS: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  MAJOR_CORRECTIONS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  RE_REVIEW: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  NOT_RECOMMENDED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export type SignedAgreement = {
  id: string;
  reviewerName: string;
  designation: string;
  institution: string;
  email: string;
  domain: string;
  labName: string | null;
  reviewBuild: string | null;
  reviewRoles: string[];
  agreementVersion: string;
  agreementFingerprint: string;
  acknowledgedAt: string;
  accountEmail: string | null;
};

const ROLE_LABELS: Record<string, string> = {
  SCIENTIFIC: "Scientific",
  TECHNICAL: "Technical",
  AI_COMPUTATIONAL: "AI/Computational",
  DATA_METHODOLOGY: "Data/Methodology",
  EDUCATIONAL_UX: "Educational/UX",
  SECURITY_PRIVACY: "Security/Privacy",
  COMPLETE: "Complete Expert Review",
};

export default function ReviewsClient({
  reviews,
  draftCount,
  archivedCount,
  agreements,
}: {
  reviews: AdminReview[];
  draftCount: number;
  /** Submitted reviews an admin has already cleared from the queue. */
  archivedCount: number;
  agreements: SignedAgreement[];
}) {
  const [open, setOpen] = useState<string | null>(reviews[0]?.id ?? null);
  /*
    Two tabs rather than two stacked sections. The agreements list grows one
    entry per reviewer per lab, and stacked above the reviews it pushed the
    thing this page is named after below the fold.
  */
  const [tab, setTab] = useState<"reviews" | "agreements">("reviews");
  const [pending, startTransition] = useTransition();
  /** The review awaiting a second press, so Remove is never one click. */
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function remove(id: string) {
    setBusy(id);
    startTransition(async () => {
      try {
        await archiveReview(id);
      } finally {
        setBusy(null);
        setConfirming(null);
      }
    });
  }

  const TABS = [
    { id: "reviews" as const, label: "Reviews", count: reviews.length, icon: ClipboardCheck },
    { id: "agreements" as const, label: "Signed agreements", count: agreements.length, icon: FileSignature },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Expert reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Completed NanoSchool Expert Review Forms, submitted from inside the labs. Each is tied to the build it was
          written against.
          {draftCount > 0 && (
            <>
              {" "}
              {draftCount} draft{draftCount === 1 ? " is" : "s are"} in progress and not shown — a draft is the
              reviewer&rsquo;s private working copy until they sign it off.
            </>
          )}
        </p>
      </header>

      {/* The two halves of reviewer work, as tabs. */}
      <div className="flex gap-1 border-b border-border" role="tablist" aria-label="Expert reviews">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-primary font-semibold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                  active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Signed undertakings */}
      {tab === "agreements" && (
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold">Signed reviewer agreements ({agreements.length})</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          The Expert Reviewer Agreement &amp; Confidentiality Undertaking, as signed. A reviewer cannot open the
          review form until this is recorded, and a change to the agreement wording asks everyone to sign again.
        </p>
        {agreements.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            None yet. Mark an account as an expert reviewer under Users &amp; Access, and the agreement appears
            inside the lab for them to read and sign.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {agreements.map((a) => (
              <li key={a.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{a.reviewerName}</span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                    {a.designation}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{a.institution}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {a.labName} · {a.domain} · build {a.reviewBuild ?? "unrecorded"} · signed {stamp(a.acknowledgedAt)}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {a.reviewRoles.map((role) => (
                    <span key={role} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                      {ROLE_LABELS[role] ?? role}
                    </span>
                  ))}
                </div>
                <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                  {a.email}
                  {a.accountEmail && a.accountEmail !== a.email && <> · account {a.accountEmail}</>}
                  {" · "}
                  {a.agreementVersion} · {a.agreementFingerprint}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      )}

      {tab === "reviews" && (reviews.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
          <ClipboardCheck className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No submitted reviews yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Mark an account as an expert reviewer under Users &amp; Access, and the review form appears inside every
            lab that account can open.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => {
            const expanded = open === r.id;
            const recommendation = RECOMMENDATIONS.find((o) => o.id === r.finalRecommendation);
            const critical = r.issues.filter((i) => i.severity === "CRITICAL").length;
            const major = r.issues.filter((i) => i.severity === "MAJOR").length;

            return (
              <li key={r.id} className="rounded-xl border border-border bg-card">
                <button
                  onClick={() => setOpen(expanded ? null : r.id)}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  {expanded ? (
                    <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{r.reviewerName}</span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                        {r.areaOfExpertise}
                      </span>
                      {recommendation && (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            RECOMMENDATION_TONE[recommendation.id] ?? "border-border"
                          }`}
                        >
                          {recommendation.label}
                        </span>
                      )}
                      {critical > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
                          <AlertTriangle className="h-3 w-3" />
                          {critical} critical
                        </span>
                      )}
                      {major > 0 && (
                        <span className="text-[11px] font-medium text-amber-400">{major} major</span>
                      )}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {r.lab?.name ?? r.labSlug} · build {r.versionBuild ?? "unrecorded"} ·{" "}
                      {r.submittedAt ? stamp(r.submittedAt) : "—"}
                      {r.user?.email && <> · {r.user.email}</>}
                    </span>
                  </span>
                </button>

                {/*
                    Remove clears the review from the queue once it has been
                    read. Two presses: the first arms it, the second archives.
                    An expert's signed assessment is not something a stray click
                    on a long list should be able to take off the screen.
                */}
                <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-2">
                  {confirming === r.id ? (
                    <>
                      <span className="mr-auto text-xs text-muted-foreground">
                        Remove this review from the queue? It stays on record.
                      </span>
                      <button
                        onClick={() => setConfirming(null)}
                        disabled={busy === r.id}
                        className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        disabled={busy === r.id || pending}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[color:var(--color-destructive)] px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                      >
                        {busy === r.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        {busy === r.id ? "Removing…" : "Yes, remove"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirming(r.id)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                {expanded && (
                  <div className="space-y-5 border-t border-border p-4">
                    {/* A */}
                    <div>
                      <h3 className="text-sm font-bold">A. Overall assessment</h3>
                      <div className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                        {REVIEW_AREAS.map((area) => {
                          const value = r.ratings[area.id];
                          return (
                            <div key={area.id} className="flex items-baseline justify-between gap-3 text-xs">
                              <span className="text-muted-foreground">{area.label}</span>
                              <span className={`font-semibold ${RATING_TONE[value] ?? "text-muted-foreground"}`}>
                                {value ? RATING_LABELS[value as keyof typeof RATING_LABELS] : "not rated"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* B */}
                    <div>
                      <h3 className="text-sm font-bold">B. Issues &amp; recommendations</h3>
                      {r.issues.length === 0 ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          None raised. The form does not require any — an empty table is a reviewer with no
                          observations, not an incomplete form.
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {r.issues.map((issue, i) => (
                            <li key={i} className="rounded-lg border border-border p-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold">{issue.module || "—"}</span>
                                {issue.severity && (
                                  <span
                                    className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                      SEVERITY_TONE[issue.severity] ?? "border-border"
                                    }`}
                                    title={
                                      SEVERITY_DEFINITIONS[issue.severity as keyof typeof SEVERITY_DEFINITIONS]
                                        ?.definition
                                    }
                                  >
                                    {issue.severity}
                                  </span>
                                )}
                              </div>
                              {issue.observation && (
                                <p className="mt-1.5 whitespace-pre-wrap text-xs">{issue.observation}</p>
                              )}
                              {issue.recommendation && (
                                <p className="mt-1.5 whitespace-pre-wrap text-xs text-muted-foreground">
                                  <span className="font-semibold">Recommended:</span> {issue.recommendation}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* C */}
                    <div>
                      <h3 className="text-sm font-bold">C. Domain-specific checks</h3>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        {DOMAIN_CHECKS.map((domain) => {
                          const checked = r.domainChecks[domain.id] ?? [];
                          if (checked.length === 0) return null;
                          return (
                            <div key={domain.id} className="rounded-lg border border-border p-3">
                              <p className="text-xs font-semibold">{domain.label}</p>
                              <ul className="mt-1 space-y-0.5">
                                {domain.items.map((item) => (
                                  <li key={item.id} className="flex gap-1.5 text-[11px]">
                                    <span className={checked.includes(item.id) ? "text-emerald-400" : "text-muted-foreground"}>
                                      {checked.includes(item.id) ? "✓" : "○"}
                                    </span>
                                    <span
                                      className={
                                        checked.includes(item.id) ? "" : "text-muted-foreground line-through/0 opacity-60"
                                      }
                                    >
                                      {item.label}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                        {Object.values(r.domainChecks).every((v) => (v ?? []).length === 0) && (
                          <p className="text-xs text-muted-foreground">
                            None completed. The form asks reviewers to fill in only the domains matching their
                            expertise.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* D */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold">D. Final recommendation</h3>
                      {r.mostImportantCorrection && (
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                          <p className="text-xs font-bold text-amber-400">Most important correction before release</p>
                          <p className="mt-1 whitespace-pre-wrap text-xs">{r.mostImportantCorrection}</p>
                        </div>
                      )}
                      {r.optionalSuggestions && (
                        <div>
                          <p className="text-xs font-semibold">Optional suggestions / additional features</p>
                          <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">
                            {r.optionalSuggestions}
                          </p>
                        </div>
                      )}
                      {r.reviewerComments && (
                        <div>
                          <p className="text-xs font-semibold">Reviewer comments</p>
                          <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">
                            {r.reviewerComments}
                          </p>
                        </div>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        Signed off by {r.reviewerName}
                        {r.user?.organization ? `, ${r.user.organization}` : ""} on {r.reviewDate ?? "—"}.
                      </p>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ))}

      {tab === "reviews" && archivedCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {archivedCount} review{archivedCount === 1 ? " has" : "s have"} been removed from this queue. They are
          archived, not deleted — the assessments are still on record.
        </p>
      )}
    </div>
  );
}

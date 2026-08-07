"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lightbulb,
  Loader2,
  User,
  Trash,
  CalendarClock,
  Rocket,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import {
  CUSTOM_REQUEST_LABEL,
  CUSTOM_REQUEST_STATUSES,
  customRequestTone,
  formatLaunchDate,
} from "@/lib/labStatus";
import { reviewRequest, planRequestAsLab, deleteRequest } from "./actions";

export type AdminLabRequest = {
  id: string;
  title: string;
  description: string;
  subject: string | null;
  difficulty: string | null;
  audience: string | null;
  timeline: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  plannedLabId: string | null;
  user: {
    name: string | null;
    email: string | null;
    organization: string | null;
    designation: string | null;
  };
  plannedLab: {
    id: string;
    name: string;
    slug: string | null;
    status: string;
    launchAt: Date | null;
  } | null;
};

const FILTERS = ["ALL", ...CUSTOM_REQUEST_STATUSES] as const;
type Filter = (typeof FILTERS)[number];

export default function LabRequestsClient({ requests }: { requests: AdminLabRequest[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [dateDraft, setDateDraft] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: requests.length };
    for (const s of CUSTOM_REQUEST_STATUSES) c[s] = 0;
    for (const r of requests) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [requests]);

  const visible = useMemo(
    () => (filter === "ALL" ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter]
  );

  const run = async (id: string, fn: () => Promise<unknown>, ok: string) => {
    setBusyId(id);
    setNotice("");
    try {
      await fn();
      setNotice(ok);
      router.refresh();
    } catch (error) {
      console.error(error);
      setNotice(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-mesh border border-border p-6 sm:p-7 mb-6">
        <div className="aurora-blob animate-aurora bg-brand-3 w-64 h-64 -top-20 -right-10 opacity-25" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Custom Lab <span className="text-gradient-animated">Requests</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {/* One template literal: JSX strips the leading space of a text
                node that wraps onto another line. */}
            {`${counts.PENDING} awaiting review · ${counts.PLANNED} planned — labs learners asked for that aren't in the catalogue yet.`}
          </p>
        </div>
      </div>

      {notice && (
        <div className="mb-4 text-sm px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
          {notice}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "border-input text-muted-foreground hover:bg-accent"
            }`}
          >
            {f === "ALL" ? "All" : CUSTOM_REQUEST_LABEL[f]}
            <span className="ml-1.5 opacity-70 tabular-nums">{counts[f] ?? 0}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center">
          <Lightbulb className="w-8 h-8 text-muted-foreground/50 mb-3" />
          <p>No requests here yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((req) => {
            const busy = busyId === req.id;
            return (
              <div key={req.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-border">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold">{req.title}</h2>
                        <span className={`pill ${customRequestTone(req.status)}`}>
                          {CUSTOM_REQUEST_LABEL[req.status] ?? req.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {[req.subject, req.difficulty, req.audience, req.timeline]
                          .filter(Boolean)
                          .join(" · ") || "No extra details supplied"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(req.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                    {req.description}
                  </p>

                  <div className="mt-4 flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{req.user.name || "Unknown user"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {req.user.email}
                        {req.user.organization ? ` · ${req.user.organization}` : ""}
                      </p>
                    </div>
                  </div>

                  {req.plannedLab && (
                    <div className="mt-4 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
                      <span className="text-muted-foreground">Planned as </span>
                      <Link
                        href="/admin/labs"
                        className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {req.plannedLab.name}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <span className="text-muted-foreground">
                        {" "}
                        · {req.plannedLab.status}
                        {formatLaunchDate(req.plannedLab.launchAt)
                          ? ` · ${formatLaunchDate(req.plannedLab.launchAt)}`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Triage controls */}
                <div className="p-5 sm:p-6 bg-muted/20 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Reply to the requester
                    </label>
                    <textarea
                      rows={2}
                      defaultValue={req.adminNotes ?? ""}
                      onChange={(e) =>
                        setNotesDraft((d) => ({ ...d, [req.id]: e.target.value }))
                      }
                      placeholder="Shown to the learner alongside their request…"
                      className="mt-1 w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {CUSTOM_REQUEST_STATUSES.filter((s) => s !== req.status).map((s) => (
                      <button
                        key={s}
                        disabled={busy}
                        onClick={() =>
                          run(
                            req.id,
                            () => reviewRequest(req.id, s, notesDraft[req.id] ?? req.adminNotes ?? ""),
                            `Marked “${req.title}” as ${CUSTOM_REQUEST_LABEL[s].toLowerCase()}.`
                          )
                        }
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-input hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        Mark {CUSTOM_REQUEST_LABEL[s].toLowerCase()}
                      </button>
                    ))}

                    <div className="ml-auto flex items-center gap-2">
                      {!req.plannedLabId && (
                        <>
                          <div className="relative">
                            <CalendarClock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                              type="date"
                              value={dateDraft[req.id] ?? ""}
                              onChange={(e) =>
                                setDateDraft((d) => ({ ...d, [req.id]: e.target.value }))
                              }
                              title="Expected launch date (optional)"
                              className="pl-8 pr-2 py-1.5 bg-background border border-input rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <button
                            disabled={busy}
                            onClick={() =>
                              run(
                                req.id,
                                () =>
                                  planRequestAsLab(
                                    req.id,
                                    dateDraft[req.id] || null,
                                    notesDraft[req.id] ?? req.adminNotes ?? ""
                                  ),
                                `Created “${req.title}” as an upcoming lab.`
                              )
                            }
                            className="px-3 py-1.5 btn-brand rounded-lg text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {busy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Rocket className="w-3.5 h-3.5" />
                            )}
                            Create upcoming lab
                          </button>
                        </>
                      )}
                      <button
                        disabled={busy}
                        onClick={() => {
                          if (!confirm("Delete this request? This cannot be undone.")) return;
                          run(req.id, () => deleteRequest(req.id), "Request deleted.");
                        }}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete request"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

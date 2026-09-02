"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Loader2, Trash, Mail, Star, Bug, FlaskConical,
  Eye, Lightbulb, CheckCircle2, XCircle, Clock, Building2,
} from "lucide-react";
import { bulkSetStatus, deleteFeedback, reviewFeedback, saveFeedbackNotes } from "./actions";
import { FEEDBACK_STATUSES } from "@/lib/feedbackStatus";

export type AdminFeedback = {
  id: string;
  name: string;
  email: string;
  designation: string;
  category: string;
  rating: number | null;
  message: string;
  screen: string | null;
  appVersion: string | null;
  labSlug: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewerName: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    organization: string | null;
    designation: string | null;
  } | null;
  lab: { name: string; slug: string | null } | null;
};

const CATEGORY_META: Record<string, { label: string; icon: typeof Bug; tone: string }> = {
  GENERAL: { label: "General", icon: MessageSquare, tone: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  BUG: { label: "Broken", icon: Bug, tone: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  SCIENCE: { label: "Science", icon: FlaskConical, tone: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  USABILITY: { label: "Usability", icon: Eye, tone: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  FEATURE: { label: "Missing", icon: Lightbulb, tone: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
};

const STATUS_META: Record<string, { label: string; tone: string }> = {
  NEW: { label: "New", tone: "bg-primary/15 text-primary border-primary/30" },
  TRIAGED: { label: "Triaged", tone: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  ACTIONED: { label: "Actioned", tone: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  DECLINED: { label: "Declined", tone: "bg-muted text-muted-foreground border-border" },
};

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function FeedbackClient({ feedback }: { feedback: AdminFeedback[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: feedback.length };
    for (const status of FEEDBACK_STATUSES) {
      map[status] = feedback.filter((f) => f.status === status).length;
    }
    return map;
  }, [feedback]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return feedback.filter((f) => {
      if (statusFilter !== "ALL" && f.status !== statusFilter) return false;
      if (categoryFilter !== "ALL" && f.category !== categoryFilter) return false;
      if (!needle) return true;
      return [f.name, f.email, f.designation, f.message, f.labSlug ?? "", f.user?.email ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [feedback, statusFilter, categoryFilter, query]);

  const run = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    try {
      await fn();
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulk = async (status: string) => {
    const ids = [...selected];
    if (ids.length === 0) return;
    setBusyId("bulk");
    try {
      await bulkSetStatus(ids, status);
      setSelected(new Set());
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sent from inside the labs. Every message carries the account it came from, the build it was written
          against, and what the sender said their role was — which is what decides how a report should be read.
        </p>
      </header>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(["ALL", ...FEEDBACK_STATUSES] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {status === "ALL" ? "All" : STATUS_META[status].label}
              <span className="ml-1.5 text-xs opacity-70">{counts[status] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategoryFilter("ALL")}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
              categoryFilter === "ALL" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            All kinds
          </button>
          {Object.entries(CATEGORY_META).map(([value, meta]) => (
            <button
              key={value}
              onClick={() => setCategoryFilter(value)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                categoryFilter === value ? meta.tone : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {meta.label}
            </button>
          ))}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, role or message…"
            className="ml-auto min-w-[16rem] flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Bulk actions appear only when something is selected. */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium">{selected.size} selected</span>
          {FEEDBACK_STATUSES.filter((s) => s !== "NEW").map((status) => (
            <button
              key={status}
              onClick={() => void bulk(status)}
              disabled={busyId === "bulk"}
              className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-accent disabled:opacity-50"
            >
              Mark {STATUS_META[status].label.toLowerCase()}
            </button>
          ))}
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-muted-foreground hover:underline">
            Clear selection
          </button>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
          <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">{feedback.length === 0 ? "No feedback yet" : "Nothing matches these filters"}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {feedback.length === 0
              ? "Messages sent from the Send feedback screen inside any lab will appear here, with the sender's name, email and role."
              : "Try a different status, kind, or search term."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => {
            const meta = CATEGORY_META[item.category] ?? CATEGORY_META.GENERAL;
            const Icon = meta.icon;
            const status = STATUS_META[item.status] ?? STATUS_META.NEW;
            const open = expanded === item.id;
            const notes = notesDraft[item.id] ?? item.adminNotes ?? "";
            /*
             * Shown only when they differ. The account name and the typed name
             * are usually the same, and saying so every time would bury the
             * case that matters — a shared machine, or somebody writing on a
             * colleague's behalf.
             */
            const identityDiffers =
              item.user &&
              (item.user.email?.toLowerCase() !== item.email.toLowerCase() ||
                (item.user.name ?? "").trim().toLowerCase() !== item.name.trim().toLowerCase());

            return (
              <li key={item.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggle(item.id)}
                    aria-label={`Select feedback from ${item.name}`}
                    className="mt-1.5 h-4 w-4 accent-primary"
                  />
                  <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border ${meta.tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{item.name}</span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                        {item.designation}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.tone}`}>
                        {status.label}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.tone}`}>
                        {meta.label}
                      </span>
                      {item.rating !== null && (
                        <span className="flex items-center gap-1 text-[11px] text-amber-400">
                          <Star className="h-3 w-3 fill-current" />
                          {item.rating}/5
                        </span>
                      )}
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{item.message}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <a href={`mailto:${item.email}`} className="flex items-center gap-1 hover:text-primary hover:underline">
                        <Mail className="h-3 w-3" />
                        {item.email}
                      </a>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(item.createdAt)}
                      </span>
                      {item.lab?.name && <span>{item.lab.name}</span>}
                      {item.appVersion && <span>build {item.appVersion}</span>}
                      {item.screen && <span>{item.screen}</span>}
                    </div>

                    {identityDiffers && item.user && (
                      /*
                       * The account behind the message, when it is not the same
                       * person. Not a warning — it is normal and expected — but
                       * a reply should go to the address they gave, and this is
                       * how you notice which one that is.
                       */
                      <p className="mt-2 flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        Sent from the account <span className="font-medium text-foreground">{item.user.email}</span>
                        {item.user.name && <span>({item.user.name})</span>}
                        {item.user.designation && item.user.designation !== item.designation && (
                          <span>· registered as {item.user.designation}</span>
                        )}
                        {item.user.organization && <span>· {item.user.organization}</span>}
                      </p>
                    )}

                    {item.reviewedAt && (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Reviewed {timeAgo(item.reviewedAt)}
                        {item.reviewerName ? ` by ${item.reviewerName}` : ""}.
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setExpanded(open ? null : item.id)}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-accent"
                      >
                        {/*
                          Named "Notes", not "Triage". Both this and the status
                          button below were called Triage, which put two
                          controls with the same label and different effects on
                          one card — one opens a textarea, the other changes the
                          state of the record.
                        */}
                        {open ? "Close notes" : item.adminNotes ? "Notes (1)" : "Notes"}
                      </button>
                      <a
                        href={`mailto:${item.email}?subject=${encodeURIComponent(
                          `Re: your feedback on ${item.lab?.name ?? "Live Labs"}`
                        )}&body=${encodeURIComponent(`Hello ${item.name},\n\nThank you for writing in — you said:\n\n> ${item.message.replace(/\n/g, "\n> ")}\n\n`)}`}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-accent"
                      >
                        Reply by email
                      </a>
                      {item.status === "NEW" && (
                        <button
                          onClick={() => void run(item.id, () => reviewFeedback(item.id, "TRIAGED", notes))}
                          disabled={busyId === item.id}
                          className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
                        >
                          {busyId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
                          Triage
                        </button>
                      )}
                      {item.status !== "ACTIONED" && (
                        <button
                          onClick={() => void run(item.id, () => reviewFeedback(item.id, "ACTIONED", notes))}
                          disabled={busyId === item.id}
                          className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Actioned
                        </button>
                      )}
                      {item.status !== "DECLINED" && (
                        <button
                          onClick={() => void run(item.id, () => reviewFeedback(item.id, "DECLINED", notes))}
                          disabled={busyId === item.id}
                          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent disabled:opacity-50"
                        >
                          <XCircle className="h-3 w-3" />
                          Decline
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Delete this feedback from ${item.name}? It carries their name and email, so this is a permanent removal, not a hidden flag.`
                            )
                          ) {
                            void run(item.id, () => deleteFeedback(item.id));
                          }
                        }}
                        disabled={busyId === item.id}
                        className="ml-auto flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
                      >
                        <Trash className="h-3 w-3" />
                        Delete
                      </button>
                    </div>

                    {open && (
                      <div className="mt-3 rounded-lg border border-border bg-background p-3">
                        <label className="block text-xs font-medium text-muted-foreground">
                          Internal notes
                          <textarea
                            value={notes}
                            onChange={(e) => setNotesDraft((d) => ({ ...d, [item.id]: e.target.value }))}
                            rows={3}
                            placeholder="What was done about this, or why it was declined."
                            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                          />
                        </label>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Not sent to the sender. Replies go by email.
                        </p>
                        <button
                          onClick={() => void run(item.id, () => saveFeedbackNotes(item.id, notes))}
                          disabled={busyId === item.id}
                          className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                        >
                          {busyId === item.id ? "Saving…" : "Save notes"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

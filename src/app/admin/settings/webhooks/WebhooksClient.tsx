"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Trash, Send, Pause, Play, Copy, Check } from "lucide-react";
import { createWebhook, deleteWebhook, pingWebhook, toggleWebhook } from "../actions";

export type AdminWebhook = {
  id: string;
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
  lastStatus: number | null;
  lastAttemptAt: Date | null;
  lastError: string | null;
};

export default function WebhooksClient({
  hooks,
  events,
}: {
  hooks: AdminWebhook[];
  events: string[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    setError("");
    setNotice("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await createWebhook(formData);
      if (!res.success) {
        setError(res.message);
        return;
      }
      setNotice(res.message);
      e.currentTarget.reset();
      router.refresh();
    } finally {
      setAdding(false);
    }
  };

  const run = async (id: string, fn: () => Promise<{ message: string }>) => {
    setBusyId(id);
    setNotice("");
    setError("");
    try {
      const res = await fn();
      setNotice(res.message);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-xl font-semibold">Webhooks</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Notify another system when something happens here. Each delivery is signed, so
            the receiver can verify it came from this platform.
          </p>
        </div>

        <form onSubmit={handleAdd} className="p-6 space-y-4 border-b border-border">
          <div className="space-y-2">
            <label className="text-sm font-medium">Endpoint URL</label>
            <input
              type="url"
              name="url"
              required
              placeholder="https://example.com/hooks/panoptical"
              className="w-full px-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Events to send</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {events.map((e) => (
                <label
                  key={e}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/10 px-3 py-2 text-sm cursor-pointer hover:bg-muted/30"
                >
                  <input type="checkbox" name={`event:${e}`} className="w-4 h-4 accent-primary" />
                  <code className="font-mono text-xs">{e}</code>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={adding}
              className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add endpoint
            </button>
          </div>
        </form>

        <div className="p-6">
          {notice && (
            <p className="mb-4 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
              {notice}
            </p>
          )}

          {hooks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No endpoints registered.</p>
          ) : (
            <ul className="space-y-3">
              {hooks.map((h) => (
                <li key={h.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="truncate font-mono text-sm">{h.url}</code>
                        <span className={`pill ${h.enabled ? "text-emerald-400" : "text-muted-foreground"}`}>
                          {h.enabled ? "Active" : "Paused"}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {h.events.map((e) => (
                          <code
                            key={e}
                            className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
                          >
                            {e}
                          </code>
                        ))}
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {h.lastAttemptAt
                          ? `Last delivery ${new Date(h.lastAttemptAt).toLocaleString("en-IN")} — ${
                              h.lastError ? `failed (${h.lastError})` : `HTTP ${h.lastStatus}`
                            }`
                          : "No delivery attempted yet"}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => run(h.id, () => pingWebhook(h.id))}
                        disabled={busyId === h.id}
                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                        title="Send a signed test delivery"
                      >
                        {busyId === h.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => run(h.id, () => toggleWebhook(h.id, !h.enabled))}
                        disabled={busyId === h.id}
                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                        title={h.enabled ? "Pause" : "Resume"}
                      >
                        {h.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => {
                          if (!confirm("Remove this endpoint?")) return;
                          run(h.id, () => deleteWebhook(h.id));
                        }}
                        disabled={busyId === h.id}
                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        title="Remove"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Signing secret</span>
                    <code className="flex-1 truncate rounded border border-border bg-background px-2 py-1 font-mono text-xs">
                      {h.secret}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(h.secret);
                        setCopiedId(h.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="rounded-md border border-input bg-background p-1.5 hover:bg-muted"
                      title="Copy secret"
                    >
                      {copiedId === h.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-border bg-muted/20 p-6">
          <h2 className="text-xl font-semibold">Verifying a delivery</h2>
        </div>
        <div className="space-y-3 p-6 text-sm">
          <p className="text-muted-foreground">
            Every request carries the event name, a timestamp and an HMAC-SHA256 signature
            over <code className="font-mono text-xs">timestamp.body</code>. Recompute it
            with your endpoint&apos;s secret and compare.
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-background p-4 text-xs">
{`X-Panoptical-Event: order.paid
X-Panoptical-Timestamp: 1765200000
X-Panoptical-Signature: sha256=<hex>

const expected = crypto
  .createHmac("sha256", SECRET)
  .update(\`\${timestamp}.\${rawBody}\`)
  .digest("hex");`}
          </pre>
          <p className="text-xs text-muted-foreground">
            Reject anything whose timestamp is far from now — that is what stops an old
            delivery being replayed at you.
          </p>
        </div>
      </div>
    </>
  );
}

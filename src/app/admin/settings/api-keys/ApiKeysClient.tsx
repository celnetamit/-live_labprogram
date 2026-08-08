"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Key, Plus, Loader2, Copy, Check, Trash, Ban, AlertTriangle } from "lucide-react";
import { createApiKey, revokeApiKey, deleteApiKey } from "../actions";

export type AdminApiKey = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  createdBy: string | null;
};

export default function ApiKeysClient({ keys, baseUrl }: { keys: AdminApiKey[]; baseUrl: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [freshKey, setFreshKey] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    setFreshKey("");
    try {
      const res = await createApiKey(name);
      if (!res.success) {
        setError(res.message);
        return;
      }
      setFreshKey(res.key!);
      setName("");
      router.refresh();
    } finally {
      setCreating(false);
    }
  };

  const run = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    try {
      await fn();
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-xl font-semibold">API Keys</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Machine access to the read-only admin API, for dashboards and integrations.
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-wrap gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="What is this key for? e.g. Reporting dashboard"
              className="flex-1 min-w-[240px] px-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create key
            </button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* The one and only time the full key is visible. */}
          {freshKey && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Copy this now — it is never shown again.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-md border border-border bg-background px-3 py-2 font-mono text-xs">
                  {freshKey}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(freshKey);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="shrink-0 rounded-md border border-input bg-background p-2 hover:bg-muted"
                  title="Copy"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No keys yet.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {keys.map((k) => (
                <li key={k.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium truncate">{k.name}</p>
                      {k.revokedAt && <span className="pill text-rose-400">Revoked</span>}
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {k.prefix}••••••••
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(k.createdAt).toLocaleDateString("en-IN")}
                      {k.createdBy ? ` by ${k.createdBy}` : ""} ·{" "}
                      {k.lastUsedAt
                        ? `last used ${new Date(k.lastUsedAt).toLocaleDateString("en-IN")}`
                        : "never used"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!k.revokedAt && (
                      <button
                        onClick={() => run(k.id, () => revokeApiKey(k.id))}
                        disabled={busyId === k.id}
                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-50"
                        title="Revoke — stops working immediately"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (!confirm("Delete this key permanently?")) return;
                        run(k.id, () => deleteApiKey(k.id));
                      }}
                      disabled={busyId === k.id}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      title="Delete"
                    >
                      {busyId === k.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
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
        <div className="flex items-center gap-2 border-b border-border bg-muted/20 p-6">
          <Key className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Using a key</h2>
        </div>
        <div className="space-y-3 p-6 text-sm">
          <p className="text-muted-foreground">
            Send the key as a bearer token. Both endpoints are read-only.
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-background p-4 text-xs">
{`curl ${baseUrl}/api/admin/v1/labs \\
  -H "Authorization: Bearer pk_live_..."

curl ${baseUrl}/api/admin/v1/stats \\
  -H "Authorization: Bearer pk_live_..."`}
          </pre>
          <p className="text-xs text-muted-foreground">
            An unknown or revoked key gets 401. Keys carry no user identity — they are for
            reporting, not for acting on someone&apos;s behalf.
          </p>
        </div>
      </div>
    </>
  );
}

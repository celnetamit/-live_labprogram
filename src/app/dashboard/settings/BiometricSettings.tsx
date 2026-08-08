"use client";

import { useCallback, useEffect, useState } from "react";
import { Fingerprint, Loader2, Plus, Trash, ShieldCheck, AlertTriangle } from "lucide-react";
import { biometricsAvailable, registerPasskey, PasskeyError } from "@/lib/passkeyClient";

type Credential = {
  id: string;
  label: string | null;
  deviceType: string | null;
  backedUp: boolean;
  createdAt: string;
  lastUsedAt: string | null;
};

/**
 * Manage the devices that can sign this account in biometrically. Enrolment
 * happens here rather than at sign-up because it requires an authenticated
 * session — you prove who you are once, then add a device.
 */
export default function BiometricSettings() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/auth/webauthn/credentials");
    if (!res.ok) return;
    const data = await res.json();
    setCredentials(data.credentials ?? []);
  }, []);

  useEffect(() => {
    biometricsAvailable().then(setSupported);
    load();
  }, [load]);

  const handleAdd = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await registerPasskey();
      setNotice("Device added — you can now sign in with it.");
      await load();
    } catch (err) {
      setError(err instanceof PasskeyError ? err.message : "Could not add this device");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this device? It will no longer be able to sign you in.")) return;
    setRemovingId(id);
    setError("");
    try {
      const res = await fetch("/api/auth/webauthn/credentials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setNotice("Device removed.");
      await load();
    } catch {
      setError("Could not remove that device");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Fingerprint className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Biometric sign-in</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Use your fingerprint, face or a security key instead of a password. The
              biometric never leaves your device — only a public key is stored here.
            </p>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={busy || supported === false}
          title={supported === false ? "This device has no biometric sensor set up" : undefined}
          className="btn-brand inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add this device
        </button>
      </div>

      {supported === false && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          This browser or device has no biometric sensor available.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
          <ShieldCheck className="h-4 w-4 shrink-0" /> {notice}
        </p>
      )}

      <div className="mt-5">
        {credentials.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No devices enrolled yet. Add one to sign in without typing a password.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {credentials.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.label ?? "Registered device"}</p>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    {c.lastUsedAt
                      ? ` · last used ${new Date(c.lastUsedAt).toLocaleDateString("en-IN")}`
                      : " · not used yet"}
                    {c.backedUp ? " · synced" : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(c.id)}
                  disabled={removingId === c.id}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  title="Remove device"
                >
                  {removingId === c.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

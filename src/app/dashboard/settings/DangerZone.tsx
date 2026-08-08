"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { deleteAccount } from "./actions";

/**
 * Account deletion. Guarded by typing the account's own email — a single
 * mis-click should not be able to destroy someone's purchases and lab access.
 */
export default function DangerZone({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await deleteAccount(confirmation);
      if (!res.success) {
        setError(res.message);
        return;
      }
      // The account is gone; drop the session cookie with it.
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Could not delete the account");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Irreversible actions concerning your account.
            </p>
          </div>
        </div>
        <div className="p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-medium">Delete Account</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-1">
              Once you delete your account, there is no going back. All your access requests
              and historical lab instances will be destroyed.
            </p>
          </div>
          <button
            onClick={() => {
              setConfirmation("");
              setError("");
              setOpen(true);
            }}
            className="shrink-0 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h3 className="text-lg font-bold">Delete your account?</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <p className="text-sm text-muted-foreground">
                This permanently removes your profile, lab access, purchase history, custom
                lab requests and any registered devices. It cannot be undone.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type <span className="font-mono text-foreground">{email}</span> to confirm
                </label>
                <input
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  autoComplete="off"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={email}
                />
              </div>

              {error && (
                <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={busy || confirmation.trim().toLowerCase() !== email.toLowerCase()}
                className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

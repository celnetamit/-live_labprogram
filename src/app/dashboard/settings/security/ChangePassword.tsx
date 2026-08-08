"use client";

import { useState } from "react";
import { KeyRound, Loader2, Check } from "lucide-react";
import { changePassword } from "../actions";

const MIN_PASSWORD = 8;

/**
 * Change (or, for an SSO-only account, set) the password. Proving the current
 * one first stops a borrowed unlocked laptop being turned into a permanent
 * takeover.
 */
export default function ChangePassword({ hasPassword }: { hasPassword: boolean }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const form = new FormData(e.currentTarget);
    const next = String(form.get("newPassword") ?? "");
    if (next.length < MIN_PASSWORD) {
      setError(`Choose a password of at least ${MIN_PASSWORD} characters`);
      return;
    }
    if (next !== String(form.get("confirmPassword") ?? "")) {
      setError("Those two passwords don't match");
      return;
    }

    setSaving(true);
    try {
      const res = await changePassword(form);
      if (res.success) {
        setMessage(res.message);
        e.currentTarget.reset();
      } else {
        setError(res.message);
      }
    } catch {
      setError("Could not change your password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6">
      <div className="flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold">{hasPassword ? "Change password" : "Set a password"}</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {hasPassword
              ? "You'll need your current password to set a new one."
              : "This account signs in through SSO or a passkey. Adding a password gives you another way in."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {hasPassword && (
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Current password</label>
            <input
              type="password"
              name="currentPassword"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">New password</label>
          <input
            type="password"
            name="newPassword"
            required
            minLength={MIN_PASSWORD}
            autoComplete="new-password"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm new password</label>
          <input
            type="password"
            name="confirmPassword"
            required
            autoComplete="new-password"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-5 flex items-center justify-end gap-3">
        {message && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
            <Check className="h-4 w-4" /> {message}
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="btn-brand inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {hasPassword ? "Update password" : "Set password"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Check } from "lucide-react";
import { saveSecuritySettings } from "../actions";
import type { PlatformSettings } from "@/lib/platformSettings";

export default function SecurityForm({ settings }: { settings: PlatformSettings }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await saveSecuritySettings(formData);
      setMessage(res.message);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border bg-muted/20">
        <h2 className="text-xl font-semibold">Security &amp; Auth</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Password policy, session lifetime, and which sign-in methods are permitted.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum password length</label>
            <input
              type="number"
              name="minPasswordLength"
              min={6}
              max={64}
              defaultValue={settings.minPasswordLength}
              className="w-full px-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Applied at registration, password reset and password change.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Session lifetime (days)</label>
            <input
              type="number"
              name="sessionDays"
              min={1}
              max={365}
              defaultValue={settings.sessionDays}
              className="w-full px-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Sessions older than this are rejected and the user signs in again.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold">Permitted sign-in methods</h3>
          <p className="text-xs text-muted-foreground">
            Email and password is always available — it is the fallback that stops an
            account becoming unreachable.
          </p>

          <label className="flex items-start gap-3 p-3 border border-border rounded-lg bg-muted/10 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="pt-0.5">
              <input
                type="checkbox"
                name="allowSso"
                defaultChecked={settings.allowSso}
                className="w-4 h-4 accent-primary"
              />
            </div>
            <div>
              <p className="text-sm font-medium">Allow Google sign-in</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                The &quot;Continue with Google&quot; button on the login and register
                screens. Turning this off refuses Google logins even when the OAuth
                credentials are configured.
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-end gap-3">
        {message && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
            <Check className="h-4 w-4" /> {message}
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Configuration
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Check, AlertTriangle } from "lucide-react";
import { saveGeneralSettings } from "./actions";
import type { PlatformSettings } from "@/lib/platformSettings";

export default function GeneralForm({ settings }: { settings: PlatformSettings }) {
  const router = useRouter();
  const [maintenance, setMaintenance] = useState(settings.maintenanceMode);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await saveGeneralSettings(formData);
      if (res.success) {
        setMessage(res.message);
        router.refresh();
      } else {
        setError(res.message);
      }
    } catch {
      setError("Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-xl font-semibold">General Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Basic platform identity and display settings.
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2 max-w-lg">
            <label className="text-sm font-medium">Platform Name</label>
            <input
              type="text"
              name="platformName"
              required
              maxLength={80}
              defaultValue={settings.platformName}
              className="w-full px-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Used in the browser tab title and as the sender name in every email.
            </p>
          </div>

          <div className="space-y-2 max-w-lg">
            <label className="text-sm font-medium">Support Email Address</label>
            <input
              type="email"
              name="supportEmail"
              required
              maxLength={120}
              defaultValue={settings.supportEmail}
              className="w-full px-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Shown to users who are locked out, and in the footer of outbound email.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold">Platform Access</h3>

            <label className="flex items-start gap-3 p-3 border border-border rounded-lg bg-muted/10 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  name="allowPublicRegistration"
                  defaultChecked={settings.allowPublicRegistration}
                  className="w-4 h-4 accent-primary"
                />
              </div>
              <div>
                <p className="text-sm font-medium">Allow public registration</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Anyone can create an account via the /register route. Turning this off
                  closes both the page and the API to new sign-ups.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-border rounded-lg bg-muted/10 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  name="requireAdminApproval"
                  defaultChecked={settings.requireAdminApproval}
                  className="w-4 h-4 accent-primary"
                />
              </div>
              <div>
                <p className="text-sm font-medium">Require admin approval for all labs</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Disables self-serve checkout entirely — learners request access and an
                  admin grants it. Existing access is unaffected.
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
          {error && <span className="text-sm text-destructive">{error}</span>}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Configuration
          </button>
        </div>
      </div>

      {/* Maintenance mode lives in the same form so one save covers it. */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-xl font-semibold">Maintenance Mode</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Temporarily disable access for non-admin users.
          </p>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-medium">Enable Maintenance Mode</p>
              <p className="text-sm text-muted-foreground max-w-md mt-1">
                Learners are shown a maintenance notice instead of the dashboard and
                catalogue. SUPER_ADMIN accounts keep full access, so you can still work.
              </p>
            </div>
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
              className="mt-1 w-4 h-4 shrink-0 accent-primary"
            />
          </label>

          {maintenance && (
            <>
              <p className="inline-flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Save to apply. Learners will lose access immediately.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message shown to learners</label>
                <textarea
                  name="maintenanceMessage"
                  rows={2}
                  maxLength={300}
                  defaultValue={settings.maintenanceMessage ?? ""}
                  placeholder="We're upgrading the lab infrastructure and will be back shortly."
                  className="w-full px-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

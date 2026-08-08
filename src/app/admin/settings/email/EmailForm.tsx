"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Check, Send, AlertTriangle, CheckCircle2 } from "lucide-react";
import { saveEmailSettings, sendTestEmail } from "../actions";
import type { PlatformSettings } from "@/lib/platformSettings";

export default function EmailForm({
  settings,
  providerConfigured,
  fromAddress,
}: {
  settings: PlatformSettings;
  providerConfigured: boolean;
  fromAddress: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [testTo, setTestTo] = useState(settings.supportEmail);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await saveEmailSettings(formData);
      if (res.success) {
        setMessage(res.message);
        router.refresh();
      } else {
        setError(res.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await sendTestEmail(testTo);
      setTestResult({ ok: res.success, text: res.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-xl font-semibold">Email &amp; SMTP</h2>
          <p className="text-sm text-muted-foreground mt-1">
            How outbound mail identifies itself, and whether delivery is working.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Provider status is read from the environment, not editable here. */}
          <div
            className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
              providerConfigured
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-amber-500/20 bg-amber-500/10 text-amber-400"
            }`}
          >
            {providerConfigured ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">
                {providerConfigured
                  ? "Email provider connected"
                  : "No email provider configured"}
              </p>
              <p className="mt-0.5 opacity-90">
                {providerConfigured
                  ? `Sending as ${fromAddress}.`
                  : "Password resets and notifications are written to the server log instead of being delivered. Set RESEND_API_KEY in the deployment environment to enable sending."}
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            The provider API key is deliberately not editable here — secrets belong in the
            deployment environment, not in the database where a backup would expose them.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2 border-t border-border">
            <div className="space-y-2 max-w-lg">
              <label className="text-sm font-medium">Sender name</label>
              <input
                type="text"
                name="mailFromName"
                maxLength={80}
                defaultValue={settings.mailFromName}
                className="w-full px-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                Appears as the &ldquo;from&rdquo; name on every email we send.
              </p>
            </div>

            <div className="space-y-2 max-w-lg">
              <label className="text-sm font-medium">Reply-to address</label>
              <input
                type="email"
                name="mailReplyTo"
                maxLength={120}
                defaultValue={settings.mailReplyTo ?? ""}
                placeholder={settings.supportEmail}
                className="w-full px-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                Where replies go. Leave blank to use the support address.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
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
          </form>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-xl font-semibold">Send a test email</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Proves the whole path rather than trusting the configuration.
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="email"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 min-w-[240px] px-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 border border-input bg-background hover:bg-muted font-medium rounded-lg text-sm transition-colors flex items-center disabled:opacity-50"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send test
            </button>
          </div>

          {testResult && (
            <p
              className={`rounded-lg border px-3 py-2 text-sm ${
                testResult.ok
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-400"
              }`}
            >
              {testResult.text}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

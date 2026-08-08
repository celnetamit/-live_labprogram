"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2, Check } from "lucide-react";
import { updateNotificationPreferences } from "../actions";

export type Preferences = {
  accessDecisions: boolean;
  orderReceipts: boolean;
  labRequestUpdates: boolean;
  labLaunches: boolean;
  productNews: boolean;
};

const OPTIONS: { name: keyof Preferences; title: string; description: string }[] = [
  {
    name: "accessDecisions",
    title: "Lab access decisions",
    description: "When an admin approves or declines your request for a lab.",
  },
  {
    name: "orderReceipts",
    title: "Payment receipts",
    description: "Confirmation and a receipt each time a purchase completes.",
  },
  {
    name: "labRequestUpdates",
    title: "Custom lab request replies",
    description: "When we respond to a lab you asked us to build.",
  },
  {
    name: "labLaunches",
    title: "Upcoming lab launches",
    description: "When a lab from the Coming soon list opens for enrolment.",
  },
  {
    name: "productNews",
    title: "Product news",
    description: "Occasional updates about new features. Off unless you ask for it.",
  },
];

export default function NotificationForm({
  preferences,
  mailConfigured,
}: {
  preferences: Preferences;
  mailConfigured: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Preferences>(preferences);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const toggle = (name: keyof Preferences) => {
    setValues((v) => ({ ...v, [name]: !v[name] }));
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const formData = new FormData();
    for (const [k, v] of Object.entries(values)) formData.set(k, v ? "on" : "off");

    try {
      const res = await updateNotificationPreferences(formData);
      if (res.success) {
        setMessage(res.message);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Email notifications</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose what we email you about. Account security messages, like password
              resets, are always sent.
            </p>
          </div>
        </div>

        {!mailConfigured && (
          <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
            No email provider is configured on this deployment yet, so nothing is delivered
            for now. Your choices are saved and take effect as soon as one is set up.
          </p>
        )}
      </div>

      <ul className="divide-y divide-border">
        {OPTIONS.map((o) => (
          <li key={o.name} className="flex items-start justify-between gap-4 px-6 py-4">
            <div className="min-w-0">
              <p className="font-medium">{o.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{o.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={values[o.name]}
              aria-label={o.title}
              onClick={() => toggle(o.name)}
              className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                values[o.name] ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  values[o.name] ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/30 p-4">
        {message && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
            <Check className="h-4 w-4" /> {message}
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save preferences
        </button>
      </div>
    </form>
  );
}

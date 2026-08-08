"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Building, Briefcase, Loader2, Check } from "lucide-react";
import { updateProfile } from "./actions";

export default function ProfileForm({
  user,
}: {
  user: {
    name: string | null;
    email: string | null;
    organization: string | null;
    designation: string | null;
  };
}) {
  const router = useRouter();
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
      const res = await updateProfile(formData);
      if (res.success) {
        setMessage(res.message);
        router.refresh();
      } else {
        setError(res.message);
      }
    } catch {
      setError("Could not save your profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold">Personal Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update your personal details and public profile.
        </p>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={80}
                defaultValue={user.name || ""}
                className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                defaultValue={user.email || ""}
                disabled
                className="w-full pl-9 pr-4 py-2 bg-muted border border-input rounded-md text-sm opacity-70 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email addresses cannot be changed directly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Organization / University</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="organization"
                maxLength={120}
                defaultValue={user.organization || ""}
                placeholder="e.g. MIT, Stanford, Acme Corp"
                className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role / Designation</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="designation"
                maxLength={120}
                defaultValue={user.designation || ""}
                placeholder="e.g. Researcher, Student"
                className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-end gap-3">
        {message && (
          <span className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-success,#10b981)]">
            <Check className="h-4 w-4" /> {message}
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}

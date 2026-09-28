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
      className="ui-card overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <h2 className="ui-h2 text-lg">Personal Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update your personal details and public profile.
        </p>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="ui-label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-[13px] h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={80}
                defaultValue={user.name || ""}
                className="ui-input ui-input-icon"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="ui-label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-[13px] h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                defaultValue={user.email || ""}
                disabled
                className="ui-input ui-input-icon"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email addresses cannot be changed directly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="ui-label">Organization / University</label>
            <div className="relative">
              <Building className="absolute left-3.5 top-[13px] h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="organization"
                maxLength={120}
                defaultValue={user.organization || ""}
                placeholder="e.g. MIT, Stanford, Acme Corp"
                className="ui-input ui-input-icon"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="ui-label">Role / Designation</label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-[13px] h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="designation"
                maxLength={120}
                defaultValue={user.designation || ""}
                placeholder="e.g. Researcher, Student"
                className="ui-input ui-input-icon"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-[color:var(--color-destructive-ink)]">
            {error}
          </p>
        )}
      </div>

      <div className="ui-card-foot">
        {message && (
          <span className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-success-ink)]">
            <Check className="h-4 w-4" /> {message}
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="ui-btn ui-btn-primary focus-ring"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}

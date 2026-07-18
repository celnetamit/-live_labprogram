"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Key } from "lucide-react";

export default function RequestAccessButton({
  labId,
  hasPendingRequest,
}: {
  labId: string;
  hasPendingRequest: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRequest() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labId }),
      });
      
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        throw new Error("Invalid response from server");
      }

      if (!res.ok) throw new Error(data.message || "Failed to submit request");

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (hasPendingRequest || success) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          disabled
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-muted text-muted-foreground rounded-xl font-semibold disabled:pointer-events-none"
        >
          Request Pending
        </button>
        <p className="text-sm text-muted-foreground">Your access request is awaiting admin approval.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleRequest}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 btn-brand rounded-xl font-semibold disabled:opacity-60 disabled:pointer-events-none"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Key className="w-5 h-5" />
        )}
        {loading ? "Submitting Request…" : "Request Access"}
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";

const MIN_PASSWORD = 8;

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";

  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Tell the user the link is stale before they type a new password.
  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setValid(!!d.valid))
      .catch(() => setValid(false))
      .finally(() => setChecking(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD) {
      setError(`Choose a password of at least ${MIN_PASSWORD} characters`);
      return;
    }
    if (password !== confirm) {
      setError("Those two passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not reset your password");

      setDone(true);
      setTimeout(() => router.push("/login"), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset your password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glassmorphism p-8 rounded-2xl border border-border shadow-2xl"
        >
          {checking ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Checking your link…
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Password updated</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Taking you to the sign-in page…
              </p>
            </div>
          ) : !valid ? (
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-400">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">This link no longer works</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Reset links expire after 60 minutes and can only be used once.
              </p>
              <Link
                href="/forgot-password"
                className="btn-brand mt-6 inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-semibold"
              >
                Request a new link
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-8">
                <div className="w-14 h-14 rounded-2xl btn-brand flex items-center justify-center text-primary-foreground font-bold text-2xl mb-4">
                  P
                </div>
                <h2 className="text-2xl font-bold text-center tracking-tight">
                  Choose a new password
                </h2>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  At least {MIN_PASSWORD} characters. You&apos;ll use it to sign in next time.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={MIN_PASSWORD}
                      className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg text-sm font-semibold btn-brand h-11 px-4 py-2 w-full disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? "Saving…" : "Set new password"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

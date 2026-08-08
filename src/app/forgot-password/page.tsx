"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setSent(true);
      setNotice(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <MailCheck className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
              <p className="mt-3 text-sm text-muted-foreground">{notice}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                The link expires in 60 minutes and can only be used once. Didn&apos;t arrive?
                Check spam, or{" "}
                <button
                  onClick={() => setSent(false)}
                  className="font-medium text-primary hover:underline"
                >
                  try another address
                </button>
                .
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-8">
                <div className="w-14 h-14 rounded-2xl btn-brand flex items-center justify-center text-primary-foreground font-bold text-2xl mb-4">
                  P
                </div>
                <h2 className="text-2xl font-bold text-center tracking-tight">
                  Forgot your password?
                </h2>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Enter your email and we&apos;ll send you a link to set a new one.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg text-sm font-semibold btn-brand h-11 px-4 py-2 w-full disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

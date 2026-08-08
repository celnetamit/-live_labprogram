"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Mail, Fingerprint, Key, Loader2 } from "lucide-react";
import { biometricsAvailable, signInWithPasskey, PasskeyError } from "@/lib/passkeyClient";

/** Icon-free labels for the SSO buttons, keyed by NextAuth provider id. */
const SSO_LABELS: Record<string, string> = {
  google: "Google",
  "azure-ad": "Microsoft",
};

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bioBusy, setBioBusy] = useState(false);
  const [bioSupported, setBioSupported] = useState(false);
  const [ssoProviders, setSsoProviders] = useState<{ id: string; name: string }[]>([]);
  const [showSso, setShowSso] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Auto-redirect if already logged in
  useEffect(() => {
    getSession().then((session) => {
      if (session?.user) {
        const role = (session.user as { role?: string } | undefined)?.role;
        handleRedirect(role, true);
      }
    });
  }, []);

  /*
    Offer biometrics only where the device can actually do it, and SSO only for
    providers the deployment has configured — otherwise the buttons are a dead
    end, which is what they were before.
  */
  useEffect(() => {
    biometricsAvailable().then(setBioSupported);

    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((all) => {
        const oauth = Object.values(all ?? {})
          .filter((p: any) => p?.type === "oauth" || p?.type === "oidc")
          .map((p: any) => ({ id: p.id, name: SSO_LABELS[p.id] ?? p.name }));
        setSsoProviders(oauth);
      })
      .catch(() => setSsoProviders([]));
  }, []);

  const handleBiometricLogin = async () => {
    setBioBusy(true);
    setError("");
    try {
      const res = await signInWithPasskey(formData.email || undefined);
      if (!res || res.error) {
        throw new PasskeyError("That device isn't registered for any account here");
      }
      const session = await getSession();
      handleRedirect((session?.user as { role?: string } | undefined)?.role);
    } catch (err) {
      setError(err instanceof PasskeyError ? err.message : "Biometric sign-in failed");
    } finally {
      setBioBusy(false);
    }
  };

  const handleRedirect = async (role: string | undefined, forceRedirect = true) => {
    let dest = role === "SUPER_ADMIN" ? "/admin" : "/dashboard";
    const cbRaw = new URLSearchParams(window.location.search).get("callbackUrl");
    
    if (cbRaw) {
      try {
        const u = new URL(cbRaw, window.location.origin);
        if (u.origin === window.location.origin) {
          dest = u.pathname + u.search;
        } else {
          // Cross-origin callback, try to resolve it as a lab domain
          const res = await fetch("/api/auth/resolve-callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ callbackUrl: cbRaw })
          });
          const data = await res.json();
          if (data.success && data.launchUrl) {
            dest = data.launchUrl;
          }
        }
      } catch {
        /* ignore malformed callbackUrl */
      }
    }
    
    if (forceRedirect) {
      router.push(dest);
      router.refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        throw new Error("Invalid email or password");
      }

      const session = await getSession();
      const role = (session?.user as { role?: string } | undefined)?.role;

      await handleRedirect(role, true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-mesh relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full sm:max-w-md p-5 mx-auto z-10">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Ecosystem
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glassmorphism p-8 rounded-2xl border border-border shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl btn-brand flex items-center justify-center text-primary-foreground font-bold text-2xl mb-4">
              P
            </div>
            <h2 className="text-2xl font-bold text-center tracking-tight">Sign in to Panoptical</h2>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Enter your credentials to access your labs and programs
            </p>
          </div>
          
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">{error}</div>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold btn-brand h-11 px-4 py-2 w-full mt-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground rounded-sm">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={bioBusy || !bioSupported}
              title={
                bioSupported
                  ? "Sign in with your fingerprint, face or security key"
                  : "This device has no biometric sensor set up"
              }
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              {bioBusy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Fingerprint className="mr-2 h-4 w-4" />
              )}
              Biometrics
            </button>
            <button
              type="button"
              onClick={() => setShowSso((v) => !v)}
              disabled={ssoProviders.length === 0}
              title={
                ssoProviders.length
                  ? "Sign in with your organisation account"
                  : "No SSO provider is configured for this deployment"
              }
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              <Key className="mr-2 h-4 w-4" />
              SSO
            </button>
          </div>

          {showSso && ssoProviders.length > 0 && (
            <div className="mt-3 space-y-2">
              {ssoProviders.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => signIn(p.id, { callbackUrl: "/dashboard" })}
                  className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Continue with {p.name}
                </button>
              ))}
            </div>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Request access
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

/**
 * The one federated sign-in the hub offers.
 *
 * Google is only a real option when the deployment has an OAuth client
 * configured, so the button asks NextAuth which providers exist rather than
 * assuming. When it isn't configured the button stays visible but disabled and
 * says why — a dead button that looks alive is what the old SSO one was.
 */

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

/**
 * Where Google should drop the user afterwards.
 *
 * Normally the dashboard. A lab deep-link, though, arrives as
 * /login?callbackUrl=<lab origin>, and only the login page knows how to turn
 * that into a launch URL carrying a lab token — so in that case Google returns
 * to /login with the parameter intact and the page finishes the journey,
 * exactly as it does after a password sign-in.
 */
function returnUrl(): string {
  const params = new URLSearchParams(window.location.search);
  const callbackUrl = params.get("callbackUrl");
  const { origin } = window.location;

  return callbackUrl
    ? `${origin}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : `${origin}/dashboard`;
}

export default function GoogleSignInButton({
  label = "Continue with Google",
}: {
  label?: string;
}) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((all) => setConfigured(Boolean(all?.google)))
      .catch(() => setConfigured(false));
  }, []);

  const disabled = configured === false || busy;

  return (
    <button
      type="button"
      onClick={() => {
        setBusy(true);
        // Absolute, for the same reason sign-out is: a relative URL resolves
        // against NEXTAUTH_URL, not the current host.
        signIn("google", { callbackUrl: returnUrl() });
      }}
      disabled={disabled}
      title={
        configured === false
          ? "Google sign-in isn't configured for this deployment"
          : "Sign in with your Google account"
      }
      className="inline-flex h-11 w-full items-center justify-center gap-3 whitespace-nowrap rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <GoogleMark className="h-5 w-5" />
      )}
      {label}
    </button>
  );
}

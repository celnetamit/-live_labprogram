"use client";

import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { signIn } from "next-auth/react";

/**
 * Browser half of the passkey flows. Both are the same three beats: ask the
 * server for a challenge, let the device prompt for the fingerprint or face,
 * then send the signature back.
 */

/** Whether this browser can do platform biometrics at all. */
export async function biometricsAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export class PasskeyError extends Error {}

/** Enrol the current device. Requires an active session. */
export async function registerPasskey(label?: string): Promise<void> {
  const optionsRes = await fetch("/api/auth/webauthn/register/options", { method: "POST" });
  if (!optionsRes.ok) {
    const body = await optionsRes.json().catch(() => ({}));
    throw new PasskeyError(body.message || "Could not start enrolment");
  }
  const options = await optionsRes.json();

  let attestation;
  try {
    attestation = await startRegistration({ optionsJSON: options });
  } catch (err) {
    // The user dismissing the system prompt is not an error worth shouting about.
    if ((err as Error)?.name === "NotAllowedError") {
      throw new PasskeyError("Cancelled — no device was added");
    }
    throw new PasskeyError((err as Error)?.message || "Your device refused the request");
  }

  const verifyRes = await fetch("/api/auth/webauthn/register/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response: attestation, label }),
  });
  if (!verifyRes.ok) {
    const body = await verifyRes.json().catch(() => ({}));
    throw new PasskeyError(body.message || "Could not verify this device");
  }
}

/**
 * Sign in with a device. `email` is optional — leave it out and the browser
 * offers whichever discoverable passkeys it holds for this site.
 * Resolves to the NextAuth result so the caller can redirect.
 */
export async function signInWithPasskey(email?: string) {
  const optionsRes = await fetch("/api/auth/webauthn/authenticate/options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email || undefined }),
  });
  if (!optionsRes.ok) throw new PasskeyError("Could not start biometric sign-in");
  const options = await optionsRes.json();

  let assertion;
  try {
    assertion = await startAuthentication({ optionsJSON: options });
  } catch (err) {
    if ((err as Error)?.name === "NotAllowedError") {
      throw new PasskeyError("Cancelled — no device was used");
    }
    throw new PasskeyError("No passkey available on this device");
  }

  return await signIn("passkey", {
    redirect: false,
    response: JSON.stringify(assertion),
  });
}

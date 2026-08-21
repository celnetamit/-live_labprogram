import GoogleProvider from "next-auth/providers/google";

/**
 * Federated sign-in, configured entirely through the environment.
 *
 * Google is the one provider the hub offers — the login and register screens
 * show a single "Continue with Google" button. It is only wired up when its
 * credentials are present, so an install with no Google app registered simply
 * shows the button disabled, the same pattern the Razorpay integration uses for
 * payments.
 */

export function googleConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * `allowDangerousEmailAccountLinking` lets someone who registered with a
 * password later sign in with the same address through Google. Google verifies
 * email ownership before asserting it, which is exactly the condition that
 * makes this safe; it must not be copied to a provider that does not.
 */
export function ssoProviders() {
  if (!googleConfigured()) return [];

  return [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ];
}

import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

/**
 * Enterprise sign-in, configured entirely through the environment.
 *
 * A provider is only offered when its credentials are present, so an install
 * with no Google or Microsoft app registered simply never shows the buttons —
 * the same pattern the Razorpay integration uses for payments.
 */

export function googleConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function azureConfigured(): boolean {
  return !!(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET);
}

export function ssoEnabled(): boolean {
  return googleConfigured() || azureConfigured();
}

/**
 * `allowDangerousEmailAccountLinking` lets someone who registered with a
 * password later sign in with the same address through Google or Microsoft.
 * Both providers verify email ownership before asserting it, which is exactly
 * the condition that makes this safe; it must not be copied to a provider that
 * does not.
 */
export function ssoProviders() {
  const providers = [];

  if (googleConfigured()) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  if (azureConfigured()) {
    providers.push(
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        // "common" lets any work or school account in; set a directory ID to
        // restrict sign-in to a single organisation.
        tenantId: process.env.AZURE_AD_TENANT_ID || "common",
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  return providers;
}

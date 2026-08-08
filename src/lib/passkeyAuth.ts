import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import prisma from "@/lib/prisma";
import { challengeFromClientData, consumeChallenge, expectedOrigin, rpID } from "@/lib/webauthn";

export type PasskeyUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
};

/**
 * Verify a WebAuthn assertion and return the user it belongs to.
 *
 * Every failure returns null rather than a reason: an attacker probing this
 * path should not learn whether the credential exists, the challenge expired,
 * or the signature was wrong.
 */
export async function verifyPasskeyAssertion(responseJson: string): Promise<PasskeyUser | null> {
  let assertion: {
    id?: string;
    response?: { clientDataJSON?: string };
  };
  try {
    assertion = JSON.parse(responseJson);
  } catch {
    return null;
  }
  if (!assertion?.id) return null;

  const challenge = challengeFromClientData(assertion.response?.clientDataJSON);
  if (!challenge) return null;

  // Single-use: consuming it here is what prevents a replayed assertion.
  const stored = await consumeChallenge(challenge);
  if (!stored) return null;

  const authenticator = await prisma.authenticator.findUnique({
    where: { credentialId: assertion.id },
    include: { user: true },
  });
  if (!authenticator) return null;

  // If the visitor named an account before tapping the sensor, the credential
  // must actually belong to it.
  if (stored.email && authenticator.user.email?.toLowerCase() !== stored.email) return null;
  if (authenticator.user.status !== "ACTIVE") return null;

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: assertion as never,
      expectedChallenge: challenge,
      expectedOrigin: expectedOrigin(),
      expectedRPID: rpID(),
      requireUserVerification: false,
      credential: {
        id: authenticator.credentialId,
        publicKey: new Uint8Array(authenticator.publicKey),
        counter: authenticator.counter,
      },
    });
  } catch (err) {
    console.error("Passkey assertion rejected:", err);
    return null;
  }

  if (!verification.verified) return null;

  await prisma.authenticator.update({
    where: { id: authenticator.id },
    data: {
      counter: verification.authenticationInfo.newCounter,
      lastUsedAt: new Date(),
    },
  });

  return {
    id: authenticator.user.id,
    email: authenticator.user.email,
    name: authenticator.user.name,
    role: authenticator.user.role,
  };
}

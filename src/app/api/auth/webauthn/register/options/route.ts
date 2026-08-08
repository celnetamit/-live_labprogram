import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import prisma from "@/lib/prisma";
import { RP_NAME, rpID, storeChallenge, parseTransports } from "@/lib/webauthn";

/**
 * Step 1 of enrolling a device: hand the browser a challenge to sign.
 *
 * Enrolment requires an existing session — you prove who you are with your
 * password (or an already-registered passkey) before adding a new one.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string; name?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ message: "Sign in first" }, { status: 401 });
  }

  const existing = await prisma.authenticator.findMany({
    where: { userId: user.id },
    select: { credentialId: true, transports: true },
  });

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: rpID(),
    userName: user.email ?? user.id,
    userDisplayName: user.name ?? user.email ?? "Panoptical learner",
    // Stops the same device being enrolled twice.
    excludeCredentials: existing.map((a) => ({
      id: a.credentialId,
      transports: parseTransports(a.transports) as never,
    })),
    authenticatorSelection: {
      // Prefer the fingerprint/face sensor built into the device, and require
      // the user to actually present it rather than merely tap a key.
      authenticatorAttachment: "platform",
      residentKey: "preferred",
      userVerification: "preferred",
    },
    attestationType: "none",
  });

  await storeChallenge(options.challenge, { userId: user.id });

  return NextResponse.json(options);
}

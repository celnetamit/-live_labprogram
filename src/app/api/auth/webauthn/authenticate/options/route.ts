import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import prisma from "@/lib/prisma";
import { rpID, storeChallenge, parseTransports } from "@/lib/webauthn";

/**
 * Step 1 of signing in with a device: issue a challenge.
 *
 * An email may be supplied to narrow the credential list, but it is optional —
 * with a discoverable passkey the browser can pick the account itself. The
 * response is deliberately identical whether or not the email exists, so this
 * endpoint cannot be used to test which addresses are registered.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  let allowCredentials: { id: string; transports?: string[] }[] = [];

  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, status: true },
    });
    if (user && user.status === "ACTIVE") {
      const creds = await prisma.authenticator.findMany({
        where: { userId: user.id },
        select: { credentialId: true, transports: true },
      });
      allowCredentials = creds.map((c) => ({
        id: c.credentialId,
        transports: parseTransports(c.transports),
      }));
    }
  }

  const options = await generateAuthenticationOptions({
    rpID: rpID(),
    userVerification: "preferred",
    allowCredentials: allowCredentials as never,
  });

  await storeChallenge(options.challenge, { email: email || undefined });

  return NextResponse.json(options);
}

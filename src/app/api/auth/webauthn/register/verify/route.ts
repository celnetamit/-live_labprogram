import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import prisma from "@/lib/prisma";
import {
  challengeFromClientData,
  consumeChallenge,
  deviceLabelFrom,
  expectedOrigin,
  rpID,
} from "@/lib/webauthn";

/**
 * Step 2 of enrolling a device: check the signed attestation and store the
 * public key. Nothing secret is saved — only material that can verify future
 * signatures.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ message: "Sign in first" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const attestation = body?.response;
  const label = typeof body?.label === "string" ? body.label.trim().slice(0, 60) : "";
  if (!attestation?.id) {
    return NextResponse.json({ message: "Missing registration response" }, { status: 400 });
  }

  const expectedChallenge = challengeFromClientData(attestation.response?.clientDataJSON);
  if (!expectedChallenge) {
    return NextResponse.json({ message: "Missing challenge" }, { status: 400 });
  }

  const stored = await consumeChallenge(expectedChallenge);
  if (!stored || stored.userId !== user.id) {
    return NextResponse.json({ message: "Challenge expired — please try again" }, { status: 400 });
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: attestation,
      expectedChallenge,
      expectedOrigin: expectedOrigin(),
      expectedRPID: rpID(),
      requireUserVerification: false,
    });
  } catch (err) {
    console.error("Passkey registration failed:", err);
    return NextResponse.json({ message: "Could not verify this device" }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ message: "Could not verify this device" }, { status: 400 });
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

  await prisma.authenticator.create({
    data: {
      userId: user.id,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports ? JSON.stringify(credential.transports) : null,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      label: label || deviceLabelFrom(req.headers.get("user-agent")),
    },
  });

  return NextResponse.json({ verified: true });
}

import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import prisma from "@/lib/prisma";
import { mailConfigured, passwordResetEmail, sendMail } from "@/lib/mailer";

const TOKEN_TTL_MS = 60 * 60 * 1000;

/** Only the hash is stored, so the raw token in the link is the sole secret. */
function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ message: "Enter a valid email address" }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();

  // Opportunistic tidy-up: spent and expired tokens are dead weight.
  await prisma.passwordResetToken
    .deleteMany({ where: { OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }] } })
    .catch(() => {});

  const user = await prisma.user.findUnique({ where: { email: normalised } });

  /*
    The response is identical whether or not the address is registered — this
    endpoint must not become a way to enumerate who has an account. Everything
    below happens only when a real user was found.
  */
  if (user && user.status === "ACTIVE") {
    // One live token per user: issuing a new link retires any earlier one.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hash(token),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    });

    const base = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
    const link = `${base}/reset-password?token=${token}`;
    const mail = passwordResetEmail(link, user.name);

    await sendMail({ to: normalised, ...mail });
  }

  return NextResponse.json({
    message: "If that address has an account, a reset link is on its way.",
    // Lets the UI warn an operator that mail isn't configured yet; it says
    // nothing about whether the account exists.
    mailDelivery: mailConfigured() ? "sent" : "logged",
  });
}

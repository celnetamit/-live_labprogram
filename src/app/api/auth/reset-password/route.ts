import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const MIN_PASSWORD = 8;

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Check a link is still good, so the page can show the form or an error. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false }, { status: 400 });

  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hash(token) },
  });

  const valid = !!row && !row.usedAt && row.expiresAt.getTime() > Date.now();
  return NextResponse.json({ valid });
}

export async function POST(req: Request) {
  const { token, password } = await req.json().catch(() => ({}));

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ message: "This reset link is invalid" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { message: `Choose a password of at least ${MIN_PASSWORD} characters` },
      { status: 400 }
    );
  }

  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hash(token) },
    include: { user: true },
  });

  if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) {
    return NextResponse.json(
      { message: "This link has expired or was already used. Request a new one." },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  /*
    Set the password and burn the token together — a failure part-way through
    must not leave a usable link behind. Any other outstanding reset links for
    this account are dropped too.
  */
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { password: hashed } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: row.userId, usedAt: null } }),
  ]);

  return NextResponse.json({ message: "Password updated — you can sign in now." });
}

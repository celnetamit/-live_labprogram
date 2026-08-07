import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/** How many open requests one learner may have in flight. */
const MAX_OPEN_REQUESTS = 5;

const MAX = { title: 120, description: 2000, short: 120 };

function clean(value: unknown, limit: number): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

/** The signed-in user's own custom lab requests, newest first. */
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.customLabRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      subject: true,
      status: true,
      adminNotes: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ message: "Please sign in to request a lab" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const title = clean(body.title, MAX.title);
  const description = clean(body.description, MAX.description);
  if (title.length < 4 || description.length < 20) {
    return NextResponse.json(
      { message: "Give the lab a title and at least a couple of sentences describing it." },
      { status: 400 }
    );
  }

  // Keep the admin queue usable: no unbounded submissions per learner, and no
  // accidental double-post of the same idea.
  const openCount = await prisma.customLabRequest.count({
    where: { userId: user.id, status: { in: ["PENDING", "UNDER_REVIEW"] } },
  });
  if (openCount >= MAX_OPEN_REQUESTS) {
    return NextResponse.json(
      { message: `You already have ${openCount} requests awaiting review. Please wait for a reply.` },
      { status: 429 }
    );
  }

  const duplicate = await prisma.customLabRequest.findFirst({
    where: { userId: user.id, title, status: { in: ["PENDING", "UNDER_REVIEW"] } },
  });
  if (duplicate) {
    return NextResponse.json(
      { message: "You've already requested a lab with that title." },
      { status: 409 }
    );
  }

  const created = await prisma.customLabRequest.create({
    data: {
      userId: user.id,
      title,
      description,
      subject: clean(body.subject, MAX.short) || null,
      difficulty: clean(body.difficulty, MAX.short) || null,
      audience: clean(body.audience, MAX.short) || null,
      timeline: clean(body.timeline, MAX.short) || null,
    },
    select: {
      id: true,
      title: true,
      description: true,
      subject: true,
      status: true,
      adminNotes: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ message: "Request submitted", request: created }, { status: 201 });
}

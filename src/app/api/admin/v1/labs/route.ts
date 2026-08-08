import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireApiKey } from "@/lib/apiKeys";

/** Read-only lab list for integrations. Authenticated by API key, not a session. */
export async function GET(req: Request) {
  if (!(await requireApiKey(req))) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  const labs = await prisma.lab.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      subject: true,
      difficulty: true,
      status: true,
      launchAt: true,
      priceMinor: true,
      currency: true,
      enabled: true,
    },
  });

  return NextResponse.json({ count: labs.length, labs });
}

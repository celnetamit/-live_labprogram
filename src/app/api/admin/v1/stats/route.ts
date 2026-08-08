import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireApiKey } from "@/lib/apiKeys";

/** Headline platform numbers. No personal data — keys are for reporting. */
export async function GET(req: Request) {
  if (!(await requireApiKey(req))) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  const [users, activeLabs, upcomingLabs, paidOrders, pendingRequests, customRequests] =
    await Promise.all([
      prisma.user.count(),
      prisma.lab.count({ where: { enabled: true, status: "ACTIVE" } }),
      prisma.lab.count({ where: { enabled: true, status: "UPCOMING" } }),
      prisma.order.findMany({ where: { status: "PAID" }, select: { amountMinor: true } }),
      prisma.accessRequest.count({ where: { status: "PENDING" } }),
      prisma.customLabRequest.count({ where: { status: { in: ["PENDING", "UNDER_REVIEW"] } } }),
    ]);

  return NextResponse.json({
    users,
    labs: { active: activeLabs, upcoming: upcomingLabs },
    orders: { paid: paidOrders.length, revenueMinor: paidOrders.reduce((s, o) => s + o.amountMinor, 0) },
    pending: { accessRequests: pendingRequests, customLabRequests: customRequests },
  });
}

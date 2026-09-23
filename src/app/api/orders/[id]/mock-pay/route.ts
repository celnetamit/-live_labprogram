import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { fulfillOrder } from "@/lib/orders";

/**
 * Local / no-gateway fulfillment: grants the lab without taking a payment.
 *
 * Refused outright in production. The previous guard also required Razorpay to
 * be configured, which only closed the door on a deployment that had gateway
 * keys — so a production instance running WITHOUT keys served this route to any
 * signed-in learner, and `fulfillOrder` grants `LabAccess`. That was a free
 * pass to every lab, and once access became an administrator's decision rather
 * than a purchase, it was also a way around the approval queue entirely.
 *
 * Nothing legitimate calls this in production: the lab page offers "Request
 * access", not checkout. Real gateway payments still fulfil through
 * `/api/orders/[id]/verify`, which requires a signature from Razorpay, and an
 * admin can still fulfil an order by hand from Admin -> Orders.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Mock payment disabled" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const result = await fulfillOrder(id, { providerPaymentId: `mock_${id}` });
  return NextResponse.json({ ok: true, message: "Payment simulated", labSlugs: result.labSlugs });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { fulfillOrder } from "@/lib/orders";
import { razorpayConfigured } from "@/lib/razorpay";

/**
 * Local / no-gateway fulfillment. Allowed only when Razorpay is NOT configured
 * or when not running in production, so real deployments must pay for real.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (razorpayConfigured() && process.env.NODE_ENV === "production") {
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

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { fulfillOrder } from "@/lib/orders";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }
  if (order.providerOrderId && order.providerOrderId !== razorpay_order_id) {
    return NextResponse.json({ message: "Order mismatch" }, { status: 400 });
  }

  const valid = verifyRazorpaySignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!valid) {
    await prisma.order.update({ where: { id }, data: { status: "FAILED" } });
    return NextResponse.json({ message: "Signature verification failed" }, { status: 400 });
  }

  const result = await fulfillOrder(id, { providerPaymentId: razorpay_payment_id });
  return NextResponse.json({ ok: true, labSlugs: result.labSlugs });
}

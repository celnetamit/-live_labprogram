import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { createRazorpayOrder, razorpayConfigured, razorpayKeyId } from "@/lib/razorpay";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { labId } = await req.json().catch(() => ({}));
  if (!labId) {
    return NextResponse.json({ message: "labId is required" }, { status: 400 });
  }

  const lab = await prisma.lab.findUnique({ where: { id: labId } });
  if (!lab || !lab.enabled) {
    return NextResponse.json({ message: "Lab not found" }, { status: 404 });
  }

  // Already owns it?
  const existing = await prisma.labAccess.findUnique({
    where: { userId_labId: { userId: user.id, labId } },
  });
  if (existing) {
    return NextResponse.json({ message: "You already have access to this lab" }, { status: 409 });
  }

  const useRazorpay = razorpayConfigured();

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "PENDING",
      amountMinor: lab.priceMinor,
      currency: lab.currency,
      provider: useRazorpay ? "razorpay" : "mock",
      items: {
        create: {
          labId: lab.id,
          labSlug: lab.slug ?? lab.id,
          labTitle: lab.name,
          priceMinor: lab.priceMinor,
        },
      },
    },
  });

  if (useRazorpay) {
    try {
      const rp = await createRazorpayOrder({
        amountMinor: lab.priceMinor,
        currency: lab.currency,
        receipt: order.id,
      });
      await prisma.order.update({
        where: { id: order.id },
        data: { providerOrderId: rp.id },
      });
      return NextResponse.json({
        orderId: order.id,
        razorpayOrderId: rp.id,
        amountMinor: lab.priceMinor,
        currency: lab.currency,
        keyId: razorpayKeyId(),
        mode: "live",
        labTitle: lab.name,
      });
    } catch (err) {
      console.error("Razorpay error:", err);
      await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
      return NextResponse.json({ message: "Payment gateway error" }, { status: 502 });
    }
  }

  return NextResponse.json({
    orderId: order.id,
    amountMinor: lab.priceMinor,
    currency: lab.currency,
    mode: "mock",
    labTitle: lab.name,
  });
}

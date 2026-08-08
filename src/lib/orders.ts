import prisma from "@/lib/prisma";
import { dispatchWebhook } from "@/lib/webhooks";

/**
 * Mark an order PAID and grant LabAccess for every item. Idempotent:
 * re-fulfilling an already-paid order is a no-op that still returns success.
 */
export async function fulfillOrder(
  orderId: string,
  opts: { providerPaymentId?: string; grantedBy?: string } = {}
): Promise<{ ok: boolean; labSlugs: string[] }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new Error("Order not found");

  if (order.status !== "PAID") {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        providerPaymentId: opts.providerPaymentId ?? order.providerPaymentId,
      },
    });
  }

  for (const item of order.items) {
    await prisma.labAccess.upsert({
      where: { userId_labId: { userId: order.userId, labId: item.labId } },
      create: {
        userId: order.userId,
        labId: item.labId,
        source: "PURCHASE",
        orderId: order.id,
        grantedBy: opts.grantedBy ?? null,
      },
      update: {},
    });
  }

  await dispatchWebhook("order.paid", {
    orderId: order.id,
    userId: order.userId,
    amountMinor: order.amountMinor,
    currency: order.currency,
    provider: order.provider,
    items: order.items.map((i) => ({ labSlug: i.labSlug, labTitle: i.labTitle, priceMinor: i.priceMinor })),
  });

  return { ok: true, labSlugs: order.items.map((i) => i.labSlug) };
}

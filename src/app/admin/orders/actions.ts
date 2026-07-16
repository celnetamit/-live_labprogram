"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { fulfillOrder } from "@/lib/orders";

export async function markOrderPaid(orderId: string) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  await fulfillOrder(orderId, { grantedBy: user.id });
  revalidatePath("/admin/orders");
  return { success: true };
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/access";
import { Receipt } from "lucide-react";
import MarkPaidButton from "./MarkPaidButton";

function statusBadge(status: string) {
  if (status === "PAID") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (status === "PENDING") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-rose-500/10 text-rose-400 border-rose-500/20";
}

export default async function OrdersAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  });

  const paid = orders.filter((o) => o.status === "PAID");
  const revenueMinor = paid.reduce((sum, o) => sum + o.amountMinor, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Orders &amp; Payments</h1>
        <p className="text-muted-foreground mt-1">Lab purchases across the ecosystem.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-4">
          <div className="text-2xl font-extrabold">{orders.length}</div>
          <div className="text-xs text-muted-foreground">Total Orders</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-2xl font-extrabold">{paid.length}</div>
          <div className="text-xs text-muted-foreground">Paid</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-2xl font-extrabold text-gradient">{formatPrice(revenueMinor)}</div>
          <div className="text-xs text-muted-foreground">Revenue</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Lab(s)</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Provider</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 sm:px-6 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 sm:px-6 py-3">
                    <div className="font-semibold truncate">{o.user.name || "User"}</div>
                    <div className="text-xs text-muted-foreground truncate">{o.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {o.items.map((i) => i.labTitle).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(o.amountMinor, o.currency)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell capitalize">
                    {o.provider}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    {o.status === "PENDING" ? (
                      <MarkPaidButton orderId={o.id} />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-muted-foreground">
                    <Receipt className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

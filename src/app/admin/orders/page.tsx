import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/access";
import { Receipt } from "lucide-react";
import MarkPaidButton from "./MarkPaidButton";

export const dynamic = "force-dynamic";

function pillColor(status: string) {
  if (status === "PAID") return "text-emerald-400";
  if (status === "PENDING") return "text-amber-400";
  return "text-rose-400";
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

  const tiles = [
    { label: "Total Orders", value: orders.length.toString(), tint: "from-brand-1/25" },
    { label: "Paid", value: paid.length.toString(), tint: "from-brand-2/25" },
    { label: "Revenue", value: formatPrice(revenueMinor), tint: "from-emerald-500/25", grad: true },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-mesh border border-border p-6 sm:p-7">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Orders &amp; <span className="text-gradient-animated">Payments</span>
        </h1>
        <p className="text-muted-foreground mt-1">Lab purchases across the ecosystem.</p>
      </div>

      {/* Bento tiles */}
      <div className="grid grid-cols-3 gap-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className={`hairline-top rounded-2xl border border-border bg-gradient-to-br ${t.tint} to-card p-5`}
          >
            <div className={`text-2xl sm:text-3xl font-extrabold ${t.grad ? "text-gradient" : ""}`}>
              {t.value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{t.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Lab(s)</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Provider</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full avatar-grad flex items-center justify-center text-xs font-bold shrink-0">
                        {(o.user.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{o.user.name || "User"}</div>
                        <div className="text-xs text-muted-foreground truncate">{o.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[220px]">
                    {o.items.map((i) => i.labTitle).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(o.amountMinor, o.currency)}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell capitalize">
                    {o.provider}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`pill ${pillColor(o.status)}`}>{o.status}</span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    {o.status === "PENDING" ? (
                      <MarkPaidButton orderId={o.id} />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border">
          {orders.map((o) => (
            <div key={o.id} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full avatar-grad flex items-center justify-center text-xs font-bold shrink-0">
                  {(o.user.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{o.user.name || "User"}</div>
                  <div className="text-xs text-muted-foreground truncate">{o.user.email}</div>
                </div>
                <span className={`pill ${pillColor(o.status)}`}>{o.status}</span>
              </div>
              <div className="text-sm text-muted-foreground truncate mb-2">
                {o.items.map((i) => i.labTitle).join(", ")}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">{formatPrice(o.amountMinor, o.currency)}</span>
                {o.status === "PENDING" && <MarkPaidButton orderId={o.id} />}
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="px-6 py-14 text-center text-muted-foreground">
            <Receipt className="w-8 h-8 mx-auto mb-3 opacity-40" />
            No orders yet.
          </div>
        )}
      </div>
    </div>
  );
}

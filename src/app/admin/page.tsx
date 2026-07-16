import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/access";
import { Users, FlaskConical, Receipt, IndianRupee } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const [userCount, labCount, paidOrders, pendingOrders, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.lab.count({ where: { enabled: true } }),
    prisma.order.findMany({ where: { status: "PAID" }, select: { amountMinor: true } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { items: true, user: { select: { name: true, email: true } } },
    }),
  ]);

  const revenueMinor = paidOrders.reduce((s, o) => s + o.amountMinor, 0);

  const stats = [
    { title: "Total Users", value: userCount.toLocaleString("en-IN"), icon: Users, href: "/admin/users" },
    { title: "Active Labs", value: labCount.toLocaleString("en-IN"), icon: FlaskConical, href: "/admin/labs" },
    { title: "Paid Orders", value: paidOrders.length.toLocaleString("en-IN"), icon: Receipt, href: "/admin/orders" },
    { title: "Revenue", value: formatPrice(revenueMinor), icon: IndianRupee, href: "/admin/orders" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Master Control Center</h1>
        <p className="text-muted-foreground mt-1">Overview of your Panoptical Labs ecosystem.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <div className="text-primary p-2 bg-primary/10 rounded-lg">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-bold">{stat.value}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Recent Orders</h2>
              <p className="text-sm text-muted-foreground">Latest lab purchases.</p>
            </div>
            <Link href="/admin/orders" className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Lab</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-medium text-foreground truncate">{o.user.name || "User"}</div>
                      <div className="text-xs text-muted-foreground truncate">{o.user.email}</div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground truncate max-w-[180px]">
                      {o.items.map((i) => i.labTitle).join(", ")}
                    </td>
                    <td className="px-6 py-3 font-medium">{formatPrice(o.amountMinor, o.currency)}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          o.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : o.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-card border border-border rounded-xl flex flex-col">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold">Quick Actions</h2>
            <p className="text-sm text-muted-foreground">Manage the ecosystem.</p>
          </div>
          <div className="p-4 space-y-2">
            <Link href="/admin/labs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors">
              <FlaskConical className="w-4 h-4 text-primary" /> Manage &amp; sync labs
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors">
              <Users className="w-4 h-4 text-primary" /> Grant / revoke access
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors">
              <Receipt className="w-4 h-4 text-primary" /> Review orders
              {pendingOrders > 0 && (
                <span className="ml-auto bg-amber-500/15 text-amber-400 text-xs font-semibold rounded-full px-2 py-0.5">
                  {pendingOrders} pending
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

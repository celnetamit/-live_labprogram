import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/access";
import { Users, FlaskConical, Receipt, IndianRupee, ArrowUpRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

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
    { title: "Total Users", value: userCount.toLocaleString("en-IN"), icon: Users, href: "/admin/users", tint: "from-brand-1/25" },
    { title: "Active Labs", value: labCount.toLocaleString("en-IN"), icon: FlaskConical, href: "/admin/labs", tint: "from-brand-2/25" },
    { title: "Paid Orders", value: paidOrders.length.toLocaleString("en-IN"), icon: Receipt, href: "/admin/orders", tint: "from-brand-3/25" },
    { title: "Revenue", value: formatPrice(revenueMinor), icon: IndianRupee, href: "/admin/orders", tint: "from-emerald-500/25" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl bg-mesh border border-border p-6 sm:p-8 mb-6">
        <div className="aurora-blob animate-aurora bg-brand-1 w-72 h-72 -top-24 -right-10 opacity-30" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground mb-3">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Admin
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Master <span className="text-gradient-animated">Control Center</span>
            </h1>
            <p className="text-muted-foreground mt-1">Live overview of your Panoptical Labs ecosystem.</p>
          </div>
          {pendingOrders > 0 && (
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              <span className="pill text-amber-400">{pendingOrders} pending</span>
              review orders
            </Link>
          )}
        </div>
      </div>

      {/* Bento stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className={`group card-glow hairline-top relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${s.tint} to-card p-5 flex flex-col`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-primary">
                <s.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">{s.value}</span>
            <span className="text-xs sm:text-sm text-muted-foreground mt-0.5">{s.title}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
          <div className="p-5 sm:p-6 border-b border-border flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Recent Orders</h2>
              <p className="text-sm text-muted-foreground">Latest lab purchases.</p>
            </div>
            <Link href="/admin/orders" className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-3 p-4 sm:px-6 hover:bg-muted/20 transition-colors">
                <div className="w-9 h-9 rounded-full avatar-grad flex items-center justify-center text-xs font-bold shrink-0">
                  {(o.user.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{o.user.name || "User"}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {o.items.map((i) => i.labTitle).join(", ")}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-sm">{formatPrice(o.amountMinor, o.currency)}</div>
                  <span
                    className={`pill ${
                      o.status === "PAID"
                        ? "text-emerald-400"
                        : o.status === "PENDING"
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">No orders yet.</div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-border bg-card flex flex-col">
          <div className="p-5 sm:p-6 border-b border-border">
            <h2 className="text-lg font-bold">Quick Actions</h2>
            <p className="text-sm text-muted-foreground">Manage the ecosystem.</p>
          </div>
          <div className="p-4 space-y-2">
            {[
              { href: "/admin/labs", icon: FlaskConical, label: "Manage & sync labs" },
              { href: "/admin/users", icon: Users, label: "Grant / revoke access" },
              { href: "/admin/orders", icon: Receipt, label: "Review orders" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <a.icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm">{a.label}</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/access";
import { CreditCard, Receipt, FlaskConical, ArrowRight, Infinity as InfinityIcon } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  PAID: "text-emerald-400",
  PENDING: "text-amber-400",
  FAILED: "text-rose-400",
};

export default async function BillingSettingsPage() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/login");

  const [orders, access] = await Promise.all([
    prisma.order.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.labAccess.findMany({
      where: { userId: sessionUser.id },
      include: { lab: { select: { name: true, slug: true, status: true } } },
      orderBy: { grantedAt: "desc" },
    }),
  ]);

  const paid = orders.filter((o) => o.status === "PAID");
  const totalSpent = paid.reduce((sum, o) => sum + o.amountMinor, 0);

  return (
    <>
      {/* Summary */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Billing &amp; subscriptions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Labs are bought individually — a one-time payment gives you lifetime access to
              that lab. There is no recurring subscription to cancel.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Labs owned
            </p>
            <p className="mt-1 text-2xl font-extrabold">{access.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total paid
            </p>
            <p className="mt-1 text-2xl font-extrabold">{formatPrice(totalSpent)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Plan
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
              <InfinityIcon className="h-4 w-4" /> Lifetime per lab
            </p>
          </div>
        </div>
      </div>

      {/* What the money bought */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border p-6">
          <FlaskConical className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Your labs</h2>
        </div>
        {access.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            You don&apos;t own any labs yet.{" "}
            <Link href="/labs" className="font-medium text-primary hover:underline">
              Browse the catalogue
            </Link>
            .
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {access.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.lab.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.source === "PURCHASE" ? "Purchased" : "Granted by an admin"} ·{" "}
                    {new Date(a.grantedAt).toLocaleDateString("en-IN")}
                    {a.expiresAt
                      ? ` · expires ${new Date(a.expiresAt).toLocaleDateString("en-IN")}`
                      : " · no expiry"}
                  </p>
                </div>
                {a.lab.status === "ACTIVE" && a.lab.slug && (
                  <Link
                    href={`/dashboard/labs/${a.lab.slug}`}
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Receipts */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border p-6">
          <Receipt className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Payment history</h2>
        </div>
        {orders.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No payments yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-6 py-3 font-medium">Method</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      {o.items.map((i) => i.labTitle).join(", ") || "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground capitalize">{o.provider}</td>
                    <td className="px-6 py-4 font-medium">
                      {formatPrice(o.amountMinor, o.currency)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`pill ${STATUS_TONE[o.status] ?? "text-muted-foreground"}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

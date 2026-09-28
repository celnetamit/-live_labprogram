import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { KeyRound, Building2, ShieldCheck } from "lucide-react";
import ChangePassword from "./ChangePassword";

export const dynamic = "force-dynamic";

const PROVIDER_LABEL: Record<string, string> = {
  google: "Google",
};

/** Security — how you get into this account, and how to change it. */
export default async function SecuritySettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      id: true,
      password: true,
      accounts: { select: { provider: true } },
    },
  });
  if (!user) redirect("/login");

  const methods = [
    {
      icon: KeyRound,
      label: "Password",
      state: user.password ? "Set" : "Not set",
      active: !!user.password,
    },
    {
      icon: Building2,
      label: "Google",
      state: user.accounts.length
        ? user.accounts.map((a) => PROVIDER_LABEL[a.provider] ?? a.provider).join(", ")
        : "Not linked",
      active: user.accounts.length > 0,
    },
  ];

  return (
    <>
      {/* At a glance: every way this account can be signed into. */}
      <div className="ui-card p-6">
        <div className="flex gap-3">
          <div className="ui-icon-tile ui-tone-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="ui-h2 text-lg">Sign-in methods</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep both available so losing one doesn&apos;t lock you out.
            </p>
          </div>
        </div>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {methods.map((m) => (
            <li key={m.label} className="ui-subtile">
              <div className="flex items-center gap-2 text-muted-foreground">
                <m.icon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{m.label}</span>
              </div>
              <p
                className={`mt-1.5 font-semibold ${
                  m.active ? "text-[color:var(--color-success-ink)]" : "text-muted-foreground"
                }`}
              >
                {m.state}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <ChangePassword hasPassword={!!user.password} />
    </>
  );
}

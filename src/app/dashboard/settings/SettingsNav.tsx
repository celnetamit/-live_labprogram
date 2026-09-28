"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, Bell, CreditCard } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

const SECTIONS = [
  { href: "/dashboard/settings", label: "Profile Details", icon: User },
  { href: "/dashboard/settings/security", label: "Security", icon: Shield },
  { href: "/dashboard/settings/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings/billing", label: "Billing & Subscriptions", icon: CreditCard },
];

/** Sidebar shared by every settings section, highlighting the current one. */
export default function SettingsNav() {
  const pathname = usePathname();

  return (
    /* One panel, sticky beside the section it drives, in the learner
       section's nav style (`.ui-nav-link`). The stickiness is on a wrapper:
       `.ui-card` sets `position: relative`, which would turn `top-24` into a
       96px downward shift instead. */
    <div className="self-start md:sticky md:top-24">
    <nav aria-label="Settings" className="ui-card p-2">
      <ul className="space-y-1">
        {SECTIONS.map((s) => {
          const active = pathname === s.href;
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                aria-current={active ? "page" : undefined}
                className="ui-nav-link focus-ring"
              >
                <s.icon className="h-4 w-4 shrink-0" /> {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 border-t border-border pt-2">
        <SignOutButton className="ui-nav-link focus-ring w-full text-left [&>svg]:mr-0 !text-[color:var(--color-destructive-ink)] hover:!bg-[color:color-mix(in_srgb,var(--color-destructive-ink)_8%,transparent)]" />
      </div>
    </nav>
    </div>
  );
}

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
    <div className="space-y-1">
      {SECTIONS.map((s) => {
        const active = pathname === s.href;
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              active
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <s.icon className="w-4 h-4" /> {s.label}
          </Link>
        );
      })}
      <div className="pt-4 mt-4 border-t border-border">
        <SignOutButton className="flex w-full items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left" />
      </div>
    </div>
  );
}

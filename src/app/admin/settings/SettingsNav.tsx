"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Shield, Mail, Key, BellRing } from "lucide-react";

const SECTIONS = [
  { href: "/admin/settings", label: "General", icon: Globe },
  { href: "/admin/settings/security", label: "Security & Auth", icon: Shield },
  { href: "/admin/settings/email", label: "Email & SMTP", icon: Mail },
  { href: "/admin/settings/api-keys", label: "API Keys", icon: Key },
  { href: "/admin/settings/webhooks", label: "Webhooks", icon: BellRing },
];

export default function SettingsNav() {
  const pathname = usePathname();

  return (
    /* One swipeable row of tabs below `md`, the full list beside the form above it. */
    <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 md:mx-0 md:block md:space-y-1 md:px-0">
      {SECTIONS.map((s) => {
        const active = pathname === s.href;
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 whitespace-nowrap px-3 py-2.5 rounded-lg transition-colors text-left md:w-full md:py-2 ${
              active
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <s.icon className="w-4 h-4" /> {s.label}
          </Link>
        );
      })}
    </div>
  );
}

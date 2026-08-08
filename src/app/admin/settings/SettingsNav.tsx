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
    <div className="space-y-1">
      {SECTIONS.map((s) => {
        const active = pathname === s.href;
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active ? "page" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
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

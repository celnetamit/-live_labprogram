"use client";

import { LayoutDashboard, Users, FlaskConical, ShieldAlert, Settings, Receipt } from "lucide-react";
import AppShell, { type NavGroup } from "@/components/app-shell";

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: LayoutDashboard, emoji: "📈" },
    ],
  },
  {
    title: "Ecosystem",
    items: [
      { href: "/admin/labs", label: "Lab Management", icon: FlaskConical },
      { href: "/admin/users", label: "Users & Access", icon: Users },
      { href: "/admin/orders", label: "Orders", icon: Receipt },
      { href: "/admin/access", label: "Access Requests", icon: ShieldAlert },
    ],
  },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      brandTitle="Admin Center"
      navGroups={navGroups}
      breadcrumbRoot="Admin"
      userInitials="JD"
      showBell
    >
      {children}
    </AppShell>
  );
}

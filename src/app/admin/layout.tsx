"use client";

import AdminThemeDefault, { adminThemeInitScript } from "@/components/admin-theme-default";

import {
  LayoutDashboard,
  Users,
  FlaskConical,
  ShieldAlert,
  Settings,
  Receipt,
  Lightbulb,
  MessageSquare,
  ClipboardCheck,
  Newspaper,
} from "lucide-react";
import AppShell, { type NavGroup } from "@/components/app-shell";
import NotificationBell from "./notifications/NotificationBell";

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
      { href: "/admin/lab-requests", label: "Custom Lab Requests", icon: Lightbulb },
      { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
      { href: "/admin/reviews", label: "Expert Reviews", icon: ClipboardCheck },
      { href: "/admin/blog", label: "Blog & SEO", icon: Newspaper },
    ],
  },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*
        Blocking, and before the shell renders, so the console never paints
        light and then snaps to dark — the flash every theme switcher is judged
        by. The head script on the root layout has already run by now and set
        the platform default; this is the admin's own default on top of it, and
        a stored preference beats both.
      */}
      <script dangerouslySetInnerHTML={{ __html: adminThemeInitScript }} />
      <AdminThemeDefault />
      <AppShell
        brandTitle="Admin Center"
        navGroups={navGroups}
        breadcrumbRoot="Admin"
        breadcrumbRootHref="/admin"
        headerSlot={<NotificationBell />}
      >
        {children}
      </AppShell>
    </>
  );
}

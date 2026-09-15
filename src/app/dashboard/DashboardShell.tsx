"use client";

import { User, FlaskConical, Award, Settings } from "lucide-react";
import AppShell, { type NavGroup } from "@/components/app-shell";

const navGroups: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", label: "My Profile", icon: User },
      { href: "/dashboard/labs", label: "My Labs", icon: FlaskConical },
      { href: "/dashboard/certificates", label: "Certificates", icon: Award },
      { href: "/dashboard/settings", label: "Account Settings", icon: Settings },
    ],
  },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      brandTitle="Student Hub"
      navGroups={navGroups}
      breadcrumbRoot="Dashboard"
      breadcrumbRootHref="/dashboard"
      accentUser
    >
      {children}
    </AppShell>
  );
}

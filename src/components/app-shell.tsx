"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronRight, Menu, X, type LucideIcon } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  emoji?: string;
};

export type NavGroup = {
  title?: string;
  items: NavItem[];
};

type AppShellProps = {
  brandTitle: string;
  navGroups: NavGroup[];
  breadcrumbRoot: string;
  userInitials: string;
  accentUser?: boolean;
  showBell?: boolean;
  children: React.ReactNode;
};

function NavLinks({
  navGroups,
  pathname,
  onNavigate,
}: {
  navGroups: NavGroup[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
      {navGroups.map((group, gi) => (
        <div key={gi} className="space-y-1">
          {group.title && (
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {group.title}
            </p>
          )}
          {group.items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" &&
                item.href !== "/dashboard" &&
                pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.emoji ? (
                    <span className="h-4 w-4 flex items-center justify-center text-base leading-none">
                      {item.emoji}
                    </span>
                  ) : (
                    <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                  )}
                  {item.label}
                </span>
                {item.badge && (
                  <span className="bg-primary text-primary-foreground text-[11px] font-semibold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function AppShell({
  brandTitle,
  navGroups,
  breadcrumbRoot,
  userInitials,
  accentUser = false,
  showBell = false,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const Brand = (
    <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
      <div className="w-8 h-8 rounded-lg btn-brand flex items-center justify-center text-primary-foreground font-bold text-sm mr-2.5">
        P
      </div>
      <span className="font-bold text-lg tracking-tight">{brandTitle}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-sidebar-border bg-sidebar flex-col fixed inset-y-0 z-40">
        {Brand}
        <NavLinks navGroups={navGroups} pathname={pathname} />
        <div className="p-4 border-t border-sidebar-border">
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85%] bg-sidebar border-r border-sidebar-border flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-sidebar-border pr-3">
                <div className="flex-1">{Brand}</div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavLinks
                navGroups={navGroups}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
              <div className="p-4 border-t border-sidebar-border">
                <SignOutButton />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border text-foreground hover:bg-accent"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center text-sm text-muted-foreground min-w-0">
              <span className="truncate">{breadcrumbRoot}</span>
              <ChevronRight className="h-4 w-4 mx-2 shrink-0" />
              <span className="text-foreground font-medium truncate">Overview</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {showBell && (
              <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              </button>
            )}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border ${
                accentUser
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-secondary text-secondary-foreground border-border"
              }`}
            >
              {userInitials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

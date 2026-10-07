"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Menu, X, type LucideIcon } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import ThemeToggle from "@/components/theme-toggle";

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
  /**
   * The signed-in person's first name, greeted under the brand. Omitted for a
   * shell with no one behind it — a bare "Hi!" is worse than no greeting.
   */
  greetingName?: string | null;
  navGroups: NavGroup[];
  breadcrumbRoot: string;
  /**
   * Where the first breadcrumb points, and the section root for nav
   * highlighting. Previously the two root paths were hardcoded inside
   * `NavLinks`, so the component only worked for the two sections that happened
   * to be listed there.
   */
  breadcrumbRootHref: string;
  accentUser?: boolean;
  /**
   * Extra controls for the right of the header, rendered before the theme
   * toggle.
   *
   * A slot rather than a `showBell` flag: the bell now needs admin-only data
   * and server actions, and this shell is also the student shell. Passing the
   * rendered element keeps that dependency in the admin layout where it
   * belongs.
   */
  headerSlot?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * A nav entry is current when the path is it, or sits beneath it.
 *
 * The section root is excluded from prefix matching — "/dashboard" is a prefix
 * of every page in the section and would otherwise always match. The trailing
 * slash matters too: without it "/admin/lab" would match "/admin/lab-requests".
 */
function isCurrent(href: string, pathname: string, rootHref: string): boolean {
  if (pathname === href) return true;
  return href !== rootHref && pathname.startsWith(`${href}/`);
}

function NavLinks({
  navGroups,
  pathname,
  rootHref,
  onNavigate,
}: {
  navGroups: NavGroup[];
  pathname: string;
  rootHref: string;
  onNavigate?: () => void;
}) {
  /* `pt-4`, not `pt-6`: the block above this ends in its own padding, so the
     two stacked and the first item sat further from the divider than the
     items sit from each other. */
  return (
    <div className="flex-1 overflow-y-auto px-3 pb-6 pt-4 space-y-8">
      {navGroups.map((group, gi) => (
        <div key={gi} className="space-y-1">
          {group.title && (
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {group.title}
            </p>
          )}
          {group.items.map((item) => {
            const active = isCurrent(item.href, pathname, rootHref);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`group relative flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  active
                    ? "bg-gradient-to-r from-primary/15 via-primary/5 to-transparent text-primary font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:rounded-full before:bg-primary"
                    : "font-medium text-sidebar-foreground/90 hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.emoji ? (
                    <span className="h-4 w-4 flex items-center justify-center text-base leading-none">
                      {item.emoji}
                    </span>
                  ) : (
                    <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-sidebar-foreground/70"}`} />
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
  greetingName,
  navGroups,
  breadcrumbRoot,
  breadcrumbRootHref,
  accentUser = false,
  headerSlot,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  /**
   * The second crumb used to be the literal string "Overview" on every page, so
   * the header read "Dashboard › Overview" while you were looking at My
   * Labs. Deriving it from the nav means it names the page you are actually
   * on, and stays correct as nav items are added.
   *
   * Deepest match wins: /dashboard/settings/security resolves to "Account
   * Settings" rather than to the section root.
   */
  const currentLabel =
    navGroups
      .flatMap((group) => group.items)
      .filter((item) => isCurrent(item.href, pathname, breadcrumbRootHref))
      .sort((a, b) => b.href.length - a.href.length)[0]?.label ?? "Overview";

  /*
   * At a section root the two crumbs can be the same page. The learner shell
   * calls its root "Dashboard" and its first nav item "Dashboard" too, so the
   * header read "Dashboard › Dashboard" and the first one linked to the page
   * you were already standing on. When they coincide, say it once.
   *
   * Compared by label rather than by `pathname === breadcrumbRootHref`,
   * because the admin shell is also at its root on /admin and there the two
   * crumbs are "Admin" and "Dashboard" — a section and a page within it, two
   * different things to say. Collapsing on path would have silently dropped
   * that one too.
   */
  const rootIsCurrentPage = currentLabel === breadcrumbRoot;

  /*
    The brand row and the greeting are two blocks, not one.

    The greeting was a line of small text tucked under the wordmark, close
    enough that it read as a subtitle of the product name rather than as
    something addressed to the person. It now sits in its own card below the
    rule, led by the initial, so the sidebar opens by naming who is signed in.
  */
  const Brand = (
    <div className="border-b border-sidebar-border">
      <div className="flex h-16 items-center px-6">
        <div className="mr-2.5 flex h-8 w-8 items-center justify-center rounded-lg btn-brand text-sm font-bold text-primary-foreground">
          L
        </div>
        <span className="text-lg font-bold tracking-tight">{brandTitle}</span>
      </div>

      {greetingName && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-[color:var(--sidebar-accent)] px-3 py-2.5">
            <span
              aria-hidden
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--sidebar-primary)] text-sm font-bold uppercase text-[color:var(--sidebar-primary-foreground)]"
            >
              {greetingName.charAt(0)}
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-[color:var(--sidebar-accent-foreground)] opacity-80">
                Welcome back
              </span>
              <span className="block truncate text-sm font-semibold text-sidebar-foreground">
                Hi {greetingName}!
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-sidebar-border bg-sidebar flex-col fixed inset-y-0 z-40">
        {Brand}
        <NavLinks navGroups={navGroups} pathname={pathname} rootHref={breadcrumbRootHref} />
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
                rootHref={breadcrumbRootHref}
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
            {/*
              A real breadcrumb: the root is a link back to the section, not a
              dead label. `aria-current="page"` marks the leaf so assistive tech
              can tell where you are without relying on the font weight.
            */}
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex items-center text-sm text-muted-foreground min-w-0">
                {!rootIsCurrentPage && (
                  <>
                    <li className="min-w-0">
                      <Link
                        href={breadcrumbRootHref}
                        className="tap-target block truncate rounded-sm transition-colors hover:text-foreground hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {breadcrumbRoot}
                      </Link>
                    </li>
                    <li aria-hidden="true">
                      <ChevronRight className="h-4 w-4 mx-2 shrink-0" />
                    </li>
                  </>
                )}
                <li className="min-w-0">
                  <span aria-current="page" className="block truncate font-medium text-foreground">
                    {currentLabel}
                  </span>
                </li>
              </ol>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {headerSlot}
            {/* The theme control occupies the avatar slot rather than sitting
                beside it — one circle in the corner, not two. */}
            <ThemeToggle
              className={`w-9 h-9 ${
                accentUser
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-secondary text-secondary-foreground border-border"
              }`}
            />
          </div>
        </header>

        <main id="main" className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

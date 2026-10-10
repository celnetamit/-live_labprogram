"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import LabSearch from "@/components/lab-search";
import ScrollProgress from "@/components/scroll-progress";

const navLinks = [
  { href: "/labs", label: "Labs" },
  { href: "/blog", label: "Blog" },
  { href: "/#features", label: "Features" },
  { href: "/#about", label: "About" },
];

/** The signed-in visitor, when there is one. Passed down from the server page
 *  because the app has no SessionProvider — without it the public header always
 *  rendered "Sign In", which made a signed-in learner think they'd been logged
 *  out just by opening the catalogue. */
export type NavbarUser = { name?: string | null; email?: string | null } | null;

export default function Navbar({ user = null }: { user?: NavbarUser }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /*
   * Search lives in <LabSearch/>, which owns the input, the debounced typeahead
   * and the navigation. Both breakpoints render the same component, so the
   * desktop bar and the mobile menu cannot drift apart — they previously carried
   * two copies of the same markup and handler.
   */

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      /*
        Opaque, not translucent.

        At 80% over a dark hero band the bar turned a washed grey and the
        logo lost its edge. A solid header above a deep hero is the shape
        this kind of site wants anyway; the only thing scrolling changes is
        whether it carries a hairline and a shadow.
      */
      className={`site-header fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${
        scrolled ? "border-b border-border elev-2" : "border-b border-transparent"
      }`}
    >
      <ScrollProgress />
      {/* The same shell every band below uses, so the logo sits on the page's
          own left edge rather than 320px inside it on a wide display. */}
      <div className="shell">
        <div className="flex h-16 items-center justify-between gap-4">
          {/*
            Brand and section links are one group.

            With `justify-between` across four separate children, the slack on
            a wide display was split three ways and the logo ended up marooned
            a couple of hundred pixels from its own links. Grouped, the left
            side reads as one block and the search takes the slack.
          */}
          <div className="flex min-w-0 shrink-0 items-center gap-6 lg:gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="viv-btn w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
              L
            </div>
            <span className="whitespace-nowrap text-lg font-bold tracking-tight">Live Labs</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-5 md:flex lg:gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                /* `py-1.5` takes the hit box to 24px+ — WCAG 2.2 AA target size.
                   The inline-link exception does not cover site navigation. */
                className="viv-navlink inline-flex items-center whitespace-nowrap rounded-md px-1 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
          </div>

          {/* Desktop search */}
          <div className="hidden min-w-0 flex-1 items-center lg:flex lg:max-w-sm xl:max-w-md">
            <LabSearch variant="desktop" />
          </div>

          {/* Desktop actions */}
          <div className="hidden shrink-0 items-center gap-2 md:flex lg:gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/labs"
                  className="viv-btn inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold"
                >
                  My Labs <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="viv-btn inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold"
                >
                  Start learning <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg glass text-foreground"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          </div>
        </div>
      </div>

      {/* Dark-mode signature: hidden in light, where the bar is near-white
          and a coloured rule would read as decoration. */}
      <span
        aria-hidden="true"
        className="site-header-accent pointer-events-none absolute inset-x-0 bottom-0 hidden h-px dark:block"
      />

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden glass border-b border-border"
          >
            <div className="shell space-y-1 py-4">
              <div className="mb-3">
                {/* Closing the menu on navigate stops the panel covering the page
                    the visitor just asked for. */}
                <LabSearch variant="mobile" onNavigate={() => setOpen(false)} />
              </div>
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-accent transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/labs"
                      onClick={() => setOpen(false)}
                      className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold btn-brand inline-flex items-center justify-center gap-1.5"
                    >
                      My Labs <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-accent transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold btn-brand inline-flex items-center justify-center gap-1.5"
                    >
                      Start learning <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

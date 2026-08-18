"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import LabSearch from "@/components/lab-search";

const navLinks = [
  { href: "/labs", label: "Labs" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-background/80 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl btn-brand flex items-center justify-center text-primary-foreground font-bold text-lg group-hover:scale-105 transition-transform">
              P
            </div>
            <span className="font-bold text-lg tracking-tight">Panoptical Labs</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop search */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
            <LabSearch variant="desktop" />
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium px-3 py-2 rounded-lg hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/labs"
                  className="text-sm font-semibold btn-brand px-4 py-2 rounded-lg inline-flex items-center gap-1.5"
                >
                  My Labs <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium px-3 py-2 rounded-lg hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold btn-brand px-4 py-2 rounded-lg inline-flex items-center gap-1.5"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
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
            <div className="px-4 py-4 space-y-1">
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
                      Get Started <ArrowRight className="w-4 h-4" />
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

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronRight, Menu, Search, User, X } from "lucide-react";
import LabSearch from "@/components/lab-search";
import type { NavbarUser } from "@/components/navbar";

/*
  The site header in the reference design's shape.

  Reading left to right it is: wordmark, section links, one filled pill, then
  a row of bare icon buttons. The bar is white, 79px tall, sticky, and carries
  a hairline rather than a shadow. Links are ink and turn blue on hover; the
  pill is the page's only filled control.

  Search is a link to the catalogue rather than an inline field. The reference
  puts a magnifier in this row that opens a full-screen layer, and a typeahead
  dropped into a 79px editorial bar reads as a different product; `/labs`
  already carries the real search, so the icon goes there.
*/

const NAV = [
  { href: "/labs", label: "Labs" },
  { href: "/blog", label: "Blog" },
  { href: "/#features", label: "Features" },
  { href: "/#about", label: "About" },
];

export default function EditorialHeader({ user = null }: { user?: NavbarUser }) {
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  /* The drawer is a full-width panel under the bar, so it has to close when
     the viewport grows past the breakpoint that hides its own trigger. */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const close = () => mq.matches && setOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  /* Escape closes the search panel. A layer that covers the page and can only
     be dismissed with the mouse is the thing keyboard users get stuck in. */
  useEffect(() => {
    if (!searching) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearching(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searching]);

  return (
    <header className="els els-header">
      <div className="els-header-bar">
        <div className="els-header-row">
          <Link href="/" className="els-wordmark" aria-label="Live Labs home">
            <span className="els-wordmark-mark" aria-hidden="true">L</span>
            <span className="els-wordmark-text">Live Labs</span>
          </Link>

          <nav className="els-nav" aria-label="Primary">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </nav>

          <div className="els-header-actions">
            {user ? (
              <Link href="/dashboard/labs" className="els-pill">
                My labs <ArrowRight aria-hidden="true" />
              </Link>
            ) : (
              <Link href="/register" className="els-pill">
                Start learning <ArrowRight aria-hidden="true" />
              </Link>
            )}
            <button
              type="button"
              className="els-icon-btn"
              onClick={() => { setSearching((v) => !v); setOpen(false); }}
              aria-expanded={searching}
              aria-label={searching ? "Close search" : "Search labs"}
            >
              {searching ? <X aria-hidden="true" /> : <Search aria-hidden="true" />}
            </button>
            <Link
              href={user ? "/dashboard" : "/login"}
              className="els-icon-btn"
              aria-label={user ? "Your dashboard" : "Sign in"}
            >
              <User aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="els-icon-btn els-menu-btn"
              onClick={() => { setOpen((v) => !v); setSearching(false); }}
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {searching && (
        <div className="els-search-panel">
          <div className="els-header-bar">
            <div className="els-search-field">
              <LabSearch variant="desktop" autoFocus onNavigate={() => setSearching(false)} />
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="els-drawer">
          <div className="els-header-bar">
            <div className="els-search-field" style={{ marginBottom: "1rem" }}>
              <LabSearch variant="mobile" onNavigate={() => setOpen(false)} />
            </div>
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label} <ChevronRight aria-hidden="true" />
              </Link>
            ))}
            <Link href={user ? "/dashboard" : "/login"} onClick={() => setOpen(false)}>
              {user ? "Dashboard" : "Sign in"} <ChevronRight aria-hidden="true" />
            </Link>
            <Link
              href={user ? "/dashboard/labs" : "/register"}
              onClick={() => setOpen(false)}
              className="els-pill"
              style={{ marginTop: "1.25rem" }}
            >
              {user ? "My labs" : "Start learning"} <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

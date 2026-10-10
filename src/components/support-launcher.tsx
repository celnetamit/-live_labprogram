"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LifeBuoy, X, Mail, MessageCircle, FileText } from "lucide-react";
import { COMPANY } from "@/content/legal/company";

/*
  Live Labs Support — a launcher, not a chatbot.

  It opens the routes that actually reach someone: the support mailbox and the
  WhatsApp number from `src/content/legal/company.ts`, and the contact page.
  There is no assistant behind it, so it does not present a message box and a
  typing indicator: a widget that looks like a live chat and silently goes
  nowhere costs more trust than it wins, and the reply time below is left
  unstated rather than invented.
*/

export default function SupportLauncher() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Escape closes the panel and returns focus to the button that opened it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !buttonRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const wa = COMPANY.primaryPhone.replace(/[^\d]/g, "");

  const routes = [
    {
      icon: Mail,
      label: "Email support",
      detail: COMPANY.email,
      href: `mailto:${COMPANY.email}`,
      external: true,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      detail: COMPANY.primaryPhone,
      href: `https://wa.me/${wa}`,
      external: true,
    },
    {
      icon: FileText,
      label: "Contact page",
      detail: "Address and company details",
      href: "/contact-us",
      external: false,
    },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 print:hidden">
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id="livelabs-support-panel"
            role="dialog"
            aria-label="Live Labs Support"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="w-[min(21rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-border bg-card elev-2"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <p className="text-sm font-semibold">Live Labs Support</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Questions about a lab, access or billing.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close support"
                className="-mr-1.5 -mt-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="p-2">
              {routes.map((r) => (
                <li key={r.label}>
                  <Link
                    href={r.href}
                    {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary-ink">
                      <r.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{r.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{r.detail}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={buttonRef}
        onClick={() => {
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-controls="livelabs-support-panel"
        aria-label={open ? "Close Live Labs Support" : "Open Live Labs Support"}
        className="flex h-14 w-14 items-center justify-center rounded-full btn-brand text-primary-foreground elev-2 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2"
      >
        {open ? <X className="h-6 w-6" /> : <LifeBuoy className="h-6 w-6" />}
      </button>
    </div>
  );
}

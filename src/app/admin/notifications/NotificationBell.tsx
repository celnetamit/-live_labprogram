"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, UserPlus } from "lucide-react";
import {
  getSignupNotifications,
  markNotificationsSeen,
  type NotificationFeed,
} from "./actions";

/** How often the badge refreshes while the tray is closed. */
const POLL_MS = 60_000;

const EMPTY: NotificationFeed = { unreadCount: 0, capped: false, items: [] };

/** Compact relative time — "4m ago", "3d ago". */
function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationBell() {
  const [feed, setFeed] = useState<NotificationFeed>(EMPTY);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * `mounted` guards every setState after an await.
   *
   * The tray polls on a timer and the admin can navigate away mid-request;
   * without this, the response resolves into an unmounted component.
   */
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const next = await getSignupNotifications();
      if (mounted.current) setFeed(next);
    } catch {
      // A failed poll is not worth surfacing — the next one will retry, and an
      // error toast every minute on a flaky connection helps nobody.
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  // Opening the tray is the "read" gesture: fetch the latest, show it, then
  // stamp it seen so the badge clears.
  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const next = await getSignupNotifications();
      if (mounted.current) setFeed(next);
      await markNotificationsSeen();
      // Clear the badge locally rather than refetching: the items keep their
      // "New" markers for this viewing, which is what makes the tray useful.
      if (mounted.current) setFeed((f) => ({ ...f, unreadCount: 0, capped: false }));
    } catch {
      /* leave whatever was already on screen */
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const badge = feed.capped ? "99+" : String(feed.unreadCount);
  const hasUnread = feed.unreadCount > 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => (open ? setOpen(false) : void handleOpen())}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          hasUnread
            ? `Notifications, ${badge} new ${feed.unreadCount === 1 ? "signup" : "signups"}`
            : "Notifications"
        }
        className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors"
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-background"
            aria-hidden="true"
          >
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Recent signups"
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card shadow-xl z-50"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">New signups</h3>
            <Link
              href="/admin/users"
              onClick={() => setOpen(false)}
              className="text-xs text-primary hover:underline underline-offset-4"
            >
              View all users
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && feed.items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
            ) : feed.items.length === 0 ? (
              /* Empty state says what will appear here, not just that it is empty. */
              <div className="px-4 py-8 text-center">
                <UserPlus className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium">No signups yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  New accounts will appear here as soon as people register.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {feed.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href="/admin/users"
                      onClick={() => setOpen(false)}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent ${
                        item.unread ? "bg-primary/5" : ""
                      }`}
                    >
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <UserPlus className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {item.name?.trim() || item.email || "New user"}
                          </span>
                          {item.unread && (
                            <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              New
                            </span>
                          )}
                        </span>
                        {item.email && (
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {item.email}
                          </span>
                        )}
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                          Signed up {timeAgo(item.createdAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

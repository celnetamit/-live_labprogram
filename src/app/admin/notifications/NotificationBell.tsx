"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, MessageSquare, UserPlus, X } from "lucide-react";
import {
  getSignupNotifications,
  markNotificationsSeen,
  type AdminNotification,
  type NotificationFeed,
} from "./actions";

/**
 * How often the feed refreshes.
 *
 * Was 60s when this only carried signups, where a minute either way is
 * immaterial. Feedback is somebody waiting, and 20s is the difference between
 * a notification that feels live and one that feels like a page you have to
 * remember to check. It is one indexed count and two small selects.
 */
const POLL_MS = 20_000;

const EMPTY: NotificationFeed = {
  unreadCount: 0, capped: false, items: [], unreadSignups: 0, unreadFeedback: 0,
};

/** How long a toast stays before dismissing itself. */
const TOAST_MS = 12_000;

/** Where a notification takes you when clicked. */
function hrefFor(item: AdminNotification): string {
  return item.kind === "FEEDBACK" ? "/admin/feedback" : "/admin/users";
}

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

  /*
   * The pop-up. Feedback gets one and signups do not, which is a judgement
   * about interruption rather than importance: a signup is a number that can
   * wait for the badge, whereas feedback is somebody waiting for a reply, and
   * the whole point of collecting it was that nobody was reading it.
   *
   * `seenFeedbackIds` is what stops the same message toasting on every poll.
   * It starts null rather than empty so the FIRST poll can populate it without
   * firing: otherwise every existing message would pop up the moment an admin
   * loaded any page, which teaches people to dismiss toasts without reading.
   */
  const [toasts, setToasts] = useState<AdminNotification[]>([]);
  const seenFeedbackIds = useRef<Set<string> | null>(null);

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
      if (!mounted.current) return;
      setFeed(next);

      const feedbackItems = next.items.filter((item) => item.kind === "FEEDBACK");
      if (seenFeedbackIds.current === null) {
        // First poll: remember what is already there, announce none of it.
        seenFeedbackIds.current = new Set(feedbackItems.map((item) => item.id));
        return;
      }

      const known = seenFeedbackIds.current;
      const arrived = feedbackItems.filter((item) => item.unread && !known.has(item.id));
      for (const item of feedbackItems) known.add(item.id);
      if (arrived.length === 0) return;

      setToasts((current) => [...arrived, ...current].slice(0, 3));
      window.setTimeout(() => {
        if (!mounted.current) return;
        setToasts((current) => current.filter((t) => !arrived.some((a) => a.id === t.id)));
      }, TOAST_MS);
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
            ? `Notifications, ${badge} new: ${feed.unreadFeedback} feedback, ${feed.unreadSignups} signups`
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
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Recent activity</h3>
              <Link
                href="/admin/feedback"
                onClick={() => setOpen(false)}
                className="text-xs text-primary hover:underline underline-offset-4"
              >
                All feedback
              </Link>
            </div>
            {(feed.unreadFeedback > 0 || feed.unreadSignups > 0) && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {feed.unreadFeedback > 0 && (
                  <>
                    {feed.unreadFeedback} new{" "}
                    {feed.unreadFeedback === 1 ? "message" : "messages"}
                  </>
                )}
                {feed.unreadFeedback > 0 && feed.unreadSignups > 0 && " · "}
                {feed.unreadSignups > 0 && (
                  <>
                    {feed.unreadSignups} new{" "}
                    {feed.unreadSignups === 1 ? "signup" : "signups"}
                  </>
                )}
              </p>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && feed.items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
            ) : feed.items.length === 0 ? (
              /* Empty state says what will appear here, not just that it is empty. */
              <div className="px-4 py-8 text-center">
                <UserPlus className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium">Nothing yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  New signups and feedback sent from inside a lab will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {feed.items.map((item) => {
                  const isFeedback = item.kind === "FEEDBACK";
                  return (
                    <li key={item.id}>
                      <Link
                        href={hrefFor(item)}
                        onClick={() => setOpen(false)}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent ${
                          item.unread ? "bg-primary/5" : ""
                        }`}
                      >
                        <span
                          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                            isFeedback ? "bg-violet-500/15 text-violet-400" : "bg-primary/10 text-primary"
                          }`}
                        >
                          {isFeedback ? <MessageSquare className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">
                              {item.name?.trim() || item.email || (isFeedback ? "Feedback" : "New user")}
                            </span>
                            {item.unread && (
                              <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                New
                              </span>
                            )}
                          </span>
                          {isFeedback ? (
                            <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">
                              {item.detail}
                            </span>
                          ) : (
                            item.email && (
                              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                {item.email}
                              </span>
                            )
                          )}
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">
                            {isFeedback
                              ? `Feedback${item.labName ? ` on ${item.labName}` : ""} · ${timeAgo(item.createdAt)}`
                              : `Signed up ${timeAgo(item.createdAt)}`}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/*
        The pop-up.

        Fixed to the viewport rather than hung off the bell, because it has to
        be visible from whichever admin page the person is on — a toast that
        only appears next to a control you are not looking at is a badge with
        extra steps. It is polite about it: three at most, self-dismissing,
        dismissable, and never fired for anything that was already there when
        the page loaded.
      */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
          role="status"
          aria-live="polite"
        >
          {toasts.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-violet-500/30 bg-card shadow-2xl ring-1 ring-black/5"
            >
              <div className="flex items-start gap-3 p-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-500/15 text-violet-400">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    New feedback{item.labName ? ` on ${item.labName}` : ""}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.name?.trim() || item.email}
                  </p>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed">{item.detail}</p>
                  <Link
                    href="/admin/feedback"
                    onClick={() => setToasts((c) => c.filter((t) => t.id !== item.id))}
                    className="mt-2 inline-block text-xs font-semibold text-primary hover:underline underline-offset-4"
                  >
                    Read and reply
                  </Link>
                </div>
                <button
                  onClick={() => setToasts((c) => c.filter((t) => t.id !== item.id))}
                  aria-label="Dismiss notification"
                  className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Status and category vocabulary for lab feedback.
 *
 * A plain module rather than an export from the server actions file, which is
 * where these started and could not stay: a `"use server"` module may only
 * export async functions, so a const exported from one arrives on the client as
 * a server reference rather than an array. It fails at render with "is not
 * iterable", which points at the consumer rather than the cause — worth a
 * comment so the next person does not move them back.
 *
 * Shared by the API route that writes feedback, the admin page that triages it,
 * and the lab that sends it, so all three agree on the vocabulary.
 */

export const FEEDBACK_STATUSES = ["NEW", "TRIAGED", "ACTIONED", "DECLINED"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_CATEGORIES = ["GENERAL", "BUG", "SCIENCE", "USABILITY", "FEATURE"] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export function isFeedbackStatus(value: string): value is FeedbackStatus {
  return (FEEDBACK_STATUSES as readonly string[]).includes(value);
}

export function isFeedbackCategory(value: string): value is FeedbackCategory {
  return (FEEDBACK_CATEGORIES as readonly string[]).includes(value);
}

export const FEEDBACK_STATUS_LABEL: Record<FeedbackStatus, string> = {
  NEW: "New",
  TRIAGED: "Triaged",
  ACTIONED: "Actioned",
  DECLINED: "Declined",
};

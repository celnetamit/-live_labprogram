/**
 * Lab lifecycle and custom-lab-request vocabulary.
 *
 * `Lab.status` and `CustomLabRequest.status` are plain strings in the schema, so
 * the allowed values and their presentation live here rather than being spelled
 * out at every call site.
 */

export const LAB_STATUSES = ["ACTIVE", "UPCOMING", "MAINTENANCE", "ARCHIVED"] as const;
export type LabStatus = (typeof LAB_STATUSES)[number];

export const LAB_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  UPCOMING: "Upcoming",
  MAINTENANCE: "Maintenance",
  ARCHIVED: "Archived",
  DISABLED: "Hidden",
};

/** Text colour for a status pill. */
export function labStatusTone(status: string): string {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "text-emerald-400";
    case "UPCOMING":
      return "text-sky-400";
    case "MAINTENANCE":
      return "text-amber-400";
    case "DISABLED":
      return "text-muted-foreground";
    default:
      return "text-rose-400";
  }
}

export function isLabStatus(value: string): value is LabStatus {
  return (LAB_STATUSES as readonly string[]).includes(value);
}

/** Statuses shown on "My Labs" — what a learner can open now, plus what's coming. */
export const CATALOG_STATUSES = ["ACTIVE", "UPCOMING"] as const;

/** Statuses shown on "Explore Labs": everything except archived labs, each in
 *  its own named section. */
export const EXPLORE_STATUSES = ["ACTIVE", "UPCOMING", "MAINTENANCE"] as const;

export const CUSTOM_REQUEST_STATUSES = [
  "PENDING",
  "UNDER_REVIEW",
  "PLANNED",
  "DECLINED",
] as const;
export type CustomRequestStatus = (typeof CUSTOM_REQUEST_STATUSES)[number];

export const CUSTOM_REQUEST_LABEL: Record<string, string> = {
  PENDING: "Pending review",
  UNDER_REVIEW: "Under review",
  PLANNED: "Planned",
  DECLINED: "Declined",
};

export function customRequestTone(status: string): string {
  switch (status.toUpperCase()) {
    case "PLANNED":
      return "text-emerald-400";
    case "UNDER_REVIEW":
      return "text-sky-400";
    case "DECLINED":
      return "text-rose-400";
    default:
      return "text-amber-400";
  }
}

export function isCustomRequestStatus(value: string): value is CustomRequestStatus {
  return (CUSTOM_REQUEST_STATUSES as readonly string[]).includes(value);
}

/** "12 Sep 2026" — or null when no date is set. */
export function formatLaunchDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** `<input type="date">` wants `yyyy-mm-dd`. */
export function toDateInputValue(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

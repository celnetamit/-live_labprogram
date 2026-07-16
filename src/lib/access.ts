import prisma from "@/lib/prisma";

/**
 * Whether a user may access a lab's *full* resources (instructions, starter code,
 * launch URL). Overview data is always public.
 *
 * Rules: SUPER_ADMIN always; otherwise a non-expired LabAccess row must exist.
 */
export async function hasLabAccess(
  userId: string | undefined | null,
  role: string | undefined | null,
  labId: string
): Promise<boolean> {
  if (role === "SUPER_ADMIN") return true;
  if (!userId) return false;

  const access = await prisma.labAccess.findUnique({
    where: { userId_labId: { userId, labId } },
  });
  if (!access) return false;
  if (access.expiresAt && access.expiresAt.getTime() < Date.now()) return false;
  return true;
}

/** Set of labIds the user currently owns (non-expired). Admins own everything (return null = "all"). */
export async function ownedLabIds(
  userId: string | undefined | null,
  role: string | undefined | null
): Promise<Set<string> | null> {
  if (role === "SUPER_ADMIN") return null; // null == owns all
  if (!userId) return new Set();
  const rows = await prisma.labAccess.findMany({
    where: { userId },
    select: { labId: true, expiresAt: true },
  });
  const now = Date.now();
  return new Set(
    rows.filter((r) => !r.expiresAt || r.expiresAt.getTime() >= now).map((r) => r.labId)
  );
}

export function ownsLab(owned: Set<string> | null, labId: string): boolean {
  return owned === null || owned.has(labId);
}

/** Parse a JSON-string list column safely. */
export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const v = JSON.parse(value);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

/** Format a minor-unit price (e.g. 49900) into a display string like "₹499". */
export function formatPrice(minor: number, currency = "INR"): string {
  const major = minor / 100;
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : "";
  const formatted = major % 1 === 0 ? major.toFixed(0) : major.toFixed(2);
  return `${symbol}${Number(formatted).toLocaleString("en-IN")}`;
}

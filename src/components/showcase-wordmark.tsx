import type { LabShowcase } from "@/content/labs";

/** Letters and digits only, lower-cased: "RepurposeAI: Drug…" = "RepurposeAI Drug…". */
const bare = (s: string) => s.replace(/[^a-z0-9]/gi, "").toLowerCase();

/**
 * The split-colour wordmark, or the plain name if the two no longer spell the
 * same thing. `prefix` is the class stem, so the hero and the catalogue card
 * share the logic and keep their own styles. A `subtitle` segment is set on
 * its own line; the space before it keeps the accessible name readable
 * ("RepurposeAI Drug Discovery Lab", not "RepurposeAIDrug…").
 */
export function wordmark(showcase: Pick<LabShowcase, "title">, name: string, prefix: string) {
  if (bare(showcase.title.map((s) => s.text).join("")) !== bare(name)) return name;
  return showcase.title.map((s, i) => {
    const cls = [s.accent ? `${prefix}-${s.accent}` : "", s.subtitle ? `${prefix}-sub` : ""].filter(Boolean).join(" ");
    return (
      <span key={i}>
        {s.subtitle ? " " : null}
        <span className={cls || undefined}>{s.text}</span>
      </span>
    );
  });
}

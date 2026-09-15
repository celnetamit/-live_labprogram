/**
 * Structured data for search engines, as the Next.js JSON-LD guide recommends: a
 * plain `<script>` rather than next/script, because it is data and not code,
 * with `<` escaped so a post title containing `</script>` cannot end the tag
 * early.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

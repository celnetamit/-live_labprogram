/**
 * The public address of the hub, for everything a crawler or a social network
 * reads: canonical links, the sitemap, robots.txt, Open Graph URLs, JSON-LD and
 * the RSS feed.
 *
 * This is deliberately not NEXTAUTH_URL. That variable is an auth setting — the
 * sign-in callback already carries a workaround for it pointing at an old
 * domain — and a canonical URL on the wrong host does not merely fail: it tells
 * Google the real page is a duplicate of somewhere else. SITE_URL defaults to
 * the production domain so a deployment that never sets it still publishes
 * correct canonicals; set it only to test against a different host.
 */
export const SITE_URL = (process.env.SITE_URL || "https://live-labs.org").replace(/\/+$/, "");

export const SITE_NAME = "Panoptical Labs";

/**
 * Google Search Console ownership token for https://live-labs.org/.
 *
 * Rendered by the root layout as <meta name="google-site-verification">, so it
 * is on the home page Search Console checks and on every other page too. The
 * value is public — it appears in the served HTML by design — so it lives in
 * the repo rather than in a deploy variable, and follows SITE_URL's habit of
 * defaulting to production so a deployment that sets nothing still verifies.
 *
 * Google re-checks periodically: removing this silently un-verifies the
 * property and the Search Console data stops. Override it only when claiming
 * the property from a different account.
 */
export const GOOGLE_SITE_VERIFICATION =
  process.env.GOOGLE_SITE_VERIFICATION || "miGYa_OqZg2eAJc8yfPEq8maKN-CVrJmLiQiNuSblqs";

/** `/blog/x` → `https://live-labs.org/blog/x`. An absolute http(s) URL is returned unchanged. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

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

/** `/blog/x` → `https://live-labs.org/blog/x`. An absolute http(s) URL is returned unchanged. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

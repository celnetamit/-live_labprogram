import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Read at request time so a SITE_URL set on the deployment, not at build, is honoured.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in areas and one-time auth screens: nothing there is useful in a
      // search result, and crawling them only spends the crawl budget.
      disallow: ["/admin", "/dashboard", "/api/", "/access-denied", "/forgot-password", "/reset-password"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

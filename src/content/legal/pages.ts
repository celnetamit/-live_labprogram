/**
 * The public policy pages, in footer order. Shared by the legal page shell, the
 * contact page, the blog footer and the sitemap — kept out of the page shell so
 * the sitemap can read the list without importing any UI.
 */
export const LEGAL_PAGES = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms & Conditions" },
  { href: "/return-refund-cancellation", label: "Refunds & Cancellation" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/contact-us", label: "Contact Us" },
] as const;

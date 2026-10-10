import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { themeInitScript } from "@/components/theme-toggle";
import { Analytics } from "@/components/analytics";
import MotionProvider from "@/components/motion-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

/*
  The display face.

  The reference design sets every heading in "Elsevier Serif", which is
  licensed to them and cannot be served here. Source Serif is the closest
  open equivalent on the same axis — a transitional serif with the same
  moderate contrast, large x-height and open apertures — and it carries a
  true italic, which the hero and the feature banner both use for one
  emphasised word.
*/
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

/** Title follows the admin's platform name rather than a hard-coded string. */
export async function generateMetadata(): Promise<Metadata> {
  const { getSettings } = await import("@/lib/platformSettings");
  const { SITE_URL, GOOGLE_SITE_VERIFICATION } = await import("@/lib/site");
  const { platformName } = await getSettings();
  /*
    The description is what Google prints under the site's name, and it was
    "Centralized Program, Lab & Access Management Platform" — the internal
    description of the admin tool, not of the thing a visitor arrives at. It
    said nothing about science, experiments or laboratories, and it was
    inherited by every page that does not set its own, /register among them.

    Deliberately no `title.template`: /labs, /blog and every blog post already
    append " — Live Labs" themselves (see `TITLE_SUFFIX`), and a template
    would print it twice on each of them.
  */
  const description =
    "Run real browser-based science experiments. Choose the conditions, read the evidence, " +
    "and explain the result — with the full method, expected results and sources published " +
    "for every laboratory, free to read.";

  return {
    // Lets pages give canonical, Open Graph and share-image URLs as site paths.
    metadataBase: new URL(SITE_URL),
    title: `${platformName} — Run real experiments, analyze data, discover science`,
    description,
    applicationName: platformName,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: platformName,
      url: SITE_URL,
      title: `${platformName} — Run real experiments, analyze data, discover science`,
      description,
    },
    twitter: { card: "summary_large_image", title: platformName, description },
    // Search Console ownership. In the root layout so it is on the home page.
    verification: { google: GOOGLE_SITE_VERIFICATION },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
      The theme class is applied by the inline script below rather than being
      hard-coded here, so a stored preference is honoured. `suppressHydrationWarning`
      is required because that script mutates <html> before React hydrates.
    */
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* Must run synchronously, before first paint — otherwise the page
            paints in the default theme and then snaps to the stored one. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.variable} ${sourceSerif.variable} ${inter.className} min-h-full flex flex-col antialiased`}>
        {/*
          Skip link (WCAG 2.4.1). Every page here opens with a navbar or a
          sidebar, so a keyboard or screen-reader user otherwise tabs through
          the whole of it on every navigation before reaching the content.
          Hidden until focused, then pinned over the header.
        */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}

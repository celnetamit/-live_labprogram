import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { themeInitScript } from "@/components/theme-toggle";
import { Analytics } from "@/components/analytics";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

/** Title follows the admin's platform name rather than a hard-coded string. */
export async function generateMetadata(): Promise<Metadata> {
  const { getSettings } = await import("@/lib/platformSettings");
  const { SITE_URL, GOOGLE_SITE_VERIFICATION } = await import("@/lib/site");
  const { platformName } = await getSettings();
  return {
    // Lets pages give canonical, Open Graph and share-image URLs as site paths.
    metadataBase: new URL(SITE_URL),
    title: platformName,
    description: "Centralized Program, Lab & Access Management Platform",
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
      <body className={`${inter.className} min-h-full flex flex-col antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

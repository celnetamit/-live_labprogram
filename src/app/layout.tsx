import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { themeInitScript } from "@/components/theme-toggle";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Panoptical Labs Ecosystem",
  description: "Centralized Program, Lab & Access Management Platform",
};

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
      </body>
    </html>
  );
}

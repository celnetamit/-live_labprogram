import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import Navbar from "@/components/navbar";
import { COMPANY } from "@/content/legal/company";
import type { LegalDocument } from "@/content/legal/types";

export const LEGAL_PAGES = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms & Conditions" },
  { href: "/return-refund-cancellation", label: "Refunds & Cancellation" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/contact-us", label: "Contact Us" },
] as const;

/**
 * One shell for every legal document.
 *
 * All of these routes are public and sit outside the auth matcher in
 * `src/proxy.ts` on purpose. A payment gateway reviewer opens them signed out,
 * from an unfamiliar network, before approving the merchant account — a policy
 * behind a login is one they record as absent. Nothing here may require a
 * session or be personalised, which is also what lets these pages prerender.
 */
export default function LegalPage({
  doc,
  children,
}: {
  doc: LegalDocument;
  children?: React.ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{doc.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Last updated {doc.lastUpdated}
              {doc.version ? ` · ${doc.version}` : ""}
            </p>
            {doc.intro.map((paragraph) => (
              <p key={paragraph} className="mt-5 text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </header>

          <div className="space-y-9">
            {doc.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-semibold tracking-tight mb-3">{section.heading}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="text-muted-foreground leading-relaxed mb-3">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                {section.closing?.map((paragraph) => (
                  <p key={paragraph} className="text-muted-foreground leading-relaxed mt-3">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          {children}

          {/* A gateway checks that a customer can actually reach a human, and
              that the entity named here matches the merchant registration. */}
          <aside className="mt-12 rounded-xl border border-border bg-muted/30 p-6">
            <h2 className="font-semibold mb-1">{COMPANY.legalName}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Operator of live-labs.org, with {COMPANY.academicPartner} as an academic knowledge
              partner.
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {COMPANY.registeredAddress}
              </p>
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center gap-2 hover:text-foreground text-muted-foreground transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                {COMPANY.email}
              </a>
              <a
                href={`tel:${COMPANY.primaryPhone.replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-2 hover:text-foreground text-muted-foreground transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                {COMPANY.primaryPhone}
              </a>
            </div>
            <p className="mt-4 pt-4 border-t border-border/60 text-xs text-muted-foreground">
              CIN {COMPANY.cin} · GSTIN {COMPANY.gstin} · PAN {COMPANY.pan}
            </p>
          </aside>

          <nav className="mt-10 pt-6 border-t border-border/60 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {LEGAL_PAGES.map((page) => (
              <Link key={page.href} href={page.href} className="hover:text-foreground transition-colors">
                {page.label}
              </Link>
            ))}
          </nav>

          <p className="mt-6 text-sm text-muted-foreground">
            © {COMPANY.copyrightFrom}–{year} {COMPANY.shortName}. All rights reserved.{" "}
            <Link href="/" className="hover:text-foreground transition-colors underline">
              Back to Live Labs
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

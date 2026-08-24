import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import Navbar from "@/components/navbar";
import { COMPANY, LEGAL_LAST_UPDATED } from "@/content/legal/company";
import { PRIVACY_INTRO, PRIVACY_SECTIONS } from "@/content/legal/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Live Labs collects, uses and protects your information, and who to contact about it.",
};

/**
 * Public, and deliberately outside the auth matcher in `src/proxy.ts`.
 *
 * A payment gateway reviewer opens this URL signed out, from an unfamiliar
 * network, before approving the merchant account. A policy behind a login is a
 * policy they will record as absent — so nothing on this route may require a
 * session, and nothing on it may be personalised.
 */
export default function PrivacyPolicyPage() {
  const year = new Date().getFullYear();

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Last updated {LEGAL_LAST_UPDATED}
            </p>
            {/* Measure is capped at ~68ch below; policies are read, not skimmed. */}
            <p className="mt-6 text-muted-foreground leading-relaxed">{PRIVACY_INTRO}</p>
          </header>

          <div className="space-y-9">
            {PRIVACY_SECTIONS.map((section) => (
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
              </section>
            ))}
          </div>

          {/* The gateway checks that a customer can actually reach a human. */}
          <aside className="mt-12 rounded-xl border border-border bg-muted/30 p-6">
            <h2 className="font-semibold mb-1">{COMPANY.legalName}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Operator of live-labs.org, with {COMPANY.academicPartner} as an academic knowledge
              partner.
            </p>
            <div className="space-y-2 text-sm">
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center gap-2 hover:text-foreground text-muted-foreground transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                {COMPANY.email}
              </a>
              {COMPANY.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                  className="flex items-center gap-2 hover:text-foreground text-muted-foreground transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  {phone}
                </a>
              ))}
            </div>
          </aside>

          <p className="mt-10 pt-6 border-t border-border/60 text-sm text-muted-foreground">
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

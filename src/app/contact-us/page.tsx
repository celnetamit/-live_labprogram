import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, Building2 } from "lucide-react";
import Navbar from "@/components/navbar";
import { COMPANY } from "@/content/legal/company";
import { LEGAL_PAGES } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Registered address, statutory identifiers and support contacts for IT Break Com Private Limited, operator of Live Labs.",
};

/**
 * Public, and required.
 *
 * A payment gateway will not approve a merchant without a reachable contact
 * carrying the registered address and the statutory identifiers, and a customer
 * disputing a charge needs somewhere to write before they go to their bank.
 * Every figure here is transcribed from the operator's own published pages —
 * nothing on this route is inferred.
 */
export default function ContactPage() {
  const year = new Date().getFullYear();

  const enquiries = [
    {
      label: "Course and laboratory enrolment",
      email: COMPANY.enrolmentEmail,
      note: COMPANY.supportHours,
    },
    { label: "Refunds, cancellations and grievances", email: COMPANY.email, note: "Acknowledged within 48 hours" },
    { label: "Helpdesk and general queries", email: COMPANY.email, note: null },
    { label: "Collaborations", email: COMPANY.email, note: null },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Contact Us</h1>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Live Labs is operated by {COMPANY.legalName}, with {COMPANY.academicPartner} as an
              academic knowledge partner. Please use the information below to get in touch with us.
            </p>
          </header>

          <section className="mb-10">
            <h2 className="text-lg font-semibold tracking-tight mb-4">Registered office</h2>
            <div className="rounded-xl border border-border p-6 space-y-3 text-sm">
              <p className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                <span className="font-medium">{COMPANY.legalName}</span>
              </p>
              <p className="flex items-start gap-2.5 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {COMPANY.registeredAddress}
              </p>
              <dl className="pt-3 mt-3 border-t border-border/60 grid gap-2 sm:grid-cols-3 text-xs">
                {[
                  ["CIN", COMPANY.cin],
                  ["GSTIN", COMPANY.gstin],
                  ["PAN", COMPANY.pan],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-mono mt-0.5 break-all">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-semibold tracking-tight mb-4">Operations office</h2>
            <p className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {COMPANY.operationalAddress}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-semibold tracking-tight mb-4">Telephone</h2>
            <div className="space-y-2 text-sm">
              {COMPANY.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                  className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  {phone}
                </a>
              ))}
              <p className="flex items-center gap-2.5 text-muted-foreground pt-1">
                <Clock className="w-4 h-4 flex-shrink-0" />
                {COMPANY.supportHours}
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-semibold tracking-tight mb-4">Where to write</h2>
            <div className="rounded-xl border border-border divide-y divide-border">
              {enquiries.map((row) => (
                <div key={row.label} className="p-4 sm:flex sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{row.label}</p>
                    {row.note ? (
                      <p className="text-xs text-muted-foreground mt-0.5">{row.note}</p>
                    ) : null}
                  </div>
                  <a
                    href={`mailto:${row.email}`}
                    className="mt-1.5 sm:mt-0 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    {row.email}
                  </a>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              For a refund or cancellation, please use the subject line{" "}
              <span className="text-foreground">
                Refund / Cancellation / Service Complaint — [Order ID]
              </span>{" "}
              and include the details listed in our{" "}
              <Link href="/return-refund-cancellation" className="underline hover:text-foreground">
                Refunds &amp; Cancellation policy
              </Link>
              . The same process is available to participants worldwide; an Indian bank account,
              address or mobile number is not required to submit a complaint.
            </p>
          </section>

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

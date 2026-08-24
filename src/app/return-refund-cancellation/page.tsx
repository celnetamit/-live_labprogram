import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";
import { CHECKOUT_CONFIRMATION, REFUND_POLICY } from "@/content/legal/refund-policy";

export const metadata: Metadata = {
  title: "Refunds, Cancellation & Grievance Policy",
  description:
    "When a purchase can be refunded, how to request one, and how service-quality complaints are handled.",
};

export default function Page() {
  return (
    <LegalPage doc={REFUND_POLICY}>
      {/* The operator publishes this as a mandatory confirmation, so it is
          reproduced verbatim rather than paraphrased into the prose above. */}
      <aside className="mt-10 rounded-xl border border-border bg-accent/40 p-6">
        <h2 className="font-semibold mb-2">Mandatory Checkout Confirmation</h2>
        <p className="text-muted-foreground leading-relaxed">{CHECKOUT_CONFIRMATION}</p>
      </aside>
    </LegalPage>
  );
}

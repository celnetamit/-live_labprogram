import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";
import { DISCLAIMER } from "@/content/legal/disclaimer";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "The limits of the information, simulated results and generated commentary published on Live Labs.",
};

export default function Page() {
  return <LegalPage doc={DISCLAIMER} />;
}

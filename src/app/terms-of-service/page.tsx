import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";
import { TERMS } from "@/content/legal/terms";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "The agreement governing access to live-labs.org and the laboratories reached from it.",
};

export default function Page() {
  return <LegalPage doc={TERMS} />;
}

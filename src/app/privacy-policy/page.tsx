import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";
import { PRIVACY_POLICY } from "@/content/legal/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Live Labs collects, uses and protects your information, and who to contact about it.",
};

export default function Page() {
  return <LegalPage doc={PRIVACY_POLICY} />;
}

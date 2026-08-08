import { getSettings } from "@/lib/platformSettings";
import { mailConfigured, fromAddress } from "@/lib/mailer";
import EmailForm from "./EmailForm";

export const dynamic = "force-dynamic";

export default async function AdminEmailSettings() {
  const settings = await getSettings();
  return (
    <EmailForm
      settings={settings}
      providerConfigured={mailConfigured()}
      fromAddress={await fromAddress()}
    />
  );
}

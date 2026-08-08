import { getSettings } from "@/lib/platformSettings";
import GeneralForm from "./GeneralForm";

export const dynamic = "force-dynamic";

export default async function AdminGeneralSettings() {
  const settings = await getSettings();
  return <GeneralForm settings={settings} />;
}

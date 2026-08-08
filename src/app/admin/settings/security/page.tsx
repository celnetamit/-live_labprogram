import { getSettings } from "@/lib/platformSettings";
import SecurityForm from "./SecurityForm";

export const dynamic = "force-dynamic";

export default async function AdminSecuritySettings() {
  const settings = await getSettings();
  return <SecurityForm settings={settings} />;
}

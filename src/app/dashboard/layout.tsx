import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSettings } from "@/lib/platformSettings";
import MaintenanceNotice from "@/components/maintenance-notice";
import DashboardShell from "./DashboardShell";

/**
 * Server wrapper around the learner shell. It exists so maintenance mode has a
 * single enforcement point covering every dashboard route — the check cannot
 * live in the proxy, which runs on the edge without database access.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, settings] = await Promise.all([
    getServerSession(authOptions),
    getSettings(),
  ]);

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "SUPER_ADMIN";
  if (settings.maintenanceMode && !isAdmin) {
    return (
      <MaintenanceNotice
        message={settings.maintenanceMessage}
        supportEmail={settings.supportEmail}
        platformName={settings.platformName}
      />
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}

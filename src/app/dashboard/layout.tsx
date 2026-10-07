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

  /*
    First name only, and only when there is one to use. NextAuth's `name` is
    whatever the provider supplied, so it may be a full name, a single word or
    absent; the email local part is the fallback, and if that is not usable
    either the greeting is simply not rendered.
  */
  const user = session?.user as { name?: string | null; email?: string | null } | undefined;
  const fromName = user?.name?.trim().split(/\s+/)[0];
  const fromEmail = user?.email?.split("@")[0]?.split(/[._+-]/)[0]?.trim();
  const raw = fromName || fromEmail || "";
  const greetingName = raw
    ? raw.charAt(0).toUpperCase() + raw.slice(1)
    : null;

  return <DashboardShell greetingName={greetingName}>{children}</DashboardShell>;
}

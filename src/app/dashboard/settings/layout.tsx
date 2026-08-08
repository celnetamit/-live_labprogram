import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SettingsNav from "./SettingsNav";

/**
 * Frame shared by every settings section. Each section is its own route, so a
 * link is shareable and the browser's back button behaves — rather than one
 * page holding every panel at once.
 */
export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto p-6 pt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, preferences, and platform security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
        <SettingsNav />
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

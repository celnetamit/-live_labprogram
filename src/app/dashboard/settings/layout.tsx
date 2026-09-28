import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SettingsNav from "./SettingsNav";
import { LearnerPage, PageHeader } from "@/components/learner-page";

/**
 * Frame shared by every settings section. Each section is its own route, so a
 * link is shareable and the browser's back button behaves — rather than one
 * page holding every panel at once.
 */
export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <LearnerPage>
      <div className="mx-auto max-w-5xl pb-12">
        <PageHeader
          eyebrow={session.user.email ? `Signed in as ${session.user.email}` : "Your account"}
          title="Account Settings"
          subtitle="Manage your profile, preferences, and platform security."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr] lg:gap-8">
          <SettingsNav />
          <div className="min-w-0 space-y-6">{children}</div>
        </div>
      </div>
    </LearnerPage>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { mailConfigured } from "@/lib/mailer";
import { NOTIFICATION_DEFAULTS } from "@/lib/notifications";
import NotificationForm from "./NotificationForm";

export const dynamic = "force-dynamic";

export default async function NotificationSettingsPage() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/login");

  const saved = await prisma.notificationPreference.findUnique({
    where: { userId: sessionUser.id },
  });

  // No row yet simply means "never changed anything" — show the defaults.
  const preferences = {
    accessDecisions: saved?.accessDecisions ?? NOTIFICATION_DEFAULTS.accessDecisions,
    orderReceipts: saved?.orderReceipts ?? NOTIFICATION_DEFAULTS.orderReceipts,
    labRequestUpdates: saved?.labRequestUpdates ?? NOTIFICATION_DEFAULTS.labRequestUpdates,
    labLaunches: saved?.labLaunches ?? NOTIFICATION_DEFAULTS.labLaunches,
    productNews: saved?.productNews ?? NOTIFICATION_DEFAULTS.productNews,
  };

  return <NotificationForm preferences={preferences} mailConfigured={mailConfigured()} />;
}

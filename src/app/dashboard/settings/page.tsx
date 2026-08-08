import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileForm from "./ProfileForm";
import DangerZone from "./DangerZone";

export const dynamic = "force-dynamic";

/** Profile Details — who you are. Security lives in its own section. */
export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user) redirect("/login");

  return (
    <>
      <ProfileForm user={user} />
      <DangerZone email={user.email ?? ""} />
    </>
  );
}

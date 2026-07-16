import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { parseList } from "@/lib/access";
import DashboardClient, { type OwnedLab } from "./DashboardClient";

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; name?: string; role?: string } | undefined;
  if (!user?.id) redirect("/login");

  const isAdmin = user.role === "SUPER_ADMIN";

  const [totalLabs, accessRows] = await Promise.all([
    prisma.lab.count({ where: { enabled: true, status: "ACTIVE" } }),
    isAdmin
      ? prisma.lab.findMany({
          where: { enabled: true, status: "ACTIVE" },
          orderBy: { points: "desc" },
          take: 12,
        })
      : prisma.labAccess
          .findMany({ where: { userId: user.id }, include: { lab: true } })
          .then((rows) => rows.map((r) => r.lab)),
  ]);

  const ownedLabs: OwnedLab[] = accessRows.map((lab) => ({
    slug: lab.slug ?? lab.id,
    title: lab.name,
    subject: lab.subject ?? "General",
    difficulty: lab.difficulty ?? "Beginner",
    points: lab.points,
    sourceUrl: lab.sourceUrl,
    skills: parseList(lab.keySkills),
  }));

  const totalPoints = ownedLabs.reduce((sum, l) => sum + l.points, 0);

  return (
    <DashboardClient
      userName={user.name || "User"}
      isAdmin={isAdmin}
      ownedLabs={ownedLabs}
      totalLabs={totalLabs}
      totalPoints={totalPoints}
    />
  );
}

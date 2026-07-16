import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import UsersClient, { type AdminUser, type LabOption } from "./UsersClient";

export default async function UsersManagement() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const [users, labs] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        labAccess: { include: { lab: { select: { id: true, name: true } } } },
        orders: { where: { status: "PAID" }, select: { id: true } },
      },
    }),
    prisma.lab.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, subject: true, priceMinor: true },
    }),
  ]);

  const adminUsers: AdminUser[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    organization: u.organization,
    designation: u.designation,
    purchases: u.orders.length,
    access: u.labAccess.map((a) => ({ labId: a.labId, labName: a.lab.name, source: a.source })),
  }));

  const labOptions: LabOption[] = labs.map((l) => ({
    id: l.id,
    name: l.name,
    subject: l.subject,
    priceMinor: l.priceMinor,
  }));

  return <UsersClient users={adminUsers} labs={labOptions} />;
}

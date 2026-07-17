import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { hasLabAccess } from "@/lib/access";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  const lab = await prisma.lab.findUnique({ where: { slug } });
  if (!lab) {
    return NextResponse.json({ authorized: false, message: "Lab not found" }, { status: 404 });
  }

  const authorized = await hasLabAccess(user?.id, user?.role, lab.id);
  if (!authorized) {
    return NextResponse.json(
      { authorized: false, message: "Purchase this lab to launch it." },
      { status: 403 }
    );
  }

  const launchUrl =
    lab.sourceUrl || (lab.domainUrl && !lab.domainUrl.includes("lab.local") ? lab.domainUrl : null);

  return NextResponse.json({ authorized: true, launchUrl });
}

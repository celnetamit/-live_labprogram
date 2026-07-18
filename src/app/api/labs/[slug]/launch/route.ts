import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { hasLabAccess } from "@/lib/access";
import { generateLabToken } from "@/lib/labTokens";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; role?: string } | undefined;

  const lab = await prisma.lab.findUnique({ where: { slug } });
  if (!lab) {
    return NextResponse.json({ authorized: false, message: "Lab not found" }, { status: 404 });
  }

  const authorized = await hasLabAccess(user?.id, user?.role, lab.id);
  if (!authorized || !user?.id) {
    const errorUrl = new URL(`/dashboard/labs/${slug}`, _req.url || "http://localhost:3000");
    errorUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(errorUrl);
  }

  const baseUrl =
    lab.sourceUrl || (lab.domainUrl && !lab.domainUrl.includes("lab.local") ? lab.domainUrl : null);

  let launchUrl = baseUrl;
  if (baseUrl) {
    const token = generateLabToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role || "USER",
        labId: lab.id,
      },
      300
    );
    try {
      const u = new URL(baseUrl);
      u.searchParams.set("auth_token", token);
      launchUrl = u.toString();
    } catch {
      // If baseUrl is not a full URL with scheme, return as-is
    }
  }

  if (!launchUrl) {
    const errorUrl = new URL(`/dashboard/labs/${slug}`, _req.url || "http://localhost:3000");
    errorUrl.searchParams.set("error", "missing_url");
    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(launchUrl);
}

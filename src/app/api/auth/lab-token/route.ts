import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { generateLabToken } from "@/lib/labTokens";
import { hasLabAccess } from "@/lib/access";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; email?: string | null; role?: string } | undefined;

    if (!user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required to generate launch token." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const labIdInput = body.labId || body.labSlug;

    if (!labIdInput) {
      return NextResponse.json(
        { success: false, message: "Target lab identifier (labId or labSlug) required." },
        { status: 400 }
      );
    }

    const lab = await prisma.lab.findFirst({
      where: {
        OR: [{ id: labIdInput }, { slug: labIdInput }],
        enabled: true,
      },
    });

    if (!lab) {
      return NextResponse.json({ success: false, message: "Lab not found." }, { status: 404 });
    }

    const isAuthorized = await hasLabAccess(user.id, user.role, lab.id);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "You must purchase or unlock this lab to launch it." },
        { status: 403 }
      );
    }

    // Generate 5-minute signed launch token
    const token = generateLabToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role || "USER",
        labId: lab.id,
      },
      300 // 300 seconds TTL
    );

    const baseUrl =
      lab.sourceUrl ||
      (lab.domainUrl && !lab.domainUrl.includes("lab.local") ? lab.domainUrl : null);

    let launchUrl = baseUrl;
    if (baseUrl) {
      const u = new URL(baseUrl);
      u.searchParams.set("auth_token", token);
      launchUrl = u.toString();
    }

    return NextResponse.json({
      success: true,
      token,
      launchUrl,
      expiresIn: 300,
    });
  } catch (err) {
    console.error("Error generating lab token:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

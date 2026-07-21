import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { generateLabToken } from "@/lib/labTokens";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; email?: string | null; role?: string } | undefined;

    if (!user?.id) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { callbackUrl } = await req.json();
    if (!callbackUrl) {
      return NextResponse.json({ success: false, message: "No callback URL" }, { status: 400 });
    }

    let urlObj;
    try {
      urlObj = new URL(callbackUrl);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid callback URL" }, { status: 400 });
    }

    const origin = urlObj.origin;

    // Search for a lab that matches this origin
    const lab = await prisma.lab.findFirst({
      where: {
        OR: [
          { domainUrl: origin },
          { domainUrl: origin + "/" },
          { sourceUrl: origin },
          { sourceUrl: origin + "/" },
        ],
        enabled: true,
      },
    });

    if (!lab) {
      return NextResponse.json({ success: false, message: "No lab found for this domain" }, { status: 404 });
    }

    // Generate launch token
    const token = generateLabToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role || "USER",
        labId: lab.id,
      },
      300
    );

    // Construct redirect URL
    const baseUrl = lab.sourceUrl || (lab.domainUrl && !lab.domainUrl.includes("lab.local") ? lab.domainUrl : null);
    let launchUrl = baseUrl;
    if (baseUrl) {
      const u = new URL(baseUrl);
      u.searchParams.set("auth_token", token);
      launchUrl = u.toString();
    }

    return NextResponse.json({ success: true, launchUrl });
  } catch (error) {
    console.error("Error resolving callback:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

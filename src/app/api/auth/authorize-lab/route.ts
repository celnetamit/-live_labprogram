import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyLabToken } from "@/lib/labTokens";
import { decode } from "next-auth/jwt";
import { hasLabAccess } from "@/lib/access";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
const SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev_only";

export async function POST(req: Request) {
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    const tokenString = body.token || bearerToken;
    let labIdInput = body.labId || body.labSlug;
    const domainUrlInput = body.domainUrl || req.headers.get("origin") || req.headers.get("referer");

    if (!tokenString) {
      await logAttempt({
        labId: labIdInput || "unknown",
        status: "FAILED_INVALID_TOKEN",
        reason: "No authentication token provided",
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        {
          authorized: false,
          status: "FAILED_INVALID_TOKEN",
          message: "Authentication required. Please sign in to access this lab.",
          loginUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login`,
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // 1. Verify custom HMAC launch token or NextAuth JWT token
    let userId: string | null = null;
    // Extract the signature of the token to track uniqueness
    let tokenSignature = typeof tokenString === "string" && tokenString.includes(".") 
      ? tokenString.split(".")[1] 
      : (typeof tokenString === "string" ? tokenString.slice(0, 15) : null);

    // Check if this exact token was already used successfully more than 10 seconds ago
    if (tokenSignature) {
      const priorSuccess = await prisma.authorizationLog.findFirst({
        where: {
          tokenPrefix: tokenSignature,
          status: "SUCCESS",
        },
        orderBy: { createdAt: "asc" }
      });

      if (priorSuccess) {
        const secondsSinceFirstUse = (Date.now() - priorSuccess.createdAt.getTime()) / 1000;
        if (secondsSinceFirstUse > 10) {
          await logAttempt({
            labId: labIdInput || "unknown",
            tokenPrefix: tokenSignature,
            status: "FAILED_INVALID_TOKEN",
            reason: "Token has already been used",
            ipAddress,
            userAgent,
          });
          return NextResponse.json(
            {
              authorized: false,
              status: "FAILED_INVALID_TOKEN",
              message: "This launch link has already been used. Please launch the lab again from the dashboard.",
              loginUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login`,
            },
            { status: 403, headers: corsHeaders }
          );
        }
      }
    }

    const launchPayload = verifyLabToken(tokenString);
    if (launchPayload?.userId) {
      userId = launchPayload.userId;
      if (launchPayload.labId) {
        labIdInput = launchPayload.labId;
      }
    } else {
      // Try decoding as NextAuth JWT session cookie
      try {
        const decoded = await decode({ token: tokenString, secret: SECRET });
        if (decoded?.id || decoded?.sub) {
          userId = (decoded.id || decoded.sub) as string;
        }
      } catch {
        // Not a valid NextAuth session token
      }
    }

    if (!userId) {
      await logAttempt({
        labId: labIdInput || "unknown",
        tokenPrefix: tokenSignature,
        status: "FAILED_INVALID_TOKEN",
        reason: "Token signature invalid or expired",
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        {
          authorized: false,
          status: "FAILED_INVALID_TOKEN",
          message: "Authentication token is invalid or expired. Please sign in again.",
          loginUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login`,
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // 2. Look up User status
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status !== "ACTIVE") {
      await logAttempt({
        userId,
        userEmail: user?.email || undefined,
        labId: labIdInput || "unknown",
        tokenPrefix: tokenSignature,
        status: "FAILED_INACTIVE_USER",
        reason: "User account not found or status revoked/inactive",
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        {
          authorized: false,
          status: "FAILED_INACTIVE_USER",
          message: "User account is inactive or revoked.",
          loginUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login`,
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // 3. Look up Target Lab
    if (!labIdInput && !domainUrlInput) {
      await logAttempt({
        userId: user.id,
        userEmail: user.email || undefined,
        labId: "unknown",
        tokenPrefix: tokenSignature,
        status: "FAILED_UNAUTHORIZED",
        reason: "Missing labId or domainUrl identifier in request",
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        {
          authorized: false,
          status: "FAILED_UNAUTHORIZED",
          message: "No target lab specified.",
          loginUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login`,
        },
        { status: 403, headers: corsHeaders }
      );
    }

    const labConditions: any[] = [];
    if (labIdInput) {
      labConditions.push({ id: labIdInput });
      labConditions.push({ slug: labIdInput });
    }
    if (domainUrlInput) {
      // Clean domain URL (strip path if passed)
      try {
        const u = new URL(domainUrlInput);
        const originUrl = u.origin + u.pathname;
        labConditions.push({ domainUrl: originUrl });
        labConditions.push({ domainUrl: u.origin });
      } catch {
        labConditions.push({ domainUrl: domainUrlInput });
      }
    }

    const lab = await prisma.lab.findFirst({
      where: {
        OR: labConditions,
        enabled: true,
      },
    });

    if (!lab) {
      await logAttempt({
        userId: user.id,
        userEmail: user.email || undefined,
        labId: labIdInput || "unknown",
        tokenPrefix: tokenSignature,
        status: "FAILED_UNAUTHORIZED",
        reason: `Lab identifier ${labIdInput || domainUrlInput} not found or disabled`,
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        {
          authorized: false,
          status: "FAILED_UNAUTHORIZED",
          message: "Requested lab not found or disabled.",
          loginUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login`,
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // 4. Check user_lab_access / authorization rules via hasLabAccess()
    const isAuthorized = await hasLabAccess(user.id, user.role, lab.id);
    if (!isAuthorized) {
      await logAttempt({
        userId: user.id,
        userEmail: user.email || undefined,
        labId: lab.id,
        labSlug: lab.slug || undefined,
        tokenPrefix: tokenSignature,
        status: "FAILED_UNAUTHORIZED",
        reason: `User ${user.email} (${user.role}) is not assigned to lab ${lab.name}`,
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        {
          authorized: false,
          status: "FAILED_UNAUTHORIZED",
          message: "You are not authorized to access this lab.",
          loginUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login`,
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // 5. Authorized! Log success and return 200 OK with user & lab info
    await logAttempt({
      userId: user.id,
      userEmail: user.email || undefined,
      labId: lab.id,
      labSlug: lab.slug || undefined,
      tokenPrefix: tokenSignature,
      status: "SUCCESS",
      reason: "Access granted",
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      {
        authorized: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        lab: {
          id: lab.id,
          slug: lab.slug,
          name: lab.name,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("Error in authorize-lab API:", err);
    return NextResponse.json(
      { authorized: false, message: "Internal server error during authorization verification." },
      { status: 500, headers: corsHeaders }
    );
  }
}

async function logAttempt(data: {
  userId?: string;
  userEmail?: string;
  labId: string;
  labSlug?: string;
  tokenPrefix?: string | null;
  status: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.authorizationLog.create({
      data: {
        userId: data.userId || null,
        userEmail: data.userEmail || null,
        labId: data.labId,
        labSlug: data.labSlug || null,
        tokenPrefix: data.tokenPrefix || null,
        status: data.status,
        reason: data.reason || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
  } catch (err) {
    // Prevent logging failure from crashing request
    console.error("Failed to write AuthorizationLog:", err);
  }
}

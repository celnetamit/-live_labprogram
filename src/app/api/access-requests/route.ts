import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  
  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { labId } = body;

    if (!labId) {
      return NextResponse.json({ message: "labId is required" }, { status: 400 });
    }

    const lab = await prisma.lab.findUnique({ where: { id: labId } });
    if (!lab || !lab.enabled) {
      return NextResponse.json({ message: "Lab not found or disabled" }, { status: 404 });
    }

    // Check if user already has access
    const existingAccess = await prisma.labAccess.findUnique({
      where: { userId_labId: { userId: user.id, labId } },
    });

    if (existingAccess) {
      return NextResponse.json({ message: "You already have access to this lab" }, { status: 409 });
    }

    // Check if a pending request already exists
    const existingRequest = await prisma.accessRequest.findFirst({
      where: {
        userId: user.id,
        labId: labId,
        status: "PENDING"
      }
    });

    if (existingRequest) {
      return NextResponse.json({ message: "You already have a pending request for this lab" }, { status: 409 });
    }

    // Create the access request
    const request = await prisma.accessRequest.create({
      data: {
        userId: user.id,
        labId: labId,
        status: "PENDING"
      }
    });

    return NextResponse.json({
      message: "Access request submitted successfully",
      requestId: request.id
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating access request:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

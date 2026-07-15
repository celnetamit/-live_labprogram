import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { labId } = await req.json();

    if (!labId) {
      return NextResponse.json({ message: "Lab ID is required" }, { status: 400 });
    }

    // Check if a request already exists
    const existingRequest = await prisma.accessRequest.findFirst({
      where: {
        userId: user.id,
        labId: labId,
        status: "PENDING",
      }
    });

    if (existingRequest) {
      return NextResponse.json({ message: "Request already pending" }, { status: 400 });
    }

    // Create the request
    const request = await prisma.accessRequest.create({
      data: {
        userId: user.id,
        labId: labId,
      }
    });

    return NextResponse.json({ message: "Access requested successfully", request }, { status: 201 });
  } catch (error) {
    console.error("Access request error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

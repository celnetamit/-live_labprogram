import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/** The signed-in user's enrolled devices. */
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const credentials = await prisma.authenticator.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, label: true, deviceType: true, backedUp: true, createdAt: true, lastUsedAt: true },
  });

  return NextResponse.json({ credentials });
}

/** Remove a device. Scoped to the owner, so an id alone is not enough. */
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ message: "id is required" }, { status: 400 });

  const deleted = await prisma.authenticator.deleteMany({
    where: { id, userId: user.id },
  });
  if (deleted.count === 0) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ removed: true });
}

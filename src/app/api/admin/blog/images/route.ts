import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { readImageMeta } from "@/lib/imageMeta";
import prisma from "@/lib/prisma";

/**
 * Upload an image from the blog editor.
 *
 * A route handler rather than a server action: server actions cap their request
 * body at 1 MB, which a photograph passes without trying.
 *
 * The editor shrinks and re-encodes pictures in the browser before sending
 * them, so what arrives here is usually a couple of hundred kilobytes. The
 * limits below still assume it did not — anyone with the admin session can post
 * straight to this URL.
 */

export const runtime = "nodejs";

/** Comfortably above anything the browser-side resize produces. */
const MAX_BYTES = 6 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "You are not signed in as an administrator." }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file was sent." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_BYTES / 1024 / 1024} MB.` },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  /*
   * The format is read out of the file's own header, not taken from the
   * browser's `type`, which is a guess from the file extension. An SVG is
   * refused on purpose: it can carry script, and one served from this origin
   * would run with access to the reader's session.
   */
  const meta = readImageMeta(bytes);
  if (!meta) {
    return NextResponse.json(
      { error: "That file is not a PNG, JPEG, WebP or GIF. SVG files are not accepted." },
      { status: 415 },
    );
  }

  // The content hash is the id, so the same picture uploaded twice is stored
  // once and its URL never points at different bytes.
  const id = createHash("sha256").update(bytes).digest("hex");
  const filename = (typeof file.name === "string" ? file.name : "").slice(0, 200);

  const existing = await prisma.blogImage.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    try {
      await prisma.blogImage.create({
        data: {
          id,
          mimeType: meta.mimeType,
          data: Buffer.from(bytes),
          width: meta.width,
          height: meta.height,
          size: bytes.byteLength,
          filename,
          createdBy: user.id ?? null,
        },
      });
    } catch (error) {
      // Two uploads of the same picture at once: the row the second one would
      // have written already exists, which is the outcome it wanted anyway.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
    }
  }

  return NextResponse.json({
    url: `/blog/image/${id}`,
    width: meta.width,
    height: meta.height,
    size: bytes.byteLength,
    mimeType: meta.mimeType,
    reused: Boolean(existing),
  });
}

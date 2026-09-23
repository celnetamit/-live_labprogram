import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Serve an image uploaded from the blog editor.
 *
 * Public, because these appear inside published posts. An image belonging to a
 * draft is reachable by anyone holding its URL, but that URL is the SHA-256 of
 * the file, so holding it means having been given it.
 *
 * The id being the content hash also means the bytes at a URL can never change,
 * which is what makes the immutable cache header below true rather than merely
 * convenient: browsers and any proxy in front of this keep it for a year and
 * stop asking.
 */

export const runtime = "nodejs";

const HASH = /^[0-9a-f]{64}$/;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!HASH.test(id)) return new NextResponse("Not found", { status: 404 });

  const etag = `"${id}"`;
  // Nothing at this URL can have changed, so a conditional request is always a
  // 304 — answer it without reading the bytes out of the database.
  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag, "Cache-Control": CACHE } });
  }

  const image = await prisma.blogImage.findUnique({
    where: { id },
    select: { data: true, mimeType: true },
  });
  if (!image) return new NextResponse("Not found", { status: 404 });

  const body = new Uint8Array(image.data);
  return new NextResponse(body, {
    headers: {
      "Content-Type": image.mimeType,
      "Content-Length": String(body.byteLength),
      "Cache-Control": CACHE,
      ETag: etag,
      // The type is read from the file's own header at upload, so serving it
      // with sniffing off means it can only ever be treated as that type.
      "X-Content-Type-Options": "nosniff",
    },
  });
}

const CACHE = "public, max-age=31536000, immutable";

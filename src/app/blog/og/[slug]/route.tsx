import { ImageResponse } from "next/og";
import { truncate } from "@/lib/blog";
import prisma from "@/lib/prisma";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * The share card for a post without a cover image: what LinkedIn, X, WhatsApp
 * and Slack show when the link is pasted. A link with no image is shown as a
 * bare line of text and is clicked far less.
 *
 * Satori, which draws this, supports neither `oklch()` nor CSS variables, so
 * the brand colours from globals.css are written out here as hex.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, status: true, lab: { select: { name: true, enabled: true } } },
  });
  if (!post || post.status !== "PUBLISHED") return new Response("Not found", { status: 404 });

  const title = truncate(post.title, 110);
  const lab = post.lab?.enabled ? post.lab.name : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#ffffff",
          background: "linear-gradient(135deg, #0d1025 0%, #1c1d52 55%, #083c4d 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
              background: "linear-gradient(110deg, #5b45e6, #1a8fe3)",
            }}
          >
            P
          </div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {lab ? <div style={{ display: "flex", fontSize: 30, color: "#5fd4e6" }}>{lab}</div> : null}
          <div style={{ display: "flex", fontSize: title.length > 70 ? 54 : 66, fontWeight: 700, lineHeight: 1.12 }}>
            {title}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#aab4ff" }}>{new URL(SITE_URL).host}/blog</div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}

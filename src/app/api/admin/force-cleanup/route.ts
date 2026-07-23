import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const keepSlugs = ["cognicore-ai", "denovo-genai-lab", "ai-6g", "fraudshield"];
    
    // Force update the correct URLs for the valid labs
    await prisma.lab.updateMany({
      where: { slug: "cognicore-ai" },
      data: {
        domainUrl: "https://cognicore.live-labs.org/",
        sourceUrl: "https://cognicore.live-labs.org/"
      }
    });

    await prisma.lab.updateMany({
      where: { slug: "denovo-genai-lab" },
      data: {
        domainUrl: "https://denovo.live-labs.org/",
        sourceUrl: "https://denovo.live-labs.org/"
      }
    });

    await prisma.lab.updateMany({
      where: { slug: "ai-6g" },
      data: {
        domainUrl: "https://ai6g.live-labs.org/",
        sourceUrl: "https://ai6g.live-labs.org/"
      }
    });

    await prisma.lab.updateMany({
      where: { slug: "fraudshield" },
      data: {
        domainUrl: "https://fraudshield.live-labs.org/",
        sourceUrl: "https://fraudshield.live-labs.org/"
      }
    });

    // Delete all other labs
    const deleted = await prisma.lab.deleteMany({
      where: {
        slug: { notIn: keepSlugs }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${deleted.count} old labs and updated URLs to live-labs.org!`,
      kept: keepSlugs
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

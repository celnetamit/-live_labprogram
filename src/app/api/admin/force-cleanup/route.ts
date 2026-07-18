import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const keepSlugs = ["cognicore-ai", "denovo-genai-lab"];
    
    // Force update the correct URLs for the 2 valid labs
    await prisma.lab.updateMany({
      where: { slug: "cognicore-ai" },
      data: {
        domainUrl: "https://cognicore.celnet.in/",
        sourceUrl: "https://cognicore.celnet.in/"
      }
    });

    await prisma.lab.updateMany({
      where: { slug: "denovo-genai-lab" },
      data: {
        domainUrl: "https://denovo.celnet.in/",
        sourceUrl: "https://denovo.celnet.in/"
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
      message: `Successfully deleted ${deleted.count} old labs and updated URLs to celnet.in!`,
      kept: keepSlugs
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

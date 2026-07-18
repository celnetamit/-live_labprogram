import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const keepSlugs = ["cognicore-ai", "denovo-genai-lab"];
    const deleted = await prisma.lab.deleteMany({
      where: {
        slug: { notIn: keepSlugs }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${deleted.count} old labs!`,
      kept: keepSlugs
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const email = "admin@panoptical.com";
    const passwordRaw = "Admin@12345";
    const password = await bcrypt.hash(passwordRaw, 10);
    
    await prisma.user.upsert({
      where: { email },
      update: { password, role: "SUPER_ADMIN", status: "ACTIVE" },
      create: {
        email,
        name: "Admin",
        password,
        role: "SUPER_ADMIN",
        status: "ACTIVE"
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Admin created successfully! Please login with these credentials.",
      credentials: {
        email,
        password: passwordRaw
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

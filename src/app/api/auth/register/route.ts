import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Make the first user an admin for demo purposes if no users exist, 
        // otherwise a regular user.
        role: (await prisma.user.count()) === 0 ? "SUPER_ADMIN" : "USER",
      },
    });

    // Automatically grant access to all current labs for the new user
    const allLabs = await prisma.lab.findMany({
      where: { enabled: true }
    });
    
    if (allLabs.length > 0) {
      await prisma.labAccess.createMany({
        data: allLabs.map(lab => ({
          userId: user.id,
          labId: lab.id,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

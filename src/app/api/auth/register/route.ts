import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSettings } from "@/lib/platformSettings";
import { dispatchWebhook } from "@/lib/webhooks";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    const settings = await getSettings();

    // Closing registration has to hold at the API, not just on the page.
    if (!settings.allowPublicRegistration) {
      return NextResponse.json(
        { message: "Registration is currently closed. Contact your administrator for an invite." },
        { status: 403 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (String(password).length < settings.minPasswordLength) {
      return NextResponse.json(
        { message: `Password must be at least ${settings.minPasswordLength} characters` },
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

    /*
      A new account starts with no labs. Registration used to hand out every
      enabled lab, which gave paid content away to anyone who signed up; access
      now comes only from a purchase or an admin grant, the same two sources
      `hasLabAccess` has always recognised.
    */

    await dispatchWebhook("user.registered", {
      userId: user.id,
      email: user.email,
      name: user.name,
    });

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

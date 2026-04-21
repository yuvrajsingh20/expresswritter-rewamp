import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { dispatchNotification } from "@/lib/notifications";

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "STUDENT"
      }
    });

    // Generate Verification Token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    });

    // Send Verification Email via Smart Dispatcher
    // In Dev: Sends instantly to avoid BullMQ/Mock-Redis Lua errors
    // In Prod: Adds to background queue
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;
    
    await dispatchNotification('verification', {
      email: user.email,
      name: user.name,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e4e8; border-radius: 12px;">
          <h1 style="color: #0a192f; margin-bottom: 24px;">Confirm your email</h1>
          <p style="color: #4a5568; line-height: 1.6;">Hello ${user.name}, thanks for joining Express Writer. Please click the button below to verify your account:</p>
          <div style="margin: 32px 0;">
            <a href="${verificationUrl}" style="background-color: #0a192f; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="color: #a0aec0; font-size: 14px;">This link will expire in 1 hour.</p>
        </div>
      `
    });

    // Don't return password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

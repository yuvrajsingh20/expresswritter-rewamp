import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { dispatchNotification } from "@/lib/notifications";
import { isRateLimited } from "@/lib/rateLimit";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "SUB_ADMIN", "FREELANCER", "STUDENT"]).optional(),
  writerProfile: z.any().optional(),
});

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    
    if (isRateLimited(ip)) {
      return NextResponse.json({ message: 'Too many attempts, try again later' }, { status: 429 });
    }

    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => issue.message).join(", ");
      return NextResponse.json({ message: errorMessages }, { status: 400 });
    }

    const { name, email, password, role, writerProfile } = result.data;

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
        role: role || "STUDENT",
        ...(role === "FREELANCER" && writerProfile ? {
          freelancerProfile: {
            create: {
              bio: writerProfile.bio,
              experience: parseInt(writerProfile.experience) || 0,
              education: writerProfile.education,
              resumeUrl: writerProfile.resumeUrl,
              photoUrl: writerProfile.photoUrl,
              linkedinUrl: writerProfile.linkedinUrl,
              country: writerProfile.country,
              currency: writerProfile.currency || "USD",
              skills: [writerProfile.domainId], // Default skill from domain
              isVerified: false
            }
          }
        } : {})
      },
      include: {
        freelancerProfile: true
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
    
    try {
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
    } catch (mailError) {
      console.warn("⚠️ Non-fatal: Failed to send verification email:", mailError.message);
    }

    // Don't return password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

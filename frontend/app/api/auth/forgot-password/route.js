import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { dispatchNotification } from "@/lib/notifications";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    
    if (isRateLimited(ip)) {
      return NextResponse.json({ message: 'Too many attempts, try again later' }, { status: 429 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({ message: "If an account exists, an OTP has been sent." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 600000); // 10 minutes

    // Delete existing tokens for this identifier to avoid clutter
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires
      }
    });

    // Send email
    await dispatchNotification('forgot-password', {
      email,
      name: user.name || 'User',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e4e8; border-radius: 12px;">
          <h1 style="color: #0a192f; margin-bottom: 24px;">Reset Your Password</h1>
          <p style="color: #4a5568; line-height: 1.6;">Hello ${user.name || 'User'},</p>
          <p style="color: #4a5568; line-height: 1.6;">You requested to reset your password. Use the following 6-digit code to proceed:</p>
          <div style="margin: 32px 0; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #0a192f; text-align: center;">
            ${otp}
          </div>
          <p style="color: #a0aec0; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #a0aec0; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

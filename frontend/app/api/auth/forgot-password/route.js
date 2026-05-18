import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rateLimit";
import { safeSendEmail, passwordResetHtml } from "@/lib/emails";

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
      // Security: don't reveal whether account exists
      return NextResponse.json({ message: "If an account exists, an OTP has been sent." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 600000); // 10 min

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: otp, expires },
    });

    await safeSendEmail({
      to:      email,
      subject: '🔐 Your Express Writer Password Reset Code',
      html:    passwordResetHtml({ name: user.name || 'User', otp }),
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

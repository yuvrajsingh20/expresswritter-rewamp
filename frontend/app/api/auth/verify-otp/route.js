import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: otp
      }
    });

    if (!verificationToken) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (verificationToken.expires < new Date()) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    return NextResponse.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

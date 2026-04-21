import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=InvalidToken`);
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=TokenExpired`);
    }

    // Mark email as verified
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() }
    });

    // Delete the token
    await prisma.verificationToken.delete({
      where: { token }
    });

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?verified=true`);
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=VerificationFailed`);
  }
}

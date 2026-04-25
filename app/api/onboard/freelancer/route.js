import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "FREELANCER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bio, skills, experience, portfolioUrl } = await req.json();

    if (!skills || skills.length === 0) {
      return NextResponse.json({ message: "Skills are required" }, { status: 400 });
    }

    const profile = await prisma.freelancerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        bio,
        skills,
        experience: parseInt(experience),
        portfolioUrl,
      },
      create: {
        userId: session.user.id,
        bio,
        skills,
        experience: parseInt(experience),
        portfolioUrl,
      },
    });

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error("Freelancer onboarding error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

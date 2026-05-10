import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bio, skills, experience, portfolioUrl, age, gender, linkedinUrl, name, phone } = await req.json();

    if (!skills || skills.length === 0) {
      return NextResponse.json({ message: "Skills are required" }, { status: 400 });
    }

    // Update User info and role
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: "FREELANCER",
        name: name || undefined,
        phone: phone || undefined,
      },
    });

    const profile = await prisma.freelancerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        bio,
        skills,
        experience: experience ? parseInt(experience) : undefined,
        portfolioUrl,
        age: age ? parseInt(age) : undefined,
        gender,
        linkedinUrl,
        isVerified: false, // Ensure it's false or pending
      },
      create: {
        userId: session.user.id,
        bio,
        skills,
        experience: experience ? parseInt(experience) : undefined,
        portfolioUrl,
        age: age ? parseInt(age) : undefined,
        gender,
        linkedinUrl,
        isVerified: false,
      },
    });

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error("Freelancer onboarding error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

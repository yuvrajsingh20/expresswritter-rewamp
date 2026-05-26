import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { dispatchNotification } from "@/lib/notifications";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { 
      firstName, lastName, title, email, country, bio, education, language,
      skills, experience, credentials, files, portfolioUrl, sample, rate, rushRate, availability, fastestTurn, aadharFile 
    } = await req.json();

    if (!skills || skills.length === 0) {
      return NextResponse.json({ message: "Skills are required" }, { status: 400 });
    }

    const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName;

    // Update User info and role
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: "FREELANCER",
        name: fullName || undefined,
      },
    });

    const expInt = experience ? (isNaN(parseInt(experience)) ? undefined : parseInt(experience)) : undefined;

    const profileData = {
      bio,
      skills,
      experience: expInt,
      education,
      country,
      title,
      language,
      credentials,
      sample,
      rate: rate ? parseFloat(rate) : undefined,
      rushRate,
      availabilityType: availability,
      fastestTurn,
      portfolioUrl,
      portfolioFiles: files ? JSON.stringify(files) : undefined,
      aadharUrl: aadharFile?.url,
      kycDone: false,
      isVerified: false,
    };

    const profile = await prisma.freelancerProfile.upsert({
      where: { userId: session.user.id },
      update: profileData,
      create: {
        userId: session.user.id,
        ...profileData
      },
    });

    try {
      await dispatchNotification('email', {
        email: process.env.ADMIN_EMAIL || 'admin@xpresswriters.com',
        subject: `New Writer Application: ${fullName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e4e8; border-radius: 12px;">
            <h2 style="color: #0d9488;">New Writer Onboarding Complete</h2>
            <p>A new writer has completed their onboarding profile and is awaiting review.</p>
            <ul style="line-height: 1.6; color: #4a5568;">
              <li><strong>Name:</strong> ${fullName}</li>
              <li><strong>Email:</strong> ${email || session.user.email}</li>
              <li><strong>Title/Expertise:</strong> ${title || 'N/A'}</li>
              <li><strong>Rate:</strong> $${rate} / 100 words</li>
              <li><strong>Country:</strong> ${country || 'N/A'}</li>
            </ul>
            <p style="margin-top: 20px;">Please log in to the admin dashboard to review their credentials, sample, and approve their application.</p>
          </div>
        `
      });
    } catch (mailError) {
      console.warn("⚠️ Non-fatal: Failed to send admin notification email:", mailError.message);
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error("Freelancer onboarding error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

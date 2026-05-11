import { NextResponse } from "next/server";
import { authOptions, getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        occupation: true,
        college: true,
        profileCompleted: true,
        freelancerProfile: true,
      },
    });

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { phone, occupation, college, name, country, currency } = body;

    const updatedUser = await prisma.user.update({
      where: { email: user.email },
      data: {
        name,
        phone,
        occupation,
        college,
        profileCompleted: true,
        ...(user.role === 'FREELANCER' ? {
          freelancerProfile: {
            update: {
              country,
              currency
            }
          }
        } : {})
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { authOptions, getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  phone: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  college: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
});

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
    const result = profileSchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => issue.message).join(", ");
      return NextResponse.json({ message: errorMessages }, { status: 400 });
    }

    const { phone, occupation, college, name, country, currency } = result.data;

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

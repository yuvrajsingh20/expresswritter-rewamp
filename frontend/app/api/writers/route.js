import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await prisma.user.count({ where: { role: "FREELANCER" } });
    
    if (count === 0) {
      // Seed some mock freelancers if none exist
      await prisma.user.create({
        data: {
          name: "Dr. Amara Singh",
          email: "amara@example.com",
          role: "FREELANCER",
          freelancerProfile: {
            create: {
              bio: "Expert in academic and SOP writing.",
              skills: ["Academic & SOP", "LOR"],
              rating: 4.97,
              totalProjects: 312,
              isVerified: true,
              availability: true,
            }
          }
        }
      });
      
      await prisma.user.create({
        data: {
          name: "James Whitfield",
          email: "james@example.com",
          role: "FREELANCER",
          freelancerProfile: {
            create: {
              bio: "Resume and career writing specialist.",
              skills: ["Resume & Career", "LinkedIn"],
              rating: 4.95,
              totalProjects: 487,
              isVerified: true,
              availability: true,
            }
          }
        }
      });
    }

    const writers = await prisma.user.findMany({
      where: { role: "FREELANCER" },
      include: {
        freelancerProfile: true,
      },
    });

    // Map to match frontend expectations
    const mappedWriters = writers.map(w => {
      const profile = w.freelancerProfile;
      return {
        id: w.id,
        name: w.name,
        avatar: w.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'W',
        specialty: profile?.skills?.[0] || 'Writer',
        rating: profile?.rating || 5.0,
        reviews: profile?.totalProjects || 0,
        badge: profile?.isVerified ? 'Top Writer' : 'Rising Star',
        price: 15, // Default mock price
        online: profile?.availability || false,
      };
    });

    return NextResponse.json(mappedWriters);
  } catch (error) {
    console.error("Failed to fetch writers:", error);
    return NextResponse.json({ error: "Failed to fetch writers" }, { status: 500 });
  }
}

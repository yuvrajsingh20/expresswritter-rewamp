import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = params;
    const { freelancerId } = await req.json();

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        freelancerId: freelancerId,
        status: 'ASSIGNED'
      }
    });

    // Create a log entry
    await prisma.projectLog.create({
      data: {
        action: `Project assigned to freelancer ${freelancerId}`,
        projectId: projectId,
        userId: session.user.id
      }
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Assignment error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

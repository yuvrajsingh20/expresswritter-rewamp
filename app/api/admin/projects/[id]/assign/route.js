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

    const { id: projectId } = await params;
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

    // Inject Join Message into Chat
    try {
      const freelancer = await prisma.user.findUnique({ where: { id: freelancerId }, select: { name: true } });
      await prisma.message.create({
        data: {
          content: `📢 Specialist ${freelancer.name} has joined the chat and is now leading your project.`,
          projectId: projectId,
          senderId: session.user.id, // Admin as sender for now, or use isSystem if generated
          chatType: 'CLIENT_CHAT'
        }
      });
    } catch (msgErr) {
      console.warn("Could not inject join message:", msgErr);
    }

    const result = await prisma.project.findUnique({
      where: { id: projectId },
      include: { freelancer: { select: { id: true, name: true } } }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Assignment error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

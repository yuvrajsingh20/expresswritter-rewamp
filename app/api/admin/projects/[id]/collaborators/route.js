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
    const { freelancerId, action } = await req.json(); // action: 'ADD' or 'REMOVE'

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { collaboratorIds: true }
    });

    let newCollaboratorIds = [...(project.collaboratorIds || [])];

    if (action === 'ADD') {
      if (!newCollaboratorIds.includes(freelancerId)) {
        newCollaboratorIds.push(freelancerId);
      }
    } else if (action === 'REMOVE') {
      newCollaboratorIds = newCollaboratorIds.filter(id => id !== freelancerId);
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        collaboratorIds: newCollaboratorIds
      },
      include: {
        collaborators: { select: { id: true, name: true } },
        freelancer: { select: { id: true, name: true } }
      }
    });

    // Log the change
    await prisma.projectLog.create({
      data: {
        action: `${action === 'ADD' ? 'Added' : 'Removed'} collaborator ${freelancerId}`,
        projectId: projectId,
        userId: session.user.id
      }
    });

    // Inject Join/Leave Message into Chat
    try {
      const freelancer = await prisma.user.findUnique({ where: { id: freelancerId }, select: { name: true } });
      await prisma.message.create({
        data: {
          content: action === 'ADD' 
            ? `📢 Specialist ${freelancer.name} has joined the team to collaborate on this node.` 
            : `📢 Specialist ${freelancer.name} has left the collaboration stream.`,
          projectId: projectId,
          senderId: session.user.id,
          chatType: 'CLIENT_CHAT'
        }
      });
    } catch (msgErr) {
      console.warn("Could not inject collab message:", msgErr);
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Collaborator update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

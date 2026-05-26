import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { checkPermission } from "@/lib/auth-guards";

export async function POST(req, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !checkPermission(authUser, 'order:assign_writer')) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
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
        userId: authUser.id
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
          senderId: authUser.id,
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

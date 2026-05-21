import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notify";
import {
  safeSendEmail,
  writerAssignedStudentHtml,
  writerAssignedWriterHtml,
} from "@/lib/emails";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const { freelancerId } = await req.json();

    // Fetch project + student before update
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });
    if (!project) return NextResponse.json({ message: "Project not found" }, { status: 404 });

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { freelancerId, status: 'ASSIGNED' },
    });

    await prisma.projectLog.create({
      data: {
        action: `Project assigned to freelancer ${freelancerId}`,
        projectId,
        userId: session.user.id,
      },
    });

    // Fetch writer details
    const writer = await prisma.user.findUnique({
      where: { id: freelancerId },
      select: { id: true, name: true, email: true },
    });

    // Inject system join message
    try {
      await prisma.message.create({
        data: {
          content: `I am your writer ${writer?.name || 'Your Writer'} and assigned in our service.`,
          projectId,
          senderId: freelancerId,
          chatType: 'CLIENT_CHAT',
        },
      });
    } catch (msgErr) {
      console.warn("Could not inject join message:", msgErr);
    }

    const student = project.student;

    // ── Notifications ──
    if (student?.id) {
      await createNotification(prisma, {
        userId: student.id,
        type:   'assignment',
        title:  'Writer assigned!',
        msg:    `A writer has been assigned to your order "${project.title}"`,
        icon:   '✍️',
        link:   `/student/orders/${projectId}`,
      });
    }
    if (writer?.id) {
      await createNotification(prisma, {
        userId: writer.id,
        type:   'new_job',
        title:  'New job assigned',
        msg:    `You have been assigned to "${project.title}". Please review and begin work.`,
        icon:   '🎯',
        link:   `/freelancer/projects/${projectId}`,
      });
    }

    // ── Emails ──
    if (student?.email) {
      await safeSendEmail({
        to:      student.email,
        subject: `✍️ Writer Assigned — ${project.title}`,
        html:    writerAssignedStudentHtml({
          studentName:  student.name || 'Student',
          writerName:   writer?.name || 'Your Writer',
          projectTitle: project.title,
          orderId:      projectId,
          deadline:     project.deadline,
        }),
      });
    }

    if (writer?.email) {
      await safeSendEmail({
        to:      writer.email,
        subject: `🎯 New Project Assigned — ${project.title}`,
        html:    writerAssignedWriterHtml({
          writerName:         writer.name || 'Writer',
          projectTitle:       project.title,
          projectDescription: project.description,
          orderId:            projectId,
          deadline:           project.deadline,
          studentName:        student?.name || 'Client',
        }),
      });
    }

    const result = await prisma.project.findUnique({
      where: { id: projectId },
      include: { freelancer: { select: { id: true, name: true } } },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Assignment error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

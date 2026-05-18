import { NextResponse } from 'next/server';
import { getProjectById, updateProject } from '@/services/projectService';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notify';
import {
  safeSendEmail,
  writerAssignedStudentHtml,
  writerAssignedWriterHtml,
  workStartedHtml,
  draftReadyHtml,
  revisionRequestedHtml,
  orderCompletedHtml,
} from '@/lib/emails';

export async function GET(req, { params }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    if (authUser.role === 'STUDENT' && project.studentId.toString() !== authUser.id.toString()) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error('Project fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const oldProject = await getProjectById(id);
    if (!oldProject) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

    const updated = await updateProject(id, body, authUser.id);
    const updatedProject = updated[0];

    // Fetch related users for emails
    const [student, admins] = await Promise.all([
      prisma.user.findUnique({ where: { id: oldProject.studentId }, select: { id: true, name: true, email: true } }),
      prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true, email: true } }),
    ]);

    const freelancerId = body.freelancerId || updatedProject?.freelancerId || oldProject.freelancerId;
    let writer = null;
    if (freelancerId) {
      writer = await prisma.user.findUnique({ where: { id: freelancerId }, select: { id: true, name: true, email: true } });
    }

    // ── WRITER ASSIGNED ──────────────────────────────────────────
    if (body.freelancerId && oldProject.freelancerId !== body.freelancerId) {
      // Notifications
      await createNotification(prisma, {
        userId: oldProject.studentId,
        type: 'assignment',
        title: 'Writer assigned!',
        msg: `A writer has been assigned to your order "${oldProject.title}"`,
        icon: '✍️',
        link: `/student/orders/${id}`
      });
      await createNotification(prisma, {
        userId: body.freelancerId,
        type: 'new_job',
        title: 'New job assigned',
        msg: `You have been assigned to "${oldProject.title}". Please review and begin work.`,
        icon: '🎯',
        link: `/freelancer/projects/${id}`
      });
      for (const admin of admins) {
        await createNotification(prisma, {
          userId: admin.id,
          type: 'assignment',
          title: 'Writer assigned',
          msg: `Writer assigned to "${oldProject.title}"`,
          icon: '📋',
          link: `/admin/projects/${id}`
        });
      }

      // Emails — student + writer
      const newWriter = await prisma.user.findUnique({
        where: { id: body.freelancerId },
        select: { name: true, email: true }
      });

      if (student?.email) {
        await safeSendEmail({
          to: student.email,
          subject: `✍️ Writer Assigned — ${oldProject.title}`,
          html: writerAssignedStudentHtml({
            studentName:  student.name || 'Student',
            writerName:   newWriter?.name || 'Your Writer',
            projectTitle: oldProject.title,
            orderId:      id,
            deadline:     oldProject.deadline,
          }),
        });
      }

      if (newWriter?.email) {
        await safeSendEmail({
          to: newWriter.email,
          subject: `🎯 New Project Assigned — ${oldProject.title}`,
          html: writerAssignedWriterHtml({
            writerName:         newWriter.name || 'Writer',
            projectTitle:       oldProject.title,
            projectDescription: oldProject.description,
            orderId:            id,
            deadline:           oldProject.deadline,
            studentName:        student?.name || 'Client',
          }),
        });
      }
    }

    // ── STATUS CHANGE ────────────────────────────────────────────
    if (body.status && oldProject.status !== body.status) {
      const statusMap = {
        'IN_PROGRESS': `Your writer has started working on "${oldProject.title}"`,
        'REVIEW':      `Your order is ready for review: "${oldProject.title}"`,
        'REVISION':    `Revision requested on "${oldProject.title}"`,
        'COMPLETED':   `🎉 Your order "${oldProject.title}" is complete!`,
        'CANCELLED':   `Your order "${oldProject.title}" has been cancelled`,
      };

      const statusMsg = statusMap[body.status];

      if (statusMsg) {
        // ── DB Notifications (de-duped — only ONE for COMPLETED) ──
        await createNotification(prisma, {
          userId: oldProject.studentId,
          type:   body.status === 'CANCELLED' ? 'order_cancelled' : 'status',
          title:  body.status === 'COMPLETED' ? '🎉 Order Complete!' : 'Status Updated',
          msg:    statusMsg,
          icon:   body.status === 'CANCELLED' ? '❌' : body.status === 'COMPLETED' ? '🎉' : '📋',
          link:   `/student/orders/${id}`,
        });

        if (writer && body.status !== 'CANCELLED') {
          await createNotification(prisma, {
            userId: writer.id,
            type:   'status',
            title:  'Status Updated',
            msg:    `Order "${oldProject.title}" status changed to ${body.status}`,
            icon:   '📋',
            link:   `/freelancer/projects/${id}`,
          });
        }

        if (body.status === 'REVISION' && writer) {
          await createNotification(prisma, {
            userId: writer.id,
            type:   'revision',
            title:  'Revision Requested',
            msg:    `Revision requested on "${oldProject.title}"`,
            icon:   '🔄',
            link:   `/freelancer/projects/${id}`,
          });
        }

        for (const admin of admins) {
          await createNotification(prisma, {
            userId: admin.id,
            type:   'status',
            title:  `Status: ${body.status}`,
            msg:    `Order "${oldProject.title}" is now ${body.status}`,
            icon:   '📋',
            link:   `/admin/projects/${id}`,
          });
        }

        // ── EMAILS per status ─────────────────────────────────────

        if (body.status === 'IN_PROGRESS' && student?.email) {
          await safeSendEmail({
            to:      student.email,
            subject: `🚀 Work Started — ${oldProject.title}`,
            html:    workStartedHtml({
              studentName:  student.name || 'Student',
              writerName:   writer?.name || 'Your Writer',
              projectTitle: oldProject.title,
              orderId:      id,
              deadline:     oldProject.deadline,
            }),
          });
        }

        if (body.status === 'REVIEW' && student?.email) {
          await safeSendEmail({
            to:      student.email,
            subject: `📄 Draft Ready for Review — ${oldProject.title}`,
            html:    draftReadyHtml({
              studentName:  student.name || 'Student',
              writerName:   writer?.name || 'Your Writer',
              projectTitle: oldProject.title,
              orderId:      id,
            }),
          });
        }

        if (body.status === 'REVISION' && writer?.email) {
          await safeSendEmail({
            to:      writer.email,
            subject: `🔄 Revision Requested — ${oldProject.title}`,
            html:    revisionRequestedHtml({
              writerName:   writer.name || 'Writer',
              studentName:  student?.name || 'Client',
              projectTitle: oldProject.title,
              orderId:      id,
              deadline:     oldProject.deadline,
            }),
          });
        }

        // COMPLETED — send ONE email to student only
        if (body.status === 'COMPLETED' && student?.email) {
          await safeSendEmail({
            to:      student.email,
            subject: `🎉 Order Complete — ${oldProject.title}`,
            html:    orderCompletedHtml({
              studentName:  student.name || 'Student',
              writerName:   writer?.name || 'Your Writer',
              projectTitle: oldProject.title,
              orderId:      id,
            }),
          });
        }
      }
    }

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error) {
    console.error('Project update error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

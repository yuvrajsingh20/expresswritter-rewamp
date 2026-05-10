import { NextResponse } from 'next/server';
import { getProjectById, updateProject } from '@/services/projectService';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notify';

export async function GET(req, { params }) {
  try {
    const authUser = await getAuthUser();
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
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const oldProject = await getProjectById(id);
    if (!oldProject) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

    const updated = await updateProject(id, body, authUser.id);
    const updatedProject = updated[0];

    // Notification Logic
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });

    // Writer Assigned
    if (body.freelancerId && oldProject.freelancerId !== body.freelancerId) {
      // Notify Student
      await createNotification(prisma, {
        userId: oldProject.studentId,
        type: 'assignment',
        title: 'Writer assigned!',
        msg: `A writer has been assigned to your order "${oldProject.title}"`,
        icon: '✍️',
        link: `/student/orders/${id}`
      });
      // Notify Freelancer
      await createNotification(prisma, {
        userId: body.freelancerId,
        type: 'new_job',
        title: 'New job assigned',
        msg: `You have been assigned to "${oldProject.title}". Please review and begin work.`,
        icon: '🎯',
        link: `/freelancer/orders/${id}`
      });
      // Notify Admins
      for (const admin of admins) {
        await createNotification(prisma, {
          userId: admin.id,
          type: 'assignment',
          title: 'Writer assigned',
          msg: `Writer assigned to "${oldProject.title}"`,
          icon: '📋',
          link: `/admin/orders/${id}`
        });
      }
    }

    // Status Change
    if (body.status && oldProject.status !== body.status) {
      const statusMap = {
        'IN_PROGRESS': `Your writer has started working on "${oldProject.title}"`,
        'REVIEW': `Your order is ready for review: "${oldProject.title}"`,
        'REVISION': `Revision requested on "${oldProject.title}"`,
        'COMPLETED': `🎉 Your order "${oldProject.title}" is complete!`
      };

      const statusMsg = statusMap[body.status];
      if (statusMsg) {
        // Notify Student
        await createNotification(prisma, {
          userId: oldProject.studentId,
          type: 'status',
          title: 'Status Updated',
          msg: statusMsg,
          icon: '📋',
          link: `/student/orders/${id}`
        });

        // Notify Admins
        for (const admin of admins) {
          await createNotification(prisma, {
            userId: admin.id,
            type: 'status',
            title: `Status: ${body.status}`,
            msg: `Order "${oldProject.title}" is now ${body.status}`,
            icon: '📋',
            link: `/admin/orders/${id}`
          });
        }

        // Notify Freelancer if REVISION
        if (body.status === 'REVISION' && updatedProject.freelancerId) {
          await createNotification(prisma, {
            userId: updatedProject.freelancerId,
            type: 'revision',
            title: 'Revision Requested',
            msg: `Revision requested on "${oldProject.title}"`,
            icon: '🔄',
            link: `/freelancer/orders/${id}`
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


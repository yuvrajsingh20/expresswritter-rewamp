import { NextResponse } from 'next/server';
import { createProject, getProjectsByUser } from '@/services/projectService';
import { getAuthUser } from '@/lib/auth';

/**
 * Core Project and Task Management API with Built-in Role Filtering.
 */
export async function POST(req) {
  try {
    const authUser = await getAuthUser();
    // Only Student can create, or Admin/SubAdmin on behalf of a student.
    if (!authUser || !['STUDENT', 'ADMIN', 'SUB_ADMIN'].includes(authUser.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Persist to PostgreSQL via Project Service
    const project = await createProject({
      ...data,
      studentId: data.studentId || authUser.id, // Direct order or Admin-created
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Project creation failure:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const projects = await getProjectsByUser(authUser.id, authUser.role);

    try {
      const { createNotification } = require('@/lib/notify');
      const prisma = require('@/lib/prisma').default || require('@/lib/prisma');
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      for (const project of projects) {
        if (project.deadline && project.status !== 'COMPLETED' && project.status !== 'DELIVERED') {
          const deadline = new Date(project.deadline);
          if (deadline > now && deadline <= tomorrow) {
            // Check if a deadline notification already exists for this project for this user
            const existing = await prisma.notification.findFirst({
              where: {
                userId: authUser.id,
                message: { contains: `"type":"deadline"` }
              }
            });
            
            // We need a better way to check if THIS specific project's deadline was notified.
            // But since Prisma can't easily query JSON fields, we'll fetch and filter
            const notifications = await prisma.notification.findMany({
              where: { userId: authUser.id },
              orderBy: { createdAt: 'desc' },
              take: 20
            });
            const alreadyNotified = notifications.some(n => {
              try {
                const p = JSON.parse(n.message);
                return p.type === 'deadline' && p.link && p.link.includes(project.id);
              } catch (e) { return false; }
            });

            if (!alreadyNotified) {
              await createNotification(prisma, {
                userId: authUser.id,
                type: 'deadline',
                title: 'Deadline approaching',
                msg: `Order "${project.title}" is due in less than 24 hours`,
                icon: '⏰',
                link: `/${authUser.role.toLowerCase()}/orders/${project.id}`
              });
            }
          }
        }
      }
    } catch (deadlineErr) {
      console.error("Deadline check error:", deadlineErr);
    }

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('Project retrieval failure:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

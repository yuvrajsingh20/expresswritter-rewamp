import prisma from '@/lib/prisma';
import { notificationQueue } from '@/lib/queues';

/**
 * Create a new project in the PostgreSQL database using Prisma
 */
export const createProject = async (data) => {
  const project = await prisma.project.create({
    data: {
      title: data.title,
      description: data.description,
      deadline: data.deadline ? new Date(data.deadline) : null,
      studentId: data.studentId,
      serviceType: data.serviceType,
      amount: data.amount ? parseFloat(data.amount) : 0,
      attachments: data.attachments || [],
      status: data.status || 'CREATED',
    },
  });

  // Automated Background Job: Notify student of project creation (Non-blocking)
  try {
    await notificationQueue.add('project_created', {
      projectId: project.id,
      userId: project.studentId,
      type: 'EMAIL_CONFIRMATION',
    });
  } catch (error) {
    console.warn('Notification queue error (ignored):', error);
  }

  try {
    const { createNotification } = require('@/lib/notify');
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    const student = await prisma.user.findUnique({ where: { id: data.studentId } });
    
    for (const admin of admins) {
      await createNotification(prisma, {
        userId: admin.id,
        type: 'new_order',
        title: 'New order received',
        msg: `${student?.name || 'A student'} placed a new order: ${project.title}`,
        icon: '📥',
        link: `/admin/orders/${project.id}`
      });
    }
  } catch (err) {
    console.error('Failed to notify admins of new order', err);
  }

  return project;
};

/**
 * Retrieve projects filtered by user role and ID
 */
export const getProjectsByUser = async (userId, role) => {
  const whereClause = {
    STUDENT: { studentId: userId },
    FREELANCER: { 
      OR: [
        { freelancerId: userId },
        { collaboratorIds: { has: userId } }
      ]
    },
    SUB_ADMIN: { subAdminId: userId },
    ADMIN: {}, // Admins see everything
  }[role] || {};

  return await prisma.project.findMany({
    where: whereClause,
    include: {
      freelancer: { select: { id: true, name: true, role: true, email: true } },
      collaborators: { select: { id: true, name: true, role: true, email: true } },
      subAdmin: { select: { name: true, role: true, email: true } },
      student: { select: { id: true, name: true, role: true, email: true } },
      orders: { select: { paymentStatus: true } },
      logs: { orderBy: { timestamp: 'desc' }, take: 5 },
      messages: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Update project status and log the action
 */
export const updateProjectStatus = async (projectId, status, userId) => {
  return await prisma.$transaction([
    prisma.project.update({
      where: { id: projectId },
      data: { status },
    }),
    prisma.projectLog.create({
      data: {
        action: `Status transitioned to ${status}`,
        projectId: projectId,
        userId: userId,
      },
    }),
  ]);
};

/**
 * Generic update for project fields (attachments, description, etc)
 */
export const updateProject = async (projectId, data, userId) => {
    return await prisma.$transaction([
      prisma.project.update({
        where: { id: projectId },
        data: data,
      }),
      prisma.projectLog.create({
        data: {
          action: `Project fields updated: ${Object.keys(data).join(', ')}`,
          projectId: projectId,
          userId: userId,
        },
      }),
    ]);
};

/**
 * Retrieve a single project by ID with relations
 */
export const getProjectById = async (projectId) => {
  return await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      freelancer: { select: { id: true, name: true, role: true, email: true } },
      collaborators: { select: { id: true, name: true, role: true, email: true } },
      subAdmin: { select: { name: true, role: true, email: true } },
      student: { select: { name: true, role: true, email: true } },
      logs: { orderBy: { timestamp: 'desc' }, take: 5 },
    },
  });
};

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
      deadline: data.deadline,
      studentId: data.studentId,
      serviceType: data.serviceType,
      attachments: data.attachments || [],
      status: data.status || 'CREATED',
    },
  });

  // Automated Background Job: Notify student of project creation
  await notificationQueue.add('project_created', {
    projectId: project.id,
    userId: project.studentId,
    type: 'EMAIL_CONFIRMATION',
  });

  return project;
};

/**
 * Retrieve projects filtered by user role and ID
 */
export const getProjectsByUser = async (userId, role) => {
  const whereClause = {
    STUDENT: { studentId: userId },
    FREELANCER: { freelancerId: userId },
    SUB_ADMIN: { subAdminId: userId },
    ADMIN: {}, // Admins see everything
  }[role] || {};

  return await prisma.project.findMany({
    where: whereClause,
    include: {
      freelancer: { select: { name: true, role: true, email: true } },
      subAdmin: { select: { name: true, role: true, email: true } },
      student: { select: { name: true, role: true, email: true } },
      logs: { orderBy: { timestamp: 'desc' }, take: 5 },
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
      freelancer: { select: { name: true, role: true, email: true } },
      subAdmin: { select: { name: true, role: true, email: true } },
      student: { select: { name: true, role: true, email: true } },
      logs: { orderBy: { timestamp: 'desc' }, take: 5 },
    },
  });
};


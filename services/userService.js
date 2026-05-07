import { prisma } from '@/lib/prisma';

export async function getAllUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      permissions: true,
    }
  });
}

export async function updateUserRole(userId, role) {
  return await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
}

export async function updateUserPermissions(userId, permissions) {
  return await prisma.user.update({
    where: { id: userId },
    data: { permissions }
  });
}

export async function deleteUser(userId) {
  return await prisma.user.delete({
    where: { id: userId }
  });
}

export async function getUserById(userId) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      freelancerProfile: true,
    }
  });
}

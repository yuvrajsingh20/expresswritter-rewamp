import prisma from '@/lib/prisma';

/**
 * Persist a chat message to the database
 */
export const sendMessage = async (data) => {
  return await prisma.message.create({
    data: {
      content: data.content,
      chatType: data.chatType, // Must be CLIENT_CHAT, INTERNAL_CHAT, or ADMIN_CHAT
      senderId: data.senderId,
      projectId: data.projectId,
      attachments: data.attachments || [],
      isSystem: data.isSystem || false,
    },
  });
};

/**
 * Retrieve messages for a specific project and chat channel
 */
export const getMessagesByProject = async (projectId, chatType) => {
  return await prisma.message.findMany({
    where: { projectId, chatType },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { name: true, role: true } },
    },
  });
};

/**
 * Return available chat channels based on the user role
 */
export const getAvailableChannels = (userRole) => {
  const channels = ['CLIENT_CHAT'];
  
  if (['ADMIN', 'SUB_ADMIN', 'FREELANCER'].includes(userRole)) {
    channels.push('INTERNAL_CHAT');
  }
  
  if (userRole === 'ADMIN') {
    channels.push('ADMIN_CHAT');
  }
  
  return channels;
};

// lib/notifications/engine.js
// The processor that handles all notification events

import prisma from '@/lib/prisma';
import NOTIFICATION_REGISTRY from './registry';

export async function emitNotificationEvent(eventName, context = {}) {
  const config = NOTIFICATION_REGISTRY[eventName];
  
  if (!config) {
    console.error(`[NotificationEngine] Unknown event: ${eventName}`);
    return null;
  }

  try {
    // Enrich context with admin IDs (almost every event needs them)
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    
    const enrichedCtx = { 
      ...context, 
      adminIds: admins.map(a => a.id),
      timestamp: new Date()
    };

    // Compute recipients
    const recipientIds = [...new Set(config.recipients(enrichedCtx))].filter(Boolean);

    // Create notifications for each recipient
    const notifications = await Promise.all(
      recipientIds.map(async (userId) => {
        // Look up recipient's role for template selection
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        const template = config.templates[user?.role] || config.templates._default || config.templates.STUDENT;
        if (!template) {
          console.warn(`[NotificationEngine] No template for role: ${user?.role}, event: ${eventName}`);
          return null;
        }

        // Resolve template values
        const title = typeof template.title === 'function' ? template.title(enrichedCtx) : template.title;
        const msg = typeof template.msg === 'function' ? template.msg(enrichedCtx) : template.msg;

        // Store notification with new structured fields
        const notification = await prisma.notification.create({
          data: {
            userId,
            type: eventName,
            category: config.category,
            title,
            message: msg,  // Plain string instead of JSON
            icon: template.icon,
            entityType: config.entity?.type || null,
            entityId: config.entity ? enrichedCtx[config.entity.idKey] || null : null,
            read: false,
          },
        });

        return notification;
      })
    );

    // Broadcast via Socket.IO (batch)
    const validNotifications = notifications.filter(Boolean);
    if (validNotifications.length > 0 && process.env.NEXT_PUBLIC_SOCKET_URL) {
      await Promise.all(
        recipientIds.map(userId =>
          fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              type: eventName,
              category: config.category,
            }),
          }).catch(err => console.error('[NotificationEngine] Socket error:', err))
        )
      );
    }

    console.log(`[NotificationEngine] ${eventName}: ${validNotifications.length} notifications created`);
    return validNotifications;

  } catch (error) {
    console.error(`[NotificationEngine] Error processing ${eventName}:`, error);
    return null;
  }
}

// Backwards compatibility - wraps old createNotification interface
export async function createNotification(prismaInstance, { userId, type, title, msg, icon, link }) {
  console.warn('[NotificationEngine] Using legacy createNotification - should migrate to emitNotificationEvent');
  
  // Map legacy types to events
  const eventMap = {
    'new_order': 'ORDER_PLACED',
    'assignment': 'WRITER_ASSIGNED',
    'new_job': 'WRITER_ASSIGNED',
    'status': 'STATUS_CHANGED',
    'order_cancelled': 'STATUS_CHANGED',
    'revision': 'STATUS_CHANGED',
    'message': 'NEW_MESSAGE',
    'payment_received': 'PAYMENT_RECEIVED',
    'payment_confirmed': 'PAYMENT_RECEIVED',
    'payout': 'PAYOUT_REQUESTED',
    'ticket': 'TICKET_CREATED',
    'system': 'SYSTEM_NOTIFICATION',
  };
  
  const eventName = eventMap[type] || type;
  
  // If we have a direct userId, emit single notification
  if (userId) {
    const user = await prismaInstance.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    
    return prismaInstance.notification.create({
      data: {
        userId,
        type: eventName,
        category: getCategoryFromType(type),
        title,
        message: msg,
        icon: icon || '🔔',
        read: false,
      },
    });
  }
  
  return null;
}

function getCategoryFromType(type) {
  const categoryMap = {
    'new_order': 'orders',
    'assignment': 'orders',
    'new_job': 'orders',
    'status': 'orders',
    'order_cancelled': 'orders',
    'revision': 'orders',
    'message': 'messages',
    'payment_received': 'payments',
    'payment_confirmed': 'payments',
    'payout': 'payments',
    'ticket': 'support',
    'system': 'system',
  };
  return categoryMap[type] || 'system';
}

export default { emitNotificationEvent, createNotification };
// lib/notifications/registry.js
// Single source of truth for all notification events

export const NOTIFICATION_REGISTRY = {
  // ═══════════════════════════════════════
  //  ORDER LIFECYCLE
  // ═══════════════════════════════════════

  ORDER_PLACED: {
    category: 'orders',
    recipients: (ctx) => [...ctx.adminIds],
    templates: {
      ADMIN: {
        icon: '📥',
        title: 'New order received',
        msg: (ctx) => `${ctx.studentName || 'A student'} placed a new order: "${ctx.projectTitle}"`,
      },
    },
    entity: { type: 'order', idKey: 'projectId' },
  },

  WRITER_ASSIGNED: {
    category: 'orders',
    recipients: (ctx) => {
      const list = [ctx.studentId, ...ctx.adminIds];
      if (ctx.freelancerId) list.push(ctx.freelancerId);
      return list;
    },
    templates: {
      STUDENT: {
        icon: '✍️',
        title: 'Writer assigned!',
        msg: (ctx) => `A writer has been assigned to your order "${ctx.projectTitle}"`,
      },
      FREELANCER: {
        icon: '🎯',
        title: 'New job assigned',
        msg: (ctx) => `You have been assigned to "${ctx.projectTitle}". Please review and begin work.`,
      },
      ADMIN: {
        icon: '📋',
        title: 'Writer assigned',
        msg: (ctx) => `${ctx.freelancerName || 'A writer'} assigned to "${ctx.projectTitle}"`,
      },
    },
    entity: { type: 'order', idKey: 'projectId' },
  },

  STATUS_CHANGED: {
    category: 'orders',
    recipients: (ctx) => {
      const list = [ctx.studentId, ...ctx.adminIds];
      if (ctx.newStatus === 'REVISION' && ctx.freelancerId) {
        list.push(ctx.freelancerId);
      }
      return list;
    },
    templates: {
      STUDENT: {
        icon: '📋',
        title: 'Order status updated',
        msg: (ctx) => {
          const statusMessages = {
            IN_PROGRESS: `Your writer has started working on "${ctx.projectTitle}"`,
            REVIEW: `Your order is ready for review: "${ctx.projectTitle}"`,
            REVISION: `Revision requested on "${ctx.projectTitle}"`,
            COMPLETED: `🎉 Your order "${ctx.projectTitle}" is complete!`,
            CANCELLED: `Your order "${ctx.projectTitle}" has been cancelled`,
          };
          return statusMessages[ctx.newStatus] || `Order "${ctx.projectTitle}" is now ${ctx.newStatus}`;
        },
      },
      FREELANCER: {
        icon: '🔄',
        title: 'Revision requested',
        msg: (ctx) => `Revision requested on "${ctx.projectTitle}"`,
      },
      ADMIN: {
        icon: '📋',
        title: (ctx) => `Status: ${ctx.newStatus}`,
        msg: (ctx) => `Order "${ctx.projectTitle}" → ${ctx.newStatus}`,
      },
    },
    entity: { type: 'order', idKey: 'projectId' },
  },

  // ═══════════════════════════════════════
  //  MESSAGES
  // ═══════════════════════════════════════

  NEW_MESSAGE: {
    category: 'messages',
    recipients: (ctx) => [ctx.receiverId].filter(Boolean),
    templates: {
      STUDENT: {
        icon: '💬',
        title: 'New message',
        msg: (ctx) => `${ctx.senderName || 'Someone'} sent you a message`,
      },
      FREELANCER: {
        icon: '💬',
        title: 'New message',
        msg: (ctx) => `${ctx.senderName || 'Someone'} sent you a message`,
      },
      ADMIN: {
        icon: '💬',
        title: 'New message',
        msg: (ctx) => `${ctx.senderName} sent a message in "${ctx.projectTitle}"`,
      },
    },
    entity: { type: 'order', idKey: 'projectId' },
  },

  // ═══════════════════════════════════════
  //  PAYMENTS
  // ═══════════════════════════════════════

  PAYMENT_RECEIVED: {
    category: 'payments',
    recipients: (ctx) => [ctx.studentId, ...ctx.adminIds],
    templates: {
      STUDENT: {
        icon: '✅',
        title: 'Payment Successful!',
        msg: (ctx) => `Your payment for "${ctx.projectTitle}" has been received. We'll assign a writer soon!`,
      },
      ADMIN: {
        icon: '💳',
        title: 'Payment Received',
        msg: (ctx) => `Payment received for "${ctx.projectTitle}" - Ready for writer assignment`,
      },
    },
    entity: { type: 'order', idKey: 'projectId' },
  },

  PAYOUT_REQUESTED: {
    category: 'payments',
    recipients: (ctx) => [...ctx.adminIds],
    templates: {
      ADMIN: {
        icon: '💰',
        title: 'Payout request',
        msg: (ctx) => `${ctx.freelancerName || 'A freelancer'} requested a payout of ₹${ctx.amount}`,
      },
    },
    entity: { type: 'payout', idKey: 'payoutId' },
  },

  PAYOUT_APPROVED: {
    category: 'payments',
    recipients: (ctx) => [ctx.freelancerId].filter(Boolean),
    templates: {
      FREELANCER: {
        icon: '✅',
        title: 'Payout approved!',
        msg: (ctx) => `Your payout of ₹${ctx.amount} has been approved and will be processed soon.`,
      },
    },
    entity: { type: 'payout', idKey: 'payoutId' },
  },

  PAYOUT_REJECTED: {
    category: 'payments',
    recipients: (ctx) => [ctx.freelancerId].filter(Boolean),
    templates: {
      FREELANCER: {
        icon: '❌',
        title: 'Payout rejected',
        msg: (ctx) => `Your payout request of ₹${ctx.amount} was rejected. Please contact support.`,
      },
    },
    entity: { type: 'payout', idKey: 'payoutId' },
  },

  // ═══════════════════════════════════════
  //  SUPPORT
  // ═══════════════════════════════════════

  TICKET_CREATED: {
    category: 'support',
    recipients: (ctx) => [...ctx.adminIds],
    templates: {
      ADMIN: {
        icon: '🎫',
        title: 'New support ticket',
        msg: (ctx) => `New ticket: "${ctx.subject}" — Priority: ${ctx.priority}`,
      },
    },
    entity: { type: 'ticket', idKey: 'ticketId' },
  },

  TICKET_REPLIED: {
    category: 'support',
    recipients: (ctx) => [ctx.ticketCreatorId].filter(Boolean),
    templates: {
      STUDENT: {
        icon: '💬',
        title: 'Ticket reply',
        msg: (ctx) => `Your ticket "${ctx.subject}" has a new reply`,
      },
      FREELANCER: {
        icon: '💬',
        title: 'Ticket reply',
        msg: (ctx) => `Your ticket "${ctx.subject}" has a new reply`,
      },
    },
    entity: { type: 'ticket', idKey: 'ticketId' },
  },

  // ═══════════════════════════════════════
  //  SYSTEM
  // ═══════════════════════════════════════

  SYSTEM_NOTIFICATION: {
    category: 'system',
    recipients: (ctx) => ctx.adminIds,
    templates: {
      ADMIN: {
        icon: '⚙️',
        title: (ctx) => ctx.title || 'System Alert',
        msg: (ctx) => ctx.msg || 'System notification',
      },
    },
    entity: null,
  },
};

export default NOTIFICATION_REGISTRY;